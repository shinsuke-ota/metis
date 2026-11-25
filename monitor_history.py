"""Physical-channel samples and optional local SQLite history."""
import logging
import math
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from urllib.parse import quote

LOG = logging.getLogger(__name__)

SCHEMA = """
CREATE TABLE IF NOT EXISTS monitor_series (
    series_id INTEGER PRIMARY KEY,
    namespace TEXT NOT NULL,
    source_key TEXT NOT NULL,
    metric TEXT NOT NULL,
    unit TEXT NOT NULL,
    UNIQUE (namespace, source_key, metric)
);
CREATE TABLE IF NOT EXISTS monitor_history (
    acquired_at TEXT NOT NULL,
    series_id INTEGER NOT NULL REFERENCES monitor_series,
    value REAL NOT NULL,
    PRIMARY KEY (series_id, acquired_at)
);
CREATE TABLE IF NOT EXISTS experiment_channel_map (
    experiment_id TEXT NOT NULL,
    logical_channel TEXT NOT NULL,
    namespace TEXT NOT NULL,
    source_key TEXT NOT NULL,
    valid_from TEXT NOT NULL,
    valid_until TEXT,
    CHECK (valid_until IS NULL OR valid_until > valid_from),
    PRIMARY KEY (experiment_id, logical_channel, valid_from)
);
"""


def timestamp(value=None):
    """Normalize a device UTC epoch value or fall back to the node clock."""
    try:
        if isinstance(value, (str, int, float)) and not isinstance(value, bool):
            return datetime.fromtimestamp(float(value), timezone.utc).isoformat(timespec="microseconds"), "device"
    except (ValueError, OverflowError, OSError):
        pass
    return datetime.now(timezone.utc).isoformat(timespec="microseconds"), "node"


def join_source_key(*parts):
    return "/".join(quote(part, safe="") for part in parts)


def sample_identity(sample):
    source = sample.get("source_key")
    if "source_key" not in sample:
        # Accept samples from nodes still running the previous wire format.
        parts = sample["serial_number"], sample["channel_number"]
        if not all(isinstance(part, str) and part for part in parts):
            raise KeyError("source_key")
        source = join_source_key(*parts)
    return sample["namespace"], source, sample["metric"]


def initialize_schema(db):
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("BEGIN IMMEDIATE")
    columns = {row[1] for row in db.execute("PRAGMA table_info(monitor_series)")}
    legacy = "serial_number" in columns
    if legacy:
        for table in ("monitor_history", "monitor_series", "experiment_channel_map"):
            db.execute(f"ALTER TABLE {table} RENAME TO {table}_legacy")
    for statement in SCHEMA.split(";"):
        if statement.strip():
            db.execute(statement)
    if legacy:
        db.create_function("legacy_source_key", 2, join_source_key, deterministic=True)
        try:
            db.execute("""INSERT INTO monitor_series (series_id, namespace, source_key, metric, unit)
                SELECT series_id, namespace, legacy_source_key(serial_number, channel_number), metric, unit
                FROM monitor_series_legacy""")
        except sqlite3.IntegrityError as error:
            raise sqlite3.IntegrityError(
                "旧データベースに単位の異なる同一系列があります。移行は取り消されました。"
            ) from error
        db.execute("""INSERT INTO monitor_history (acquired_at, series_id, value)
            SELECT acquired_at, series_id, value FROM monitor_history_legacy""")
        db.execute("""INSERT INTO experiment_channel_map
                (experiment_id, logical_channel, namespace, source_key, valid_from, valid_until)
            SELECT experiment_id, logical_channel, namespace,
                legacy_source_key(serial_number, channel_number), valid_from, valid_until
            FROM experiment_channel_map_legacy""")
        for table in ("monitor_history", "monitor_series", "experiment_channel_map"):
            db.execute(f"DROP TABLE {table}_legacy")


class SQLiteMonitorHistory:
    def __init__(self, path):
        self.path = path
        with closing(sqlite3.connect(path)) as db, db:
            initialize_schema(db)

    def append(self, samples):
        if not isinstance(samples, list) or not samples:
            return
        try:
            with closing(sqlite3.connect(self.path, timeout=2)) as db, db:
                db.execute("PRAGMA foreign_keys = ON")
                for sample in samples:
                    if not isinstance(sample, dict):
                        continue
                    try:
                        identity = sample_identity(sample)
                        if not all(isinstance(part, str) and part for part in identity):
                            continue
                        unit = sample["unit"]
                        if not isinstance(unit, str):
                            continue
                        value = sample["value"]
                        if type(value) not in (float, int) or not math.isfinite(value):
                            continue
                        acquired = datetime.fromisoformat(sample["acquired_at"])
                        if acquired.tzinfo is None:
                            continue
                        acquired_at = acquired.astimezone(timezone.utc).isoformat(timespec="microseconds")
                    except (KeyError, TypeError, ValueError, OverflowError):
                        continue
                    db.execute("""INSERT INTO monitor_series (namespace, source_key, metric, unit)
                        VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING""", (*identity, unit))
                    series_id, registered_unit = db.execute("""SELECT series_id, unit FROM monitor_series
                        WHERE namespace=? AND source_key=? AND metric=?""", identity).fetchone()
                    if registered_unit != unit:
                        LOG.warning("Monitor series %r uses %r, refusing incompatible sample unit %r",
                                    identity, registered_unit, unit)
                        continue
                    db.execute("""INSERT INTO monitor_history (acquired_at, series_id, value)
                        VALUES (?, ?, ?) ON CONFLICT DO NOTHING""", (acquired_at, series_id, value))
        except sqlite3.Error:
            LOG.exception("Could not save monitor samples to %s", self.path)

    def mappings(self):
        with closing(sqlite3.connect(self.path)) as db:
            db.row_factory = sqlite3.Row
            sources = db.execute("SELECT DISTINCT namespace, source_key FROM monitor_series ORDER BY 1, 2")
            result = {"sources": [dict(row) for row in sources]}
            mappings = db.execute("SELECT * FROM experiment_channel_map ORDER BY experiment_id, logical_channel, valid_from")
            result["mappings"] = [dict(row) for row in mappings]
            return result

    def assign_channel(self, experiment, logical, namespace, source, starts_at):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            if not db.execute("SELECT 1 FROM monitor_series WHERE namespace=? AND source_key=?",
                              (namespace, source)).fetchone():
                raise ValueError("履歴 DB に登録済みの測定元を指定してください")
            previous = db.execute("""SELECT valid_from, valid_until FROM experiment_channel_map
                WHERE experiment_id=? AND logical_channel=? ORDER BY valid_from DESC LIMIT 1""",
                (experiment, logical)).fetchone()
            if previous:
                old_start, old_end = previous
                if starts_at <= old_start or (old_end is not None and starts_at < old_end):
                    raise ValueError("開始日時は既存の割り当て期間と重ならない日時にしてください")
                if old_end is None:
                    db.execute("""UPDATE experiment_channel_map SET valid_until=?
                        WHERE experiment_id=? AND logical_channel=? AND valid_from=?""",
                        (starts_at, experiment, logical, old_start))
            db.execute("""INSERT INTO experiment_channel_map
                (experiment_id, logical_channel, namespace, source_key, valid_from, valid_until)
                VALUES (?, ?, ?, ?, ?, NULL)""", (experiment, logical, namespace, source, starts_at))

"""Physical-channel samples and optional local SQLite history."""
import logging
import math
import sqlite3
from contextlib import closing
from datetime import datetime, timezone

LOG = logging.getLogger(__name__)

SCHEMA = """
CREATE TABLE IF NOT EXISTS monitor_series (
    series_id INTEGER PRIMARY KEY,
    namespace TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    channel_number TEXT NOT NULL,
    metric TEXT NOT NULL,
    unit TEXT NOT NULL,
    UNIQUE (namespace, serial_number, channel_number, metric, unit)
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
    serial_number TEXT NOT NULL,
    channel_number TEXT NOT NULL,
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


def sample_identity(sample):
    return tuple(sample[key] for key in ("namespace", "serial_number", "channel_number", "metric", "unit"))


class SQLiteMonitorHistory:
    def __init__(self, path):
        self.path = path
        with closing(sqlite3.connect(path)) as db:
            db.executescript(SCHEMA)

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
                        value = sample["value"]
                        if type(value) not in (float, int) or not math.isfinite(value):
                            continue
                        acquired = datetime.fromisoformat(sample["acquired_at"])
                        if acquired.tzinfo is None:
                            continue
                        acquired_at = acquired.astimezone(timezone.utc).isoformat(timespec="microseconds")
                    except (KeyError, TypeError, ValueError, OverflowError):
                        continue
                    db.execute("""INSERT INTO monitor_series
                        (namespace, serial_number, channel_number, metric, unit)
                        VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""", identity)
                    db.execute("""INSERT INTO monitor_history (acquired_at, series_id, value)
                        SELECT ?, series_id, ? FROM monitor_series
                        WHERE namespace=? AND serial_number=? AND channel_number=? AND metric=? AND unit=?
                        ON CONFLICT DO NOTHING""", (acquired_at, value, *identity))
        except sqlite3.Error:
            LOG.exception("Could not save monitor samples to %s", self.path)

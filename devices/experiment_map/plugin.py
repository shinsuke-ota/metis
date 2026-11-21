"""Manage effective-dated assignments in the local monitor history database."""
import asyncio
import sqlite3
from datetime import datetime, timezone

from devices.base import BaseDevice


class ExperimentMapDevice(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.history = lambda: None

    def bind_monitor_history(self, provider):
        self.history = provider

    def monitors(self):
        return {}

    async def operate(self, name, parameters):
        history = self.history()
        if history is None:
            raise ValueError("このノードの設定画面で監視履歴の SQLite ファイルを指定してください")
        try:
            if name == "list":
                return await asyncio.to_thread(history.mappings)
            if name != "assign":
                raise ValueError("未対応の操作です")
            fields = []
            for key in ("experiment_id", "logical_channel", "namespace", "source_key", "valid_from"):
                value = parameters.get(key)
                if not isinstance(value, str) or not value.strip():
                    raise ValueError(f"{key} を入力してください")
                fields.append(value.strip())
            starts_at = datetime.fromisoformat(fields[-1])
            if starts_at.tzinfo is None:
                raise ValueError("開始日時にはタイムゾーンが必要です")
            fields[-1] = starts_at.astimezone(timezone.utc).isoformat(timespec="microseconds")
            await asyncio.to_thread(history.assign_channel, *fields)
            return await asyncio.to_thread(history.mappings)
        except sqlite3.Error as error:
            raise ConnectionError("監視履歴の SQLite を読み書きできません") from error


def create_device():
    return ExperimentMapDevice()


create_device.management_plugin = True

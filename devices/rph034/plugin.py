"""Four-channel RPH-034 control and monitoring."""
import asyncio
from ipaddress import IPv4Address

from devices.base import BaseDevice, DeviceStatus
from .rbcp import read_channels, zero_channel


class RPH034Device(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.labels = [""] * 4
        self.host = ""
        self.port = 4660
        self.readings = []
        self.error = ""
        self.task = None
        self.lock = asyncio.Lock()

    def settings(self):
        return {"labels": self.labels, "host": self.host, "port": self.port}

    def restore_settings(self, settings):
        self.labels = settings.get("labels", self.labels)
        self.host = settings.get("host", self.host)
        self.port = settings.get("port", self.port)

    def tick(self):
        if self.host and (self.task is None or self.task.done()):
            self.task = asyncio.create_task(self.poll())

    async def close(self):
        if self.task is not None:
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)

    async def poll(self):
        async with self.lock:
            try:
                self.readings = await asyncio.to_thread(read_channels, self.host, self.port)
                self.error = ""
            except OSError as exc:
                self.readings = []
                self.error = f"RBCP 読み出し失敗: {exc}"

    async def operate(self, name, parameters):
        if name == "configure":
            host, port = parameters.get("host"), parameters.get("port")
            if not isinstance(host, str) or type(port) is not int or not 1 <= port <= 65535:
                raise ValueError("IPv4 アドレスと 1〜65535 の UDP ポートを指定してください")
            host = host.strip()
            if host:
                host = str(IPv4Address(host))
            async with self.lock:
                self.host, self.port = host, port
                self.readings, self.error = [], ""
            return self.settings()

        if name not in ("set_label", "off"):
            raise ValueError("Unsupported RPH-034 operation")
        channel = parameters.get("channel")
        if type(channel) is not int or not 1 <= channel <= 4:
            raise ValueError("チャンネルは 1〜4 で指定してください")
        if name == "off":
            async with self.lock:
                if not self.host:
                    raise ValueError("先に RBCP 接続先を設定してください")
                try:
                    await asyncio.to_thread(zero_channel, self.host, self.port, channel)
                except OSError as exc:
                    self.readings = []
                    raise ConnectionError(f"設定電圧ゼロを確認できません: {exc}") from exc
                if self.readings:
                    self.readings[channel - 1]["set_voltage"] = 0
            return {"set_voltage": 0}

        label = parameters.get("label")
        if not isinstance(label, str) or len(label) > 100:
            raise ValueError("表示名は100文字以内で指定してください")
        self.labels[channel - 1] = label.strip()
        return {"label": self.labels[channel - 1]}

    def monitors(self):
        return {"rph034": {
            "online": bool(self.readings), "host": self.host, "port": self.port, "error": self.error,
            "channels": [
                {"channel": channel, "label": label, "output": None,
                 **(self.readings[channel - 1] if self.readings else {})}
                for channel, label in enumerate(self.labels, start=1)
            ],
        }}

    def status(self):
        return DeviceStatus.HEALTHY if self.readings else DeviceStatus.UNKNOWN


def create_device():
    return RPH034Device()

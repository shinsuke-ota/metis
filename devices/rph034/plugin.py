"""Four-channel RPH-034 panel with persistent channel labels."""
from devices.base import BaseDevice, DeviceStatus


class RPH034Device(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.labels = [""] * 4

    def settings(self):
        return {"labels": self.labels}

    def restore_settings(self, settings):
        self.labels = settings.get("labels", self.labels)

    async def operate(self, name, parameters):
        if name != "set_label":
            raise ValueError("Unsupported RPH-034 operation")
        channel, label = parameters.get("channel"), parameters.get("label")
        if type(channel) is not int or not 1 <= channel <= 4:
            raise ValueError("チャンネルは 1〜4 で指定してください")
        if not isinstance(label, str) or len(label) > 100:
            raise ValueError("表示名は100文字以内で指定してください")
        self.labels = [label.strip() if number == channel else current
                       for number, current in enumerate(self.labels, start=1)]
        return {"label": self.labels[channel - 1]}

    def monitors(self):
        return {"rph034": {
            "online": False,
            "channels": [
                {"channel": channel, "label": label, "voltage": None, "current": None, "output": None}
                for channel, label in enumerate(self.labels, start=1)
            ],
        }}

    def status(self):
        return DeviceStatus.UNKNOWN


def create_device():
    return RPH034Device()

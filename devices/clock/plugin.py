"""Clock plugin: device behavior and discovery entry point."""
from datetime import datetime, timezone

from devices.base import BaseDevice, DeviceStatus


class ClockDevice(BaseDevice):
    def __init__(self):
        super().__init__(__file__)

    async def operate(self, name, parameters):
        if name != "get_time" or parameters:
            raise ValueError("unsupported operation")
        return self.sample()

    def sample(self):
        return {"time": datetime.now(timezone.utc).astimezone().isoformat(timespec="milliseconds")}

    def monitors(self):
        return {"time": self.sample()}

    def status(self) -> DeviceStatus:
        return DeviceStatus.HEALTHY


def create_device():
    return ClockDevice()

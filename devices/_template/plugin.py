"""Example plugin: copy this directory and edit this file for your device."""

from devices.base import BaseDevice


class Device(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.count = 0

    async def operate(self, name, parameters):
        if name != "increment" or parameters:
            raise ValueError("unsupported operation")
        self.count += 1
        return {"count": self.count}

    def monitors(self):
        return {"count": {"count": self.count}}


def create_device():
    return Device()

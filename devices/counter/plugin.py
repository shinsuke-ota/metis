"""Counter device derived from _template; one instance belongs to one node."""
import math
import time
from uuid import UUID, uuid4

from devices.base import BaseDevice, DeviceStatus
from monitor_history import join_source_key, timestamp


class CounterDevice(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.count = 0
        self.rate = 1.0
        self.remainder = 0.0
        self.last_tick = time.monotonic()
        self.instance_id = uuid4()
        self.acquired_at, _ = timestamp()

    def settings(self):
        return {"instance_id": str(self.instance_id)}

    def restore_settings(self, settings):
        self.instance_id = UUID(settings["instance_id"])

    def tick(self):
        now = time.monotonic()
        self.remainder += (now - self.last_tick) * self.rate
        self.last_tick = now
        increment = math.floor(self.remainder)
        self.count += increment
        self.remainder -= increment
        self.acquired_at, _ = timestamp()

    async def operate(self, name, parameters):
        if name == "set_rate" and set(parameters) == {"rate"}:
            rate = parameters["rate"]
            if isinstance(rate, bool) or not isinstance(rate, (int, float)) or not math.isfinite(rate) or not 0 <= rate <= 1000:
                raise ValueError("rate must be a number between 0 and 1000 counts/s")
            self.tick()
            self.rate = float(rate)
            return {"rate": self.rate, "count": self.count}
        if name == "reset" and not parameters:
            self.tick()
            self.count = 0
            self.remainder = 0.0
            self.acquired_at, _ = timestamp()
            return {"rate": self.rate, "count": self.count}
        raise ValueError("unsupported operation")

    def monitors(self):
        return {"count": {"count": self.count, "rate": self.rate, "instance_id": str(self.instance_id)}}

    def monitor_samples(self):
        source_key = join_source_key("instance", str(self.instance_id))
        return [
            {"namespace": "counter", "source_key": source_key,
             "metric": metric, "unit": unit, "value": value,
             "acquired_at": self.acquired_at, "time_source": "node"}
            for metric, unit, value in (("count", "1", self.count), ("rate", "1/s", self.rate))
        ]

    def status(self) -> DeviceStatus:
        if self.rate == 0 or self.rate > 20:
            return DeviceStatus.CRITICAL
        if self.rate < 1 or self.rate > 10:
            return DeviceStatus.WARNING
        return DeviceStatus.HEALTHY


def create_device():
    return CounterDevice()

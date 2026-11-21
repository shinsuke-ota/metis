"""Counter device derived from _template; one instance belongs to one node."""
import json
import math
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class CounterDevice:
    def __init__(self):
        self.manifest = json.loads((ROOT / "manifest.json").read_text())
        entry = self.manifest["entry"]
        self.assets = {entry: (ROOT / "dist" / entry).read_text()}
        self.count = 0
        self.rate = 1.0
        self.remainder = 0.0
        self.last_tick = time.monotonic()

    def tick(self):
        now = time.monotonic()
        self.remainder += (now - self.last_tick) * self.rate
        self.last_tick = now
        increment = math.floor(self.remainder)
        self.count += increment
        self.remainder -= increment

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
            return {"rate": self.rate, "count": self.count}
        raise ValueError("unsupported operation")

    def monitors(self):
        return {"count": {"count": self.count, "rate": self.rate}}

    def status(self):
        if self.rate == 0 or self.rate > 20:
            return "critical"
        if self.rate < 1 or self.rate > 10:
            return "warning"
        return "healthy"


def create_device():
    return CounterDevice()

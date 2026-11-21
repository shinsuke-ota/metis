"""Clock plugin: device behavior and discovery entry point."""
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class ClockDevice:
    def __init__(self):
        self.manifest = json.loads((ROOT / "manifest.json").read_text())
        entry = self.manifest["entry"]
        self.assets = {entry: (ROOT / "dist" / entry).read_text()}

    async def operate(self, name, parameters):
        if name != "get_time" or parameters:
            raise ValueError("unsupported operation")
        return self.sample()

    def sample(self):
        return {"time": datetime.now(timezone.utc).astimezone().isoformat(timespec="milliseconds")}

    def monitors(self):
        return {"time": self.sample()}

    def status(self):
        return "healthy"


def create_device():
    return ClockDevice()

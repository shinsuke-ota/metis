"""Example plugin: copy this directory and edit this file for your device."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class ExampleDevice:
    def __init__(self):
        self.manifest = json.loads((ROOT / "manifest.json").read_text())
        entry = self.manifest["entry"]
        self.assets = {entry: (ROOT / "dist" / entry).read_text()}
        self.count = 0

    async def operate(self, name, parameters):
        if name != "increment" or parameters:
            raise ValueError("unsupported operation")
        self.count += 1
        return {"count": self.count}

    def monitors(self):
        return {"count": {"count": self.count}}


def create_device():
    return ExampleDevice()

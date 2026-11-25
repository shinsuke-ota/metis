"""Common interface for device plugins."""
import json
from abc import ABC, abstractmethod
from enum import Enum
from pathlib import Path


class DeviceStatus(str, Enum):
    UNDEFINED = "undefined"
    UNKNOWN = "unknown"
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"


class BaseDevice(ABC):
    def __init__(self, plugin_file: str):
        root = Path(plugin_file).resolve().parent
        self.manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        entry = self.manifest["entry"]
        self.assets = {entry: (root / "dist" / entry).read_text(encoding="utf-8")}

    @abstractmethod
    async def operate(self, name, parameters):
        """Execute a device operation and return its result."""

    @abstractmethod
    def monitors(self):
        """Return the current monitor values by name."""

    def status(self) -> DeviceStatus:
        """Return the current device status if the plugin defines one."""
        return DeviceStatus.UNDEFINED

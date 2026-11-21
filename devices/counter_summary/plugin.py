"""Counter summary plugin: explicit sources, including IDs not yet connected."""
import re

from devices.base import BaseDevice, DeviceStatus


class CounterSummaryDevice(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.sources = []
        self.items = []

    def restore_settings(self, settings):
        self.sources = self.validate(settings.get("sources", []))

    def settings(self):
        return {"sources": self.sources}

    @staticmethod
    def validate(sources):
        if not isinstance(sources, list) or len(sources) > 100:
            raise ValueError("sources must be a list of at most 100 entries")
        validated = []
        seen = set()
        for item in sources:
            if not isinstance(item, dict) or not set(item) <= {"device_id", "label", "monitor", "count_field", "rate_field"}:
                raise ValueError("invalid source entry")
            device_id = item.get("device_id")
            if not isinstance(device_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,100}(?::[A-Za-z0-9_-]{1,100})?", device_id) or device_id in seen:
                raise ValueError("デバイス ID は重複しない node_id または node_id:instance_id を指定してください")
            seen.add(device_id)
            entry = {"device_id": device_id}
            for key, default in (("label", device_id), ("monitor", "count"),
                                 ("count_field", "count"), ("rate_field", "rate")):
                value = item.get(key, default)
                limit = 201 if key == "label" and value == device_id else 100
                if not isinstance(value, str) or not value or len(value) > limit:
                    raise ValueError(f"invalid {key}")
                entry[key] = value
            validated.append(entry)
        return validated

    async def operate(self, name, parameters):
        if name != "configure" or set(parameters) != {"sources"}:
            raise ValueError("unsupported operation")
        self.sources = self.validate(parameters["sources"])
        self.items = []  # refreshed from the node catalog after this operation
        return self.settings()

    def observe(self, catalog, own_id):
        items = []
        for source in self.sources:
            device_id = source["device_id"]
            info = catalog.get(device_id) if device_id != own_id else None
            connected = bool(info and info.get("connected"))
            monitor = info.get("monitors", {}).get(source["monitor"], {}) if info else {}
            monitor = monitor if isinstance(monitor, dict) else {}
            items.append({"device_id": device_id, "label": source["label"],
                          "connected": connected,
                          "state": info.get("state", "unknown") if connected else "unknown",
                          "count": monitor.get(source["count_field"]),
                          "rate": monitor.get(source["rate_field"]),
                          "available": connected and source["count_field"] in monitor and source["rate_field"] in monitor})
        self.items = items

    def monitors(self):
        return {"summary": {"sources": self.sources, "items": self.items}}

    def status(self) -> DeviceStatus:
        if not self.sources or any(not item["connected"] or not item["available"] or item["state"] == "unknown" for item in self.items):
            return DeviceStatus.UNKNOWN
        if any(item["state"] == "critical" for item in self.items):
            return DeviceStatus.CRITICAL
        if any(item["state"] == "warning" for item in self.items):
            return DeviceStatus.WARNING
        return DeviceStatus.HEALTHY


def create_device():
    return CounterSummaryDevice()


create_device.management_plugin = True

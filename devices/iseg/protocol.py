"""iCSservice messages for read-only discovery and monitoring."""
from collections.abc import Iterable

MODULE_ITEMS = ("Status.serialNumber", "Status.isAlive")
CHANNEL_ITEMS = (
    "Control.voltageSet",
    "Control.currentSet",
    "Status.voltageMeasure",
    "Status.currentMeasure",
    "Status.on",
    "Status.voltageRamping",
    "Error.currentTrip",
    "Setup.delayedTripAction",
)


def monitor_request(session_id: str, lines: Iterable[str], address: str = "*") -> dict:
    """Request module items and channel items on the configured CAN lines."""
    commands = []
    for line in lines:
        for channel, items in (("", MODULE_ITEMS), ("*", CHANNEL_ITEMS)):
            for item in items:
                commands.append({
                    "c": "getItem",
                    "p": {
                        "p": {"l": line, "a": address, "c": channel},
                        "i": item,
                        "v": "",
                        "u": "",
                    },
                })
    return {"i": session_id, "t": "request", "c": commands, "r": "websocket"}


def item_updates(payload: object):
    """Yield monitored item updates keyed by line, address, channel and item."""
    messages = payload if isinstance(payload, list) else [payload]
    for message in messages:
        if not isinstance(message, dict) or message.get("t") not in ("response", "info"):
            continue
        events = message.get("c")
        if not isinstance(events, list):
            continue
        for event in events:
            if not isinstance(event, dict) or event.get("e") != "itemUpdated":
                continue
            item = event.get("d")
            if not isinstance(item, dict) or "v" not in item:
                continue
            path = item.get("p")
            if not isinstance(path, dict):
                continue
            line, address, channel = (path.get(key) for key in ("l", "a", "c"))
            if not all(isinstance(part, str) for part in (line, address, channel)):
                continue
            if not line.isdecimal() or not address.isdecimal():
                continue
            name = item.get("i")
            if channel == "" and name in MODULE_ITEMS:
                yield (line, address, channel, name), item
            elif channel.isdecimal() and name in CHANNEL_ITEMS:
                yield (line, address, channel, name), item

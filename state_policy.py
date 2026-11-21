"""Node-local state policy. Edit evaluate() to define aggregation rules.

Inputs are snapshots of this node, its device and its direct children.
Return one of healthy, warning, critical, unknown and a short reason.
"""

STATES = {"healthy", "warning", "critical", "unknown"}


def evaluate(self_state, device_state, children):
    if self_state != "healthy":
        return self_state, "node unavailable"
    if device_state == "critical":
        return "critical", "device critical"
    if any(child["state"] == "critical" for child in children.values()):
        return "critical", "child critical"
    if device_state == "unknown" or any(child["state"] == "unknown" for child in children.values()):
        return "unknown", "device or child unavailable"
    if device_state == "warning" or any(child["state"] == "warning" for child in children.values()):
        return "warning", "device or child warning"
    return "healthy", "all available inputs healthy"

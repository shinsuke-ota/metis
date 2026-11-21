"""Discover installed device packages under devices/<name>/plugin.py.

Installed packages are trusted Python code. Discovery runs when the node starts;
restart after adding or replacing a package.
"""
import importlib
import logging
import re
from pathlib import Path

LOG = logging.getLogger(__name__)
DEVICES_DIR = Path(__file__).resolve().parent


def discover_plugins():
    plugins = {}
    for directory in sorted(DEVICES_DIR.iterdir()):
        if not directory.is_dir() or not re.fullmatch(r"[a-z][a-z0-9_]*", directory.name):
            continue
        if not (directory / "plugin.py").is_file() or not (directory / "__init__.py").is_file():
            continue
        try:
            module = importlib.import_module(f"devices.{directory.name}.plugin")
            factory = getattr(module, "create_device")
            if not callable(factory):
                raise TypeError("create_device must be callable")
            # Validate the interface and built asset before offering the plugin.
            device = factory()
            entry = device.manifest["entry"]
            if device.manifest["plugin_id"] != directory.name:
                raise ValueError("manifest plugin_id must match directory name")
            if not isinstance(entry, str) or entry not in device.assets:
                raise ValueError("manifest entry is missing from assets")
            if not callable(device.operate) or not callable(device.monitors) or not isinstance(device.monitors(), dict):
                raise TypeError("invalid device interface")
            plugins[directory.name] = factory
        except Exception:
            LOG.exception("Ignoring invalid device plugin: %s", directory.name)
    return plugins


PLUGINS = discover_plugins()


def create_device(name):
    return PLUGINS[name]() if name else None

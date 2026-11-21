"""Metis plugin for a CC24 running iCS2."""
import asyncio
import json
import math
from time import monotonic
from urllib.parse import urlsplit

import websockets
from websockets.exceptions import WebSocketException

from devices.base import BaseDevice, DeviceStatus
from monitor_history import timestamp
from .protocol import item_updates, monitor_request

TRANSPORT_ERRORS = (OSError, TimeoutError, WebSocketException, UnicodeError, ValueError)
LIMIT_FIELDS = ("voltage_min", "voltage_max", "current_min", "current_max")
SETPOINTS = {
    "set_voltage": ("Control.voltageSet", "voltage", "V"),
    "set_current": ("Control.currentSet", "current", "A"),
}
UNITS = {"V": 1, "kV": 1000, "A": 1, "kA": 1000, "mA": .001,
         "µA": 1e-6, "μA": 1e-6, "uA": 1e-6, "nA": 1e-9}


def read_quantity(item, unit):
    allowed = ("V", "kV") if unit == "V" else ("A", "kA", "mA", "µA", "μA", "uA", "nA")
    if item.get("u") not in allowed:
        raise ValueError("Setpoint unit is unavailable")
    return float(item["v"]) * UNITS[item["u"]]


def check_limit(policy, quantity, value):
    minimum = policy.get(f"{quantity}_min")
    maximum = policy.get(f"{quantity}_max")
    label, unit = {"voltage": ("電圧", "V"), "current": ("電流", "A")}[quantity]
    if minimum is None or maximum is None:
        raise ValueError(f"チャンネル設定で{label}の下限と上限（{unit}）を保存してください")
    if not minimum <= value <= maximum:
        raise ValueError(f"{value:g} {unit} は許容範囲（{minimum:g} ～ {maximum:g} {unit}）外です")


class IsegDevice(BaseDevice):
    def __init__(self):
        super().__init__(__file__)
        self.config = {"url": "", "username": "", "password": "", "lines": ["0"]}
        self.channels = {}
        self.values = {}
        self.last_ok = None
        self.error = ""
        self.poll_task = None
        self.next_poll = 0
        self.lock = asyncio.Lock()
        self.closed = False

    def settings(self):
        return {"connection": self.config, "channels": self.channels}

    def restore_settings(self, settings):
        self.config = settings.get("connection", self.config)
        self.channels = settings.get("channels", {})

    def tick(self):
        if not self.closed and self.config["url"] and monotonic() >= self.next_poll and (
            self.poll_task is None or self.poll_task.done()
        ):
            self.next_poll = monotonic() + 5
            self.poll_task = asyncio.create_task(self.poll())

    async def close(self):
        self.closed = True
        if self.poll_task is not None:
            self.poll_task.cancel()
            await asyncio.gather(self.poll_task, return_exceptions=True)

    async def login(self, socket):
        await socket.send(json.dumps({
            "i": "", "t": "login", "r": "websocket",
            "c": {"l": self.config["username"], "p": self.config["password"], "t": ""},
        }))
        async with asyncio.timeout(2):
            while True:
                packets = json.loads(await socket.recv())
                for packet in packets if isinstance(packets, list) else [packets]:
                    if not isinstance(packet, dict):
                        continue
                    if packet.get("trigger") in ("false", "denied", False):
                        raise ConnectionError("iCS2 login rejected")
                    session = packet.get("i")
                    if isinstance(session, str) and session:
                        return session

    def connection(self):
        return websockets.connect(self.config["url"], open_timeout=1, close_timeout=.2)

    async def read(self, socket, session, lines, address="*"):
        await socket.send(json.dumps(monitor_request(session, lines, address)))
        values = {}
        deadline = monotonic() + 1
        while deadline > monotonic():
            timeout = min(deadline - monotonic(), .25) if values else deadline - monotonic()
            try:
                payload = json.loads(await asyncio.wait_for(socket.recv(), timeout))
            except TimeoutError:
                break
            if isinstance(payload, dict) and payload.get("trigger") in ("false", "denied", False):
                raise ConnectionError("iCS2 rejected the read request")
            received_at, _ = timestamp()
            for key, item in item_updates(payload):
                acquired_at, source = timestamp(item.get("t"))
                values[key] = {**item, "acquired_at": acquired_at if source == "device" else received_at,
                               "time_source": source}
        return values

    async def logout(self, socket, session):
        try:
            await socket.send(json.dumps({"i": session, "t": "logout", "c": {}, "r": "websocket"}))
        except (OSError, WebSocketException):
            pass

    async def poll(self):
        async with self.lock:
            try:
                async with self.connection() as socket:
                    session = await self.login(socket)
                    try:
                        self.values = await self.read(socket, session, self.config["lines"])
                    finally:
                        await self.logout(socket, session)
                self.last_ok = monotonic() if self.values else None
                self.error = "" if self.values else "No module or channel data received"
            except TRANSPORT_ERRORS:
                self.last_ok = None
                self.error = "iCS2 connection, login, or read failed"

    def status(self):
        if self.last_ok is None or monotonic() - self.last_ok > 12:
            return DeviceStatus.UNKNOWN
        if any(key[-1] == "Error.currentTrip" and str(item["v"]).lower() in ("1", "true")
               for key, item in self.values.items()):
            return DeviceStatus.WARNING
        return DeviceStatus.HEALTHY

    def monitor_samples(self):
        """Numeric history samples using canonical units and physical addresses."""
        if self.status() == DeviceStatus.UNKNOWN:
            return []
        metrics = {
            "Status.voltageMeasure": ("voltage_measured", "V"),
            "Status.currentMeasure": ("current_measured", "A"),
            "Control.voltageSet": ("voltage_set", "V"),
            "Control.currentSet": ("current_set", "A"),
        }
        samples = []
        for (line, address, channel, name), item in self.values.items():
            if not channel or name not in metrics:
                continue
            serial = self.values.get((line, address, "", "Status.serialNumber"), {}).get("v")
            if serial is None or not str(serial).strip():
                continue
            metric, unit = metrics[name]
            try:
                value = read_quantity(item, unit)
            except (KeyError, ValueError, TypeError, OverflowError):
                continue
            if math.isfinite(value):
                samples.append({"namespace": "iseg", "serial_number": str(serial),
                                "channel_number": channel, "metric": metric, "unit": unit,
                                "value": value, "acquired_at": item["acquired_at"],
                                "time_source": item["time_source"]})
        return samples

    def monitors(self):
        modules = {}
        for (line, address, channel, name), item in sorted(self.values.items()):
            module = modules.setdefault((line, address), {"line": line, "address": address, "channels": {}})
            if channel:
                module["channels"].setdefault(channel, {})[name] = {"value": item["v"], "unit": item.get("u", "")}
            else:
                module[name] = item["v"]
        return {"iseg": {
            "connection": {key: self.config[key] for key in ("url", "username", "lines")},
            "password_set": bool(self.config["password"]),
            "policies": self.channels, "modules": list(modules.values()),
            "online": self.status() != DeviceStatus.UNKNOWN, "error": self.error,
        }}

    def configure(self, parameters):
        url = parameters.get("url", "")
        username = parameters.get("username", "")
        password = parameters.get("password", "")
        lines = parameters.get("lines", ["0"])
        if not all(isinstance(value, str) for value in (url, username, password)):
            raise ValueError("Invalid connection settings")
        parsed = urlsplit(url)
        if parsed.scheme not in ("ws", "wss") or not parsed.hostname or parsed.username or parsed.password or parsed.fragment:
            raise ValueError("Enter a ws:// or wss:// URL without credentials")
        parsed.port  # Validate the port if supplied.
        if not isinstance(lines, list) or not lines or any(line not in [str(n) for n in range(16)] for line in lines):
            raise ValueError("Specify CAN lines from 0 through 15")
        if not password and (url, username) == (self.config["url"], self.config["username"]):
            password = self.config["password"]
        self.config = {"url": url, "username": username, "password": password, "lines": list(dict.fromkeys(lines))}
        self.values, self.last_ok, self.error, self.next_poll = {}, None, "", 0

    def channel_policy(self, parameters):
        serial, channel = self.identity(parameters)
        policy = {}
        for key in ("label", "group"):
            value = parameters.get(key, "")
            if not isinstance(value, str) or len(value) > 100:
                raise ValueError("Labels and groups must be text up to 100 characters")
            policy[key] = value.strip()
        for key in LIMIT_FIELDS:
            value = parameters.get(key)
            if value is not None and (type(value) not in (int, float) or not math.isfinite(value)):
                raise ValueError("Limits must be finite numbers")
            policy[key] = value
        for quantity in ("voltage", "current"):
            low, high = policy[f"{quantity}_min"], policy[f"{quantity}_max"]
            if (low is None) != (high is None) or (low is not None and low > high):
                raise ValueError("Specify both limits in ascending order")
        return f"{serial}:{channel}", policy

    def configure_channels(self, parameters):
        targets, changes = parameters.get("targets"), parameters.get("changes")
        if not isinstance(targets, list) or not targets or any(not isinstance(target, dict) for target in targets):
            raise ValueError("変更するチャンネルを選択してください")
        fields = {"label", "group", *LIMIT_FIELDS}
        if not isinstance(changes, dict) or not changes or not changes.keys() <= fields:
            raise ValueError("変更する項目を指定してください")
        updated = dict(self.channels)
        for target in targets:
            serial, channel = self.identity(target)
            key = f"{serial}:{channel}"
            _, policy = self.channel_policy({**target, **updated.get(key, {}), **changes})
            updated[key] = policy
        self.channels = updated

    @staticmethod
    def identity(parameters):
        serial, channel = parameters.get("serial"), parameters.get("channel")
        if not isinstance(serial, str) or not serial.isascii() or not serial.isdecimal():
            raise ValueError("Missing module serial number")
        if not isinstance(channel, str) or not channel.isascii() or not channel.isdecimal():
            raise ValueError("Missing channel number")
        return serial, channel

    async def operate(self, name, parameters):
        async with self.lock:
            if self.closed:
                raise ConnectionError("iseg plugin has been closed")
            if name == "configure":
                self.configure(parameters)
                return {"saved": True}
            if name == "configure_channel":
                key, policy = self.channel_policy(parameters)
                self.channels = {**self.channels, key: policy}
                return {"saved": True}
            if name == "configure_channels":
                self.configure_channels(parameters)
                return {"saved": True}
            if name not in (*SETPOINTS, "set_output", "set_trip_action"):
                raise ValueError("Unsupported iseg operation")
            try:
                async with asyncio.timeout(4):
                    return await self.write(name, parameters)
            except (OSError, TimeoutError, WebSocketException) as error:
                raise ConnectionError("iCS2 operation could not be confirmed. Check the output state.") from error

    async def write(self, operation, parameters):
        serial, channel = self.identity(parameters)
        policy = self.channels.get(f"{serial}:{channel}", {})
        value = parameters.get("value")
        if operation in SETPOINTS:
            item, quantity, unit = SETPOINTS[operation]
            if type(value) not in (int, float) or not math.isfinite(value):
                raise ValueError("Enter a finite setpoint")
            check_limit(policy, quantity, value)
        elif operation == "set_trip_action":
            if type(value) is not int or value not in range(5):
                raise ValueError("iseg の遅延トリップ動作を選択してください")
            item, unit = "Setup.delayedTripAction", ""
        else:
            if type(value) is not bool:
                raise ValueError("Output state must be true or false")
            item, unit = "Control.on", ""
        matches = [(line, address) for (line, address, ch, name), sample in self.values.items()
                   if ch == "" and name == "Status.serialNumber" and str(sample["v"]) == serial]
        if self.status() == DeviceStatus.UNKNOWN or len(matches) != 1:
            raise ValueError("Module identity is unavailable or ambiguous")
        line, address = matches[0]
        async with self.connection() as socket:
            session = await self.login(socket)
            try:
                fresh = await self.read(socket, session, [line], address)
                module_serial = fresh.get((line, address, "", "Status.serialNumber"), {}).get("v")
                if str(module_serial) != serial or (line, address, channel, "Status.on") not in fresh:
                    raise ValueError("Module or channel identity changed")
                if operation == "set_trip_action":
                    reported = fresh.get((line, address, channel, item), {}).get("v")
                    if str(reported) not in ("0", "1", "2", "3", "4"):
                        raise ValueError("このチャンネルの遅延トリップ設定を取得できません")
                if operation == "set_output" and value:
                    for set_item, quantity, set_unit in SETPOINTS.values():
                        sample = fresh.get((line, address, channel, set_item), {})
                        check_limit(policy, quantity, read_quantity(sample, set_unit))
                wire_value = str(int(value)) if type(value) is bool else str(value)
                await socket.send(json.dumps({"i": session, "t": "request", "r": "websocket", "c": [{
                    "c": "setItem", "p": {"p": {"l": line, "a": address, "c": channel},
                                          "i": item, "v": wire_value, "u": unit},
                }]}))
                async with asyncio.timeout(1):
                    while True:
                        response = json.loads(await socket.recv())
                        if isinstance(response, dict) and "trigger" in response:
                            if response["trigger"] not in ("true", True):
                                raise ValueError("iCS2 rejected the setpoint or output command")
                            self.next_poll = 0
                            return {"accepted": True}
            finally:
                await self.logout(socket, session)


def create_device():
    return IsegDevice()

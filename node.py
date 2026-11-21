"""One node implementation for root, intermediate and device nodes."""
import asyncio
import hashlib
import json
import os
import re
import sqlite3
import uuid
from contextlib import asynccontextmanager, suppress
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

import websockets
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from devices.base import DeviceStatus
from devices.registry import PLUGINS, create_device
from state_policy import STATES, evaluate

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("NODE_DB", "node.sqlite3"))


def load_config():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
        values = dict(db.execute("SELECT key, value FROM config"))
    return {key: values.get(key, "") for key in ("node_id", "parent_ws", "device_plugin")}


def save_config(values):
    with sqlite3.connect(DB_PATH) as db:
        db.executemany("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", values.items())


def make_device(name):
    device = create_device(name)
    if device and callable(getattr(device, "restore_settings", None)):
        with sqlite3.connect(DB_PATH) as db:
            row = db.execute("SELECT value FROM config WHERE key = ?", (f"settings:{name}",)).fetchone()
        if row:
            device.restore_settings(json.loads(row[0]))
    return device


def validate_config(values):
    node_id = values.node_id.strip()
    parent_ws = values.parent_ws.strip()
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", node_id):
        raise HTTPException(422, "node_id must contain 1–100 letters, digits, _ or -")
    if values.device_plugin not in ("", *PLUGINS):
        raise HTTPException(422, "unknown device plugin")
    if parent_ws:
        parsed = urlsplit(parent_ws)
        if parsed.scheme not in ("ws", "wss") or not parsed.hostname or parsed.path != "/ws/children" or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise HTTPException(422, "parent_ws must be ws(s)://host[:port]/ws/children")
    return {"node_id": node_id, "parent_ws": parent_ws, "device_plugin": values.device_plugin}


class Operation(BaseModel):
    operation: str
    parameters: dict = {}


class Configuration(BaseModel):
    node_id: str
    parent_ws: str = ""
    device_plugin: str = ""


class Node:
    def __init__(self):
        self.config = load_config()
        self.node_id = self.config["node_id"]
        self.parent_ws = self.config["parent_ws"]
        self.device = make_device(self.config["device_plugin"])
        self.children = {}  # child node ID -> WebSocket
        self.advertisements = {}  # child node ID -> visible descendant catalog
        self.parent = None
        self.pending = {}  # request ID -> Future
        self.shutdown_event = asyncio.Event()
        self.changed = asyncio.Condition()
        self.revision = 0
        self.latest = self.device.monitors() if self.device else {}
        self.child_states = {}  # direct child ID -> last state and connection flag
        self.state = {"state": "unknown", "reason": "not evaluated", "changed_at": None}

    def device_status(self) -> DeviceStatus | None:
        if not self.device:
            return None
        try:
            return DeviceStatus(self.device.status())
        except Exception:
            return DeviceStatus.UNKNOWN

    def states(self):
        children = {}
        for child_id, info in self.child_states.items():
            via = self.reconnected_via(child_id) if not info["connected"] else None
            children[child_id] = {**info, "reconnected_via": via,
                                  "included_in_state": via is None}
        return {"node_id": self.node_id, "state": self.state,
                "self": "healthy" if self.node_id else "unknown",
                "device": self.device_status(), "children": children}

    def reconnected_via(self, device_id):
        for child_id, advertised in self.advertisements.items():
            if child_id != device_id and child_id in self.children and \
                    advertised.get(device_id, {}).get("connected"):
                return child_id
        return None

    async def update_state(self):
        children = {key: {"state": info["state"] if info["connected"] else "unknown"}
                    for key, info in self.child_states.items()
                    if info["connected"] or self.reconnected_via(key) is None}
        device_state = self.device_status()
        device_input = None if device_state in (None, DeviceStatus.UNDEFINED) else device_state.value
        status, reason = evaluate("healthy" if self.node_id else "unknown", device_input, children)
        if status not in STATES or not isinstance(reason, str):
            status, reason = "unknown", "invalid state policy result"
        if (status, reason) == (self.state["state"], self.state["reason"]):
            return
        self.state = {"state": status, "reason": reason,
                      "changed_at": datetime.now(timezone.utc).isoformat()}
        await self.notify_change()
        if self.parent:
            try:
                await self.parent.send(json.dumps({"type": "state", "value": self.state}))
            except websockets.exceptions.ConnectionClosed:
                pass

    async def notify_change(self):
        async with self.changed:
            self.revision += 1
            self.changed.notify_all()

    async def publish_monitors(self):
        if not self.device or not self.node_id:
            return
        tick = getattr(self.device, "tick", None)
        if callable(tick):
            tick()
        observe = getattr(self.device, "observe", None)
        if callable(observe):
            observe(self.catalog(), self.node_id)
        values = self.device.monitors()
        await self.update_state()
        if values == self.latest:
            return
        self.latest = values
        await self.notify_change()
        if self.parent:
            try:
                await self.parent.send(json.dumps({"type": "monitor", "device_id": self.node_id,
                                                   "monitors": values}))
            except websockets.exceptions.ConnectionClosed:
                pass

    async def receive_monitors(self, child_id, message):
        device_id = message.get("device_id")
        values = message.get("monitors")
        advertised = self.advertisements.get(child_id, {})
        if device_id not in advertised or not isinstance(values, dict):
            return
        if advertised[device_id]["monitors"] == values:
            return
        advertised[device_id]["monitors"] = values
        await self.notify_change()
        if self.parent:
            try:
                await self.parent.send(json.dumps({"type": "monitor", "device_id": device_id,
                                                   "monitors": values}))
            except websockets.exceptions.ConnectionClosed:
                pass
        await self.publish_monitors()

    def catalog(self):
        devices = {}
        if self.device and self.node_id:
            manifest = dict(self.device.manifest)
            entry = manifest["entry"]
            manifest["revision"] = hashlib.sha256(
                self.device.assets[entry].encode("utf-8")
            ).hexdigest()
            devices[self.node_id] = {"id": self.node_id, "connected": True,
                "plugin": manifest, "assets": self.device.assets,
                "monitors": self.latest, "state": self.state["state"]}
        for child_id, advertised in self.advertisements.items():
            for device_id, info in advertised.items():
                # A remembered disconnected route must not hide a live route
                # after a device is moved under another child node.
                if device_id != self.node_id and (device_id not in devices or
                        (not devices[device_id]["connected"] and info["connected"])):
                    devices[device_id] = info
        return devices

    def route(self, device_id):
        for child_id, advertised in self.advertisements.items():
            if device_id in advertised and advertised[device_id]["connected"] and child_id in self.children:
                return self.children[child_id]
        return None

    async def request(self, device_id, operation, parameters):
        if device_id == self.node_id and self.device:
            result = await self.device.operate(operation, parameters)
            settings = getattr(self.device, "settings", None)
            if callable(settings):
                save_config({f"settings:{self.config['device_plugin']}": json.dumps(settings())})
            await self.publish_monitors()
            return result
        child = self.route(device_id)
        if child is None:
            raise ConnectionError("device disconnected")
        request_id = uuid.uuid4().hex
        future = asyncio.get_running_loop().create_future()
        self.pending[request_id] = future
        try:
            await child.send_json({"type": "request", "request_id": request_id,
                "device_id": device_id, "operation": operation, "parameters": parameters})
            return await asyncio.wait_for(future, 5)
        finally:
            self.pending.pop(request_id, None)

    def reply(self, message):
        future = self.pending.get(message.get("request_id"))
        if future and not future.done():
            if "error" in message:
                future.set_exception(ConnectionError(message["error"]))
            else:
                future.set_result(message["value"])

    async def handle_request(self, message, send):
        response = {"type": "reply", "request_id": message["request_id"]}
        try:
            response["value"] = await self.request(
                message["device_id"], message["operation"], message.get("parameters", {}))
        except (ConnectionError, ValueError, asyncio.TimeoutError) as exc:
            response["error"] = str(exc)
        await send(response)


node = Node()


async def upstream():
    while True:
        try:
            async with websockets.connect(node.parent_ws, close_timeout=2) as connection:
                node.parent = connection
                await connection.send(json.dumps({"type": "hello", "node_id": node.node_id}))
                await node.update_state()
                await connection.send(json.dumps({"type": "state", "value": node.state}))

                async def advertise():
                    previous = None
                    revision = -1
                    while True:
                        catalog = node.catalog()
                        metadata = {key: {name: value for name, value in info.items()
                                          if name != "monitors"} for key, info in catalog.items()}
                        fingerprint = json.dumps(metadata, sort_keys=True)
                        if fingerprint != previous:
                            await connection.send(json.dumps({"type": "catalog", "devices": catalog}))
                            previous = fingerprint
                        revision = node.revision
                        async with node.changed:
                            await node.changed.wait_for(lambda: node.revision != revision)

                task = asyncio.create_task(advertise())
                requests = set()
                try:
                    async for raw in connection:
                        message = json.loads(raw)
                        if message.get("type") == "request":
                            job = asyncio.create_task(node.handle_request(message, lambda reply: connection.send(json.dumps(reply))))
                            requests.add(job)
                            job.add_done_callback(requests.discard)
                        elif message.get("type") == "reply":
                            node.reply(message)
                finally:
                    task.cancel()
                    for job in requests:
                        job.cancel()
                    with suppress(asyncio.CancelledError):
                        await task
                    node.parent = None
        except (OSError, websockets.exceptions.ConnectionClosed):
            await asyncio.sleep(2)


@asynccontextmanager
async def lifespan(app):
    async def tick():
        while True:
            await node.publish_monitors()
            await asyncio.sleep(1)
    tasks = [asyncio.create_task(tick())]
    await node.update_state()
    app.state.upstream_task = asyncio.create_task(upstream()) if node.node_id and node.parent_ws else None
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()
        if app.state.upstream_task:
            app.state.upstream_task.cancel()
        for task in tasks:
            with suppress(asyncio.CancelledError):
                await task
        if app.state.upstream_task:
            with suppress(asyncio.CancelledError):
                await app.state.upstream_task


app = FastAPI(title="Configurable node", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


@app.get("/")
async def index():
    return FileResponse(ROOT / "static/index.html")


@app.get("/setup")
async def setup_page():
    return FileResponse(ROOT / "static/setup.html")


@app.get("/api/config")
async def get_config():
    return {**node.config, "available_plugins": list(PLUGINS)}


@app.put("/api/config")
async def put_config(values: Configuration):
    changed = validate_config(values)
    device = make_device(changed["device_plugin"])
    if changed["node_id"] != node.node_id:
        for child in list(node.children.values()):
            await child.close(code=1012)
    previous_task = app.state.upstream_task
    if previous_task:
        previous_task.cancel()
        with suppress(asyncio.CancelledError):
            await previous_task
    save_config(changed)
    node.config = changed
    node.node_id = changed["node_id"]
    node.parent_ws = changed["parent_ws"]
    node.device = device
    node.latest = device.monitors() if device else {}
    await node.update_state()
    await node.notify_change()
    app.state.upstream_task = asyncio.create_task(upstream()) if node.parent_ws else None
    return {**changed, "available_plugins": list(PLUGINS)}


@app.websocket("/ws/children")
async def child_connection(ws: WebSocket):
    await ws.accept()
    child_id = None
    jobs = set()
    try:
        hello = json.loads(await ws.receive_text())
        child_id = hello.get("node_id") if hello.get("type") == "hello" else None
        if not node.node_id or not isinstance(child_id, str) or not child_id or child_id == node.node_id or child_id in node.children:
            await ws.close(code=1008)
            return
        node.children[child_id] = ws
        node.child_states[child_id] = {"state": "unknown", "reason": "awaiting state",
                                       "changed_at": None, "connected": True}
        await node.update_state()
        while True:
            message = json.loads(await ws.receive_text())
            if message.get("type") == "catalog":
                advertised = message.get("devices", {})
                if isinstance(advertised, dict):
                    node.advertisements[child_id] = advertised
                    await node.update_state()
                    await node.notify_change()
                    await node.publish_monitors()
            elif message.get("type") == "monitor":
                await node.receive_monitors(child_id, message)
            elif message.get("type") == "state":
                value = message.get("value")
                if isinstance(value, dict) and value.get("state") in STATES:
                    node.child_states[child_id] = {
                        "state": value["state"], "reason": str(value.get("reason", "")),
                        "changed_at": value.get("changed_at"), "connected": True}
                    if child_id in node.advertisements.get(child_id, {}):
                        node.advertisements[child_id][child_id]["state"] = value["state"]
                    await node.update_state()
                    await node.notify_change()
                    await node.publish_monitors()
            elif message.get("type") == "reply":
                node.reply(message)
            elif message.get("type") == "request":
                job = asyncio.create_task(node.handle_request(message, ws.send_json))
                jobs.add(job)
                job.add_done_callback(jobs.discard)
    except (WebSocketDisconnect, ValueError, KeyError):
        pass
    finally:
        for job in jobs:
            job.cancel()
        if child_id and node.children.get(child_id) is ws:
            node.children.pop(child_id)
            for info in node.advertisements.get(child_id, {}).values():
                info["connected"] = False
                info["state"] = "unknown"
            node.child_states[child_id] = {**node.child_states[child_id], "connected": False}
            await node.update_state()
            await node.notify_change()
            await node.publish_monitors()


@app.get("/api/states")
async def states():
    return node.states()


@app.get("/api/states/events")
async def state_events():
    async def stream():
        previous = None
        while not node.shutdown_event.is_set():
            payload = json.dumps(node.states())
            if payload != previous:
                yield f"data: {payload}\n\n"
                previous = payload
            revision = node.revision
            try:
                async with node.changed:
                    await asyncio.wait_for(node.changed.wait_for(
                        lambda: node.revision != revision or node.shutdown_event.is_set()), timeout=30)
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@app.get("/api/devices")
async def devices():
    return [{"id": device_id, "connected": info["connected"], "state": info.get("state", "unknown"),
             "plugin": {**info["plugin"],
                        "url": f"/plugins/{device_id}/{info['plugin']['entry']}?v={info['plugin']['revision']}"}}
            for device_id, info in node.catalog().items()]


@app.get("/plugins/{device_id}/{asset_name}")
async def plugin(device_id: str, asset_name: str):
    info = node.catalog().get(device_id)
    if info is None or asset_name not in info["assets"]:
        raise HTTPException(404)
    return Response(info["assets"][asset_name], media_type="text/javascript",
                    headers={"Cache-Control": "no-store"})


@app.post("/api/devices/{device_id}/operations")
async def operate(device_id: str, request: Operation):
    try:
        return await node.request(device_id, request.operation, request.parameters)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from None
    except (ConnectionError, asyncio.TimeoutError, RuntimeError, WebSocketDisconnect) as exc:
        raise HTTPException(503, str(exc)) from None


@app.get("/api/devices/{device_id}/monitors/{monitor}/events")
async def events(device_id: str, monitor: str):
    device = node.catalog().get(device_id)
    if not device or monitor not in device["monitors"]:
        raise HTTPException(404)

    async def stream():
        previous = None
        while True:
            if node.shutdown_event.is_set():
                break
            device = node.catalog().get(device_id)
            payload = {"connected": bool(device and device["connected"])}
            if device and monitor in device["monitors"]:
                payload.update(device["monitors"][monitor])
            encoded = json.dumps(payload)
            if encoded != previous:
                yield f"data: {encoded}\n\n"
                previous = encoded
            else:
                yield ": heartbeat\n\n"
            revision = node.revision
            try:
                async with node.changed:
                    await asyncio.wait_for(node.changed.wait_for(
                        lambda: node.revision != revision or node.shutdown_event.is_set()), timeout=30)
            except asyncio.TimeoutError:
                pass
    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})

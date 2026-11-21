"""Run one node with its own persistent data directory."""
import argparse
import asyncio
import os
from pathlib import Path

import uvicorn

parser = argparse.ArgumentParser()
parser.add_argument("--port", type=int, required=True)
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--data-dir", required=True)
parser.add_argument("--shutdown-timeout", type=float, default=5,
                    help="Seconds to wait for open connections during Ctrl+C (default: 5)")
args = parser.parse_args()
if args.shutdown_timeout <= 0:
    parser.error("--shutdown-timeout must be positive")

data_dir = Path(args.data_dir).resolve()
data_dir.mkdir(parents=True, exist_ok=True)
os.environ["NODE_DB"] = str(data_dir / "node.sqlite3")

import node  # database path must be set before importing the app


class NodeServer(uvicorn.Server):
    def handle_exit(self, sig, frame):
        node.node.shutdown_event.set()
        asyncio.get_running_loop().create_task(node.node.notify_change())
        upstream = getattr(node.app.state, "upstream_task", None)
        if upstream:
            upstream.cancel()
        super().handle_exit(sig, frame)


config = uvicorn.Config(node.app, host=args.host, port=args.port, workers=1,
                        timeout_graceful_shutdown=args.shutdown_timeout)
try:
    NodeServer(config).run()
except KeyboardInterrupt:
    # Uvicorn re-raises the captured SIGINT after graceful shutdown.
    pass

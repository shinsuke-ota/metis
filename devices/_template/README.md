# Device plugin template

1. Copy this directory to `devices/example` (or place a Git submodule there).
2. Set `plugin_id`, `title`, and `entry` in `manifest.json`. The directory name is the name shown by the setup API and must match `[a-z][a-z0-9_]*`.
3. Implement the device class and `create_device()` in `plugin.py`. The device must expose `manifest`, `assets` (mapping asset filename to JavaScript text), async `operate(name, parameters)` and `monitors()` (mapping monitor names to JSON values). You can add other Python modules within the package later if the implementation grows.
4. Implement the Vue component. Its `entry.js` exports `mount(client)`; `client.request(operation, parameters)` sends an operation and `client.subscribe(monitor, onValue)` returns a cleanup function.
5. From the node project root, run `pnpm install --frozen-lockfile` and `pnpm build`. This builds every installed device plugin. To build only this plugin, use `pnpm build:device example`. Include `dist/example.js` in your plugin repository or build it after checkout.
6. Restart the node. `/api/config` now lists `example` in `available_plugins`; select it in `/setup`.

Optional hooks: `status()` returns a node state, `tick()` updates local values once per second, and `observe(catalog, own_id)` receives the local node's current visible device catalog whenever local/descendant data changes. The catalog maps device ID to `connected`, `state`, `monitors`, and plugin metadata. Implement `settings()` to return JSON-serializable configuration and `restore_settings(settings)` to restore it after a node restart; the framework saves it after a successful local operation. See `devices/counter_summary` for a plugin that observes selected descendant IDs, including IDs that have not connected yet.

For a Git submodule, an example installation command from the node project root is `git submodule add <repository-url> devices/example`. The installed plugin is trusted Python and JavaScript code; review it before installing. The node does not download arbitrary code through its settings API.

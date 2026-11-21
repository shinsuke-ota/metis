# iseg CC24 / iCS2

1. Start a Metis node and choose the `iseg` plugin in `/setup`.
2. Open the device panel. Enter the CC24 WebSocket URL, iCS account, and CAN lines. Line 0 is selected initially. Enter comma-separated lines if needed.
3. Wait for discovery, then select a channel's settings to set its label, group and allowed voltage/current ranges. The ranges use V and A. Channel settings follow the module serial number and channel number.
4. Use the channel controls to set voltage, set current or switch the output. The panel shows measured values and reports command acceptance separately from the measured output state.

All discovered channels can be configured. Setpoint writes require the applicable configured range. ON requires both current setpoints to be within their configured ranges. OFF is available without ranges once the channel identity can be confirmed. Group names organize the display.

The iCS password is stored in the Metis node's SQLite settings. It is excluded from monitor data and is never filled back into the UI. Entering a blank password for the same URL and username keeps the saved password. Restrict access to the Metis node, browser-facing API, and database when using a write-capable iCS account.

The included bundle is ready to load. To rebuild it, run `pnpm build:device iseg`. The transport was verified with a mock WebSocket server. Verify the installed iCS2 session response and the channel readings on hardware before enabling outputs.

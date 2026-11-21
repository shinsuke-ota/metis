import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const directories = readdirSync('devices', { withFileTypes: true })
  .filter(entry => entry.isDirectory() && /^[a-z][a-z0-9_]*$/.test(entry.name))
  .map(entry => entry.name)
  .filter(name => existsSync(`devices/${name}/plugin.py`) &&
    existsSync(`devices/${name}/manifest.json`) &&
    existsSync(`devices/${name}/entry.js`));

if (!directories.length) {
  console.error('No device plugins with plugin.py, manifest.json and entry.js found');
  process.exit(1);
}

for (const name of directories) {
  const manifest = JSON.parse(readFileSync(`devices/${name}/manifest.json`, 'utf8'));
  if (manifest.plugin_id !== name) {
    console.error(`devices/${name}: manifest plugin_id must equal ${name}`);
    process.exit(1);
  }
  console.log(`Building ${name}...`);
  const result = spawnSync('pnpm', ['exec', 'vite', 'build'], {
    stdio: 'inherit', env: { ...process.env, DEVICE_UI: name },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

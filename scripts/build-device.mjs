import { spawnSync } from 'node:child_process';

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9_]*$/.test(name)) {
  console.error('Usage: pnpm build:device <directory-name>');
  process.exit(2);
}
const result = spawnSync('pnpm', ['exec', 'vite', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, DEVICE_UI: name },
});
process.exit(result.status ?? 1);

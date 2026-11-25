import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const name = process.env.DEVICE_UI;
if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error('Invalid device name');
const path = `devices/${name}`;
const contents = resolve(path, 'Contents.vue');
const { entry } = JSON.parse(readFileSync(`${path}/manifest.json`, 'utf8'));
if (!/^[a-zA-Z0-9_-]+\.js$/.test(entry)) throw new Error('Invalid manifest entry');

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { 'device-contents': contents } },
  build: {
    outDir: `${path}/dist`,
    emptyOutDir: true,
    lib: {
      entry: existsSync(contents) ? 'devices/entry.js' : `${path}/entry.js`,
      formats: ['es'],
      fileName: () => entry,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
});

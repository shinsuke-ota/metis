import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';

const name = process.env.DEVICE_UI;
if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error('Invalid device name');
const path = `devices/${name}`;
const { entry } = JSON.parse(readFileSync(`${path}/manifest.json`, 'utf8'));
if (!/^[a-zA-Z0-9_-]+\.js$/.test(entry)) throw new Error('Invalid manifest entry');

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: `${path}/dist`,
    emptyOutDir: true,
    lib: {
      entry: `${path}/entry.js`,
      formats: ['es'],
      fileName: () => entry,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
});

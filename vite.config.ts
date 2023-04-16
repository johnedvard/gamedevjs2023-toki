import fs from 'fs';
import { defineConfig } from 'vite';
import path from 'path';

fs.rmSync('dist', { recursive: true, force: true }); // v14.14.0

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});

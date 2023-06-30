import fs from 'fs';
import { defineConfig } from 'vite';
import path from 'path';
// added below polyfills to make near-api-js work with vite
// npm install --dev @esbuild-plugins/node-globals-polyfill
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// npm install --dev @esbuild-plugins/node-modules-polyfill
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

fs.rmSync('dist', { recursive: true, force: true }); // v14.14.0

export default defineConfig({
  base: './',
  plugins: [],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/lib.ts'),
      name: 'Toki',
      // the proper extensions will be added
      fileName: 'toki',
    },
    commonjsOptions: {
      include: [],
    },
  },
  optimizeDeps: {
    disabled: false,
    esbuildOptions: {
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});

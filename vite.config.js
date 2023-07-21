import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import env from 'vite-plugin-env-compatible'
import pkg from './package.json'
import manifest from './manifest.json'

import path from "path"
import { globSync } from 'glob'

manifest.version = pkg.version

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    crx({ manifest }),
    env({ prefix: 'VITE', mountedPath: "process.env"})
  ],
  build: {
    rollupOptions: {
      input: globSync(path.resolve(__dirname, "*.html"))
    }
  }
})
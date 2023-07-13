import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

import path from "path"
import { globSync } from 'glob'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: globSync(path.resolve(__dirname, "*.html"))
    }
  }
})
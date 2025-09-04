import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  // Allow CI to override base so builds can live in subfolders (e.g. _posts/daadi)
  base: process.env.BASE_PATH || '/lazyspa/',
  plugins: [react(), nodePolyfills({ globals: { Buffer: true } })],
})

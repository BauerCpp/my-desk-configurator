import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/my-desk-configurator',
  plugins: [react()],
  build: {
    outDir: './dist'
  },
  publicDir: './public',
    define: {
    __PUBLIC_URL__: process.env.__PUBLIC_URL__,
  },
})

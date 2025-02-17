import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  // root: './src',
  build: {
    outDir: './dist'
  },
  publicDir: './public',
  plugins: [react()],
  assetsInclude: ['**/*.glb']
})

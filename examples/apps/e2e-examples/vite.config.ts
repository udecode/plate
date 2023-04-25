import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable warning about chunk size
    chunkSizeWarningLimit: Infinity,
  },
  server: {
    port: 3030,
  },
  preview: {
    port: 3030,
  },
})

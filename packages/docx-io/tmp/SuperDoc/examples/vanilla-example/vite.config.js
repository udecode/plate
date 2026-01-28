import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@harbour-enterprises/superdoc']
  }
});
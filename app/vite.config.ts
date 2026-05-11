import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'companion-pages/prayer': resolve(__dirname, 'companion-pages/prayer.html'),
        'companion-pages/meditation': resolve(__dirname, 'companion-pages/meditation.html'),
        'companion-pages/privacy-policy': resolve(__dirname, 'companion-pages/privacy-policy.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  },
  server: {
    fs: {
      strict: false // Allow more flexible file serving
    }
  }
})

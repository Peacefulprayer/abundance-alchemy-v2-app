import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  },
  server: {
    fs: {
      strict: false // Allow more flexible file serving
    }
  }
})

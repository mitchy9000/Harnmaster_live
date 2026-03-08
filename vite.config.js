import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // In dev, forward /api requests to the Express server
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir:    'dist',
    sourcemap: false,         // no sourcemaps in prod build (security)
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor:  ['react', 'react-dom'],
          router:  ['react-router-dom'],
          network: ['axios'],
        },
      },
    },
  },
})
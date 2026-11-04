import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const deployBase = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}).process?.env?.MEUCONTROLE_BASE_PATH

export default defineConfig({
  base: deployBase ?? '/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API calls are proxied to the staging host so `npm run dev` and
// `npm run preview` work locally without the Docker stack.
const apiTarget = process.env.HF_API || 'http://hairforecast.walrus'
const proxy = {
  '/wxapi': { target: apiTarget, changeOrigin: true },
  '/geoapi': { target: apiTarget, changeOrigin: true },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // This enables listening on all addresses
    allowedHosts: ['hairforecast.app'],
    proxy,
  },
  preview: { proxy },
})

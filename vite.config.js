import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      // You can use a self-signed certificate
      // In production, you would use proper certificates
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    host: true, // This enables listening on all addresses
  },
})

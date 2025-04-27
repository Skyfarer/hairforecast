import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: true, // This will use Vite's automatic certificate generation
    host: true,  // This enables listening on all addresses
  },
})

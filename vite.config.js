import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3005',  // Backend URL
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Set to false if using self-signed SSL
        // Remove the rewrite rule or modify it to match your backend routes
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
      '/images': {  // Add this proxy rule for images
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      }
    },
  },  
  plugins: [react()],
})



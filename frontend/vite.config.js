import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Inspect from 'vite-plugin-inspect'

const SCSS_Logger = {
  warn(message, options) {
      // Mute "Mixed Declarations" warning
      if (options.deprecation && message.includes('mixed-decls')) {
          return
      }
      // List all other warnings
      console.warn(`▲ [WARNING]: ${message}`);
  },
};


// Backend URL: defaults to localhost for native `yarn dev`. When running
// inside docker-compose, VITE_BACKEND_URL is set to http://backend:3005
// since `localhost` inside the frontend container is the container itself.
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:3005';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Set to false if using self-signed SSL
        // FastAPI 307-redirects routes missing a trailing slash (e.g.
        // /api/cars -> /api/cars/). Without autoRewrite, that redirect's
        // Location header carries the proxy target verbatim - fine for
        // localhost:3005, but when target is a docker-compose service name
        // (backend:3005) the browser can't resolve it and the request hangs.
        // autoRewrite swaps the target's host:port back to this dev server's
        // in Location headers so the browser follows it through the proxy.
        autoRewrite: true,
        // Remove the rewrite rule or modify it to match your backend routes
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/images': {  // Add this proxy rule for images
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        autoRewrite: true,
      }
    },
  },
  plugins: [react(), tailwindcss(), Inspect()],
  css: {
    preprocessorOptions: {
      scss: {
        logger: SCSS_Logger,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['reactstrap', 'bootstrap'],
          'animations': ['framer-motion'],
        }
      }
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import purgecss from '@mojojoejo/vite-plugin-purgecss'; // Import the plugin
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
  plugins: [react(),
    purgecss({
      // Specify the paths to all of your template and source files
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
      safelist: [
        'hero-banner-as-title',
        'hero-title-as-title',
        'top-text-as-title',
        'highlight-container-as-title',
        'highlight-text-as-title'
      ]
    }),
    Inspect() 
  ],
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
          'animations': ['framer-motion/dist/framer-motion'],
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

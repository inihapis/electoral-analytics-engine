import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // UI library chunks
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', 'lucide-react'],
          
          // Data fetching chunks
          query: ['@tanstack/react-query'],
          
          // Chart/visualization chunks
          charts: ['recharts'],
          
          // Utility chunks
          utils: ['class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})

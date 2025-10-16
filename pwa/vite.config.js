import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  base: '/barberbro-pwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: process.env.VITE_APP_NAME || 'BarberBro Booking',
        short_name: process.env.VITE_APP_SHORT_NAME || 'BarberBro',
        description: process.env.VITE_APP_DESCRIPTION || 'Prenota il tuo taglio in pochi tap',
        theme_color: '#C19A6B',
        background_color: '#1F1F1F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/barberbro-pwa/',
        start_url: '/barberbro-pwa/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2', // Incrementa per invalidare cache
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minuti per aggiornamenti più rapidi
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'store': ['zustand'],
          'utils': ['date-fns']
        }
      }
    }
  }
}))

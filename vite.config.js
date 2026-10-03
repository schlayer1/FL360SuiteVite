import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
            return 'pdf-vendor';
          }
          if (id.includes('chart.js')) {
            return 'chart-vendor';
          }
          if (id.includes('lucide')) {
            return 'icons-vendor';
          }
        }
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg', 'icons/logo-sts-gera.jpg'],
      manifest: {
        name: 'Fachleiter 360° Suite Pro',
        short_name: 'Fachleiter 360°',
        description: 'Thüringer Ausbildungs- & Prüfungsmanagement nach ThürAZStPLVO für Fachleiterinnen und Fachleiter',
        start_url: './index.html',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0f172a',
        theme_color: '#1e3a8a',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,pdf}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 // Erlaubt Cachen der amtlichen PDF-Formulare
      }
    })
  ]
});

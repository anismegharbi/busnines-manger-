import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'icon-512x512.png'],
      manifest: {
        name: 'إدارة الأعمال',
        short_name: 'إدارة الأعمال',
        description: 'تطبيق إدارة المبيعات والمخزون',
        theme_color: '#2563EB',
        background_color: '#F5F5F7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

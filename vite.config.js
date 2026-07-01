import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true, // WAJIB true — hot-reload Blade + React
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate', // Service worker baru otomatis aktif tanpa user perlu refresh manual
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'NutriSync',
                short_name: 'NutriSync',
                description: 'Deteksi dini risiko diabetes untuk remaja Indonesia',
                theme_color: '#1B6E63',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/app/dashboard',
                icons: [
                    // WAJIB minimal 192x192 & 512x512, tanpa ini prompt "Add to Home Screen" tidak muncul
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                // Network-first untuk API (data selalu fresh), cache-first untuk asset statis
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 5,
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
                        },
                    },
                ],
                // Dashboard admin faskes & caregiver tidak perlu (dan tidak masuk akal) berjalan offline
                navigateFallbackDenylist: [/^\/faskes/, /^\/caregiver/, /^\/family/],
            },
        }),
    ],
});

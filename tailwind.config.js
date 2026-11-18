import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Warna primer biru sesuai desain Figma NutriSync
                primary: {
                    50:  '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#1E88E5',  // Biru utama Figma (CTA, link aktif)
                    700: '#1565C0',  // Biru gelap Figma (hover state)
                    800: '#1E40AF',
                    900: '#0D1B4B',  // Biru sangat gelap (heading text Figma)
                    950: '#0A1229',
                },
                // Brand accent - hijau dipertahankan untuk tombol konfirmasi & elemen gizi
                brand: {
                    green:  '#2E7D32',  // Hijau gelap Figma (tombol kedua)
                    light:  '#E8F5E9',  // Latar hijau muda Figma
                    scan:   '#4CAF50',  // Warna FAB scan kamera
                },
                // Status medis — TIDAK BERUBAH (sesuai aturan wajib frontend-ui.md)
                status: {
                    aman:    '#22C55E',
                    waspada: '#EAB308',
                    bahaya:  '#EF4444',
                },
            },
            keyframes: {
                // Dipakai oleh kelas animate-fadeIn di seluruh komponen NutriSync
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'translateY(6px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.22s ease-out both',
            },
        },
    },

    plugins: [forms],
};

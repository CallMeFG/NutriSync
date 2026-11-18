import { test, expect } from '@playwright/test';

/**
 * Smoke test halaman pasien (sesi dari auth.setup.js).
 * Fokus: halaman ter-render & tidak error di tiap browser — bukan fungsi bisnis penuh.
 */
const pages = [
    { path: '/patient/dashboard', name: 'Dashboard' },
    { path: '/patient/blood-sugar', name: 'Gula Darah' },
    { path: '/patient/blood-sugar/trend', name: 'Tren Gula Darah' },
    { path: '/patient/nutrition', name: 'Nutrisi / Scan' },
    { path: '/patient/activity', name: 'Aktivitas' },
    { path: '/patient/rewards', name: 'Misi & Reward' },
    { path: '/patient/health-summary', name: 'Ringkasan Kesehatan' },
    { path: '/patient/family-sync', name: 'Family Sync' },
];

test.describe('Pasien — halaman utama ter-render', () => {
    for (const p of pages) {
        test(`${p.name} (${p.path})`, async ({ page }) => {
            const errors = [];
            page.on('pageerror', (e) => errors.push(e.message));

            const res = await page.goto(p.path);
            expect(res.status(), 'HTTP status').toBe(200);
            await expect(page).toHaveURL(new RegExp(p.path.replace(/\//g, '\\/') + '$'));
            // Inertia sudah mount komponen React ke #app
            await expect(page.locator('#app > *').first()).toBeVisible();
            expect(errors, 'JavaScript error di halaman').toEqual([]);
        });
    }

    test('RBAC: pasien ditolak (403) membuka dashboard faskes', async ({ page }) => {
        const res = await page.goto('/faskes/dashboard');
        expect(res.status()).toBe(403);
    });

    test('RBAC: pasien ditolak (403) membuka dashboard caregiver', async ({ page }) => {
        const res = await page.goto('/caregiver/dashboard');
        expect(res.status()).toBe(403);
    });
});

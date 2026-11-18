import { test, expect } from '@playwright/test';

/** Smoke test caregiver (orang tua) — sesi dari auth.setup.js. */
test.describe('Caregiver', () => {
    test('dashboard caregiver ter-render tanpa error JS', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));

        const res = await page.goto('/caregiver/dashboard');
        expect(res.status()).toBe(200);
        await expect(page.locator('#app > *').first()).toBeVisible();
        expect(errors).toEqual([]);
    });

    test('/dashboard mengarahkan caregiver ke dashboard-nya', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/caregiver\/dashboard$/);
    });

    test('RBAC: caregiver ditolak (403) membuka halaman pasien', async ({ page }) => {
        const res = await page.goto('/patient/dashboard');
        expect(res.status()).toBe(403);
    });
});

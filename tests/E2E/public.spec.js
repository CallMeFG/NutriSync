import { test, expect } from '@playwright/test';

/** Halaman publik & proteksi akses — tanpa login. */
test.describe('Publik & akses tamu', () => {
    test('halaman login tampil dengan form lengkap', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeEnabled();
        // Turnstile dalam Dev Mode (kredensial dikosongkan di .env.e2e)
        await expect(page.getByText('Turnstile Dev Mode')).toBeVisible();
    });

    test('halaman register tampil', async ({ page }) => {
        const res = await page.goto('/register');
        expect(res.status()).toBe(200);
        await expect(page).toHaveTitle(/NutriSync/i);
    });

    test('login dengan password salah menampilkan error', async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill('demo.patient@nutrisync.id');
        await page.locator('#password').fill('salah-total');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('p.text-red-600, .text-red-600').first()).toBeVisible();
    });

    for (const path of ['/dashboard', '/patient/dashboard', '/caregiver/dashboard', '/faskes/dashboard']) {
        test(`tamu diarahkan ke login saat membuka ${path}`, async ({ page }) => {
            await page.goto(path);
            await expect(page).toHaveURL(/\/login/);
        });
    }

    test('health check /up merespons 200', async ({ request }) => {
        const res = await request.get('/up');
        expect(res.status()).toBe(200);
    });
});

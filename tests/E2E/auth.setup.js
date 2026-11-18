import { test as setup, expect } from '@playwright/test';

/**
 * Login lewat UI (email + password -> step-up OTP) satu kali per role,
 * lalu simpan sesi ke storageState untuk dipakai ulang oleh semua browser.
 * OTP dibaca dari banner "Mode Demo / Local Dev" (MAIL_MAILER=log).
 */
const accounts = [
    { role: 'patient', email: 'demo.patient@nutrisync.id', home: /\/patient\/dashboard/, file: 'tests/E2E/.auth/patient.json' },
    { role: 'caregiver', email: 'demo.caregiver@nutrisync.id', home: /\/caregiver\/dashboard/, file: 'tests/E2E/.auth/caregiver.json' },
];

for (const acc of accounts) {
    setup(`login sebagai ${acc.role}`, async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill(acc.email);
        await page.locator('#password').fill('password123');
        await page.locator('button[type="submit"]').click();

        // Device baru => wajib step-up OTP
        await expect(page).toHaveURL(/\/step-up/);
        const otp = page.locator('.select-all').filter({ hasText: /^\d{6}$/ });
        await expect(otp).toBeVisible();
        await page.locator('#code').fill((await otp.innerText()).trim());
        await page.getByRole('button', { name: /Verifikasi/ }).click();

        // Bisa berhenti di halaman pairing (caregiver/patient baru) — lewati bila ada
        await page.waitForURL((url) => !url.pathname.startsWith('/step-up'));
        if (page.url().includes('/pairing')) {
            await page.goto('/dashboard');
        }

        await expect(page).toHaveURL(acc.home);
        await page.context().storageState({ path: acc.file });
    });
}

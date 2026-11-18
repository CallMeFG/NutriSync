import { test, expect } from '@playwright/test';

/**
 * Test eksplorasi cross-browser — halaman pasien (sesi login dari auth.setup.js).
 * Nama file berakhiran "patient.spec.js" agar otomatis dijalankan oleh project
 * "<browser> (patient)" di playwright.config.js.
 *
 * TC-26 : layout dashboard & tren gula darah tanpa overflow horizontal + screenshot.
 * TC-27 : sync offline menolak data tanpa client_uuid, dengan sesi + token CSRF valid
 *         (perbaikan TC-11 yang false pass karena menerima respons 419).
 */

/** Cek konten tidak melebar melewati layar, lalu simpan screenshot sebagai evidence. */
async function cekLayout(page, testInfo, nama) {
    await page.waitForLoadState('load');
    await expect(page.locator('#app > *').first()).toBeVisible();

    const ukuran = await page.evaluate(() => ({
        lebarKonten: document.documentElement.scrollWidth,
        lebarLayar: window.innerWidth,
    }));

    const project = testInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const gambar = await page.screenshot({ fullPage: true, path: `tests/screenshots/${nama}__${project}.png` });
    await testInfo.attach(`${nama} (${testInfo.project.name})`, { body: gambar, contentType: 'image/png' });

    testInfo.annotations.push({
        type: 'Lebar konten / layar',
        description: `${ukuran.lebarKonten}px / ${ukuran.lebarLayar}px`,
    });

    expect(
        ukuran.lebarKonten,
        `Overflow horizontal: konten ${ukuran.lebarKonten - ukuran.lebarLayar}px lebih lebar dari layar`,
    ).toBeLessThanOrEqual(ukuran.lebarLayar);
}

test.describe('Eksplorasi cross-browser — pasien', () => {
    test('TC-26 layout dashboard pasien tanpa overflow + screenshot', async ({ page }, testInfo) => {
        await page.goto('/patient/dashboard');
        await cekLayout(page, testInfo, 'dashboard-pasien');
    });

    test('TC-26 layout tren gula darah tanpa overflow + screenshot', async ({ page }, testInfo) => {
        await page.goto('/patient/blood-sugar/trend');
        await cekLayout(page, testInfo, 'tren-gula-darah');
    });

    test('TC-27 sync offline menolak data tanpa client_uuid (sesi + CSRF valid)', async ({ page }, testInfo) => {
        await page.goto('/patient/nutrition');
        await expect(page.locator('#app > *').first()).toBeVisible();

        // Kirim dari dalam halaman, seperti aplikasi asli: cookie sesi + token CSRF ikut
        const res = await page.evaluate(async () => {
            const cookie = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='));
            const xsrf = cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : '';
            const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;
            if (meta) headers['X-CSRF-TOKEN'] = meta;

            const r = await fetch('/patient/nutrition/sync-offline', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({ logs: [{ barcode: '8991001200000' }] }), // sengaja tanpa client_uuid
            });
            return { status: r.status, body: await r.text() };
        });

        testInfo.annotations.push({ type: 'Respons server', description: `${res.status}: ${res.body.slice(0, 300)}` });

        expect(res.status, 'Harus ditolak validasi (422), bukan 419 (CSRF) atau 302 (belum login)').toBe(422);
        expect(res.body, 'Pesan validasi harus menyebut client_uuid').toContain('client_uuid');
    });
});

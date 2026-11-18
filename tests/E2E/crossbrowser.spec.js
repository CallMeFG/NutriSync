import { test, expect } from '@playwright/test';

/**
 * Test eksplorasi cross-browser — halaman publik (tanpa login).
 *
 * TC-25 : passkey (WebAuthn) — API tersedia di semua browser, registrasi
 *         otomatis hanya bisa di Chromium (virtual authenticator via CDP).
 * TC-26 : layout halaman login tanpa overflow horizontal + screenshot pembanding.
 *
 * Dijalankan oleh project publik (chromium, firefox, webkit, Mobile Chrome, Mobile Safari).
 */

/** Cek konten tidak melebar melewati layar, lalu simpan screenshot sebagai evidence. */
async function cekLayout(page, testInfo, nama) {
    await page.waitForLoadState('load');
    await expect(page.locator('#app > *').first()).toBeVisible();

    const ukuran = await page.evaluate(() => ({
        lebarKonten: document.documentElement.scrollWidth,
        lebarLayar: window.innerWidth,
    }));

    // Screenshot per browser: dilampirkan di HTML report + disimpan untuk slide
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

test.describe('Eksplorasi cross-browser — publik', () => {
    test('TC-25 passkey (WebAuthn) dapat dibuat di browser ini', async ({ page, browserName }, testInfo) => {
        await page.goto('/login');

        // Langkah 1: API WebAuthn harus ada di semua browser modern
        const apiTersedia = await page.evaluate(() => typeof window.PublicKeyCredential === 'function');
        testInfo.annotations.push({ type: 'WebAuthn API', description: apiTersedia ? 'tersedia' : 'TIDAK tersedia' });
        expect(apiTersedia, 'window.PublicKeyCredential harus tersedia').toBe(true);

        // Langkah 2: virtual authenticator hanya bisa dipasang lewat CDP (khusus engine Chromium)
        test.skip(
            browserName !== 'chromium',
            `Virtual authenticator (CDP) tidak tersedia di ${browserName}; registrasi passkey tidak bisa diotomasi`,
        );

        const cdp = await page.context().newCDPSession(page);
        await cdp.send('WebAuthn.enable');
        await cdp.send('WebAuthn.addVirtualAuthenticator', {
            options: {
                protocol: 'ctap2',
                transport: 'internal',
                hasResidentKey: true,
                hasUserVerification: true,
                isUserVerified: true,
                automaticPresenceSimulation: true,
            },
        });

        // Langkah 3: buat kredensial passkey di origin aplikasi
        const tipe = await page.evaluate(async () => {
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    rp: { name: 'NutriSync', id: location.hostname },
                    user: {
                        id: crypto.getRandomValues(new Uint8Array(16)),
                        name: 'e2e@nutrisync.id',
                        displayName: 'E2E Test',
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
                    timeout: 10_000,
                },
            });
            return cred ? cred.type : null;
        });

        expect(tipe, 'Kredensial passkey harus berhasil dibuat').toBe('public-key');
    });

    test('TC-26 layout login tanpa overflow + screenshot', async ({ page }, testInfo) => {
        await page.goto('/login');
        await cekLayout(page, testInfo, 'login');
    });
});

import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright cross-browser untuk LATIHAN TESTING NutriSync.
 *
 * Keamanan:
 *  - Server dijalankan dengan NUTRISYNC_E2E=1 => Laravel HANYA memuat .env.e2e
 *    (DB `nutrisync_e2e`, MAIL_MAILER=log, WhatsApp/Gemini/Turnstile nonaktif).
 *  - Port 8010 (bukan 8000) & reuseExistingServer=false agar tes tidak pernah
 *    "menumpang" ke server dev yang memakai .env asli.
 *  - DB e2e di-reset (migrate:fresh --seed) di global-setup setiap run.
 */
const PORT = 8010;
const BASE_URL = `http://localhost:${PORT}`;
const PATIENT_STATE = 'tests/E2E/.auth/patient.json';
const CAREGIVER_STATE = 'tests/E2E/.auth/caregiver.json';

// Tes yang butuh login per role (dipilih lewat nama file)
const authed = /(patient|caregiver)\.spec\.js/;

const browsers = [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
];

export default defineConfig({
    testDir: './tests/E2E',
    globalSetup: './tests/E2E/global-setup.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // `php -S` single-threaded; batasi worker agar stabil & tidak kena throttle
    workers: process.env.CI ? 1 : 3,
    timeout: 45_000,
    expect: { timeout: 10_000 },
    reporter: [['list'], ['html', { outputFolder: './tests/playwright-report', open: 'never' }]],
    outputDir: './tests/test-results',
    use: {
        baseURL: BASE_URL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Service worker PWA bisa meng-cache respons antar tes => blokir
        serviceWorkers: 'block',
        locale: 'id-ID',
        timezoneId: 'Asia/Jakarta',
    },
    projects: [
        // Login sekali per role (alur UI + OTP demo), simpan sesi untuk semua browser
        { name: 'setup', testMatch: /auth\.setup\.js/, use: { ...devices['Desktop Chrome'] } },

        ...browsers.flatMap((b) => [
            { ...b, testIgnore: [authed, /auth\.setup\.js/] },
            {
                name: `${b.name} (patient)`,
                use: { ...b.use, storageState: PATIENT_STATE },
                testMatch: /patient\.spec\.js/,
                dependencies: ['setup'],
            },
            {
                name: `${b.name} (caregiver)`,
                use: { ...b.use, storageState: CAREGIVER_STATE },
                testMatch: /caregiver\.spec\.js/,
                dependencies: ['setup'],
            },
        ]),
    ],
    webServer: {
        // Laravel built-in server router, dijalankan dari folder public/
        command: `php -S localhost:${PORT} ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`,
        cwd: './public',
        env: { NUTRISYNC_E2E: '1' },
        url: `${BASE_URL}/up`,
        reuseExistingServer: false,
        timeout: 60_000,
        stdout: 'ignore',
        stderr: 'ignore',
    },
});

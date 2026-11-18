import { execSync } from 'node:child_process';

/**
 * Reset database E2E sebelum setiap run agar hasil deterministik
 * (juga me-reset limit OTP 3x/jam & cooldown per user).
 *
 * GUARD: hanya jalan bila konfigurasi yang termuat benar-benar .env.e2e
 * (DB `nutrisync_e2e`, mail=log, token WhatsApp kosong). Jika tidak, run dibatalkan
 * supaya DB dev `nutrisync` tidak pernah ikut terhapus.
 */
export default async function globalSetup() {
    const env = { ...process.env, NUTRISYNC_E2E: '1' };
    const run = (cmd) => execSync(cmd, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

    const probe = run(
        `php artisan tinker --execute="echo json_encode(['db'=>config('database.connections.mysql.database'),'mail'=>config('mail.default'),'wa'=>config('services.fonnte.token')]);"`,
    );
    const cfg = JSON.parse(probe.trim().split('\n').pop());

    if (cfg.db !== 'nutrisync_e2e' || cfg.mail !== 'log' || cfg.wa) {
        throw new Error(`[E2E guard] Konfigurasi tidak aman, run dibatalkan: ${JSON.stringify({ ...cfg, wa: cfg.wa ? '<terisi>' : '' })}`);
    }

    run('php artisan migrate:fresh --seed --force');
}

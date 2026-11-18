# Pengujian Cross-Browser dengan Playwright

Tugas kelompok **Kualitas dan Pengujian Perangkat Lunak** (pertemuan 12–13), Politeknik Caltex Riau.
Anggota: Farizal, David, Rahmadhani.

Fokus eksplorasi: **Cross-Browser Web Automation Testing** menggunakan **Playwright 1.61**.

## Ringkasan hasil

| Run | Eksekusi | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| Sebelum perbaikan | 147 | 139 | 7 | 1 |
| Sesudah perbaikan | 147 | 144 | 2 | 1 |

- **Bug ditemukan (TC-27):** endpoint `/patient/nutrition/sync-offline` membalas 200 HTML, bukan 422 JSON, saat data tidak valid. Akibatnya antrean offline bisa terhapus padahal data ditolak. Diperbaiki di `bootstrap/app.php` dengan menambahkan `$request->expectsJson()` pada aturan render error JSON.
- **Keterbatasan alat (TC-25):** API passkey (`PublicKeyCredential`) tidak tersedia di build WebKit Playwright untuk Windows, sehingga gagal di WebKit dan Mobile Safari. Ini bukan bug aplikasi.
- Test backend (Pest) tetap lolos 46/46 setelah perbaikan.

## Browser yang diuji

| Project | Engine | Perangkat |
| --- | --- | --- |
| chromium | Blink | Desktop Chrome |
| firefox | Gecko | Desktop Firefox |
| webkit | WebKit | Desktop Safari |
| Mobile Chrome | Blink | Pixel 5 (emulasi) |
| Mobile Safari | WebKit | iPhone 13 (emulasi) |

## Struktur file test

```
tests/E2E/
├── global-setup.js              # reset DB nutrisync_e2e + pengaman konfigurasi
├── auth.setup.js                # login pasien & caregiver sekali (UI + OTP demo), simpan sesi
├── public.spec.js               # TC-01 s/d TC-08: halaman publik & proteksi akses tamu
├── critical_flows.spec.js       # TC-09 s/d TC-11: landing PWA, dokumentasi API, sync offline (lama)
├── patient.spec.js              # TC-12 s/d TC-21: halaman pasien & RBAC
├── caregiver.spec.js            # TC-22 s/d TC-24: halaman caregiver & RBAC
├── crossbrowser.spec.js         # TC-25 passkey, TC-26 layout login
└── crossbrowser.patient.spec.js # TC-26 layout dashboard & tren, TC-27 sync offline (perbaikan TC-11)
playwright.config.js             # 5 browser, webServer port 8010, service worker diblokir
```

## Lingkungan uji yang aman

- Server test berjalan di port **8010** dengan `NUTRISYNC_E2E=1`, sehingga Laravel hanya memuat `.env.e2e`.
- Database terpisah `nutrisync_e2e`, di-reset (`migrate:fresh --seed`) setiap run.
- WhatsApp (Fonnte), email (SMTP), Gemini, dan Turnstile dimatikan. Email OTP ditulis ke log.
- `global-setup.js` membatalkan run jika konfigurasi tidak aman.

File `.env.e2e` tidak ikut di-commit. Buat sendiri dari `.env.example` dengan `DB_DATABASE=nutrisync_e2e`, `MAIL_MAILER=log`, dan kredensial layanan luar dikosongkan.

## Cara menjalankan

```bash
# 1. Install dependency & browser Playwright
npm install
npx playwright install

# 2. Build aset frontend
npm run build

# 3. Pastikan MySQL menyala dan database nutrisync_e2e sudah dibuat

# 4. Jalankan semua test di 5 browser
npx playwright test

# Hanya test eksplorasi cross-browser
npx playwright test crossbrowser

# Buka HTML report
npx playwright show-report tests/playwright-report
```

## Evidence

| Lokasi | Isi |
| --- | --- |
| `evidence/report-sebelum/` | HTML report run pertama (sebelum perbaikan) |
| `evidence/report-sesudah/` | HTML report run sesudah perbaikan |
| `hasil-run-sebelum.txt` | Output terminal run pertama |
| `hasil-run-sesudah.txt` | Output terminal run sesudah perbaikan |
| `tests/screenshots/` | 15 screenshot layout (3 halaman × 5 browser) dari TC-26 |

Buka report lama dengan `npx playwright show-report evidence/report-sebelum`.

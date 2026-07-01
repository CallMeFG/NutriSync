---
trigger: always_on
---

# Backend Rules — NutriSync (Laravel 13)

Berlaku untuk semua file di `app/`, `routes/`, `database/`, `config/`, `bootstrap/`. Rujukan detail lengkap: `docs/NutriSync_Blueprint_Teknis_v1.md` bagian 4–12.

## Struktur & Registrasi

- Laravel 13 TIDAK punya `app/Http/Kernel.php`. Middleware alias & middleware group didaftarkan di `bootstrap/app.php` via `->withMiddleware()`. Jangan pernah membuat/mencari `Kernel.php`.
- Exception handling custom didaftarkan di `bootstrap/app.php` via `->withExceptions()`, bukan `app/Exceptions/Handler.php`.
- Service Provider custom tetap di `app/Providers/`, didaftarkan lewat `bootstrap/providers.php` (bukan `config/app.php`).

## Lapisan Tanggung Jawab (jangan dicampur)

| Lapisan | Boleh berisi | Tidak boleh berisi |
|---|---|---|
| Model | Relasi, cast, accessor sederhana | Logic kalkulasi risiko, HTTP call, notifikasi |
| Controller | Orkestrasi: panggil Form Request → Service → return response | Query kompleks langsung, logic bisnis, validasi manual |
| Service (`app/Services/`) | Logic bisnis inti, kalkulasi, integrasi API eksternal | Akses `$request` langsung, return Inertia response |
| Form Request | Validasi + otorisasi request | Logic bisnis |
| Job (`app/Jobs/`) | Task async (kirim WhatsApp, dll), harus `ShouldQueue` | Dipanggil sync di controller |

Kalkulasi risiko diabetes SELALU lewat `AIPredictorService`, tidak pernah ditulis ulang di controller lain.

## Database & Migration

- Urutan migration wajib: `users` → `patients` → (`blood_sugar_logs`, `nutrition_logs`, `ai_risk_snapshots`, `caregiver_patient`) → `rewards` → `reward_claims`. Foreign key gagal kalau tabel induk belum ada.
- `blood_sugar_logs` WAJIB punya kolom `client_uuid` (unique) — dipakai untuk idempotency saat sinkronisasi data offline. Insert lewat `firstOrCreate(['client_uuid' => $uuid], [...])`, jangan `create()` polos.
- `nutrition_logs.result_status` disimpan permanen saat scan terjadi — JANGAN dihitung ulang saat data lama ditampilkan. Ambang batas personal (`daily_sugar_limit_g`) berubah seiring waktu; riwayat lama harus tetap merefleksikan kondisi saat itu.
- Kolom usia TIDAK disimpan statis — selalu hitung dari `birth_date` via accessor (`Patient::age()`), supaya tidak butuh cron job harian untuk update.
- Field angka medis: `weight_kg decimal(5,2)`, `height_cm decimal(5,2)`, `glucose_level unsignedSmallInteger`. Jangan pakai tipe yang lebih longgar tanpa alasan.
- Index wajib: `patient_id + measurement_time` di `blood_sugar_logs`, `patient_id + scanned_at` di `nutrition_logs`, `role` di `users`, `current_risk_status` di `patients` (dipakai dashboard agregat faskes).
- Setelah membuat migration baru, jalankan `php artisan migrate` sebelum lanjut ke Model — jangan tumpuk beberapa migration belum-teruji sekaligus.

## RBAC & Keamanan (paling kritis, data medis)

- 3 role: `patient`, `caregiver`, `faskes_admin` — via enum `App\Enums\UserRole`, kolom `users.role`.
- Middleware route WAJIB urutan `['auth', 'role:xxx']`, bukan `['role:xxx']` saja.
- Setiap controller method yang menerima resource bertipe `Patient` dari route model binding WAJIB memanggil `$this->authorize('view', $patient)` (via `PatientPolicy`) — mencegah caregiver A mengakses data anak B lewat manipulasi URL (IDOR).
- Middleware alias didaftarkan di `bootstrap/app.php`, class implementasi di `app/Http/Middleware/EnsureRole.php`.
- Semua Form Request WAJIB validasi ulang range angka medis di server, walau sudah divalidasi di React:
  - `glucose_level`: integer, 20–600
  - `weight_kg`: numeric, 20–200
  - `height_cm`: numeric, 100–220
  - `birth_date`: date, realistis untuk remaja (maks ~30 tahun ke belakang)
- Password: pakai cast `'password' => 'hashed'` di Model `User`. JANGAN panggil `Hash::make()` manual di controller kalau sudah pakai cast ini — akan double-hash dan user tidak bisa login.

## Service Layer — Aturan Spesifik

- `RiskThresholdService`: satu-satunya tempat baca ambang batas glukosa dari `config('nutrisync.glucose_thresholds')`. Jangan hardcode angka 70/100/126 di tempat lain.
- `AIPredictorService::updatePatientStatusAndNotify()` adalah SATU-SATUNYA titik yang boleh mengubah `patient.current_risk_status` dan dispatch job notifikasi. Semua alur yang bisa mengubah status risiko (scan produk, input gula darah) harus lewat method ini, bukan duplikasi logic sendiri-sendiri.
- Formula kalkulasi `daily_sugar_limit_g` bersifat rule-based/deterministik (BMI, riwayat keluarga, rata-rata konsumsi 7 hari) — JANGAN gantungkan angka final ke LLM call yang bisa gagal/timeout. LLM (kalau dipakai) hanya untuk narasi rekomendasi, bukan angka kritis.
- Hasil kalkulasi limit WAJIB dibungkus `max(nilai_minimum, ...)` — jangan sampai hasilnya 0 atau negatif.
- `OpenFoodFactsService::lookup()`: WAJIB `->timeout(5)`, tangkap `ConnectionException` secara eksplisit, return `null` (bukan throw) supaya controller bisa fallback ke form input manual.
- `WhatsAppService::sendEmergencyAlert()`: pesan darurat WAJIB pakai message template yang sudah disetujui Meta (`type: template`), bukan free-form text — free-form hanya valid dalam window 24 jam customer-initiated yang tidak berlaku untuk notifikasi darurat business-initiated ini. Normalisasi nomor telepon ke format `62xxxxxxxxxx` (tanpa `+`, tanpa awalan `0`) sebelum dikirim.

## Jobs & Queue

- Semua panggilan WhatsApp API WAJIB lewat Job (`ShouldQueue`), tidak pernah dipanggil sync di controller/service saat request berlangsung.
- `.env`: `QUEUE_CONNECTION` harus `database` atau `redis`. `sync` dilarang di production — itu membuat job "async" jadi blocking sungguhan.
- Job WAJIB set `$tries` dan `$backoff`, plus method `failed()` yang log ke `Log::critical()` — job gagal permanen tidak boleh senyap begitu saja.
- Jalankan `php artisan queue:failed-table && php artisan migrate` di awal setup, bukan setelah insiden terjadi.

## Konfigurasi

- Ambang batas medis, default sugar limit, interval recalculation → semua di `config/nutrisync.php`, satu sumber kebenaran. Jangan hardcode di Service/Controller.
- Kredensial eksternal (OpenFoodFacts, WhatsApp, AI provider, SATUSEHAT) → `config/services.php`, dibaca dari `.env`. Jangan pernah hardcode API key di kode.
- Set `APP_TIMEZONE=Asia/Jakarta` di `.env` — default UTC akan membuat `measurement_time`/`scanned_at` salah zona.

## Sebelum Commit (Backend)
- [ ] `vendor/bin/pint` dijalankan
- [ ] Tidak ada N+1 query baru (cek eager-load `with()` di query List/Dashboard)
- [ ] Endpoint baru dengan resource route-model-binding sudah pakai `authorize()`
- [ ] Field medis baru punya validasi range di Form Request
- [ ] Tidak ada logic bisnis yang "bocor" ke Controller atau Model
- [ ] Test Pest ditambahkan untuk service/endpoint baru
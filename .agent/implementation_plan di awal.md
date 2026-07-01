# NutriSync — Implementation Plan (Master Plan)

> **Status:** Pemanasan selesai. Dokumen ini adalah rencana eksekusi strategis setelah membaca semua file `.md` di `.agent/`.

---

## 📌 Ringkasan Proyek

**NutriSync** adalah PWA (Progressive Web App) untuk deteksi dini risiko diabetes pada **remaja Indonesia (10–24 tahun)**. Dibangun untuk kompetisi **KMIPN VIII 2026**.

**Fokus tunggal:** Diabetes — **TIDAK ada** fitur stunting, **TIDAK ada** target pengguna lansia.

---

## 🛠️ Stack Definitif

| Layer | Teknologi | Versi |
|---|---|---|
| Backend | Laravel | 13.x (PHP 8.3+) |
| Frontend | React 18 + Inertia.js v2 | - |
| Styling | Tailwind CSS 3 + shadcn/ui | - |
| DB (dev) | MySQL 8 | Laragon local |
| Build | Vite 5 + vite-plugin-pwa | - |
| Barcode | html5-qrcode | ^2.3 |
| Offline | Dexie.js (IndexedDB) | ^4.0 |
| Notifikasi | WhatsApp Cloud API (Meta) | Graph API v20+ |
| Queue | Laravel Queue (`database` driver) | - |

> [!IMPORTANT]
> Laravel 13 **TIDAK punya `app/Http/Kernel.php`**. Semua middleware alias & exception handling didaftarkan di `bootstrap/app.php`. Ini adalah perbedaan paling kritis dari Laravel sebelumnya.

---

## 🚧 Status Proyek Saat Ini

**Kondisi:** Project belum dibuat (hanya folder kosong dengan dokumentasi `.agent/`).
**Target eksekusi:** Membangun dari nol mengikuti urutan blueprint.

---

## ⚠️ Hal Kritis yang Perlu User Selesaikan Secara Manual (Non-Coding)

> [!WARNING]
> Item-item berikut **tidak bisa dikerjakan oleh AI** — harus diselesaikan tim secara manual SEBELUM fitur tertentu bisa berjalan.

| # | Item | Urgency | Blokir Fitur |
|---|---|---|---|
| 1 | Daftar Meta Developer + WhatsApp Business API, generate Phone Number ID & Access Token | 🔴 Tinggi | Family Sync (Notifikasi Darurat) |
| 2 | Submit template pesan `nutrisync_emergency_alert` ke Meta (proses review 1–3 hari) | 🔴 Tinggi | WhatsApp alert tidak bisa dikirim tanpa template disetujui |
| 3 | API Key AI (Anthropic/OpenAI) untuk narasi rekomendasi LLM | 🟡 Sedang | AIPredictorService (kalkulasi angka tetap jalan tanpa LLM, hanya narasi yang terpengaruh) |
| 4 | Domain + SSL untuk demo (atau ngrok/Cloudflare Tunnel) | 🔴 Tinggi | Kamera barcode tidak bisa diakses di HP fisik tanpa HTTPS |
| 5 | Logo & icon PWA (min 192×192px & 512×512px + maskable) | 🟡 Sedang | Prompt "Add to Home Screen" tidak muncul |
| 6 | Validasi ambang batas gula harian (25g/hari) dengan ahli gizi | 🟡 Sedang | Keabsahan medis angka default |
| 7 | Siapkan HP Android + (opsional) iPhone untuk testing kamera | 🟢 Rendah | Testing offline & barcode scanner |

---

## 🗺️ Urutan Implementasi (11 Fase)

### Fase 1: Setup Project + Environment
**Blueprint:** §1–3, §8

#### File yang akan dibuat/dimodifikasi:
- `[NEW]` Project Laravel 13 via `composer create-project`
- `[MODIFY]` `.env` — template lengkap (APP_TIMEZONE, QUEUE_CONNECTION=database, kredensial API)
- `[NEW]` `config/nutrisync.php` — satu sumber kebenaran ambang batas glukosa
- `[MODIFY]` `config/services.php` — kredensial OpenFoodFacts & WhatsApp
- `[MODIFY]` `vite.config.js` — konfigurasi PWA + VitePWA plugin
- `[MODIFY]` `bootstrap/app.php` — registrasi middleware alias `role` + `HandleInertiaRequests`

**Perintah kunci:**
```bash
composer create-project laravel/laravel nutrisync
composer require laravel/breeze --dev
php artisan breeze:install react
npm install html5-qrcode dexie recharts axios
npm install -D vite-plugin-pwa
```

**Antisipasi masalah:**
- `DB_HOST=127.0.0.1` (bukan `localhost`) di Windows/Laragon
- `APP_TIMEZONE=Asia/Jakarta` WAJIB diisi

---

### Fase 2: Migration Database (Lengkap)
**Blueprint:** §4

**Urutan migration WAJIB** (karena foreign key dependency):
1. `users` — tambah kolom `role` enum + index
2. `patients` — FK ke users, kolom medis, `pairing_code`, `daily_sugar_limit_g`
3. `blood_sugar_logs` — kolom `client_uuid` WAJIB unique (untuk idempotency offline sync)
4. `nutrition_logs` — `result_status` disimpan permanen (tidak dihitung ulang)
5. `ai_risk_snapshots` — snapshot audit kalkulasi AI
6. `caregiver_patient` — pivot table, unique `[patient_id, caregiver_id]`
7. `rewards` + `reward_claims`
8. `jobs` table (untuk queue) — `php artisan queue:table && migrate`
9. `failed_jobs` table — `php artisan queue:failed-table && migrate`

> [!CAUTION]
> Jangan tumpuk migration yang belum diuji. Jalankan `php artisan migrate` setelah setiap batch migration sebelum melanjutkan ke Model.

---

### Fase 3: Models + Enums
**Blueprint:** §5

#### File:
- `[NEW]` `app/Enums/UserRole.php` — `patient`, `caregiver`, `faskes_admin`
- `[NEW]` `app/Enums/RiskStatus.php` — `aman`, `waspada`, `bahaya` + method `color()`
- `[MODIFY]` `app/Models/User.php` — cast `role => UserRole::class`, `password => 'hashed'`
- `[NEW]` `app/Models/Patient.php` — accessor `age()` dinamis dari `birth_date`, method `needsRiskRecalculation()`
- `[NEW]` `app/Models/BloodSugarLog.php`
- `[NEW]` `app/Models/NutritionLog.php`
- `[NEW]` `app/Models/AiRiskSnapshot.php`
- `[NEW]` `app/Models/CaregiverPatient.php`
- `[NEW]` `app/Models/Reward.php` + `RewardClaim.php`

**Rule kritis:**
- `'password' => 'hashed'` di cast — JANGAN panggil `Hash::make()` manual (double-hash)
- Usia TIDAK disimpan sebagai kolom statis — dihitung via accessor `Carbon::parse($birth_date)->age`
- Logic bisnis ZERO di Model — hanya relasi, cast, accessor sederhana

---

### Fase 4: Auth + RegisterController Custom
**Blueprint:** §10

#### File:
- `[MODIFY]` `app/Http/Controllers/Auth/RegisterController.php` — generate `pairing_code` dengan retry loop (anti race condition)
- `[NEW]` `app/Http/Controllers/Auth/LoginController.php`
- `[NEW]` `app/Http/Controllers/Auth/PairingController.php`
- `[NEW]` `resources/js/Pages/Auth/Register.jsx`
- `[NEW]` `resources/js/Pages/Auth/Login.jsx`
- `[NEW]` `resources/js/Pages/Auth/Pairing.jsx`

**Antisipasi:** `pairing_code` generate pakai retry loop 5x dengan catch `QueryException` — bukan generate sekali asumsikan unik.

---

### Fase 5: Middleware Role + RBAC Policy
**Blueprint:** §8

#### File:
- `[NEW]` `app/Http/Middleware/EnsureRole.php`
- `[MODIFY]` `app/Http/Middleware/HandleInertiaRequests.php` — share `auth.user` + `flash` ke frontend
- `[MODIFY]` `bootstrap/app.php` — daftarkan alias `role => EnsureRole::class` + append `HandleInertiaRequests` ke web group
- `[NEW]` `app/Policies/PatientPolicy.php` — cegah IDOR (caregiver A akses data anak B)
- `[MODIFY]` `app/Providers/AppServiceProvider.php` — `Gate::policy(Patient::class, PatientPolicy::class)`

**Rule kritis:**
- Urutan middleware WAJIB: `['auth', 'role:patient']` — BUKAN `['role:patient']` saja
- Setiap controller yang terima `{patient}` dari route WAJIB panggil `$this->authorize('view', $patient)`

---

### Fase 6: Routes
**Blueprint:** §7

#### File:
- `[MODIFY]` `routes/web.php` — grouping role lengkap (guest, auth, patient, caregiver, faskes_admin, webhook)

**Poin kritis:**
- Route webhook WhatsApp WAJIB `withoutMiddleware(['web'])` — META POST ke webhook tidak punya CSRF token
- Prefix: patient → `/app/...`, caregiver → `/family/...`, faskes → `/faskes/...`

---

### Fase 7: Service Layer (Urutan Wajib)
**Blueprint:** §11

> [!IMPORTANT]
> Urutan pembuatan service WAJIB diikuti karena dependensi: `RiskThresholdService` → `AIPredictorService` → `OpenFoodFactsService` → `WhatsAppService`

#### File:
1. `[NEW]` `app/Services/RiskThresholdService.php` — classifyGlucose() baca dari `config('nutrisync.glucose_thresholds')` — ZERO hardcode angka
2. `[NEW]` `app/Services/AIPredictorService.php`
   - `recalculatePersonalization()` — formula rule-based (BMI + family history), bungkus dengan `max(10, ...)` agar tidak negatif
   - `scoreProduct()` — scoring kontribusi gula ke batas harian
   - `evaluateGlucoseReading()` — klasifikasi glukosa
   - `updatePatientStatusAndNotify()` (private) — **SATU titik terpusat** trigger Family Sync
3. `[NEW]` `app/Services/OpenFoodFactsService.php` — `->timeout(5)`, catch `ConnectionException`, return `null` (bukan throw)
4. `[NEW]` `app/Services/WhatsAppService.php` — template message WAJIB, normalisasi nomor `62xxxxxxxxxx`

---

### Fase 8: Form Requests + Controllers
**Blueprint:** §9–10

#### Form Requests:
- `[NEW]` `app/Http/Requests/Patient/StoreBloodSugarLogRequest.php` — validasi `glucose_level: 20-600`, `client_uuid: uuid`
- `[NEW]` `app/Http/Requests/Patient/StoreProfileRequest.php` — range medis realistis
- `[NEW]` `app/Http/Requests/Patient/StoreScanRequest.php`
- `[NEW]` `app/Http/Requests/Caregiver/PairPatientRequest.php`

#### Controllers:
- `[NEW]` `app/Http/Controllers/Patient/DashboardController.php` — kirim props server-side (tidak perlu axios tambahan)
- `[NEW]` `app/Http/Controllers/Patient/ScanController.php` — alur: barcode → OFF lookup → fallback manual → scoreProduct
- `[NEW]` `app/Http/Controllers/Patient/BloodSugarLogController.php` — `firstOrCreate(['client_uuid' => ...])` untuk idempotency
- `[NEW]` `app/Http/Controllers/Patient/AnalyticsController.php` — eager-load relasi (anti N+1)
- `[NEW]` `app/Http/Controllers/Patient/RewardController.php`
- `[NEW]` `app/Http/Controllers/Caregiver/FamilySyncController.php`
- `[NEW]` `app/Http/Controllers/Faskes/AdminDashboardController.php`

---

### Fase 9: Jobs & Queue
**Blueprint:** §12

#### File:
- `[NEW]` `app/Jobs/SendFamilySyncAlert.php`
  - `implements ShouldQueue`
  - `$tries = 3`, `$backoff = 30`
  - method `failed()` → `Log::critical(...)` — WAJIB tidak silent
- Setup `php artisan queue:table && migrate` + `php artisan queue:failed-table && migrate`

> [!WARNING]
> `QUEUE_CONNECTION=sync` di `.env` DILARANG untuk production. Harus `database` atau `redis`.

---

### Fase 10: Frontend Pages + Components
**Blueprint:** §13

#### Struktur folder (wajib diikuti):
```
resources/js/
├── app.jsx
├── Layouts/
│   ├── PatientLayout.jsx
│   ├── CaregiverLayout.jsx
│   └── FaskesLayout.jsx
├── Pages/
│   ├── Auth/ (Login, Register, Pairing)
│   ├── Patient/ (Dashboard, Scanner, Analytics, Rewards)
│   ├── Caregiver/ (FamilySyncDashboard)
│   └── Faskes/ (AdminDashboard)
├── Components/
│   ├── RiskStatusBadge.jsx   — warna konsisten: aman=#22C55E, waspada=#EAB308, bahaya=#EF4444
│   ├── ScannerCamera.jsx     — WAJIB cleanup useEffect, facingMode:'environment'
│   ├── ActionFab.jsx         — thumb zone (area bawah layar)
│   └── TrendLineChart.jsx
└── lib/
    ├── offlineQueue.js       — Dexie.js, BUKAN localStorage
    └── axios.js
```

**Prinsip kunci frontend:**
- Data render awal: WAJIB dari server props (Inertia), bukan `axios.get()` di `useEffect`
- Link internal: WAJIB pakai `route('nama.route')` via Ziggy, bukan string URL hardcode
- Pasca-submit form penting: `router.visit(url, { preserveScroll: true, preserveState: false })`

---

### Fase 11: PWA Config + Offline Sync
**Blueprint:** §3, §14

**Diimplementasikan paling akhir** karena bergantung pada semua endpoint sudah stabil.

#### File:
- `[MODIFY]` `vite.config.js` — VitePWA: `registerType: 'autoUpdate'`, workbox `navigateFallbackDenylist` exclude `/faskes/` & `/caregiver/`
- `[NEW]` `resources/js/lib/offlineQueue.js` — Dexie.js, `client_uuid = crypto.randomUUID()`
- Icon PWA: `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- `[MODIFY]` `resources/views/app.blade.php` — `@routes` SEBELUM `@vite`

---

## 🧪 Testing (Paralel dengan Setiap Fitur)
**Blueprint:** §16

Minimal yang wajib ada:
| File | Coverage |
|---|---|
| `Auth/RegistrationTest.php` | pairing_code unik meski paralel |
| `Patient/BloodSugarLogTest.php` | validasi range 20-600, client_uuid dedup |
| `Patient/ScanTest.php` | mock OpenFoodFacts gagal → fallback manual |
| `Patient/RiskCalculationTest.php` | BMI tinggi → limit lebih ketat |
| `FamilySync/AlertDispatchTest.php` | status Bahaya → job ter-dispatch (Queue::fake()) |
| `Policy/PatientPolicyTest.php` | caregiver A TIDAK bisa lihat data patient B (403) |

---

## 🚦 Checklist Sebelum Task Dianggap Selesai

- [ ] `vendor/bin/pint` dijalankan (PHP PSR-12)
- [ ] Tidak ada N+1 query baru (eager-load eksplisit)
- [ ] Semua endpoint yang terima `{patient}` dari route sudah `$this->authorize()`
- [ ] Field medis baru punya validasi range di Form Request
- [ ] Test Pest ditambahkan (minimal happy path + 1 edge case)
- [ ] Tidak ada kredensial/API key ter-commit
- [ ] Tidak ada `localStorage/sessionStorage` untuk data offline medis
- [ ] Tidak ada hardcode angka ambang batas glukosa (70/100/126) — semua dari `config/nutrisync.php`

---

## 🔑 Aturan Non-Negosiabel (Wajib Dipatuhi Sepanjang Eksekusi)

1. **No Kernel.php** — Semua middleware di `bootstrap/app.php`
2. **No logic bisnis di Model/Controller** — Semua di `app/Services/`
3. **No sync WhatsApp** — Semua notifikasi via Job queue
4. **No localStorage** untuk data offline — Semua pakai Dexie.js
5. **No hardcode threshold** — Semua dari `config/nutrisync.php`
6. **No VITE_ prefix** untuk API key — Akan ter-bundle ke JS publik
7. **No stunting features** — Fokus tunggal diabetes
8. **Always `firstOrCreate`** untuk blood_sugar_logs (idempotency)
9. **Always `->timeout()` + try-catch** untuk semua HTTP client eksternal
10. **Always `$this->authorize()`** untuk semua controller method yang terima `{patient}`

---

## 📋 Urutan Eksekusi Session Ini

Berdasarkan blueprint §17 "Ringkasan Prioritas Implementasi", berikut urutan yang akan diikuti saat user meminta eksekusi:

```
Phase 1  → Setup Project + .env + bootstrap/app.php + vite.config.js
Phase 2  → Migration (lengkap, urutan dependency-safe)
Phase 3  → Models + Enums
Phase 4  → Auth + RegisterController Custom + Pairing
Phase 5  → Middleware role + Policy (RBAC)
Phase 6  → Routes (web.php lengkap)
Phase 7  → Service Layer (RiskThreshold → AIPredictor → OpenFoodFacts → WhatsApp)
Phase 8  → Form Requests + Controllers per fitur
Phase 9  → Jobs & Queue worker setup
Phase 10 → Frontend Pages + Components (Inertia/React)
Phase 11 → PWA config + Offline Sync (paling akhir)
         → Testing (Pest) — idealnya paralel tiap fase
```

---

## ✅ Keputusan Final (Confirmed)

| # | Keputusan | Detail |
|---|---|---|
| 1 | Build dari nol | `composer create-project` → Breeze react → deps → migrate |
| 2 | Skip LLM, rule-based only | `AIPredictorService` pakai formula deterministik. `AI_PROVIDER` di `.env` dikosongkan |
| 3 | Custom `EnsureRole` + enum `UserRole` | Tidak pakai `spatie/laravel-permission` |
| 4 | WhatsApp mock/placeholder | `WhatsAppService` defensif — kalau token kosong, log warning + skip (tidak crash) |
| 5 | Tambah `phone_number` ke `users` migration | `string, nullable`, format E.164 tanpa `+`. Mutator normalisasi input. Wajib diisi saat registrasi `caregiver` |
| 6 | Eksekusi Phase 1–5 sesi ini | Setup → Migration → Models → Auth → RBAC. Stop sebelum Service layer |

## 🎯 Scope Sesi Ini: Phase 1–5

```
✅ Phase 1  → Setup project + .env + bootstrap/app.php + vite.config.js
✅ Phase 2  → Migration lengkap (termasuk phone_number fix)
✅ Phase 3  → Models + Enums
✅ Phase 4  → Auth + RegisterController Custom + Pairing flow
✅ Phase 5  → Middleware role + PatientPolicy (RBAC)
⏸️ Phase 6+ → Ditunda. Stop & lapor sebelum Service layer
```

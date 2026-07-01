# NutriSync — Blueprint Teknis Implementasi (Coding Specification)
**Versi Dokumen:** 1.0 — Turunan teknis dari `NutriSync_Rancangan_Sistem_v3.docx`
**Tujuan:** Dokumen ini adalah instruksi implementasi kode, BUKAN dokumen konsep. Setiap bagian ditulis agar AI coding agent (atau developer) dapat langsung mengeksekusi tanpa menebak-nebak keputusan teknis. Ikuti urutan bab secara berurutan karena ada dependensi (migration → model → route → controller → view).

**Stack Definitif (jangan diganti tanpa alasan kuat):**
| Layer | Teknologi | Versi Target |
|---|---|---|
| Backend | Laravel | 13.x (PHP 8.3+) |
| Frontend | React 18 + Inertia.js v2 | via `@inertiajs/react` |
| Styling | Tailwind CSS 3 + shadcn/ui | - |
| Database (dev) | MySQL 8 | - |
| Database (prod, opsional) | PostgreSQL 16 + pgvector | - |
| Build Tool | Vite 5 + `vite-plugin-pwa` | - |
| Barcode Scanner | `html5-qrcode` (npm) | ^2.3 |
| AI Layer | Laravel AI SDK (`laravel/ai` jika tersedia) fallback: HTTP client ke LLM provider | - |
| Notifikasi | WhatsApp Cloud API (Meta) | Graph API v20+ |
| Queue | Laravel Queue (database/redis driver) | - |

> ⚠️ **Catatan penting Laravel 11+/13**: struktur skeleton baru **tidak lagi punya** `app/Http/Kernel.php`. Middleware, route service provider, dan exception handler didaftarkan di **`bootstrap/app.php`**. Semua contoh middleware di dokumen ini mengikuti struktur baru tersebut. Jangan mencari/membuat `Kernel.php` — itu akan menyebabkan file tidak pernah ter-load.

---

## 0. Struktur Folder Proyek (Target Akhir)

```
nutrisync/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── RegisterController.php
│   │   │   │   └── PairingController.php
│   │   │   ├── Patient/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ScanController.php
│   │   │   │   ├── BloodSugarLogController.php
│   │   │   │   ├── AnalyticsController.php
│   │   │   │   └── RewardController.php
│   │   │   ├── Caregiver/
│   │   │   │   └── FamilySyncController.php
│   │   │   └── Faskes/
│   │   │       └── AdminDashboardController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureRole.php
│   │   │   └── HandleInertiaRequests.php
│   │   ├── Requests/
│   │   │   ├── Patient/
│   │   │   │   ├── StoreProfileRequest.php
│   │   │   │   ├── StoreBloodSugarLogRequest.php
│   │   │   │   └── StoreScanRequest.php
│   │   │   └── Caregiver/
│   │   │       └── PairPatientRequest.php
│   │   └── Resources/
│   │       ├── PatientResource.php
│   │       └── RiskStatusResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Patient.php
│   │   ├── BloodSugarLog.php
│   │   ├── NutritionLog.php
│   │   ├── AiRiskSnapshot.php
│   │   ├── CaregiverPatient.php
│   │   ├── Reward.php
│   │   └── RewardClaim.php
│   ├── Policies/
│   │   └── PatientPolicy.php
│   ├── Services/
│   │   ├── AIPredictorService.php
│   │   ├── OpenFoodFactsService.php
│   │   ├── WhatsAppService.php
│   │   └── RiskThresholdService.php
│   ├── Jobs/
│   │   └── SendFamilySyncAlert.php
│   ├── Enums/
│   │   ├── UserRole.php
│   │   └── RiskStatus.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
│   └── app.php                      # middleware alias & exception handling didaftarkan di sini
├── config/
│   ├── services.php                 # kredensial OpenFoodFacts & WhatsApp
│   └── nutrisync.php                # konfigurasi custom ambang batas default
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── js/
│   │   ├── app.jsx                  # entry point Inertia
│   │   ├── Layouts/
│   │   │   ├── PatientLayout.jsx
│   │   │   ├── CaregiverLayout.jsx
│   │   │   └── FaskesLayout.jsx
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Pairing.jsx
│   │   │   ├── Patient/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Scanner.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── Rewards.jsx
│   │   │   ├── Caregiver/
│   │   │   │   └── FamilySyncDashboard.jsx
│   │   │   └── Faskes/
│   │   │       └── AdminDashboard.jsx
│   │   ├── Components/
│   │   │   ├── RiskStatusBadge.jsx
│   │   │   ├── ScannerCamera.jsx
│   │   │   ├── ActionFab.jsx
│   │   │   └── TrendLineChart.jsx
│   │   └── lib/
│   │       ├── offlineQueue.js      # IndexedDB (Dexie) untuk offline blood sugar log
│   │       └── axios.js
│   ├── css/
│   │   └── app.css
│   └── views/
│       └── app.blade.php            # root blade shell untuk Inertia
├── routes/
│   └── web.php
├── public/
│   ├── manifest.webmanifest         # digenerate vite-plugin-pwa, jangan edit manual
│   └── sw.js                        # digenerate otomatis
├── vite.config.js
├── package.json
├── composer.json
└── .env
```

---

## 1. Instalasi & Setup Awal (Urutan Perintah Wajib)

```bash
# 1. Buat project Laravel 13 dengan starter kit Inertia + React
composer create-project laravel/laravel nutrisync
cd nutrisync
composer require laravel/breeze --dev
php artisan breeze:install react
# Pilih: Dark mode support? (opsional) | Testing framework: Pest

# 2. Install dependency backend tambahan
composer require laravel/sanctum        # jika butuh token API terpisah (mobile future)
composer require guzzlehttp/guzzle       # HTTP client ke OpenFoodFacts & WhatsApp
composer require spatie/laravel-permission  # ALTERNATIF RBAC jika enum role dirasa kurang fleksibel (opsional, lihat catatan bagian 8)

# 3. Install dependency frontend tambahan
npm install
npm install html5-qrcode dexie recharts axios
npm install -D vite-plugin-pwa

# 4. Setup database
cp .env.example .env
php artisan key:generate
# --> edit .env sesuai bagian 2 dokumen ini
php artisan migrate

# 5. Jalankan dev server (2 terminal terpisah)
php artisan serve
npm run dev
```

### ⚠️ Antisipasi Kesalahan Umum di Tahap Ini
| Masalah | Penyebab | Solusi |
|---|---|---|
| `php artisan breeze:install react` gagal / package tidak ditemukan | Composer belum resolve versi Breeze yang kompatibel dengan Laravel 13 | Jalankan `composer require laravel/breeze --dev` dulu tanpa versi, biarkan composer resolve versi terbaru yang compatible |
| Setelah migrate, error `SQLSTATE[HY000] [2002] Connection refused` | MySQL service belum jalan, atau `DB_HOST` salah (harus `127.0.0.1` bukan `localhost` di beberapa environment Windows/Laragon) | Pastikan service MySQL aktif; ganti `DB_HOST=127.0.0.1` |
| `npm run dev` tidak mendeteksi perubahan Blade/React | `vite.config.js` belum mendaftarkan `refresh: true` pada plugin Laravel | Lihat konfigurasi di bagian 3 |

---

## 2. Environment Variables (`.env`) — Template Lengkap

```env
APP_NAME=NutriSync
APP_ENV=local
APP_KEY=                      # digenerate otomatis oleh php artisan key:generate — JANGAN hardcode manual
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta      # WAJIB diisi, default UTC akan membuat measurement_time salah zona
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutrisync
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database       # WAJIB "database" atau "redis", JANGAN "sync" di production
                                 # karena WhatsApp alert harus async (lihat bagian 12)
SESSION_DRIVER=database
SESSION_LIFETIME=120

# --- OpenFoodFacts (tidak butuh API key, tapi WAJIB set User-Agent sesuai kebijakan mereka) ---
OFF_API_BASE_URL=https://world.openfoodfacts.org/api/v2
OFF_USER_AGENT="NutriSync/1.0 (KMIPN VIII 2026; contact: tim@nutrisync.app)"

# --- WhatsApp Cloud API (Meta) ---
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_NAME_EMERGENCY=nutrisync_emergency_alert   # nama template WABA yang SUDAH disetujui Meta

# --- AI Layer (LLM Provider untuk AIPredictorService) ---
AI_PROVIDER=anthropic            # atau openai, sesuaikan Laravel AI SDK yang dipakai
AI_API_KEY=
AI_MODEL=claude-sonnet-4-6

# --- SATUSEHAT (opsional/roadmap, TIDAK wajib diisi untuk MVP) ---
SATUSEHAT_CLIENT_ID=
SATUSEHAT_CLIENT_SECRET=
SATUSEHAT_BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id
```

### `config/services.php` (tambahkan blok berikut)
```php
return [
    // ...konfigurasi bawaan Laravel di atas tetap ada...

    'openfoodfacts' => [
        'base_url'   => env('OFF_API_BASE_URL'),
        'user_agent' => env('OFF_USER_AGENT'),
    ],

    'whatsapp' => [
        'phone_number_id'  => env('WHATSAPP_PHONE_NUMBER_ID'),
        'access_token'     => env('WHATSAPP_ACCESS_TOKEN'),
        'verify_token'     => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
        'template_emergency' => env('WHATSAPP_TEMPLATE_NAME_EMERGENCY'),
    ],

    'satusehat' => [
        'client_id'     => env('SATUSEHAT_CLIENT_ID'),
        'client_secret' => env('SATUSEHAT_CLIENT_SECRET'),
        'base_url'      => env('SATUSEHAT_BASE_URL'),
    ],
];
```

### `config/nutrisync.php` (file baru — ambang batas default sebelum personalisasi AI aktif)
```php
<?php
// Nilai default ini dipakai SEBELUM profil remaja lengkap (lihat Edge Case "Data Profil Belum Lengkap")
return [
    'default_daily_sugar_limit_g' => 25, // gram/hari, rujukan WHO untuk remaja
    'risk_recalc_interval_days'   => 30,
    'glucose_thresholds' => [
        // Sumber: PERKENI 2024 & ADA — JANGAN ubah angka ini tanpa rujukan medis baru
        'aman'    => ['min' => 70,  'max' => 99],
        'waspada' => ['min' => 100, 'max' => 125],
        'bahaya'  => ['min' => 126, 'max' => 600], // >600 dianggap kemungkinan salah input, lihat validasi
    ],
];
```

### ⚠️ Antisipasi Kesalahan
- **Jangan** commit `.env` ke Git. Pastikan `.env` ada di `.gitignore` (default Laravel sudah, tapi cek ulang).
- Jika `WHATSAPP_ACCESS_TOKEN` expired (token sementara Meta expired dalam 24 jam untuk mode development), sistem alert akan gagal **secara diam-diam** kalau tidak ada error handling — lihat bagian 12 untuk retry & logging wajib.
- `AI_API_KEY` jangan pernah di-expose ke frontend (jangan taruh di `import.meta.env.VITE_*`, karena prefix `VITE_` akan ikut ter-bundle ke JS publik).

---

## 3. `vite.config.js` — Konfigurasi PWA Lengkap

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true, // WAJIB true, kalau tidak hot-reload Blade tidak jalan
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'NutriSync',
                short_name: 'NutriSync',
                description: 'Deteksi dini risiko diabetes untuk remaja Indonesia',
                theme_color: '#1B6E63',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/dashboard',
                icons: [
                    // WAJIB minimal 192x192 & 512x512, kalau tidak Lighthouse akan
                    // menolak menampilkan prompt "Add to Home Screen"
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                // Strategi: network-first untuk data dinamis, cache-first untuk asset statis
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 5,
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: { cacheName: 'image-cache', expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 } },
                    },
                ],
                navigateFallbackDenylist: [/^\/faskes/, /^\/caregiver/], // dashboard admin tidak perlu offline
            },
        }),
    ],
});
```

### ⚠️ Antisipasi Kesalahan PWA (paling sering terjadi)
| Masalah | Penyebab | Solusi |
|---|---|---|
| Kamera barcode tidak bisa diakses di HP | `html5-qrcode` butuh **HTTPS** (kecuali di `localhost`) — browser modern blok akses kamera di HTTP | Deploy staging pakai domain dengan SSL (mis. ngrok/Cloudflare Tunnel saat testing di HP fisik) |
| Service Worker menampilkan data lama terus meski sudah update kode | Cache versi lama tidak ter-invalidate | Gunakan `registerType: 'autoUpdate'` (sudah di config di atas) + selalu `skipWaiting()`; saat debug, matikan cache di DevTools > Application > Service Workers > "Update on reload" |
| Install prompt "Add to Home Screen" tidak muncul | Manifest icon kurang lengkap, atau tidak ada `start_url` valid, atau tidak diakses via HTTPS | Cek Lighthouse audit; pastikan minimal 192px & 512px icon tersedia |
| Data yang disimpan offline (IndexedDB) hilang setelah beberapa hari | Browser mobile (terutama Safari iOS) bisa evict storage PWA yang jarang dibuka | Selalu tampilkan badge "X data belum tersinkron" di UI supaya user tahu harus buka app secara berkala |

---

## 4. Skema Database — Migrations Lengkap

> Urutan file migration **HARUS** sesuai urutan di bawah karena foreign key dependency. Gunakan `php artisan make:migration nama_migrasi` untuk tiap file agar timestamp berurutan otomatis.

### 4.1 `xxxx_create_users_table.php` (modifikasi migration bawaan Breeze)
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['patient', 'caregiver', 'faskes_admin'])->default('patient');
    $table->rememberToken();
    $table->timestamps();

    $table->index('role'); // dipakai untuk filter middleware EnsureRole
});
```

### 4.2 `xxxx_create_patients_table.php`
```php
Schema::create('patients', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();

    $table->date('birth_date');
    $table->decimal('weight_kg', 5, 2);
    $table->decimal('height_cm', 5, 2);
    $table->boolean('family_diabetes_history')->default(false);

    $table->string('pairing_code', 6)->unique();
    $table->integer('streak_count')->default(0);
    $table->integer('nutri_points')->default(0);

    $table->decimal('daily_sugar_limit_g', 5, 2)->nullable(); // hasil kalkulasi AI, null = pakai default config
    $table->enum('current_risk_status', ['aman', 'waspada', 'bahaya'])->default('aman');
    $table->timestamp('risk_recalculated_at')->nullable();

    $table->string('satusehat_id', 100)->nullable(); // opsional/roadmap, jangan wajibkan NOT NULL

    $table->timestamps();

    $table->index('current_risk_status'); // untuk query dashboard faskes admin (agregat populasi)
});
```
> **Kenapa `birth_date` bukan `age`?** Supaya usia selalu akurat tanpa perlu job harian untuk update — dihitung on-the-fly via accessor di Model (lihat bagian 5).

### 4.3 `xxxx_create_blood_sugar_logs_table.php`
```php
Schema::create('blood_sugar_logs', function (Blueprint $table) {
    $table->id();
    $table->uuid('client_uuid')->unique(); // WAJIB — di-generate di sisi frontend saat offline, mencegah duplikasi saat sync
    $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
    $table->unsignedSmallInteger('glucose_level'); // mg/dL
    $table->enum('context', ['puasa', 'setelah_makan', 'acak', 'sebelum_tidur']);
    $table->dateTime('measurement_time');
    $table->timestamps();

    $table->index(['patient_id', 'measurement_time']); // untuk query trend chart cepat
});
```
> **Kenapa `client_uuid`?** Saat offline (Service Worker + IndexedDB), user bisa input beberapa log sebelum online. Tanpa UUID unik dari client, retry sync bisa membuat data terduplikasi di server. Backend melakukan `firstOrCreate(['client_uuid' => $uuid], [...])`.

### 4.4 `xxxx_create_nutrition_logs_table.php`
```php
Schema::create('nutrition_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
    $table->string('barcode_number', 50)->nullable(); // null jika input manual (fallback)
    $table->string('food_name');
    $table->decimal('sugar_content_per_100g', 6, 2);
    $table->decimal('estimated_portion_g', 6, 2)->default(100);
    $table->enum('result_status', ['aman', 'waspada', 'bahaya']); // hasil scoring saat itu, disimpan permanen (jangan dihitung ulang tiap render)
    $table->decimal('daily_limit_contribution_pct', 5, 2); // persentase kontribusi ke batas harian
    $table->dateTime('scanned_at');
    $table->timestamps();

    $table->index(['patient_id', 'scanned_at']);
});
```
> **Kenapa `result_status` disimpan, bukan dihitung ulang saat ditampilkan?** Karena `daily_sugar_limit_g` pasien bisa berubah seiring waktu (personalisasi dinamis). Riwayat scan harus tetap menampilkan status **pada saat itu** terjadi, bukan dihitung ulang dengan ambang batas terbaru — kalau tidak, riwayat masa lalu akan terlihat "berubah sendiri" dan membingungkan user.

### 4.5 `xxxx_create_ai_risk_snapshots_table.php` (tambahan untuk kebutuhan chart tren & audit personalisasi)
```php
Schema::create('ai_risk_snapshots', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
    $table->enum('status', ['aman', 'waspada', 'bahaya']);
    $table->decimal('computed_daily_limit_g', 5, 2);
    $table->json('input_variables'); // snapshot usia, BB, TB, riwayat keluarga, avg konsumsi 7 hari — untuk audit/debug AI
    $table->timestamp('created_at')->useCurrent();

    $table->index(['patient_id', 'created_at']);
});
```

### 4.6 `xxxx_create_caregiver_patient_table.php`
```php
Schema::create('caregiver_patient', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
    $table->foreignId('caregiver_id')->constrained('users')->cascadeOnDelete();
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamp('paired_at')->useCurrent();
    $table->timestamps();

    $table->unique(['patient_id', 'caregiver_id']); // cegah pairing ganda
});
```

### 4.7 `xxxx_create_rewards_table.php` & `xxxx_create_reward_claims_table.php`
```php
// rewards
Schema::create('rewards', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description')->nullable();
    $table->unsignedInteger('points_required');
    $table->unsignedInteger('stock')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// reward_claims
Schema::create('reward_claims', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
    $table->foreignId('reward_id')->constrained()->cascadeOnDelete();
    $table->string('voucher_code', 20)->unique(); // format NUTRI-XXXXXX
    $table->timestamp('claimed_at')->useCurrent();
    $table->timestamps();
});
```

### ⚠️ Antisipasi Kesalahan Skema
| Masalah | Penyebab | Solusi |
|---|---|---|
| `SQLSTATE[HY000]: General error: 1005 Can't create table` saat migrate | Foreign key merujuk tabel yang migration-nya belum dijalankan lebih dulu | Pastikan urutan file migration: `users` → `patients` → (`blood_sugar_logs`, `nutrition_logs`, `ai_risk_snapshots`, `caregiver_patient`) → `rewards` → `reward_claims` |
| Race condition saat generate `pairing_code` unik | Dua registrasi bersamaan bisa menghasilkan kode sama sebelum unique constraint tervalidasi | Generate di dalam try-catch dengan retry loop (lihat contoh di `RegisterController` bagian 10), JANGAN generate hanya sekali lalu asumsikan pasti unik |
| Data `glucose_level` negatif atau > 600 lolos ke database | Validasi hanya dilakukan di frontend, backend tidak divalidasi ulang | WAJIB duplikasi validasi di `StoreBloodSugarLogRequest` (backend) — jangan percaya input dari client meskipun sudah divalidasi di React |
| `decimal(5,2)` overflow untuk `weight_kg` pasien obesitas berat (>999.99 kg tidak mungkin, tapi cek juga `height_cm` dengan presisi cm bisa sampai 250) | Definisi kolom terlalu sempit | `decimal(5,2)` sudah cukup (maks 999.99) untuk kedua kolom — tidak perlu diubah, tapi validasi range realistis (`weight_kg` 20–200, `height_cm` 100–220) tetap wajib di Form Request |

---

## 5. Models & Eloquent Relationships

### `app/Enums/UserRole.php`
```php
<?php
namespace App\Enums;

enum UserRole: string
{
    case Patient = 'patient';
    case Caregiver = 'caregiver';
    case FaskesAdmin = 'faskes_admin';
}
```

### `app/Enums/RiskStatus.php`
```php
<?php
namespace App\Enums;

enum RiskStatus: string
{
    case Aman = 'aman';
    case Waspada = 'waspada';
    case Bahaya = 'bahaya';

    public function color(): string
    {
        return match ($this) {
            self::Aman => '#22C55E',
            self::Waspada => '#EAB308',
            self::Bahaya => '#EF4444',
        };
    }
}
```

### `app/Models/User.php`
```php
<?php
namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // Laravel 11+ cara idiomatis, TIDAK perlu bcrypt manual di controller
            'role' => UserRole::class,
        ];
    }

    public function patient() { return $this->hasOne(Patient::class); }
    public function monitoredPatients() { // untuk role caregiver
        return $this->belongsToMany(Patient::class, 'caregiver_patient', 'caregiver_id', 'patient_id')
                     ->withPivot('status', 'paired_at');
    }
}
```

### `app/Models/Patient.php`
```php
<?php
namespace App\Models;

use App\Enums\RiskStatus;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    protected $fillable = [
        'user_id', 'birth_date', 'weight_kg', 'height_cm',
        'family_diabetes_history', 'pairing_code', 'daily_sugar_limit_g',
        'current_risk_status', 'risk_recalculated_at', 'satusehat_id',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'family_diabetes_history' => 'boolean',
            'current_risk_status' => RiskStatus::class,
            'risk_recalculated_at' => 'datetime',
        ];
    }

    // Accessor: usia dihitung dinamis, TIDAK disimpan sebagai kolom statis
    protected function age(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => Carbon::parse($this->birth_date)->age
        );
    }

    public function user() { return $this->belongsTo(User::class); }
    public function bloodSugarLogs() { return $this->hasMany(BloodSugarLog::class); }
    public function nutritionLogs() { return $this->hasMany(NutritionLog::class); }
    public function riskSnapshots() { return $this->hasMany(AiRiskSnapshot::class); }
    public function caregivers() {
        return $this->belongsToMany(User::class, 'caregiver_patient', 'patient_id', 'caregiver_id')
                     ->withPivot('status', 'paired_at');
    }
    public function rewardClaims() { return $this->hasMany(RewardClaim::class); }

    public function needsRiskRecalculation(): bool
    {
        if (is_null($this->risk_recalculated_at)) return true;
        return $this->risk_recalculated_at->diffInDays(now()) >= config('nutrisync.risk_recalc_interval_days');
    }
}
```

### Model lain (ringkas, pola sama)
```php
// app/Models/BloodSugarLog.php
class BloodSugarLog extends Model {
    protected $fillable = ['client_uuid', 'patient_id', 'glucose_level', 'context', 'measurement_time'];
    protected function casts(): array { return ['measurement_time' => 'datetime']; }
    public function patient() { return $this->belongsTo(Patient::class); }
}

// app/Models/NutritionLog.php
class NutritionLog extends Model {
    protected $fillable = [
        'patient_id', 'barcode_number', 'food_name', 'sugar_content_per_100g',
        'estimated_portion_g', 'result_status', 'daily_limit_contribution_pct', 'scanned_at',
    ];
    protected function casts(): array {
        return ['result_status' => \App\Enums\RiskStatus::class, 'scanned_at' => 'datetime'];
    }
    public function patient() { return $this->belongsTo(Patient::class); }
}

// app/Models/AiRiskSnapshot.php
class AiRiskSnapshot extends Model {
    public $timestamps = false; // hanya pakai created_at manual
    protected $fillable = ['patient_id', 'status', 'computed_daily_limit_g', 'input_variables'];
    protected function casts(): array {
        return ['status' => \App\Enums\RiskStatus::class, 'input_variables' => 'array', 'created_at' => 'datetime'];
    }
    public function patient() { return $this->belongsTo(Patient::class); }
}
```

### ⚠️ Antisipasi Kesalahan Model
- **Jangan** taruh logic kalkulasi risiko di dalam Model (mis. `Patient::calculateRisk()`). Model hanya boleh berisi relasi & accessor sederhana. Logic bisnis kompleks WAJIB di `AIPredictorService` (bagian 11) — supaya bisa di-unit-test terpisah dari Eloquent.
- `'password' => 'hashed'` di cast Laravel 11+ **menggantikan** kebutuhan `Hash::make()` manual saat `$user->password = $request->password; $user->save();` — tapi kalau pakai `User::create([...])` mass-assignment, cast tetap otomatis jalan. Jangan double-hash dengan memanggil `Hash::make()` manual DAN pakai cast ini bersamaan (password akan ter-hash dua kali dan tidak bisa login).

---

## 6. Seeders (Wajib untuk Data Awal)

### `database/seeders/RewardSeeder.php`
```php
<?php
namespace Database\Seeders;

use App\Models\Reward;
use Illuminate\Database\Seeder;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        Reward::insert([
            ['title' => 'Voucher Konsultasi Dokter (Halodoc)', 'points_required' => 500, 'stock' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Diskon 20% Apotek Mitra', 'points_required' => 300, 'stock' => 200, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Akses Konten Edukasi Premium', 'points_required' => 150, 'stock' => 9999, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
```
Daftarkan di `DatabaseSeeder.php`: `$this->call([RewardSeeder::class]);`

---

## 7. Routes (`routes/web.php`) — Lengkap dengan Grouping Role

```php
<?php
use App\Http\Controllers\Auth\{LoginController, RegisterController, PairingController};
use App\Http\Controllers\Patient\{DashboardController, ScanController, BloodSugarLogController, AnalyticsController, RewardController};
use App\Http\Controllers\Caregiver\FamilySyncController;
use App\Http\Controllers\Faskes\AdminDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Welcome'))->name('home');

// --- GUEST ---
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

// --- AUTH UMUM (semua role, hanya sekali muncul setelah register) ---
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    Route::get('/pairing', [PairingController::class, 'show'])->name('pairing.show');
    Route::post('/pairing/connect', [PairingController::class, 'connect'])->name('pairing.connect');
});

// --- PATIENT ONLY ---
Route::middleware(['auth', 'role:patient'])->prefix('app')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('patient.dashboard');
    Route::get('/scan', [ScanController::class, 'create'])->name('patient.scan');
    Route::post('/scan', [ScanController::class, 'store'])->name('patient.scan.store');
    Route::post('/blood-sugar-logs', [BloodSugarLogController::class, 'store'])->name('patient.bsl.store');
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('patient.analytics');
    Route::get('/rewards', [RewardController::class, 'index'])->name('patient.rewards');
    Route::post('/rewards/{reward}/claim', [RewardController::class, 'claim'])->name('patient.rewards.claim');
});

// --- CAREGIVER ONLY ---
Route::middleware(['auth', 'role:caregiver'])->prefix('family')->group(function () {
    Route::get('/dashboard', [FamilySyncController::class, 'index'])->name('caregiver.dashboard');
});

// --- FASKES ADMIN ONLY ---
Route::middleware(['auth', 'role:faskes_admin'])->prefix('faskes')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('faskes.dashboard');
});

// --- WEBHOOK (tanpa auth session, verifikasi via token khusus) ---
Route::match(['get', 'post'], '/webhooks/whatsapp', [\App\Http\Controllers\WhatsAppWebhookController::class, 'handle'])
    ->withoutMiddleware(['web']) // webhook eksternal tidak punya CSRF token
    ->name('webhooks.whatsapp');
```

### ⚠️ Antisipasi Kesalahan Routing
- Route webhook **wajib** `withoutMiddleware(['web'])` atau taruh di `routes/api.php` (yang secara default stateless & tanpa CSRF) — kalau tidak, Meta akan selalu dapat error 419 CSRF token mismatch saat POST ke webhook.
- Middleware alias `role:patient` **harus didaftarkan dulu** di `bootstrap/app.php` (lihat bagian 8) sebelum dipakai di route — kalau lupa didaftarkan, Laravel akan throw `Target class [role] does not exist`.

---

## 8. Middleware, Alias Registration & Policy (RBAC)

### `bootstrap/app.php` (Laravel 11+/13 — cara resmi daftar middleware alias)
```php
<?php
use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
        // HandleInertiaRequests WAJIB terdaftar di grup web agar shared props (auth user) selalu tersedia
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

### `app/Http/Middleware/EnsureRole.php`
```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role->value, $roles, true)) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}
```

### `app/Http/Middleware/HandleInertiaRequests.php`
```php
<?php
namespace App\Http\Middleware;

use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(\Illuminate\Http\Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'role' => $request->user()->role->value,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
```

### `app/Policies/PatientPolicy.php` (mencegah IDOR — caregiver A akses data anak B)
```php
<?php
namespace App\Policies;

use App\Models\{Patient, User};

class PatientPolicy
{
    public function view(User $user, Patient $patient): bool
    {
        if ($user->role->value === 'patient') {
            return $user->id === $patient->user_id;
        }
        if ($user->role->value === 'caregiver') {
            return $patient->caregivers()->where('caregiver_id', $user->id)->where('status', 'active')->exists();
        }
        return $user->role->value === 'faskes_admin'; // admin faskes lihat data agregat, bukan detail individual
    }
}
```
Daftarkan di `AppServiceProvider::boot()`:
```php
use App\Models\Patient;
use App\Policies\PatientPolicy;
use Illuminate\Support\Facades\Gate;

Gate::policy(Patient::class, PatientPolicy::class);
```

### ⚠️ Antisipasi Kesalahan RBAC (paling kritis untuk keamanan data medis)
| Masalah | Penyebab | Solusi |
|---|---|---|
| Caregiver bisa akses data pasien lain via manipulasi URL `/family/patient/{id}` | Controller hanya cek `auth()->check()`, tidak cek kepemilikan | WAJIB panggil `$this->authorize('view', $patient)` di **setiap** method controller yang menerima `{patient}` dari route, jangan hanya andalkan middleware role |
| Middleware `role:patient` lolos padahal user belum login | Middleware `role` dipasang tanpa `auth` di depannya | Selalu urutkan `['auth', 'role:patient']`, **bukan** `['role:patient']` saja — kalau tidak, `$request->user()` bisa null dan `in_array(null, ...)` bisa punya perilaku tak terduga |
| Data flash message tidak muncul di frontend React | Lupa daftarkan `HandleInertiaRequests` di `bootstrap/app.php` middleware web group | Cek ulang bagian registrasi di atas — ini penyebab #1 kenapa `usePage().props` kosong di React |

---

## 9. Form Requests (Validasi Backend — WAJIB, jangan andalkan validasi frontend saja)

### `app/Http/Requests/Patient/StoreBloodSugarLogRequest.php`
```php
<?php
namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class StoreBloodSugarLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role->value === 'patient';
    }

    public function rules(): array
    {
        return [
            'client_uuid' => ['required', 'uuid'],
            'glucose_level' => ['required', 'integer', 'min:20', 'max:600'], // di luar rentang = kemungkinan salah input
            'context' => ['required', 'in:puasa,setelah_makan,acak,sebelum_tidur'],
            'measurement_time' => ['required', 'date', 'before_or_equal:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'glucose_level.max' => 'Nilai ini di luar rentang normal (maks 600 mg/dL). Yakin data ini benar?',
            'measurement_time.before_or_equal' => 'Waktu pengukuran tidak boleh di masa depan.',
        ];
    }
}
```

### `app/Http/Requests/Patient/StoreProfileRequest.php`
```php
<?php
namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class StoreProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'birth_date' => ['required', 'date', 'before:today', 'after:'.now()->subYears(30)->toDateString()], // batasi realistis 0-30th
            'weight_kg' => ['required', 'numeric', 'between:20,200'],
            'height_cm' => ['required', 'numeric', 'between:100,220'],
            'family_diabetes_history' => ['required', 'boolean'],
        ];
    }
}
```

### ⚠️ Antisipasi Kesalahan Validasi
- Validasi angka (`glucose_level`, `weight_kg`, dll) **wajib duplikat** di backend meskipun React sudah validasi — request bisa dikirim langsung via curl/Postman melewati frontend.
- Field `boolean` dari React (`checkbox`/`switch`) kadang terkirim sebagai string `"true"/"false"` bukan native boolean — rule `boolean` di Laravel sudah otomatis handle ini (menerima `1/0/true/false/"1"/"0"`), tapi tetap uji dengan Postman untuk memastikan.

---

## 10. Controllers (Logika Inti — Contoh Lengkap untuk Bagian Kritis)

### `app/Http/Controllers/Auth/RegisterController.php` (fokus: generate pairing_code aman dari race condition)
```php
<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\{User, Patient};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Hash};
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create() { return Inertia::render('Auth/Register'); }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'role' => ['required', 'in:patient,caregiver,faskes_admin'],
        ]);

        DB::transaction(function () use ($validated, &$user) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'], // otomatis ter-hash via cast model
                'role' => $validated['role'],
            ]);

            if ($validated['role'] === 'patient') {
                // Retry loop untuk hindari race condition pairing_code duplikat
                $maxAttempts = 5;
                for ($i = 0; $i < $maxAttempts; $i++) {
                    try {
                        Patient::create([
                            'user_id' => $user->id,
                            'pairing_code' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                            'birth_date' => now(), // placeholder, akan dilengkapi di step profil
                            'weight_kg' => 0, 'height_cm' => 0,
                        ]);
                        break;
                    } catch (\Illuminate\Database\QueryException $e) {
                        if ($i === $maxAttempts - 1) throw $e; // gagal setelah 5x percobaan, lempar error asli
                        continue; // unique constraint violation, coba lagi dengan kode baru
                    }
                }
            }
        });

        auth()->login($user);
        return redirect()->route('pairing.show');
    }
}
```

### `app/Http/Controllers/Patient/ScanController.php` (fokus: alur AI scoring + fallback OpenFoodFacts gagal)
```php
<?php
namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StoreScanRequest;
use App\Services\{OpenFoodFactsService, AIPredictorService};
use Inertia\Inertia;

class ScanController extends Controller
{
    public function __construct(
        private OpenFoodFactsService $openFoodFacts,
        private AIPredictorService $predictor,
    ) {}

    public function create() { return Inertia::render('Patient/Scanner'); }

    public function store(StoreScanRequest $request)
    {
        $patient = $request->user()->patient;
        $product = null;

        if ($request->filled('barcode_number')) {
            $product = $this->openFoodFacts->lookup($request->barcode_number);
        }

        // FALLBACK WAJIB: kalau OpenFoodFacts gagal/produk tidak ada, pakai input manual dari form
        if (! $product) {
            $product = [
                'food_name' => $request->input('manual_food_name'),
                'sugar_content_per_100g' => $request->input('manual_sugar_content'),
            ];
        }

        $result = $this->predictor->scoreProduct($patient, $product);

        $log = $patient->nutritionLogs()->create([
            'barcode_number' => $request->barcode_number,
            'food_name' => $product['food_name'],
            'sugar_content_per_100g' => $product['sugar_content_per_100g'],
            'estimated_portion_g' => $request->input('portion_g', 100),
            'result_status' => $result['status'],
            'daily_limit_contribution_pct' => $result['contribution_pct'],
            'scanned_at' => now(),
        ]);

        return back()->with('scanResult', $result);
    }
}
```

### ⚠️ Antisipasi Kesalahan Controller
- **N+1 query** di dashboard/analytics: SELALU eager-load relasi. Contoh salah: `Patient::all()` lalu loop `$p->bloodSugarLogs`. Contoh benar: `Patient::with('bloodSugarLogs')->get()`.
- Jangan panggil `OpenFoodFactsService`/`AIPredictorService` langsung dengan `new OpenFoodFactsService()` di controller — selalu pakai **constructor dependency injection** seperti contoh di atas, supaya bisa di-mock saat testing (Pest).
- Method `store()` di atas TIDAK memanggil job async untuk cek status Bahaya → trigger Family Sync. Itu harus terjadi di `AIPredictorService` (bagian 11) via event, bukan dicek manual di tiap controller — supaya konsisten di semua titik yang bisa mengubah `current_risk_status` (scan, input gula darah, dll).

---

## 11. Service Classes (Logika Bisnis Inti)

### `app/Services/RiskThresholdService.php`
```php
<?php
namespace App\Services;

use App\Enums\RiskStatus;

class RiskThresholdService
{
    // Klasifikasi status berdasarkan glukosa darah — rujukan PERKENI 2024 / ADA
    public function classifyGlucose(int $glucoseLevel): RiskStatus
    {
        $t = config('nutrisync.glucose_thresholds');

        if ($glucoseLevel >= $t['bahaya']['min']) return RiskStatus::Bahaya;
        if ($glucoseLevel >= $t['waspada']['min']) return RiskStatus::Waspada;
        return RiskStatus::Aman;
    }
}
```

### `app/Services/AIPredictorService.php`
```php
<?php
namespace App\Services;

use App\Enums\RiskStatus;
use App\Models\Patient;
use App\Jobs\SendFamilySyncAlert;

class AIPredictorService
{
    public function __construct(
        private RiskThresholdService $thresholds,
    ) {}

    /**
     * Hitung ulang ambang batas konsumsi gula harian personal.
     * Dipanggil saat: profil diperbarui, ATAU risk_recalculated_at sudah > interval (lihat config).
     */
    public function recalculatePersonalization(Patient $patient): void
    {
        $bmi = $patient->weight_kg / (($patient->height_cm / 100) ** 2);
        $avgSugar7d = $patient->nutritionLogs()
            ->where('scanned_at', '>=', now()->subDays(7))
            ->avg('sugar_content_per_100g') ?? 0;

        // Formula sederhana rule-based sebagai FALLBACK jika LLM API gagal/timeout —
        // JANGAN gantungkan personalisasi 100% pada LLM call yang bisa gagal
        $baseLimit = config('nutrisync.default_daily_sugar_limit_g');
        $adjustment = 0;
        if ($bmi >= 25) $adjustment -= 5; // BMI tinggi -> batas lebih ketat
        if ($patient->family_diabetes_history) $adjustment -= 3;
        $computedLimit = max(10, $baseLimit + $adjustment); // jangan sampai di bawah 10g/hari (tidak realistis)

        // Opsional: perkaya dengan LLM untuk narasi & fine-tuning, BUKAN untuk angka final kritis
        // (angka kritis harus deterministik & bisa diaudit, LLM hanya untuk kalimat rekomendasi)

        $patient->update([
            'daily_sugar_limit_g' => $computedLimit,
            'risk_recalculated_at' => now(),
        ]);

        $patient->riskSnapshots()->create([
            'status' => $patient->current_risk_status,
            'computed_daily_limit_g' => $computedLimit,
            'input_variables' => [
                'age' => $patient->age, 'bmi' => round($bmi, 2),
                'family_history' => $patient->family_diabetes_history,
                'avg_sugar_7d' => round($avgSugar7d, 2),
            ],
        ]);
    }

    public function scoreProduct(Patient $patient, array $product): array
    {
        if ($patient->needsRiskRecalculation()) {
            $this->recalculatePersonalization($patient);
        }

        $dailyLimit = $patient->daily_sugar_limit_g ?? config('nutrisync.default_daily_sugar_limit_g');
        $sugarThisProduct = ($product['sugar_content_per_100g'] / 100) * ($product['estimated_portion_g'] ?? 100);
        $contributionPct = round(($sugarThisProduct / $dailyLimit) * 100, 1);

        $status = match (true) {
            $contributionPct >= 80 => RiskStatus::Bahaya,
            $contributionPct >= 40 => RiskStatus::Waspada,
            default => RiskStatus::Aman,
        };

        $this->updatePatientStatusAndNotify($patient, $status);

        return ['status' => $status->value, 'contribution_pct' => $contributionPct, 'daily_limit_g' => $dailyLimit];
    }

    public function evaluateGlucoseReading(Patient $patient, int $glucoseLevel): RiskStatus
    {
        $status = $this->thresholds->classifyGlucose($glucoseLevel);
        $this->updatePatientStatusAndNotify($patient, $status);
        return $status;
    }

    // Satu titik terpusat untuk trigger Family Sync — JANGAN duplikasi logic ini di controller lain
    private function updatePatientStatusAndNotify(Patient $patient, RiskStatus $status): void
    {
        $patient->update(['current_risk_status' => $status]);

        if ($status === RiskStatus::Bahaya) {
            SendFamilySyncAlert::dispatch($patient); // WAJIB job async, jangan panggil WhatsApp API sync di sini
        }
    }
}
```

### `app/Services/OpenFoodFactsService.php`
```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\{Http, Log};

class OpenFoodFactsService
{
    public function lookup(string $barcode): ?array
    {
        try {
            $response = Http::withHeaders(['User-Agent' => config('services.openfoodfacts.user_agent')])
                ->timeout(5) // WAJIB set timeout, jangan biarkan default (bisa menggantung lama & bikin UI freeze)
                ->get(config('services.openfoodfacts.base_url') . "/product/{$barcode}.json");

            if (! $response->successful() || ($response->json('status') ?? 0) === 0) {
                return null; // produk tidak ditemukan -> controller akan fallback ke input manual
            }

            $p = $response->json('product');
            return [
                'food_name' => $p['product_name'] ?? 'Produk tidak dikenal',
                'sugar_content_per_100g' => $p['nutriments']['sugars_100g'] ?? null,
            ];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('OpenFoodFacts API tidak dapat dihubungi', ['barcode' => $barcode, 'error' => $e->getMessage()]);
            return null; // JANGAN throw — biarkan controller fallback ke form manual
        }
    }
}
```

### `app/Services/WhatsAppService.php`
```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\{Http, Log};

class WhatsAppService
{
    public function sendEmergencyAlert(string $toPhoneE164, string $patientName, string $riskStatus): bool
    {
        // PENTING: WhatsApp Business API MEWAJIBKAN pre-approved message TEMPLATE
        // untuk pesan yang diinisiasi bisnis (bukan balasan dalam 24 jam customer window).
        // Kirim pesan bebas (free-form) akan DITOLAK Meta di luar window tsb.
        $response = Http::withToken(config('services.whatsapp.access_token'))
            ->timeout(10)
            ->post('https://graph.facebook.com/v20.0/' . config('services.whatsapp.phone_number_id') . '/messages', [
                'messaging_product' => 'whatsapp',
                'to' => $toPhoneE164, // format wajib: 62xxxxxxxxxx, TANPA tanda '+'
                'type' => 'template',
                'template' => [
                    'name' => config('services.whatsapp.template_emergency'),
                    'language' => ['code' => 'id'],
                    'components' => [[
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $patientName],
                            ['type' => 'text', 'text' => strtoupper($riskStatus)],
                        ],
                    ]],
                ],
            ]);

        if (! $response->successful()) {
            Log::error('Gagal kirim WhatsApp Family Sync alert', [
                'to' => $toPhoneE164, 'response' => $response->json(),
            ]);
            return false;
        }
        return true;
    }
}
```

### ⚠️ Antisipasi Kesalahan Service Layer (paling sering diabaikan)
| Masalah | Penyebab | Solusi |
|---|---|---|
| Notifikasi WhatsApp gagal terkirim tanpa error terlihat di UI | Job async gagal di background, tidak ada yang memantau | Selalu `Log::error` di catch block (contoh di atas) + setup `failed_jobs` table (`php artisan queue:failed-table && php artisan migrate`) untuk memantau job gagal |
| Personalisasi AI membuat `daily_sugar_limit_g` jadi 0 atau negatif | Formula adjustment tidak dibatasi | Selalu bungkus hasil akhir dengan `max(nilai_minimum, ...)` seperti contoh di atas |
| Pesan WhatsApp selalu gagal walau token valid | Nomor tujuan salah format (pakai `+62` atau `08xx`, bukan `62xx`) | Normalisasi nomor telepon caregiver saat disimpan (strip `+`, ganti awalan `0` jadi `62`) — lakukan di accessor/mutator Model `User`, bukan di tempat terpisah-pisah |
| `OpenFoodFactsService` menyebabkan request scan menggantung lama | Tidak ada timeout di HTTP client | WAJIB `->timeout(5)` seperti contoh, dan tangkap `ConnectionException` secara eksplisit |

---

## 12. Jobs & Queue Configuration

### `app/Jobs/SendFamilySyncAlert.php`
```php
<?php
namespace App\Jobs;

use App\Models\Patient;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendFamilySyncAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30; // detik antar retry

    public function __construct(public Patient $patient) {}

    public function handle(WhatsAppService $whatsApp): void
    {
        $caregivers = $this->patient->caregivers()->wherePivot('status', 'active')->get();

        foreach ($caregivers as $caregiver) {
            $whatsApp->sendEmergencyAlert(
                toPhoneE164: $caregiver->phone_number, // pastikan kolom ini ada di migration users/profil caregiver
                patientName: $this->patient->user->name,
                riskStatus: $this->patient->current_risk_status->value,
            );
        }
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::critical('Family Sync alert GAGAL TOTAL setelah 3x retry', [
            'patient_id' => $this->patient->id, 'error' => $exception->getMessage(),
        ]);
        // TODO: fallback kirim email ke admin jika ini production
    }
}
```

### Setup queue worker (production, WAJIB pakai Supervisor)
```ini
; /etc/supervisor/conf.d/nutrisync-worker.conf
[program:nutrisync-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/nutrisync/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/nutrisync/storage/logs/worker.log
```

### ⚠️ Antisipasi Kesalahan Queue
- **Kesalahan #1 paling umum**: `QUEUE_CONNECTION=sync` di `.env` production — ini membuat job "async" sebenarnya dieksekusi **langsung/blocking** saat request, sehingga user harus menunggu WhatsApp API selesai sebelum halaman merespons. WAJIB `database` atau `redis` + jalankan `php artisan queue:work` (dev) / Supervisor (production).
- Jangan lupa `php artisan queue:table && php artisan migrate` untuk membuat tabel `jobs` jika pakai driver `database`.
- Job yang gagal permanen (habis retry) harus tercatat — jalankan `php artisan queue:failed-table && php artisan migrate` di awal setup, bukan belakangan setelah insiden terjadi.

---

## 13. Frontend — Struktur Halaman Inertia + React

### `resources/js/app.jsx` (entry point)
```jsx
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
```

### `resources/views/app.blade.php` (root shell — WAJIB ada `@routes`, `@vite`, `@inertia`)
```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#1B6E63">
    <link rel="manifest" href="/manifest.webmanifest">
    <title inertia>{{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
```

### `resources/js/Pages/Patient/Dashboard.jsx` — struktur props & komponen (Halaman 3 di rancangan v3)
```jsx
import PatientLayout from '@/Layouts/PatientLayout';
import RiskStatusBadge from '@/Components/RiskStatusBadge';
import ActionFab from '@/Components/ActionFab';

// Props ini WAJIB dikirim dari DashboardController::index() — jangan fetch ulang via axios
// kalau data sudah bisa disiapkan server-side (prinsip Inertia: server-driven props)
export default function Dashboard({ patient, latestGlucose, streak, nutriPoints }) {
    return (
        <PatientLayout title="Dashboard">
            {/* Kotak Atas — Status AI dinamis, warna dari RiskStatus enum (lihat backend) */}
            <RiskStatusBadge status={patient.current_risk_status} />

            {/* Kotak Tengah — Ringkasan */}
            <div className="grid grid-cols-3 gap-4 my-4">
                <StatCard label="Gula Terakhir" value={`${latestGlucose ?? '-'} mg/dL`} />
                <StatCard label="NutriPoin" value={nutriPoints} />
                <StatCard label="Streak" value={`${streak} hari`} />
            </div>

            {/* Area Bawah — Thumb Zone, dua tombol aksi melayang (Fitts's Law) */}
            <ActionFab href={route('patient.scan')} label="Pindai Makanan" icon="camera" />
            <ActionFab href={route('patient.bsl.store')} label="Catat Gula Darah" icon="droplet" position="secondary" />
        </PatientLayout>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-xl border p-4 text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}
```

### `resources/js/Components/ScannerCamera.jsx` — integrasi `html5-qrcode` (Halaman 4)
```jsx
import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerCamera({ onDetected, onError }) {
    const regionId = 'qr-reader-region';
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        Html5Qrcode.getCameras().then((cameras) => {
            if (!cameras.length) {
                onError?.('Kamera tidak terdeteksi. Gunakan input manual di bawah.');
                return;
            }
            scanner.start(
                { facingMode: 'environment' }, // kamera belakang
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => onDetected(decodedText),
                () => {} // ignore scan-gagal per-frame, JANGAN spam error tiap frame gagal decode
            ).catch(() => onError?.('Gagal mengakses kamera. Pastikan izin kamera diaktifkan & situs diakses via HTTPS.'));
        }).catch(() => onError?.('Browser tidak mendukung akses kamera.'));

        // WAJIB cleanup saat unmount, kalau tidak kamera tetap menyala di background (baterai boros + privacy issue)
        return () => {
            scannerRef.current?.stop().catch(() => {});
        };
    }, []);

    return <div id={regionId} className="w-full max-w-sm mx-auto" />;
}
```

### ⚠️ Antisipasi Kesalahan Frontend (paling sering menyebabkan bug produksi)
| Masalah | Penyebab | Solusi |
|---|---|---|
| `route()` helper undefined di React | Package `ziggy-js` belum di-install/registrasi | `composer require tightenco/ziggy`, tambahkan `@routes` di `app.blade.php` sebelum `@vite`, dan `import { route } from 'ziggy-js'` bila tidak pakai auto-global |
| Halaman Scanner blank/crash di Safari iOS | `Html5Qrcode.start()` gagal silent karena permission belum diberikan atau API kamera berbeda | Selalu bungkus dengan try-catch + tampilkan pesan error eksplisit ke user (lihat `onError` di atas), jangan biarkan promise rejection tidak tertangani |
| Kamera tetap menyala setelah pindah halaman | Lupa cleanup `scanner.stop()` di `useEffect` return | Sudah dicontohkan di atas — ini WAJIB, bukan opsional |
| Props Inertia terasa "lag" / data lama muncul sesaat setelah aksi | Reload halaman Inertia default hanya partial reload komponen tertentu | Gunakan `router.visit(url, { preserveScroll: true, preserveState: false })` pasca-submit form penting seperti hasil scan, supaya data terbaru pasti ter-fetch ulang dari server |
| Build produksi (`npm run build`) sukses tapi asset 404 di server | `APP_URL` di `.env` production tidak sesuai domain asli, atau `ASSET_URL` belum di-set saat pakai CDN | Set `ASSET_URL` di `.env` jika asset di-serve dari domain/CDN berbeda dari `APP_URL` |

---

## 14. Offline Sync — IndexedDB dengan Dexie.js

### `resources/js/lib/offlineQueue.js`
```js
import Dexie from 'dexie';

export const db = new Dexie('nutrisync-offline');
db.version(1).stores({
    pendingBloodSugarLogs: '++id, client_uuid, synced',
});

export async function queueBloodSugarLog(payload) {
    const client_uuid = crypto.randomUUID(); // WAJIB generate di client, dipakai backend untuk dedup (lihat migration 4.3)
    await db.pendingBloodSugarLogs.add({ ...payload, client_uuid, synced: false });
    return client_uuid;
}

export async function syncPendingLogs(axiosInstance) {
    const pending = await db.pendingBloodSugarLogs.where('synced').equals(false).toArray();
    for (const log of pending) {
        try {
            await axiosInstance.post('/app/blood-sugar-logs', log);
            await db.pendingBloodSugarLogs.update(log.id, { synced: true });
        } catch (e) {
            // Biarkan tetap unsynced, akan dicoba lagi saat online berikutnya.
            // JANGAN hapus dari queue kalau gagal — data medis tidak boleh hilang.
            console.warn('Sync gagal, akan dicoba lagi:', e);
        }
    }
}

// Panggil ini di App root / Layout saat event 'online' terdeteksi
window.addEventListener('online', () => {
    import('@/lib/axios').then(({ default: axiosInstance }) => syncPendingLogs(axiosInstance));
});
```

### ⚠️ Antisipasi Kesalahan Offline Sync
- Jangan pakai `localStorage`/`sessionStorage` untuk antrean offline — kapasitas kecil (~5-10MB) dan bersifat sinkron blocking. **Dexie.js (wrapper IndexedDB)** adalah pilihan yang benar untuk data terstruktur seperti ini.
- Selalu tampilkan indikator UI "X data belum tersinkron" (badge angka) — kalau tidak, user tidak sadar datanya "tersangkut" secara lokal dan bisa hilang kalau app di-uninstall/cache dibersihkan.
- Backend endpoint `blood-sugar-logs` **wajib idempotent** terhadap `client_uuid` (`firstOrCreate`), karena retry sync bisa mengirim payload yang sama dua kali.

---

## 15. `package.json` & `composer.json` — Daftar Dependency Final

### `package.json` (dependencies inti, versi minimum)
```json
{
  "dependencies": {
    "@inertiajs/react": "^2.0",
    "react": "^18.3",
    "react-dom": "^18.3",
    "html5-qrcode": "^2.3.8",
    "dexie": "^4.0",
    "axios": "^1.7",
    "recharts": "^2.12"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3",
    "laravel-vite-plugin": "^1.0",
    "vite": "^5.4",
    "vite-plugin-pwa": "^0.20",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.4",
    "postcss": "^8.4"
  }
}
```

### `composer.json` (require inti)
```json
{
  "require": {
    "php": "^8.3",
    "laravel/framework": "^13.0",
    "laravel/breeze": "^2.0",
    "laravel/tinker": "^2.9",
    "inertiajs/inertia-laravel": "^2.0",
    "tightenco/ziggy": "^2.0",
    "guzzlehttp/guzzle": "^7.9"
  },
  "require-dev": {
    "pestphp/pest": "^3.0",
    "pestphp/pest-plugin-laravel": "^3.0",
    "laravel/pint": "^1.17"
  }
}
```

### ⚠️ Antisipasi Kesalahan Dependency
- Jangan campur versi Inertia backend (`inertiajs/inertia-laravel`) dan frontend (`@inertiajs/react`) yang beda major version (v1 vs v2) — API `router.visit`, shared props, dan `usePage()` berubah antar major version dan akan menyebabkan error runtime yang sulit dilacak.
- Setelah `composer install`/`npm install` di server baru, WAJIB jalankan `npm run build` (bukan `npm run dev`) sebelum deploy — kalau lupa, Laravel akan mencari manifest Vite yang tidak ada dan melempar `Unable to locate file in Vite manifest`.

---

## 16. Testing Checklist (Pest) — Minimal yang Wajib Ada

```
tests/Feature/
├── Auth/RegistrationTest.php        # pastikan pairing_code selalu unik meski dipanggil paralel
├── Patient/BloodSugarLogTest.php    # validasi rentang 20-600, cek client_uuid dedup
├── Patient/ScanTest.php             # mock OpenFoodFactsService gagal -> fallback manual jalan
├── Patient/RiskCalculationTest.php  # AIPredictorService: BMI tinggi -> limit lebih ketat
├── FamilySync/AlertDispatchTest.php # status Bahaya -> job SendFamilySyncAlert ter-dispatch (Queue::fake())
└── Policy/PatientPolicyTest.php     # caregiver A TIDAK BISA lihat data patient B (403)
```

Contoh kunci (yang paling sering dilewatkan tim development):
```php
// tests/Feature/Policy/PatientPolicyTest.php
it('mencegah caregiver mengakses data pasien yang tidak dipair dengannya', function () {
    $caregiverA = User::factory()->create(['role' => 'caregiver']);
    $patientB = Patient::factory()->create(); // tidak dipair dengan caregiverA

    $this->actingAs($caregiverA)
        ->get(route('caregiver.dashboard', $patientB))
        ->assertForbidden();
});
```

---

## 17. Deployment Checklist (Ringkas)

```bash
composer install --optimize-autoloader --no-dev
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart   # WAJIB setelah tiap deploy agar worker pakai kode terbaru
```

> ⚠️ **Jangan** jalankan `php artisan config:cache` sebelum semua `.env` production terisi lengkap — konfigurasi yang di-cache akan "membekukan" nilai env saat itu, sehingga perubahan `.env` setelahnya tidak akan terbaca sampai cache di-clear ulang (`php artisan config:clear`).

---

## Ringkasan Prioritas Implementasi (untuk AI Agent)

Jika membangun secara bertahap, ikuti urutan berikut agar setiap tahap bisa langsung diuji tanpa dependency yang belum ada:

1. Setup project + `.env` + `bootstrap/app.php` middleware (bagian 1–3, 8)
2. Migration lengkap → migrate (bagian 4)
3. Models + Enums (bagian 5)
4. Auth (Breeze) + RegisterController custom + Pairing (bagian 10)
5. Middleware role + Policy (bagian 8)
6. Service layer: RiskThreshold → AIPredictor → OpenFoodFacts → WhatsApp (bagian 11, urutan ini penting karena AIPredictor bergantung ke RiskThreshold)
7. Controller + Form Request per fitur (bagian 9–10)
8. Jobs & Queue worker (bagian 12)
9. Frontend Pages sesuai urutan halaman di rancangan v3 (bagian 13)
10. PWA config + offline sync (bagian 3, 14) — paling akhir karena bergantung pada semua endpoint sudah stabil
11. Testing (bagian 16) — idealnya ditulis paralel dengan tiap fitur, bukan di akhir semua

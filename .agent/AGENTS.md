# AGENTS.md — NutriSync

Instruksi ini berlaku untuk seluruh kode di repo ini. Baca dokumen ini SEBELUM membuat/mengubah file apa pun. Dokumen acuan lengkap ada di `NutriSync_Blueprint_Teknis_v1.md` — file ini adalah ringkasan aturan wajib + pointer ke bagian yang relevan di sana. sedangkan untuk file PDF hanya formalitas untuk disertakan, dan jangan dibaca agar tidak menghabiskan waktu processing. sedangkan untuk aspek aspekn tech dan persiapan bisa membaca file breakdown.md dan checklist.md yang ada di folder .agent (sejajar dengan file ini)

## Ringkasan Proyek
NutriSync: PWA deteksi dini risiko diabetes untuk remaja Indonesia (10–24 tahun). Fokus tunggal diabetes — TIDAK ada fitur stunting, TIDAK ada target pengguna lansia. Fitur inti: scan barcode gizi, prediksi risiko AI multi-variabel, Family Sync (notifikasi darurat ke orang tua).

## Stack (jangan ganti tanpa alasan kuat & konfirmasi ke user)
- Backend: Laravel 13 (PHP 8.3+)
- Frontend: React 18 + Inertia.js v2
- Styling: Tailwind CSS 3 + shadcn/ui
- DB: MySQL 8 (dev) / PostgreSQL 16 + pgvector (prod, opsional)
- Build: Vite 5 + vite-plugin-pwa
- Barcode: html5-qrcode
- Offline storage: Dexie.js (IndexedDB) — JANGAN pakai localStorage/sessionStorage
- Notifikasi: WhatsApp Cloud API (Meta)

## Aturan Struktural Wajib

1. **Laravel 13 TIDAK punya `app/Http/Kernel.php`.** Middleware alias, middleware group, dan exception handling didaftarkan di `bootstrap/app.php`. Jangan pernah mencari atau membuat `Kernel.php` — itu tanda kamu salah versi Laravel di kepala.
2. **Logic bisnis kompleks (kalkulasi risiko, personalisasi, scoring) HARUS di Service class** (`app/Services/`), bukan di Model atau Controller. Model hanya boleh berisi relasi, cast, dan accessor sederhana.
3. **Setiap Form Request WAJIB validasi ulang di backend**, meskipun sudah divalidasi di React. Jangan pernah percaya input client.
4. **Setiap controller method yang menerima resource milik user lain (mis. `{patient}`) WAJIB memanggil `$this->authorize()`** — jangan hanya mengandalkan middleware role. Ini mencegah IDOR (orang tua A akses data anak B).
5. **Trigger perubahan status risiko HANYA lewat `AIPredictorService::updatePatientStatusAndNotify()`** (method private terpusat). Jangan duplikasi logic "kalau status Bahaya → kirim WhatsApp" di controller lain mana pun.
6. **Notifikasi WhatsApp WAJIB async lewat Job (queue), tidak boleh dipanggil langsung/sync di controller.** `QUEUE_CONNECTION` di `.env` harus `database` atau `redis`, tidak boleh `sync`.
7. **Data riwayat (nutrition_logs) menyimpan `result_status` pada saat kejadian, tidak dihitung ulang saat ditampilkan.** Ambang batas personal berubah seiring waktu; riwayat lama tidak boleh "berubah sendiri".
8. **Semua kolom angka medis (glucose_level, weight_kg, height_cm) WAJIB punya validasi range realistis di Form Request**, bukan cuma `required|numeric`. Lihat rentang di `docs/NutriSync_Blueprint_Teknis_v1.md` bagian 9.
9. **Offline sync pakai `client_uuid` (UUID di-generate di client) untuk idempotency.** Endpoint terkait wajib pakai `firstOrCreate(['client_uuid' => ...])`, bukan `create()` biasa — retry sync tidak boleh menghasilkan data duplikat.
10. **HTTP client ke API eksternal (OpenFoodFacts, WhatsApp) WAJIB pakai `->timeout()` dan try-catch eksplisit**, dengan fallback yang jelas (bukan silent fail atau biarkan request menggantung).

## Larangan Eksplisit
- JANGAN gabungkan kembali fitur/data stunting ke dalam kode ini dalam bentuk apa pun.
- JANGAN jadikan lansia/orang tua sebagai target entitas `patient` — orang tua hanya boleh berperan sebagai `caregiver` (read-only, penerima notifikasi).
- JANGAN commit `.env` atau kredensial apa pun ke Git.
- JANGAN taruh API key AI/WhatsApp di variabel `VITE_*` (akan ter-bundle ke JS publik).
- JANGAN gunakan `localStorage`/`sessionStorage` untuk antrean data offline medis.
- JANGAN implementasi integrasi SATUSEHAT sebagai fitur inti/wajib — statusnya roadmap opsional pasca-MVP, cukup sediakan ekspor PDF sebagai penggantinya.
- JANGAN hardcode ambang batas glukosa (70/100/126 mg/dL dst) di banyak tempat — semua rujukan ambang batas HARUS baca dari `config/nutrisync.php`, satu sumber kebenaran.

## Konvensi Kode
- PHP: ikuti PSR-12, format pakai Laravel Pint (`vendor/bin/pint`) sebelum commit.
- Nama Service class: `XxxService`, method publik deskriptif (`scoreProduct`, bukan `process`).
- Nama Job: kata kerja + objek (`SendFamilySyncAlert`, bukan `FamilySyncJob`).
- React: satu file per komponen di `resources/js/Pages/` (mengikuti struktur folder role: `Patient/`, `Caregiver/`, `Faskes/`) dan `resources/js/Components/` untuk komponen reusable.
- Props ke halaman Inertia disiapkan server-side di Controller — jangan fetch ulang via axios kalau data sudah bisa dikirim lewat props saat render awal.
- Commit message: Bahasa Indonesia atau Inggris konsisten dalam satu PR, format singkat `[area] deskripsi` (mis. `[scan] tambah fallback input manual`).

## Urutan Eksekusi Kalau Membangun dari Nol
Ikuti urutan ini (detail lengkap tiap langkah ada di blueprint bagian yang disebut):
1. Setup project + `.env` + `bootstrap/app.php` middleware — blueprint §1–3, §8
2. Migration lengkap → migrate — blueprint §4
3. Models + Enums — blueprint §5
4. Auth (Breeze) + RegisterController custom (pairing code) — blueprint §10
5. Middleware role + Policy (RBAC) — blueprint §8
6. Service layer, urutan wajib: RiskThresholdService → AIPredictorService → OpenFoodFactsService → WhatsAppService — blueprint §11
7. Controller + Form Request per fitur — blueprint §9–10
8. Jobs & Queue worker — blueprint §12
9. Frontend Pages sesuai urutan halaman di rancangan sistem v3 — blueprint §13
10. PWA config + offline sync (paling akhir, butuh endpoint sudah stabil) — blueprint §3, §14
11. Testing (Pest) — idealnya paralel per fitur, bukan di akhir — blueprint §16

## Referensi Standar Medis (Jangan Ubah Tanpa Rujukan Baru)
Ambang batas status Aman/Waspada/Bahaya dirujuk ke Pedoman PERKENI 2024 & ADA:
- Aman: glukosa puasa 70–99 mg/dL, HbA1c < 5,7%
- Waspada: 100–125 mg/dL, HbA1c 5,7–6,4%
- Bahaya: ≥126 mg/dL, HbA1c ≥6,5%

Sumber tunggal nilai ini: `config/nutrisync.php`. Kalau ada perubahan pedoman medis, update di satu tempat itu saja.

## Sebelum Membuka Pull Request / Menyatakan Task Selesai
- [ ] `vendor/bin/pint` sudah dijalankan (PHP)
- [ ] Tidak ada query N+1 baru (cek pakai `Laravel Debugbar` atau eager-load eksplisit)
- [ ] Endpoint baru yang menerima resource user lain sudah pakai `authorize()`
- [ ] Field medis baru sudah punya validasi range di Form Request
- [ ] Test Pest terkait fitur baru ditambahkan (minimal happy path + 1 edge case)
- [ ] Tidak ada kredensial/API key baru yang ter-commit

## Kalau Ragu
Jika instruksi user bertentangan dengan aturan di atas (misalnya diminta menambahkan fitur stunting atau target lansia kembali), STOP dan konfirmasi ke user dulu sebelum mengeksekusi — jangan diam-diam menuruti karena ini bertentangan dengan keputusan pembimbing yang sudah difinalisasi.
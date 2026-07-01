---
trigger: always_on
---

# Frontend Rules — NutriSync (React 18 + Inertia.js v2 + PWA)

Berlaku untuk semua file di `resources/js/`, `resources/css/`, `resources/views/app.blade.php`, `vite.config.js`. Rujukan detail lengkap: `docs/NutriSync_Blueprint_Teknis_v1.md` bagian 3, 13–14.

## Struktur Folder (wajib diikuti, jangan buat pola baru)

```
resources/js/
├── app.jsx                # entry point Inertia — jangan ubah struktur resolve()
├── Layouts/                # satu layout per role: PatientLayout, CaregiverLayout, FaskesLayout
├── Pages/
│   ├── Auth/
│   ├── Patient/
│   ├── Caregiver/
│   └── Faskes/
├── Components/             # komponen reusable lintas halaman
└── lib/                    # helper non-komponen (offlineQueue.js, axios.js)
```

Halaman baru masuk ke subfolder sesuai role (`Pages/Patient/`, dst) — mencerminkan struktur route/middleware role di backend.

## Prinsip Data: Server-Driven, Bukan Client-Fetch

- Data untuk render awal halaman WAJIB disiapkan Controller lewat props Inertia (`Inertia::render('Patient/Dashboard', [...])`). Jangan `axios.get()` ulang di `useEffect` untuk data yang sudah bisa dikirim server-side saat request awal.
- `axios`/fetch manual hanya untuk: aksi non-navigasi (submit form di tempat), polling, atau operasi yang memang harus client-side (scan barcode, IndexedDB).
- Setelah aksi penting (submit hasil scan, catat gula darah), gunakan `router.visit(url, { preserveScroll: true, preserveState: false })` supaya data ter-fetch ulang dari server, bukan mengandalkan partial reload default yang bisa membuat UI menampilkan data basi.

## `route()` Helper (Ziggy)

- Semua link/redirect ke backend WAJIB pakai `route('nama.route')`, bukan hardcode string URL — supaya tetap sinkron kalau path backend berubah.
- Kalau `route()` undefined: cek `@routes` sudah ada di `app.blade.php` SEBELUM `@vite`, dan package `tightenco/ziggy` sudah ter-install di composer.

## Kamera Barcode Scanner (`html5-qrcode`)

- WAJIB dibungkus try-catch di setiap pemanggilan `Html5Qrcode.start()` / `getCameras()` — jangan biarkan promise rejection tidak tertangani, tampilkan pesan error eksplisit ke user (bukan console.log diam-diam).
- WAJIB cleanup (`scanner.stop()`) di `useEffect` return function saat komponen unmount — kalau lupa, kamera tetap menyala di background (boros baterai + isu privasi).
- Kamera HANYA bisa diakses via HTTPS (kecuali `localhost`). Kalau testing di HP fisik, pastikan akses lewat tunnel HTTPS (ngrok/Cloudflare Tunnel), bukan HTTP LAN biasa — kalau tidak, kamera akan gagal silent terutama di Safari iOS.
- `facingMode: 'environment'` untuk kamera belakang (bukan `user`/depan) — ini scanner produk, bukan selfie.
- Callback scan-gagal per-frame JANGAN memicu error/toast — itu normal terjadi puluhan kali per detik sebelum barcode berhasil terbaca. Hanya tampilkan error untuk kegagalan akses kamera/permission.

## Offline Sync (Dexie / IndexedDB)

- JANGAN PERNAH pakai `localStorage` atau `sessionStorage` untuk data yang perlu disinkronkan (blood sugar log offline). Selalu pakai Dexie.js (`resources/js/lib/offlineQueue.js`).
- Setiap entri offline WAJIB punya `client_uuid` (`crypto.randomUUID()`) yang di-generate di client SAAT data dibuat, dikirim apa adanya ke backend — backend yang menangani dedup lewat `client_uuid`, frontend tidak perlu cek duplikasi sendiri.
- Kalau sync gagal (network error saat retry), JANGAN hapus entri dari queue lokal — biarkan tetap `synced: false` untuk dicoba lagi. Data medis tidak boleh hilang karena kegagalan sync.
- Tampilkan indikator UI eksplisit ("X data belum tersinkron") di layout/dashboard kalau ada entri `synced: false` — user harus sadar datanya belum terkirim ke server.
- Trigger sync otomatis saat event `online` di `window`, bukan hanya manual/polling.

## PWA & Service Worker

- Konfigurasi PWA HANYA di `vite.config.js` lewat plugin `vite-plugin-pwa` — jangan menulis `sw.js` manual, itu file auto-generated (jangan diedit langsung, perubahan akan hilang saat build ulang).
- `registerType: 'autoUpdate'` wajib dipakai supaya versi service worker lama tidak "nyangkut" menampilkan kode basi ke user.
- Manifest icon WAJIB minimal 192x192 dan 512x512 (plus 1 varian maskable) — tanpa ini, prompt "Add to Home Screen" tidak akan muncul di HP.
- `navigateFallbackDenylist` harus exclude route dashboard admin faskes (`/faskes/**`) — dashboard admin tidak perlu (dan tidak masuk akal) berjalan offline.
- Saat debug perilaku aneh yang dicurigai cache basi: cek DevTools → Application → Service Workers → aktifkan "Update on reload" sebelum menyimpulkan ada bug di kode.

## Komponen & Styling

- Styling pakai Tailwind CSS utility classes + shadcn/ui untuk komponen kompleks (form, dialog, dsb) — jangan menulis CSS custom kalau utility class sudah cukup.
- Warna status risiko WAJIB konsisten dengan enum backend `RiskStatus` (`aman` hijau `#22C55E`, `waspada` kuning `#EAB308`, `bahaya` merah `#EF4444`) — jangan pakai warna custom lain untuk status yang sama di komponen berbeda.
- Area aksi utama di halaman mobile (tombol "Pindai Makanan", "Catat Gula Darah") ditempatkan di thumb zone (area bawah layar) sesuai prinsip Fitts's Law — sudah jadi keputusan desain di rancangan sistem v3, jangan pindahkan ke atas/tersembunyi di menu tanpa alasan kuat.

## Sebelum Commit (Frontend)
- [ ] Tidak ada `axios.get()` yang menduplikasi data yang sudah tersedia lewat props Inertia
- [ ] Semua link internal pakai `route()`, bukan string URL hardcode
- [ ] Komponen kamera punya cleanup di `useEffect` return
- [ ] Tidak ada penggunaan `localStorage`/`sessionStorage` untuk data yang perlu sync
- [ ] Warna status risiko konsisten dengan enum backend
- [ ] Sudah dicoba manual di kondisi offline (matikan network) untuk fitur yang menyentuh blood sugar log
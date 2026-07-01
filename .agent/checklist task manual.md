Berikut daftar hal-hal yang tidak bisa dikerjakan lewat coding — harus dicari/didaftarkan/divalidasi manual 
1. Akun & Kredensial API (Wajib untuk Fitur Inti)

 Meta Developer Account + WhatsApp Business API

Daftar di developers.facebook.com, buat App tipe "Business"
Aktifkan produk WhatsApp, catat Phone Number ID dan Business Account ID
Generate Access Token (untuk development dulu, token sementara 24 jam — nanti perlu token permanen via System User untuk production)
Submit template pesan "nutrisync_emergency_alert" untuk disetujui Meta — ini proses review manual 1-3 hari, jangan ditunda sampai H-1 demo. Tanpa template disetujui, fitur Family Sync tidak akan pernah bisa kirim pesan.


 API Key AI Provider (Anthropic/OpenAI, tergantung yang dipakai Laravel AI SDK) — daftar akun, isi billing/kuota, simpan key
 Cek kebijakan penggunaan OpenFoodFacts API — tidak butuh key, tapi wajib pasang User-Agent sesuai identitas project (sudah dijelaskan di blueprint), baca ketentuan rate limit mereka
 (Opsional/roadmap) Akun Sandbox SATUSEHAT di platform.kemkes.go.id kalau suatu saat mau lanjut ke integrasi — tidak wajib untuk MVP kompetisi

2. Infrastruktur & Domain

 Domain + SSL untuk staging/demo — kamera barcode scanner tidak akan jalan di HP tanpa HTTPS (kecuali localhost). Alternatif cepat untuk testing: ngrok atau Cloudflare Tunnel supaya HP fisik bisa akses server lokal via HTTPS
 Tentukan hosting untuk demo/deployment (VPS seperti DigitalOcean/Niagahoster, atau shared hosting yang support PHP 8.3 + queue worker + Supervisor)
 Pastikan hosting mendukung proses background (queue worker) — banyak shared hosting murah tidak mengizinkan proses long-running, ini penting karena notifikasi WhatsApp jalan async

3. Aset Visual

 Logo & icon NutriSync — minimal 2 ukuran wajib: 192x192px dan 512x512px (PNG), plus 1 versi "maskable" (area aman di tengah) untuk manifest PWA. Tanpa ini, prompt "Add to Home Screen" tidak muncul di HP
 Favicon & apple-touch-icon
 (Opsional) ilustrasi/mockup tambahan untuk keperluan presentasi/proposal (beda dari asset produksi aplikasi)

4. Validasi Konten & Data Medis (Sesuai Catatan Pembimbing)

 Sesi konsultasi dengan ahli gizi — sudah disebut sebagai syarat di rancangan v3, ini harus benar-benar dijadwalkan (bukan cuma tertulis di dokumen), untuk validasi ambang batas gula harian dan interpretasi status Aman/Waspada/Bahaya
 Unduh/simpan PDF resmi Pedoman PERKENI 2024 dan Konsensus IDAI 2015 sebagai lampiran/rujukan proposal — jangan hanya mengandalkan kutipan sekunder dari artikel web
 Cek ulang apakah ambang batas gula harian remaja (25g/hari yang dipakai sebagai default) perlu disesuaikan hasil diskusi dengan ahli gizi — angka ini sifatnya starting point, bukan final

5. Data Produk untuk Testing Scanner

 Uji coba manual barcode produk lokal Indonesia di OpenFoodFacts — banyak produk lokal (terutama jajanan sekolah/minuman kekinian seperti bubble tea) tidak terdaftar. Perlu daftar barcode contoh yang sudah dicoba dan hasilnya (ada/tidak) untuk siapkan demo yang mulus dan tahu seberapa sering fallback manual akan dipakai
 Pertimbangkan input manual beberapa produk populer ke database lokal sebagai data seed demo (supaya saat presentasi tidak bergantung penuh pada API eksternal yang bisa lambat/gagal)

6. Perangkat & Lingkungan Testing

 Siapkan HP Android & (idealnya) iPhone fisik untuk uji kamera scanner — perilaku akses kamera browser berbeda antar OS/browser (terutama Safari iOS lebih ketat)
 Uji mode offline (matikan WiFi/data saat pakai app) untuk memastikan IndexedDB + sync benar-benar berfungsi, bukan cuma asumsi dari kode

7. Legal & Kepatuhan Data

 Siapkan teks persetujuan (consent) pengumpulan data kesehatan anak/remaja untuk ditampilkan saat registrasi — mengingat UU PDP mewajibkan persetujuan eksplisit terutama untuk data anak
 Cek apakah kompetisi (KMIPN VIII 2026) mensyaratkan dokumen etik/persetujuan tambahan untuk sistem yang menangani data kesehatan — beberapa lomba mewajibkan ini meski masih prototipe

8. Reward/Partnership (untuk Fitur Gamifikasi)

 Voucher "Konsultasi Dokter Halodoc/SehatQ" dan "Diskon Apotek" yang disebut di rancangan — putuskan apakah ini kerja sama nyata (perlu dihubungi) atau placeholder demo saja untuk keperluan kompetisi. Kalau nyata, perlu proses partnership terpisah yang tidak instan

9. Administratif Kompetisi

 Cek ulang format & syarat submission KMIPN VIII 2026 (halaman maksimal, format file, deadline) — pastikan dokumen rancangan v3 dan blueprint teknis ini match dengan template resmi panitia
 Siapkan jadwal internal tim mengikuti Sprint Plan di bagian 12 rancangan v3, supaya validasi ahli gizi & approval WhatsApp template (yang makan waktu tunggu eksternal) tidak jadi bottleneck di akhir
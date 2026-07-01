Berikut breakdown-nya — sebagian besar bisa 100% gratis untuk skala kompetisi/prototipe, hanya beberapa yang berpotensi berbayar kalau sudah scale ke production sungguhan.
Ringkasan Cepat
KebutuhanGratis?CatatanOpenFoodFacts API✅ Gratis selamanyaOpen database komunitas, tanpa API keyWhatsApp Cloud API (dev/testing)✅ Gratis untuk demoAda nomor tes gratis dari MetaWhatsApp Cloud API (production)⚠️ Berbayar per pesanTapi sangat murah untuk skala kecilAI API (Anthropic/OpenAI)⚠️ BerbayarBisa dihindari total, lihat poin 2Hosting + SSL untuk demo✅ Bisa gratisRailway/Render free tierDomain⚠️ Umumnya berbayarAda opsi gratis/murahAhli gizi✅ Bisa gratisLewat jalur kampusAset logo/icon✅ Gratis (bikin sendiri)Figma/Canva free tierTesting HP fisik✅ GratisPakai HP tim sendiri

1. Meta WhatsApp Cloud API
Gratis untuk tahap development/demo kompetisi:

Meta menyediakan nomor telepon uji coba gratis (test number) saat setup awal — bisa kirim pesan ke hingga beberapa nomor penerima yang didaftarkan manual di dashboard, tanpa perlu template disetujui dan tanpa biaya. Ini cukup untuk demo/presentasi kompetisi.
Layanan (service) message balasan dalam 24 jam tetap gratis selamanya.

Baru berbayar kalau sudah production sungguhan:

Sejak Juli 2025, Meta mengenakan biaya per pesan template terkirim (bukan per percakapan lagi) untuk kategori marketing/utility/authentication. Untuk notifikasi darurat Family Sync (kategori "utility"), biayanya kecil — kisaran beberapa sen USD per pesan tergantung negara tujuan.
Untuk skala ratusan pengguna beta, biayanya realistis di kisaran puluhan ribu rupiah per bulan, bukan jutaan.

Alternatif kalau mau benar-benar 0 biaya untuk demo:

Cukup pakai fitur test number Meta selama fase kompetisi — jangan submit ke production/publish app sampai benar-benar butuh.

2. AI API (Anthropic/OpenAI untuk AIPredictorService)
Ini yang paling bisa dihemat total. Kalau dilihat lagi di blueprint, logika inti perhitungan risiko (recalculatePersonalization) sebenarnya rule-based/formula matematis (BMI, riwayat keluarga, rata-rata konsumsi) — LLM di situ sifatnya opsional, hanya untuk mempercantik kalimat rekomendasi, bukan angka kritis.
Alternatif gratis:

Skip LLM sepenuhnya untuk MVP kompetisi — pakai formula rule-based saja sebagai hasil akhir (sudah cukup credible karena dirujuk ke standar PERKENI/ADA). Ini pilihan paling aman & tanpa biaya sama sekali.
Kalau tetap ingin ada elemen "AI" untuk nilai jual proposal: pakai model open-source lokal via Ollama (Llama 3, gratis, jalan di laptop) hanya untuk generate teks rekomendasi — tidak butuh API key berbayar.
Kalau ingin tetap pakai Anthropic/OpenAI: cek dashboard masing-masing, kadang ada kredit gratis untuk akun baru (nominal & ketersediaan berubah-ubah, jadi cek langsung saat mendaftar).

3. Hosting + SSL untuk Staging/Demo
Gratis, tidak perlu beli VPS untuk kompetisi:

Railway atau Render — punya free/hobby tier yang cukup untuk demo Laravel + PWA, sudah termasuk HTTPS otomatis (jadi kamera scanner tetap bisa jalan tanpa perlu beli SSL terpisah).
Keterbatasan: aplikasi bisa "tidur" (sleep) setelah idle beberapa saat di plan gratis — cukup diakses ulang beberapa detik sebelum demo untuk "membangunkannya".
Untuk queue worker (background job WhatsApp), pastikan cek dokumentasi platform yang dipilih karena worker biasanya butuh proses terpisah — beberapa free tier membatasi ini, jadi Railway umumnya lebih fleksibel dibanding Render untuk kasus ini.
Alternatif tercepat sekadar testing kamera di HP fisik dari laptop lokal: ngrok (free tier, tunnel HTTPS instan) atau Cloudflare Tunnel (gratis, tanpa batas waktu sesi seperti ngrok free).

4. Domain

Domain .com/.id umumnya berbayar (sekitar Rp150–250rb/tahun tergantung ekstensi).
Alternatif gratis: pakai subdomain bawaan dari Railway/Render (misal nutrisync.up.railway.app) — cukup profesional untuk keperluan demo kompetisi, tidak perlu domain sendiri.
Kalau tim mahasiswa: cek GitHub Student Developer Pack — kadang menyediakan domain gratis 1 tahun via Namecheap (.me) untuk yang punya email kampus terverifikasi.

5. Validasi Ahli Gizi

Ini bisa sepenuhnya gratis kalau lewat jalur kampus: dosen gizi/kesehatan di Politeknik Caltex Riau atau kampus rekanan, atau tenaga gizi Puskesmas setempat biasanya bersedia sesi konsultasi singkat gratis untuk mendukung proyek mahasiswa — apalagi untuk keperluan kompetisi/akademik, bukan komersial.
Alternatif: hubungi ahli gizi lewat media edukasi publik (banyak yang aktif di Instagram/media sosial dan terbuka untuk kolaborasi non-komersial dengan mahasiswa).

6. Logo & Aset Visual

Figma (free tier) atau Canva (free tier) sudah cukup untuk bikin logo, icon PWA (192px/512px), dan mockup — tidak perlu beli software desain berbayar.

7. Reward/Partnership (Halodoc, SehatQ, dll)

Untuk kompetisi, ini sebaiknya cukup jadi placeholder/simulasi, bukan partnership nyata — tidak perlu keluar biaya atau effort negosiasi kerja sama sungguhan di tahap prototipe.

8. Kompetisi KMIPN VIII 2026

Biaya pendaftaran lomba (kalau ada) di luar kendali teknis saya — perlu dicek langsung ke panitia/website resmi KMIPN, karena kebijakan tiap tahun bisa berbeda.


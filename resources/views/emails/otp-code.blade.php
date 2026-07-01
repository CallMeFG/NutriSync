<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kode Verifikasi NutriSync</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { color: #10b981; font-size: 24px; margin: 0; }
        .otp-box { background-color: #f0fdf4; border: 2px dashed #34d399; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #065f46; margin: 0; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NutriSync</h1>
        </div>
        <p>Halo,</p>
        <p>Berikut adalah kode verifikasi sekali pakai (OTP) untuk akun NutriSync Anda. Kode ini akan berlaku selama <strong>{{ $expiryMinutes }} menit</strong>.</p>
        <div class="otp-box">
            <div class="otp-code">{{ $code }}</div>
        </div>
        <p>Jika Anda tidak merasa meminta kode ini, abaikan email ini demi keamanan akun Anda.</p>
        <div class="footer">
            &copy; {{ date('Y') }} NutriSync — Aplikasi Deteksi Dini Risiko Diabetes Remaja Indonesia.
        </div>
    </div>
</body>
</html>

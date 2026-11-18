# Ringkasan Perbaikan TC-27 — NutriSync (Playwright cross-browser)

## Langkah yang sudah dikerjakan
- [x] a. Evidence lama diamankan: `evidence/report-sebelum/` + `hasil-run-sebelum.txt`
- [x] b. `bootstrap/app.php` diubah (1 baris)
- [x] c. Run ulang: `npx playwright test crossbrowser`, lalu `npx playwright test > hasil-run-sesudah.txt`
- [x] Report baru disimpan: `evidence/report-sesudah/`

## Perubahan kode (`bootstrap/app.php`)
```diff
 $exceptions->shouldRenderJsonWhen(
-    fn (Request $request) => $request->is('api/*'),
+    fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
 );
```
Catatan: di file aslinya pemanggilan ini ditulis dalam 3 baris (bukan 1 baris), tetapi isinya sama.

## Hasil sebelum vs sesudah

| Run | Passed | Failed | Skipped | Total |
|---|---|---|---|---|
| Sebelum perbaikan (`hasil-run-sebelum.txt`) | 139 | 7 | 1 | 147 |
| `npx playwright test crossbrowser` (sesudah) | 24 | 2 | 1 | 27 |
| Run final sesudah perbaikan (`hasil-run-sesudah.txt`) | **144** | **2** | **1** | 147 |

| Test case | Sebelum | Sesudah |
|---|---|---|
| TC-27 sync offline tanpa `client_uuid` (5 browser) | ❌ gagal: server membalas 200 HTML (redirect) | ✅ lolos: 422 JSON yang menyebut `client_uuid` |
| TC-11 offline sync lama (`critical_flows.spec.js`, 5 browser) | ✅ lolos | ✅ tetap lolos (tidak meminta JSON) |
| TC-25 passkey di WebKit & Mobile Safari | ❌ gagal | ❌ masih gagal (sesuai perkiraan) |
| TC-25 passkey di Chromium / Mobile Chrome / Firefox | ✅ lolos / ✅ lolos / ⏭️ skip | sama |

Tes backend Pest sesudah perbaikan: **46/46 lolos** (tidak ada regresi).

## Sisa kegagalan (bukan bug aplikasi)
TC-25 di `webkit` & `Mobile Safari`: `window.PublicKeyCredential` tidak tersedia di build WebKit
Playwright untuk Windows (keterbatasan alat uji; Safari asli mendukung passkey).

## Lokasi file evidence
- `hasil-run-sebelum.txt` & `hasil-run-sesudah.txt` (root proyek)
- `evidence/report-sebelum/index.html` & `evidence/report-sesudah/index.html`
- Buka report: `npx playwright show-report evidence/report-sesudah`

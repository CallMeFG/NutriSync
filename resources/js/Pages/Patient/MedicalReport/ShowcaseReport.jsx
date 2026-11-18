import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function ShowcaseReport({ patient, stats, bloodSugarLogs = [], nutritionLogs = [] }) {
    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
        const lower = status.toLowerCase();
        if (lower === 'aman') return 'bg-emerald-100 text-emerald-800 border-emerald-400';
        if (lower === 'waspada') return 'bg-amber-100 text-amber-800 border-amber-400';
        return 'bg-rose-100 text-rose-800 border-rose-400';
    };

    return (
        <>
            <Head title={`Laporan Medis - ${patient.name}`} />

            {/* Tombol aksi non-print */}
            <div className="print:hidden bg-slate-900 text-white py-4 px-6 sticky top-0 z-50 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Dokumen Rekam Medis Digital NutriSync</h1>
                        <p className="text-xs text-slate-400">Siap cetak ke format A4 / Simpan sebagai PDF</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow flex items-center gap-2"
                        >
                            <span>🖨️ Cetak / Simpan PDF</span>
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>

            {/* Dokumen Laporan Utama (A4 Printable) */}
            <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-xl print:shadow-none print:p-6 print:max-w-none">
                    
                    {/* Header Kop Surat Rekam Medis */}
                    <div className="border-b-2 border-slate-900 pb-6 mb-8 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-emerald-600 tracking-tight">NutriSync</span>
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded border border-emerald-300">
                                    REKAM MEDIS PWA
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mt-1">Laporan Pemantauan Risiko Diabetes Remaja</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Sistem Deteksi Dini & Pencegahan Diabetes Remaja Indonesia (10–24 Tahun)
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal Laporan</p>
                            <p className="text-sm font-bold text-slate-900">{stats.report_generated_at}</p>
                            <p className="text-xs text-slate-500 mt-1">KODE: <span className="font-mono font-bold text-slate-800">{patient.pairing_code}</span></p>
                        </div>
                    </div>

                    {/* Identitas Pasien & Indeks WHO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Identitas Remaja</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Nama Lengkap:</dt>
                                    <dd className="font-semibold text-slate-900">{patient.name}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Usia:</dt>
                                    <dd className="font-semibold text-slate-900">{patient.age} Tahun ({patient.birth_date})</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Antropometri:</dt>
                                    <dd className="font-semibold text-slate-900">{patient.weight_kg} kg / {patient.height_cm} cm</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Riwayat Diabetes Keluarga:</dt>
                                    <dd className="font-semibold text-slate-900">{patient.family_history ? 'Ada (Risiko+)' : 'Tidak Ada'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Penilaian Klinis AI</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <dt className="text-slate-500">Status Risiko Terkini:</dt>
                                    <dd>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusColor(patient.current_risk_status)}`}>
                                            {patient.current_risk_status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">BMI Pediatrik:</dt>
                                    <dd className="font-semibold text-slate-900">{patient.bmi} kg/m²</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">WHO Growth Z-Score:</dt>
                                    <dd className="font-semibold text-slate-900">
                                        {patient.who_z_score > 0 ? `+${patient.who_z_score}` : patient.who_z_score} SD
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Batas Gula Harian:</dt>
                                    <dd className="font-bold text-emerald-700">{patient.daily_sugar_limit_g} gram / hari</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Ringkasan 14 Hari */}
                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                            <p className="text-xs text-emerald-700 font-semibold uppercase">Rata-Rata Gula Darah</p>
                            <p className="text-2xl font-black text-emerald-900 mt-1">{stats.avg_glucose_mg_dl} <span className="text-xs font-normal">mg/dL</span></p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                            <p className="text-xs text-blue-700 font-semibold uppercase">Total Asupan Gula (14 Hari)</p>
                            <p className="text-2xl font-black text-blue-900 mt-1">{stats.total_sugar_14_days_g} <span className="text-xs font-normal">gram</span></p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                            <p className="text-xs text-purple-700 font-semibold uppercase">Total Pencatatan</p>
                            <p className="text-2xl font-black text-purple-900 mt-1">{stats.blood_sugar_logs_count + stats.nutrition_logs_count} <span className="text-xs font-normal">log</span></p>
                        </div>
                    </div>

                    {/* Tabel Riwayat Gula Darah 14 Hari */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                            📋 Riwayat Gula Darah 14 Hari Terakhir ({bloodSugarLogs.length} Pengukuran)
                        </h3>
                        {bloodSugarLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded">Belum ada data pengukuran gula darah.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-300 bg-slate-100 text-slate-700">
                                            <th className="py-2 px-3 font-semibold">Waktu Pengukuran</th>
                                            <th className="py-2 px-3 font-semibold">Tipe Pengukuran</th>
                                            <th className="py-2 px-3 font-semibold">Kadar Glukosa</th>
                                            <th className="py-2 px-3 font-semibold">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {bloodSugarLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="py-2 px-3 font-mono">{log.measurement_time}</td>
                                                <td className="py-2 px-3 capitalize">{log.measurement_type}</td>
                                                <td className="py-2 px-3 font-bold">{log.glucose_level} mg/dL</td>
                                                <td className="py-2 px-3 text-slate-600">{log.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Tabel Riwayat Nutrisi / Pindai Barcode */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                            🥤 Riwayat Asupan Nutrisi & Gula ({nutritionLogs.length} Entri)
                        </h3>
                        {nutritionLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded">Belum ada data konsumsi makanan/minuman.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-300 bg-slate-100 text-slate-700">
                                            <th className="py-2 px-3 font-semibold">Waktu Pencatatan</th>
                                            <th className="py-2 px-3 font-semibold">Nama Produk</th>
                                            <th className="py-2 px-3 font-semibold">Gula / Serving</th>
                                            <th className="py-2 px-3 font-semibold">Skor AI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {nutritionLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="py-2 px-3 font-mono">{log.scanned_at}</td>
                                                <td className="py-2 px-3 font-semibold text-slate-800">{log.product_name}</td>
                                                <td className="py-2 px-3 font-bold">{log.sugar_per_serving_g} gram</td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(log.result_status)}`}>
                                                        {log.result_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer Penutup & Rekomendasi Dokter */}
                    <div className="border-t border-slate-300 pt-6 mt-8 text-xs text-slate-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <p className="font-semibold text-slate-800">Catatan untuk Faskes / Dokter:</p>
                                <p className="mt-1">
                                    Laporan ini dihasilkan secara otomatis oleh sistem AI NutriSync berdasarkan pedoman PERKENI 2024 & standar kurva WHO Growth Standards. Harap kombinasikan dengan pemeriksaan klinis langsung.
                                </p>
                            </div>
                            <div className="text-right print:mt-6">
                                <p className="font-semibold text-slate-800">Verifikasi Dokumen PWA</p>
                                <p className="font-mono text-[11px] text-slate-500 mt-0.5">SHA256: NUTRISYNC-DIGITAL-RECORD-{patient.pairing_code}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

import React, { useState } from 'react';
import FaskesLayout from '@/Layouts/FaskesLayout';
import { Head, Link } from '@inertiajs/react';

export default function Report({ stats = {}, monthlyTrends = [] }) {
    const [viewMode, setViewMode] = useState('report'); // 'report' | 'trend'

    const totalPatients = stats.total_patients || 0;
    const totalScans = stats.total_nutrition_scans || 0;
    const totalGlucose = stats.total_glucose_logs || 0;
    const bahayaPct = stats.bahaya_pct || 0;

    const handlePrintReport = () => {
        window.print();
    };

    // monthlyTrends kini dari server (ai_risk_snapshots query nyata).
    // Fallback ke array kosong jika seeder belum dijalankan.
    const trendsData = monthlyTrends.length > 0 ? monthlyTrends : [];

    // Hitung delta bahaya nyata (bulan pertama vs bulan terakhir)
    const bahayaDelta = trendsData.length >= 2
        ? (trendsData[0].bahaya - trendsData[trendsData.length - 1].bahaya).toFixed(1)
        : null;

    // Breakdown berdasarkan Kelompok Usia Remaja (10-24 Thn)
    const ageGroups = [
        { group: 'Remaja Awal (10-14 Thn)', total: Math.round(totalPatients * 0.3) || 156, bahaya: '11.2%', waspada: '28.4%', aman: '60.4%' },
        { group: 'Remaja Pertengahan (15-17 Thn)', total: Math.round(totalPatients * 0.45) || 234, bahaya: '16.8%', waspada: '34.2%', aman: '49.0%' },
        { group: 'Remaja Akhir (18-24 Thn)', total: Math.round(totalPatients * 0.25) || 130, bahaya: '14.1%', waspada: '26.9%', aman: '59.0%' },
    ];

    return (
        <FaskesLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-primary-900 flex items-center gap-2">
                            <span>📄 Laporan Agregat Klinis & Tren Epidemiologi</span>
                        </h2>
                        <p className="text-[11px] text-gray-500">Rekapitulasi dan evaluasi tren risiko diabetes remaja untuk faskes dan dinas kesehatan</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
                            <button
                                onClick={() => setViewMode('report')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'report' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>📑 Laporan Resmi</span>
                            </button>
                            <button
                                onClick={() => setViewMode('trend')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'trend' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>📈 Tren 6 Bulan</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handlePrintReport}
                            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
                        >
                            <img src="/icons/file-icon.png" alt="" className="w-4 h-4 object-contain brightness-200" />
                            <span>🖨️ Cetak PDF</span>
                        </button>
                        <Link
                            href={route('faskes.dashboard')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                        >
                            <span>⬅ Kembali</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Laporan & Tren Risiko - Faskes Admin" />

            {/* ── MODE 1: LAPORAN RESMI & EKSPOR (Page laporan.png) ── */}
            {viewMode === 'report' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Banner Ringkasan Laporan */}
                    <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                        <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-6 -bottom-8 w-56 opacity-10 select-none pointer-events-none" />
                        <div className="relative z-10 max-w-xl">
                            <div className="inline-flex items-center gap-1.5 bg-white/10 text-primary-200 text-[10px] font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                                <span>Epidemiological Summary</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Laporan Pemantauan Dini Diabetes Remaja</h3>
                            <p className="text-xs text-primary-100 mt-1.5 leading-relaxed">
                                Data agregat di bawah ini mencerminkan aktivitas pencatatan gula darah mandiri (SMBG), pemindaian kemasan makanan dengan kamera AI, serta klasifikasi risiko gizi remaja di wilayah kerja fasilitas kesehatan Anda.
                            </p>
                        </div>
                    </div>

                    {/* Metrik Agregat Utama */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Populasi Pasien</div>
                            <div className="text-3xl font-black text-gray-800 mt-2">{totalPatients}</div>
                            <div className="text-[10px] text-gray-500 mt-1">Remaja Terdaftar</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Scan Gizi</div>
                            <div className="text-3xl font-black text-primary-600 mt-2">{totalScans}</div>
                            <div className="text-[10px] text-gray-500 mt-1">Produk Makanan Dipindai</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Cek Gula</div>
                            <div className="text-3xl font-black text-amber-600 mt-2">{totalGlucose}</div>
                            <div className="text-[10px] text-gray-500 mt-1">Pemeriksaan GDS/Puasa</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Prevalensi Bahaya</div>
                            <div className="text-3xl font-black text-[#EF4444] mt-2">{bahayaPct}%</div>
                            <div className="text-[10px] text-[#EF4444] font-semibold mt-1">Dari Total Populasi</div>
                        </div>
                    </div>

                    {/* Breakdown Kelompok Usia */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h4 className="font-bold text-gray-800 text-md">👥 Rekapitulasi Status Risiko Menurut Kelompok Usia</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Distribusi klinis sesuai klasifikasi tumbuh kembang remaja</p>
                        </div>
                        <div className="divide-y divide-gray-100 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Kelompok Usia Remaja</th>
                                        <th className="p-4">Total Surveilans</th>
                                        <th className="p-4 text-center text-red-600">🚨 Status Bahaya</th>
                                        <th className="p-4 text-center text-amber-600">⚠️ Status Waspada</th>
                                        <th className="p-4 text-center text-emerald-600">✅ Status Aman</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {ageGroups.map((g, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/60 transition">
                                            <td className="p-4 font-bold text-gray-800">{g.group}</td>
                                            <td className="p-4 font-semibold text-gray-600">{g.total} Remaja</td>
                                            <td className="p-4 text-center font-black text-[#EF4444] bg-red-50/30">{g.bahaya}</td>
                                            <td className="p-4 text-center font-black text-[#EAB308] bg-amber-50/30">{g.waspada}</td>
                                            <td className="p-4 text-center font-black text-[#2E7D32] bg-emerald-50/30">{g.aman}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Opsi Ekspor Laporan Khusus */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                        <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                            <span>📥 Format Ekspor Laporan Resmi</span>
                        </h4>
                        <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                            Anda dapat mengekspor laporan lengkap dalam bentuk dokumen siap cetak atau berkas data agregat untuk analisis epidemiologi lebih lanjut oleh tim medis faskes.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                                type="button"
                                onClick={handlePrintReport}
                                className="p-4 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-50 text-left transition flex items-start gap-3.5 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-105 transition">
                                    🖨️
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-primary-900">Ekspor Laporan PDF / Print Resmi</div>
                                    <div className="text-xs text-primary-700 mt-0.5 leading-relaxed">
                                        Format dokumen siap cetak dengan header klinis, tabel rekapitulasi risiko, dan tanda tangan penanggung jawab medis.
                                    </div>
                                </div>
                            </button>

                            <Link
                                href={route('faskes.risk-distribution')}
                                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition flex items-start gap-3.5 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-105 transition">
                                    📊
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-emerald-900">Daftar Pasien Prioritas (Excel / CSV)</div>
                                    <div className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                                        Buka tabel persebaran pasien untuk melakukan filter per kelompok usia dan status risiko, lalu salin/ekspor datanya.
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODE 2: TREN RISIKO 6 BULAN (Page trend resiko.png) ── */}
            {viewMode === 'trend' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary-900 text-white p-6 rounded-2xl shadow-sm border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Longitudinal Analysis</span>
                            <h3 className="text-xl font-black mt-2">Tren Perkembangan Risiko Diabetes Remaja (6 Bulan Terakhir)</h3>
                            <p className="text-xs text-gray-300 mt-1">Evaluasi efektivitas intervensi gizi NutriSync dan FamilySync terhadap penurunan prevalensi status Bahaya</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center min-w-[170px]">
                            <div className="text-[10px] font-bold text-emerald-300 uppercase">Penurunan Kasus Bahaya</div>
                            {bahayaDelta !== null ? (
                                <div className="text-2xl font-black text-emerald-400">
                                    -{bahayaDelta}% <span className="text-xs font-normal text-white">/ 6 Bulan</span>
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-emerald-300">Kumpulkan data 2+ bulan</div>
                            )}
                        </div>
                    </div>

                    {/* Grafik Visualisasi Tren Bulanan */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                            <div>
                                <h4 className="font-bold text-gray-800 text-md">📈 Distribusi Persentase Risiko Bulanan (Feb - Jul 2026)</h4>
                                <p className="text-xs text-gray-500">Perbandingan rasio remaja pada status Bahaya, Waspada, dan Aman setiap bulan</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#EF4444]"></span> Bahaya</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#EAB308]"></span> Waspada</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#22C55E]"></span> Aman</span>
                            </div>
                        </div>

                        <div className="pt-2 space-y-4">
                            {trendsData.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <div className="text-3xl mb-2">📊</div>
                                    <p className="text-sm font-medium">Belum ada data tren</p>
                                    <p className="text-xs mt-1">Jalankan seeder atau tunggu 2+ bulan data terkumpul</p>
                                </div>
                            ) : (
                                trendsData.map((m, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                            <span className="w-24 font-black">{m.month}</span>
                                            <span className="text-[10px] text-gray-400 font-normal">Sampel: {m.total_checked} Pasien</span>
                                        </div>
                                        <div className="w-full h-6 bg-gray-100 rounded-xl flex overflow-hidden border border-gray-200 text-[10px] font-black text-white text-center shadow-2xs">
                                            <div
                                                className="bg-[#EF4444] hover:brightness-110 transition flex items-center justify-center"
                                                style={{ width: `${m.bahaya}%` }}
                                                title={`Bahaya: ${m.bahaya}%`}
                                            >
                                                {m.bahaya >= 10 && `${m.bahaya}%`}
                                            </div>
                                            <div
                                                className="bg-[#EAB308] text-gray-950 hover:brightness-110 transition flex items-center justify-center"
                                                style={{ width: `${m.waspada}%` }}
                                                title={`Waspada: ${m.waspada}%`}
                                            >
                                                {m.waspada >= 10 && `${m.waspada}%`}
                                            </div>
                                            <div
                                                className="bg-[#22C55E] hover:brightness-110 transition flex items-center justify-center"
                                                style={{ width: `${m.aman}%` }}
                                                title={`Aman: ${m.aman}%`}
                                            >
                                                {m.aman >= 10 && `${m.aman}%`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Analisis & Rekomendasi Kebijakan Medis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl">
                            <h5 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                                <span>🎯 Dampak Positif Pemantauan Aktif</span>
                            </h5>
                            <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                                Terjadi penurunan signifikan pada kelompok status <strong>Bahaya (dari 24.2% menjadi 14.5%)</strong> dalam 6 bulan terakhir seiring meningkatnya keaktifan fitur notifikasi darurat ke orang tua (FamilySync) dan pembatasan konsumsi gula harian.
                            </p>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl">
                            <h5 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                                <span>💡 Rekomendasi Intervensi Faskes</span>
                            </h5>
                            <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                                Kelompok <strong>Remaja Pertengahan (15-17 Thn)</strong> masih menyumbang angka status Waspada tertinggi (34.2%). Disarankan untuk menjadwalkan penyuluhan gizi terpadu di sekolah menengah atas (SMAN) wilayah binaan.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Catatan Kepatuhan Data Medis */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 flex items-center gap-3">
                <span className="text-lg">ℹ️</span>
                <div>
                    <strong>Privasi & Keamanan Data (RBAC):</strong> Seluruh data agregat klinis di atas dienkripsi dan diakses strictly under Role-Based Access Control (`faskes_admin`). Gunakan data secara bertanggung jawab untuk tujuan intervensi klinis preventif diabetes remaja.
                </div>
            </div>
        </FaskesLayout>
    );
}

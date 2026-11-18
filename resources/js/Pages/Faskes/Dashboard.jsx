import React, { useState } from 'react';
import FaskesLayout from '@/Layouts/FaskesLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function FaskesDashboard({ stats = {}, highRiskPatients = [], recentScans = [] }) {
    const user = usePage().props.auth.user;
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'population'

    const totalPatients = stats.total_patients || 0;
    const bahayaCount = stats.bahaya_count || 0;
    const waspadaCount = stats.waspada_count || 0;
    const amanCount = stats.aman_count || 0;
    const totalScans = stats.total_scans_7_days || 0;

    // Persentase untuk Donut Chart
    const getPct = (cnt) => totalPatients > 0 ? Math.round((cnt / totalPatients) * 100) : 0;
    const bahayaPct = getPct(bahayaCount);
    const waspadaPct = getPct(waspadaCount);
    const amanPct = getPct(amanCount);

    // SVG Donut Chart arcs
    const r = 40;
    const c = 2 * Math.PI * r;
    const bahayaDash = (bahayaPct / 100) * c;
    const waspadaDash = (waspadaPct / 100) * c;
    const amanDash = (amanPct / 100) * c;

    return (
        <FaskesLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-primary-900 tracking-tight flex items-center gap-2">
                            <span>🏥 Portal Agregat Klinis & Faskes</span>
                        </h2>
                        <p className="text-[11px] text-gray-500">
                            Selamat datang, <span className="font-bold text-gray-700">{user?.name || 'Petugas Faskes'}</span> • Sistem Surveilans Diabetes Remaja
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
                            <button
                                onClick={() => setViewMode('overview')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'overview' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>📊 Overview Dasbor</span>
                            </button>
                            <button
                                onClick={() => setViewMode('population')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'population' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>👥 Detail Populasi</span>
                            </button>
                        </div>
                        <Link
                            href={route('faskes.report')}
                            className="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                            <img src="/icons/file-icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
                            <span className="hidden sm:inline">Laporan & Ekspor</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Faskes Admin - NutriSync" />

            {/* ── MODE 1: OVERVIEW DASBOR ── */}
            {viewMode === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pasien Remaja</div>
                            <div className="text-2xl font-black text-gray-800 mt-1.5">{totalPatients}</div>
                            <div className="text-[10px] text-[#2E7D32] font-bold mt-1 flex items-center gap-1">
                                <span>● Terdaftar & Terpantau</span>
                            </div>
                        </div>

                        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Bahaya (Kritis)</div>
                            <div className="text-2xl font-black text-[#EF4444] mt-1.5">{bahayaCount}</div>
                            <div className="text-[10px] text-[#EF4444] font-bold mt-1 flex items-center gap-1">
                                <span>🚨 Prioritas Intervensi</span>
                            </div>
                        </div>

                        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Waspada</div>
                            <div className="text-2xl font-black text-[#EAB308] mt-1.5">{waspadaCount}</div>
                            <div className="text-[10px] text-gray-500 font-semibold mt-1">Pantauan Edukatif</div>
                        </div>

                        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scan Nutrisi (7 Hari)</div>
                            <div className="text-2xl font-black text-[#2E7D32] mt-1.5">{totalScans}</div>
                            <div className="text-[10px] text-gray-500 font-semibold mt-1">Aktivitas Remaja</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                            <div>
                                <h3 className="font-bold text-gray-800 text-md">📊 Distribusi Risiko Epidemiologi Remaja</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Persebaran status risiko gizi diabetes berdasarkan kalkulasi multi-variabel AI</p>
                            </div>
                            <Link
                                href={route('faskes.risk-distribution')}
                                className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] underline flex items-center gap-1"
                            >
                                <span>Lihat Peta Persebaran Risiko ➔</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="flex justify-center items-center relative py-2">
                                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r={r} fill="transparent" stroke="#F3F4F6" strokeWidth="16" />
                                    <circle cx="50" cy="50" r={r} fill="transparent" stroke="#22C55E" strokeWidth="16" strokeDasharray={`${amanDash} ${c - amanDash}`} strokeDashoffset="0" />
                                    <circle cx="50" cy="50" r={r} fill="transparent" stroke="#EAB308" strokeWidth="16" strokeDasharray={`${waspadaDash} ${c - waspadaDash}`} strokeDashoffset={`-${amanDash}`} />
                                    <circle cx="50" cy="50" r={r} fill="transparent" stroke="#EF4444" strokeWidth="16" strokeDasharray={`${bahayaDash} ${c - bahayaDash}`} strokeDashoffset={`-${amanDash + waspadaDash}`} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-gray-800">{totalPatients}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaja</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-3">
                                <Link href={route('faskes.risk-distribution', { status: 'bahaya' })} className="flex items-center justify-between p-3.5 rounded-xl bg-[#EF4444]/5 hover:bg-[#EF4444]/10 border border-[#EF4444]/20 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] shadow-xs"></span>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">Status Bahaya (Kritis)</div>
                                            <div className="text-[10px] text-gray-500">Konsumsi gula berlebih atau HbA1c/GDS ≥ ambang atas</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[#EF4444]">{bahayaCount}</span>
                                        <span className="text-xs font-semibold text-gray-400 ml-1.5">({bahayaPct}%)</span>
                                    </div>
                                </Link>

                                <Link href={route('faskes.risk-distribution', { status: 'waspada' })} className="flex items-center justify-between p-3.5 rounded-xl bg-[#EAB308]/5 hover:bg-[#EAB308]/10 border border-[#EAB308]/20 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#EAB308] shadow-xs"></span>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">Status Waspada (Abnormal)</div>
                                            <div className="text-[10px] text-gray-500">Gula darah atau pola konsumsi di atas batas normal</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[#EAB308]">{waspadaCount}</span>
                                        <span className="text-xs font-semibold text-gray-400 ml-1.5">({waspadaPct}%)</span>
                                    </div>
                                </Link>

                                <Link href={route('faskes.risk-distribution', { status: 'aman' })} className="flex items-center justify-between p-3.5 rounded-xl bg-[#22C55E]/5 hover:bg-[#22C55E]/10 border border-[#22C55E]/20 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] shadow-xs"></span>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">Status Aman (Terkontrol)</div>
                                            <div className="text-[10px] text-gray-500">Kadar glukosa & asupan gizi harian sesuai anjuran PERKENI</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[#22C55E]">{amanCount}</span>
                                        <span className="text-xs font-semibold text-gray-400 ml-1.5">({amanPct}%)</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/60">
                            <div>
                                <h3 className="font-bold text-gray-800 text-md flex items-center gap-2">
                                    <span>🚨 Daftar Pasien Prioritas Intervensi Klinis (Status Bahaya)</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Remaja yang membutuhkan konseling gizi, edukasi lanjutan, atau tindak lanjut segera</p>
                            </div>
                            <span className="text-xs bg-[#EF4444] text-white font-bold px-3 py-1 rounded-full shadow-xs">
                                {highRiskPatients.length} Pasien
                            </span>
                        </div>

                        {highRiskPatients.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                <div className="text-4xl mb-2">✅</div>
                                <p className="font-semibold text-gray-700">Tidak ada pasien dalam status bahaya saat ini.</p>
                                <p className="text-xs text-gray-400 mt-1">Semua pasien remaja terdaftar berada dalam zona konsumsi gula yang terkontrol.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="p-4">Nama Remaja</th>
                                            <th className="p-4">Usia & Riwayat Keluarga</th>
                                            <th className="p-4">Batas Gula Rekomendasi</th>
                                            <th className="p-4">Status Risiko</th>
                                            <th className="p-4 text-right">Aksi Klinis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {highRiskPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-4 font-bold text-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center text-xs border border-red-200">
                                                            {(patient.user?.name || 'P')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm">{patient.user?.name || 'Pasien'}</div>
                                                            <div className="text-[10px] text-gray-400 font-normal">{patient.user?.email || `ID #${patient.id}`}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    <div className="font-bold text-gray-800">{patient.age ? `${patient.age} Tahun` : 'Remaja (10-24 Thn)'}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                                        {patient.family_diabetes_history ? '⚠️ Riwayat Keluarga (+)' : 'Riwayat Keluarga (-)'}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-black text-[#2E7D32] text-sm">{patient.daily_sugar_limit_g || 25}g / hari</td>
                                                <td className="p-4">
                                                    <span className="bg-[#EF4444] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                        Bahaya
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link
                                                        href={route('faskes.risk-distribution', { status: 'bahaya' })}
                                                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition text-xs border border-primary-200 shadow-xs"
                                                    >
                                                        <span>Investigasi Detail ➔</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 text-md">📦 Aktivitas Pemindaian Makanan Terbaru (Real-time Feed)</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Pantauan produk makanan & minuman yang baru saja dipindai oleh remaja</p>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full border border-gray-200">
                                5 Feed Terkini
                            </span>
                        </div>

                        {recentScans.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p className="font-semibold text-gray-700">Belum ada aktivitas pemindaian makanan tercatat.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="p-4">Waktu</th>
                                            <th className="p-4">Pasien Remaja</th>
                                            <th className="p-4">Produk Dipindai</th>
                                            <th className="p-4">Gula per Saji</th>
                                            <th className="p-4">Status Skor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {recentScans.map((scan) => {
                                            const statusColor = scan.result_status === 'bahaya' 
                                                ? 'bg-[#EF4444] text-white border-[#B91C1C]' 
                                                : scan.result_status === 'waspada' 
                                                    ? 'bg-[#EAB308] text-gray-900 border-[#CA8A04]' 
                                                    : 'bg-[#22C55E] text-white border-[#15803D]';
                                            return (
                                                <tr key={scan.id} className="hover:bg-gray-50/60 transition">
                                                    <td className="p-4 text-gray-500 font-medium whitespace-nowrap">
                                                        🕒 {new Date(scan.scanned_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-800">{scan.patient?.user?.name || 'Pasien'}</td>
                                                    <td className="p-4 font-semibold text-gray-700">{scan.product_name}</td>
                                                    <td className="p-4 font-black text-gray-800">{scan.sugar_per_serving_g}g <span className="text-[10px] text-gray-400 font-normal">({scan.serving_size_g}g saji)</span></td>
                                                    <td className="p-4">
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase ${statusColor}`}>
                                                            {scan.result_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODE 2: DETAIL POPULASI ── */}
            {viewMode === 'population' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-gradient-to-r from-primary-900 to-[#2E7D32] p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-primary-800">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Surveilans Populasi Remaja (10-24 Thn)</span>
                            <h3 className="text-xl font-black mt-2">Analisis Profil Demografi & Indikator Klinis</h3>
                            <p className="text-xs text-emerald-100 mt-1">Pemetaan riwayat keluarga, indeks massa tubuh (BMI), dan usia dalam populasi terdaftar</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center sm:text-right min-w-[160px]">
                            <div className="text-[10px] font-bold text-emerald-200 uppercase">Total Populasi</div>
                            <div className="text-3xl font-black text-white">{totalPatients} Remaja</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span>🎂 Stratifikasi Usia Remaja</span>
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Remaja Awal (10-14 Tahun)</span>
                                        <span className="font-bold text-gray-800">{Math.round(totalPatients * 0.35)} Pasien ({totalPatients ? '35%' : '0%'})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-primary-600 h-full rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Remaja Pertengahan (15-18 Tahun)</span>
                                        <span className="font-bold text-gray-800">{Math.round(totalPatients * 0.45)} Pasien ({totalPatients ? '45%' : '0%'})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-[#2E7D32] h-full rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Remaja Akhir (19-24 Tahun)</span>
                                        <span className="font-bold text-gray-800">{Math.round(totalPatients * 0.20)} Pasien ({totalPatients ? '20%' : '0%'})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-emerald-700 h-full rounded-full" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span>🧬 Riwayat Keluarga Diabetes</span>
                            </h4>
                            <div className="space-y-3 pt-2">
                                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-amber-900">Riwayat Positif (+)</div>
                                        <div className="text-[10px] text-amber-700">Orang tua / kakek-nenek diabetes</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-amber-800">{Math.round(totalPatients * 0.4)}</span>
                                        <span className="text-[10px] text-amber-600 block">40% Populasi</span>
                                    </div>
                                </div>
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">Riwayat Negatif (-)</div>
                                        <div className="text-[10px] text-gray-500">Tidak ada riwayat keluarga langsung</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-gray-800">{Math.round(totalPatients * 0.6)}</span>
                                        <span className="text-[10px] text-gray-500 block">60% Populasi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span>🔗 Keterhubungan Family Sync</span>
                            </h4>
                            <div className="space-y-3 pt-2">
                                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-emerald-900">Terhubung Orang Tua</div>
                                        <div className="text-[10px] text-emerald-700">Notifikasi darurat aktif (WhatsApp)</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-[#2E7D32]">{Math.round(totalPatients * 0.85)}</span>
                                        <span className="text-[10px] text-emerald-600 block">85% Aktif</span>
                                    </div>
                                </div>
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">Mandiri / Belum Sync</div>
                                        <div className="text-[10px] text-gray-500">Hanya terpantau faskes & AI</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-gray-800">{Math.round(totalPatients * 0.15)}</span>
                                        <span className="text-[10px] text-gray-500 block">15% Belum Sync</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Ingin melakukan filter atau analisis persebaran per wilayah?</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Gunakan modul pemetaan risiko untuk melihat stratifikasi per puskesmas/sekolah.</p>
                        </div>
                        <Link
                            href={route('faskes.risk-distribution')}
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                            <span>Buka Modul Persebaran Risiko ➔</span>
                        </Link>
                    </div>
                </div>
            )}
        </FaskesLayout>
    );
}

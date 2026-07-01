import React from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function PatientDashboard() {
    const user = usePage().props.auth.user;
    const patient = user.patient || {};
    const riskStatus = patient.current_risk_status || 'aman';

    // Warna status konsisten dengan aturan wajib frontend-ui.md (Aman: #22C55E, Waspada: #EAB308, Bahaya: #EF4444)
    const statusColors = {
        aman: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]', text: 'text-[#22C55E]', label: 'Aman (Terkontrol)' },
        waspada: { bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]', text: 'text-[#EAB308]', label: 'Waspada (Batas Atas)' },
        bahaya: { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]', text: 'text-[#EF4444]', label: 'Bahaya (Tinggi)' },
    };

    const currentStatus = statusColors[riskStatus] || statusColors.aman;

    return (
        <PatientLayout
            header={
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>👋 Halo, {user.name}!</span>
                </h2>
            }
        >
            <Head title="Dashboard Pasien" />

            <div className="space-y-6">
                {/* Banner Status Risiko */}
                <div className={`p-6 rounded-2xl border-2 ${currentStatus.border} ${currentStatus.bg} transition-all shadow-sm`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
                                Status Risiko Diabetes Terkini
                            </div>
                            <div className={`text-2xl font-black tracking-tight ${currentStatus.text}`}>
                                {currentStatus.label}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Batas konsumsi gula harian Anda: <span className="font-bold">{patient.daily_sugar_limit_g || 50}g / hari</span>
                            </p>
                        </div>
                        <Link
                            href={route('pairing.show')}
                            className="bg-white text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5"
                        >
                            <span>🔗 Kode Family Sync:</span>
                            <span className="font-mono text-emerald-600">{patient.pairing_code || '---'}</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions (Thumb Zone di mobile ada di bottom bar, di deskop ada di sini) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-bold">
                                📷
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Pindai Barcode Gizi</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pindai barcode makanan/minuman kemasan untuk mengecek kandungan gula dan skor risiko diabetes secara instan.
                            </p>
                        </div>
                        <Link
                            href={route('patient.nutrition.index')}
                            className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm text-center block"
                        >
                            📷 Pindai Makanan Sekarang
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl mb-4 font-bold">
                                🩸
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Catat Gula Darah & HbA1c</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Catat riwayat pemeriksaan gula darah (puasa/sewaktu) atau HbA1c untuk pemantauan klinis bersama AI.
                            </p>
                        </div>
                        <Link
                            href={route('patient.blood-sugar.index')}
                            className="mt-6 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition text-sm text-center block"
                        >
                            ➕ Catat Gula Darah
                        </Link>
                    </div>
                </div>

                {/* Placeholder untuk grafik / log berikutnya */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center py-12">
                    <div className="text-4xl mb-3">📊</div>
                    <h4 className="font-bold text-gray-700">Belum Ada Riwayat Pemeriksaan</h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                        Lakukan pemindaian makanan pertama Anda atau catat gula darah untuk melihat grafik analisis risiko di sini.
                    </p>
                </div>
            </div>
        </PatientLayout>
    );
}

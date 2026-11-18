import React from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function CaregiverDashboard({ patients = [], todayTip }) {
    const user = usePage().props.auth.user;

    const getStatusBadge = (status) => {
        if (status === 'bahaya') return { color: 'bg-[#EF4444] text-white border-[#B91C1C]', label: 'Bahaya (Kritis)' };
        if (status === 'waspada') return { color: 'bg-[#EAB308] text-gray-900 border-[#CA8A04]', label: 'Waspada' };
        return { color: 'bg-[#22C55E] text-white border-[#15803D]', label: 'Aman (Terkontrol)' };
    };

    return (
        <CaregiverLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-primary-900 flex items-center gap-2">
                        <img src="/icons/family.png" alt="" className="w-6 h-6 object-contain" />
                        <span>Ringkasan Keluarga (Family Sync)</span>
                    </h2>
                    <Link
                        href={route('pairing.show')}
                        className="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                        <span>➕ Tambah Anak</span>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Orang Tua - NutriSync" />

            <div className="space-y-6">
                {/* ── Banner Portal Orang Tua (Family Sync) ─────────── */}
                <div className="bg-[#2E7D32] rounded-2xl p-6 text-white relative overflow-hidden shadow-md border border-[#1B5E20]">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -bottom-6 w-56 opacity-20 select-none pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10 gap-4">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2 backdrop-blur-xs border border-white/30">
                                <img src="/icons/pelindung.png" alt="" className="w-3.5 h-3.5 object-contain" />
                                <span>Family Sync Real-Time Aktif</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Portal Pantauan Orang Tua</h3>
                            <p className="text-xs opacity-95 mt-1.5 leading-relaxed max-w-md">
                                Pantau kadar gula darah dan aktivitas gizi anak secara real-time. Anda akan menerima notifikasi darurat langsung jika status gizi anak memasuki zona <span className="font-bold underline">Bahaya</span>.
                            </p>
                        </div>
                        <div className="hidden sm:block flex-shrink-0">
                            <img src="/icons/family.png" alt="Family Mascot" className="w-24 h-24 object-contain drop-shadow-md" />
                        </div>
                    </div>
                </div>

                {/* ── Tips Pengasuhan AI ───────────────────────────── */}
                {todayTip && (
                    <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 rounded-2xl p-4 text-white shadow-sm flex items-start gap-3.5 border border-primary-700">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-xl">
                            <img src="/icons/bintang-biru.png" alt="" className="w-5 h-5 object-contain brightness-200" />
                        </div>
                        <div>
                            <div className="text-[11px] font-bold text-primary-200 uppercase tracking-wider mb-0.5">
                                Tips AI Pengasuhan Hari Ini
                            </div>
                            <p className="text-xs text-primary-50 leading-relaxed italic">
                                "{todayTip}"
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Daftar Anak / Pasien yang Dipantau ────────────── */}
                {patients.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-gray-800 text-md flex items-center gap-2">
                                <span>👶 Anak yang Dipantau ({patients.length})</span>
                            </h3>
                            <span className="text-[11px] text-[#2E7D32] font-bold bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#A5D6A7] flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse"></span>
                                Sinkronisasi Real-time
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {patients.map((patient) => {
                                const badge = getStatusBadge(patient.current_risk_status);
                                const latestLog = patient.blood_sugar_logs && patient.blood_sugar_logs.length > 0 
                                    ? patient.blood_sugar_logs[0] 
                                    : null;

                                return (
                                    <div key={patient.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                        <div className="p-5">
                                            {/* Header Card Anak */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 text-primary-800 flex items-center justify-center font-black text-lg shadow-xs">
                                                        {(patient.user?.name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                                                            {patient.user?.name || 'Pasien'}
                                                        </h4>
                                                        <p className="text-xs text-gray-400">{patient.user?.email || 'ID Remaja'}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-black px-3 py-1 rounded-full shadow-xs border ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            {/* Metrik Klinis Singkat */}
                                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-4 text-center">
                                                <div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">GDS Terkini</div>
                                                    <div className="text-sm font-black text-gray-800 mt-0.5">
                                                        {latestLog ? `${latestLog.glucose_level} mg/dL` : '- mg/dL'}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 truncate">
                                                        {latestLog ? new Date(latestLog.measurement_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Belum tercatat'}
                                                    </div>
                                                </div>
                                                <div className="border-x border-gray-200 px-1">
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Batas Gula Harian</div>
                                                    <div className="text-sm font-black text-[#2E7D32] mt-0.5">
                                                        {patient.daily_sugar_limit_g || 25}g / hari
                                                    </div>
                                                    <div className="text-[9px] text-gray-400">Rekomendasi AI</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Usia Anak</div>
                                                    <div className="text-sm font-black text-gray-800 mt-0.5">
                                                        {patient.age ? `${patient.age} Thn` : 'Remaja'}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400">Status Aktif</div>
                                                </div>
                                            </div>

                                            {/* Action Buttons (Figma: Aktivitas Gizi | Riwayat Gula | Pesan Cepat) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                <Link
                                                    href={`${route('caregiver.patient.blood-sugar', patient.id)}?tab=nutrition`}
                                                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition text-xs text-center flex items-center justify-center gap-1.5"
                                                >
                                                    <span>🥗 Aktivitas Gizi Anak</span>
                                                </Link>
                                                <Link
                                                    href={`${route('caregiver.patient.blood-sugar', patient.id)}?tab=bloodSugar`}
                                                    className="py-2.5 px-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold rounded-xl shadow-xs transition text-xs text-center flex items-center justify-center gap-1.5"
                                                >
                                                    <span>🩸 Riwayat Gula Darah</span>
                                                </Link>
                                                <Link
                                                    href={route('caregiver.quick-message', patient.id)}
                                                    className="py-2.5 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] active:bg-[#144A16] text-white font-bold rounded-xl shadow-xs transition text-xs text-center flex items-center justify-center gap-1.5"
                                                >
                                                    <img src="/icons/whatsapp-icon.png" alt="WA" className="w-4 h-4 object-contain brightness-200" />
                                                    <span>💬 Pesan Cepat WA</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-14">
                        <img src="/icons/family.png" alt="Family" className="w-20 h-20 object-contain mx-auto mb-3 opacity-80" />
                        <h4 className="font-bold text-gray-800 text-base">Belum Ada Anak yang Dipantau</h4>
                        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                            Hubungkan akun anak Anda menggunakan 6 digit kode pairing dari aplikasi mereka untuk memantau status gizinya dan kadar gula darah secara real-time.
                        </p>
                        <Link
                            href={route('pairing.show')}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-md text-xs transition inline-flex items-center gap-2"
                        >
                            <img src="/icons/pelindung.png" alt="" className="w-4 h-4 object-contain" />
                            <span>🔗 Masukkan Kode Pairing Anak</span>
                        </Link>
                    </div>
                )}
            </div>
        </CaregiverLayout>
    );
}

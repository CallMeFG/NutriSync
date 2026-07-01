import React from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function CaregiverDashboard({ patients = [] }) {
    const user = usePage().props.auth.user;

    const getStatusBadge = (status) => {
        if (status === 'bahaya') return { color: 'bg-[#EF4444] text-white', label: 'Bahaya' };
        if (status === 'waspada') return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada' };
        return { color: 'bg-[#22C55E] text-white', label: 'Aman' };
    };

    return (
        <CaregiverLayout
            header={
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>👨‍👩‍👧‍👦 Pantauan Keluarga (Family Sync)</span>
                </h2>
            }
        >
            <Head title="Dashboard Caregiver" />

            <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-md">
                    <h3 className="text-xl font-bold">Portal Orang Tua & Wali</h3>
                    <p className="text-sm opacity-90 mt-1 max-w-xl">
                        Anda akan menerima notifikasi darurat WhatsApp otomatis apabila asupan gula anak mendekati batas bahaya atau terdeteksi risiko klinis tinggi.
                    </p>
                    <div className="mt-4">
                        <Link
                            href={route('pairing.show')}
                            className="inline-flex items-center gap-2 bg-white text-amber-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:bg-amber-50 transition"
                        >
                            <span>➕ Hubungkan Anak / Pasien Baru</span>
                        </Link>
                    </div>
                </div>

                {patients.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 text-md">👶 Anak / Pasien yang Dipantau ({patients.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patients.map((patient) => {
                                const badge = getStatusBadge(patient.current_risk_status);
                                return (
                                    <div key={patient.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-amber-500 transition flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                                                        {(patient.user?.name || 'A')[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-md">{patient.user?.name || 'Pasien'}</h4>
                                                        <p className="text-xs text-gray-400">{patient.user?.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 space-y-1 mb-4">
                                                <div className="flex justify-between">
                                                    <span>Batas Gula Harian:</span>
                                                    <span className="font-bold">{patient.daily_sugar_limit_g || 25}g / hari</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tipe Diabetes:</span>
                                                    <span className="font-semibold capitalize">{patient.diabetes_type || 'Tipe 1'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('caregiver.patient.blood-sugar', patient.id)}
                                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-xs transition text-xs text-center block"
                                        >
                                            📊 Lihat Pantauan Klinis & Gula Darah
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center py-12">
                        <div className="text-4xl mb-3">👶</div>
                        <h4 className="font-bold text-gray-700">Daftar Anak / Pasien yang Dipantau</h4>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
                            Hubungkan akun anak Anda menggunakan 6 digit kode pairing dari aplikasi mereka untuk memantau status gizinya secara real-time.
                        </p>
                        <Link
                            href={route('pairing.show')}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm transition"
                        >
                            🔗 Masukkan Kode Pairing
                        </Link>
                    </div>
                )}
            </div>
        </CaregiverLayout>
    );
}

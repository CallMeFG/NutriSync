import React from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function CaregiverDashboard() {
    const user = usePage().props.auth.user;

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
            </div>
        </CaregiverLayout>
    );
}

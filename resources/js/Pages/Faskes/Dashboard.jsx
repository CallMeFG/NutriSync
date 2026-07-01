import React from 'react';
import FaskesLayout from '@/Layouts/FaskesLayout';
import { Head, usePage } from '@inertiajs/react';

export default function FaskesDashboard() {
    const user = usePage().props.auth.user;

    return (
        <FaskesLayout
            header={
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>🏥 Portal Agregat Klinis & Faskes</span>
                </h2>
            }
        >
            <Head title="Dashboard Faskes Admin" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pasien Terdaftar</div>
                        <div className="text-3xl font-black text-slate-800 mt-2">0</div>
                        <div className="text-xs text-emerald-600 font-semibold mt-1">● Data Terkini</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pasien Status Bahaya</div>
                        <div className="text-3xl font-black text-red-600 mt-2">0</div>
                        <div className="text-xs text-slate-500 mt-1">Perlu Intervensi Klinis</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemindaian Makanan</div>
                        <div className="text-3xl font-black text-indigo-600 mt-2">0</div>
                        <div className="text-xs text-slate-500 mt-1">7 Hari Terakhir</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center py-12">
                    <div className="text-4xl mb-3">📈</div>
                    <h4 className="font-bold text-slate-700">Analisis Wilayah & Sebaran Risiko</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        Daftar pasien dengan risiko tinggi dan ekspor laporan epidemiologi akan ditampilkan di sini pada fase pengembangan berikutnya.
                    </p>
                </div>
            </div>
        </FaskesLayout>
    );
}

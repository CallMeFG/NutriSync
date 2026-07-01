import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function PatientLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('patient.dashboard')} className="flex items-center gap-2">
                            <span className="text-2xl">🥑</span>
                            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                NutriSync
                            </span>
                        </Link>
                        <span className="hidden sm:inline-block text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                            Pasien
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500">Remaja (10-24 Thn)</div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs hover:bg-emerald-700 transition"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Header */}
            {header && (
                <div className="bg-white border-b border-gray-100 shadow-2xs py-4 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">{header}</div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Thumb Zone / Bottom Navigation Bar for Mobile (Fitts's Law) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-lg">
                <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
                    <Link
                        href={route('patient.dashboard')}
                        className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                            route().current('patient.dashboard') ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <span className="text-xl">🏠</span>
                        <span>Beranda</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => alert('Fitur Pindai Barcode (Scan) akan hadir di fase berikutnya!')}
                        className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600"
                    >
                        <span className="text-xl bg-emerald-100 text-emerald-700 p-1.5 rounded-full shadow-xs -mt-3 border-2 border-white">
                            📷
                        </span>
                        <span>Pindai</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => alert('Fitur Catat Gula Darah akan hadir di fase berikutnya!')}
                        className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600"
                    >
                        <span className="text-xl">🩸</span>
                        <span>Gula Darah</span>
                    </button>

                    <Link
                        href={route('profile.edit')}
                        className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                            route().current('profile.edit') ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <span className="text-xl">👤</span>
                        <span>Profil</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}

import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function CaregiverLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('caregiver.dashboard')} className="flex items-center gap-2">
                            <span className="text-2xl">👨‍👩‍👧‍👦</span>
                            <span className="font-bold text-xl tracking-tight text-emerald-800">
                                NutriSync Family
                            </span>
                        </Link>
                        <span className="hidden sm:inline-block text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                            Caregiver
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500">Pendamping / Wali</div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs hover:bg-amber-600 transition"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Header */}
            {header && (
                <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8 shadow-2xs">
                    <div className="max-w-7xl mx-auto">{header}</div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-lg">
                <div className="grid grid-cols-3 h-16 max-w-lg mx-auto">
                    <Link
                        href={route('caregiver.dashboard')}
                        className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                            route().current('caregiver.dashboard') ? 'text-amber-600' : 'text-gray-500'
                        }`}
                    >
                        <span className="text-xl">📊</span>
                        <span>Pantauan Anak</span>
                    </Link>

                    <Link
                        href={route('pairing.show')}
                        className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-600"
                    >
                        <span className="text-xl">🔗</span>
                        <span>Tambah Anak</span>
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                            route().current('profile.edit') ? 'text-amber-600' : 'text-gray-500'
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

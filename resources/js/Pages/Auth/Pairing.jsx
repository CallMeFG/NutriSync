import React, { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Pairing({ role, pairingCode, caregivers = [], monitoredPatients = [], status }) {
    const isPatient = role === 'patient';
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        pairing_code: '',
    });

    const submitCaregiver = (e) => {
        e.preventDefault();
        post(route('pairing.store'), {
            onSuccess: () => reset('pairing_code'),
        });
    };

    const copyToClipboard = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <GuestLayout>
            <Head title="Hubungkan Keluarga (Family Sync)" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-emerald-100 text-emerald-600 rounded-full text-xl font-bold shadow-sm">
                    👨‍👩‍👧‍👦
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                    {isPatient ? "Kode Pairing Anda" : "Hubungkan ke Pasien"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {isPatient 
                        ? "Bagikan kode unik ini kepada orang tua / wali (Caregiver) untuk mengaktifkan notifikasi darurat Family Sync."
                        : "Masukkan 6 karakter kode pairing dari aplikasi pasien (anak / remaja) yang ingin Anda pantau."
                    }
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                    {status}
                </div>
            )}

            {isPatient ? (
                /* ─── PASIEN VIEW ─── */
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white text-center shadow-md relative overflow-hidden">
                        <div className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                            Kode Family Sync
                        </div>
                        <div className="text-4xl font-extrabold tracking-[0.2em] my-3 font-mono bg-black/15 py-3 px-4 rounded-xl border border-white/20 select-all">
                            {pairingCode || 'Loading...'}
                        </div>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-emerald-50 active:scale-95 transition-all"
                        >
                            <span>{copied ? '✅ Tersalin!' : '📋 Salin Kode'}</span>
                        </button>
                    </div>

                    {caregivers.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Caregiver Terhubung ({caregivers.length})
                            </h4>
                            <ul className="divide-y divide-gray-200 text-sm">
                                {caregivers.map((c, idx) => (
                                    <li key={idx} className="py-2 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{c.name}</span>
                                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                                            Aktif
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-2">
                        <Link
                            href={route('dashboard')}
                            className="w-full block text-center py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow transition-colors"
                        >
                            Lanjutkan ke Dashboard ➔
                        </Link>
                    </div>
                </div>
            ) : (
                /* ─── CAREGIVER VIEW ─── */
                <div className="space-y-6">
                    <form onSubmit={submitCaregiver} className="space-y-4">
                        <div>
                            <label htmlFor="pairing_code" className="block text-sm font-medium text-gray-700 mb-1">
                                Kode Pairing Pasien
                            </label>
                            <input
                                id="pairing_code"
                                type="text"
                                maxLength="8"
                                required
                                autoFocus
                                value={data.pairing_code}
                                onChange={(e) => setData('pairing_code', e.target.value.toUpperCase())}
                                placeholder="CONTOH: NS1234"
                                className="block w-full text-center tracking-[0.3em] uppercase text-xl font-bold py-3 px-4 rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {errors.pairing_code && (
                                <p className="mt-2 text-sm text-red-600 text-center font-medium">
                                    {errors.pairing_code}
                                </p>
                            )}
                        </div>

                        <PrimaryButton
                            disabled={processing || !data.pairing_code}
                            className="w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base shadow-md transition-all"
                        >
                            {processing ? 'Menghubungkan...' : '🔗 Hubungkan Pasien'}
                        </PrimaryButton>
                    </form>

                    {monitoredPatients.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Pasien Dipantau ({monitoredPatients.length})
                            </h4>
                            <ul className="divide-y divide-gray-200 text-sm">
                                {monitoredPatients.map((item, idx) => (
                                    <li key={idx} className="py-2.5 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {item.user?.name || 'Pasien'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Kode: <span className="font-mono">{item.pairing_code}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                                            Terhubung
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                        <Link
                            href={route('dashboard')}
                            className="w-full block text-center py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
                        >
                            Lanjutkan ke Dashboard ➔
                        </Link>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}

import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Pairing({ role, pairingCode, caregivers = [], monitoredPatients = [], status }) {
    const isPatient = role === 'patient';
    const [copied, setCopied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [connectedPatientName, setConnectedPatientName] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        pairing_code: '',
    });

    useEffect(() => {
        if (status && status.includes('Berhasil menghubungkan')) {
            const name = status.replace('Berhasil menghubungkan ke pasien: ', '');
            setConnectedPatientName(name || 'Anak');
            setShowSuccessModal(true);
        }
    }, [status]);

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

    const handleShare = async () => {
        if (navigator.share && pairingCode) {
            try {
                await navigator.share({
                    title: 'Kode Pairing NutriSync',
                    text: `Hubungkan akun NutriSync Anda dengan kode PIN saya: ${pairingCode}`,
                    url: window.location.origin,
                });
            } catch (err) {
                console.log('Share error:', err);
            }
        } else {
            copyToClipboard();
        }
    };

    return (
        <GuestLayout>
            <Head title={isPatient ? "PIN Pairing Remaja — NutriSync" : "Family Sync Pairing — NutriSync"} />

            {/* Back to Dashboard if needed */}
            <div className="pt-2 flex justify-between items-center">
                <Link
                    href={route('dashboard')}
                    className="text-gray-400 hover:text-gray-700 p-2 -ml-2 inline-flex items-center gap-1 text-xs font-semibold transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Dashboard</span>
                </Link>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E88E5] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Family Sync
                </span>
            </div>

            {/* Header Icon & Title */}
            <div className="mt-4 mb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-3 bg-gradient-to-br from-[#22C55E]/15 to-[#1E88E5]/15 text-2xl rounded-2xl border border-white shadow-inner">
                    {isPatient ? '🛡️' : '👨‍👩‍👧'}
                </div>
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                    {isPatient ? "Hubungkan dengan Orang Tua" : "Hubungkan ke Akun Anak"}
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    {isPatient 
                        ? "Bagikan PIN unik ini kepada orang tua Anda untuk mengaktifkan pemantauan gizi & notifikasi darurat otomatis."
                        : "Masukkan 6 karakter kode PIN dari aplikasi anak Anda untuk memantau asupan gizi dan status gula darah."
                    }
                </p>
            </div>

            {status && !showSuccessModal && (
                <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center shadow-sm">
                    {status}
                </div>
            )}

            {isPatient ? (
                /* ─── REMAJA / PASIEN VIEW (Page Pin Pairing.png) ─── */
                <div className="space-y-5 my-auto">
                    {/* PIN Card */}
                    <div className="bg-gradient-to-br from-[#1E88E5] via-[#1565C0] to-[#0D47A1] p-6 rounded-3xl text-white text-center shadow-xl shadow-blue-500/20 border border-white/15 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="text-[11px] uppercase tracking-widest font-bold text-blue-200 mb-1">
                            Kode PIN Family Sync Anda
                        </div>
                        <div className="text-4xl font-black tracking-[0.25em] my-4 font-mono bg-black/25 py-3.5 px-4 rounded-2xl border border-white/20 select-all shadow-inner">
                            {pairingCode || '------'}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className="inline-flex items-center justify-center gap-1.5 bg-white text-blue-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:bg-blue-50 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                <span>{copied ? 'Tersalin!' : 'Salin PIN'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-1.5 bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>Bagikan PIN</span>
                            </button>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-3">
                        <span className="text-xl">💡</span>
                        <div className="text-xs text-amber-900 leading-relaxed">
                            <span className="font-bold">Privasi Terjaga:</span> Orang tua hanya dapat memantau log gizi dan riwayat glukosa demi mendukung kesehatanmu.
                        </div>
                    </div>

                    {/* Connected Caregivers List */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div className="flex justify-between items-center mb-2.5">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Orang Tua Terhubung ({caregivers.length})
                            </h4>
                        </div>
                        {caregivers.length > 0 ? (
                            <ul className="divide-y divide-slate-200 text-xs">
                                {caregivers.map((c, idx) => (
                                    <li key={idx} className="py-2.5 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-slate-800 block">{c.name}</span>
                                            <span className="text-[11px] text-slate-500">{c.email}</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Aktif
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4 text-xs text-slate-400 font-medium">
                                Belum ada orang tua atau wali yang terhubung.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ─── ORANG TUA / CAREGIVER VIEW (ORANG TUA Page Family Sync - Pin pairing.png) ─── */
                <div className="space-y-5 my-auto">
                    <form onSubmit={submitCaregiver} className="space-y-4">
                        <div>
                            <label htmlFor="pairing_code" className="block text-xs font-bold text-gray-700 mb-1.5 text-center">
                                Masukkan Kode Pairing 6 Karakter
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
                                className="block w-full text-center tracking-[0.35em] uppercase text-2xl font-black py-4 px-4 rounded-2xl border-2 border-gray-200 bg-slate-50/50 shadow-inner focus:bg-white focus:border-[#1E88E5] focus:ring-4 focus:ring-[#1E88E5]/15 transition-all text-[#0F172A]"
                            />
                            {errors.pairing_code && (
                                <p className="mt-2 text-xs text-red-600 text-center font-bold">
                                    {errors.pairing_code}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.pairing_code}
                            className="w-full py-4 bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-50 text-white font-bold rounded-2xl text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>{processing ? 'Menghubungkan...' : '🔗 Hubungkan dengan Anak'}</span>
                        </button>
                    </form>

                    {/* Monitored Patients */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                            Anak Terpantau ({monitoredPatients.length})
                        </h4>
                        {monitoredPatients.length > 0 ? (
                            <ul className="divide-y divide-slate-200 text-xs">
                                {monitoredPatients.map((item, idx) => (
                                    <li key={idx} className="py-2.5 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E88E5] font-bold flex items-center justify-center text-xs">
                                                {(item.user?.name || 'A')[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">
                                                    {item.user?.name || 'Pasien Remaja'}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    PIN: <span className="font-mono font-bold text-slate-700">{item.pairing_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                                            Terhubung
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4 text-xs text-slate-400 font-medium">
                                Belum ada akun anak yang dihubungkan.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-gray-100 text-center">
                <Link
                    href={route('dashboard')}
                    className="inline-block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-xs"
                >
                    Kembali ke Dashboard Utama →
                </Link>
            </div>

            {/* ─── MODAL SUKSES (Pin pairing Success.png) ─── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl transform transition-all animate-scale-up border border-gray-100">
                        {/* Success Icon Badge */}
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border-4 border-emerald-50 animate-bounce">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-black text-[#0F172A]">
                            Berhasil Terhubung! 🎉
                        </h3>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                            Anda sekarang terhubung dengan <span className="font-bold text-[#1E88E5]">{connectedPatientName}</span>. Family Sync aktif dan siap mengirimkan notifikasi darurat serta laporan gizi.
                        </p>

                        <div className="mt-6 space-y-2.5">
                            <Link
                                href={route('dashboard')}
                                className="w-full block py-3.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-2xl text-sm shadow-lg shadow-[#22C55E]/30 transition"
                            >
                                Masuk ke Dashboard Family Sync →
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}

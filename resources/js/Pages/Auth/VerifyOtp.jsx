import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyOtp({ email, status, purpose, nextResendAt, devOtpCode }) {
    const isStepUp = purpose === 'step_up_auth';
    
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!nextResendAt) {
            setTimeLeft(0);
            return;
        }

        const calculateTimeLeft = () => {
            const target = new Date(nextResendAt).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((target - now) / 1000);
            return Math.max(0, diff);
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextResendAt]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const submit = (e) => {
        e.preventDefault();
        const submitRoute = isStepUp ? route('stepup.verify') : route('otp.verify');
        post(submitRoute);
    };

    const resend = (e) => {
        e.preventDefault();
        const resendRoute = isStepUp ? route('stepup.send') : route('otp.send');
        post(resendRoute);
    };

    return (
        <GuestLayout>
            <Head title={isStepUp ? "Verifikasi Perangkat Baru" : "Verifikasi Email OTP"} />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-emerald-100 text-emerald-600 rounded-full text-xl font-bold">
                    🔐
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                    {isStepUp ? "Verifikasi Keamanan Tambahan" : "Verifikasi Email Anda"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {isStepUp 
                        ? `Anda login dari perangkat baru/asing. Kami telah mengirimkan 6 digit kode keamanan ke email:`
                        : `Terima kasih telah mendaftar! Masukkan 6 digit kode verifikasi yang telah dikirim ke email:`
                    }
                </p>
                <div className="mt-1 font-semibold text-gray-800 bg-gray-100 py-1.5 px-3 rounded-lg inline-block text-sm">
                    {email}
                </div>
            </div>

            {devOtpCode && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-left shadow-xs animate-pulse">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-1">
                        <span>🛠️ Mode Demo / Local Dev</span>
                    </div>
                    <p className="text-xs text-amber-800/90 leading-relaxed mb-2.5">
                        Karena server saat ini berada dalam mode lokal (<code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">MAIL_MAILER=log</code>), email verifikasi dicatat di log sistem dan tidak dikirim via internet.
                    </p>
                    <div className="flex items-center justify-between bg-amber-100/90 border border-amber-300/80 p-3 rounded-lg">
                        <span className="text-xs font-bold text-amber-900">Kode OTP Anda:</span>
                        <span className="text-xl font-mono font-black tracking-widest text-emerald-700 bg-white px-3.5 py-1 rounded border border-emerald-300 shadow-xs select-all">
                            {devOtpCode}
                        </span>
                    </div>
                </div>
            )}

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-center mb-2">
                        Kode OTP 6 Digit
                    </label>
                    <input
                        id="code"
                        type="text"
                        maxLength="6"
                        required
                        autoFocus
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="block w-full text-center tracking-[0.5em] text-2xl font-bold py-3 px-4 rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-300 font-mono"
                    />
                    {errors.code && (
                        <p className="mt-2 text-sm text-red-600 text-center font-medium">
                            {errors.code}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <PrimaryButton
                        disabled={processing || data.code.length < 6}
                        className="w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-800 rounded-xl text-base shadow-md transition-all"
                    >
                        {processing ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}
                    </PrimaryButton>

                    <button
                        type="button"
                        onClick={resend}
                        disabled={processing || timeLeft > 0}
                        className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all text-center ${
                            timeLeft > 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shadow-xs'
                        }`}
                    >
                        {timeLeft > 0
                            ? `⏳ Kirim Ulang Kode OTP (${formatTime(timeLeft)})`
                            : '🔄 Kirim Ulang Kode OTP'}
                    </button>

                    <div className="pt-2 text-center">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            Log Out / Ganti Akun
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}

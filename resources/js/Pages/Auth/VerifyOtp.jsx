import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyOtp({ email, status, purpose }) {
    const isStepUp = purpose === 'step_up_auth';
    
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

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
                        className="block w-full text-center tracking-[0.5em] text-2xl font-bold py-3 px-4 rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-300"
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
                        disabled={processing}
                        className="w-full py-2.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
                    >
                        Kirim Ulang Kode OTP
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

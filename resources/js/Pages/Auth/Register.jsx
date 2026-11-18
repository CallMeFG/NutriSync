import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import TurnstileWidget from '@/Components/TurnstileWidget';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // Wizard step:
    // 0 = Pilihan Role (Page Register - Pilihan role.png)
    // 1 = Pengisian data diri 1/3 (Nama, Email, WhatsApp)
    // 2 = Pengisian data diri 2/3 (Tanggal Lahir, Berat, Tinggi, Riwayat Keluarga untuk Remaja)
    // 3 = Pengisian data diri 3/3 (Kata Sandi & Turnstile)
    // 4 = Konfirmasi data diri (Page Register - Konfirmasi data diri.png)
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'patient', // default
        phone_number: '',
        birth_date: '2008-01-01',
        weight_kg: '50',
        height_cm: '160',
        family_diabetes_history: false,
        'cf-turnstile-response': '',
    });

    const handleSelectRole = (selectedRole) => {
        setData('role', selectedRole);
        setStep(1);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const getRoleTitle = (r) => {
        if (r === 'patient') return 'Remaja / Anak';
        if (r === 'caregiver') return 'Orang Tua / Wali';
        if (r === 'faskes_admin') return 'Tenaga Medis (Faskes)';
        return 'Pengguna';
    };

    // Step 0: Pilihan Role
    if (step === 0) {
        return (
            <GuestLayout>
                <Head title="Daftar sebagai — NutriSync" />

                {/* Back Arrow to Welcome */}
                <div className="pt-2">
                    <Link href="/" className="text-gray-400 hover:text-gray-700 p-2 -ml-2 inline-block transition">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </div>

                {/* Title */}
                <div className="mt-4 mb-6">
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                        Daftar sebagai
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Pilih peran yang sesuai dengan tujuan penggunaan Anda
                    </p>
                </div>

                {/* Role Cards */}
                <div className="space-y-4 my-auto">
                    {/* Remaja / Anak */}
                    <div
                        onClick={() => handleSelectRole('patient')}
                        className="border-2 border-[#22C55E] bg-emerald-50/40 hover:bg-emerald-50/80 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-[#22C55E] flex items-center justify-center flex-shrink-0 bg-white shadow-inner">
                            <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#22C55E] text-base">Remaja / Anak</h3>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                Untuk remaja (10-24 tahun) yang ingin memantau risiko diabetes & gaya hidup sehat
                            </p>
                        </div>
                    </div>

                    {/* Orang Tua / Wali */}
                    <div
                        onClick={() => handleSelectRole('caregiver')}
                        className="border-2 border-[#1E88E5] bg-blue-50/40 hover:bg-blue-50/80 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-[#1E88E5] flex items-center justify-center flex-shrink-0 bg-white shadow-inner">
                            <svg className="w-6 h-6 text-[#1E88E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1E88E5] text-base">Orang Tua / Wali</h3>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                Untuk orang tua yang ingin mengaktifkan Family Sync & memantau asupan anak
                            </p>
                        </div>
                    </div>

                    {/* Tenaga Medis */}
                    <div
                        onClick={() => handleSelectRole('faskes_admin')}
                        className="border border-slate-300 bg-slate-50/60 hover:bg-slate-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full border border-slate-400 flex items-center justify-center flex-shrink-0 bg-white shadow-inner">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700 text-base">Tenaga Medis (Faskes)</h3>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Untuk dokter, perawat, atau analis klinis faskes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Terms */}
                <div className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed pb-2">
                    Dengan masuk, Anda menyetujui <br />
                    <a href="#" className="text-[#1E88E5] font-bold hover:underline">
                        Syarat & Ketentuan dan Kebijakan Privasi
                    </a>
                </div>
            </GuestLayout>
        );
    }

    // Step 4: Konfirmasi Data Diri (Page Register - Konfirmasi data diri.png)
    if (step === 4) {
        return (
            <GuestLayout>
                <Head title="Konfirmasi Data Diri — NutriSync" />

                {/* Back Button */}
                <div className="pt-2">
                    <button
                        onClick={() => setStep(3)}
                        className="text-gray-400 hover:text-gray-700 p-2 -ml-2 inline-block transition"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <div className="mt-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                        <span>✓ Langkah Terakhir</span>
                    </div>
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                        Konfirmasi Data Diri
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Pastikan seluruh informasi yang Anda masukkan di bawah ini sudah benar
                    </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-sm my-auto">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-gray-500 font-medium">Peran / Role</span>
                        <span className="font-bold text-[#1E88E5]">{getRoleTitle(data.role)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-gray-500 font-medium">Nama Lengkap</span>
                        <span className="font-bold text-gray-800">{data.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="font-bold text-gray-800">{data.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-gray-500 font-medium">WhatsApp</span>
                        <span className="font-bold text-gray-800">{data.phone_number || '-'}</span>
                    </div>

                    {data.role === 'patient' && (
                        <>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-gray-500 font-medium">Tanggal Lahir</span>
                                <span className="font-bold text-gray-800">{data.birth_date}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-gray-500 font-medium">Berat & Tinggi</span>
                                <span className="font-bold text-gray-800">{data.weight_kg} kg / {data.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-gray-500 font-medium">Riwayat Diabetes Keluarga</span>
                                <span className={`font-bold ${data.family_diabetes_history ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {data.family_diabetes_history ? 'Ada Riwayat' : 'Tidak Ada'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <form onSubmit={submit} className="pt-6 space-y-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-base shadow-lg shadow-[#22C55E]/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processing ? 'Membuat Akun...' : 'Konfirmasi & Buat Akun →'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                    >
                        ← Edit Ulang Data
                    </button>
                </form>
            </GuestLayout>
        );
    }

    // Step 1..3: Data Entry Wizard
    return (
        <GuestLayout>
            <Head title={`Pengisian Data Diri (${step}/3) — NutriSync`} />

            {/* Back Button */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => setStep(step === 1 ? 0 : step - 1)}
                    className="text-gray-400 hover:text-gray-700 p-2 -ml-2 inline-block transition"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    Langkah {step} dari 3
                </span>
            </div>

            {/* Title */}
            <div className="mt-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] text-xs font-bold mb-2">
                    <span>Terpilih: {getRoleTitle(data.role)}</span>
                    <button onClick={() => setStep(0)} className="underline ml-1">Ganti</button>
                </div>
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                    {step === 1 && 'Identitas & Kontak'}
                    {step === 2 && (data.role === 'patient' ? 'Data Klinis Remaja' : 'Informasi Tambahan')}
                    {step === 3 && 'Keamanan & Verifikasi'}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    {step === 1 && 'Isi nama, email, dan nomor kontak yang aktif'}
                    {step === 2 && (data.role === 'patient' ? 'Diperlukan untuk akurasi prediksi AI & batas gula harian' : 'Langkah pengisian data penunjang')}
                    {step === 3 && 'Buat kata sandi yang kuat untuk menjaga keamanan akun'}
                </p>
            </div>

            <div className="space-y-4 my-auto">
                {/* STEP 1: Nama, Email, Phone */}
                {step === 1 && (
                    <div className="space-y-3.5">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" className="text-xs font-bold text-gray-700" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap sesuai identitas"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" className="text-xs font-bold text-gray-700" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="contoh@domain.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone_number" value="Nomor WhatsApp (Aktif)" className="text-xs font-bold text-gray-700" />
                            <input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                value={data.phone_number}
                                className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                onChange={(e) => setData('phone_number', e.target.value)}
                                placeholder="0812xxxxxxxx / 62812xxxxxxxx"
                                required
                            />
                            <InputError message={errors.phone_number} className="mt-1" />
                        </div>
                    </div>
                )}

                {/* STEP 2: Birth Date, Weight, Height (if patient) */}
                {step === 2 && (
                    <div className="space-y-3.5">
                        {data.role === 'patient' ? (
                            <>
                                <div>
                                    <InputLabel htmlFor="birth_date" value="Tanggal Lahir (Remaja 10-24 Tahun)" className="text-xs font-bold text-gray-700" />
                                    <input
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        value={data.birth_date}
                                        className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.birth_date} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="weight_kg" value="Berat Badan (kg)" className="text-xs font-bold text-gray-700" />
                                        <input
                                            id="weight_kg"
                                            type="number"
                                            step="0.1"
                                            name="weight_kg"
                                            value={data.weight_kg}
                                            className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                            onChange={(e) => setData('weight_kg', e.target.value)}
                                            placeholder="50"
                                            required
                                        />
                                        <InputError message={errors.weight_kg} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="height_cm" value="Tinggi Badan (cm)" className="text-xs font-bold text-gray-700" />
                                        <input
                                            id="height_cm"
                                            type="number"
                                            step="0.1"
                                            name="height_cm"
                                            value={data.height_cm}
                                            className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                            onChange={(e) => setData('height_cm', e.target.value)}
                                            placeholder="160"
                                            required
                                        />
                                        <InputError message={errors.height_cm} className="mt-1" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-start gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.family_diabetes_history}
                                            onChange={(e) => setData('family_diabetes_history', e.target.checked)}
                                            className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-amber-900 block">
                                                Ada Riwayat Diabetes di Keluarga?
                                            </span>
                                            <span className="text-[11px] text-amber-700 leading-normal block mt-0.5">
                                                Centang jika orang tua, kakek, atau nenek pernah terdiagnosis diabetes.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl text-center">
                                <span className="text-2xl block mb-2">🤝</span>
                                <h4 className="text-sm font-bold text-blue-900">Peran {getRoleTitle(data.role)}</h4>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Anda tidak perlu mengisi data klinis tubuh. Data kesehatan akan diisi atau dipantau dari akun anak/remaja yang Anda hubungkan.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: Password & Turnstile */}
                {step === 3 && (
                    <div className="space-y-3.5">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Baru" className="text-xs font-bold text-gray-700" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Min. 8 karakter"
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="text-xs font-bold text-gray-700" />
                            <input
                                id="password_confirmation"
                                type={showPassword ? "text" : "password"}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi sandi"
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        <div className="flex items-center pt-0.5">
                            <input
                                type="checkbox"
                                id="showPass"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                className="rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                            />
                            <label htmlFor="showPass" className="ms-2 text-xs text-gray-600 cursor-pointer">
                                Tampilkan kata sandi
                            </label>
                        </div>

                        {/* Cloudflare Turnstile */}
                        <div className="pt-2">
                            <TurnstileWidget
                                onVerify={(token) => setData('cf-turnstile-response', token)}
                            />
                            <InputError message={errors['cf-turnstile-response']} className="mt-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-6 space-y-3">
                {step < 3 ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 1 && (!data.name || !data.email)) {
                                alert('Harap isi Nama Lengkap dan Alamat Email!');
                                return;
                            }
                            setStep(step + 1);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                        <span>Lanjut ke Langkah {step + 1}</span>
                        <span>→</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            if (!data.password || data.password.length < 8) {
                                alert('Kata sandi minimal 8 karakter!');
                                return;
                            }
                            if (data.password !== data.password_confirmation) {
                                alert('Konfirmasi kata sandi tidak cocok!');
                                return;
                            }
                            setStep(4); // Masuk ke konfirmasi akhir
                        }}
                        className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                        <span>Review & Konfirmasi</span>
                        <span>→</span>
                    </button>
                )}
            </div>

            <div className="text-center pt-3">
                <Link
                    href={route('login')}
                    className="text-xs font-semibold text-gray-500 hover:text-[#1E88E5] transition"
                >
                    Sudah punya akun? <span className="text-[#1E88E5] font-bold">Masuk</span>
                </Link>
            </div>
        </GuestLayout>
    );
}

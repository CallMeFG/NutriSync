import React, { useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function BloodSugarIndex({ logs, currentStatus }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    // Form setup dengan client_uuid untuk idempotency sesuai aturan wajib #9
    const { data, setData, post, processing, errors, reset } = useForm({
        client_uuid: crypto.randomUUID(),
        glucose_level: '',
        measurement_type: 'puasa',
        measurement_time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('patient.blood-sugar.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('client_uuid', crypto.randomUUID());
                setShowForm(false);
            },
        });
    };

    // Helper warna untuk badge tipe/kadar
    const getGlucoseBadge = (level, type) => {
        if (type === 'hba1c') {
            if (level >= 6.5) return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (>= 6.5%)' };
            if (level >= 5.7) return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada' };
            return { color: 'bg-[#22C55E] text-white', label: 'Aman (< 5.7%)' };
        }
        if (level >= 126) return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (Tinggi)' };
        if (level >= 100 || level < 70) return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada (Abnormal)' };
        return { color: 'bg-[#22C55E] text-white', label: 'Aman (70-99 mg/dL)' };
    };

    return (
        <PatientLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🩸 Pemantauan Gula Darah & HbA1c</span>
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition flex items-center gap-1"
                    >
                        <span>{showForm ? '✖ Tutup Form' : '➕ Catat Baru'}</span>
                    </button>
                </div>
            }
        >
            <Head title="Gula Darah & HbA1c - Pasien" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
                        ✅ {flash.success}
                    </div>
                )}

                {/* Form Input Gula Darah (Thumb Zone di mobile) */}
                {showForm && (
                    <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md transition-all">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📝 Catat Hasil Pemeriksaan</span>
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Tipe Pemeriksaan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.measurement_type}
                                        onChange={(e) => setData('measurement_type', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        <option value="puasa">Gula Darah Puasa (GDP)</option>
                                        <option value="sewaktu">Gula Darah Sewaktu (GDS)</option>
                                        <option value="hba1c">HbA1c (%)</option>
                                    </select>
                                    {errors.measurement_type && <p className="text-xs text-red-600 mt-1">{errors.measurement_type}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Hasil Angka ({data.measurement_type === 'hba1c' ? '%' : 'mg/dL'}) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step={data.measurement_type === 'hba1c' ? '0.1' : '1'}
                                        min="20"
                                        max="600"
                                        required
                                        value={data.glucose_level}
                                        onChange={(e) => setData('glucose_level', e.target.value)}
                                        placeholder={data.measurement_type === 'hba1c' ? 'Contoh: 5.4' : 'Contoh: 95'}
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.glucose_level && <p className="text-xs text-red-600 mt-1">{errors.glucose_level}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Waktu Pemeriksaan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={data.measurement_time}
                                        onChange={(e) => setData('measurement_time', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.measurement_time && <p className="text-xs text-red-600 mt-1">{errors.measurement_time}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Catatan / Gejala (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Contoh: Setelah makan manis, merasa lemas"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? '⏳ Menyimpan...' : '💾 Simpan Catatan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Riwayat Log */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-md">📊 Riwayat Pemeriksaan Terakhir</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                            Total: {logs.total} Data
                        </span>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-2">🩸</div>
                            <p className="font-semibold text-gray-700">Belum ada riwayat gula darah</p>
                            <p className="text-xs text-gray-400 mt-1">Tekan tombol "Catat Baru" di atas untuk menambahkan pemeriksaan pertama.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {logs.data.map((log) => {
                                const badge = getGlucoseBadge(log.glucose_level, log.measurement_type);
                                return (
                                    <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50/50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex flex-col items-center justify-center font-bold text-gray-700 border border-gray-200">
                                                <span className="text-sm font-black">{log.glucose_level}</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-normal">
                                                    {log.measurement_type === 'hba1c' ? '%' : 'mg'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800 capitalize text-sm">
                                                        {log.measurement_type === 'puasa' ? 'Gula Darah Puasa' : log.measurement_type === 'sewaktu' ? 'Gula Darah Sewaktu' : 'HbA1c'}
                                                    </span>
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    📅 {new Date(log.measurement_time).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                    {log.notes && <span className="ml-2 italic text-gray-600">"{log.notes}"</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 self-end sm:self-center">
                                            ID: {log.client_uuid ? log.client_uuid.slice(0, 8) : 'sync'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PatientLayout>
    );
}

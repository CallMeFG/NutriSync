import React from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link } from '@inertiajs/react';

export default function PatientDetail({ patient, logs }) {
    const riskStatus = patient.current_risk_status || 'aman';

    // Warna status konsisten dengan aturan wajib frontend-ui.md
    const statusColors = {
        aman: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]', text: 'text-[#22C55E]', label: 'Aman (Terkontrol)' },
        waspada: { bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]', text: 'text-[#EAB308]', label: 'Waspada (Batas Atas)' },
        bahaya: { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]', text: 'text-[#EF4444]', label: 'Bahaya (Tinggi)' },
    };

    const currentStatus = statusColors[riskStatus] || statusColors.aman;

    const getGlucoseBadge = (level, type) => {
        if (type === 'hba1c') {
            if (level >= 6.5) return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (>= 6.5%)' };
            if (level >= 5.7) return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada' };
            return { color: 'bg-[#22C55E] text-white', label: 'Aman' };
        }
        if (level >= 126) return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (Tinggi)' };
        if (level >= 100 || level < 70) return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada (Abnormal)' };
        return { color: 'bg-[#22C55E] text-white', label: 'Aman (70-99 mg/dL)' };
    };

    return (
        <CaregiverLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>👶 Pantauan Klinis: {patient.user?.name || 'Pasien'}</span>
                    </h2>
                    <Link
                        href={route('caregiver.dashboard')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                        ⬅ Kembali ke Dashboard
                    </Link>
                </div>
            }
        >
            <Head title={`Pantauan ${patient.user?.name || 'Anak'} - Caregiver`} />

            <div className="space-y-6">
                {/* Banner Status Anak */}
                <div className={`p-6 rounded-2xl border-2 ${currentStatus.border} ${currentStatus.bg} shadow-sm`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
                                Status Risiko Anak Terkini
                            </div>
                            <div className={`text-2xl font-black tracking-tight ${currentStatus.text}`}>
                                {currentStatus.label}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Batas konsumsi gula harian anak: <span className="font-bold">{patient.daily_sugar_limit_g || 25}g / hari</span>
                            </p>
                        </div>
                        <div className="bg-white text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs border border-gray-200 flex items-center gap-1.5">
                            <span>🔒 Akses Read-Only</span>
                        </div>
                    </div>
                </div>

                {/* Riwayat Log Gula Darah */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-md">🩸 Riwayat Pemeriksaan Gula Darah Anak</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                            Total: {logs.total} Data
                        </span>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="font-semibold text-gray-700">Belum ada catatan pemeriksaan</p>
                            <p className="text-xs text-gray-400 mt-1">Catatan gula darah yang diinput oleh anak akan muncul di sini secara real-time.</p>
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
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </CaregiverLayout>
    );
}

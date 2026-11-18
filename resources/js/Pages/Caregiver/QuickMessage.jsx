import React, { useState } from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link } from '@inertiajs/react';

export default function QuickMessage({ patient }) {
    const [selectedTemplate, setSelectedTemplate] = useState('ingat_cek');
    const [customMessage, setCustomMessage] = useState('');

    const patientName = patient?.user?.name || 'Anakku';
    const patientPhone = patient?.user?.phone || '';

    const templates = [
        {
            id: 'ingat_cek',
            title: '⏰ Pengingat Cek Gula Darah',
            text: `Halo ${patientName}, jangan lupa untuk mencatat kadar gula darahmu hari ini di aplikasi NutriSync ya agar kita bisa terus pantau bareng. Semangat! 💪`,
            icon: '🩸',
        },
        {
            id: 'pujian_gizi',
            title: '🌟 Pujian & Apresiasi Gizi',
            text: `Hebat ${patientName}! Mama/Papa lihat catatan konsumsi gula harianmu hari ini sangat terkontrol di zona Aman. Terus pertahankan pola makan sehatmu ya! 🥗✨`,
            icon: '🥗',
        },
        {
            id: 'peringatan_gula',
            title: '⚠️ Peringatan Batas Gula',
            text: `Halo ${patientName}, perhatikan asupan makanan manis hari ini ya karena sudah mendekati batas maksimal harianmu. Yuk ganti minum air putih atau camilan sehat! 🥤`,
            icon: '⚠️',
        },
        {
            id: 'ajakan_olahraga',
            title: '🏃 Ajakan Aktivitas Fisik',
            text: `Halo ${patientName}, sore nanti jalan santai atau olahraga 30 menit yuk supaya kadar gula darah tetap stabil dan tubuh makin bugar! 🏃‍♂️💪`,
            icon: '🏃',
        },
    ];

    const activeText = selectedTemplate === 'custom'
        ? customMessage
        : (templates.find(t => t.id === selectedTemplate)?.text || '');

    const handleSendWhatsApp = () => {
        const textEncoded = encodeURIComponent(activeText);
        let phone = patientPhone ? patientPhone.replace(/[^0-9]/g, '') : '';
        if (phone.startsWith('0')) {
            phone = '62' + phone.slice(1);
        }
        const waUrl = phone 
            ? `https://api.whatsapp.com/send?phone=${phone}&text=${textEncoded}`
            : `https://api.whatsapp.com/send?text=${textEncoded}`;
        window.open(waUrl, '_blank');
    };

    return (
        <CaregiverLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center p-1.5 border border-[#2E7D32]/20 shadow-xs">
                            <img src="/icons/whatsapp-icon.png" alt="WA" className="w-5 h-5 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-800 leading-tight">
                                Pesan Cepat Family Sync: {patientName}
                            </h2>
                            <span className="text-[10px] text-gray-400 font-medium">Kirim motivasi langsung ke WhatsApp anak</span>
                        </div>
                    </div>
                    <Link
                        href={route('caregiver.patient.blood-sugar', patient.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                        <span>⬅ Kembali</span>
                    </Link>
                </div>
            }
        >
            <Head title={`Kirim Pesan WA ke ${patientName} - Caregiver`} />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Banner Info */}
                <div className="bg-gradient-to-r from-emerald-900 to-[#2E7D32] rounded-2xl p-5 text-white flex items-start gap-4 shadow-sm relative overflow-hidden border border-emerald-700">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute right-0 top-0 h-full opacity-15 pointer-events-none" />
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0 relative z-10">
                        <img src="/icons/pelindung.png" alt="" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-sm text-emerald-100">Dukungan Positif Keluarga (Family Sync)</h3>
                        <p className="text-xs text-emerald-50 mt-1 leading-relaxed">
                            Kirimkan pesan pengingat, pujian, atau ajakan motivasi langsung via WhatsApp ke <strong className="underline text-white">{patientName}</strong> ({patientPhone || 'Nomor tercatat'}). Template dirancang oleh sistem klinis NutriSync untuk memperkuat kebiasaan sehat anak tanpa memberi tekanan berlebih.
                        </p>
                    </div>
                </div>

                {/* Pilih Template */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">1. Pilih Template atau Tulis Sendiri</h4>
                        <span className="text-[10px] bg-emerald-50 text-[#2E7D32] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                            4 Template Klinis
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" role="radiogroup" aria-label="Pilih Template Pesan WhatsApp">
                        {templates.map(tmpl => (
                            <button
                                key={tmpl.id}
                                type="button"
                                role="radio"
                                aria-checked={selectedTemplate === tmpl.id}
                                aria-label={`Template: ${tmpl.title}`}
                                onClick={() => setSelectedTemplate(tmpl.id)}
                                className={`p-4.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                                    selectedTemplate === tmpl.id
                                        ? 'border-[#2E7D32] bg-[#2E7D32]/5 ring-2 ring-[#2E7D32]/20 shadow-xs'
                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/50 bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-bold text-xs text-gray-800 flex items-center gap-2">
                                        <span className="text-base" aria-hidden="true">{tmpl.icon}</span>
                                        <span>{tmpl.title}</span>
                                    </div>
                                    {selectedTemplate === tmpl.id && (
                                        <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] font-bold" aria-hidden="true">✓</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50/80 p-2.5 rounded-xl border border-gray-100/80 mt-1">
                                    "{tmpl.text}"
                                </div>
                            </button>
                        ))}

                        <button
                            type="button"
                            role="radio"
                            aria-checked={selectedTemplate === 'custom'}
                            aria-label="Tulis Pesan Kustom Mandiri"
                            onClick={() => setSelectedTemplate('custom')}
                            className={`p-4.5 rounded-2xl border text-left transition flex flex-col justify-between sm:col-span-2 ${
                                selectedTemplate === 'custom'
                                    ? 'border-[#2E7D32] bg-[#2E7D32]/5 ring-2 ring-[#2E7D32]/20 shadow-xs'
                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/50 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="font-bold text-xs text-gray-800 flex items-center gap-2">
                                    <span className="text-base" aria-hidden="true">✍️</span>
                                    <span>Tulis Pesan Kustom Mandiri</span>
                                </div>
                                {selectedTemplate === 'custom' && (
                                    <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] font-bold" aria-hidden="true">✓</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 leading-relaxed">
                                Buat pesan bebas sesuai situasi terkini anak (misal: pengingat jadwal dokter, apresiasi olahraga pagi, dll).
                            </div>
                        </button>
                    </div>
                </div>

                {/* Editor Kustom jika dipilih */}
                {selectedTemplate === 'custom' && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 animate-fadeIn">
                        <label htmlFor="custom-message-input" className="block text-xs font-bold uppercase text-gray-700">
                            2. Ketik Isi Pesan untuk {patientName}
                        </label>
                        <textarea
                            id="custom-message-input"
                            rows={4}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder={`Contoh: Halo ${patientName}, siang ini makan taruh sayur yang banyak ya...`}
                            aria-label={`Ketik Isi Pesan untuk ${patientName}`}
                            className="w-full rounded-xl border-gray-300 text-sm focus:border-[#2E7D32] focus:ring-[#2E7D32] p-3.5 shadow-2xs"
                        />
                    </div>
                )}

                {/* Preview & Kirim */}
                <div className="bg-gradient-to-br from-[#1E5622] to-[#2E7D32] text-white p-6 rounded-2xl shadow-md relative overflow-hidden border border-[#2E7D32]">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-6 -bottom-8 w-52 opacity-20 select-none pointer-events-none" aria-hidden="true" />
                    <div className="relative z-10">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2.5 flex items-center gap-2">
                            <img src="/icons/whatsapp-icon.png" alt="WA" className="w-4.5 h-4.5 object-contain brightness-200" aria-hidden="true" />
                            <span>Pratinjau Pesan WhatsApp (Siap Kirim)</span>
                        </div>
                        <div className="bg-black/20 backdrop-blur-xs p-4.5 rounded-xl border border-white/15 text-sm leading-relaxed mb-6 font-normal text-emerald-50 min-h-[80px] flex items-center" role="region" aria-label="Pratinjau pesan">
                            {activeText || <span className="italic opacity-60">Pilih template di atas atau ketik pesan terlebih dahulu...</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <span className="text-xs text-emerald-200 font-medium">
                                *Aplikasi WhatsApp akan terbuka otomatis dengan pesan terisi.
                            </span>
                            <button
                                type="button"
                                onClick={handleSendWhatsApp}
                                disabled={!activeText}
                                aria-label={`Kirim pesan via WhatsApp ke ${patientName}`}
                                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-emerald-50 text-[#2E7D32] font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                            >
                                <img src="/icons/whatsapp-icon.png" alt="" className="w-4.5 h-4.5 object-contain" aria-hidden="true" />
                                <span>Kirim via WhatsApp Sekarang ➔</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CaregiverLayout>
    );
}

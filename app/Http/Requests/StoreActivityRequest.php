<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sudah terlindungi oleh middleware ['auth', 'verified', 'role:patient']
    }

    public function rules(): array
    {
        return [
            // Hanya dua tipe aktivitas yang diizinkan
            'type'  => ['required', 'in:water,exercise'],
            // Validasi range medis realistis:
            // - Air: 1-10 gelas sekali log
            // - Olahraga: 5-120 menit sekali log
            'value' => ['required', 'integer', 'min:1', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'  => 'Tipe aktivitas wajib diisi (water atau exercise).',
            'type.in'        => 'Tipe aktivitas tidak valid.',
            'value.required' => 'Jumlah wajib diisi.',
            'value.integer'  => 'Jumlah harus berupa angka bulat.',
            'value.min'      => 'Jumlah minimal 1.',
            'value.max'      => 'Jumlah maksimal 120 menit / 10 gelas per satu log.',
        ];
    }
}

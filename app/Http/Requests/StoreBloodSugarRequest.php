<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBloodSugarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === UserRole::Patient && $this->user()->patient !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     * Aturan wajib: semua angka medis WAJIB punya validasi range realistis di server.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_uuid' => ['required', 'uuid', 'max:36'],
            'glucose_level' => ['required', 'integer', 'min:20', 'max:600'], // Rentang PERKENI / ADA di blueprint §9
            'measurement_type' => ['required', 'string', 'in:puasa,sewaktu,hba1c'],
            'measurement_time' => ['required', 'date', 'before_or_equal:now'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Custom error messages in Indonesian.
     */
    public function messages(): array
    {
        return [
            'client_uuid.required' => 'UUID client wajib disertakan untuk idempotency.',
            'glucose_level.required' => 'Kadar gula darah wajib diisi.',
            'glucose_level.integer' => 'Kadar gula darah harus berupa angka bulat.',
            'glucose_level.min' => 'Kadar gula darah tidak realistis (minimal 20 mg/dL).',
            'glucose_level.max' => 'Kadar gula darah melebih batas maksimal pengecekan (maksimal 600 mg/dL).',
            'measurement_type.in' => 'Tipe pemeriksaan harus puasa, sewaktu, atau hba1c.',
            'measurement_time.before_or_equal' => 'Waktu pemeriksaan tidak boleh di masa depan.',
        ];
    }
}

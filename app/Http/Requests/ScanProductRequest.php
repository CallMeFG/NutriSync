<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ScanProductRequest extends FormRequest
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
     * Aturan wajib: validasi range angka medis & gizi di server.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_uuid' => ['required', 'uuid', 'max:36'],
            'barcode' => ['nullable', 'string', 'max:50'],
            'product_name' => ['required_without:barcode', 'nullable', 'string', 'max:255'],
            'sugar_g' => ['required', 'numeric', 'min:0', 'max:500'], // Maksimal 500g gula per takaran saji
            'serving_size_g' => ['nullable', 'numeric', 'min:1', 'max:2000'],
            'scanned_at' => ['nullable', 'date', 'before_or_equal:now'],
        ];
    }

    /**
     * Custom error messages in Indonesian.
     */
    public function messages(): array
    {
        return [
            'client_uuid.required' => 'UUID client wajib disertakan untuk idempotency sinkronisasi.',
            'product_name.required_without' => 'Nama produk wajib diisi apabila tidak ada barcode.',
            'sugar_g.required' => 'Kandungan gula per takaran saji wajib diisi.',
            'sugar_g.numeric' => 'Kandungan gula harus berupa angka.',
            'sugar_g.min' => 'Kandungan gula tidak boleh negatif.',
            'sugar_g.max' => 'Kandungan gula melebihi batas realistis (maksimal 500 gram).',
            'serving_size_g.min' => 'Takaran saji minimal 1 gram/ml.',
            'scanned_at.before_or_equal' => 'Waktu pemindaian tidak boleh di masa depan.',
        ];
    }
}

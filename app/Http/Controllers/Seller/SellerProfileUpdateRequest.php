<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class SellerProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isSeller();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'farm_name' => ['required', 'string', 'max:255'],
            'province_id' => ['required', 'integer', 'exists:provinces,province_id'],
            'district_id' => ['required', 'integer', 'exists:districts,district_id'],
            'commune_id' => ['required', 'integer', 'exists:communes,commune_id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,village_id'],
            'certification' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'payment_qr_code' => ['nullable', 'string', 'url', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'farm_name.required' => 'Please enter your farm name.',
            'province_id.required' => 'Please select a province.',
            'province_id.exists' => 'The selected province is invalid.',
            'district_id.required' => 'Please select a district.',
            'district_id.exists' => 'The selected district is invalid.',
            'commune_id.required' => 'Please select a commune.',
            'commune_id.exists' => 'The selected commune is invalid.',
            'village_id.exists' => 'The selected village is invalid.',
            'payment_qr_code.url' => 'Please enter a valid URL for the payment QR code.',
        ];
    }
}

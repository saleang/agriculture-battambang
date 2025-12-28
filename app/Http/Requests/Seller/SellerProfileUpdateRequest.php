<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class SellerProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isSeller();
    }

    public function rules(): array
    {
        $userId = $this->user()?->user_id;

        return [
            // User fields
            'username' => ['sometimes', 'string', 'max:255', 'unique:users,username,' . $userId . ',user_id'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $userId . ',user_id'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female,other'],
            'photo' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],

            // Seller fields
            'farm_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'certification' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,pdf', 'max:5120'],

            // Location fields
            'province_id' => ['nullable', 'integer', 'exists:provinces,province_id'],
            'district_id' => ['nullable', 'integer', 'exists:districts,district_id'],
            'commune_id' => ['nullable', 'integer', 'exists:communes,commune_id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,village_id'],

            // Payment fields
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:255'],
            'payment_qr_code' => ['nullable'],
        ];
    }
}

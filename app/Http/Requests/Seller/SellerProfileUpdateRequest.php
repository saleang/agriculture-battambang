<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class SellerProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', 'in:male,female,other'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'], // 2MB
            'certification' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,pdf', 'max:5120'], // 5MB
        ];
    }
}


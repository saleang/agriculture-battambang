<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class SellerTelegramSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // middleware already ensures seller
    }

    public function rules(): array
    {
        return [
            'telegram_bot_token' => ['nullable', 'string', 'max:255'],
            'telegram_chat_id' => ['nullable', 'string', 'max:255'],
            'telegram_notifications_enabled' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'telegram_notifications_enabled.required' => 'Please specify whether notifications are enabled.',
            'telegram_notifications_enabled.boolean' => 'Invalid value for notifications.',
        ];
    }
}

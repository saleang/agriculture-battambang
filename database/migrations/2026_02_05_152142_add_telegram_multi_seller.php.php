<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            // Each seller has their own Telegram bot token
            $table->string('telegram_bot_token')->nullable()->after('payment_qr_code');
            // Each seller has their own chat ID
            $table->string('telegram_chat_id')->nullable()->after('telegram_bot_token');
            // Seller can enable/disable notifications
            $table->boolean('telegram_notifications_enabled')->default(true)->after('telegram_chat_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller', function (Blueprint $table) {
            $table->dropColumn([
                'telegram_bot_token',
                'telegram_chat_id',
                'telegram_notifications_enabled'
            ]);
        });
    }
};

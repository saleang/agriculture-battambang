<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Send order notification using seller's bot token
     */
    public function sendOrderNotification(
        string $botToken,
        string $chatId,
        array $orderData
    ): bool {
        if (!$botToken || !$chatId) {
            return false;
        }

        $message = $this->formatOrderMessage($orderData);
        return $this->sendMessage($botToken, $chatId, $message);
    }

    protected function formatOrderMessage(array $orderData): string
    {
        $message = "🔔 <b>ការបញ្ជាទិញថ្មី!</b>\n\n";
        $message .= "📋 <b>លេខបញ្ជាទិញ:</b> {$orderData['order_number']}\n";
        $message .= "👤 <b>អតិថិជន:</b> {$orderData['customer_name']}\n";
        $message .= "📞 <b>ទូរស័ព្ទ:</b> {$orderData['customer_phone']}\n";
        $message .= "📍 <b>អាសយដ្ឋាន:</b> {$orderData['shipping_address']}\n\n";

        $message .= "🛒 <b>ផលិតផលរបស់អ្នក:</b>\n";
        foreach ($orderData['items'] as $item) {
            $message .= "  • {$item['product_name']}\n";
            $message .= "    {$item['quantity']} {$item['unit']} × {$item['price_per_unit']}៛\n";
        }

        $message .= "\n💰 <b>សរុប:</b> " . number_format($orderData['total_amount'], 0) . "៛\n";
        $message .= "💳 <b>ការទូទាត់:</b> {$orderData['payment_method']}\n";

        if (!empty($orderData['customer_notes'])) {
            $message .= "\n📝 <b>កំណត់ចំណាំ:</b> {$orderData['customer_notes']}\n";
        }

        $message .= "\n⏰ <b>ពេលវេលា:</b> {$orderData['created_at']}\n";
        $message .= "\n⚠️ សូមឆ្លើយតបក្នុងរយៈពេល 30 នាទី!";

        return $message;
    }

    public function sendOrderCancelledNotification(
        string $botToken,
        string $chatId,
        array $orderData
    ): bool {
        if (!$botToken || !$chatId) {
            return false;
        }

        $message = "❌ <b>ការបញ្ជាទិញត្រូវបានលុបចោល</b>\n\n";
        $message .= "📋 <b>លេខបញ្ជាទិញ:</b> {$orderData['order_number']}\n";
        $message .= "👤 <b>អតិថិជន:</b> {$orderData['customer_name']}\n";
        $message .= "💰 <b>ចំនួនទឹកប្រាក់:</b> " . number_format($orderData['total_amount'], 0) . "៛\n";

        if (!empty($orderData['cancellation_reason'])) {
            $message .= "\n📝 <b>មូលហេតុ:</b> {$orderData['cancellation_reason']}\n";
        }

        $message .= "\n🕐 <b>លុបចោលនៅ:</b> {$orderData['cancelled_at']}";

        return $this->sendMessage($botToken, $chatId, $message);
    }

    public function sendPaymentReceivedNotification(
        string $botToken,
        string $chatId,
        array $orderData
    ): bool {
        if (!$botToken || !$chatId) {
            return false;
        }

        $message = "💵 <b>បានទទួលការទូទាត់!</b>\n\n";
        $message .= "📋 <b>លេខបញ្ជាទិញ:</b> {$orderData['order_number']}\n";
        $message .= "👤 <b>អតិថិជន:</b> {$orderData['customer_name']}\n";
        $message .= "💰 <b>ចំនួនទឹកប្រាក់:</b> " . number_format($orderData['total_amount'], 0) . "៛\n";
        $message .= "💳 <b>វិធីសាស្ត្រទូទាត់:</b> {$orderData['payment_method']}\n";
        $message .= "\n🕐 <b>ទូទាត់នៅ:</b> {$orderData['paid_at']}";

        return $this->sendMessage($botToken, $chatId, $message);
    }

    public function sendMessage(
        string $botToken,
        string $chatId,
        string $message,
        string $parseMode = 'HTML'
    ): bool {
        try {
            $response = Http::timeout(10)->post(
                "https://api.telegram.org/bot{$botToken}/sendMessage",
                [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => $parseMode,
                    'disable_web_page_preview' => true,
                ]
            );

            if ($response->successful()) {
                Log::info('Telegram sent', ['chat_id' => $chatId]);
                return true;
            }

            Log::error('Telegram failed', [
                'chat_id' => $chatId,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Telegram exception', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function testConnection(string $botToken, string $chatId): bool
    {
        $message = "✅ <b>តេស្តជោគជ័យ!</b>\n\n🤖 Bot របស់អ្នកដំណើរការល្អ!\n📢 អ្នកនឹងទទួលការជូនដំណឹងទីនេះ។";
        return $this->sendMessage($botToken, $chatId, $message);
    }
}

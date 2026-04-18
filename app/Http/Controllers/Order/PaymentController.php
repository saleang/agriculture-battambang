<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function generateKHQR(Request $request, Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_method !== 'KHQR') {
            return response()->json(['success' => false, 'message' => 'Not a KHQR order'], 400);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Already paid'], 400);
        }

        try {
            $order->load('items');
            $firstItem = $order->items->first();

            if (!$firstItem) {
                return response()->json(['success' => false, 'message' => 'No items'], 400);
            }

            $seller = Seller::find($firstItem->seller_id);

            if (!$seller || !$seller->hasBakongConfigured()) {
                return response()->json(['success' => false, 'message' => 'Bakong not configured for seller'], 400);
            }
            // amountKHR = total_amount + shipping_cost
            // AFTER
            $subtotal = $order->items->sum(function ($item) {
                return $item->quantity * $item->price_per_unit;
            });
            $amountKHR = (int) round((float)$subtotal + (float)($order->shipping_cost ?? 0));
            // $amountKHR = (int) round(order->total_amount);
            $timeoutMinutes = (int) config('bakong.timeout', 25);

            // គណនា timestamp ជា milliseconds (តាម spec Bakong)
            $nowMs       = time() * 1000;
            $expiresMs   = $nowMs + ($timeoutMinutes * 60 * 1000);
            $expiresAt   = time() + ($timeoutMinutes * 60);   // រក្សាទុកជា seconds សម្រាប់ session + frontend

            $khqrString = $this->generateBakongKHQR([
                'bakong_account_id' => $seller->bank_account_number,
                'merchant_name'     => $seller->payment_qr_code ?? $seller->farm_name,
                'merchant_city'     => 'Phnom Penh',
                'amount'            => $amountKHR,
                'bill_number'       => $order->order_number,
                'creation_ms'       => $nowMs,
                'expires_ms'        => $expiresMs,
            ]);

            if (!$this->validateKHQR($khqrString)) {
                throw new \Exception('Generated KHQR is invalid');
            }

            $md5 = md5($khqrString);

            // Store for verification
            session()->put("khqr_md5_{$order->order_id}",     $md5);
            session()->put("khqr_created_{$order->order_id}", time());
            session()->put("khqr_amount_{$order->order_id}",  $amountKHR);
            session()->put("khqr_account_{$order->order_id}", $seller->bank_account_number);
            session()->put("khqr_expires_{$order->order_id}", $expiresAt);

            Log::info('✅ KHQR GENERATED (with correct tag 99)', [
                'order_id'     => $order->order_id,
                'amount'       => $amountKHR,
                'expires_ms'   => $expiresMs,
                'timeout_min'  => $timeoutMinutes,
            ]);

            return response()->json([
                'success'       => true,
                'qr_string'     => $khqrString,
                'amount'        => $amountKHR,
                'server_time'   => time(),
                'duration'      => $expiresAt - time(),
                'merchant_name' => $seller->payment_qr_code ?? $seller->farm_name,
            ]);
        } catch (\Exception $e) {
            Log::error('KHQR generation failed', ['order_id' => $order->order_id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function verifyPayment(Request $request, Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->user_id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        try {
            $md5             = session()->get("khqr_md5_{$order->order_id}");
            $createdAt       = session()->get("khqr_created_{$order->order_id}");
            $expectedAmount  = session()->get("khqr_amount_{$order->order_id}");
            $expectedAccount = session()->get("khqr_account_{$order->order_id}");

            Log::info('🔍 VERIFY START', [
                'order_id'        => $order->order_id,
                'has_md5'         => !empty($md5),
                'md5'             => $md5,
                'expected_amount' => $expectedAmount,
                'expected_acct'   => $expectedAccount,
            ]);

            if (!$md5) {
                Log::warning('⚠️ No MD5', ['order_id' => $order->order_id]);
                return response()->json(['status' => 'pending', 'message' => 'No QR session']);
            }

            // ✅ NEW — use the exact timestamp stored at generate time
            $expiresAt = session()->get("khqr_expires_{$order->order_id}");

            if (!$expiresAt || time() > $expiresAt) {
                session()->forget([
                    "khqr_md5_{$order->order_id}",
                    "khqr_created_{$order->order_id}",
                    "khqr_amount_{$order->order_id}",
                    "khqr_account_{$order->order_id}",
                    "khqr_expires_{$order->order_id}", // ← ADD
                ]);
                return response()->json(['status' => 'expired', 'message' => 'QR expired']);
            }

            if ($order->payment_status === 'paid') {
                session()->forget([
                    "khqr_md5_{$order->order_id}",
                    "khqr_created_{$order->order_id}",
                    "khqr_amount_{$order->order_id}",
                    "khqr_account_{$order->order_id}",
                    "khqr_expires_{$order->order_id}", // ← ADD
                ]);
                return response()->json(['status' => 'paid', 'message' => 'Already paid']);
            }

            $url   = rtrim(config('bakong.api_url'), '/') . '/check_transaction_by_md5';
            $token = config('bakong.token');

            Log::info('📡 BAKONG API CALL', [
                'order_id' => $order->order_id,
                'url'      => $url,
                'md5'      => $md5,
                'token'    => substr($token, 0, 30) . '...',
            ]);

            try {
                $response = Http::timeout(20)
                    ->retry(2, 3000, function ($exception) {
                        return $exception instanceof \Illuminate\Http\Client\ConnectionException;
                    })
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                        'Content-Type'  => 'application/json',
                        'Accept'        => 'application/json',
                    ])
                    ->post($url, ['md5' => $md5]);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('❌ Bakong API unreachable', [
                    'order_id' => $order->order_id,
                    'error'    => $e->getMessage(),
                ]);
                return response()->json(['status' => 'pending', 'message' => 'Bakong API unreachable']);
            }

            $httpStatus = $response->status();
            $rawBody    = $response->body();
            $jsonData   = $response->json() ?? [];

            Log::info('📥 BAKONG RESPONSE', [
                'order_id'        => $order->order_id,
                'http_status'     => $httpStatus,
                'raw_body'        => substr($rawBody, 0, 500),
                'responseCode'    => $jsonData['responseCode']    ?? 'missing',
                'responseMessage' => $jsonData['responseMessage'] ?? 'missing',
                'has_data'        => !empty($jsonData['data']),
            ]);

            // 401 = token expired, tell frontend clearly
            if ($httpStatus === 401) {
                Log::error('❌ Bakong token expired or invalid', ['order_id' => $order->order_id]);
                return response()->json(['status' => 'pending', 'message' => 'Bakong token expired']);
            }

            if ($response->failed() || !isset($jsonData['responseCode'])) {
                return response()->json(['status' => 'pending', 'message' => 'API unavailable']);
            }

            $responseCode = (int) ($jsonData['responseCode'] ?? 1);

            // responseCode 1 = not found / not paid yet — this is normal, keep polling
            if ($responseCode !== 0) {
                Log::info('⏳ Transaction not found yet', [
                    'order_id'       => $order->order_id,
                    'errorCode'      => $jsonData['errorCode']      ?? null,
                    'responseMessage' => $jsonData['responseMessage'] ?? null,
                ]);
                return response()->json(['status' => 'pending', 'message' => 'Not paid yet']);
            }

            // ═══════════════════════════════════════════════════════════
            //  VERIFY TRANSACTION DETAILS
            // ═══════════════════════════════════════════════════════════
            $tx = $jsonData['data'] ?? [];

            if (empty($tx)) {
                Log::error('❌ No transaction data in response', ['order_id' => $order->order_id]);
                return response()->json(['status' => 'pending', 'message' => 'Invalid response']);
            }

            $txAccount  = trim($tx['toAccountId'] ?? '');
            // ✅ FIX: Bakong API returns 'KHR' or 'USD' string, NOT numeric '116'
            $txCurrency = trim($tx['currency'] ?? '');
            // ✅ FIX: API returns float (e.g. 1500.0), use float comparison with tolerance
            $txAmount   = (float) ($tx['amount'] ?? 0);

            $accountMatch  = ($txAccount === trim($expectedAccount));
            $currencyMatch = ($txCurrency === 'KHR');
            $amountMatch   = (abs($txAmount - (float) $expectedAmount) < 1.0); // within 1 KHR tolerance

            Log::info('🔍 VERIFICATION', [
                'order_id'      => $order->order_id,
                'account_match' => $accountMatch,
                'expected_acct' => $expectedAccount,
                'got_acct'      => $txAccount,
                'curr_match'    => $currencyMatch,
                'expected_curr' => 'KHR',
                'got_curr'      => $txCurrency,
                'amount_match'  => $amountMatch,
                'expected_amt'  => $expectedAmount,
                'got_amt'       => $txAmount,
            ]);

            if (!$accountMatch) {
                Log::warning('⚠️ Account mismatch', [
                    'expected' => $expectedAccount,
                    'got'      => $txAccount,
                ]);
                return response()->json(['status' => 'pending', 'message' => 'Account mismatch']);
            }

            if (!$currencyMatch) {
                Log::warning('⚠️ Currency mismatch', [
                    'expected' => 'KHR',
                    'got'      => $txCurrency,
                ]);
                return response()->json(['status' => 'pending', 'message' => 'Currency mismatch']);
            }

            if (!$amountMatch) {
                Log::warning('⚠️ Amount mismatch', [
                    'expected' => $expectedAmount,
                    'got'      => $txAmount,
                ]);
                return response()->json(['status' => 'pending', 'message' => 'Amount mismatch']);
            }

            // ═══════════════════════════════════════════════════════════
            //  ALL VERIFIED - MARK AS PAID
            // ═══════════════════════════════════════════════════════════
            $order->update([
                'payment_status' => 'paid',
                'paid_at'        => now(),
            ]);

            session()->forget([
                "khqr_md5_{$order->order_id}",
                "khqr_created_{$order->order_id}",
                "khqr_amount_{$order->order_id}",
                "khqr_account_{$order->order_id}",
                "khqr_expires_{$order->order_id}", // ← ADD
            ]);

            $this->notifySellerPayment($order);

            Log::info('✅✅✅ PAYMENT CONFIRMED ✅✅✅', [
                'order_id'     => $order->order_id,
                'order_number' => $order->order_number,
                'amount'       => $order->total_amount,
                'paid_at'      => $order->paid_at,
            ]);

            return response()->json(['status' => 'paid', 'message' => 'Payment successful']);
        } catch (\Exception $e) {
            Log::critical('💥 VERIFY CRASHED', [
                'order_id' => $order->order_id,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
                'trace'    => $e->getTraceAsString(),
            ]);

            return response()->json(['status' => 'pending', 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Updated generateBakongKHQR — NO EXPIRATION IN QR STRING
    // ─────────────────────────────────────────────────────────────
    protected function generateBakongKHQR(array $data): string
    {
        $bakongAccountID = trim($data['bakong_account_id'] ?? '');
        $merchantName    = trim($data['merchant_name']     ?? '');
        $merchantCity    = trim($data['merchant_city']     ?? 'Phnom Penh');
        $amount          = (int) round($data['amount']     ?? 0);
        $billNumber      = trim($data['bill_number']       ?? '');
        $creationMs      = (string) ($data['creation_ms']  ?? (time() * 1000));
        $expiresMs       = (string) ($data['expires_ms']   ?? 0);

        if (empty($bakongAccountID)) throw new \Exception('Bakong account ID required');
        if (empty($merchantName))    throw new \Exception('Merchant name required');
        if ($expiresMs <= $creationMs) throw new \Exception('Expiration must be in the future');

        // Clean merchant fields (ត្រូវតែ ASCII តាម spec)
        $merchantName = substr(preg_replace('/[^A-Za-z0-9 \-\.]/', '', $merchantName), 0, 25);
        $merchantCity = substr(preg_replace('/[^A-Za-z0-9 \-\.]/', '', $merchantCity), 0, 15);

        if (!str_contains($bakongAccountID, '@')) {
            throw new \Exception('Invalid Bakong account ID format (name@bank)');
        }

        $qr  = $this->tlv('00', '01');
        $qr .= $this->tlv('01', $amount > 0 ? '12' : '11');   // Dynamic QR

        // Merchant account
        $sub29 = $this->tlv('00', $bakongAccountID);
        $qr   .= $this->tlv('29', $sub29);

        $qr .= $this->tlv('52', '5999');                  // MCC
        $qr .= $this->tlv('53', '116');                   // KHR
        if ($amount > 0) {
            $qr .= $this->tlv('54', (string) $amount);
        }
        $qr .= $this->tlv('58', 'KH');
        $qr .= $this->tlv('59', $merchantName);
        $qr .= $this->tlv('60', $merchantCity);

        // === TAG 99 — នេះជាចំណុចដែលកែថ្មី (តាម spec Bakong) ===
        $sub99 = $this->tlv('00', $creationMs) . $this->tlv('01', $expiresMs);
        $qr   .= $this->tlv('99', $sub99);

        // Additional Data (មានតែ bill number)
        $addData = '';
        if (!empty($billNumber)) {
            $addData .= $this->tlv('01', substr($billNumber, 0, 25));
        }
        if (!empty($addData)) {
            $qr .= $this->tlv('62', $addData);
        }

        $qr .= '6304';
        $qr .= $this->calculateCRC16($qr);

        return $qr;
    }
    protected function validateKHQR(string $khqr): bool
    {
        if (strlen($khqr) < 50 || substr($khqr, -8, 4) !== '6304') return false;
        $crc = strtoupper(substr($khqr, -4));
        return $crc === $this->calculateCRC16(substr($khqr, 0, -4));
    }

    protected function tlv(string $tag, string $value): string
    {
        return $tag . str_pad(strlen($value), 2, '0', STR_PAD_LEFT) . $value;
    }

    protected function calculateCRC16(string $data): string
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) & 0xFFFF : ($crc << 1) & 0xFFFF;
            }
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    protected function notifySellerPayment(Order $order): void
    {
        try {
            $order->load(['items', 'user']);
            $sellerId = $order->items->first()->seller_id ?? null;
            if (!$sellerId) return;

            $seller = Seller::where('user_id', $sellerId)->first();
            if (!$seller || !$seller->hasTelegramConfigured()) return;

            $telegram = app(\App\Services\TelegramService::class);
            $telegram->sendPaymentReceivedNotification(
                $seller->telegram_bot_token,
                $seller->telegram_chat_id,
                [
                    'order_number'   => $order->order_number,
                    'customer_name'  => $order->user->username ?? $order->recipient_name,
                    'total_amount'   => $order->total_amount,
                    'payment_method' => 'KHQR (Bakong)',
                    'paid_at'        => $order->paid_at->format('d/m/Y H:i'),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Telegram failed', ['error' => $e->getMessage()]);
        }
    }
}
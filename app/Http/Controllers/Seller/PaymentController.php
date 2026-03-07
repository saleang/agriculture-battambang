<?php
// app/Http/Controllers/Seller/PaymentController.php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments for the seller.
     */
    public function index()
    {
        $seller = Auth::user()->seller;
        
        if (!$seller) {
            return redirect()->back()->with('error', 'Seller profile not found');
        }

        // Get seller's product IDs
        $productIds = DB::table('product')
            ->where('seller_id', $seller->seller_id)
            ->pluck('product_id');

        // Get payment statistics
        $statistics = $this->getPaymentStatistics($seller->seller_id, $productIds);

        // Get payments with pagination
        $payments = $this->getPaymentsQuery($seller->seller_id, $productIds)
            ->paginate(10)
            ->through(function ($item) {
                return [
                    'payment_id' => 'PAY-' . str_pad($item->order_id, 3, '0', STR_PAD_LEFT),
                    'order_id' => $item->order_number,
                    'order_date' => $item->order_date,
                    'customer_name' => $item->customer_name,
                    'customer_phone' => $item->customer_phone,
                    'method' => $this->formatPaymentMethod($item->payment_method),
                    'amount_received' => (float) ($item->payment_amount ?? $item->seller_subtotal),
                    'transaction_id' => $item->transaction_id ?? $this->generateTransactionId($item->order_id),
                    'status' => $this->determinePaymentStatus($item),
                    'payment_date' => $item->payment_date ?? $item->paid_at,
                    'refund_amount' => $item->refund_amount ? (float) $item->refund_amount : null
                ];
            });

        return Inertia::render('seller/payments/index', [
            'payments' => $payments,
            'statistics' => $statistics,
            'filters' => request()->all('search', 'status', 'method', 'date_from', 'date_to')
        ]);
    }

    /**
     * Get payment statistics
     */
    private function getPaymentStatistics($sellerId, $productIds)
    {
        // Total earnings (completed payments from order_items)
        $totalEarnings = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.order_id')
            ->whereIn('oi.product_id', $productIds)
            ->where('oi.seller_id', $sellerId)
            ->where('o.payment_status', 'paid')
            ->select(DB::raw('SUM(oi.quantity * oi.price_per_unit) as total'))
            ->first();

        // Pending payouts (completed orders but payment not received)
        $pendingPayouts = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.order_id')
            ->whereIn('oi.product_id', $productIds)
            ->where('oi.seller_id', $sellerId)
            ->where('o.status', 'completed')
            ->where('o.payment_status', 'unpaid')
            ->select(DB::raw('SUM(oi.quantity * oi.price_per_unit) as total'))
            ->first();

        // This month earnings
        $thisMonthEarnings = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.order_id')
            ->whereIn('oi.product_id', $productIds)
            ->where('oi.seller_id', $sellerId)
            ->where('o.payment_status', 'paid')
            ->whereMonth('o.paid_at', now()->month)
            ->whereYear('o.paid_at', now()->year)
            ->select(DB::raw('SUM(oi.quantity * oi.price_per_unit) as total'))
            ->first();

        // Total refunds - need to join with order_items to filter by seller
        $totalRefunds = DB::table('payments as p')
            ->join('order_items as oi', 'p.order_id', '=', 'oi.order_id')
            ->where('oi.seller_id', $sellerId)
            ->where('p.payment_status', 'refunded')
            ->whereIn('oi.product_id', $productIds)
            ->select(DB::raw('SUM(p.refund_amount) as total'))
            ->first();

        return [
            'total_earnings' => (float) ($totalEarnings->total ?? 0),
            'pending_payouts' => (float) ($pendingPayouts->total ?? 0),
            'this_month_earnings' => (float) ($thisMonthEarnings->total ?? 0),
            'total_refunds' => (float) ($totalRefunds->total ?? 0),
            'completed_count' => $this->getPaymentCountByStatus($sellerId, $productIds, 'completed'),
            'pending_count' => $this->getPaymentCountByStatus($sellerId, $productIds, 'pending'),
            'refunded_count' => $this->getPaymentCountByStatus($sellerId, $productIds, 'refunded'),
        ];
    }

    /**
     * Get payments query with filters
     */
    private function getPaymentsQuery($sellerId, $productIds)
    {
        $query = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.order_id')
            ->join('users as u', 'o.user_id', '=', 'u.user_id')
            ->leftJoin('payments as p', 'o.order_id', '=', 'p.order_id')
            ->whereIn('oi.product_id', $productIds)
            ->where('oi.seller_id', $sellerId)
            ->select(
                'o.order_id',
                'o.order_number',
                'o.order_date',
                'o.payment_method',
                'o.payment_status as order_payment_status',
                'o.total_amount',
                'o.created_at',
                'o.paid_at',
                'o.status as order_status',
                'p.payment_id',
                'p.transaction_id',
                'p.amount as payment_amount',
                'p.payment_date',
                'p.payment_status',
                'p.refund_amount',
                'u.username as customer_name',
                'u.phone as customer_phone',
                DB::raw('SUM(oi.quantity * oi.price_per_unit) as seller_subtotal')
            )
            ->groupBy(
                'o.order_id',
                'o.order_number',
                'o.order_date',
                'o.payment_method',
                'o.payment_status',
                'o.total_amount',
                'o.created_at',
                'o.paid_at',
                'o.status',
                'p.payment_id',
                'p.transaction_id',
                'p.amount',
                'p.payment_date',
                'p.payment_status',
                'p.refund_amount',
                'u.username',
                'u.phone'
            );

        // Apply filters
        if ($search = request('search')) {
            $query->where(function($q) use ($search) {
                $q->where('o.order_number', 'like', "%{$search}%")
                  ->orWhere('u.username', 'like', "%{$search}%")
                  ->orWhere('p.transaction_id', 'like', "%{$search}%");
            });
        }

        if ($status = request('status')) {
            if ($status !== 'all') {
                if ($status === 'refunded') {
                    $query->where('p.payment_status', 'refunded');
                } elseif ($status === 'completed') {
                    $query->where(function($q) {
                        $q->where('p.payment_status', 'completed')
                          ->orWhere('o.payment_status', 'paid');
                    });
                } elseif ($status === 'pending') {
                    $query->where(function($q) {
                        $q->whereNull('p.payment_status')
                          ->where('o.payment_status', 'unpaid')
                          ->where('o.status', 'completed');
                    });
                }
            }
        }

        if ($method = request('method')) {
            if ($method !== 'all') {
                $query->where('o.payment_method', $method);
            }
        }

        if ($dateFrom = request('date_from')) {
            $query->whereDate('o.order_date', '>=', $dateFrom);
        }

        if ($dateTo = request('date_to')) {
            $query->whereDate('o.order_date', '<=', $dateTo);
        }

        return $query->orderBy('o.order_date', 'desc');
    }

    /**
     * Display the specified payment.
     */
    public function show($paymentId)
    {
        $seller = Auth::user()->seller;
        
        // Extract order ID from payment ID
        $orderId = (int) filter_var($paymentId, FILTER_SANITIZE_NUMBER_INT);
        
        $paymentDetails = DB::table('orders as o')
            ->join('order_items as oi', 'o.order_id', '=', 'oi.order_id')
            ->join('users as u', 'o.user_id', '=', 'u.user_id')
            ->leftJoin('payments as p', 'o.order_id', '=', 'p.order_id')
            ->where('o.order_id', $orderId)
            ->where('oi.seller_id', $seller->seller_id)
            ->select(
                'o.order_id',
                'o.order_number',
                'o.order_date',
                'o.payment_method',
                'o.payment_status',
                'o.total_amount',
                'o.created_at',
                'o.paid_at',
                'o.shipping_address',
                'o.recipient_name',
                'o.recipient_phone',
                'o.customer_notes',
                'u.username as customer_name',
                'u.email as customer_email',
                'u.phone as customer_phone',
                'p.payment_id',
                'p.transaction_id',
                'p.amount as payment_amount',
                'p.payment_date',
                'p.payment_status as payment_status_detail',
                'p.refund_amount',
                'p.refund_reason',
                'p.refunded_at'
            )
            ->first();

        if (!$paymentDetails) {
            return redirect()->back()->with('error', 'Payment not found');
        }

        // Get items for this order from this seller
        $items = DB::table('order_items as oi')
            ->join('product as p', 'oi.product_id', '=', 'p.product_id')
            ->where('oi.order_id', $orderId)
            ->where('oi.seller_id', $seller->seller_id)
            ->select(
                'oi.product_name',
                'oi.quantity',
                'oi.unit',
                'oi.price_per_unit',
                'p.image_url as product_image',
                DB::raw('(oi.quantity * oi.price_per_unit) as subtotal')
            )
            ->get();

        // Get seller's bank info
        $bankInfo = [
            'account_name' => $seller->bank_account_name,
            'account_number' => $seller->bank_account_number,
            'qr_code' => $seller->payment_qr_code
        ];

        return Inertia::render('seller/payments/show', [
            'payment' => [
                'payment_id' => 'PAY-' . str_pad($paymentDetails->order_id, 3, '0', STR_PAD_LEFT),
                'order_id' => $paymentDetails->order_number,
                'order_date' => $paymentDetails->order_date,
                'customer' => [
                    'name' => $paymentDetails->customer_name,
                    'email' => $paymentDetails->customer_email,
                    'phone' => $paymentDetails->customer_phone,
                ],
                'shipping_address' => $paymentDetails->shipping_address,
                'recipient_name' => $paymentDetails->recipient_name,
                'recipient_phone' => $paymentDetails->recipient_phone,
                'customer_notes' => $paymentDetails->customer_notes,
                'method' => $this->formatPaymentMethod($paymentDetails->payment_method),
                'amount' => (float) ($paymentDetails->payment_amount ?? $paymentDetails->total_amount),
                'seller_amount' => (float) $items->sum('subtotal'),
                'transaction_id' => $paymentDetails->transaction_id ?? $this->generateTransactionId($paymentDetails->order_id),
                'status' => $this->determinePaymentStatus($paymentDetails),
                'payment_date' => $paymentDetails->payment_date ?? $paymentDetails->paid_at,
                'created_at' => $paymentDetails->created_at,
                'refund_amount' => $paymentDetails->refund_amount ? (float) $paymentDetails->refund_amount : null,
                'refund_reason' => $paymentDetails->refund_reason,
                'refunded_at' => $paymentDetails->refunded_at,
                'items' => $items,
                'bank_info' => $bankInfo
            ]
        ]);
    }

    /**
     * Update payment status
     */
    public function updateStatus(Request $request, $paymentId)
    {
        $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
            'transaction_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $orderId = (int) filter_var($paymentId, FILTER_SANITIZE_NUMBER_INT);

        DB::beginTransaction();
        
        try {
            $payment = Payment::updateOrCreate(
                ['order_id' => $orderId],
                [
                    'payment_status' => $request->status,
                    'transaction_id' => $request->transaction_id,
                    'notes' => $request->notes,
                    'payment_date' => $request->status === 'completed' ? now() : null
                ]
            );

            // Update order payment status if payment is completed
            if ($request->status === 'completed') {
                DB::table('orders')
                    ->where('order_id', $orderId)
                    ->update([
                        'payment_status' => 'paid',
                        'paid_at' => now()
                    ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Payment status updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update payment status: ' . $e->getMessage());
        }
    }

    /**
     * Process a refund.
     */
    public function refund(Request $request, $paymentId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500'
        ]);

        $orderId = (int) filter_var($paymentId, FILTER_SANITIZE_NUMBER_INT);
        
        DB::beginTransaction();
        
        try {
            $payment = Payment::updateOrCreate(
                ['order_id' => $orderId],
                [
                    'refund_amount' => $request->amount,
                    'refund_reason' => $request->reason,
                    'refunded_at' => now(),
                    'payment_status' => 'refunded',
                    'updated_at' => now()
                ]
            );

            DB::commit();

            return redirect()->back()->with('success', 'Refund processed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to process refund: ' . $e->getMessage());
        }
    }

    /**
     * Export payments data.
     */
    public function export(Request $request)
    {
        $seller = Auth::user()->seller;
        $productIds = DB::table('product')
            ->where('seller_id', $seller->seller_id)
            ->pluck('product_id');

        $payments = $this->getPaymentsQuery($seller->seller_id, $productIds)->get();

        // Generate CSV
        $filename = 'payments_export_' . date('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'w+');
        
        // Add headers
        fputcsv($handle, [
            'Payment ID',
            'Order ID',
            'Order Date',
            'Customer Name',
            'Customer Phone',
            'Payment Method',
            'Amount',
            'Transaction ID',
            'Status',
            'Payment Date',
            'Refund Amount'
        ]);

        // Add data
        foreach ($payments as $payment) {
            fputcsv($handle, [
                'PAY-' . str_pad($payment->order_id, 3, '0', STR_PAD_LEFT),
                $payment->order_number,
                $payment->order_date,
                $payment->customer_name,
                $payment->customer_phone,
                $this->formatPaymentMethod($payment->payment_method),
                $payment->payment_amount ?? $payment->seller_subtotal,
                $payment->transaction_id ?? '',
                $this->determinePaymentStatus($payment),
                $payment->payment_date ?? $payment->paid_at,
                $payment->refund_amount ?? ''
            ]);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Helper functions
     */
    private function formatPaymentMethod($method)
    {
        return match($method) {
            'KHQR' => 'KHQR',
            'manual(cash)' => 'Cash on Delivery',
            'bank_transfer' => 'Bank Transfer',
            'mobile_banking' => 'Mobile Banking',
            'cash' => 'Cash',
            default => ucfirst(str_replace('_', ' ', $method))
        };
    }

    private function generateTransactionId($orderId)
    {
        return 'TXN-' . date('Y') . '-' . str_pad($orderId, 4, '0', STR_PAD_LEFT);
    }

    private function determinePaymentStatus($item)
    {
        if (isset($item->payment_status) && $item->payment_status === 'refunded') {
            return 'refunded';
        }
        
        if (isset($item->payment_status) && $item->payment_status === 'completed') {
            return 'completed';
        }
        
        if ($item->order_payment_status === 'paid') {
            return 'completed';
        }
        
        if ($item->order_status === 'completed' && $item->order_payment_status === 'unpaid') {
            return 'pending';
        }
        
        return 'pending';
    }

    private function getPaymentCountByStatus($sellerId, $productIds, $status)
    {
        if ($status === 'refunded') {
            return DB::table('payments as p')
                ->join('order_items as oi', 'p.order_id', '=', 'oi.order_id')
                ->where('oi.seller_id', $sellerId)
                ->whereIn('oi.product_id', $productIds)
                ->where('p.payment_status', 'refunded')
                ->distinct('p.order_id')
                ->count('p.order_id');
        }

        $query = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.order_id')
            ->leftJoin('payments as p', 'o.order_id', '=', 'p.order_id')
            ->where('oi.seller_id', $sellerId)
            ->whereIn('oi.product_id', $productIds);

        if ($status === 'completed') {
            $query->where(function($q) {
                $q->where('p.payment_status', 'completed')
                  ->orWhere('o.payment_status', 'paid');
            });
        } elseif ($status === 'pending') {
            $query->whereNull('p.payment_status')
                  ->where('o.payment_status', 'unpaid')
                  ->where('o.status', 'completed');
        }

        return $query->distinct('o.order_id')->count('o.order_id');
    }
}
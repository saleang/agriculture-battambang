<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class SellerOrderController extends Controller
{
    protected TelegramService $telegram;

    public function __construct(TelegramService $telegram)
    {
        $this->telegram = $telegram;
    }

    /**
     * Confirm a pending order.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirm(Order $order)
    {
        // Authorization: Ensure the authenticated seller owns this order
        if (Gate::denies('manage-order', $order)) {
            return response()->json(['message' => 'You are not authorized to update this order.'], 403);
        }

        // Logic: Check if the order can be confirmed
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be confirmed.'], 422);
        }

        // Action: Update the order status
        try {
            $order->update(['status' => Order::STATUS_CONFIRMED]);
            return response()->json(['message' => 'Order confirmed successfully.', 'order' => $order]);
        } catch (\Exception $e) {
            Log::error("Error confirming order #{$order->order_id}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to confirm the order. Please try again.'], 500);
        }
    }

    /**
     * Get seller's orders
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $sellerId = $user->seller->seller_id;

        // Get orders that contain items from this seller
        $orders = Order::with(['items' => function($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            }, 'items.product.images', 'user'])
            ->whereHas('items', function($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $request->wantsJson()
            ? response()->json($orders)
            : inertia('seller/orders/index', ['orders' => $orders]);
    }

    /**
     * Show single order for seller
     */
    public function show(Order $order)
    {
        $user = Auth::user();
        
        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $sellerId = $user->seller->seller_id;

        // Check if seller has items in this order
        $hasItems = $order->items()->where('seller_id', $sellerId)->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['items' => function($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        }, 'items.product.images', 'user']);

        return inertia('seller/orders/show', ['order' => $order]);
    }

    //  Complete order (seller confirms they've prepared the order)
    public function complete(Order $order)
    {
        $user = Auth::user();
        
        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $sellerId = $user->seller->seller_id;

        // Check if seller has items in this order
        $hasItems = $order->items()->where('seller_id', $sellerId)->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized - You don\'t have items in this order'], 403);
        }

        if (!$order->canBeCompleted()) {
            return response()->json([
                'message' => 'Order cannot be completed at this stage. Current status: ' . $order->status
            ], 400);
        }

        try {
            $order->update([
                'status' => Order::STATUS_COMPLETED,
            ]);

            // Notify customer that order has been completed
            $this->notifyCustomerOrderCompleted($order);

            return response()->json([
                'message' => 'Order marked as completed successfully',
                'data' => $order
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order completion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to complete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel order by seller (with reason required)
     */
    public function cancel(Request $request, Order $order)
    {
        $user = Auth::user();
        
        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $sellerId = $user->seller->seller_id;

        // Check if seller has items in this order
        $hasItems = $order->items()->where('seller_id', $sellerId)->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized - You don\'t have items in this order'], 403);
        }

        if (!$order->canBeCancelledBySeller()) {
            return response()->json([
                'message' => 'Order cannot be cancelled at this stage. Current status: ' . $order->status
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancelled_by' => Order::CANCELLED_BY_SELLER,
                'cancellation_reason' => $validated['reason'],
            ]);

            // Notify customer about cancellation
            $this->notifyCustomerOrderCancelled($order);

            // Log the cancellation
            Log::info('Order cancelled by seller', [
                'order_id' => $order->order_id,
                'seller_id' => $sellerId,
                'reason' => $validated['reason']
            ]);

            return response()->json([
                'message' => 'Order cancelled successfully',
                'data' => $order
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order cancellation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payment status (for manual/cash payments)
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $user = Auth::user();
        
        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $sellerId = $user->seller->seller_id;

        // Check if seller has items in this order
        $hasItems = $order->items()->where('seller_id', $sellerId)->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow for manual payment method
        if ($order->payment_method !== Order::PAYMENT_MANUAL) {
            return response()->json([
                'message' => 'Payment status can only be updated for manual payments'
            ], 400);
        }

        $validated = $request->validate([
            'payment_status' => 'required|in:paid,unpaid',
        ]);

        try {
            $updateData = [
                'payment_status' => $validated['payment_status'],
            ];

            if ($validated['payment_status'] === Order::PAYMENT_PAID) {
                $updateData['paid_at'] = now();
            } else {
                $updateData['paid_at'] = null;
            }

            $order->update($updateData);

            return response()->json([
                'message' => 'Payment status updated successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notify customer that order has been completed
     */
    protected function notifyCustomerOrderCompleted(Order $order): void
    {
        try {
            $order->load(['items', 'user']);

            Log::info('Order completed notification', [
                'order_id' => $order->order_id,
                'customer_id' => $order->user_id,
                'status' => $order->status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify customer about order completion', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify customer that order has been cancelled by seller
     */
    protected function notifyCustomerOrderCancelled(Order $order): void
    {
        try {
            $order->load(['items', 'user']);

            Log::info('Order cancellation notification sent to customer', [
                'order_id' => $order->order_id,
                'customer_id' => $order->user_id,
                'cancellation_reason' => $order->cancellation_reason
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify customer about order cancellation', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
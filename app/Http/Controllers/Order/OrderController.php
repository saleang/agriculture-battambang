<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    protected TelegramService $telegram;

    public function __construct(TelegramService $telegram)
    {
        $this->telegram = $telegram;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $orders = Order::with(['items.product.images', 'user'])
            ->where('user_id', $user->user_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $request->wantsJson()
            ? response()->json($orders)
            : inertia('customer/orders/index', ['orders' => $orders]);
    }

    public function show(Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['items.product.images', 'user']);
        return response()->json(['data' => $order]);
    }

    /**
     * ✅ CREATE SEPARATE ORDER FOR EACH SELLER
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        try {
            $validated = $request->validate([
                'recipient_name' => 'nullable|string|max:255',
                'recipient_phone' => 'nullable|string|max:20',
                'shipping_address' => 'nullable|string',
                'payment_method' => 'required|in:KHQR,manual(cash)',
                'customer_notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer|exists:product,product_id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $recipientName = $validated['recipient_name'] ?? $user->username ?? 'N/A';
            $recipientPhone = $validated['recipient_phone'] ?? $user->phone ?? 'N/A';
            $shippingAddress = $validated['shipping_address'] ?? $user->address ?? 'N/A';

            DB::beginTransaction();

            // GROUP ITEMS BY SELLER
            $itemsBySeller = [];

            foreach ($validated['items'] as $item) {
                $product = Product::with('images', 'seller')->findOrFail($item['product_id']);

                if (!$product->seller_id) {
                    throw new \Exception("Product '{$product->productname}' does not have a seller assigned.");
                }

                if (!$product->is_active) {
                    throw new \Exception("Product '{$product->productname}' is no longer available.");
                }

                // Get seller's user_id (for foreign key reference in order_items)
                $sellerId = $product->seller->user_id ?? null;

                if (!$sellerId) {
                    throw new \Exception("Seller for product '{$product->productname}' does not have a user account.");
                }

                if (!isset($itemsBySeller[$sellerId])) {
                    $itemsBySeller[$sellerId] = [
                        'seller' => $product->seller,
                        'items' => [],
                        'total' => 0
                    ];
                }

                $subtotal = $product->price * $item['quantity'];

                $itemsBySeller[$sellerId]['items'][] = [
                    'product' => $product,
                    'product_id' => $product->product_id,
                    'seller_id' => $sellerId, // seller's user_id (foreign key to users.user_id)
                    'product_name' => $product->productname,
                    'product_image' => $product->images->first()?->image_url,
                    'unit' => $product->unit,
                    'quantity' => $item['quantity'],
                    'price_per_unit' => $product->price,
                ];

                $itemsBySeller[$sellerId]['total'] += $subtotal;
            }

            $createdOrders = [];

            // ✅ CREATE SEPARATE ORDER FOR EACH SELLER
            foreach ($itemsBySeller as $sellerId => $sellerData) {
                $order = Order::create([
                    'user_id' => $user->user_id,
                    'status' => Order::STATUS_CONFIRMED,
                    'recipient_name' => $recipientName,
                    'recipient_phone' => $recipientPhone,
                    'shipping_address' => $shippingAddress,
                    'total_amount' => $sellerData['total'],
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => Order::PAYMENT_UNPAID,
                    'customer_notes' => $validated['customer_notes'] ?? null,
                ]);

                // Add items to order
                foreach ($sellerData['items'] as $itemData) {
                    unset($itemData['product']); // Remove product object before creating
                    $order->items()->create($itemData);
                }

                $createdOrders[] = $order;

                // ✅ SEND TELEGRAM NOTIFICATION TO SELLER
                $this->notifySeller($order, $sellerData['seller']);
            }

            DB::commit();

            return response()->json([
                'message' => count($createdOrders) === 1
                    ? 'Order created successfully!'
                    : count($createdOrders) . ' orders created successfully!',
                'data' => [
                    'orders' => $createdOrders,
                    'sellers_count' => count($createdOrders)
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->user_id,
            ]);
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SEND TELEGRAM NOTIFICATION TO SINGLE SELLER
     */
    protected function notifySeller(Order $order, Seller $seller): void
    {
        try {
            if (!$seller->hasTelegramConfigured()) {
                return;
            }

            $order->load(['items', 'user']);

            $orderData = [
                'order_number' => $order->order_number,
                'customer_name' => $order->user->username ?? $order->recipient_name,
                'customer_phone' => $order->recipient_phone,
                'shipping_address' => $order->shipping_address,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method === 'KHQR' ? 'KHQR' : 'សាច់ប្រាក់',
                'customer_notes' => $order->customer_notes,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'items' => $order->items->map(fn($item) => [
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'price_per_unit' => number_format($item->price_per_unit, 0),
                ])->toArray(),
            ];

            $this->telegram->sendOrderNotification(
                $seller->telegram_bot_token,
                $seller->telegram_chat_id,
                $orderData
            );

            Log::info('Telegram notification sent', [
                'order_id' => $order->order_id,
                'seller_id' => $seller->seller_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Telegram notification failed', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * CUSTOMER CAN CANCEL ONLY IF NOT COMPLETED
     */
    public function cancel(Request $request, Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Can only cancel if seller hasn't completed yet
        if (!$order->canBeCancelledByCustomer()) {
            if ($order->status === Order::STATUS_COMPLETED) {
                return response()->json([
                    'message' => 'Cannot cancel completed order. Please contact seller.'
                ], 400);
            }
            if ($order->status === Order::STATUS_CANCELLED) {
                return response()->json([
                    'message' => 'Order is already cancelled.'
                ], 400);
            }
            return response()->json([
                'message' => 'Order cannot be cancelled at this stage. Current status: ' . $order->status
            ], 400);
        }

        $validated = $request->validate(['reason' => 'nullable|string|max:500']);

        try {
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancelled_by' => Order::CANCELLED_BY_CUSTOMER,
                'cancellation_reason' => $validated['reason'] ?? 'Cancelled by customer',
            ]);

            // Notify seller about cancellation
            $this->notifySellerCancellation($order);

            Log::info('Order cancelled by customer', [
                'order_id' => $order->order_id,
                'customer_id' => $user->user_id,
                'reason' => $validated['reason'] ?? 'Cancelled by customer'
            ]);

            return response()->json([
                'message' => 'Order cancelled successfully',
                'data' => $order
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to cancel order', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to cancel order'], 500);
        }
    }

    protected function notifySellerCancellation(Order $order): void
    {
        $order->load(['items', 'user']);
        $sellerId = $order->items->first()->seller_id ?? null;

        if (!$sellerId) return;

        try {
            $seller = Seller::where('user_id', $sellerId)->first();
            if (!$seller || !$seller->hasTelegramConfigured()) return;

            $this->telegram->sendOrderCancelledNotification(
                $seller->telegram_bot_token,
                $seller->telegram_chat_id,
                [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user->username ?? $order->recipient_name,
                    'total_amount' => $order->total_amount,
                    'cancellation_reason' => $order->cancellation_reason,
                    'cancelled_at' => $order->cancelled_at->format('d/m/Y H:i'),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to send cancellation notification', ['error' => $e->getMessage()]);
        }
    }

    public function makePayment(Request $request, Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$order->canBePaid()) {
            return response()->json(['message' => 'Order cannot be paid'], 400);
        }

        try {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'paid_at' => now(),
            ]);

            // Notify seller about payment
            $this->notifySellerPayment($order);

            return response()->json(['message' => 'Payment recorded', 'data' => $order]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to record payment'], 500);
        }
    }

    public function notifySellerPayment(Order $order): void
    {
        $order->load(['items', 'user']);
        $sellerId = $order->items->first()->seller_id ?? null;

        if (!$sellerId) return;

        try {
            $seller = Seller::where('user_id', $sellerId)->first();
            if (!$seller || !$seller->hasTelegramConfigured()) return;

            $this->telegram->sendPaymentReceivedNotification(
                $seller->telegram_bot_token,
                $seller->telegram_chat_id,
                [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user->username ?? $order->recipient_name,
                    'total_amount' => $order->total_amount,
                    'payment_method' => $order->payment_method === 'KHQR' ? 'KHQR' : 'សាច់ប្រាក់',
                    'paid_at' => $order->paid_at->format('d/m/Y H:i'),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment notification', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Add a product to the user's shopping cart.
     * This implementation uses a dedicated Order record with an 'in_cart' status.
     */
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:product,product_id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $product = Product::with(['seller', 'images'])->findOrFail($validated['product_id']);

        if (!$product->seller?->user_id) {
            return response()->json(['message' => 'Product seller is not configured correctly.'], 400);
        }

        DB::beginTransaction();
        try {
            // Find an existing cart or create a new one.
            // We'll use a custom status 'in_cart' to represent the cart.
            $cart = Order::firstOrCreate(
                [
                    'user_id' => $user->user_id,
                    'status' => 'in_cart',
                ],
                [
                    'total_amount' => 0, // Initial total
                    'payment_method' => 'KHQR', // A default value
                    'payment_status' => Order::PAYMENT_UNPAID,
                ]
            );

            // Check if the item is already in the cart
            $orderItem = $cart->items()->where('product_id', $product->product_id)->first();

            if ($orderItem) {
                // If it exists, update the quantity
                $orderItem->quantity += $validated['quantity'];
                $orderItem->price_per_unit = $product->price; // Update price in case it changed
                $orderItem->save();
            } else {
                // If not, create a new order item, mirroring fields from the `store` method
                $orderItem = new OrderItem([
                    'product_id' => $product->product_id,
                    'seller_id' => $product->seller->user_id,
                    'product_name' => $product->productname,
                    'product_image' => $product->images->first()?->image_url,
                    'unit' => $product->unit,
                    'quantity' => $validated['quantity'],
                    'price_per_unit' => $product->price,
                ]);
                $cart->items()->save($orderItem);
            }

            // Recalculate the total amount for the cart
            $cart->load('items');
            $cart->total_amount = $cart->items->sum(function ($item) {
                return $item->quantity * $item->price_per_unit;
            });
            $cart->save();

            DB::commit();

            return response()->json([
                'message' => 'Product added to cart successfully!',
                'data' => $cart->load('items.product.images')
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add product to cart', [
                'error' => $e->getMessage(),
                'user_id' => $user->user_id,
            ]);
            return response()->json(['message' => 'Failed to add product to cart.', 'error' => $e->getMessage()], 500);
        }
    }
}

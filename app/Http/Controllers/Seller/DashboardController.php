<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return redirect()->route('home')->with('error', 'You are not a seller.');
        }

        // Stats
        $totalSales = OrderItem::where('seller_id', $seller->seller_id)
            ->whereHas('order', function ($query) {
                $query->where('status', '!=', Order::STATUS_CANCELLED);
            })
            ->sum(DB::raw('price_per_unit * quantity'));

        $activeProductsCount = Product::where('seller_id', $seller->seller_id)
            ->where('is_active', true)
            ->count();

        // Recent Orders for this seller
        $recentOrders = Order::join('users', 'orders.user_id', '=', 'users.user_id')
            ->whereHas('items', function ($query) use ($seller) {
                $query->where('seller_id', $seller->seller_id);
            })
            ->with(['items' => function ($query) use ($seller) {
                $query->where('seller_id', $seller->seller_id)->with('product');
            }])
            ->select('orders.*', 'users.username as customer_name')
            ->orderBy('orders.created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($order) use ($seller) {
                $sellerTotal = $order->items->reduce(function ($carry, $item) {
                    return $carry + ($item->price_per_unit * $item->quantity);
                }, 0);

                return [
                    'order_id' => $order->order_id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'status' => $order->status,
                    'seller_total' => $sellerTotal,
                    'order_date' => $order->created_at->locale('km')->isoFormat('D MMMM YYYY'),
                ];
            });

        // Sales data for chart (last 30 days)
        $salesQuery = Order::whereHas('items', function ($query) use ($seller) {
            $query->where('seller_id', $seller->seller_id);
        })
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as orders'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        $salesData = collect(range(0, 29))->map(function ($i) use ($salesQuery) {
            $date = Carbon::now()->subDays($i);
            $dateString = $date->toDateString();
            $sale = $salesQuery->get($dateString);

            return [
                'date' => $date->format('M d'),
                'orders' => $sale ? $sale->orders : 0,
            ];
        })->reverse()->values();

        // Top selling products
        $topProducts = OrderItem::where('seller_id', $seller->seller_id)
            ->whereHas('order', function ($query) {
                $query->where('status', '!=', Order::STATUS_CANCELLED);
            })
            ->with('product:product_id,productname')
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(price_per_unit * quantity) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->take(4)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product?->productname,
                    'sold' => (int) $item->total_quantity,
                    'revenue' => (float) $item->total_revenue,
                ];
            });

        $sellerData = [
            'total_sales' => $totalSales,
            'active_products_count' => $activeProductsCount,
            'farm_name' => $seller->farm_name,
            'full_location' => $seller->full_location,
            'certification' => $seller->certification,
            'description' => $seller->description,
        ];

        return Inertia::render('seller/dashboard', [
            'seller' => $sellerData,
            'recentOrders' => $recentOrders,
            'salesData' => $salesData,
            'topProducts' => $topProducts,
        ]);
    }
}
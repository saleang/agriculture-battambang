<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Seller;
use App\Models\OrderItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with dynamic data
     */
    public function index()
    {
        // ── Stats ─────────────────────────────────────────────────────
        $totalUsers     = User::count();
        $totalSellers   = User::where('role', 'seller')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts  = Product::count();
        $activeProducts = Product::where('is_active', true)->count();

        // Pending seller approvals = sellers whose user account is inactive/pending
        $pendingApprovals = User::where('role', 'seller')
            ->where('status', 'inactive')
            ->count();

        // Pending orders = confirmed or processing
        $pendingOrders = Order::whereIn('status', [
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
        ])->count();

        // Total revenue = sum of paid completed orders
        $totalRevenue = Order::where('payment_status', Order::PAYMENT_PAID)
            ->sum('total_amount');

        // ── Monthly revenue & orders (last 7 months) ──────────────────
        $khmerMonths = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];

        // ── Monthly revenue & orders (last 7 months) ──────────────────
        $monthlyData = collect(range(6, 0))->map(function ($i) use ($khmerMonths) {
            $month = Carbon::now()->subMonths($i);
            $revenue = Order::where('payment_status', Order::PAYMENT_PAID)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_amount');
            $orders = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $users = User::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            return [
                // 'm'   => $month->locale('km')->isoFormat('MMM'),

                'm' => $khmerMonths[$month->month - 1],
                'rev' => round($revenue / 1_000_000, 2), // in millions
                'ord' => $orders,
                'usr' => $users,
            ];
        })->values()->toArray();

        // // ── Product category breakdown ────────────────────────────────
        // $categoryData = Category::withCount(['sellers as product_count' => function ($q) {
        //     // count products linked through sellers in this category
        // }])
        //     ->with(['sellers.user'])
        //     ->get()
        //     ->map(function ($cat) {
        //         // Count products belonging to sellers in this category
        //         $count = Product::whereHas(
        //             'seller.categories',
        //             fn($q) =>
        //             $q->where('category.category_id', $cat->category_id)
        //         )->count();
        //         return [
        //             'name' => $cat->category_name,
        //             'v'    => $count,
        //         ];
        //     })
        //     ->filter(fn($c) => $c['v'] > 0)
        //     ->sortByDesc('v')
        //     ->take(5)
        //     ->values()
        //     ->toArray();

        // ✅ FIXED
        $categoryData = Category::all()
            ->map(function ($cat) {
                $count = Product::whereHas(
                    'seller.category',
                    fn($q) => $q->where('category.category_id', $cat->category_id)
                )->count();
                return [
                    'name' => $cat->category_name,
                    'v'    => $count,
                ];
            })
            ->filter(fn($c) => $c['v'] > 0)
            ->sortByDesc('v')
            ->take(5)
            ->values()
            ->toArray();
        // Normalize to percentages
        $totalCatProducts = collect($categoryData)->sum('v');
        if ($totalCatProducts > 0) {
            $categoryData = collect($categoryData)->map(fn($c) => [
                'name' => $c['name'],
                'v'    => (int) round(($c['v'] / $totalCatProducts) * 100),
            ])->toArray();
        }

        // ── Sparkline data (last 12 months) ───────────────────────────
        $sparkRevenue = collect(range(11, 0))->map(
            fn($i) =>
            round(Order::where('payment_status', Order::PAYMENT_PAID)
                ->whereYear('created_at', Carbon::now()->subMonths($i)->year)
                ->whereMonth('created_at', Carbon::now()->subMonths($i)->month)
                ->sum('total_amount') / 1_000_000, 1)
        )->values()->toArray();

        $sparkOrders = collect(range(11, 0))->map(
            fn($i) =>
            Order::whereYear('created_at', Carbon::now()->subMonths($i)->year)
                ->whereMonth('created_at', Carbon::now()->subMonths($i)->month)
                ->count()
        )->values()->toArray();

        $sparkUsers = collect(range(11, 0))->map(
            fn($i) =>
            User::whereYear('created_at', Carbon::now()->subMonths($i)->year)
                ->whereMonth('created_at', Carbon::now()->subMonths($i)->month)
                ->count()
        )->values()->toArray();

        // ── Recent orders (last 5) ────────────────────────────────────
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id'       => $order->order_number,
                'customer' => $order->user?->username ?? $order->recipient_name ?? 'Unknown',
                'amount'   => number_format($order->total_amount, 0) . ' ៛',
                'status'   => $order->status,
                // 'date'     => $order->created_at->locale('km')->isoFormat('D MMM'),
                'date' => $order->created_at->format('d/m'),
            ])->toArray();

        // ── Pending sellers (awaiting approval) ───────────────────────
        $pendingSellers = User::where('role', 'seller')
            ->where('status', 'inactive')
            ->with('seller.province')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($user) => [
                'id'       => $user->user_id,
                'name'     => $user->username,
                'location' => $user->seller?->province?->name_km ?? '-',
                'products' => Product::where('seller_id', $user->seller?->seller_id ?? 0)->count(),
                'date'     => $user->created_at->locale('km')->isoFormat('D MMM'),
            ])->toArray();

        // ── Recent activities (last 8 events) ─────────────────────────
        $recentActivities = collect();

        // New user registrations
        User::latest()->take(3)->get()->each(function ($user) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'user_' . $user->user_id,
                'action' => "<strong>{$user->username}</strong> បានចុះឈ្មោះជា {$user->role}",
                'user'   => $user->username,
                'time'   => $user->created_at->diffForHumans(),
                'status' => 'new',
                'type'   => 'user',
            ]);
        });

        // Recent orders
        Order::with('user')->latest()->take(3)->get()->each(function ($order) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'order_' . $order->order_id,
                'action' => "ការបញ្ជាទិញ <strong>{$order->order_number}</strong> ស្ថានភាព: {$order->status}",
                'user'   => $order->user?->username ?? 'Unknown',
                'time'   => $order->created_at->diffForHumans(),
                'status' => $order->status,
                'type'   => 'order',
            ]);
        });

        // New products
        Product::with('seller.user')->latest()->take(2)->get()->each(function ($product) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'product_' . $product->product_id,
                'action' => "ផលិតផលថ្មី <strong>{$product->productname}</strong> ត្រូវបានបន្ថែម",
                'user'   => $product->seller?->user?->username ?? 'Unknown',
                'time'   => $product->created_at->diffForHumans(),
                'status' => $product->is_active ? 'active' : 'inactive',
                'type'   => 'product',
            ]);
        });

        $recentActivities = $recentActivities
            ->sortByDesc(fn($a) => $a['time'])
            ->values()
            ->take(8)
            ->toArray();

        // ── Platform health metrics ────────────────────────────────────
        $activeRate       = $totalProducts > 0 ? round(($activeProducts / $totalProducts) * 100) : 0;
        $completionRate   = Order::count() > 0
            ? round((Order::where('status', Order::STATUS_COMPLETED)->count() / Order::count()) * 100)
            : 0;
        $userActivityRate = $totalUsers > 0
            ? round(($totalCustomers / $totalUsers) * 100)
            : 0;
        $paymentSuccessRate = Order::whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_PROCESSING])->count() > 0
            ? round((Order::where('payment_status', Order::PAYMENT_PAID)->count() /
                max(Order::whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_PROCESSING])->count(), 1)) * 100)
            : 0;

        // ── Calendar events (upcoming orders & activities) ────────────
        $calendarEvents = Order::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->get()
            ->groupBy(fn($o) => Carbon::parse($o->created_at)->day)
            ->map(fn($orders, $day) => $orders->map(fn($o) => [
                'label' => 'ការបញ្ជា',
                'color' => match ($o->status) {
                    Order::STATUS_COMPLETED  => '#228B22',
                    Order::STATUS_PROCESSING => '#32CD32',
                    Order::STATUS_CONFIRMED  => '#FFD700',
                    default                  => '#90EE90',
                },
            ])->take(2)->values()->toArray())
            ->toArray();

        // ── Trend comparison (vs last month) ─────────────────────────
        $thisMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        $usersThisMonth = User::whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $usersLastMonth = User::whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $userTrend = $usersLastMonth > 0 ? round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100) : 0;

        $revenueThisMonth = Order::where('payment_status', Order::PAYMENT_PAID)->whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->sum('total_amount');
        $revenueLastMonth = Order::where('payment_status', Order::PAYMENT_PAID)->whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->sum('total_amount');
        $revenueTrend = $revenueLastMonth > 0 ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100) : 0;

        $ordersThisMonth = Order::whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $ordersLastMonth = Order::whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $orderTrend = $ordersLastMonth > 0 ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100) : 0;

        $sellersThisMonth = User::where('role', 'seller')->whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $sellersLastMonth = User::where('role', 'seller')->whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $sellerTrend = $sellersLastMonth > 0 ? round((($sellersThisMonth - $sellersLastMonth) / $sellersLastMonth) * 100) : 0;

        // ── Render ────────────────────────────────────────────────────
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'        => $totalUsers,
                'total_sellers'      => $totalSellers,
                'total_customers'    => $totalCustomers,
                'total_products'     => $totalProducts,
                'active_products'    => $activeProducts,
                'pending_approvals'  => $pendingApprovals,
                'pending_orders'     => $pendingOrders,
                'total_revenue'      => (float) $totalRevenue,
            ],
            'trends' => [
                'user_trend'     => $userTrend,
                'revenue_trend'  => $revenueTrend,
                'order_trend'    => $orderTrend,
                'seller_trend'   => $sellerTrend,
            ],
            'platformHealth' => [
                'active_rate'          => $activeRate,
                'completion_rate'      => $completionRate,
                'user_activity_rate'   => $userActivityRate,
                'payment_success_rate' => $paymentSuccessRate,
            ],
            'monthlyData'       => $monthlyData,
            'categoryData'      => $categoryData,
            'sparkData'         => [
                'revenue' => $sparkRevenue,
                'orders'  => $sparkOrders,
                'users'   => $sparkUsers,
            ],
            'recentOrders'      => $recentOrders,
            'pendingSellers'    => $pendingSellers,
            'recentActivities'  => $recentActivities,
            'calendarEvents'    => $calendarEvents,
        ]);
    }
}

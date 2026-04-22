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
     * All statuses that represent a real placed order (excludes shopping carts).
     * OrderController::addToCart() stores cart rows with status = 'in_cart',
     * which must be excluded from every dashboard metric.
     */
    private const REAL_STATUSES = [
        Order::STATUS_CONFIRMED,
        Order::STATUS_PROCESSING,
        Order::STATUS_COMPLETED,
        Order::STATUS_CANCELLED,
    ];

    public function index()
    {
        // ── Stats ─────────────────────────────────────────────────────
        $totalUsers     = User::count();
        $totalSellers   = User::where('role', 'seller')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts  = Product::count();
        $activeProducts = Product::where('is_active', true)->count();

        $pendingApprovals = User::where('role', 'seller')
            ->where('status', 'inactive')
            ->count();

        // Only real orders — no carts
        $pendingOrders = Order::whereIn('status', [
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
        ])->count();

        // Revenue from real paid orders only
        $totalRevenue = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->sum('total_amount');

        // ── Khmer month names ─────────────────────────────────────────
        $khmerMonths = [
            'មករា',
            'កុម្ភៈ',
            'មីនា',
            'មេសា',
            'ឧសភា',
            'មិថុនា',
            'កក្កដា',
            'សីហា',
            'កញ្ញា',
            'តុលា',
            'វិច្ឆិកា',
            'ធ្នូ',
        ];

        // ── Pre-fetch monthly data in 3 queries (last 12 months) ──────
        $startDate12 = Carbon::now()->subMonths(11)->startOfMonth();

        // Revenue per month — real paid orders only
        $revenueByMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->where('created_at', '>=', $startDate12)
            ->selectRaw('YEAR(created_at) as y, MONTH(created_at) as m, SUM(total_amount) as total')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->keyBy(fn($r) => $r->y . '-' . $r->m);

        // Orders per month — real orders only (no carts)
        $ordersByMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->where('created_at', '>=', $startDate12)
            ->selectRaw('YEAR(created_at) as y, MONTH(created_at) as m, COUNT(*) as total')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->keyBy(fn($r) => $r->y . '-' . $r->m);

        // Users per month
        $usersByMonth = User::where('created_at', '>=', $startDate12)
            ->selectRaw('YEAR(created_at) as y, MONTH(created_at) as m, COUNT(*) as total')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->keyBy(fn($r) => $r->y . '-' . $r->m);

        // ── Monthly data (last 7 months) ──────────────────────────────
        $monthlyData = collect(range(6, 0))->map(function ($i) use ($khmerMonths, $revenueByMonth, $ordersByMonth, $usersByMonth) {
            $month = Carbon::now()->subMonths($i);
            $key   = $month->year . '-' . $month->month;
            return [
                'm'   => $khmerMonths[$month->month - 1],
                // 'rev' => (float) round(($revenueByMonth[$key]->total ?? 0) / 1_000_000, 2),
                'rev' => (float) round(($revenueByMonth[$key]->total ?? 0) / 1_000, 1),
                'ord' => (int)   ($ordersByMonth[$key]->total ?? 0),
                'usr' => (int)   ($usersByMonth[$key]->total ?? 0),
            ];
        })->values()->toArray();

        // ── Sparkline data (last 12 months) ───────────────────────────
        $sparkRevenue = collect(range(11, 0))->map(function ($i) use ($revenueByMonth) {
            $d   = Carbon::now()->subMonths($i);
            $key = $d->year . '-' . $d->month;
            // return round(($revenueByMonth[$key]->total ?? 0) / 1_000_000, 1);
            return round(($revenueByMonth[$key]->total ?? 0) / 1_000);
        })->values()->toArray();

        $sparkOrders = collect(range(11, 0))->map(function ($i) use ($ordersByMonth) {
            $d   = Carbon::now()->subMonths($i);
            $key = $d->year . '-' . $d->month;
            return (int) ($ordersByMonth[$key]->total ?? 0);
        })->values()->toArray();

        $sparkUsers = collect(range(11, 0))->map(function ($i) use ($usersByMonth) {
            $d   = Carbon::now()->subMonths($i);
            $key = $d->year . '-' . $d->month;
            return (int) ($usersByMonth[$key]->total ?? 0);
        })->values()->toArray();

        // ── Product category breakdown ────────────────────────────────
        $categoryData = Category::all()
            ->map(function ($cat) {
                $count = Product::whereHas(
                    'seller.category',
                    fn($q) => $q->where('category.category_id', $cat->category_id)
                )->count();
                return ['name' => $cat->category_name, 'v' => $count];
            })
            ->filter(fn($c) => $c['v'] > 0)
            ->sortByDesc('v')
            ->take(5)
            ->values()
            ->toArray();

        $totalCatProducts = collect($categoryData)->sum('v');
        if ($totalCatProducts > 0) {
            $categoryData = collect($categoryData)->map(fn($c) => [
                'name' => $c['name'],
                'v'    => (int) round(($c['v'] / $totalCatProducts) * 100),
            ])->toArray();
        }

        // ── Recent orders (last 5) — real orders only, no carts ───────
        $recentOrders = Order::with('user')
            ->whereIn('status', self::REAL_STATUSES)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id'       => $order->order_number,
                'customer' => $order->user?->username ?? $order->recipient_name ?? 'Unknown',
                'amount'   => number_format($order->total_amount, 0) . ' ៛',
                'status'   => $order->status,
                'date'     => $order->created_at->format('d/m'),
            ])->toArray();

        // ── Pending sellers ───────────────────────────────────────────
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

        // ── Recent activities — real orders only, no carts ────────────
        $recentActivities = collect();

        User::latest()->take(3)->get()->each(function ($user) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'user_' . $user->user_id,
                'action' => "<strong>{$user->username}</strong> បានចុះឈ្មោះជា {$user->role}",
                'user'   => $user->username,
                'time'   => $user->created_at->diffForHumans(),
                '_ts'    => $user->created_at->timestamp,
                'status' => 'new',
                'type'   => 'user',
            ]);
        });

        Order::with('user')
            ->whereIn('status', self::REAL_STATUSES)
            ->latest()
            ->take(3)
            ->get()
            ->each(function ($order) use (&$recentActivities) {
                $recentActivities->push([
                    'id'     => 'order_' . $order->order_id,
                    'action' => "ការបញ្ជាទិញ <strong>{$order->order_number}</strong> ស្ថានភាព: {$order->status}",
                    'user'   => $order->user?->username ?? 'Unknown',
                    'time'   => $order->created_at->diffForHumans(),
                    '_ts'    => $order->created_at->timestamp,
                    'status' => $order->status,
                    'type'   => 'order',
                ]);
            });

        Product::with('seller.user')->latest()->take(2)->get()->each(function ($product) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'product_' . $product->product_id,
                'action' => "ផលិតផលថ្មី <strong>{$product->productname}</strong> ត្រូវបានបន្ថែម",
                'user'   => $product->seller?->user?->username ?? 'Unknown',
                'time'   => $product->created_at->diffForHumans(),
                '_ts'    => $product->created_at->timestamp,
                'status' => $product->is_active ? 'active' : 'inactive',
                'type'   => 'product',
            ]);
        });

        $recentActivities = $recentActivities
            ->sortByDesc('_ts')
            ->values()
            ->take(8)
            ->map(fn($a) => collect($a)->except('_ts')->all())
            ->toArray();

        // ── Platform health ───────────────────────────────────────────
        $activeRate = $totalProducts > 0
            ? round(($activeProducts / $totalProducts) * 100)
            : 0;

        // completionRate: completed out of all real orders
        $realOrderCount = Order::whereIn('status', self::REAL_STATUSES)->count();
        $completionRate = $realOrderCount > 0
            ? round((Order::where('status', Order::STATUS_COMPLETED)->count() / $realOrderCount) * 100)
            : 0;

        $userActivityRate = $totalUsers > 0
            ? round(($totalCustomers / $totalUsers) * 100)
            : 0;

        // paymentSuccessRate: paid out of non-cancelled real orders
        $nonCancelledCount = Order::whereIn('status', [
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
            Order::STATUS_COMPLETED,
        ])->count();

        $paymentSuccessRate = $nonCancelledCount > 0
            ? round(
                (Order::whereIn('status', [
                    Order::STATUS_CONFIRMED,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_COMPLETED,
                ])
                    ->where('payment_status', Order::PAYMENT_PAID)
                    ->count() / $nonCancelledCount) * 100
            )
            : 0;

        // ── Calendar events — keyed by "YYYY-MM-DD" ───────────────────
        // Fetch real orders from the past 3 months + next month so the
        // calendar stays accurate when the user navigates months.
        // The React Calendar component filters by year+month of viewDate.
        $calStart = Carbon::now()->subMonths(2)->startOfMonth();
        $calEnd   = Carbon::now()->addMonth()->endOfMonth();

        $calendarEvents = Order::whereIn('status', self::REAL_STATUSES)
            ->whereBetween('created_at', [$calStart, $calEnd])
            ->get()
            ->groupBy(fn($o) => Carbon::parse($o->created_at)->format('Y-m-d'))
            ->map(fn($orders) => $orders->map(fn($o) => [
                'label' => 'ការបញ្ជា',
                'color' => match ($o->status) {
                    Order::STATUS_COMPLETED  => '#228B22',
                    Order::STATUS_PROCESSING => '#32CD32',
                    Order::STATUS_CONFIRMED  => '#FFD700',
                    Order::STATUS_CANCELLED  => '#ef4444',
                    default                  => '#90EE90',
                },
            ])->take(2)->values()->toArray())
            ->toArray();

        // ── Trend comparison (vs last month) ─────────────────────────
        $thisMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        $usersThisMonth = User::whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $usersLastMonth = User::whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $userTrend      = $usersLastMonth > 0
            ? round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100)
            : 0;

        $revenueThisMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->whereYear('created_at', $thisMonth->year)
            ->whereMonth('created_at', $thisMonth->month)
            ->sum('total_amount');
        $revenueLastMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->sum('total_amount');
        $revenueTrend = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100)
            : 0;

        $ordersThisMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->whereYear('created_at', $thisMonth->year)
            ->whereMonth('created_at', $thisMonth->month)
            ->count();
        $ordersLastMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();
        $orderTrend = $ordersLastMonth > 0
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100)
            : 0;

        $sellersThisMonth = User::where('role', 'seller')->whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $sellersLastMonth = User::where('role', 'seller')->whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $sellerTrend      = $sellersLastMonth > 0
            ? round((($sellersThisMonth - $sellersLastMonth) / $sellersLastMonth) * 100)
            : 0;

        // ── Render ────────────────────────────────────────────────────
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'       => $totalUsers,
                'total_sellers'     => $totalSellers,
                'total_customers'   => $totalCustomers,
                'total_products'    => $totalProducts,
                'active_products'   => $activeProducts,
                'pending_approvals' => $pendingApprovals,
                'pending_orders'    => $pendingOrders,
                'total_revenue'     => (float) $totalRevenue,
            ],
            'trends' => [
                'user_trend'    => $userTrend,
                'revenue_trend' => $revenueTrend,
                'order_trend'   => $orderTrend,
                'seller_trend'  => $sellerTrend,
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

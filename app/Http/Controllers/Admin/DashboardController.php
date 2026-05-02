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

        // Revenue this calendar month — used to make the revenue trend badge
        // meaningful. The trend % compares this month vs last month, so the
        // card subtitle should show this month's figure, not the all-time total.
        $revenueThisMonthStat = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
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

        // ── Pre-fetch monthly data in 4 queries (last 12 months) ──────
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

        // FIX #8: Sellers per month — needed for the sellers KPI sparkline
        $sellersByMonth = User::where('role', 'seller')
            ->where('created_at', '>=', $startDate12)
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
                'rev' => (float) round(($revenueByMonth[$key]->total ?? 0) / 1_000, 1),
                'ord' => (int)   ($ordersByMonth[$key]->total ?? 0),
                'usr' => (int)   ($usersByMonth[$key]->total ?? 0),
            ];
        })->values()->toArray();

        // ── Sparkline data (last 12 months) ───────────────────────────
        // FIX #9: Removed dead commented-out /1_000_000 divisor lines.
        $sparkRevenue = collect(range(11, 0))->map(function ($i) use ($revenueByMonth) {
            $d   = Carbon::now()->subMonths($i);
            $key = $d->year . '-' . $d->month;
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

        // FIX #8: Sellers sparkline — was missing, causing the sellers KPI card
        // to reuse the users sparkline data.
        $sparkSellers = collect(range(11, 0))->map(function ($i) use ($sellersByMonth) {
            $d   = Carbon::now()->subMonths($i);
            $key = $d->year . '-' . $d->month;
            return (int) ($sellersByMonth[$key]->total ?? 0);
        })->values()->toArray();

        // ── Product category breakdown ────────────────────────────────
        // FIX #3: The original query used 'seller.category' which assumed a
        // nested relationship that does not match the common schema.
        // OPTION A — if Product has a direct category_id foreign key:
        //   Use this block and delete OPTION B.
        $categoryData = Category::all()
            ->map(function ($cat) {
                $count = Product::where('category_id', $cat->category_id)->count();
                return ['name' => $cat->category_name, 'v' => $count];
            })
            ->filter(fn($c) => $c['v'] > 0)
            ->sortByDesc('v')
            ->take(5)
            ->values()
            ->toArray();

        // OPTION B — if Product belongs to Seller which has a category_id
        // (i.e. Product → Seller → category_id). Uncomment and delete OPTION A.
        // $categoryData = Category::all()
        //     ->map(function ($cat) {
        //         $count = Product::whereHas(
        //             'seller',
        //             fn($q) => $q->where('category_id', $cat->category_id)
        //         )->count();
        //         return ['name' => $cat->category_name, 'v' => $count];
        //     })
        //     ->filter(fn($c) => $c['v'] > 0)
        //     ->sortByDesc('v')
        //     ->take(5)
        //     ->values()
        //     ->toArray();

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

        // ── Recent activities — real orders only, no carts ────────────
        // FIX #1: Removed entire pendingSellers block — it was computed with
        //         an N+1 query but never consumed by the frontend.
        // FIX #6: All user-supplied strings (username, role, productname) are
        //         now escaped with Laravel's e() helper before being embedded
        //         in the action string, preventing XSS. The TSX component no
        //         longer uses dangerouslySetInnerHTML — it renders act.action
        //         as plain text.
        $recentActivities = collect();

        User::latest()->take(3)->get()->each(function ($user) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'user_' . $user->user_id,
                'action' => e($user->username) . ' បានចុះឈ្មោះជា ' . e($user->role),
                'user'   => e($user->username),
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
                    'action' => 'ការបញ្ជាទិញ ' . e($order->order_number) . ' ស្ថានភាព: ' . e($order->status),
                    'user'   => e($order->user?->username ?? 'Unknown'),
                    'time'   => $order->created_at->diffForHumans(),
                    '_ts'    => $order->created_at->timestamp,
                    'status' => $order->status,
                    'type'   => 'order',
                ]);
            });

        Product::with('seller.user')->latest()->take(2)->get()->each(function ($product) use (&$recentActivities) {
            $recentActivities->push([
                'id'     => 'product_' . $product->product_id,
                'action' => 'ផលិតផលថ្មី ' . e($product->productname) . ' ត្រូវបានបន្ថែម',
                'user'   => e($product->seller?->user?->username ?? 'Unknown'),
                'time'   => $product->created_at->diffForHumans(),
                '_ts'    => $product->created_at->timestamp,
                'status' => $product->is_active ? 'active' : 'inactive',
                'type'   => 'product',
            ]);
        });

        // FIX #7: Use array_diff_key instead of collect()->except() for
        // cleaner removal of the internal _ts sorting key.
        $recentActivities = $recentActivities
            ->sortByDesc('_ts')
            ->take(8)
            ->map(fn($a) => array_diff_key($a, ['_ts' => '']))
            ->values()
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
        $calStart = Carbon::now()->subMonths(2)->startOfMonth();
        $calEnd   = Carbon::now()->addMonth()->endOfMonth();

        // FIX #4: Removed redundant Carbon::parse() — Eloquent already casts
        // created_at to a Carbon instance via $casts or timestamp columns.
        $calendarEvents = Order::whereIn('status', self::REAL_STATUSES)
            ->whereBetween('created_at', [$calStart, $calEnd])
            ->get()
            ->groupBy(fn($o) => $o->created_at->format('Y-m-d'))
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
        // Clamp all trends to [-100, +100] so early/thin data (e.g. 1 order
        // last month → 12 this month = +1100%) never shows absurd badges.
        $clampTrend = fn(int $raw): int => max(-100, min(100, $raw));

        $thisMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        $usersThisMonth = User::whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $usersLastMonth = User::whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $userTrend      = $usersLastMonth > 0
            ? $clampTrend(round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100))
            : 0;

        // Reuse $revenueThisMonthStat already computed above — no duplicate query.
        $revenueThisMonth = $revenueThisMonthStat;
        $revenueLastMonth = Order::whereIn('status', self::REAL_STATUSES)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->sum('total_amount');
        $revenueTrend = $revenueLastMonth > 0
            ? $clampTrend(round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100))
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
            ? $clampTrend(round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100))
            : 0;

        $sellersThisMonth = User::where('role', 'seller')->whereYear('created_at', $thisMonth->year)->whereMonth('created_at', $thisMonth->month)->count();
        $sellersLastMonth = User::where('role', 'seller')->whereYear('created_at', $lastMonth->year)->whereMonth('created_at', $lastMonth->month)->count();
        $sellerTrend      = $sellersLastMonth > 0
            ? $clampTrend(round((($sellersThisMonth - $sellersLastMonth) / $sellersLastMonth) * 100))
            : 0;

        // ── Render ────────────────────────────────────────────────────
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'         => $totalUsers,
                'total_sellers'       => $totalSellers,
                'total_customers'     => $totalCustomers,
                'total_products'      => $totalProducts,
                'active_products'     => $activeProducts,
                'pending_approvals'   => $pendingApprovals,
                'pending_orders'      => $pendingOrders,
                'total_revenue'       => (float) $totalRevenue,
                'revenue_this_month'  => (float) $revenueThisMonthStat,
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
            'monthlyData'  => $monthlyData,
            'categoryData' => $categoryData,
            'sparkData'    => [
                'revenue' => $sparkRevenue,
                'orders'  => $sparkOrders,
                'users'   => $sparkUsers,
                'sellers' => $sparkSellers, // FIX #8: new sellers sparkline
            ],
            'recentOrders'     => $recentOrders,
            // FIX #1: pendingSellers removed — computed with N+1 and never used.
            'recentActivities' => $recentActivities,
            'calendarEvents'   => $calendarEvents,
        ]);
    }
}

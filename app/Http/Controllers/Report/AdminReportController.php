<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Seller;
use App\Models\Payment;
use App\Models\ReportArchive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    /* ═══════════════════════════════════════════════════════════
     │  CONSTANTS
     ═══════════════════════════════════════════════════════════ */
    private const REPORT_TYPES = ['sales', 'users', 'products', 'sellers'];
    private const KHR_FORMAT   = 2;   // decimal places for money

    /* ═══════════════════════════════════════════════════════════
     │  PAGE — admin/reports
     ═══════════════════════════════════════════════════════════ */

    public function index()
    {
        $startDate = Carbon::now()->subDays(29)->startOfDay();
        $endDate   = Carbon::now()->endOfDay();

        return Inertia::render('admin/reports', [
            'initialData'    => $this->buildFullReport($startDate, $endDate),
            'recentArchives' => $this->getRecentArchives(5),
        ]);
    }

    /* ═══════════════════════════════════════════════════════════
     │  API — Generate & archive report
     ═══════════════════════════════════════════════════════════ */

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:sales,users,products,sellers',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'save'        => 'sometimes|boolean',
        ]);

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end   = Carbon::parse($validated['end_date'])->endOfDay();
        $type  = $validated['report_type'];

        $data = match ($type) {
            'sales'    => $this->buildSalesReport($start, $end),
            'users'    => $this->buildUsersReport($start, $end),
            'products' => $this->buildProductsReport($start, $end),
            'sellers'  => $this->buildSellersReport($start, $end),
        };

        $archiveId = null;
        if ($request->boolean('save', true)) {
            $archiveId = $this->archiveReport($type, $start, $end, $data);
        }

        return response()->json([
            'success'     => true,
            'report_type' => $type,
            'archive_id'  => $archiveId,
            'period'      => [
                'start' => $start->toDateString(),
                'end'   => $end->toDateString(),
                'label' => $start->format('d M Y') . ' – ' . $end->format('d M Y'),
            ],
            'data' => $data,
        ]);
    }

    /* ═══════════════════════════════════════════════════════════
     │  API — Load archived report
     ═══════════════════════════════════════════════════════════ */

    public function showArchive(ReportArchive $archive)
    {
        // FIX: Reconstruct the data shape that GeneratedReportView expects
        // The archive stores data split across summary_metrics / chart_data / table_data.
        // We must re-merge them back into the flat 'data' shape.
        $charts = $archive->chart_data  ?? [];
        $tables = $archive->table_data  ?? [];

        $data = array_merge(
            ['summary' => $archive->summary_metrics ?? []],
            $charts,   // daily_revenue, daily_user_growth / daily_growth, by_category, by_status, by_payment_method
            $tables,   // top_sellers, top_products, top_performers, by_province
        );

        return response()->json([
            'success' => true,
            'archive' => [
                'id'           => $archive->report_id,
                'report_type'  => $archive->report_type,
                'period'       => [
                    'start' => $archive->period_start->toDateString(),
                    'end'   => $archive->period_end->toDateString(),
                    'label' => $archive->period_start->format('d M Y') . ' – ' . $archive->period_end->format('d M Y'),
                ],
                'generated_at' => $archive->created_at->toIso8601String(),
                'generated_by' => $archive->generatedBy?->username,
                'summary'      => $archive->summary_metrics,
                'charts'       => $archive->chart_data,
                'tables'       => $archive->table_data,
                // Also provide the flat 'data' key so frontend GeneratedReportView works
                'data'         => $data,
            ],
        ]);
    }

    /* ═══════════════════════════════════════════════════════════
     │  EXPORT — CSV
     ═══════════════════════════════════════════════════════════ */

    public function exportCSV(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:sales,users,products,sellers',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end   = Carbon::parse($validated['end_date'])->endOfDay();
        $type  = $validated['report_type'];

        $data = match ($type) {
            'sales'    => $this->buildSalesReport($start, $end),
            'users'    => $this->buildUsersReport($start, $end),
            'products' => $this->buildProductsReport($start, $end),
            'sellers'  => $this->buildSellersReport($start, $end),
        };

        $filename = "{$type}_report_{$start->format('Ymd')}_{$end->format('Ymd')}.csv";

        return response()->streamDownload(function () use ($type, $data) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel

            match ($type) {
                'sales'    => $this->writeSalesCSV($out, $data),
                'users'    => $this->writeUsersCSV($out, $data),
                'products' => $this->writeProductsCSV($out, $data),
                'sellers'  => $this->writeSellersCSV($out, $data),
            };

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — Full initial report (all sections)
     ═══════════════════════════════════════════════════════════ */

    private function buildFullReport(Carbon $start, Carbon $end): array
    {
        return [
            'key_metrics'              => $this->getKeyMetrics($start, $end),
            'sales_summary'            => $this->getSalesSummary($start, $end),
            'sales_by_category'        => $this->getSalesByCategory($start, $end),
            'daily_revenue'            => $this->getDailyRevenue($start, $end),
            'daily_user_growth'        => $this->getDailyUserGrowth($start, $end),
            'top_sellers'              => $this->getTopSellers($start, $end, 5),
            'top_products'             => $this->getTopProducts($start, $end, 5),
            'order_status_breakdown'   => $this->getOrderStatusBreakdown($start, $end),
            'payment_method_breakdown' => $this->getPaymentMethodBreakdown($start, $end),
        ];
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — Section builders
     ═══════════════════════════════════════════════════════════ */

    private function buildSalesReport(Carbon $start, Carbon $end): array
    {
        return [
            'summary'           => $this->getSalesSummary($start, $end),
            'by_category'       => $this->getSalesByCategory($start, $end),
            'daily_revenue'     => $this->getDailyRevenue($start, $end),
            'by_status'         => $this->getOrderStatusBreakdown($start, $end),
            'by_payment_method' => $this->getPaymentMethodBreakdown($start, $end),
        ];
    }

    private function buildUsersReport(Carbon $start, Carbon $end): array
    {
        return [
            'summary'      => $this->getUsersSummary($start, $end),
            'daily_growth' => $this->getDailyUserGrowth($start, $end),
            'by_role'      => $this->getUsersByRole($start, $end),
            'by_status'    => $this->getUsersByStatus(),
        ];
    }

    private function buildProductsReport(Carbon $start, Carbon $end): array
    {
        return [
            'summary'      => $this->getProductsSummary(),
            'top_products' => $this->getTopProducts($start, $end, 10),
            'by_category'  => $this->getProductsByCategory(),
            'by_stock'     => $this->getProductsByStock(),
        ];
    }

    private function buildSellersReport(Carbon $start, Carbon $end): array
    {
        return [
            'summary'     => $this->getSellersSummary($start, $end),
            'top_sellers' => $this->getTopSellers($start, $end, 10),
            'by_province' => $this->getSellersByProvince(),
        ];
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — Metric helpers
     ═══════════════════════════════════════════════════════════ */

    /**
     * Key metrics for the dashboard header cards.
     *
     * FIX 1 — Growth > 100% bug:
     *   The old code used diffInDays() between startOfDay() timestamps which could
     *   produce one less day than the actual window (e.g. 29 instead of 30) because
     *   $end was endOfDay() but its startOfDay() was compared. We now count whole
     *   calendar days inclusive: if start=Apr 1 and end=Apr 30 → 30 days.
     *   The previous window is then exactly the same number of days immediately
     *   before $start, so growth is always compared apple-to-apple.
     *
     *   Also, when the previous period has 0 value, growth is capped at 100 % to
     *   avoid showing an absurd percentage.
     */
    private function getKeyMetrics(Carbon $start, Carbon $end): array
    {
        // Inclusive day count: Apr 1 → Apr 30 = 30 days
        $periodDays = (int) $start->copy()->startOfDay()
            ->diffInDays($end->copy()->startOfDay()) + 1;

        $prevStart = $start->copy()->subDays($periodDays)->startOfDay();
        $prevEnd   = $start->copy()->subSecond();   // one second before current window starts

        /* ── Current period ── */
        $totalRevenue = (float) Order::whereBetween('created_at', [$start, $end])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('created_at', [$start, $end])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->count();

        $newUsers = User::whereBetween('created_at', [$start, $end])->count();

        // Count sellers who had at least one non-cancelled order item in the period
        $activeSellers = Seller::whereHas('user', fn($q) => $q->where('status', 'active'))
            ->whereHas(
                'orderItems',
                fn($q) => $q->whereHas(
                    'order',
                    fn($q2) => $q2->whereBetween('created_at', [$start, $end])
                        ->whereNotIn('status', [Order::STATUS_CANCELLED])
                )
            )
            ->count();

        /* ── Previous period ── */
        $prevRevenue = (float) Order::whereBetween('created_at', [$prevStart, $prevEnd])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->sum('total_amount');

        $prevOrders = Order::whereBetween('created_at', [$prevStart, $prevEnd])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->count();

        $prevUsers = User::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        return [
            'total_revenue'   => round($totalRevenue, self::KHR_FORMAT),
            'total_orders'    => $totalOrders,
            'new_users'       => $newUsers,
            'active_sellers'  => $activeSellers,
            'revenue_growth'  => $this->growthPercent($totalRevenue, $prevRevenue),
            'orders_growth'   => $this->growthPercent($totalOrders, $prevOrders),
            'users_growth'    => $this->growthPercent($newUsers, $prevUsers),
            'avg_order_value' => $totalOrders > 0
                ? round($totalRevenue / $totalOrders, self::KHR_FORMAT)
                : 0,
        ];
    }

    /**
     * Sales summary.
     *
     * FIX 2 — Double-query bug:
     *   In the original code, $orders was a query builder. Calling ->sum() on it
     *   executes and exhausts the builder; the subsequent ->count() call then runs
     *   a second query on the *already-consumed* builder and returns 0.
     *   Fix: run sum() and count() as separate, independent queries.
     *
     * FIX 3 — paid_revenue now comes from the payments table, not order.payment_status,
     *   so it reflects what was actually captured in the payments ledger.
     */
    private function getSalesSummary(Carbon $start, Carbon $end): array
    {
        // Run each aggregate as its own independent query
        $baseQuery = fn() => Order::whereBetween('created_at', [$start, $end])
            ->whereNotIn('status', [Order::STATUS_CANCELLED]);

        $totalAmount = (float) $baseQuery()->sum('total_amount');
        $totalCount  = $baseQuery()->count();

        $completedOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', Order::STATUS_COMPLETED)
            ->count();

        $cancelledOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', Order::STATUS_CANCELLED)
            ->count();

        // FIX: Use the payments table for actual captured revenue
        $paidRevenue = (float) Payment::whereBetween('payment_date', [$start, $end])
            ->where('payment_status', 'completed')
            ->sum('amount');

        // Fallback to order-level payment_status if payments table has no rows yet
        if ($paidRevenue === 0.0) {
            $paidRevenue = (float) Order::whereBetween('created_at', [$start, $end])
                ->where('payment_status', 'paid')
                ->sum('total_amount');
        }

        return [
            'total_revenue'    => round($totalAmount, self::KHR_FORMAT),
            'total_orders'     => $totalCount,
            'avg_order_value'  => $totalCount > 0
                ? round($totalAmount / $totalCount, self::KHR_FORMAT)
                : 0,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
            'paid_revenue'     => round($paidRevenue, self::KHR_FORMAT),
        ];
    }

    private function getUsersSummary(Carbon $start, Carbon $end): array
    {
        return [
            'total_users'     => User::count(),
            'new_users'       => User::whereBetween('created_at', [$start, $end])->count(),
            'total_sellers'   => User::where('role', 'seller')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'active_users'    => User::where('status', 'active')->count(),
            'banned_users'    => User::where('status', 'banned')->count(),
        ];
    }

    private function getProductsSummary(): array
    {
        return [
            'total_products'  => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'out_of_stock'    => Product::where('stock', 'out_of_stock')->count(),
            'total_views'     => Product::sum('views_count'),
        ];
    }

    private function getSellersSummary(Carbon $start, Carbon $end): array
    {
        return [
            'total_sellers'   => Seller::count(),
            'active_sellers'  => Seller::whereHas('user', fn($q) => $q->where('status', 'active'))->count(),
            'pending_sellers' => User::where('role', 'seller')->where('status', 'inactive')->count(),
            'top_rated'       => Seller::where('rating_average', '>=', 4.0)->count(),
        ];
    }

    private function getSalesByCategory(Carbon $start, Carbon $end)
    {
        return DB::table('order_items')
            ->join('orders',   'order_items.order_id',   '=', 'orders.order_id')
            ->join('product',  'order_items.product_id', '=', 'product.product_id')
            ->join('category', 'product.category_id',   '=', 'category.category_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'category.category_name as name',
                DB::raw('ROUND(SUM(order_items.quantity * order_items.price_per_unit), 2) as revenue'),
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->groupBy('category.category_id', 'category.category_name')
            ->orderByDesc('revenue')
            ->take(8)
            ->get()
            ->map(fn($r) => [
                'name'       => $r->name,
                'revenue'    => (float) $r->revenue,
                'units_sold' => (int)   $r->units_sold,
                'orders'     => (int)   $r->order_count,
            ]);
    }

    private function getDailyRevenue(Carbon $start, Carbon $end): array
    {
        $rows = DB::table('orders')
            ->whereBetween('created_at', [$start, $end])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('ROUND(SUM(total_amount), 2) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        $cursor = $start->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $key      = $cursor->toDateString();
            $result[] = [
                'date'    => $cursor->format('d M'),
                'revenue' => isset($rows[$key]) ? (float) $rows[$key]->revenue : 0,
                'orders'  => isset($rows[$key]) ? (int)   $rows[$key]->orders  : 0,
            ];
            $cursor->addDay();
        }
        return $result;
    }

    private function getDailyUserGrowth(Carbon $start, Carbon $end): array
    {
        $rows = DB::table('users')
            ->whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as users')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        $cursor = $start->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $key      = $cursor->toDateString();
            $result[] = [
                'date'  => $cursor->format('d M'),
                'users' => isset($rows[$key]) ? (int) $rows[$key]->users : 0,
            ];
            $cursor->addDay();
        }
        return $result;
    }

    /**
     * Top sellers.
     * MAX() is used for non-grouped columns to satisfy ONLY_FULL_GROUP_BY.
     */
    private function getTopSellers(Carbon $start, Carbon $end, int $limit = 5)
    {
        return DB::table('sellers')
            ->join('users',       'sellers.user_id',      '=', 'users.user_id')
            ->join('order_items', 'sellers.seller_id',    '=', 'order_items.seller_id')
            ->join('orders',      'order_items.order_id', '=', 'orders.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'sellers.seller_id',
                'sellers.farm_name as name',
                DB::raw('ROUND(SUM(order_items.quantity * order_items.price_per_unit), 2) as revenue'),
                DB::raw('COUNT(DISTINCT orders.order_id) as order_count'),
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('ROUND(MAX(sellers.rating_average), 2) as rating'),
                DB::raw('MAX(sellers.rating_count) as rating_count')
            )
            ->groupBy('sellers.seller_id', 'sellers.farm_name')
            ->orderByDesc('order_count')
            ->take($limit)
            ->get()
            ->map(fn($r) => [
                'seller_id'    => $r->seller_id,
                'name'         => $r->name,
                'revenue'      => (float) $r->revenue,
                'orders'       => (int)   $r->order_count,
                'units_sold'   => (int)   $r->units_sold,
                'rating'       => round((float) ($r->rating ?? 0), 1),
                'rating_count' => (int)   ($r->rating_count ?? 0),
            ]);
    }

    /**
     * Top products.
     *
     * FIX 4 — ONLY_FULL_GROUP_BY: views_count and unit were in the SELECT but
     *   not in GROUP BY in strict MySQL mode. Use MAX() to satisfy the constraint.
     */
    private function getTopProducts(Carbon $start, Carbon $end, int $limit = 5)
    {
        return DB::table('product')
            ->join('order_items', 'product.product_id',   '=', 'order_items.product_id')
            ->join('orders',      'order_items.order_id', '=', 'orders.order_id')
            ->join('category',    'product.category_id',  '=', 'category.category_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'product.product_id',
                'product.productname as name',
                'category.category_name as category',
                DB::raw('ROUND(SUM(order_items.quantity * order_items.price_per_unit), 2) as revenue'),
                DB::raw('SUM(order_items.quantity) as units_sold'),
                // FIX: MAX() to avoid ONLY_FULL_GROUP_BY error
                DB::raw('MAX(product.views_count) as views'),
                DB::raw('MAX(product.unit) as unit')
            )
            ->groupBy('product.product_id', 'product.productname', 'category.category_name')
            ->orderByDesc('revenue')
            ->take($limit)
            ->get()
            ->map(fn($r) => [
                'product_id' => $r->product_id,
                'name'       => $r->name,
                'category'   => $r->category,
                'revenue'    => (float) $r->revenue,
                'units_sold' => (int)   $r->units_sold,
                'views'      => (int)   $r->views,
                'unit'       => $r->unit,
            ]);
    }

    private function getOrderStatusBreakdown(Carbon $start, Carbon $end)
    {
        return DB::table('orders')
            ->whereBetween('created_at', [$start, $end])
            ->select(
                'status',
                DB::raw('COUNT(*) as count'),
                DB::raw('ROUND(SUM(total_amount), 2) as total')
            )
            ->groupBy('status')
            ->get()
            ->map(fn($r) => [
                'status' => $r->status,
                'count'  => (int)   $r->count,
                'total'  => (float) $r->total,
            ]);
    }

    /**
     * Payment method breakdown.
     *
     * FIX 5 — Use the payments table (not orders) so we reflect actual payment
     *   transactions. Group by payment_method from the payments table and use
     *   payment_date for the period filter. If the payments table is empty we
     *   fall back gracefully to querying orders.payment_method.
     */
    private function getPaymentMethodBreakdown(Carbon $start, Carbon $end)
    {
        $rows = DB::table('payments')
            ->whereBetween('payment_date', [$start, $end])
            ->where('payment_status', 'completed')
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('ROUND(SUM(amount), 2) as total')
            )
            ->groupBy('payment_method')
            ->get();

        // Fallback: if the payments table is empty, read from orders directly
        if ($rows->isEmpty()) {
            $rows = DB::table('orders')
                ->whereBetween('created_at', [$start, $end])
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('ROUND(SUM(total_amount), 2) as total')
                )
                ->groupBy('payment_method')
                ->get();
        }

        return $rows->map(fn($r) => [
            'method' => $r->payment_method ?? 'Unknown',
            'count'  => (int)   $r->count,
            'total'  => (float) $r->total,
        ]);
    }

    private function getUsersByRole(Carbon $start, Carbon $end)
    {
        return User::whereBetween('created_at', [$start, $end])
            ->select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(fn($r) => ['role' => $r->role, 'count' => (int) $r->count]);
    }

    private function getUsersByStatus()
    {
        return User::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($r) => ['status' => $r->status, 'count' => (int) $r->count]);
    }

    private function getProductsByCategory()
    {
        return DB::table('product')
            ->join('category', 'product.category_id', '=', 'category.category_id')
            ->where('product.is_active', true)
            ->select('category.category_name as name', DB::raw('COUNT(*) as count'))
            ->groupBy('category.category_id', 'category.category_name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['name' => $r->name, 'count' => (int) $r->count]);
    }

    private function getProductsByStock()
    {
        return DB::table('product')
            ->select('stock', DB::raw('COUNT(*) as count'))
            ->groupBy('stock')
            ->get()
            ->map(fn($r) => ['stock' => $r->stock, 'count' => (int) $r->count]);
    }

    private function getSellersByProvince()
    {
        return DB::table('sellers')
            ->join('provinces', 'sellers.province_id', '=', 'provinces.province_id')
            ->select('provinces.name_km as province', DB::raw('COUNT(*) as count'))
            ->groupBy('provinces.province_id', 'provinces.name_km')
            ->orderByDesc('count')
            ->take(8)
            ->get()
            ->map(fn($r) => ['province' => $r->province, 'count' => (int) $r->count]);
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — Archive
     ═══════════════════════════════════════════════════════════ */

    /**
     * FIX 6 — archiveReport: store ALL relevant data keys so that showArchive()
     *   can reconstruct every report type faithfully.
     *   - chart_data now includes by_province (sellers) and by_status / by_payment_method
     *   - table_data now includes by_province for sellers
     */
    private function archiveReport(string $type, Carbon $start, Carbon $end, array $data): int
    {
        $archiveType = 'admin_' . $type;

        $chartData = [
            'daily_revenue'     => $data['daily_revenue']     ?? null,
            'daily_growth'      => $data['daily_growth']      ?? null,
            'by_category'       => $data['by_category']       ?? null,
            'by_status'         => $data['by_status']         ?? null,
            'by_payment_method' => $data['by_payment_method'] ?? null,
            'by_role'           => $data['by_role']           ?? null,
            'by_province'       => $data['by_province']       ?? null,
            'by_stock'          => $data['by_stock']          ?? null,
        ];

        $tableData = [
            'top_sellers'  => $data['top_sellers']  ?? null,
            'top_products' => $data['top_products'] ?? null,
        ];

        // Remove null keys to keep the JSON lean
        $chartData = array_filter($chartData, fn($v) => $v !== null);
        $tableData = array_filter($tableData, fn($v) => $v !== null);

        $archive = ReportArchive::create([
            'report_type'     => $archiveType,
            'user_type'       => 'admin',
            'generated_by'    => Auth::id(),
            'generated_for'   => null,
            'period_start'    => $start->toDateString(),
            'period_end'      => $end->toDateString(),
            'summary_metrics' => $data['summary'] ?? null,
            'chart_data'      => $chartData,
            'table_data'      => $tableData,
            'activity_logs'   => [
                'generated_at' => now()->toIso8601String(),
                'ip'           => request()->ip(),
            ],
        ]);

        return $archive->report_id;
    }

    private function getRecentArchives(int $limit = 5)
    {
        return ReportArchive::adminReports()
            ->with('generatedBy:user_id,username')
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($r) => [
                'id'           => $r->report_id,
                'report_type'  => $r->report_type,
                'period'       => $r->period_start->format('d M Y') . ' – ' . $r->period_end->format('d M Y'),
                'generated_at' => $r->created_at->diffForHumans(),
                'generated_by' => $r->generatedBy?->username,
            ]);
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — CSV writers
     ═══════════════════════════════════════════════════════════ */

    private function writeSalesCSV($file, array $data): void
    {
        fputcsv($file, ['=== SALES SUMMARY ===']);
        fputcsv($file, ['Metric', 'Value']);
        foreach ($data['summary'] as $key => $val) {
            fputcsv($file, [ucwords(str_replace('_', ' ', $key)), $val]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== SALES BY CATEGORY ===']);
        fputcsv($file, ['Category', 'Revenue (KHR)', 'Units Sold', 'Orders']);
        foreach ($data['by_category'] as $r) {
            fputcsv($file, [$r['name'], $r['revenue'], $r['units_sold'], $r['orders']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== DAILY REVENUE ===']);
        fputcsv($file, ['Date', 'Revenue (KHR)', 'Orders']);
        foreach ($data['daily_revenue'] as $r) {
            fputcsv($file, [$r['date'], $r['revenue'], $r['orders']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== PAYMENT METHODS ===']);
        fputcsv($file, ['Method', 'Count', 'Total (KHR)']);
        foreach ($data['by_payment_method'] as $r) {
            fputcsv($file, [$r['method'], $r['count'], $r['total']]);
        }
    }

    private function writeUsersCSV($file, array $data): void
    {
        fputcsv($file, ['=== USER SUMMARY ===']);
        fputcsv($file, ['Metric', 'Value']);
        foreach ($data['summary'] as $key => $val) {
            fputcsv($file, [ucwords(str_replace('_', ' ', $key)), $val]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== DAILY USER GROWTH ===']);
        fputcsv($file, ['Date', 'New Users']);
        foreach ($data['daily_growth'] as $r) {
            fputcsv($file, [$r['date'], $r['users']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== USERS BY ROLE ===']);
        fputcsv($file, ['Role', 'Count']);
        foreach ($data['by_role'] as $r) {
            fputcsv($file, [$r['role'], $r['count']]);
        }
    }

    private function writeProductsCSV($file, array $data): void
    {
        fputcsv($file, ['=== TOP PRODUCTS ===']);
        fputcsv($file, ['Product', 'Category', 'Revenue (KHR)', 'Units Sold', 'Views', 'Unit']);
        foreach ($data['top_products'] as $r) {
            fputcsv($file, [$r['name'], $r['category'], $r['revenue'], $r['units_sold'], $r['views'], $r['unit']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== PRODUCTS BY CATEGORY ===']);
        fputcsv($file, ['Category', 'Count']);
        foreach ($data['by_category'] as $r) {
            fputcsv($file, [$r['name'], $r['count']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== PRODUCTS BY STOCK STATUS ===']);
        fputcsv($file, ['Stock Status', 'Count']);
        foreach ($data['by_stock'] as $r) {
            fputcsv($file, [$r['stock'], $r['count']]);
        }
    }

    private function writeSellersCSV($file, array $data): void
    {
        fputcsv($file, ['=== SELLER SUMMARY ===']);
        fputcsv($file, ['Metric', 'Value']);
        foreach ($data['summary'] as $key => $val) {
            fputcsv($file, [ucwords(str_replace('_', ' ', $key)), $val]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== TOP SELLERS ===']);
        fputcsv($file, ['Farm Name', 'Revenue (KHR)', 'Orders', 'Units Sold', 'Rating', 'Reviews']);
        foreach ($data['top_sellers'] as $r) {
            fputcsv($file, [$r['name'], $r['revenue'], $r['orders'], $r['units_sold'], $r['rating'], $r['rating_count']]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== SELLERS BY PROVINCE ===']);
        fputcsv($file, ['Province', 'Count']);
        foreach ($data['by_province'] as $r) {
            fputcsv($file, [$r['province'], $r['count']]);
        }
    }

    /* ═══════════════════════════════════════════════════════════
     │  PRIVATE — Utility
     ═══════════════════════════════════════════════════════════ */

    /**
     * Growth percentage between two periods.
     *
     * FIX 7 — Cap growth at ±999 % to avoid absurd values when the previous
     *   period had very few records (e.g. 1 order → 10 orders = +900 % which is
     *   technically correct but visually confusing). The cap prevents cases where
     *   the previous period was 0 from showing as +100 % (our special case) or
     *   any arithmetic from producing values that overflow the badge.
     */
    private function growthPercent(float|int $current, float|int $previous): float
    {
        if ($previous == 0) {
            // No previous data: treat new activity as +100 % (meaningful signal)
            return $current > 0 ? 100.0 : 0.0;
        }

        $growth = (($current - $previous) / abs($previous)) * 100;

        // Cap at ±999 % so the UI badge never wraps
        return round(max(-999, min(999, $growth)), 1);
    }
}

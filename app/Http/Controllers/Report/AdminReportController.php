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
        $charts = $archive->chart_data  ?? [];
        $tables = $archive->table_data  ?? [];

        $data = array_merge(
            ['summary' => $archive->summary_metrics ?? []],
            $charts,
            $tables,
        );

        $data = array_filter($data, fn($v) => $v !== null);

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
            // by_category feeds the bar chart (needs revenue dataKey)
            'by_category'  => $this->getSalesByCategory($start, $end),
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

    private function getKeyMetrics(Carbon $start, Carbon $end): array
    {
        $periodDays = (int) $start->copy()->startOfDay()
            ->diffInDays($end->copy()->startOfDay()) + 1;

        $prevStart = $start->copy()->subDays($periodDays)->startOfDay();
        $prevEnd   = $start->copy()->subSecond();

        // Use paid revenue (payments table) as the canonical revenue figure.
        // Fall back to orders.payment_status = 'paid' if no payment rows exist yet.
        $totalRevenue = $this->getPaidRevenue($start, $end);

        $totalOrders = Order::whereBetween('created_at', [$start, $end])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->count();

        $newUsers = User::whereBetween('created_at', [$start, $end])->count();

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

        $prevRevenue = $this->getPaidRevenue($prevStart, $prevEnd);

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

    private function getSalesSummary(Carbon $start, Carbon $end): array
    {
        // Paid revenue IS the total revenue — only count money that was actually received.
        $totalAmount = $this->getPaidRevenue($start, $end);

        // Total orders = ALL orders in the period (including cancelled)
        $totalOrders = Order::whereBetween('created_at', [$start, $end])->count();

        $completedOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', Order::STATUS_COMPLETED)
            ->count();

        $cancelledOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', Order::STATUS_CANCELLED)
            ->count();

        return [
            'total_revenue'    => round($totalAmount, self::KHR_FORMAT),
            'total_orders'     => $totalOrders,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
        ];
    }

    private function getUsersSummary(Carbon $start, Carbon $end): array
    {
        // total_users = all users ever registered (not scoped to period)
        // new_users   = registered within the selected period only
        return [
            'total_users'     => User::count(),
            'new_users'       => User::whereBetween('created_at', [$start, $end])->count(),
            'total_sellers'   => User::where('role', 'seller')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'active_users'    => User::where('status', 'active')->count(),
            'inactive_users'  => User::where('status', 'inactive')->count(),
        ];
    }

    private function getProductsSummary(): array
    {
        return [
            'total_products'  => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'out_of_stock'    => Product::where('stock', 'out_of_stock')->count(),
        ];
    }

    private function getSellersSummary(Carbon $start, Carbon $end): array
    {
        // total_sellers = users with role 'seller' (single source of truth)
        $totalSellers   = User::where('role', 'seller')->count();
        $activeSellers  = User::where('role', 'seller')->where('status', 'active')->count();
        $pendingSellers = User::where('role', 'seller')->where('status', 'inactive')->count();
        $topRated       = Seller::where('rating_average', '>=', 4.0)->count();

        return [
            'total_sellers'   => $totalSellers,
            'active_sellers'  => $activeSellers,
            'pending_sellers' => $pendingSellers,
            'top_rated'       => $topRated,
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

    private function getTopSellers(Carbon $start, Carbon $end, int $limit = 5)
    {
        return DB::table('sellers')
            ->join('users', 'sellers.user_id', '=', 'users.user_id')
            ->join('order_items', 'sellers.seller_id', '=', 'order_items.seller_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->leftJoinSub(
                DB::table('ratings')
                    ->select(
                        'seller_id',
                        DB::raw('ROUND(AVG(rating), 2) as rating_average'),
                        DB::raw('COUNT(rating_id) as rating_count')
                    )
                    ->groupBy('seller_id'),
                'ratings',
                'sellers.seller_id',
                '=',
                'ratings.seller_id'
            )
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'sellers.seller_id',
                'sellers.farm_name as name',
                DB::raw('ROUND(SUM(order_items.quantity * order_items.price_per_unit), 2) as revenue'),
                DB::raw('COUNT(DISTINCT orders.order_id) as order_count'),
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('COALESCE(ratings.rating_average, 0) as rating'),
                DB::raw('COALESCE(ratings.rating_count, 0) as rating_count')
            )
            ->groupBy(
                'sellers.seller_id',
                'sellers.farm_name',
                'ratings.rating_average',
                'ratings.rating_count'
            )
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
                'unit'       => $r->unit ?? '—',
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

    private function getPaymentMethodBreakdown(Carbon $start, Carbon $end)
    {
        $paymentRowsExist = DB::table('payments')
            ->whereBetween('payment_date', [$start, $end])
            ->where('payment_status', 'completed')
            ->exists();

        if ($paymentRowsExist) {
            $rows = DB::table('payments')
                ->whereBetween('payment_date', [$start, $end])
                ->where('payment_status', 'completed')
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('ROUND(SUM(amount), 2) as total')
                )
                ->groupBy('payment_method')
                ->orderByDesc('count')
                ->get();
        } else {
            $rows = DB::table('orders')
                ->whereBetween('created_at', [$start, $end])
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('ROUND(SUM(total_amount), 2) as total')
                )
                ->groupBy('payment_method')
                ->orderByDesc('count')
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

    private function archiveReport(string $type, Carbon $start, Carbon $end, array $data): int
    {
        $toArray = fn($v) => $v instanceof \Illuminate\Support\Collection
            ? $v->toArray()
            : (is_array($v) ? $v : null);

        $chartData = array_filter([
            'daily_revenue'     => $toArray($data['daily_revenue']     ?? null),
            'daily_growth'      => $toArray($data['daily_growth']      ?? null),
            'by_category'       => $toArray($data['by_category']       ?? null),
            'by_status'         => $toArray($data['by_status']         ?? null),
            'by_payment_method' => $toArray($data['by_payment_method'] ?? null),
            'by_role'           => $toArray($data['by_role']           ?? null),
            'by_province'       => $toArray($data['by_province']       ?? null),
            'by_stock'          => $toArray($data['by_stock']          ?? null),
        ], fn($v) => $v !== null);

        $tableData = array_filter([
            'top_sellers'  => $toArray($data['top_sellers']  ?? null),
            'top_products' => $toArray($data['top_products'] ?? null),
        ], fn($v) => $v !== null);

        $summaryMetrics = $data['summary'] ?? null;
        if ($summaryMetrics instanceof \Illuminate\Support\Collection) {
            $summaryMetrics = $summaryMetrics->toArray();
        }

        $archive = ReportArchive::create([
            'report_type'     => 'admin_' . $type,
            'user_type'       => 'admin',
            'generated_by'    => Auth::id(),
            'generated_for'   => null,
            'period_start'    => $start->toDateString(),
            'period_end'      => $end->toDateString(),
            'summary_metrics' => $summaryMetrics,
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

        fputcsv($file, ['=== ORDER STATUS ===']);
        fputcsv($file, ['Status', 'Count', 'Total (KHR)']);
        foreach ($data['by_status'] as $r) {
            fputcsv($file, [$r['status'], $r['count'], $r['total']]);
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
        fputcsv($file, []);

        fputcsv($file, ['=== USERS BY STATUS ===']);
        fputcsv($file, ['Status', 'Count']);
        foreach ($data['by_status'] as $r) {
            fputcsv($file, [$r['status'], $r['count']]);
        }
    }

    private function writeProductsCSV($file, array $data): void
    {
        fputcsv($file, ['=== PRODUCT SUMMARY ===']);
        fputcsv($file, ['Metric', 'Value']);
        foreach ($data['summary'] as $key => $val) {
            fputcsv($file, [ucwords(str_replace('_', ' ', $key)), $val]);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== TOP PRODUCTS ===']);
        fputcsv($file, ['Product', 'Category', 'Revenue (KHR)', 'Units Sold', 'Unit']);
        foreach ($data['top_products'] as $r) {
            fputcsv($file, [$r['name'], $r['category'], $r['revenue'], $r['units_sold'], $r['unit'] ?? '—']);
        }
        fputcsv($file, []);

        fputcsv($file, ['=== REVENUE BY CATEGORY ===']);
        fputcsv($file, ['Category', 'Revenue (KHR)', 'Units Sold', 'Orders']);
        foreach ($data['by_category'] as $r) {
            fputcsv($file, [$r['name'], $r['revenue'], $r['units_sold'], $r['orders']]);
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
            fputcsv($file, [
                $r['name'],
                $r['revenue'],
                $r['orders'],
                $r['units_sold'],
                $r['rating'],
                $r['rating_count'],
            ]);
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
     * Paid revenue for a period.
     * Checks the payments table first (completed rows); falls back to
     * orders.payment_status = 'paid' when no payment rows exist yet.
     */
    private function getPaidRevenue(Carbon $start, Carbon $end): float
    {
        $paymentRowsExist = DB::table('payments')
            ->whereBetween('payment_date', [$start, $end])
            ->where('payment_status', 'completed')
            ->exists();

        if ($paymentRowsExist) {
            return (float) DB::table('payments')
                ->whereBetween('payment_date', [$start, $end])
                ->where('payment_status', 'completed')
                ->sum('amount');
        }

        // Fallback: payments table has no rows for this period
        return (float) Order::whereBetween('created_at', [$start, $end])
            ->where('payment_status', 'paid')
            ->sum('total_amount');
    }

    /**
     *
     * Rules:
     *  - previous = 0, current = 0  →   0% (nothing happening)
     *  - previous = 0, current > 0  → +100% (new activity appeared)
     *  - otherwise                  → standard % change, capped at ±100%
     *
     * Capping at ±100 keeps badge widths consistent in the UI and prevents
     * misleading spikes when a prior period had very few records.
     */
    private function growthPercent(float|int $current, float|int $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        $growth = (($current - $previous) / abs($previous)) * 100;

        // Cap at ±100% so KPI badge values stay within a readable range
        return round(max(-100.0, min(100.0, $growth)), 1);
    }
}

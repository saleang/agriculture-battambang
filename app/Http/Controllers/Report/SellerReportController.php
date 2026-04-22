<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class SellerReportController extends Controller
{
    /**
     * Display seller reports dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        return Inertia::render('seller/reports', [
            'initialData' => $this->getInitialData($user->user_id)
        ]);
    }

    /**
     * Get initial dashboard data for seller
     */
    protected function getInitialData($sellerUserId)
    {
        // Default: Last 10 months
        $startDate = Carbon::now()->subMonths(10)->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        return [
            'summary_metrics' => $this->getSummaryMetrics($sellerUserId, $startDate, $endDate),
            'monthly_sales' => $this->getMonthlySales($sellerUserId, 10),
            'category_breakdown' => $this->getCategoryBreakdown($sellerUserId, $startDate, $endDate),
            'top_products' => $this->getTopProducts($sellerUserId, $startDate, $endDate),
        ];
    }

    /**
     * Generate custom seller report
     */
    public function generate(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->endOfDay();

        $data = [
            'summary_metrics' => $this->getSummaryMetrics($user->user_id, $startDate, $endDate),
            'monthly_sales' => $this->getMonthlySalesInRange($user->user_id, $startDate, $endDate),
            'category_breakdown' => $this->getCategoryBreakdown($user->user_id, $startDate, $endDate),
            'top_products' => $this->getTopProducts($user->user_id, $startDate, $endDate),
            'payment_methods' => $this->getPaymentMethodBreakdown($user->user_id, $startDate, $endDate),
        ];

        return response()->json([
            'success' => true,
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'data' => $data,
        ]);
    }

    /**
     * Get summary metrics
     */
    protected function getSummaryMetrics($sellerUserId, $startDate, $endDate)
    {
        // Total revenue
        $totalRevenue = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->sum(DB::raw('order_items.quantity * order_items.price_per_unit'));

        // Total orders
        $totalOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->distinct('order_items.order_id')
            ->count('order_items.order_id');

        // Total products sold (quantity)
        $totalProductsSold = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->sum('order_items.quantity');

        // Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Previous period for growth calculation
        $periodDays = $startDate->diffInDays($endDate);
        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousEnd = $startDate->copy()->subSecond();

        $previousRevenue = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$previousStart, $previousEnd])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->sum(DB::raw('order_items.quantity * order_items.price_per_unit'));

        $previousOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$previousStart, $previousEnd])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->distinct('order_items.order_id')
            ->count('order_items.order_id');

        $previousProductsSold = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$previousStart, $previousEnd])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->sum('order_items.quantity');

        // Calculate growth percentages
        $revenueGrowth = $previousRevenue > 0
            ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100
            : 0;

        $ordersGrowth = $previousOrders > 0
            ? (($totalOrders - $previousOrders) / $previousOrders) * 100
            : 0;

        $productsSoldGrowth = $previousProductsSold > 0
            ? (($totalProductsSold - $previousProductsSold) / $previousProductsSold) * 100
            : 0;

        $previousAvgOrderValue = $previousOrders > 0 ? $previousRevenue / $previousOrders : 0;
        $avgOrderValueGrowth = $previousAvgOrderValue > 0
            ? (($avgOrderValue - $previousAvgOrderValue) / $previousAvgOrderValue) * 100
            : 0;

        return [
            'total_revenue' => round($totalRevenue, 2),
            'revenue_growth' => round($revenueGrowth, 1),
            'total_orders' => $totalOrders,
            'orders_growth' => round($ordersGrowth, 1),
            'total_products_sold' => round($totalProductsSold, 2),
            'products_sold_growth' => round($productsSoldGrowth, 1),
            'avg_order_value' => round($avgOrderValue, 2),
            'avg_order_value_growth' => round($avgOrderValueGrowth, 1),
        ];
    }

    /**
     * Get monthly sales for last N months
     */
    protected function getMonthlySales($sellerUserId, $months = 10)
    {
        $startDate = Carbon::now()->subMonths($months - 1)->startOfMonth();

        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                DB::raw('YEAR(orders.created_at) as year'),
                DB::raw('MONTH(orders.created_at) as month_num'),
                DB::raw('DATE_FORMAT(orders.created_at, "%b") as month'),
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
            )
            ->groupBy('year', 'month_num', 'month')
            ->orderBy('year')
            ->orderBy('month_num')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'sales' => round($item->sales, 2),
                'orders' => (int) $item->orders,
            ]);
    }

    /**
     * Get monthly sales within date range
     */
    protected function getMonthlySalesInRange($sellerUserId, $startDate, $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                DB::raw('YEAR(orders.created_at) as year'),
                DB::raw('MONTH(orders.created_at) as month_num'),
                DB::raw('DATE_FORMAT(orders.created_at, "%b %Y") as month'),
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
            )
            ->groupBy('year', 'month_num', 'month')
            ->orderBy('year')
            ->orderBy('month_num')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'sales' => round($item->sales, 2),
                'orders' => (int) $item->orders,
            ]);
    }

    /**
     * Get sales breakdown by category
     */
    protected function getCategoryBreakdown($sellerUserId, $startDate, $endDate)
    {
        $categories = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('category', 'products.category_id', '=', 'category.category_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'category.category_name as name',
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales')
            )
            ->groupBy('category.category_id', 'category.category_name')
            ->orderBy('sales', 'desc')
            ->get();

        $totalSales = $categories->sum('sales');

        return $categories->map(fn($item) => [
            'name' => $item->name,
            'value' => $totalSales > 0 ? round(($item->sales / $totalSales) * 100, 1) : 0,
            'sales' => round($item->sales, 2),
        ]);
    }

    /**
     * Get top selling products
     */
    protected function getTopProducts($sellerUserId, $startDate, $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'products.productname as name',
                DB::raw('SUM(order_items.quantity) as sold'),
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as revenue'),
                'products.unit'
            )
            ->groupBy('products.product_id', 'products.productname', 'products.unit')
            ->orderBy('revenue', 'desc')
            ->take(5)
            ->get()
            ->map(fn($item, $index) => [
                'rank' => $index + 1,
                'name' => $item->name,
                'sold' => round($item->sold, 2),
                'revenue' => round($item->revenue, 2),
                'unit' => $item->unit ?? 'kg',
            ]);
    }

    /**
     * Get payment method breakdown
     */
    protected function getPaymentMethodBreakdown($sellerUserId, $startDate, $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('order_items.seller_id', $sellerUserId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'orders.payment_method',
                DB::raw('COUNT(DISTINCT orders.order_id) as count'),
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as total')
            )
            ->groupBy('orders.payment_method')
            ->get()
            ->map(fn($item) => [
                'method' => $item->payment_method,
                'count' => (int) $item->count,
                'total' => round($item->total, 2),
            ]);
    }

    /**
     * Export seller report as PDF
     */
    public function exportPDF(Request $request)
    {
        // TODO: Implement PDF export
        return response()->json([
            'message' => 'PDF export functionality to be implemented',
            'status' => 'pending'
        ]);
    }

    /**
     * Export seller report as Excel
     */
    public function exportExcel(Request $request)
    {
        // TODO: Implement Excel export using Laravel Excel or similar
        return response()->json([
            'message' => 'Excel export functionality to be implemented',
            'status' => 'pending'
        ]);
    }

    /**
     * Export seller report as CSV
     */
    public function exportCSV(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $topProducts = $this->getTopProducts($user->user_id, $startDate, $endDate);

        $filename = "sales_report_{$startDate->format('Ymd')}_{$endDate->format('Ymd')}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($topProducts) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Rank', 'Product Name', 'Units Sold', 'Revenue', 'Unit']);

            foreach ($topProducts as $product) {
                fputcsv($file, [
                    $product['rank'],
                    $product['name'],
                    $product['sold'],
                    $product['revenue'],
                    $product['unit']
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    // Display admin reports dashboard
    public function index(Request $request)
    {
        return Inertia::render('admin/reports', [
            'initialData' => $this->getInitialData()
        ]);
    }

    // Get initial dashboard data
    protected function getInitialData()
    {
        $startDate = Carbon::now()->subDays(30)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        return [
            'key_metrics' => $this->getKeyMetrics($startDate, $endDate),
            'sales_by_category' => $this->getSalesByCategory($startDate, $endDate),
            'daily_user_growth' => $this->getDailyUserGrowth(7),
            'top_sellers' => $this->getTopSellers($startDate, $endDate),
            'top_products' => $this->getTopProducts($startDate, $endDate),
        ];
    }


    // Generate custom report based on parameters
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:sales,users,products,sellers',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->endOfDay();

        $data = match ($validated['report_type']) {
            'sales' => $this->generateSalesReport($startDate, $endDate),
            'users' => $this->generateUsersReport($startDate, $endDate),
            'products' => $this->generateProductsReport($startDate, $endDate),
            'sellers' => $this->generateSellersReport($startDate, $endDate),
        };

        return response()->json([
            'success' => true,
            'report_type' => $validated['report_type'],
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'data' => $data,
        ]);
    }

    // Get key metrics for dashboard
    protected function getKeyMetrics($startDate, $endDate)
    {
        // Total sales
        $totalSales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->sum('total_amount');

        // Previous period for comparison
        $previousStart = $startDate->copy()->subDays($startDate->diffInDays($endDate));
        $previousEnd = $startDate->copy()->subSecond();

        $previousSales = Order::whereBetween('created_at', [$previousStart, $previousEnd])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->sum('total_amount');

        $salesGrowth = $previousSales > 0
            ? (($totalSales - $previousSales) / $previousSales) * 100
            : 0;

        // User growth
        $newUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();
        $previousNewUsers = User::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $userGrowth = $previousNewUsers > 0
            ? (($newUsers - $previousNewUsers) / $previousNewUsers) * 100
            : 0;

        // Active sellers
        $activeSellers = Seller::whereHas('user.orders.items', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('orders.created_at', [$startDate, $endDate]);
        })->count();

        // Popular products
        $popularProducts = Product::whereHas('images')
            ->where('is_active', true)
            ->orderBy('views_count', 'desc')
            ->take(4)
            ->count();

        return [
            'total_sales' => round($totalSales, 2),
            'sales_growth' => round($salesGrowth, 1),
            'new_users' => $newUsers,
            'user_growth' => round($userGrowth, 1),
            'active_sellers' => $activeSellers,
            'popular_products' => $popularProducts,
        ];
    }

    // Get sales by category
    protected function getSalesByCategory($startDate, $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('product', 'order_items.product_id', '=', 'product.product_id')
            ->join('category', 'product.category_id', '=', 'category.category_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'category.categoryname as category',
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
            )
            ->groupBy('category.category_id', 'category.categoryname')
            ->orderBy('sales', 'desc')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'sales' => round($item->sales, 2),
                'orders' => (int) $item->orders,
            ]);
    }

    // Get daily user growth for last 7 days
    protected function getDailyUserGrowth($days = 7)
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        return DB::table('users')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as users')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('M d'),
                'users' => (int) $item->users,
            ]);
    }

    // Get top sellers
    protected function getTopSellers($startDate, $endDate)
    {
        return DB::table('sellers')
            ->join('users', 'sellers.user_id', '=', 'users.user_id')
            ->join('order_items', 'sellers.user_id', '=', 'order_items.seller_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'sellers.seller_id',
                'sellers.farm_name as name',
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales'),
                DB::raw('COUNT(DISTINCT orders.order_id) as orders'),
                'sellers.rating_average as rating'
            )
            ->groupBy('sellers.seller_id', 'sellers.farm_name', 'sellers.rating_average')
            ->orderBy('sales', 'desc')
            ->take(4)
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'sales' => round($item->sales, 2),
                'orders' => (int) $item->orders,
                'rating' => round($item->rating ?? 0, 1),
            ]);
    }

    // Get top products
    protected function getTopProducts($startDate, $endDate)
    {
        return DB::table('product')
            ->join('order_items', 'product.product_id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select(
                'product.product_id',
                'product.productname as name',
                DB::raw('SUM(order_items.quantity * order_items.price_per_unit) as sales'),
                'product.views_count as views'
            )
            ->groupBy('product.product_id', 'product.productname', 'product.views_count')
            ->orderBy('sales', 'desc')
            ->take(4)
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'sales' => round($item->sales, 2),
                'views' => (int) $item->views,
                'rating' => 4.5, // Placeholder - add rating system if needed
            ]);
    }

    // Generate sales report
    protected function generateSalesReport($startDate, $endDate)
    {
        return [
            'summary' => [
                'total_sales' => Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', Order::STATUS_CANCELLED)
                    ->sum('total_amount'),
                'total_orders' => Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', Order::STATUS_CANCELLED)
                    ->count(),
                'average_order_value' => Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', Order::STATUS_CANCELLED)
                    ->avg('total_amount'),
            ],
            'by_category' => $this->getSalesByCategory($startDate, $endDate),
            'by_payment_method' => DB::table('orders')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->groupBy('payment_method')
                ->get(),
        ];
    }

    //  * Generate users report
    protected function generateUsersReport($startDate, $endDate)
    {
        return [
            'summary' => [
                'new_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'by_role' => User::whereBetween('created_at', [$startDate, $endDate])
                    ->select('role', DB::raw('COUNT(*) as count'))
                    ->groupBy('role')
                    ->get(),
            ],
            'daily_growth' => $this->getDailyUserGrowth(
                $startDate->diffInDays($endDate) + 1
            ),
        ];
    }

    // Generate products report
    protected function generateProductsReport($startDate, $endDate)
    {
        return [
            'summary' => [
                'total_active' => Product::where('is_active', true)->count(),
                'by_category' => DB::table('product')
                    ->join('category', 'product.category_id', '=', 'category.category_id')
                    ->select(
                        'category.categoryname',
                        DB::raw('COUNT(*) as count')
                    )
                    ->where('product.is_active', true)
                    ->groupBy('category.category_id', 'category.categoryname')
                    ->get(),
            ],
            'top_products' => $this->getTopProducts($startDate, $endDate),
        ];
    }

    // Generate sellers report
    protected function generateSellersReport($startDate, $endDate)
    {
        return [
            'summary' => [
                'total_active' => Seller::whereHas('user', function ($query) {
                    $query->where('status', 'active');
                })->count(),
            ],
            'top_performers' => $this->getTopSellers($startDate, $endDate),
        ];
    }

    /**
     * Export report as PDF
     */
    public function exportPDF(Request $request)
    {
        // TODO: Implement PDF export using a library like DomPDF or Snappy
        return response()->json([
            'message' => 'PDF export functionality to be implemented',
            'status' => 'pending'
        ]);
    }

    /**
     * Export report as CSV
     */
    public function exportCSV(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:sales,users,products,sellers',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $data = $this->generate($request)->getData()->data;

        $filename = "{$validated['report_type']}_report_{$startDate->format('Ymd')}_{$endDate->format('Ymd')}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($data, $validated) {
            $file = fopen('php://output', 'w');

            // Write CSV based on report type
            match ($validated['report_type']) {
                'sales' => $this->writeSalesCSV($file, $data),
                'users' => $this->writeUsersCSV($file, $data),
                'products' => $this->writeProductsCSV($file, $data),
                'sellers' => $this->writeSellersCSV($file, $data),
            };

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    protected function writeSalesCSV($file, $data)
    {
        fputcsv($file, ['Category', 'Sales', 'Orders']);
        foreach ($data['by_category'] as $item) {
            fputcsv($file, [
                $item['category'],
                $item['sales'],
                $item['orders']
            ]);
        }
    }

    protected function writeUsersCSV($file, $data)
    {
        fputcsv($file, ['Date', 'New Users']);
        foreach ($data['daily_growth'] as $item) {
            fputcsv($file, [
                $item['date'],
                $item['users']
            ]);
        }
    }

    protected function writeProductsCSV($file, $data)
    {
        fputcsv($file, ['Product Name', 'Sales', 'Views']);
        foreach ($data['top_products'] as $item) {
            fputcsv($file, [
                $item['name'],
                $item['sales'],
                $item['views']
            ]);
        }
    }

    protected function writeSellersCSV($file, $data)
    {
        fputcsv($file, ['Seller Name', 'Sales', 'Orders', 'Rating']);
        foreach ($data['top_performers'] as $item) {
            fputcsv($file, [
                $item['name'],
                $item['sales'],
                $item['orders'],
                $item['rating']
            ]);
        }
    }
}

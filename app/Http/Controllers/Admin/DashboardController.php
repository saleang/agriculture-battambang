<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index()
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_sellers' => User::where('role', 'seller')->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_products' => \App\Models\Product::count(),
                'active_products' => \App\Models\Product::where('is_active', true)->count(),
                'pending_approvals' => 3, // You can implement this later
                'pending_orders' => 12, // You can implement this later
                'total_revenue' => 18500000, // You can implement this later
            ]
        ]);
    }
}

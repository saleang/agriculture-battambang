<?php

use App\Http\Controllers\Admin\SellerManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Customer\CustomerPasswordController;

use App\Http\Controllers\Seller\SellerPasswordController;
use App\Http\Controllers\Seller\SellerProfileController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Product\CategoryController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;

Route::get('/',function(){
    return Inertia::render('home',[
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
            $user = Auth::user();
        // $user->updateLastLogin();
        return match($user->role) {
            'admin'=>redirect()->route('admin.dashboard'),
            'seller'=>redirect()->route('seller.dashboard'),
            'customer'=>redirect()->route('customer.dashboard'),
            default=>abort(403, 'Unauthorized'),
        };
        // return Inertia::render('dashboard');
    })->name('dashboard');

    //admin route
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard', [
                'stats' => [
                    'total_users' => User::count(),
                    'total_sellers' => User::where('role', 'seller')->count(),
                    'total_customers' => User::where('role', 'customer')->count(),
                ]
            ]);
        })->name('dashboard');

        // User Management Routes
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserManagementController::class, 'create'])->name('users.create');
        Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
        Route::get('users/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
        Route::post('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::get('users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');

        Route::prefix('sellers')->name('sellers.')->group(function () {
            Route::get('/', [SellerManagementController::class, 'index'])->name('index');
            Route::get('/create', [SellerManagementController::class, 'create'])->name('create');
            Route::post('/', [SellerManagementController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [SellerManagementController::class, 'edit'])->name('edit');
            Route::post('/{user}', [SellerManagementController::class, 'update'])->name('update');
            Route::delete('/{user}', [SellerManagementController::class, 'destroy'])->name('destroy');
        });


    });

    // Seller routes
    Route::middleware(['role:seller'])->prefix('seller')->name('seller.')->group(function () {
        Route::get('/dashboard', function () {
            $seller = Auth::user()->seller;
            return Inertia::render('seller/dashboard', compact('seller'));
        })->name('dashboard');

        // Profile routes - FIXED: Accept both POST and PATCH methods
        Route::get('/profile', [SellerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['post', 'patch'], '/profile', [SellerProfileController::class, 'update'])->name('profile.update');

        // Farm info routes - FIXED: Accept both POST and PATCH methods
        Route::get('/farm_info', [SellerProfileController::class, 'editFarmInfo'])->name('farm-info.edit');
        Route::match(['post', 'patch'], '/farm_info', [SellerProfileController::class, 'updateFarmInfo'])->name('farm-info.update');

        // Payment routes - FIXED: Accept both POST and PATCH methods
        Route::get('/payment_info', [SellerProfileController::class, 'editPayment'])->name('payment.edit');
        Route::match(['post', 'patch'], '/payment_info', [SellerProfileController::class, 'updatePayment'])->name('payment.update');

        //password routes
        Route::get('/password', [SellerPasswordController::class, 'edit'])->name('user-password.edit');

        Route::put('/password', [SellerPasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');

        // AJAX endpoints for location dropdowns
        Route::get('/districts/{provinceId}', [SellerProfileController::class, 'getDistricts'])->name('districts.get');
        Route::get('/communes/{districtId}', [SellerProfileController::class, 'getCommunes'])->name('communes.get');
        Route::get('/villages/{communeId}', [SellerProfileController::class, 'getVillages'])->name('villages.get');

    
        // Product Routes
        Route::prefix('product')->name('product.')->group(function () {
            Route::get('/', [ProductController::class, 'index'])->name('index');        
            Route::get('/create', [ProductController::class, 'create'])->name('create'); 
            Route::post('/', [ProductController::class, 'store'])->name('store');     
            Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{id}/toggle-active', [ProductController::class, 'toggleActive'])->name('toggle-active');

            
        });
        // Category Routes
        Route::prefix('category')->name('category.')->group(function () {
            Route::get('/', [CategoryController::class, 'index'])->name('index');
            Route::get('/create', [CategoryController::class, 'create'])->name('create');
            Route::post('/', [CategoryController::class, 'store'])->name('store');
            Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
            Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
            Route::patch('/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('toggle-status');
    });
    });

    // Customer Routes
    Route::middleware(['role:customer'])->prefix('customer')->name('customer.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('customer/dashboard');
        })->name('dashboard');

        // Profile routes - IMPORTANT: Use POST for file uploads with _method spoofing
        Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['post', 'patch'], '/profile', [CustomerProfileController::class, 'update'])->name('profile.update');

        // Password routes
        Route::post('/password', [CustomerPasswordController::class, 'update'])->name('password.update');
    });

});


// Public categories endpoint returning active categories for frontend
Route::get('/categories', function () {
    $categories = \App\Models\Category::where('is_active', true)
        ->orderBy('categoryname')
        ->get();

    return response()->json($categories);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/check-username', function (Request $request) {
    $username = (string) $request->query('username', '');
    if ($username === '') {
        return response()->json(['available' => null], 200);
    }
    $exists = User::whereRaw('LOWER(username) = ?', [strtolower($username)])->exists();
    return response()->json(['available' => !$exists]);
});

Route::get('/check-email', function (Request $request) {
    $email = (string) $request->query('email', '');
    if ($email === '') {
        return response()->json(['available' => null], 200);
    }
    $exists = User::whereRaw('LOWER(email) = ?', [strtolower($email)])->exists();
    return response()->json(['available' => !$exists]);
});

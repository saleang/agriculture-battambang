<?php

use App\Http\Controllers\Admin\SellerManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Customer\CustomerPasswordController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Order\PaymentController;
use App\Http\Controllers\Order\SellerOrderController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\Seller\SellerPasswordController;
use App\Http\Controllers\Seller\SellerProfileController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\CommentController;
use App\Http\Controllers\Product\WishlistController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\FarmRatingController;
use App\Http\Controllers\CartController;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $wishlistProductIds = [];
    if (Auth::check()) {
        $wishlistProductIds = Wishlist::where('user_id', Auth::id())
            ->pluck('product_id')
            ->all();
    }

    return Inertia::render('home', [
        'canRegister'        => Features::enabled(Features::registration()),
        'wishlistProductIds' => $wishlistProductIds,
    ]);
})->name('home');

// Public Farm & Product Routes
Route::get('farm/{id}', [FarmController::class, 'show'])->name('farm.show');
Route::get('farmers', [FarmController::class, 'index'])->name('farmers.index');

Route::get('/allproducts', [ProductController::class, 'allProducts'])->name('allproducts');
Route::get('/products/public', [ProductController::class, 'publicProducts']);
Route::get('/product/{id}', [ProductController::class, 'show'])->name('product.show');

Route::get('/seller/{id}/farm-name', function ($id) {
    $seller = \App\Models\Seller::find($id);
    return response()->json(['farm_name' => $seller?->farm_name ?? 'Farm']);
});

Route::get('/categories', function () {
    $categories = \App\Models\Category::where('is_active', true)
        ->orderBy('name')
        ->select('category_id', 'name', 'description')
        ->get();

    return response()->json($categories);
});

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

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard Redirect based on Role
    Route::get('dashboard', function () {
        $user = Auth::user();
        return match ($user->role) {
            'admin'    => redirect()->route('admin.dashboard'),
            'seller'   => redirect()->route('seller.dashboard'),
            'customer' => redirect()->route('home'),
            default    => abort(403, 'Unauthorized'),
        };
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // User Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/',            [UserManagementController::class, 'index'])->name('index');
            Route::get('/create',      [UserManagementController::class, 'create'])->name('create');
            Route::post('/',           [UserManagementController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
            Route::post('/{user}',     [UserManagementController::class, 'update'])->name('update');
            Route::post('/{user}/destroy', [UserManagementController::class, 'destroy'])->name('destroy');
        });

        // Seller Management
        Route::prefix('sellers')->name('sellers.')->group(function () {
            Route::get('/',            [SellerManagementController::class, 'index'])->name('index');
            Route::get('/create',      [SellerManagementController::class, 'create'])->name('create');
            Route::post('/',           [SellerManagementController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [SellerManagementController::class, 'edit'])->name('edit');
            Route::post('/{user}',     [SellerManagementController::class, 'update'])->name('update');
            Route::delete('/{user}',   [SellerManagementController::class, 'destroy'])->name('destroy');
        });

        // Product Management
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/',                            [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('index');
            Route::get('/create',                      [App\Http\Controllers\Admin\ProductController::class, 'create'])->name('create');
            Route::post('/',                           [App\Http\Controllers\Admin\ProductController::class, 'store'])->name('store');
            Route::get('/{product}',                   [App\Http\Controllers\Admin\ProductController::class, 'show'])->name('show');
            Route::get('/{product}/edit',              [App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('edit');
            Route::put('/{product}',                   [App\Http\Controllers\Admin\ProductController::class, 'update'])->name('update');
            Route::delete('/{product}',                [App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{product}/toggle-active',   [App\Http\Controllers\Admin\ProductController::class, 'toggleActive'])->name('toggle-active');
            Route::post('/bulk-action',                [App\Http\Controllers\Admin\ProductController::class, 'bulkAction'])->name('bulk-action');
        });

        // Category Management (Global)
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/',                           [AdminCategoryController::class, 'index'])->name('index');
            Route::post('/',                          [AdminCategoryController::class, 'store'])->name('store');
            Route::put('/{category}',                 [AdminCategoryController::class, 'update'])->name('update');
            Route::delete('/{category}',              [AdminCategoryController::class, 'destroy'])->name('destroy');
            Route::patch('/{category}/toggle-status', [AdminCategoryController::class, 'toggleStatus'])->name('toggle-status');
        });

        //Views Rating 
        Route::prefix('ratings')->name('ratings.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminRatingController::class, 'index'])->name('index');
    Route::delete('/{rating}', [\App\Http\Controllers\Admin\AdminRatingController::class, 'destroy'])->name('destroy');
});
    });

    /*
    |--------------------------------------------------------------------------
    | Seller Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:seller'])->prefix('seller')->name('seller.')->group(function () {

        Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('dashboard');

        // Profile & Settings
        Route::get('/profile', [SellerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['post', 'patch'], '/profile', [SellerProfileController::class, 'update'])->name('profile.update');

        Route::get('/farm_info', [SellerProfileController::class, 'editFarmInfo'])->name('farm-info.edit');
        Route::match(['post', 'patch'], '/farm_info', [SellerProfileController::class, 'updateFarmInfo'])->name('farm-info.update');

        Route::get('/payment_info', [SellerProfileController::class, 'editPayment'])->name('payment.edit');
        Route::match(['post', 'patch'], '/payment_info', [SellerProfileController::class, 'updatePayment'])->name('payment.update');

        Route::get('/telegram_settings', [SellerProfileController::class, 'editTelegram'])->name('telegram.edit');
        Route::match(['post', 'patch'], '/telegram_settings', [SellerProfileController::class, 'updateTelegram'])->name('telegram.update');

        // Password
        Route::get('/password', [SellerPasswordController::class, 'edit'])->name('user-password.edit');
        Route::put('/password', [SellerPasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');

        // Location AJAX
        Route::get('/districts/{provinceId}', [SellerProfileController::class, 'getDistricts'])->name('districts.get');
        Route::get('/communes/{districtId}',  [SellerProfileController::class, 'getCommunes'])->name('communes.get');
        Route::get('/villages/{communeId}',   [SellerProfileController::class, 'getVillages'])->name('villages.get');

        // Products
        Route::prefix('product')->name('product.')->group(function () {
            Route::get('/',                          [ProductController::class, 'index'])->name('index');
            Route::get('/create',                    [ProductController::class, 'create'])->name('create');
            Route::post('/',                         [ProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit',            [ProductController::class, 'edit'])->name('edit');
            Route::put('/{product}',                 [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}',              [ProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{id}/toggle-active',      [ProductController::class, 'toggleActive'])->name('toggle-active');
        });

        // Seller Categories
        Route::prefix('category')->name('category.')->group(function () {
            Route::get('/',                         [CategoryController::class, 'index'])->name('index');
            Route::post('/attach',                  [CategoryController::class, 'attach'])->name('attach');
            Route::delete('/{category}/detach',     [CategoryController::class, 'detach'])->name('detach');
            Route::get('/my-categories',            [CategoryController::class, 'myCategories'])->name('my-categories');
            Route::get('/create',                   [CategoryController::class, 'create'])->name('create');
            Route::post('/',                        [CategoryController::class, 'store'])->name('store');
            Route::get('/{category}/edit',          [CategoryController::class, 'edit'])->name('edit');
            Route::put('/{category}',               [CategoryController::class, 'update'])->name('update');
            Route::delete('/{category}',            [CategoryController::class, 'destroy'])->name('destroy');
            Route::patch('/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Seller Orders
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/',                       [SellerOrderController::class, 'index'])->name('index');
            Route::get('/{order}',                [SellerOrderController::class, 'show'])->name('show');
            Route::post('/{order}/confirm',       [SellerOrderController::class, 'confirm'])->name('confirm');
            Route::post('/{order}/complete',      [SellerOrderController::class, 'complete'])->name('complete');
            Route::post('/{order}/cancel',        [SellerOrderController::class, 'cancel'])->name('cancel');
            Route::post('/{order}/payment-status', [SellerOrderController::class, 'updatePaymentStatus'])->name('payment-status');
        });

        // Seller Payments
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/',                        [App\Http\Controllers\Seller\PaymentController::class, 'index'])->name('index');
            Route::get('/{payment}',               [App\Http\Controllers\Seller\PaymentController::class, 'show'])->name('show');
            Route::post('/{payment}/refund',       [App\Http\Controllers\Seller\PaymentController::class, 'refund'])->name('refund');
            Route::get('/export',                  [App\Http\Controllers\Seller\PaymentController::class, 'export'])->name('export');
        });
        //View Rating
        Route::get('/reviews', [\App\Http\Controllers\Seller\SellerReviewsController::class, 'index'])->name('reviews.index');
    });

    /*
    |--------------------------------------------------------------------------
    | Customer Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:customer'])->prefix('customer')->name('customer.')->group(function () {

        Route::get('/dashboard', function () {
            return Inertia::render('home');
        })->name('dashboard');

        Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['post', 'patch'], '/profile', [CustomerProfileController::class, 'update'])->name('profile.update');

        Route::post('/password', [CustomerPasswordController::class, 'update'])->name('password.update');
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Authenticated Routes (Customer + Seller)
    |--------------------------------------------------------------------------
    */

    // Customer Orders (accessible by both customer and seller)
    Route::prefix('customer/orders')->name('customer.orders.')->group(function () {
        Route::get('/checkout', function () {
            return Inertia::render('customer/orders/checkout-page');
        })->name('checkout');

        Route::get('/',                  [OrderController::class, 'index'])->name('index');
        Route::get('/{order}',           [OrderController::class, 'show'])->name('show');
        Route::post('/',                 [OrderController::class, 'store'])->name('store');
        Route::post('/{order}/cancel',   [OrderController::class, 'cancel'])->name('cancel');
        Route::post('/{order}/payment',  [OrderController::class, 'makePayment'])->name('payment');

        Route::post('/{order}/khqr/generate', [PaymentController::class, 'generateKHQR']);
        Route::post('/{order}/khqr/verify',   [PaymentController::class, 'verifyPayment']);
    });

    // Wishlist
    Route::get('/wishlist/count', [WishlistController::class, 'getCount'])->name('wishlist.count');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product:product_id}', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{product_id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');

    // Comments
    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Farm Actions
    Route::post('/farms/toggle-follow/{farm}', [FarmController::class, 'toggleFollow'])->name('farms.toggle-follow');
    Route::post('farms/{farm}/ratings', [FarmRatingController::class, 'store'])->name('farms.ratings.store');

    // Cart
    Route::name('cart.')->group(function () {
        Route::get('/cart', [CartController::class, 'index'])->name('index');
        Route::post('/cart/add', [CartController::class, 'add'])->name('add');
    });
});

/*
|--------------------------------------------------------------------------
| Additional Route Files
|--------------------------------------------------------------------------
*/
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/report.php';

<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SellerProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');



    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // // routes/web.php (or routes/seller.php)
    // Route::middleware(['auth', 'role:seller'])->prefix('seller')->name('seller.')->group(function () {
    //     Route::get('/profile', [SellerProfileController::class, 'show'])
    //         ->name('profile.show');
    // });

    // Seller Routes - Protected for sellers only
    // Route::middleware('role:seller')->prefix('settings/seller')->name('seller.')->group(function () {
    //     Route::get('/profile', [SellerProfileController::class, 'editSeller'])->name('profile.edit');
    //     Route::patch('/profile', [SellerProfileController::class, 'update'])->name('profile.update');

    //     // AJAX endpoints for cascading dropdowns
    //     Route::get('/provinces/{province}/districts', [SellerProfileController::class, 'getDistricts'])
    //         ->name('districts.get');
    //     Route::get('/districts/{district}/communes', [SellerProfileController::class, 'getCommunes'])
    //         ->name('communes.get');
    //     Route::get('/communes/{commune}/villages', [SellerProfileController::class, 'getVillages'])
    //         ->name('villages.get');
    // });


    // Add Seller Routes - Protected for sellers only
    // Route::middleware('role:seller')->prefix('seller')->name('seller.')->group(function () {
    //     Route::get('/profile', [SellerProfileController::class, 'editseller'])->name('seller.profile.edit');
    //     Route::patch('/profile', [SellerProfileController::class, 'update'])->name('seller.profile.update');

    // });

    // // Seller Routes - Protected for sellers only
    // Route::middleware('role:seller')->prefix('seller')->name('seller.')->group(function () {
    //     Route::get('/profile', [SellerProfileController::class, 'editseller'])->name('profile.edit');
    //     Route::patch('/profile', [SellerProfileController::class, 'update'])->name('profile.update');

    //     // AJAX endpoints for cascading dropdowns
    //     Route::get('/provinces/{province}/districts', [SellerProfileController::class, 'getDistricts'])
    //         ->name('districts.get');
    //     Route::get('/districts/{district}/communes', [SellerProfileController::class, 'getCommunes'])
    //         ->name('communes.get');
    //     Route::get('/communes/{commune}/villages', [SellerProfileController::class, 'getVillages'])
    //         ->name('villages.get');
    // });
});

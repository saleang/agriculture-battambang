<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
// use App\Http\Controllers\RegisterController;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store'])
        ->name('store');

    // Validation endpoints
    // Route::get('/check-username', [RegisteredUserController::class, 'checkUsername']);
    Route::get('/check-email', [RegisteredUserController::class, 'checkEmail']);
    Route::get('/check-phone', [RegisteredUserController::class, 'checkPhone']);

    // Location API endpoints for registration form
    Route::get('/api/provinces', [LocationController::class, 'getProvinces']);
    Route::get('/api/districts/{provinceId}', [LocationController::class, 'getDistricts']);
    Route::get('/api/communes/{districtId}', [LocationController::class, 'getCommunes']);
    Route::get('/api/villages/{communeId}', [LocationController::class, 'getVillages']);

    // Login routes
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

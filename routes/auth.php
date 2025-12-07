<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\RegisterController;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store'])
        ->name('store');
    
    // ... other routes
    // Route::post('/user/register', [RegisteredUserController::class, 'register'])
    // ->name('user.register');

});


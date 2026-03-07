<?php

use App\Http\Controllers\Report\AdminReportController;
use App\Http\Controllers\Report\SellerReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Report Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Admin Report Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [AdminReportController::class, 'index'])->name('index');
            Route::post('/generate', [AdminReportController::class, 'generate'])->name('generate');
            Route::post('/export/pdf', [AdminReportController::class, 'exportPDF'])->name('export.pdf');
            Route::post('/export/csv', [AdminReportController::class, 'exportCSV'])->name('export.csv');
        });
    });

    // Seller Report Routes
    Route::middleware(['role:seller'])->prefix('seller')->name('seller.')->group(function () {
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [SellerReportController::class, 'index'])->name('index');
            Route::post('/generate', [SellerReportController::class, 'generate'])->name('generate');
            Route::post('/export/pdf', [SellerReportController::class, 'exportPDF'])->name('export.pdf');
            Route::post('/export/excel', [SellerReportController::class, 'exportExcel'])->name('export.excel');
            Route::post('/export/csv', [SellerReportController::class, 'exportCSV'])->name('export.csv');
        });
    });
});

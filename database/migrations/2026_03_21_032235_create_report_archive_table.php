<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_archive', function (Blueprint $table) {
            $table->id('report_id');

            // Report type and user
            $table->enum('report_type', [
                'seller_sales',
                'admin_sales',
                'admin_users',
                'admin_products',
                'admin_sellers'
            ]);
            $table->enum('user_type', ['admin', 'seller']);
            $table->unsignedBigInteger('generated_by'); // user_id
            $table->unsignedBigInteger('generated_for')->nullable(); // seller_id (if seller-specific)

            // Date range
            $table->date('period_start');
            $table->date('period_end');

            // Report data (stored as JSON)
            $table->json('summary_metrics')->nullable();
            // Example: {"total_revenue": 50506, "total_orders": 618, "avg_order": 81.75}

            $table->json('chart_data')->nullable();
            // Example: {"monthly_sales": [...], "category_breakdown": [...]}

            $table->json('table_data')->nullable();
            // Example: {"top_products": [...], "top_sellers": [...]}

            $table->json('activity_logs')->nullable(); // For admin only

            // Metadata
            $table->timestamps();

            // Indexes
            $table->index('report_type');
            $table->index('user_type');
            $table->index('generated_by');
            $table->index('generated_for');
            $table->index('period_start');
            $table->index('period_end');
            $table->index('created_at');

            // Foreign keys
            $table->foreign('generated_by')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_archive');
    }
};

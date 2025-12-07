<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id('seller_id');
            $table->unsignedBigInteger('user_id');
            $table->string('farm_name', 100);
            $table->string('location_district', 100);
            $table->string('certification', 255)->nullable();
            $table->text('description')->nullable();
            $table->decimal('rating_average', 3, 2)->default(0.00);
            $table->integer('rating_count')->default(0);
            $table->decimal('total_sales', 10, 2)->default(0.00);
            $table->string('bank_account_name', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('payment_qr_code', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};
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
        Schema::create('orders', function (Blueprint $table) {
            // Primary Key
            $table->id('order_id');

            // Order Information
            $table->string('order_number', 50)->unique();
            $table->unsignedBigInteger('user_id');
            $table->timestamp('order_date')->useCurrent();
            // Order Status
            $table->enum('status', [
                'confirmed',    // order confirmed (customer confirmed order)
                'processing',   // Waiting for payment confirmation
                'completed',    // Order completed (seller accepted order)
                'cancelled'     // Order cancelled
            ])->default('confirmed');

            // Recipient Information (REQUIRED!)
            $table->string('recipient_name', 255);
            $table->string('recipient_phone', 20);
            $table->text('shipping_address');
            // Financial Information
            $table->decimal('total_amount', 10, 2);
            // Payment Information
            $table->enum('payment_method', ['KHQR', 'manual(cash)'])->nullable();
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->enum('cancelled_by', ['customer', 'seller', 'system'])->nullable();
            $table->text('cancellation_reason')->nullable();

            // Notes
            $table->text('customer_notes')->nullable();

            // Timestamps
            $table->timestamps();

            // Foreign Key
            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('restrict');

            // // Indexes
            // $table->index('user_id', 'idx_orders_user_id');
            // $table->index('status', 'idx_orders_status');
            // $table->index('order_number', 'idx_orders_order_number');
            // $table->index('payment_status', 'idx_orders_payment_status');
            // $table->index('created_at', 'idx_orders_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

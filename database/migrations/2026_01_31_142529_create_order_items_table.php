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
        Schema::create('order_items', function (Blueprint $table) {
            // Primary Key
            $table->id('item_id');

            // Relations
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('seller_id');
            // Product Snapshot (saved at order time)
            $table->string('product_name', 255);
                $table->string('product_image', 500)->nullable();
                $table->string('unit', 50);
            // Quantity & Pricing
            $table->integer('quantity');
            $table->decimal('price_per_unit', 10, 2);

            // Timestamps
            $table->timestamps();

            // Foreign Keys
            $table->foreign('order_id')
                ->references('order_id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('product_id')
                ->references('product_id')
                ->on('product')
                ->onDelete('restrict');

            $table->foreign('seller_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('restrict');

            // // Indexes
            // $table->index('order_id', 'idx_order_items_order_id');
            // $table->index('product_id', 'idx_order_items_product_id');
            // $table->index('seller_id', 'idx_order_items_seller_id');

            // Note: MySQL does not enforce CHECK constraints, so removed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};

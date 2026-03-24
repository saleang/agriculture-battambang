<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('product_id');
                $table->timestamps();

                $table->unique(['user_id', 'product_id']);

                $table->foreign('user_id')
                      ->references('user_id')
                      ->on('users')
                      ->onDelete('cascade');

                $table->foreign('product_id')
                      ->references('product_id')
                      ->on('products')
                      ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
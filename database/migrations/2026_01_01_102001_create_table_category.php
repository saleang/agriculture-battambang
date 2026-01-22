<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category', function (Blueprint $table) {
            // 🔑 Global primary key
            $table->bigIncrements('category_id');

            // Seller relation
            $table->unsignedBigInteger('seller_id');

            // Seller-specific category number
            $table->unsignedInteger('seller_category_id');

            $table->string('categoryname', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Same category name allowed for different sellers
            $table->unique(['seller_id', 'categoryname']);

            // Each seller has their own numbering: 1,2,3...
            $table->unique(['seller_id', 'seller_category_id']);

            // Foreign key
            $table->foreign('seller_id')
                ->references('seller_id')
                ->on('sellers')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category');
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category', function (Blueprint $table) {
            $table->bigIncrements('category_id');
            $table->unsignedBigInteger('seller_id');
            $table->unsignedInteger('seller_category_id');
            $table->string('categoryname', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['seller_id', 'categoryname']);
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


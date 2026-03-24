<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->bigIncrements('comment_id');

            // References product.product_id (your PK)
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('product')
                  ->onDelete('cascade');

            // References users.user_id (your actual PK in users table)
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')
                  ->references('user_id')     // ← changed from 'id' to 'user_id'
                  ->on('users')
                  ->onDelete('cascade');

            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
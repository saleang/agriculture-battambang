<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->increments('image_id');
            $table->unsignedBigInteger('product_id'); // 
            $table->string('image_url', 255);
            $table->boolean('is_primary')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('product')  
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category', function (Blueprint $table) {
            $table->bigIncrements('category_id');
            $table->string('category_name', 100);
            $table->string('category_image', 255)->nullable();
            $table->text('description')->nullable();
           
            $table->boolean('is_active')->default(true);
          
            $table->timestamps();

           

            // Optional: prevent duplicate category names (you can remove if you want same name in different parents)
            $table->unique('category_name');
        });


    }

    public function down(): void
    {

        Schema::dropIfExists('category');
    }
};

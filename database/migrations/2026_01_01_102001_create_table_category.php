<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category', function (Blueprint $table) {
            $table->increments('category_id');
            $table->string('categoryname', 100)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('parent_category_id')->nullable();
            $table->timestamps();

            $table->foreign('parent_category_id')
                  ->references('category_id')
                  ->on('category')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category');
    }
};


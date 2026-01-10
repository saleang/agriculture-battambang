<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product', function (Blueprint $table) {
            $table->increments('product_id');

            $table->string('productname', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);

            $table->integer('quantity_available')->default(0);

            $table->string('unit', 20)->default('piece');

            $table->enum('status', [
                'available',
                'out_of_stock',
                'discontinued'
            ])->default('available');

            $table->unsignedInteger('category_id');

            // Optional dates
            $table->date('harvest_date')->nullable();
            $table->date('expiry_date')->nullable();

            // Flags
            $table->boolean('is_organic')->default(false);
            $table->boolean('is_featured')->default(false);

            // Counters
            $table->integer('views_count')->default(0);

            $table->decimal('discount_percentage', 5, 2)->default(0.00);

            $table->timestamps();

            // Foreign key
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('categories')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};

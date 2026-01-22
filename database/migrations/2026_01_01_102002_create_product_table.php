<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product', function (Blueprint $table) {
            $table->bigIncrements('product_id'); // global PK
            $table->unsignedBigInteger('seller_id'); // matches sellers table
            $table->unsignedInteger('seller_product_id'); // unique per seller

            $table->string('productname', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity_available')->default(0);
            $table->string('unit', 20)->default('piece');
            $table->enum('stock', ['available','out_of_stock','discontinued'])->default('available');
            $table->unsignedBigInteger('category_id'); // ✅ must match category table
            $table->date('harvest_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('views_count')->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0.00);
            $table->timestamps();

            // Ensure unique seller-specific ID
            $table->unique(['seller_id', 'seller_product_id']);

            // Foreign keys
            $table->foreign('category_id')
                ->references('category_id')
                ->on('category')  
                ->onDelete('cascade');

            $table->foreign('seller_id')
                ->references('seller_id')
                ->on('sellers')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};

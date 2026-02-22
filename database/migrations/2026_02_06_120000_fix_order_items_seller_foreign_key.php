<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // If a foreign key exists on seller_id, drop it safely
        $constraint = DB::selectOne("SELECT CONSTRAINT_NAME as name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'seller_id' AND REFERENCED_TABLE_NAME IS NOT NULL");

        if ($constraint && property_exists($constraint, 'name')) {
            Schema::table('order_items', function (Blueprint $table) use ($constraint) {
                $table->dropForeign($constraint->name);
            });
        }

        // Then add the correct foreign key referencing sellers.seller_id
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('seller_id')
                ->references('seller_id')
                ->on('sellers')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $constraint = DB::selectOne("SELECT CONSTRAINT_NAME as name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'seller_id' AND REFERENCED_TABLE_NAME IS NOT NULL");

        if ($constraint && property_exists($constraint, 'name')) {
            Schema::table('order_items', function (Blueprint $table) use ($constraint) {
                $table->dropForeign($constraint->name);
            });
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('seller_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('restrict');
        });
    }
};

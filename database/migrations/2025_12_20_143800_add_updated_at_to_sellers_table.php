<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->timestamp('updated_at')->useCurrent()->after('created_at');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('sellers', 'updated_at')) {
            Schema::table('sellers', function (Blueprint $table) {
                $table->dropColumn('updated_at');
            });
        }
    }
};

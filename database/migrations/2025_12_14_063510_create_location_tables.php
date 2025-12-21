<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Provinces table
        Schema::create('provinces', function (Blueprint $table) {
            $table->id('province_id');
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        // Districts table
        Schema::create('districts', function (Blueprint $table) {
            $table->id('district_id');
            $table->foreignId('province_id')->constrained('provinces', 'province_id')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        // Communes table
        Schema::create('communes', function (Blueprint $table) {
            $table->id('commune_id');
            $table->foreignId('district_id')->constrained('districts', 'district_id')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        // Villages table
        Schema::create('villages', function (Blueprint $table) {
            $table->id('village_id');
            $table->foreignId('commune_id')->constrained('communes', 'commune_id')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        // Update sellers table to use foreign keys
        Schema::table('sellers', function (Blueprint $table) {
            // Drop old location_district if exists
            if (Schema::hasColumn('sellers', 'location_district')) {
                $table->dropColumn('location_district');
            }

            // Add new foreign keys
            $table->foreignId('province_id')->nullable()->constrained('provinces', 'province_id')->onDelete('set null');
            $table->foreignId('district_id')->nullable()->constrained('districts', 'district_id')->onDelete('set null');
            $table->foreignId('commune_id')->nullable()->constrained('communes', 'commune_id')->onDelete('set null');
            $table->foreignId('village_id')->nullable()->constrained('villages', 'village_id')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
            $table->dropForeign(['district_id']);
            $table->dropForeign(['commune_id']);
            $table->dropForeign(['village_id']);
            $table->dropColumn(['province_id', 'district_id', 'commune_id', 'village_id']);

            // Restore old column
            $table->string('location_district')->nullable();
        });

        Schema::dropIfExists('villages');
        Schema::dropIfExists('communes');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('provinces');
    }
};

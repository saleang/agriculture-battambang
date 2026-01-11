<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BattambangLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Battambang province code is 2
        $battambangProvinceCode = 2;

        $this->command->info('🗑️  Clearing existing location data...');

        // Clear existing data (in reverse order due to foreign keys)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('villages')->truncate();
        DB::table('communes')->truncate();
        DB::table('districts')->truncate();
        DB::table('provinces')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('✓ Cleared existing location data.');
        $this->command->newLine();

        // Insert Battambang Province from CSV
        $this->command->info('📖 Reading CSV files...');
        $provinceId = $this->seedProvince($battambangProvinceCode);

        if (!$provinceId) {
            $this->command->error('❌ Failed to insert province!');
            return;
        }

        // Seed districts, communes, and villages
        $this->seedDistricts($provinceId, $battambangProvinceCode);

        $this->command->newLine();
        $this->command->info('✅ Location seeding completed successfully!');
    }

    private function seedProvince(int $provinceCode): ?int
    {
        $csvPath = database_path('seeders/csv/provinces.csv');

        if (!File::exists($csvPath)) {
            $this->command->error("Provinces CSV file not found at: {$csvPath}");
            return null;
        }

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // Skip header: province_code, province_kh, province_en

        $provinceId = null;

        while (($row = fgetcsv($file)) !== false) {
            $rowProvinceCode = (int) $row[0];
            $provinceKh = $row[1];
            $provinceEn = $row[2];

            // Only insert Battambang
            if ($rowProvinceCode === $provinceCode) {
                $provinceId = DB::table('provinces')->insertGetId([
                    'name_en' => $provinceEn,
                    'name_km' => $provinceKh,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->command->info("✓ Inserted province: {$provinceEn} ({$provinceKh})");
                break;
            }
        }

        fclose($file);
        return $provinceId;
    }

    private function seedDistricts(int $provinceId, int $provinceCode): void
    {
        $csvPath = database_path('seeders/csv/districts.csv');

        if (!File::exists($csvPath)) {
            $this->command->error("Districts CSV file not found at: {$csvPath}");
            return;
        }

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // Skip header: province_code, district_code, district_kh, district_en

        $districtMapping = [];
        $districtCount = 0;

        while (($row = fgetcsv($file)) !== false) {
            $rowProvinceCode = (int) $row[0];
            $districtCode = (int) $row[1];
            $districtKh = $row[2];
            $districtEn = $row[3];

            // Only process Battambang province
            if ($rowProvinceCode !== $provinceCode) {
                continue;
            }

            $districtId = DB::table('districts')->insertGetId([
                'province_id' => $provinceId,
                'name_en' => $districtEn,
                'name_km' => $districtKh,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $districtMapping[$districtCode] = $districtId;
            $districtCount++;

            $this->command->info("  ✓ District: {$districtEn} ({$districtKh})");
        }

        fclose($file);

        $this->command->info("✓ Inserted {$districtCount} districts");

        // Seed communes
        $this->seedCommunes($provinceCode, $districtMapping);
    }

    private function seedCommunes(int $provinceCode, array $districtMapping): void
    {
        $csvPath = database_path('seeders/csv/communes.csv');

        if (!File::exists($csvPath)) {
            $this->command->error("Communes CSV file not found at: {$csvPath}");
            return;
        }

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // Skip header: province_code, district_code, commune_code, commune_kh, commune_en

        $communeMapping = [];
        $communeCount = 0;

        while (($row = fgetcsv($file)) !== false) {
            $rowProvinceCode = (int) $row[0];
            $districtCode = (int) $row[1];
            $communeCode = (int) $row[2];
            $communeKh = $row[3];
            $communeEn = $row[4];

            // Only process Battambang province
            if ($rowProvinceCode !== $provinceCode) {
                continue;
            }

            // Get the district_id from mapping
            if (!isset($districtMapping[$districtCode])) {
                continue;
            }

            $communeId = DB::table('communes')->insertGetId([
                'district_id' => $districtMapping[$districtCode],
                'name_en' => $communeEn,
                'name_km' => $communeKh,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $communeMapping[$communeCode] = $communeId;
            $communeCount++;
        }

        fclose($file);

        $this->command->info("✓ Inserted {$communeCount} communes");

        // Seed villages
        $this->seedVillages($provinceCode, $communeMapping);
    }

    private function seedVillages(int $provinceCode, array $communeMapping): void
    {
        $csvPath = database_path('seeders/csv/villages.csv');

        if (!File::exists($csvPath)) {
            $this->command->error("Villages CSV file not found at: {$csvPath}");
            return;
        }

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // Skip header: province_code, district_code, commune_code, village_code, village_kh, village_en

        $villageCount = 0;
        $batchSize = 500;
        $villageBatch = [];

        while (($row = fgetcsv($file)) !== false) {
            $rowProvinceCode = (int) $row[0];
            $communeCode = (int) $row[2];
            $villageKh = $row[4];
            $villageEn = $row[5];

            // Only process Battambang province
            if ($rowProvinceCode !== $provinceCode) {
                continue;
            }

            // Get the commune_id from mapping
            if (!isset($communeMapping[$communeCode])) {
                continue;
            }

            $villageBatch[] = [
                'commune_id' => $communeMapping[$communeCode],
                'name_en' => $villageEn,
                'name_km' => $villageKh,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $villageCount++;

            // Insert in batches for better performance
            if (count($villageBatch) >= $batchSize) {
                DB::table('villages')->insert($villageBatch);
                $villageBatch = [];
                $this->command->info("  Inserted {$villageCount} villages...");
            }
        }

        // Insert remaining villages
        if (count($villageBatch) > 0) {
            DB::table('villages')->insert($villageBatch);
        }

        fclose($file);

        $this->command->info("✓ Inserted {$villageCount} villages");
    }
}

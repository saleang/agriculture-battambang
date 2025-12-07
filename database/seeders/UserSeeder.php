<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seller;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'username' => 'admin',
            'email' => 'admin@agrimarket.com',
            'password' => Hash::make('123'),
            'role' => 'admin',
            'phone' => '012345678',
            'status' => 'active',
        ]);

        // Seller
        $seller = User::create([
            'username' => 'seller1',
            'email' => 'seller@agrimarket.com',
            'password' => Hash::make('123'),
            'role' => 'seller',
            'phone' => '012345679',
            'status' => 'active',
        ]);

        Seller::create([
            'user_id' => $seller->user_id,
            'farm_name' => 'Test Farm',
            'location_district' => 'Battambang',
            'description' => 'Fresh vegetables and fruits',
        ]);

        // Customer
        User::create([
            'username' => 'customer1',
            'email' => 'customer@agrimarket.com',
            'password' => Hash::make('123'),
            'role' => 'customer',
            'phone' => '012345680',
            'status' => 'active',
        ]);
    }
}

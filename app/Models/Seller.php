<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seller extends Model
{
    use HasFactory;

    protected $primaryKey = 'seller_id';
    //chnage to false if we don't want timestamps
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'farm_name',
        'province_id',
        'district_id',
        'commune_id',
        'village_id',
        'certification',
        'description',
        'rating_average',
        'rating_count',
        'total_sales',
        'bank_account_name',
        'bank_account_number',
        'payment_qr_code',
    ];

    protected $casts = [
        'rating_average' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id', 'province_id');
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id', 'district_id');
    }

    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class, 'commune_id', 'commune_id');
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id', 'village_id');
    }

    // Helper method to get full location string
    public function getFullLocationAttribute(): string
    {
        $parts = array_filter([
            $this->village?->name_en,
            $this->commune?->name_en,
            $this->district?->name_en,
            $this->province?->name_en,
        ]);

        return implode(', ', $parts);
    }
}

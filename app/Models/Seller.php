<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seller extends Model
{
    use HasFactory;

    protected $primaryKey = 'seller_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'farm_name',
        'location_district',
        'certification',
        'description',
        'rating_average',
        'rating_count',
        'total_sales',
        'bank_account_name',
        'bank_account_number',
        'payment_qr_code',
    ];

    protected function casts(): array
    {
        return [
            'rating_average' => 'decimal:2',
            'total_sales' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
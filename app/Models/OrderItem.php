<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'order_id',
        'product_id',
        'seller_id',
        'product_name',
        'product_image',
        'unit',
        'quantity',
        'price_per_unit',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_per_unit' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id', 'user_id');
    }

    public function getSubtotalAttribute(): float
    {
        return $this->quantity * $this->price_per_unit;
    }
}

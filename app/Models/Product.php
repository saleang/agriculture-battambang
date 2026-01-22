<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'product';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'productname',
        'price',
        'quantity_available',
        'category_id',
        'harvest_date',
        'expiry_date',
        'unit',
        'description',
        'stock',
        'discount_percentage',
        'seller_id',
        'seller_product_id', // ✅ REQUIRED
        'views_count',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'harvest_date' => 'date',
        'expiry_date' => 'date',
        'seller_product_id' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'seller_id');
    }
}


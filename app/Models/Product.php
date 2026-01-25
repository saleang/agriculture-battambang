<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'product';
    protected $primaryKey = 'product_id';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'seller_id',
        'seller_product_id',
        'productname',
        'description',
        'price',
        'unit',
        'stock',
        'category_id',
        'is_active',
        'views_count',
    ];

    /**
     * Attribute casting
     */
    protected $casts = [
        'price'             => 'decimal:2',
        'stock'             => 'string',
        'is_active'         => 'boolean',
        'views_count'       => 'integer',
        'seller_id'         => 'integer',
        'seller_product_id' => 'integer',
        'category_id'       => 'integer',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    /**
     * Relationships
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'seller_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('stock', 'available');
    }

    /**
     * Helpers
     */
    public function isAvailable(): bool
    {
        return $this->stock === 'available';
    }

    public function getStockLabelAttribute(): string
    {
        return $this->isAvailable() ? 'Available' : 'Out of Stock';
    }
}

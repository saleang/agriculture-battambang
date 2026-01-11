<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $table = 'product';

    protected $primaryKey = 'product_id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'productname',
        'description',
        'price',
        'quantity_available',
        'category_id',
        'harvest_date',
        'expiry_date',
        'unit',
        'is_organic',
        'is_featured',
        'status',
        'views_count',
        'discount_percentage',
    ];

    // Cast types
    protected $casts = [
        'price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'is_organic' => 'boolean',
        'is_featured' => 'boolean',
        'harvest_date' => 'date',
        'expiry_date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }
}

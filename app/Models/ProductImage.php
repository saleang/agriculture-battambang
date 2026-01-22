<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $table = 'product_images';
    protected $primaryKey = 'image_id';
    public $timestamps = true; 

    protected $fillable = [
        'product_id',
        'image_url',
        'is_primary',
        'display_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function getImageUrlAttribute($value)
    {
        return asset('storage/' . $value);
    }
}
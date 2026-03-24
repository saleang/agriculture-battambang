<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'category';
    protected $primaryKey = 'category_id';
    public $timestamps = true;

    protected $fillable = [
        'category_name',
        'category_image',
        'description',
        'is_active',

    ];

    protected $casts = [
        'is_active'      => 'boolean',

    ];



    

    // Sellers who selected this category
    public function sellers()
    {
        return $this->belongsToMany(
            Seller::class,
            'seller_category',
            'category_id',
            'seller_id'
        )->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

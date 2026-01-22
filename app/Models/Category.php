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
        'seller_id',
        'seller_category_id', // ✅ REQUIRED
        'categoryname',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Child categories (optional)
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_category_id', 'category_id');
    }

    /**
     * Scope active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

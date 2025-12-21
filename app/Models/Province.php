<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    protected $primaryKey = 'province_id';
    public $timestamps = true;

    protected $fillable = [
        'name_en',
        'name_km',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
    public function districts(): HasMany
    {
        return $this->hasMany(District::class, 'province_id', 'province_id');
    }

    public function sellers(): HasMany
    {
        return $this->hasMany(Seller::class, 'province_id', 'province_id');
    }
}

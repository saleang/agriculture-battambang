<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    protected $primaryKey = 'district_id';
    public $timestamps = true;

    protected $fillable = [
        'province_id',
        'name_en',
        'name_km',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id', 'province_id');
    }

    public function communes(): HasMany
    {
        return $this->hasMany(Commune::class, 'district_id', 'district_id');
    }

    public function sellers(): HasMany
    {
        return $this->hasMany(Seller::class, 'district_id', 'district_id');
    }
}

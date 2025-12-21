<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Commune extends Model
{
    protected $primaryKey = 'commune_id';
    public $timestamps = true;

    protected $fillable = [
        'district_id',
        'name_en',
        'name_km',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id', 'district_id');
    }

    public function villages(): HasMany
    {
        return $this->hasMany(Village::class, 'commune_id', 'commune_id');
    }

    public function sellers(): HasMany
    {
        return $this->hasMany(Seller::class, 'commune_id', 'commune_id');
    }
}

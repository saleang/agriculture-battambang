<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Village extends Model
{
    protected $primaryKey = 'village_id';
    public $timestamps = true;

    protected $fillable = [
        'commune_id',
        'name_en',
        'name_km',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class, 'commune_id', 'commune_id');
    }

    public function sellers(): HasMany
    {
        return $this->hasMany(Seller::class, 'village_id', 'village_id');
    }
}

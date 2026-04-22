<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Rating;

class Seller extends Model
{
    use HasFactory;

    protected $primaryKey = 'seller_id';
    //change to false if we don't want timestamps
    public $timestamps = true;
    protected $appends = ['certification_url','full_location'];

    protected $fillable = [
        'user_id',
        'farm_name',
        'province_id',
        'district_id',
        'commune_id',
        'village_id',
        'certification',
        'description',
        'rating_average',
        'rating_count',
        'total_sales',
        'bank_account_name', // acquiringBank example: ABA, ACLEDA, BAKONG, etc
        'bank_account_number', // bakong account Id example: qwer_fdj@aclb
        'payment_qr_code', // merchantName example: Store II, Username of system or bank app
        'telegram_bot_token',
        'telegram_chat_id',
        'telegram_notifications_enabled',
    ];

    protected $casts = [
        'rating_average' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'telegram_notifications_enabled' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    // Add this method
    public function hasTelegramConfigured(): bool
    {
        return !empty($this->telegram_bot_token)
            && !empty($this->telegram_chat_id)
            && $this->telegram_notifications_enabled;
    }

    // Enable telegram notifications and save seller.
    public function enableTelegramNotifications(): void
    {
        $this->telegram_notifications_enabled = true;
        $this->save();
    }

    //Disable telegram notifications and save seller.
    public function disableTelegramNotifications(): void
    {
        $this->telegram_notifications_enabled = false;
        $this->save();
    }

    // mutators to trim token/chat id
    public function setTelegramBotTokenAttribute($value)
    {
        $this->attributes['telegram_bot_token'] = trim($value);
    }

    public function setTelegramChatIdAttribute($value)
    {
        $this->attributes['telegram_chat_id'] = trim($value);
    }

    // Check if seller has Bakong payment configured
    public function hasBakongConfigured(): bool
    {
        return !empty($this->bank_account_number)
            && !empty($this->payment_qr_code);
    }

    //Get acquiring bank code (for API)
    public function getAcquiringBankAttribute(): ?string
    {
        return $this->bank_account_name;
    }

    //Get merchant name for KHQR (for API)
    public function getMerchantNameAttribute(): string
    {
        return $this->payment_qr_code ?? $this->farm_name;
    }

    //Get Bakong Account ID (for API)
    public function getBakongAccountAttribute(): ?string
    {
        return $this->bank_account_number;
    }

    /**
     * Get merchant city for KHQR
     */
    public function getMerchantCityAttribute(): string
    {
        return $this->getFullLocationAttribute() ?? 'Phnom Penh';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_seller_follows', 'seller_id', 'user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'seller_id', 'seller_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'seller_id', 'seller_id');
    }

    // In Seller.php — add alongside the existing relationships
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'seller_id', 'seller_id');
    }
    /**
     * Get full URL for the seller's certification file stored on the `public` disk.
     */
    public function getCertificationUrlAttribute(): ?string
    {
        if (!$this->certification) {
            return null;
        }
        return asset('storage/' . ltrim($this->certification, '/'));
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id', 'province_id');
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id', 'district_id');
    }

    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class, 'commune_id', 'commune_id');
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id', 'village_id');
    }

    // Helper method to get full location string
    public function getFullLocationAttribute(): string
    {
        $parts = array_filter([
            $this->village?->name_km,
            $this->commune?->name_km,
            $this->district?->name_km,
            $this->province?->name_km,
        ]);

        // return implode(', ', $parts);
        return !empty($parts) ? implode(', ', $parts) : '-';
    }
    public function category()
    {
        return $this->belongsToMany(
            Category::class,
            'seller_category',
            'seller_id',
            'category_id'
        )->withTimestamps();
    }
}


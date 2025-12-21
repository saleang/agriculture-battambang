<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $primaryKey = 'user_id';
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * Get the route key for the model.
     * This tells Laravel to use 'user_id' when resolving route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'user_id';
    }

    protected $fillable = [
        'username',
        //maybe extra more fields
        // gender(Male,Female)
        // address
        'email',
        'password',
        'role',
        'phone',
        'status',
        'last_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
        'last_login' => 'datetime',
    ];

    //Relationships
    public function seller():HasOne
    {
        return $this->hasOne(Seller::class, 'user_id', 'user_id');
    }

    //role checking
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }
    //status checking
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }
    public function isBanned(): bool
    {
        return $this->status === 'banned';
    }
    public function updateLastLogin(): void
    {
        $this->update(['last_login' => now()]);
        //or
        // $this->last_login = now();
        // $this->save();
    }
}

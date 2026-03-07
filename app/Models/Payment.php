<?php
// app/Models/Payment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    
    protected $fillable = [
        'order_id',
        'seller_id',
        'transaction_id',
        'amount',
        'payment_method',
        'payment_status',
        'payment_date',
        'refund_amount',
        'refund_reason',
        'refunded_at',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'refunded_at' => 'datetime'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'seller_id');
    }
}
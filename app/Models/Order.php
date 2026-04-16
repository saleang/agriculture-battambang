<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_number',
        'user_id',
        'order_date',
        'status',
        'recipient_name',
        'recipient_phone',
        'shipping_address',
        'total_amount',
        'shipping_cost',
        'payment_method',
        'payment_status',
        'paid_at',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'customer_notes',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    // Payment constants
    const PAYMENT_KHQR = 'KHQR';
    const PAYMENT_MANUAL = 'manual(cash)';
    const PAYMENT_UNPAID = 'unpaid';
    const PAYMENT_PAID = 'paid';

    // Cancelled by constants
    const CANCELLED_BY_CUSTOMER = 'customer';
    const CANCELLED_BY_SELLER = 'seller';
    const CANCELLED_BY_SYSTEM = 'system';

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    public function canBeCancelledByCustomer(): bool
    {
        // Customer can cancel if seller hasn't completed the order yet
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_PROCESSING]);
    }

    public function canBeCancelledBySeller(): bool
    {
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_PROCESSING]);
    }

    // ✅ ADDED: Missing method for seller completing order
    public function canBeCompleted(): bool
    {
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_PROCESSING]);
    }

    // ✅ ADDED: Missing method for customer payment
    public function canBePaid(): bool
    {
        // Customer should be able to pay when the order is confirmed or processing
        // and the payment status is still unpaid.
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_PROCESSING,self::STATUS_COMPLETED])
            && $this->payment_status === self::PAYMENT_UNPAID;
    }
    public function shouldAutoCancel(): bool
    {
        if ($this->status !== self::STATUS_CONFIRMED) {
            return false;
        }
        return Carbon::parse($this->created_at)->diffInMinutes(Carbon::now()) >= 30;
    }

    public function shouldAutoCancelForMissingPayment(): bool
    {
        if ($this->status !== self::STATUS_COMPLETED || $this->payment_status === self::PAYMENT_PAID) {
            return false;
        }
        return Carbon::parse($this->updated_at)->diffInMinutes(Carbon::now()) >= 30;
    }

    public static function generateOrderNumber(): string
    {
        $date = date('Ymd');
        $lastOrder = self::whereDate('created_at', today())->orderBy('order_id', 'desc')->first();
        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;
        return 'ORD-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
            if (empty($order->order_date)) {
                $order->order_date = now();
            }
        });
    }

}

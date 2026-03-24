<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'comment_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_id',
        'user_id',
        'content',
    ];

    /**
     * Get the product that the comment belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get the user who wrote the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Optional: Accessor to format created_at in Khmer-friendly way
     * (you can use this in your frontend if you want)
     */
    public function getCreatedAtKhAttribute(): string
    {
        return $this->created_at->locale('km')->diffForHumans();
        // or ->format('d ខែ F ឆ្នាំ Y') if you want full date
    }
}
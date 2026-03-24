<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportArchive extends Model
{
    use HasFactory;

    protected $table = 'report_archive';
    protected $primaryKey = 'report_id';

    protected $fillable = [
        'report_type',
        'user_type',
        'generated_by',
        'generated_for',
        'period_start',
        'period_end',
        'summary_metrics',
        'chart_data',
        'table_data',
        'activity_logs',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'summary_metrics' => 'array',
        'chart_data' => 'array',
        'table_data' => 'array',
        'activity_logs' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who generated this report
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by', 'user_id');
    }

    /**
     * Get the seller this report is for (if applicable)
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'generated_for', 'seller_id');
    }

    /**
     * Scope for seller reports
     */
    public function scopeSellerReports($query)
    {
        return $query->where('user_type', 'seller');
    }

    /**
     * Scope for admin reports
     */
    public function scopeAdminReports($query)
    {
        return $query->where('user_type', 'admin');
    }

    /**
     * Scope for reports within date range
     */
    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('period_start', [$startDate, $endDate])
            ->orWhereBetween('period_end', [$startDate, $endDate]);
    }

    /**
     * Scope for recent reports
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}

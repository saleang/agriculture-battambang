<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCancelOrders extends Command
{
    protected $signature = 'orders:auto-cancel';
    protected $description = 'Auto cancel orders that exceed time limits';

    public function handle()
    {
        $this->info('Checking for orders to auto-cancel...');

        // Cancel orders where seller hasn't responded in 30 minutes
        $unrespondedOrders = Order::where('status', Order::STATUS_CONFIRMED)
            ->whereRaw('TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 1')
            ->get();

        foreach ($unrespondedOrders as $order) {
            try {
                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                    'cancelled_at' => now(),
                    'cancelled_by' => Order::CANCELLED_BY_SYSTEM,
                    'cancellation_reason' => 'Seller has no response for ordering. Order automatically cancelled after 30 minutes.',
                ]);

                $this->info("Order #{$order->order_number} cancelled - No seller response");
                Log::info("Auto-cancelled order {$order->order_number} - No seller response");
            } catch (\Exception $e) {
                $this->error("Failed to cancel order #{$order->order_number}: " . $e->getMessage());
                Log::error("Failed to auto-cancel order {$order->order_number}: " . $e->getMessage());
            }
        }

        // Cancel completed orders where customer hasn't paid in 30 minutes
        $unpaidOrders = Order::where('status', Order::STATUS_COMPLETED)
            ->where('payment_status', Order::PAYMENT_UNPAID)
            ->whereRaw('TIMESTAMPDIFF(MINUTE, updated_at, NOW()) >= 1')
            ->get();

        foreach ($unpaidOrders as $order) {
            try {
                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                    'cancelled_at' => now(),
                    'cancelled_by' => Order::CANCELLED_BY_SYSTEM,
                    'cancellation_reason' => 'You missing payment. Order automatically cancelled after 30 minutes of completion.',
                ]);

                $this->info("Order #{$order->order_number} cancelled - Missing payment");
                Log::info("Auto-cancelled order {$order->order_number} - Missing payment");
            } catch (\Exception $e) {
                $this->error("Failed to cancel order #{$order->order_number}: " . $e->getMessage());
                Log::error("Failed to auto-cancel order {$order->order_number}: " . $e->getMessage());
            }
        }

        $totalCancelled = $unrespondedOrders->count() + $unpaidOrders->count();
        $this->info("Auto-cancellation completed. {$totalCancelled} orders cancelled.");

        return 0;
    }
}

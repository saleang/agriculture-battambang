import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';

interface Product {
    product_id: number;
    productname: string;
    price: number;
}

interface ProductImage {
    image_url: string;
}

interface OrderItem {
    item_id: number;
    product_id: number;
    seller_id: number;
    product_name: string;
    product_image: string | null;
    unit: string;
    quantity: number;
    price_per_unit: number;
    product?: Product & { images?: ProductImage[] };
}

interface User {
    user_id: number;
    username: string;
    email: string;
}

interface Order {
    order_id: number;
    order_number: string;
    user_id: number;
    status: 'confirmed' | 'processing' | 'completed' | 'cancelled';
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    total_amount: number;
    payment_method: 'KHQR' | 'manual(cash)';
    payment_status: 'unpaid' | 'paid';
    paid_at: string | null;
    customer_notes: string | null;
    cancelled_at: string | null;
    cancelled_by: 'customer' | 'seller' | 'system' | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    user?: User;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type OrderFilter = 'all' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

const SellerOrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [filter, setFilter] = useState<OrderFilter>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async (): Promise<void> => {
        try {
            const response = await axios.get<PaginatedOrders | Order[]>('/seller/orders');
            const data = 'data' in response.data ? response.data.data : response.data;
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId: number): Promise<void> => {
        if (!confirm('Are you sure you want to mark this order as completed?')) {
            return;
        }

        try {
            await axios.post(`/seller/orders/${orderId}/complete`);
            alert('Order completed successfully');
            fetchOrders();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to complete order');
        }
    };

    const handleCancelOrder = async (orderId: number): Promise<void> => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            await axios.post(`/seller/orders/${orderId}/cancel`, {
                reason: cancelReason
            });
            alert('Order cancelled successfully');
            setShowCancelModal(false);
            setCancelReason('');
            fetchOrders();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleUpdatePaymentStatus = async (orderId: number, status: 'paid' | 'unpaid'): Promise<void> => {
        try {
            await axios.post(`/seller/orders/${orderId}/payment-status`, {
                payment_status: status
            });
            alert('Payment status updated successfully');
            setShowPaymentModal(false);
            fetchOrders();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update payment status');
        }
    };

    const getStatusColor = (status: Order['status']): string => {
        const colors: Record<Order['status'], string> = {
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: Order['payment_status']): string => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    if (loading) {
        return (
            <>
                <Head title="Order Management" />
                <div className="flex justify-center items-center h-64">Loading...</div>
            </>
        );
    }

    return (
        <>
            <Head title="Order Management" />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Order Management</h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'confirmed', 'processing', 'completed', 'cancelled'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.order_id} className="bg-white rounded-lg shadow-md p-6">
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{order.order_number}</h3>
                                        <p className="text-gray-600 text-sm">
                                            Ordered: {new Date(order.created_at).toLocaleString()}
                                        </p>
                                        {order.user && (
                                            <p className="text-gray-600 text-sm">
                                                Customer: {order.user.username || order.recipient_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items (Only seller's items) */}
                                <div className="border-t border-b py-4 mb-4">
                                    <h4 className="font-semibold mb-2">Your Items:</h4>
                                    {order.items?.map((item) => (
                                        <div key={item.item_id} className="flex items-center gap-4 mb-3">
                                            {item.product_image && (
                                                <img
                                                    src={`/storage/${item.product_image}`}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity} {item.unit} × ${Number(item.price_per_unit).toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                ${(item.quantity * Number(item.price_per_unit)).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Customer Details */}
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded">
                                    <div>
                                        <p className="text-gray-600">Recipient:</p>
                                        <p className="font-medium">{order.recipient_name}</p>
                                        <p className="text-gray-600">{order.recipient_phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Shipping Address:</p>
                                        <p className="font-medium">{order.shipping_address}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Method:</p>
                                        <p className="font-medium">{order.payment_method}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Amount:</p>
                                        <p className="font-semibold text-lg">${Number(order.total_amount).toFixed(2)}</p>
                                    </div>
                                    {order.customer_notes && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">Customer Notes:</p>
                                            <p className="font-medium">{order.customer_notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Cancellation Info */}
                                {order.status === 'cancelled' && order.cancellation_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                        <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                                        <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            Cancelled by: {order.cancelled_by}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {(order.status === 'confirmed' || order.status === 'processing') && (
                                        <>
                                            <button
                                                onClick={() => handleCompleteOrder(order.order_id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Complete Order
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowCancelModal(true);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Cancel Order
                                            </button>
                                        </>
                                    )}

                                    {order.payment_method === 'manual(cash)' &&
                                     order.status === 'completed' &&
                                     order.payment_status === 'unpaid' && (
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowPaymentModal(true);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Update Payment Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
                            <p className="mb-4 text-gray-600">
                                You must provide a reason for cancelling order {selectedOrder.order_number}
                            </p>
                            <textarea
                                className="w-full border rounded p-2 mb-4"
                                rows={4}
                                placeholder="Reason for cancellation (required)"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.order_id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Confirm Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Status Modal */}
                {showPaymentModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Update Payment Status</h3>
                            <p className="mb-4 text-gray-600">
                                Has the customer paid for order {selectedOrder.order_number}?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdatePaymentStatus(selectedOrder.order_id, 'paid')}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Mark as Paid
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SellerOrderManagement;

import React, { useState } from 'react';
import axios from 'axios';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';

// Re-using interfaces from the index page for consistency
interface ProductImage {
    image_url: string;
}

interface Product {
    product_id: number;
    name_km: string;
    images?: ProductImage[];
}

interface OrderItem {
    item_id: number;
    product_name: string; // Assuming product_name is passed
    product_image: string | null;
    unit: string;
    quantity: number;
    price_per_unit: number;
    product?: Product;
}

interface User {
    username: string;
}

interface Order {
    order_id: number;
    order_number: string;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    total_amount: number;
    payment_method: 'KHQR' | 'manual(cash)';
    payment_status: 'unpaid' | 'paid';
    created_at: string;
    customer_notes: string | null;
    cancellation_reason: string | null;
    cancelled_by: 'customer' | 'seller' | 'system' | null;
    items: OrderItem[];
    user: User;
}

// Helper functions from index page
const getOrderStatusKhmer = (status: Order['status']): string => {
    const statusMap = {
        pending: 'រង់ចាំការបញ្ជាក់',
        confirmed: 'បានបញ្ជាក់',
        processing: 'កំពុងដំណើរការ',
        completed: 'បានបញ្ចប់',
        cancelled: 'បានលុបចោល',
    };
    return statusMap[status] || status.toUpperCase();
};

const getPaymentStatusKhmer = (status: Order['payment_status']): string => {
    return status === 'paid' ? 'បង់ប្រាក់រួច' : 'មិនបានបង់ប្រាក់';
};

const getStatusColor = (status: Order['status']): string => {
    const colors = {
        pending: 'bg-amber-100 text-amber-800',
        confirmed: 'bg-blue-100 text-blue-800',
        processing: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusColor = (status: Order['payment_status']): string => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
};

export default function SellerOrderShow({ order: initialOrder }: { order: Order }) {
    const [order, setOrder] = useState<Order>(initialOrder);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');

    const refreshOrder = async () => {
        try {
            const response = await axios.get(`/seller/orders-api/${order.order_id}`);
            setOrder(response.data.data);
        } catch (error) {
            toast.error('Failed to refresh order data.');
        }
    };

    const handleCompleteOrder = async () => {
        const result = await Swal.fire({
            title: 'បញ្ជាក់ការបញ្ចប់',
            text: 'តើលោកអ្នកចង់បញ្ជាក់ថាបានបញ្ចប់ការបញ្ជាទិញនេះឬ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'បាទ, បញ្ជាក់',
            cancelButtonText: 'បោះបង់',
        });

        if (!result.isConfirmed) return;

        try {
            await axios.post(`/seller/orders/${order.order_id}/complete`);
            toast.success('ការបញ្ជាទិញត្រូវបានបញ្ចប់ដោយជោគជ័យ');
            refreshOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការបញ្ចប់ការបញ្ជាទិញ');
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('សូមផ្តល់នូវហេតុផលក្នុងការលុបចោល');
            return;
        }

        try {
            await axios.post(`/seller/orders/${order.order_id}/cancel`, { reason: cancelReason });
            toast.success('ការបញ្ជាទិញត្រូវបានលុបចោលដោយជោគជ័យ');
            setShowCancelModal(false);
            setCancelReason('');
            refreshOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការលុបចោលការបញ្ជាទិញ');
        }
    };

    const handleUpdatePaymentStatus = async (status: 'paid' | 'unpaid') => {
        try {
            await axios.post(`/seller/orders/${order.order_id}/payment-status`, { payment_status: status });
            toast.success('ស្ថានភាពការទូទាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ');
            refreshOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់');
        }
    };

    return (
        <AppLayout>
            <Head title={`Order #${order.order_number}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <button onClick={() => router.visit('/seller/orders')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={18} />
                        ត្រឡប់ទៅបញ្ជីការបញ្ជាទិញ
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
                            <p className="text-gray-600 text-sm">
                                កាលបរិច្ឆេទ : {new Date(order.created_at).toLocaleString()}
                            </p>
                            <p className="text-gray-600 text-sm">
                                ឈ្មោះអតិថិជន: {order.user?.username || order.recipient_name}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getOrderStatusKhmer(order.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                {getPaymentStatusKhmer(order.payment_status)}
                            </span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-b py-4 mb-4">
                        <h4 className="font-semibold mb-2">Your Items:</h4>
                        {order.items.map((item) => {
                            let imageUrl = 'https://via.placeholder.com/64?text=No+Image';
                            const imagePath = item.product?.images?.[0]?.image_url;

                            if (imagePath) {
                                if (imagePath.startsWith('http')) {
                                    imageUrl = imagePath;
                                } else {
                                    imageUrl = `/storage/${imagePath}`;
                                }
                            }

                            return (
                                <div key={item.item_id} className="flex items-center gap-4 mb-3">
                                    <img 
                                        src={imageUrl} 
                                        alt={item.product?.name_km} 
                                        className="w-16 h-16 object-cover rounded" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product?.name_km}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.quantity} {item.unit} × {Number(item.price_per_unit).toLocaleString()} ៛
                                        </p>
                                    </div>
                                    <p className="font-semibold">
                                        {(item.quantity * item.price_per_unit).toLocaleString()} ៛
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Customer & Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded">
                        <div>
                            <p className="text-gray-600">អ្នកទទួល:</p>
                            <p className="font-medium">{order.recipient_name}</p>
                            <p className="text-gray-600">{order.recipient_phone}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">អាសយដ្ឋានដឹកជញ្ជូន:</p>
                            <p className="font-medium">{order.shipping_address}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">វិធីសាស្រ្តទូទាត់ប្រាក់:</p>
                            <p className="font-medium">{order.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">តម្លៃសរុប (របស់អ្នក):</p>
                            <p className="font-semibold text-lg">
                                {order.items.reduce((acc, item) => acc + item.quantity * item.price_per_unit, 0).toLocaleString()} ៛
                            </p>
                        </div>
                        {order.customer_notes && (
                            <div className="col-span-2">
                                <p className="text-gray-600">កំណត់ចំណាំពីអតិថិជន:</p>
                                <p className="font-medium">{order.customer_notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Cancellation Info */}
                    {order.status === 'cancelled' && order.cancellation_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                            <p className="text-sm font-medium text-red-800">មូលហេតុនៃការលុបចោល: {order.cancellation_reason}</p>
                            {order.cancelled_by && (
                                <p className="text-xs text-red-600 mt-1">
                                    បានលុបចោលដោយ: {order.cancelled_by}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        {(order.status === 'confirmed' || order.status === 'processing') && (
                            <>
                                <button onClick={() => setShowCancelModal(true)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                    លុបចោលការបញ្ជាទិញ
                                </button>
                                <button onClick={handleCompleteOrder} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                    បញ្ចប់ការបញ្ជាទិញ
                                </button>
                            </>
                        )}
                        {order.payment_method === 'manual(cash)' && order.status === 'completed' && order.payment_status === 'unpaid' && (
                            <button onClick={() => handleUpdatePaymentStatus('paid')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                សម្គាល់ថាបានបង់ប្រាក់
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">លុបចោលការបញ្ជាទិញ #{order.order_number}</h3>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="សូមបញ្ជាក់ពីមូលហេតុ..."
                            className="w-full p-2 border rounded mb-4"
                            rows={4}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                បោះបង់
                            </button>
                            <button onClick={handleCancelOrder} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                បញ្ជាក់ការលុបចោល
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
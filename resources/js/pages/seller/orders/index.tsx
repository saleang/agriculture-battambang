import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
// import { type BreadcrumbItem, type SharedData } from '@/types';

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

type OrderFilter = 'all' | 'confirmed' | 'completed' | 'cancelled';

// Translation helper for order status
const getOrderStatusKhmer = (status: Order['status']): string => {
    const statusMap: Record<Order['status'], string> = {
        confirmed: 'បានបញ្ជាក់',
        processing: 'កំពុងដំណើរការ',
        completed: 'បានបញ្ចប់',
        cancelled: 'បានលុបចោល'
    };
    return statusMap[status] || status.toUpperCase();
};

// Translation helper for payment status
const getPaymentStatusKhmer = (status: Order['payment_status']): string => {
    return status === 'paid' ? 'បង់ប្រាក់រួច' : 'មិនបានបង់ប្រាក់';
};

// Translation helper for filter labels
const getFilterLabelKhmer = (filter: OrderFilter): string => {
    const filterMap: Record<OrderFilter, string> = {
        all: 'ទាំងអស់',
        confirmed: 'បានបញ្ជាក់',
        completed: 'បានបញ្ចប់',
        cancelled: 'បានលុបចោល'
    };
    return filterMap[filter] || filter;
};

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
        const result = await Swal.fire({
            title: 'បញ្ជាក់ការបញ្ចប់',
            text: 'តើលោកអ្នកចង់បញ្ជាក់ថាបានបញ្ចប់ការបញ្ជាទិញនេះឬ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'បាទ, បញ្ជាក់',
            cancelButtonText: 'ក្នុងលក្ខណៈលុបចោល'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await axios.post(`/seller/orders/${orderId}/complete`);
            toast.success('ការបញ្ចប់ការបញ្ជាទិញបានដោះស្រាយដោយជោគជ័យ');
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការបញ្ចប់ការបញ្ជាទិញ');
        }
    };

    const handleCancelOrder = async (orderId: number): Promise<void> => {
        if (!cancelReason.trim()) {
            toast.error('សូមផ្តល់នូវលក្ខខណ្ឌក្នុងការលុបចោល');
            return;
        }

        try {
            await axios.post(`/seller/orders/${orderId}/cancel`, {
                reason: cancelReason
            });
            toast.success('ការលុបចោលការបញ្ជាទិញបានដោះស្រាយដោយជោគជ័យ');
            setShowCancelModal(false);
            setCancelReason('');
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការលុបចោលការបញ្ជាទិញ');
        }
    };

    const handleUpdatePaymentStatus = async (orderId: number, status: 'paid' | 'unpaid'): Promise<void> => {
        try {
            await axios.post(`/seller/orders/${orderId}/payment-status`, {
                payment_status: status
            });
            toast.success('ស្ថានភាពការទូទាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ');
            setShowPaymentModal(false);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់');
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
                <Head title="គ្រប់គ្រងការបញ្ជាទិញ - កសិផលខេត្ត​បាត់ដំបង" />
                <div className="flex justify-center items-center h-64">កំពុងផ្ទុក...</div>
            </>
        );
    }

    return (
        <AppLayout>
            <Head title="គ្រប់គ្រងការបញ្ជាទិញ - កសិផលខេត្ត​បាត់ដំបង" />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">គ្រប់គ្រងការបញ្ជាទិញ</h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {getFilterLabelKhmer(status)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">មិនមានការបញ្ជាទិញដែលរកឃើញ</p>
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
                                            កាលបរិច្ឆេទ : {new Date(order.created_at).toLocaleString()}
                                        </p>
                                        {order.user && (
                                            <p className="text-gray-600 text-sm">
                                                ឈ្មោះអថិតិជន: {order.user.username || order.recipient_name}
                                            </p>
                                        )}
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

                                {/* Order Items (Only seller's items) */}
                                <div className="border-t border-b py-4 mb-4">
                                    {/* <h4 className="font-semibold mb-2">Your Items:</h4> */}
                                    {order.items?.map((item) => {
                                        // Handle different image URL formats
                                        let imageUrl = 'https://via.placeholder.com/64?text=No+Image';
                                        
                                        if (item.product_image) {
                                            // If it's already a full URL (starts with http), use it as is
                                            if (item.product_image.startsWith('http')) {
                                                imageUrl = item.product_image;
                                            } else {
                                                // If it's a relative path, prepend /storage/
                                                imageUrl = `/storage/${item.product_image}`;
                                            }
                                        } else if (item.product?.images?.[0]?.image_url) {
                                            // Fallback to product images
                                            if (item.product.images[0].image_url.startsWith('http')) {
                                                imageUrl = item.product.images[0].image_url;
                                            } else {
                                                imageUrl = `/storage/${item.product.images[0].image_url}`;
                                            }
                                        }
                                        
                                        return (
                                            <div key={item.item_id} className="flex items-center gap-4 mb-3">
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity} {item.unit} × {Number(item.price_per_unit).toFixed(2)}​ ៛
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    {(item.quantity * Number(item.price_per_unit)).toFixed(2)} ៛
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Customer Details */}
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded">
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
                                        <p className="text-gray-600">វិធីសាស្រ្តទូ        ទាត់ប្រាក់:</p>
                                        <p className="font-medium">{order.payment_method}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">តម្លៃសរុប:</p>
                                        <p className="font-semibold text-lg">{Number(order.total_amount).toFixed(2)} ៛</p>
                                    </div>
                                    {order.customer_notes && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">កំណត់ចំណាត់:</p>
                                            <p className="font-medium">{order.customer_notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Cancellation Info */}
                                {order.status === 'cancelled' && order.cancellation_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-1">
                                        <p className="text-sm font-medium text-red-800">មូលហេតុនៃការលុបចោលការបញ្ជាទិញ :​ ​{order.cancellation_reason}</p>
                                        
                                        ​{order.cancelled_by === 'customer' || order.cancelled_by === 'system' &&(
                                            <p className="text-xs text-red-600 mt-0">
                                                បានលុបចោលដោយ: {order.cancelled_by}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 ml-205">
                                    {(order.status === 'confirmed' || order.status === 'processing') && (
                                        <>
                                            
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowCancelModal(true);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                លុបចោលការបញ្ជាទិញ
                                            </button>
                                            <button
                                                onClick={() => handleCompleteOrder(order.order_id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                បញ្ចប់ការបញ្ជាទិញ
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
                    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-200 rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">លុបចោលការបញ្ជាទិញ</h3>
                            <p className="mb-4 text-gray-600">
                                សូមផ្តល់នូវលក្ខខណ្ឌក្នុងការលុបចោលការបញ្ជាទិញ {selectedOrder.order_number}
                            </p>
                            <textarea
                                className="w-full border rounded p-2 mb-4"
                                rows={4}
                                placeholder="មូលហេតុក្នុងការលុបចោល"
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
                                    បិទ
                                </button>
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.order_id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    លុបចោល
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Status Modal */}
                {showPaymentModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">ធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់</h3>
                            <p className="mb-4 text-gray-600">
                                តើអតិថិជនបានបង់ប្រាក់សម្រាប់ការបញ្ជាទិញ {selectedOrder.order_number} ឬ?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    បោះបង់
                                </button>
                                <button
                                    onClick={() => handleUpdatePaymentStatus(selectedOrder.order_id, 'paid')}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    សម្គាល់ថាបានបង់រូបិយវត្ថុ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default SellerOrderManagement;

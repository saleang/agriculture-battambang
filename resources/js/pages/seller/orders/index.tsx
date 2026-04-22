import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
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
    shipping_cost: number | null;
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

type OrderFilter =
    | 'all'
    | 'confirmed'
    | 'processing'
    | 'completed'
    | 'cancelled';

// Translation helper for order status
const getOrderStatusKhmer = (status: Order['status']): string => {
    const statusMap: Record<Order['status'], string> = {
        confirmed: 'រង់ចាំតម្លៃដឹកជញ្ជូន',
        processing: 'រង់ចាំអតិថិជនទូទាត់',
        completed: 'បញ្ចប់',
        cancelled: 'បានលុបចោល',
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
        confirmed: 'រង់ចាំតម្លៃដឹកជញ្ជូន',
        processing: 'រង់ចាំអតិថិជនទូទាត់',
        completed: 'ទូទាត់រួច', 
        cancelled: 'បានលុបចោល',
    };
    return filterMap[filter] || filter;   // fallback to English if unknown
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
            const response = await axios.get<PaginatedOrders | Order[]>(
                '/seller/orders',
            );
            const data =
                'data' in response.data ? response.data.data : response.data;
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    // const handleCompleteOrder = async (orderId: number): Promise<void> => {
    //     const result = await Swal.fire({
    //         title: 'បញ្ជាក់ការបញ្ចប់',
    //         text: 'តើលោកអ្នកចង់បញ្ជាក់ថាបានបញ្ចប់ការបញ្ជាទិញនេះឬ?',
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'បាទ, បញ្ជាក់',
    //         cancelButtonText: 'ក្នុងលក្ខណៈលុបចោល'
    //     });

    //     if (!result.isConfirmed) {
    //         return;
    //     }

    //     try {
    //         await axios.post(`/seller/orders/${orderId}/complete`);
    //         toast.success('ការបញ្ចប់ការបញ្ជាទិញបានដោះស្រាយដោយជោគជ័យ');
    //         fetchOrders();
    //     } catch (error: any) {
    //         toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការបញ្ចប់ការបញ្ជាទិញ');
    //     }
    // };
    // Add new state
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [pendingCompleteOrderId, setPendingCompleteOrderId] = useState<
        number | null
    >(null);
    const [shippingCost, setShippingCost] = useState('');
    const [shippingError, setShippingError] = useState('');

    // Replace handleCompleteOrder with a two-step flow:
    const handleRequestComplete = (orderId: number) => {
        setPendingCompleteOrderId(orderId);
        setShippingCost('');
        setShippingError('');
        setShowShippingModal(true);
    };

    const handleConfirmComplete = async () => {
        const cost = parseFloat(shippingCost);
        if (!shippingCost.trim() || isNaN(cost) || cost < 0) {
            setShippingError(
                'សូមបញ្ចូលថ្លៃដឹកជញ្ជូនត្រឹមត្រូវ (0 ឬច្រើនជាងនេះ)',
            );
            return;
        }

        const result = await Swal.fire({
            title: 'បញ្ជាក់ការបញ្ចប់',
            text: `ថ្លៃដឹកជញ្ជូន: ${cost} ៛ — តើអ្នកចង់បញ្ជាក់ការបញ្ជាទិញនេះឬ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'បាទ, បញ្ជាក់',
            cancelButtonText: 'បោះបង់',
            backdrop: 'transparent',
        });

        if (!result.isConfirmed) return;

        try {
            await axios.post(
                `/seller/orders/${pendingCompleteOrderId}/complete`,
                {
                    shipping_cost: cost,
                },
            );
            toast.success('ការបញ្ចប់ការបញ្ជាទិញបានដោះស្រាយដោយជោគជ័យ');
            setShowShippingModal(false);
            setPendingCompleteOrderId(null);
            fetchOrders();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'បរាជ័យក្នុងការបញ្ចប់ការបញ្ជាទិញ',
            );
        }
    };

    const handleFinishOrder = async (orderId: number) => {
        try {
            await axios.post(`/seller/orders/${orderId}/finish`);
            toast.success('ការបញ្ជាទិញត្រូវបានសម្គាល់ថាបានបញ្ចប់ដោយជោគជ័យ');
            fetchOrders(); // Refresh the orders list
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'បរាជ័យក្នុងការសម្គាល់ការបញ្ជាទិញថាបានបញ្ចប់',
            );
        }
    };

    const handleCancelOrder = async (orderId: number): Promise<void> => {
        if (!cancelReason.trim()) {
            toast.error('សូមផ្តល់នូវលក្ខខណ្ឌក្នុងការលុបចោល');
            return;
        }

        try {
            await axios.post(`/seller/orders/${orderId}/cancel`, {
                reason: cancelReason,
            });
            toast.success('ការលុបចោលការបញ្ជាទិញបានដោះស្រាយដោយជោគជ័យ');
            setShowCancelModal(false);
            setCancelReason('');
            fetchOrders();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'បរាជ័យក្នុងការលុបចោលការបញ្ជាទិញ',
            );
        }
    };

    const handleUpdatePaymentStatus = async (
        orderId: number,
        status: 'paid' | 'unpaid',
    ): Promise<void> => {
        try {
            await axios.post(`/seller/orders/${orderId}/payment-status`, {
                payment_status: status,
            });
            toast.success(
                'ស្ថានភាពការទូទាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ',
            );
            setShowPaymentModal(false);
            fetchOrders();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់',
            );
        }
    };

    const getStatusColor = (status: Order['status']): string => {
        const colors: Record<Order['status'], string> = {
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: Order['payment_status']): string => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') {
            return true;
        }

        switch (filter) {
            case 'confirmed':
                return order.status === 'confirmed';
            case 'processing':
                // An order is 'processing' if its status is 'processing' (waiting for payment or fulfillment)
                // OR if it was mistakenly marked 'completed' but is still 'unpaid'.
                return (
                    order.status === 'processing' ||
                    (order.status === 'completed' &&
                        order.payment_status === 'unpaid')
                );
            case 'completed':
                // An order is only truly 'completed' if the status is 'completed' AND it's 'paid'.
                return (
                    order.status === 'completed' &&
                    order.payment_status === 'paid'
                );
            case 'cancelled':
                return order.status === 'cancelled';
            default:
                return false;
        }
    });

    if (loading) {
        return (
            <>
                <Head title="គ្រប់គ្រងការបញ្ជាទិញ - កសិផលខេត្ត​បាត់ដំបង" />
                <div className="flex h-64 items-center justify-center">
                    កំពុងផ្ទុក...
                </div>
            </>
        );
    }

    return (
        <AppLayout>
            <Head title="គ្រប់គ្រងការបញ្ជាទិញ - កសិផលខេត្ត​បាត់ដំបង" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">គ្រប់គ្រងការបញ្ជាទិញ</h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(
                            [
                                'all',
                                'confirmed',
                                'processing',
                                'completed',
                                'cancelled',
                            ] as const
                        ).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`rounded px-4 py-2 ${
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
                    <div className="rounded-lg bg-gray-50 py-12 text-center">
                        <p className="text-lg text-gray-500">
                            មិនមានការបញ្ជាទិញដែលរកឃើញ
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.order_id}
                                className="rounded-lg bg-white p-6 shadow-md"
                            >
                                {/* Order Header */}
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {order.order_number}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            កាលបរិច្ឆេទ :{' '}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleString()}
                                        </p>
                                        {order.user && (
                                            <p className="text-sm text-gray-600">
                                                ឈ្មោះអថិតិជន:{' '}
                                                {order.user.username ||
                                                    order.recipient_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
                                        >
                                            {getOrderStatusKhmer(order.status)}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}
                                        >
                                            {getPaymentStatusKhmer(
                                                order.payment_status,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items (Only seller's items) */}
                                <div className="mb-4 border-t border-b py-4">
                                    {/* <h4 className="font-semibold mb-2">Your Items:</h4> */}
                                    {order.items?.map((item) => {
                                        // Handle different image URL formats
                                        let imageUrl =
                                            'https://via.placeholder.com/64?text=No+Image';

                                        if (item.product_image) {
                                            // If it's already a full URL (starts with http), use it as is
                                            if (
                                                item.product_image.startsWith(
                                                    'http',
                                                )
                                            ) {
                                                imageUrl = item.product_image;
                                            } else {
                                                // If it's a relative path, prepend /storage/
                                                imageUrl = `/storage/${item.product_image}`;
                                            }
                                        } else if (
                                            item.product?.images?.[0]?.image_url
                                        ) {
                                            // Fallback to product images
                                            if (
                                                item.product.images[0].image_url.startsWith(
                                                    'http',
                                                )
                                            ) {
                                                imageUrl =
                                                    item.product.images[0]
                                                        .image_url;
                                            } else {
                                                imageUrl = `/storage/${item.product.images[0].image_url}`;
                                            }
                                        }

                                        return (
                                            <div
                                                key={item.item_id}
                                                className="mb-3 flex items-center gap-4"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product_name}
                                                    className="h-16 w-16 rounded object-cover"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).src =
                                                            'https://via.placeholder.com/64?text=No+Image';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity}{' '}
                                                        {item.unit} ×{' '}
                                                        {Number(
                                                            item.price_per_unit,
                                                        ).toFixed(2)}
                                                        ​ ៛
                                                    </p>
                                                </div>
                                                <p className="text-gray-600">
                                                    តម្លៃផលិតផល:
                                                </p>
                                                <p className="font-semibold">
                                                    {(
                                                        item.quantity *
                                                        Number(
                                                            item.price_per_unit,
                                                        )
                                                    ).toFixed(2)}{' '}
                                                    ៛
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Customer Details */}
                                <div className="mb-4 grid grid-cols-5 gap-5 rounded bg-gray-50 p-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">
                                            អ្នកទទួល:
                                        </p>
                                        <p className="font-medium">
                                            {order.recipient_name}
                                        </p>
                                        <p className="text-gray-600">
                                            {order.recipient_phone}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">
                                            អាសយដ្ឋានដឹកជញ្ជូន:
                                        </p>
                                        <p className="font-medium">
                                            {order.shipping_address}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">
                                            វិធីសាស្រ្តទូទាត់ប្រាក់:
                                        </p>
                                        <p className="font-medium">
                                            {order.payment_method}
                                        </p>
                                    </div>
                                    {/* <div>
                                        <p className="text-gray-600">តម្លៃសរុប:</p>
                                        <p className="font-semibold text-lg">{Number(order.total_amount).toFixed(2)} ៛</p>
                                    </div> */}
                                    <div>
                                        <p className="text-gray-600">
                                            ថ្លៃដឹកជញ្ជូន:
                                        </p>
                                        {order.shipping_cost !== null &&
                                        order.shipping_cost !== undefined ? (
                                            <p className="font-medium">
                                                {Number(
                                                    order.shipping_cost,
                                                ).toFixed(2)}{' '}
                                                ៛
                                            </p>
                                        ) : (
                                            <p className="text-amber-600 italic">
                                                មិនទាន់បញ្ចូល
                                            </p>
                                        )}
                                    </div>
                                    {/* <div className="col-span-2 border-t pt-3 mt-1"> */}
                                    <div className="flex items-center justify-between">
                                        {/* <div>
                <p className="text-gray-600">តម្លៃផលិតផល:</p>
                <p className="font-medium">{Number(order.total_amount).toFixed(2)} ៛</p>
            </div> */}
                                        <div className="text-right">
                                            <p className="text-gray-600">
                                                តម្លៃសរុប (រួមដឹកជញ្ជូន):
                                            </p>
                                            <p className="text-lg font-semibold text-green-700">
                                                {((
                                                    order.items?.reduce(
                                                        (acc, item) =>
                                                            acc +
                                                            item.quantity *
                                                                Number(
                                                                    item.price_per_unit,
                                                                ),
                                                        0,
                                                    ) ?? 0) + 
                                                    (Number(order.shipping_cost) || 0)
                                                ).toFixed(2)}{' '}
                                                ៛
                                            </p>
                                        </div>
                                    </div>
                                    {/* </div> */}
                                    {order.customer_notes && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">
                                                កំណត់ចំណាត់:
                                            </p>
                                            <p className="font-medium">
                                                {order.customer_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Cancellation Info */}
                                {order.status === 'cancelled' &&
                                    order.cancellation_reason && (
                                        <div className="mb-1 rounded border border-red-200 bg-red-50 p-3">
                                            <p className="text-sm font-medium text-red-800">
                                                មូលហេតុនៃការលុបចោលការបញ្ជាទិញ :​
                                                ​{order.cancellation_reason}
                                            </p>
                                            ​
                                            {order.cancelled_by ===
                                                'customer' ||
                                                (order.cancelled_by ===
                                                    'system' && (
                                                    <p className="mt-0 text-xs text-red-600">
                                                        បានលុបចោលដោយ:{' '}
                                                        {order.cancelled_by}
                                                    </p>
                                                ))}
                                        </div>
                                    )}

                                {/* Action Buttons */}
                                <div className="ml-205 flex gap-3">
                                    {order.status === 'confirmed' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowCancelModal(true);
                                                }}
                                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                            >
                                                លុបចោលការបញ្ជាទិញ
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRequestComplete(
                                                        order.order_id,
                                                    )
                                                }
                                                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                            >
                                                បញ្ជាក់តម្លៃដឹកជញ្ជូន
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'processing' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowCancelModal(true);
                                                }}
                                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                            >
                                                លុបចោលការបញ្ជាទិញ
                                            </button>
                                            {/* NEW: Finish Order Button */}
                                            <button
                                                onClick={() =>
                                                    handleFinishOrder(
                                                        order.order_id,
                                                    )
                                                }
                                                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
                                            >
                                                សម្គាល់ថាបានបញ្ចប់
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
                                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center">
                        <div className="w-full max-w-md rounded-lg bg-gray-200 p-6">
                            <h3 className="mb-4 text-xl font-bold">
                                លុបចោលការបញ្ជាទិញ
                            </h3>
                            <p className="mb-4 text-gray-600">
                                សូមផ្តល់នូវលក្ខខណ្ឌក្នុងការលុបចោលការបញ្ជាទិញ{' '}
                                {selectedOrder.order_number}
                            </p>
                            <textarea
                                className="mb-4 w-full rounded border p-2"
                                rows={4}
                                placeholder="មូលហេតុក្នុងការលុបចោល"
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="flex-1 rounded border px-4 py-2 hover:bg-gray-50"
                                >
                                    បិទ
                                </button>
                                <button
                                    onClick={() =>
                                        handleCancelOrder(
                                            selectedOrder.order_id,
                                        )
                                    }
                                    className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    លុបចោល
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Status Modal */}
                {showPaymentModal && selectedOrder && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="w-full max-w-md rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-xl font-bold">
                                ធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់
                            </h3>
                            <p className="mb-4 text-gray-600">
                                តើអតិថិជនបានបង់ប្រាក់សម្រាប់ការបញ្ជាទិញ{' '}
                                {selectedOrder.order_number} ឬ?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 rounded border px-4 py-2 hover:bg-gray-50"
                                >
                                    បោះបង់
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdatePaymentStatus(
                                            selectedOrder.order_id,
                                            'paid',
                                        )
                                    }
                                    className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    សម្គាល់ថាបានបង់រូបិយវត្ថុ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showShippingModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-transparent">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h3 className="mb-2 text-xl font-bold">
                                បញ្ចូលថ្លៃដឹកជញ្ជូន
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                                សូមបញ្ចូលថ្លៃដឹកជញ្ជូនសម្រាប់ការបញ្ជាទិញនេះ
                                មុនពេលបញ្ចប់។
                            </p>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    ថ្លៃដឹកជញ្ជូន (៛)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={shippingCost}
                                    onChange={(e) => {
                                        setShippingCost(e.target.value);
                                        setShippingError('');
                                    }}
                                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="ឧ. 1500"
                                    autoFocus
                                />
                                {shippingError && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {shippingError}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowShippingModal(false);
                                        setPendingCompleteOrderId(null);
                                    }}
                                    className="flex-1 rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
                                >
                                    បោះបង់
                                </button>
                                <button
                                    onClick={handleConfirmComplete}
                                    className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    បន្តបញ្ចប់
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
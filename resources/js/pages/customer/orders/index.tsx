import khqrlogo from '@/assets/khqr_logo.png';
import { Footer } from '@/pages/customer/footer-customer';
import Header from '@/pages/header';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    CheckCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    LucideDollarSign,
    MapPin,
    Phone,
    RotateCcw,
    ShoppingBag,
    Trash2,
    Truck,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    address?: string;
}
interface OrderItem {
    item_id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    unit: string;
    quantity: number;
    price_per_unit: number;
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
}
interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type FilterTab = 'all' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

const CustomerOrderList: React.FC = () => {
    const page = usePage<any>();
    const user = page.props.auth?.user ?? null;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(
        new Set(),
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [modalPhase, setModalPhase] = useState<'polling' | 'success'>(
        'polling',
    );
    const [modalMerchant, setModalMerchant] = useState('');
    const [modalAmount, setModalAmount] = useState(0);
    const [modalQrString, setModalQrString] = useState('');
    const [modalCountdown, setModalCountdown] = useState(0);
    const [modalMsg, setModalMsg] = useState('');

    const $ = useRef({
        orderId: 0,
        running: false,
        netErrors: 0,
        pollTimer: null as ReturnType<typeof setInterval> | null,
        cdTimer: null as ReturnType<typeof setInterval> | null,
    });

    useEffect(() => {
        fetchOrders();
        return () => killAll();
    }, []);

    const killAll = () => {
        $.current.running = false;
        if ($.current.pollTimer) {
            clearInterval($.current.pollTimer);
            $.current.pollTimer = null;
        }
        if ($.current.cdTimer) {
            clearInterval($.current.cdTimer);
            $.current.cdTimer = null;
        }
    };

    const closeModal = () => {
        killAll();
        $.current.orderId = 0;
        $.current.netErrors = 0;
        setModalOpen(false);
        setModalPhase('polling');
        setModalCountdown(0);
        setModalMsg('');
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get<PaginatedOrders | Order[]>(
                '/customer/orders',
            );
            const data = 'data' in res.data ? res.data.data : res.data;
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            toast.error('មិនអាចផ្ទុកការបញ្ជាទិញបាន។ សូមព្យាយាមម្តងទៀត។');
        } finally {
            setLoading(false);
        }
    };

    const pollTick = async () => {
        if (!$.current.running) return;
        const orderId = $.current.orderId;
        if (!orderId) return;
        try {
            const res = await axios.post(
                `/customer/orders/${orderId}/khqr/verify`,
                {},
                { validateStatus: () => true, timeout: 90000 },
            );
            if (!$.current.running) return;
            const status: string = res.data?.status ?? '';
            const msg: string = res.data?.message ?? '';
            if (res.status === 401 || res.status === 403) {
                killAll();
                return;
            }
            $.current.netErrors = 0;
            if (status === 'paid') {
                killAll();
                setModalPhase('success');
                setModalMsg('');
                setTimeout(() => {
                    closeModal();
                    toast.success('ការទូទាត់ជោគជ័យ! សូមអរគុណ។');
                    fetchOrders();
                }, 2000);
            } else if (status === 'expired') {
                closeModal();
                toast.error('QR កូដបានផុតកំណត់។ សូមបង្កើតថ្មី។');
            } else if (status === 'error') {
                setModalMsg(msg || 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់');
            } else {
                setModalMsg('');
            }
        } catch (netErr: any) {
            if (!$.current.running) return;
            const isTimeout =
                netErr.code === 'ECONNABORTED' ||
                netErr.message?.includes('timeout');
            if (!isTimeout) $.current.netErrors += 1;
            if ($.current.netErrors >= 10) {
                closeModal();
                toast.error('មិនអាចភ្ជាប់បណ្តាញ។ សូមព្យាយាមម្តងទៀត។');
            } else {
                setModalMsg(`ការភ្ជាប់មានបញ្ហា (${$.current.netErrors}/10)...`);
            }
        }
    };

    const handleGenerateKHQR = async (order: Order) => {
        try {
            const res = await axios.post(
                `/customer/orders/${order.order_id}/khqr/generate`,
            );
            if (!res.data.success) {
                toast.error(res.data.message || 'មានបញ្ហាក្នុងការបង្កើត QR');
                return;
            }
            const { qr_string, amount, server_time, duration, merchant_name } =
                res.data;
            const diff = Math.floor(Date.now() / 1000) - server_time;
            killAll();
            $.current.orderId = order.order_id;
            $.current.netErrors = 0;
            $.current.running = true;
            setModalMerchant(merchant_name);
            setModalAmount(amount); // Use the amount from the backend
            setModalQrString(qr_string);
            setModalPhase('polling');
            setModalMsg('');
            setModalOpen(true);
            const cdTick = () => {
                const rem = Math.max(
                    0,
                    duration -
                        (Math.floor(Date.now() / 1000) - server_time - diff) -
                        15,
                );
                setModalCountdown(rem);
                if (rem <= 0) {
                    closeModal();
                    toast.error('QR កូដបានផុតកំណត់ សូមបង្កើតថ្មី');
                }
            };
            cdTick();
            $.current.cdTimer = setInterval(cdTick, 1000);
            pollTick();
            $.current.pollTimer = setInterval(pollTick, 5000);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || 'មិនអាចបង្កើត QR កូដបានទេ',
            );
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelTarget) return;
        try {
            await axios.post(
                `/customer/orders/${cancelTarget.order_id}/cancel`,
                {
                    reason: cancelReason.trim() || 'មិនមានហេតុផលបញ្ជាក់',
                },
            );
            toast.success('បានលុបចោលការបញ្ជាទិញជោគជ័យ');
            setCancelTarget(null);
            setCancelReason('');
            fetchOrders();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || 'មិនអាចលុបចោលការបញ្ជាទិញបានទេ',
            );
        }
    };

    const fmt$ = (n: number | string | null | undefined) =>
        Math.floor(Number(n)).toLocaleString('km-KH') + ' ៛';

    const fmtDate = (s: string) => {
        const d = new Date(s);
        const months = [
            'មករា',
            'កុម្ភៈ',
            'មីនា',
            'មេសា',
            'ឧសភា',
            'មិថុនា',
            'កក្កដា',
            'សីហា',
            'កញ្ញា',
            'តុលា',
            'វិច្ឆិកា',
            'ធ្នូ',
        ];
        const h = d.getHours(),
            m = String(d.getMinutes()).padStart(2, '0');
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const period =
            h < 12 ? 'ព្រឹក' : h < 16 ? 'រសៀល' : h < 19 ? 'ល្ងាច' : 'យប់';
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${h12}:${m} ${period}`;
    };

    const STATUS_CONFIG = {
        confirmed: {
            label: 'រងចាំការបញ្ជាក់តម្លៃដឹកជញ្ជូន',
            Icon: CheckCircle2,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            dot: 'bg-blue-500',
        },
        processing: {
            label: 'កំពុងដំណើរការ',
            Icon: RotateCcw,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
        },
        completed: {
            label: 'បានបញ្ចប់',
            Icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            dot: 'bg-emerald-500',
        },
        cancelled: {
            label: 'បានលុបចោល',
            Icon: XCircle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-200',
            dot: 'bg-red-400',
        },
    };

    const TABS: { key: FilterTab; label: string }[] = [
        { key: 'all', label: 'ទាំងអស់' },
        { key: 'confirmed', label: 'រងចាំការបញ្ជាក់តម្លៃដឹកជញ្ជូន' },
        { key: 'processing', label: 'កំពុងដំណើរការ' },
        { key: 'completed', label: 'បានបញ្ចប់' },
        { key: 'cancelled', label: 'បានលុបចោល' },
    ];

    const getFilteredOrders = (filterKey: FilterTab) => {
        if (filterKey === 'all') {
            return orders;
        }
        return orders.filter(order => {
            switch (filterKey) {
                case 'confirmed':
                    return order.status === 'confirmed';
                case 'processing':
                    return (
                        order.payment_status === 'unpaid' &&
                        order.status !== 'cancelled' &&
                        order.status !== 'confirmed'
                    );
                case 'completed':
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
    };

    const filtered = getFilteredOrders(activeTab);
    const cdMins = Math.floor(modalCountdown / 60);
    const cdSecs = (modalCountdown % 60).toString().padStart(2, '0');
    const nearExpiry = modalCountdown > 0 && modalCountdown <= 60;

    const toggleExpand = (id: number) => {
        setExpandedOrders((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                    <p className="text-sm text-gray-400">កំពុងផ្ទុក...</p>
                </div>
            </div>
        );

    return (
        <>
            <Head title="ការបញ្ជាទិញរបស់ខ្ញុំ" />
            <Header
                searchQuery=""
                onSearchChange={() => {}}
                isAuthenticated={!!user}
                userName={user?.username ?? ''}
            />
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-7xl px-4 pt-52 pb-16">
                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="font-moul text-2xl font-bold text-gray-900">
                            ការបញ្ជាទិញរបស់ខ្ញុំ
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {orders.length} ការបញ្ជាទិញសរុប
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-4 flex overflow-x-auto rounded-xl bg-white shadow-sm">
                        {TABS.map((tab) => {
                            const count = getFilteredOrders(tab.key).length;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative min-w-max flex-1 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                                        activeTab === tab.key
                                            ? 'text-green-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span
                                            className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                                                activeTab === tab.key
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                    {activeTab === tab.key && (
                                        <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-green-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Orders */}
                    {filtered.length === 0 ? (
                        <div className="rounded-xl bg-white p-16 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <ShoppingBag
                                    size={26}
                                    className="text-gray-300"
                                />
                            </div>
                            <p className="font-medium text-gray-500">
                                មិនមានការបញ្ជាទិញ
                            </p>
                            <p className="mt-1 mb-6 text-sm text-gray-400">
                                ចូលទិញផលិតផលថ្មីៗពីកសិករតែម្ដង
                            </p>
                            <button
                                onClick={() => router.visit('/')}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                            >
                                <ShoppingBag size={15} /> ចូលទិញទំនិញ
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((order) => {
                                const cfg = STATUS_CONFIG[order.status];
                                const StatusIcon = cfg.Icon;
                                const isExpanded = expandedOrders.has(
                                    order.order_id,
                                );
                                const subTotal = order.items?.reduce((acc, item) => acc + (item.quantity * item.price_per_unit), 0) ?? 0;
                                const grandTotal = subTotal + Number(order.shipping_cost ?? 0);
                                const hasShipping =
                                    order.shipping_cost !== null &&
                                    order.shipping_cost !== undefined;
                                const firstItem = order.items?.[0];
                                const extraCount =
                                    (order.items?.length ?? 1) - 1;

                                return (
                                    <div
                                        key={order.order_id}
                                        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                                    >
                                        {/* Status Bar */}
                                        <div
                                            className={`flex items-center justify-between px-5 py-3 ${cfg.bg} border-b ${cfg.border}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${cfg.dot}`}
                                                />
                                                <StatusIcon
                                                    size={14}
                                                    className={cfg.color}
                                                />
                                                <span
                                                    className={`text-sm font-semibold ${cfg.color}`}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {order.payment_status ===
                                                'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
                                                        <CheckCircle2
                                                            size={10}
                                                        />{' '}
                                                        បានទូទាត់
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs text-orange-500">
                                                        <Clock size={10} />{' '}
                                                        មិនទាន់ទូទាត់
                                                    </span>
                                                )}
                                                <span className="font-mono text-xs text-gray-400">
                                                    {order.order_number}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Preview */}
                                        <div className="px-5 py-4">
                                            {firstItem && (
                                                <div className="flex items-start gap-3">
                                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                                                        <img
                                                            src={
                                                                firstItem.product_image ||
                                                                '/images/placeholder-product.jpg'
                                                            }
                                                            alt={
                                                                firstItem.product_name
                                                            }
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).src =
                                                                    '/images/placeholder-product.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {
                                                                firstItem.product_name
                                                            }
                                                        </p>
                                                        <p className="mt-0.5 text-sm text-gray-500">
                                                            {firstItem.quantity}{' '}
                                                            {firstItem.unit} ×{' '}
                                                            {fmt$(
                                                                firstItem.price_per_unit,
                                                            )}
                                                        </p>
                                                        {extraCount > 0 && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleExpand(
                                                                        order.order_id,
                                                                    )
                                                                }
                                                                className="mt-1 text-xs text-green-600 hover:underline"
                                                            >
                                                                {isExpanded
                                                                    ? 'បង្រួម'
                                                                    : `+ ${extraCount} ផលិតផលទៀត`}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-gray-400 mb-1">សរុប</p>
                                                        <p className="font-bold text-gray-900">
                                                            {hasShipping ? fmt$(grandTotal) : fmt$(order.total_amount)}
                                                        </p>
                                                    </div> */}
                                                </div>
                                            )}

                                            {/* Expanded items */}
                                            {isExpanded &&
                                                order.items
                                                    ?.slice(1)
                                                    .map((item) => (
                                                        <div
                                                            key={item.item_id}
                                                            className="mt-3 flex items-start gap-3 border-t border-gray-100 pt-3"
                                                        >
                                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                                                                <img
                                                                    src={
                                                                        item.product_image ||
                                                                        '/images/placeholder-product.jpg'
                                                                    }
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.target as HTMLImageElement
                                                                        ).src =
                                                                            '/images/placeholder-product.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-gray-900">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </p>
                                                                <p className="mt-0.5 text-sm text-gray-500">
                                                                    {
                                                                        item.quantity
                                                                    }{' '}
                                                                    {item.unit}{' '}
                                                                    ×{' '}
                                                                    {fmt$(
                                                                        item.price_per_unit,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <p className="flex-shrink-0 text-sm font-medium text-gray-700">
                                                                {fmt$(
                                                                    item.quantity *
                                                                        item.price_per_unit,
                                                                )}
                                                            </p>
                                                        </div>
                                                    ))}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="mx-5 mb-4 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>សរុបរង</span>
                                                <span>
                                                    {fmt$(subTotal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Truck size={12} />
                                                    ដឹកជញ្ជូន
                                                </span>
                                                {hasShipping ? (
                                                    <span className="text-gray-700">
                                                        {fmt$(
                                                            Number(
                                                                order.shipping_cost,
                                                            ),
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-500 italic">
                                                        រង់ចាំអ្នកលក់...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-sm font-semibold text-gray-900">
                                                <span>សរុបទាំងអស់</span>
                                                {hasShipping ? (
                                                    <span className="text-base text-green-700">
                                                        {fmt$(grandTotal)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-amber-500">
                                                        រង់ចាំថ្លៃដឹក
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        <div className="mx-5 mb-4 space-y-1.5">
                                            <div className="flex items-start gap-2 text-sm text-gray-500">
                                                <Phone
                                                    size={13}
                                                    className="mt-0.5 flex-shrink-0 text-gray-400"
                                                />
                                                <span>
                                                    {order.recipient_name} ·{' '}
                                                    {order.recipient_phone}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2 text-sm text-gray-500">
                                                <MapPin
                                                    size={13}
                                                    className="mt-0.5 flex-shrink-0 text-gray-400"
                                                />
                                                <span className="line-clamp-1">
                                                    {order.shipping_address}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock
                                                    size={13}
                                                    className="flex-shrink-0 text-gray-400"
                                                />
                                                <span>
                                                    {fmtDate(order.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                {order.payment_method ===
                                                'KHQR' ? (
                                                    <>
                                                        <CreditCard
                                                            size={13}
                                                            className="text-gray-400"
                                                        />
                                                        <span>
                                                            KHQR / ផ្ទេរប្រាក់
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wallet
                                                            size={13}
                                                            className="text-gray-400"
                                                        />
                                                        <span>
                                                            សាច់ប្រាក់ពេលទទួល
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {order.customer_notes && (
                                                <div className="flex items-start gap-2 text-sm text-gray-500">
                                                    <FileText
                                                        size={13}
                                                        className="mt-0.5 flex-shrink-0 text-gray-400"
                                                    />
                                                    <span className="italic">
                                                        {order.customer_notes}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cancellation Reason */}
                                        {order.status === 'cancelled' &&
                                            order.cancellation_reason && (
                                                <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                                                    <XCircle
                                                        size={15}
                                                        className="mt-0.5 flex-shrink-0 text-red-400"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-red-700">
                                                            {
                                                                order.cancellation_reason
                                                            }
                                                        </p>
                                                        {/* {order.cancelled_by && (
                                                        <p className="text-xs text-red-400 mt-0.5">លុបចោលដោយ: {order.cancelled_by}</p>
                                                    )} */}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Action Footer */}
                                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
                                            {(order.status === 'confirmed' ||
                                                order.status ===
                                                    'processing') && (
                                                <button
                                                    onClick={() => {
                                                        setCancelTarget(order);
                                                        setCancelReason('');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} /> លុបចោល
                                                </button>
                                            )}
                                            {order.status === 'completed' &&
                                                order.payment_status ===
                                                    'unpaid' &&
                                                order.payment_method ===
                                                    'KHQR' && (
                                                    <button
                                                        onClick={() =>
                                                            handleGenerateKHQR(
                                                                order,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                                                    >
                                                        <LucideDollarSign
                                                            size={18}
                                                        />
                                                        ទូទាត់ប្រាក់
                                                    </button>
                                                )}
                                            {order.status === 'completed' &&
                                                order.payment_status ===
                                                    'unpaid' &&
                                                order.payment_method ===
                                                    'manual(cash)' && (
                                                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
                                                        <Clock size={14} />{' '}
                                                        រង់ចាំទូទាត់
                                                    </div>
                                                )}
                                            {order.payment_status ===
                                                'paid' && (
                                                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                                                    <CheckCircle2 size={14} />{' '}
                                                    បានទូទាត់រួច
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            {cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="border-b border-red-100 bg-red-50 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <AlertTriangle
                                        size={16}
                                        className="text-red-500"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        លុបចោលការបញ្ជាទិញ
                                    </h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {cancelTarget.order_number}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                មូលហេតុ (ស្រេចចិត្ត)
                            </label>
                            <textarea
                                className="min-h-[90px] w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                placeholder="សូមបញ្ជាក់ហេតុផល..."
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                            />
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => setCancelTarget(null)}
                                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                                >
                                    បោះបង់
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                >
                                    បញ្ជាក់លុបចោល
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KHQR Modal */}
            {/* {modalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
                    <div className="w-[300px] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-[#D0021B] px-5 py-4 flex items-center justify-between">
                            <span className="text-white font-extrabold text-xl tracking-widest">KHQR</span>
                            {modalPhase !== 'success' && (
                                <button onClick={closeModal}
                                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                                    <X size={14} className="text-white" />
                                </button>
                            )}
                        </div>
                        <div className="bg-white px-5 py-5">
                            <div className="text-center mb-4">
                                <p className="text-gray-400 text-xs truncate mb-1">{modalMerchant}</p>
                                <p className="text-gray-900 font-bold text-3xl tabular-nums">
                                    {modalAmount.toLocaleString()} KHR
                                </p>
                            </div>
                            <div className="border-t border-dashed border-gray-200 my-3" />
                            <div className="flex justify-center py-1">
                                {modalPhase === 'success' ? (
                                    <div className="flex flex-col items-center gap-2 py-8">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <CheckCircle size={38} className="text-emerald-500" />
                                        </div>
                                        <p className="text-emerald-700 font-semibold mt-1">ការទូទាត់ជោគជ័យ</p>
                                        <p className="text-gray-400 text-xs">កំពុងបិទ...</p>
                                    </div>
                                ) : (
                                    <div className="relative inline-block">
                                        <QRCodeSVG value={modalQrString} size={210} level="H" includeMargin={false} />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-11 h-11 bg-white rounded-lg shadow-md p-1">
                                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNfSKZQysxnHmvSncjDN9ImDloJ3pO590Rjw&s"
                                                    alt="KHQR" className="w-full h-full object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {modalPhase !== 'success' && (
                                <div className="mt-4 text-center space-y-2">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold tabular-nums ${nearExpiry ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Timer size={12} />
                                        {modalCountdown > 0 ? `${cdMins}:${cdSecs}` : 'ផុតកំណត់'}
                                    </div>
                                    {!modalMsg ? (
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm">
                                            <Wifi size={12} />
                                            <span>កំពុងផ្ទៀងផ្ទាត់...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs">
                                            <WifiOff size={12} />
                                            <span>{modalMsg}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="bg-[#D0021B] h-1" />
                    </div>
                </div>
            )} */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div
                        style={{
                            width: '300px',
                            fontFamily: 'Arial, sans-serif',
                        }}
                    >
                        {modalPhase === 'success' ? (
                            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                                <div className="flex flex-col items-center gap-3 px-6 py-12">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                                        <CheckCircle
                                            size={44}
                                            className="text-emerald-500"
                                        />
                                    </div>
                                    <p className="mt-1 text-lg font-bold text-emerald-700">
                                        ការទូទាត់ជោគជ័យ!
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        កំពុងបិទ...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                                {/* Red speech-bubble header with your exact KHQR logo from assets */}
                                <div
                                    style={{
                                        position: 'relative',
                                        background: '#D0021B',
                                        borderRadius: '16px 16px 0 0',
                                        padding: '14px 20px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {/* Close button */}
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '12px',
                                            width: '26px',
                                            height: '26px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <X size={13} color="white" />
                                    </button>

                                    {/* Your exact KHQR logo from assets folder */}
                                    <img
                                        src={khqrlogo}
                                        alt="KHQR"
                                        style={{
                                            width: '99px',
                                            height: '20px',
                                            display: 'block',
                                            margin: '0 auto',
                                        }}
                                    />

                                    {/* Bigger Speech bubble tail - bottom right */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '-32px', // moved down a bit
                                            right: '0px', // adjusted position
                                            width: 0,
                                            height: 0,
                                            borderLeft:
                                                '30px solid transparent', // BIGGER
                                            borderRight:
                                                '0px solid transparent',
                                            borderTop: '38px solid #D0021B', // BIGGER
                                        }}
                                    />
                                </div>

                                {/* White body - exactly matches the payment card design you showed */}
                                <div
                                    style={{
                                        padding: '20px 20px 16px 20px',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    {/* Merchant name */}
                                    <p
                                        style={{
                                            fontSize: '20px',
                                            color: '#111827',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            marginBottom: '2px',
                                            marginLeft: '18px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {modalMerchant}
                                    </p>

                                    {/* Amount */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            gap: '6px',
                                            marginBottom: '16px',
                                            marginLeft: '18px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '25px',
                                                color: '#374151',
                                                fontWeight: 700,
                                                fontFamily: 'battambang',
                                            }}
                                        >
                                            {' '}
                                            ៛
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '25px',
                                                fontWeight: 700,
                                                color: '#111827',
                                                letterSpacing: '-1px',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {modalAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Dashed separator with side notches */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            margin: '0 -20px 16px -20px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                background: '#f3f4f6',
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div
                                            style={{
                                                flex: 1,
                                                borderTop: '2px dashed #e5e7eb',
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                background: '#f3f4f6',
                                                flexShrink: 0,
                                            }}
                                        />
                                    </div>

                                    {/* QR Code with Bakong center logo */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '14px',
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <QRCodeSVG
                                                value={modalQrString}
                                                size={256}
                                                level="H"
                                                includeMargin={false}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform:
                                                        'translate(-50%, -50%)',
                                                    width: '44px',
                                                    height: '44px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    padding: '1px',
                                                    boxShadow:
                                                        '0 0 0 2px white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <img
                                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNfSKZQysxnHmvSncjDN9ImDloJ3pO590Rjw&s"
                                                    alt="Bakong"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Countdown + polling status */}
                                    {/* <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 14px', borderRadius: '999px',
                                            background: nearExpiry ? '#fef2f2' : '#f3f4f6',
                                            color: nearExpiry ? '#dc2626' : '#6b7280',
                                            fontSize: '13px', fontWeight: 700,
                                            marginBottom: '8px',
                                        }}>
                                            <Timer size={12} />
                                            {modalCountdown > 0 ? `${cdMins}:${cdSecs}` : 'ផុតកំណត់'}
                                        </div>

                                        {!modalMsg ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#9ca3af', fontSize: '12px' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: '0ms' }} />
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: '160ms' }} />
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: '320ms' }} />
                                                <span style={{ marginLeft: '6px' }}>កំពុងផ្ទៀងផ្ទាត់...</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontSize: '11px' }}>
                                                <WifiOff size={11} />
                                                <span>{modalMsg}</span>
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default CustomerOrderList;
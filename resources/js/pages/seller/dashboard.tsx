import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    MessageCircleHeart,
    MoreHorizontal,
    Package,
    Plus,
    RefreshCw,
    TrendingUp,
    Truck,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Order {
    order_id: number;
    order_number: string;
    customer_name: string;
    order_date: string;
    seller_total: number | string;
    status: string;
    payment_status: 'paid' | 'unpaid';
}

interface Product {
    name: string;
    sold: number;
    revenue: number;
}

interface Seller {
    farm_name?: string;
    full_location?: string;
    total_sales?: number;
    active_products_count?: number;
}

interface Props {
    seller: Seller;
    recentOrders: Order[];
    salesData: Array<{ date: string; orders: number }>;
    topProducts?: Product[];
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: 'rose' | 'emerald' | 'amber' | 'sky';
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    label,
    value,
    color = 'sky',
}) => {
    const colorMap = {
        rose: { chart: '#f43f5e', iconBg: 'bg-rose-500' },
        emerald: { chart: '#10b981', iconBg: 'bg-emerald-500' },
        amber: { chart: '#f59e0b', iconBg: 'bg-amber-500' },
        sky: { chart: '#0ea5e9', iconBg: 'bg-sky-500' },
    };

    const chartData = [
        { v: 2 },
        { v: 5 },
        { v: 3 },
        { v: 6 },
        { v: 4 },
        { v: 7 },
        { v: 5 },
    ];

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${colorMap[color].iconBg}`}
                >
                    <Icon size={22} className="text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="mt-4">
                <p className="truncate text-sm font-medium text-gray-500">
                    {label}
                </p>
                <div className="mt-1 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <div className="h-8 w-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id={`stat-card-gradient-${color}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={colorMap[color].chart}
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={colorMap[color].chart}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="v"
                                    stroke={colorMap[color].chart}
                                    strokeWidth={2}
                                    fill={`url(#stat-card-gradient-${color})`}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SellerDashboard({
    seller,
    recentOrders: initialRecentOrders,
    salesData,
    topProducts = [],
}: Props) {
    const [orders, setOrders] = useState<Order[]>(initialRecentOrders || []);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'monthly' | 'daily'>('monthly');

    const confirmOrder = (id: number) => {
        setLoadingId(id);
        router.post(
            `/seller/orders/${id}/confirm`,
            {},
            {
                onSuccess: () => {
                    setOrders((prev) =>
                        prev.map((o) =>
                            o.order_id === id
                                ? { ...o, status: 'confirmed' }
                                : o,
                        ),
                    );
                },
                onError: () => {
                    // Optional: show toast notification
                },
                onFinish: () => setLoadingId(null),
            },
        );
    };

    const refresh = () => {
        setRefreshing(true);

        router.get(
            '/seller/dashboard',
            { period }, // Pass current period if backend supports filtering
            {
                onSuccess: (page: any) => {
                    const freshOrders = page.props?.recentOrders;

                    // Safe handling to fix the TypeScript error
                    if (Array.isArray(freshOrders)) {
                        setOrders(freshOrders as Order[]);
                    } else {
                        setOrders([]);
                    }
                },
                onError: () => {
                    console.error('Failed to refresh dashboard data');
                    // You can add a toast notification here later
                },
                onFinish: () => setRefreshing(false),
            },
        );
    };

    const statusStyle: Record<string, string> = {
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-violet-100 text-violet-700',
        completed: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    const statusTranslations: Record<string, string> = {
        confirmed: 'រង់ចាំតម្លៃដឹកជញ្ជូន',
        processing: 'រង់ចាំអតិថិជនទូទាត់',
        completed: 'ទូទាត់រួច',
        cancelled: 'បានលុបចោល',
    };
    const confirmedCount = orders.filter(
        (o) => o.status === 'confirmed',
    ).length;
    const orderCounts = {
        awaitingPayment: orders.filter(
            (o) => o.payment_status === 'unpaid' && o.status !== 'cancelled',
        ).length,
        completed: orders.filter((o) => o.payment_status === 'paid').length,
    };

    const getOrderStatusInfo = (order: Order) => {
        const statusKey = order.status.toLowerCase();

        if (order.payment_status === 'paid') {
            return {
                text: statusTranslations.completed, // 'ទូទាត់រួច'
                style: statusStyle.completed,
            };
        }

        // If unpaid, but the system status is 'completed', show 'processing'
        if (statusKey === 'completed' && order.payment_status === 'unpaid') {
            return {
                text: statusTranslations.processing, // 'រង់ចាំអតិថិជនទូទាត់'
                style: statusStyle.processing,
            };
        }

        // For all other unpaid statuses (confirmed, processing, cancelled)
        return {
            text:
                statusTranslations[statusKey] ||
                order.status.charAt(0).toUpperCase() + order.status.slice(1),
            style: statusStyle[statusKey] || 'bg-gray-100 text-gray-700',
        };
    };

    return (
        <AppLayout>
            <Head title="ផ្ទាំងគ្រប់គ្រងអ្នកលក់" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <h1 className="font-moul text-2xl text-gray-900">
                                    សូមស្វាគមន៍ {seller?.farm_name || 'អ្នកលក់'}
                                </h1>
                                <MessageCircleHeart
                                    size={28}
                                    className={refreshing ? 'animate-spin' : ''}
                                />
                            </div>

                            <p className="mt-1 text-gray-600">
                                អាសយដ្ឋាន៖{' '}
                                {seller?.full_location || 'មិនមានទីតាំង'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={refresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-70"
                            >
                                <RefreshCw
                                    size={18}
                                    className={refreshing ? 'animate-spin' : ''}
                                />
                                ធ្វើឡើងវិញ
                            </button>

                            <Link
                                href="/seller/product"
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                            >
                                <Plus size={18} />
                                បន្ថែមផលិតផល
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">


                        {/* 2. Active Products */}
                        <StatCard
                            icon={Package}
                            label="ផលិតផលកំពុងដាក់លក់"
                            value={`${seller.active_products_count || 0} ទំនិញ`}
                            color="sky"
                        />

                        {/* 3. Waiting for Shipping */}
                        <StatCard
                            icon={Truck}
                            label="រង់ចាំតម្លៃដឹកជញ្ជូន"
                            value={`${confirmedCount} ទំនិញ`}
                            color="amber"
                        />

                        {/* 4. Waiting for Payment */}
                        <StatCard
                            icon={MessageCircleHeart}
                            label="រង់ចាំអតិថិជនទូទាត់"
                            value={`${orderCounts.awaitingPayment} ទំនិញ`}
                            color="emerald"
                        />

                        {/* 5. Completed Payments */}
                        <StatCard
                            icon={CheckCircle}
                            label="ទូទាត់រួច"
                            value={`${orderCounts.completed} ទំនិញ`}
                            color="rose"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Sales Chart */}
                        <div className="lg:col-span-8">
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp
                                            className="text-emerald-600"
                                            size={28}
                                        />
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            តារាងនៃការលក់
                                        </h2>
                                    </div>

                                    <div className="flex rounded-lg border bg-gray-50 p-1">
                                        <button
                                            onClick={() => setPeriod('monthly')}
                                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                                                period === 'monthly'
                                                    ? 'bg-white shadow-sm'
                                                    : 'text-gray-500 hover:bg-white/70'
                                            }`}
                                        >
                                            30 ថ្ងៃចុងក្រោយ
                                        </button>
                                        {/* Add more periods if backend supports */}
                                    </div>
                                </div>

                                <div className="h-80 w-full">
                                    {salesData && salesData.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <AreaChart data={salesData}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorOrders"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f1f5f9"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: '#64748b',
                                                    }}
                                                />
                                                <YAxis
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: '#64748b',
                                                    }}
                                                />
                                                <Tooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="orders"
                                                    stroke="#10b981"
                                                    strokeWidth={3}
                                                    fill="url(#colorOrders)"
                                                    activeDot={{
                                                        r: 8,
                                                        stroke: '#10b981',
                                                        strokeWidth: 2,
                                                    }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-400">
                                            មិនមានទិន្នន័យការលក់នៅឡើយទេ
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="lg:col-span-4">
                            <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-6 shadow-md">
                                {/* Header */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        ផលិតផលពេញនិយម
                                    </h3>
                                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                                        លក់ដាច់ជាងគេ
                                    </span>
                                </div>

                                {/* Product List */}
                                <div className="space-y-4">
                                    {topProducts.length > 0 ? (
                                        topProducts.map((p, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-pink-200 hover:shadow-md"
                                            >
                                                {/* Left */}
                                                <div className="flex items-center gap-4">
                                                    {/* Ranking Badge */}
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                                                        #{i + 1}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {p.sold} ការបញ្ជាទិញ
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Revenue */}
                                                <p className="text-base font-bold text-emerald-600">
                                                    {Math.floor(
                                                        p.revenue,
                                                    ).toLocaleString()}{' '}
                                                    ៛
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl bg-white py-10 text-center text-gray-400 shadow-inner">
                                            មិនមានទិន្នន័យ
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Recent Orders */}
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-5">
                            <h2 className="font-moul text-2xl text-gray-900">
                                ការបញ្ជាទិញថ្មីៗ
                            </h2>
                            <Link
                                href="/seller/orders"
                                className="text-emerald-600 hover:underline"
                            >
                                មើលទាំងអស់ →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            លេខសម្គាល់
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            អតិថិជន
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            កាលបរិច្ឆេទ
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            សរុប
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            ស្ថានភាព
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                            សកម្មភាព
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {orders.length > 0 ? (
                                        orders.map((order) => {
                                            const statusInfo =
                                                getOrderStatusInfo(order);
                                            return (
                                                <tr
                                                    key={order.order_id}
                                                    className="transition-all hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                        #{order.order_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {order.order_date}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                        {typeof order.seller_total ===
                                                        'number'
                                                            ? `${order.seller_total.toLocaleString()} ៛`
                                                            : order.seller_total}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.style}`}
                                                        >
                                                            {statusInfo.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/seller/orders/${order.order_id}`}
                                                                className="rounded-lg bg-red-400 p-2 text-white transition hover:bg-red-300"
                                                            >
                                                                មើល
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-gray-500"
                                            >
                                                មិនមានការបញ្ជាទិញថ្មីៗទេ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
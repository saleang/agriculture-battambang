import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Cog,
    Eye,
    Landmark,
    Package,
    Plus,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Truck,
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

    const statusStyle = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            confirmed: 'bg-blue-100 text-blue-700',
            processing: 'bg-violet-100 text-violet-700',
            completed: 'bg-emerald-100 text-emerald-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const orderCounts = {
        processing: orders.filter((o) => o.status === 'processing').length,
        shipped: orders.filter((o) => o.status === 'delivered').length,
        completed: orders.filter((o) => o.status === 'completed').length,
    };

    return (
        <AppLayout>
            <Head title="ផ្ទាំងគ្រប់គ្រងអ្នកលក់" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                        <div>
                            <h1 className="font-moul text-3xl text-gray-900">
                                សួស្តី {seller?.farm_name || 'អ្នកលក់'} 👋
                            </h1>
                            <p className="mt-1 text-gray-600">
                                📍 {seller?.full_location || 'មិនមានទីតាំង'}
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            icon={Landmark}
                            label="ចំណូលសរុប"
                            value={`${Math.floor(seller.total_sales || 0).toLocaleString()} ៛`}
                        />
                        <StatCard
                            icon={Package}
                            label="ផលិតផលកំពុងដាក់លក់"
                            value={seller.active_products_count || 0}
                        />
                        <StatCard
                            icon={ShoppingCart}
                            label="ការបញ្ជាទិញកំពុងរង់ចាំ"
                            value={pendingCount}
                        />
                        <StatCard
                            icon={Cog}
                            label="កំពុងដំណើរការ"
                            value={orderCounts.processing}
                        />
                        <StatCard
                            icon={Truck}
                            label="បានដឹកជញ្ជូន"
                            value={orderCounts.shipped}
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="បានបញ្ចប់"
                            value={orderCounts.completed}
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
                                        Top Selling
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
                                        <th className="w-28 px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {orders.length > 0 ? (
                                        orders.map((o) => (
                                            <tr
                                                key={o.order_id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    #{o.order_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {o.customer_name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {o.order_date}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {Number(
                                                        o.seller_total,
                                                    ).toLocaleString()}{' '}
                                                    ៛
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                                                            o.status,
                                                        )}`}
                                                    >
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {o.status === 'pending' ? (
                                                        <button
                                                            onClick={() =>
                                                                confirmOrder(
                                                                    o.order_id,
                                                                )
                                                            }
                                                            disabled={
                                                                loadingId ===
                                                                o.order_id
                                                            }
                                                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                                        >
                                                            <CheckCircle
                                                                size={16}
                                                            />
                                                            បញ្ជាក់
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={`/seller/orders/${o.order_id}`}
                                                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                                                        >
                                                            <Eye size={16} />
                                                            មើល
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-16 text-center text-gray-400"
                                            >
                                                មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ
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

function StatCard({ icon: Icon, label, value }: any) {
    return (
        <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>

                <div className="rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-600">
                    <Icon
                        size={26}
                        className="text-emerald-600 group-hover:text-white"
                    />
                </div>
            </div>
        </div>
    );
}

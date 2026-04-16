import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Landmark,
    Package,
    ShoppingCart,
    Plus,
    RefreshCw,
    CheckCircle,
    Eye,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function SellerDashboard({
    seller,
    recentOrders: initialRecentOrders,
    salesData,
    topProducts = [],
}: any) {
    const [orders, setOrders] = useState(initialRecentOrders || []);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('monthly');

    const confirmOrder = (id: number) => {
        setLoadingId(id);
        router.post(
            `/seller/orders/${id}/confirm`,
            {},
            {
                onSuccess: () => {
                    setOrders((prev: any[]) =>
                        prev.map((o: any) =>
                            o.order_id === id ? { ...o, status: 'confirmed' } : o
                        )
                    );
                },
                onFinish: () => setLoadingId(null),
            }
        );
    };

    const refresh = () => {
        setRefreshing(true);
        router.get(
            '/seller/dashboard',
            {},
            {
                onSuccess: (page: any) => {
                    setOrders(page.props?.recentOrders || []);
                },
                onFinish: () => setRefreshing(false),
            }
        );
    };

    const statusStyle = (status: string) => {
        const map: any = {
            pending: 'bg-amber-100 text-amber-700',
            confirmed: 'bg-blue-100 text-blue-700',
            processing: 'bg-violet-100 text-violet-700',
            completed: 'bg-emerald-100 text-emerald-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const pendingCount = orders.filter((o: any) => o.status === 'pending').length;

    return (
        <AppLayout>
            <Head title="ផ្ទាំងគ្រប់គ្រងអ្នកលក់" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-6 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm">
                        <div>
                            <h1 className="text-3xl font-moul text-gray-900">
                                សួស្តី {seller?.farm_name || 'អ្នកលក់'} 👋
                            </h1>
                            <p className="text-gray-600 mt-1">
                                📍 {seller?.full_location || 'មិនមានទីតាំង'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={refresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                ធ្វើឱ្យស្រស់
                            </button>

                            <Link
                                href="/seller/product"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors"
                            >
                                <Plus size={18} />
                                បន្ថែមផលិតផល
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Sales Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="text-emerald-600" size={28} />
                                        <h2 className="text-xl font-semibold text-gray-800">តារាងនៃការលក់</h2>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setPeriod('monthly')}
                                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                period === 'monthly'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            30 ថ្ងៃចុងក្រោយ
                                        </button>
                                    </div>
                                </div>

                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesData}>
                                            <defs>
                                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="date" 
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                            />
                                            <Tooltip />
                                            <Area 
                                                type="monotone" 
                                                dataKey="orders" 
                                                stroke="#10b981" 
                                                strokeWidth={2} 
                                                fill="url(#colorOrders)"
                                                activeDot={{ r: 7 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b flex justify-between items-center">
                                    <h2 className="font-moul text-2xl text-gray-900">ការបញ្ជាទិញថ្មីៗ</h2>
                                    <Link href="/seller/orders" className="text-emerald-600 hover:underline">
                                        មើលទាំងអស់
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-4 text-left text-gray-500 font-medium">លេខសម្គាល់</th>
                                                <th className="p-4 text-left text-gray-500 font-medium">អតិថិជន</th>
                                                <th className="p-4 text-left text-gray-500 font-medium">កាលបរិច្ឆេទ</th>
                                                <th className="p-4 text-left text-gray-500 font-medium">សរុប</th>
                                                <th className="p-4 text-left text-gray-500 font-medium">ស្ថានភាព</th>
                                                <th className="p-4 w-24"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {orders.length > 0 ? (
                                                orders.map((o: any) => (
                                                    <tr key={o.order_id} className="hover:bg-gray-50">
                                                        <td className="p-4 font-medium">#{o.order_number}</td>
                                                        <td className="p-4">{o.customer_name}</td>
                                                        <td className="p-4 text-gray-600">{o.order_date}</td>
                                                        <td className="p-4 font-semibold">
                                                            {Number(o.seller_total).toLocaleString()} ៛
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(o.status)}`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            {o.status === 'pending' ? (
                                                                <button
                                                                    onClick={() => confirmOrder(o.order_id)}
                                                                    disabled={loadingId === o.order_id}
                                                                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-70"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    បញ្ជាក់
                                                                </button>
                                                            ) : (
                                                                <Link
                                                                    href={`/seller/orders/${o.order_id}`}
                                                                    className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
                                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                                        មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 space-y-6">
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

                            {/* Top Products */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-lg mb-5">ផលិតផលពេញនិយម</h3>
                                <div className="space-y-4">
                                    {topProducts.length > 0 ? (
                                        topProducts.map((p: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{p.name}</p>
                                                    <p className="text-xs text-gray-500">{p.sold} ការបញ្ជាទិញ</p>
                                                </div>
                                                <p className="font-semibold text-emerald-600">
                                                    {Math.floor(p.revenue).toLocaleString()} ៛
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 py-6 text-center">មិនមានទិន្នន័យ</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">{label}</p>
                    <p className="text-3xl font-semibold mt-2 text-gray-900">{value}</p>
                </div>
                <Icon size={28} className="text-gray-400" />
            </div>
        </div>
    );
}
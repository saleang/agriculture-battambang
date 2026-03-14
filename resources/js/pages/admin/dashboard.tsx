/** @jsxImportSource react */
// pages/admin/dashboard.tsx (កែសម្រួលពេញលេញ)
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Users, Package, ShoppingCart, TrendingUp, Shield, AlertCircle, CheckCircle, BarChart, DollarSign, Store, UserCheck, Clock, FileText } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
    total_users: number;
    total_sellers: number;
    total_customers: number;
    total_products: number;
    active_products: number;
    pending_approvals?: number;
    pending_orders?: number;
    total_revenue?: number;
}

interface RecentActivity {
    id: number;
    action: string;
    user: string;
    time: string;
    status: string;
    type: string;
}

interface RecentOrder {
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
}

interface PendingSeller {
    id: number;
    name: string;
    location: string;
    products: number;
    date: string;
}

export default function AdminDashboard({ stats, recentActivities, recentOrders, pendingSellers }: PageProps<{
    stats: AdminStats;
    recentActivities: RecentActivity[];
    recentOrders: RecentOrder[];
    pendingSellers: PendingSeller[]
}>) {

    // Provide defaults for props to prevent undefined errors
    const safeStats = {
        total_users: stats?.total_users ?? 0,
        total_sellers: stats?.total_sellers ?? 0,
        total_customers: stats?.total_customers ?? 0,
        total_products: stats?.total_products ?? 0,
        active_products: stats?.active_products ?? 0,
        pending_approvals: stats?.pending_approvals ?? 0,
        pending_orders: stats?.pending_orders ?? 0,
        total_revenue: stats?.total_revenue ?? 0,
    };

    const safeRecentActivities = recentActivities || [];
    const safeRecentOrders = recentOrders || [];
    const safePendingSellers = pendingSellers || [];

    // បម្លែងលុយទៅជាទ្រង់ទ្រាយ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('km-KH', {
            style: 'currency',
            currency: 'KHR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Helper to safely calculate percentage
    const safePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    // Dynamic calculations
    const activeProductsRate = safePercentage(safeStats.active_products, safeStats.total_products);
    const orderCompletionRate = safePercentage(safeStats.total_products - safeStats.pending_orders, safeStats.total_products);
    const userActivityRate = safePercentage(safeStats.total_customers, safeStats.total_users);


    return (
        <AppLayout>
            <Head title="ផ្ទាំងគ្រប់គ្រង - កសិផលខេត្តបាត់ដំបង" />

            {/* Add custom fonts */}
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet" />
                <style>{`
                    .font-moul { font-family: 'Moul', serif; }
                    .font-siemreap { font-family: 'Siemreap', sans-serif; }
                `}</style>
            </Head>

            <div className="space-y-6 py-6 px-4 sm:px-6 font-siemreap">
                {/* Header */}
                <div>
                    <h1 className="text-[#228B22] font-bold text-2xl md:text-3xl font-moul">ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង</h1>
                    <p className="text-gray-500 mt-2">សូមស្វាគមន៍ត្រឡប់មកវិញ! នេះជាអ្វីដែលកំពុងកើតឡើងនាពេលបច្ចុប្បន្ន។</p>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    {/* Total Users Card */}
                    <Card className="border-l-4 border-l-[#228B22] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">អ្នកប្រើប្រាស់សរុប</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{safeStats.total_users}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span className="text-xs text-green-600">+12% ពីសប្តាហ៍មុន</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-50 flex items-center justify-center">
                                    <Users className="text-[#228B22]" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Sellers Card */}
                    <Card className="border-l-4 border-l-[#32CD32] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">កសិករសរុប</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{safeStats.total_sellers}</p>
                                    <div className="mt-2">
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {safeStats.pending_approvals} រង់ចាំអនុម័ត
                                        </Badge>
                                    </div>
                                </div>
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-50 flex items-center justify-center">
                                    <Store className="text-[#32CD32]" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Products Card */}
                    <Card className="border-l-4 border-l-[#FFD700] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">ផលិតផលសរុប</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{safeStats.total_products}</p>
                                    <div className="mt-2">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {safeStats.active_products} សកម្ម
                                        </Badge>
                                    </div>
                                </div>
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                                    <Package className="text-[#FFD700]" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers Card */}
                    <Card className="border-l-4 border-l-[#90EE90] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">អតិថិជនសរុប</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{safeStats.total_customers}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <UserCheck className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs text-blue-600">សកម្ម 85%</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-50 flex items-center justify-center">
                                    <ShoppingCart className="text-[#90EE90]" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Card */}
                    <Card className="border-l-4 border-l-[#006400] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">ចំណូលសរុប</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{formatCurrency(safeStats.total_revenue)}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span className="text-xs text-green-600">+18% ពីខែមុន</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-50 flex items-center justify-center">
                                    <DollarSign className="text-[#006400]" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Charts & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Platform Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">ស្ថិតិប្រព័ន្ធ</CardTitle>
                                <CardDescription>ការវិភាគសកម្មភាពទូទៅ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Products Growth */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">អត្រាផលិតផលសកម្ម</span>
                                        <span className="text-sm font-bold text-green-600">{activeProductsRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: `${activeProductsRate}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{safeStats.active_products} នៃ {safeStats.total_products} ផលិតផលកំពុងសកម្ម</p>
                                </div>

                                {/* Order Completion */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">អត្រាបញ្ចប់ការបញ្ជាទិញ</span>
                                        <span className="text-sm font-bold text-green-600">{orderCompletionRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: `${orderCompletionRate}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">ការបញ្ជាទិញ {safeStats.pending_orders} នៅសល់</p>
                                </div>

                                {/* User Activity */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">សកម្មភាពអ្នកប្រើប្រាស់</span>
                                        <span className="text-sm font-bold text-green-600">សកម្ម {userActivityRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: `${userActivityRate}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">អ្នកប្រើប្រាស់សកម្មជាង 30 ថ្ងៃចុងក្រោយ</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">ការបញ្ជាទិញថ្មីៗ</CardTitle>
                                <CardDescription>ការបញ្ជាទិញចុងក្រោយចំនួន 5</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>លេខកូដ</TableHead>
                                            <TableHead>អតិថិជន</TableHead>
                                            <TableHead>ចំនួនទឹកប្រាក់</TableHead>
                                            <TableHead>ស្ថានភាព</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {safeRecentOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell className="font-bold text-green-600">{order.amount}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            order.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                        }
                                                    >
                                                        {order.status === 'completed' ? 'បានបញ្ចប់' :
                                                         order.status === 'processing' ? 'កំពុងដំណើរការ' : 'រង់ចាំ'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50">
                                    មើលការបញ្ជាទិញទាំងអស់
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right Column - Side Panels */}
                    <div className="space-y-6">
                        {/* Pending Approvals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">កសិកររង់ចាំអនុម័ត</CardTitle>
                                <CardDescription>{safeStats.pending_approvals} នាក់រង់ចាំការអនុម័ត</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {safePendingSellers.map((seller) => (
                                    <div key={seller.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                                        <div>
                                            <p className="font-medium">{seller.name}</p>
                                            <p className="text-sm text-gray-500">{seller.location}</p>
                                            <p className="text-xs text-gray-400 mt-1">{seller.products} ផលិតផល</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{seller.date}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 px-2">
                                                    <CheckCircle className="w-3 h-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-7 px-2">
                                                    <FileText className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50">
                                    មើលសំណើទាំងអស់
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">សកម្មភាពថ្មីៗ</CardTitle>
                                <CardDescription>ការជូនដំណឹងចុងក្រោយ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {safeRecentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            {activity.type === 'user' && <UserCheck className="w-4 h-4 text-blue-500" />}
                                            {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-green-500" />}
                                            {activity.type === 'product' && <Package className="w-4 h-4 text-yellow-500" />}
                                            {activity.type === 'security' && <Shield className="w-4 h-4 text-red-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: activity.action }}></p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
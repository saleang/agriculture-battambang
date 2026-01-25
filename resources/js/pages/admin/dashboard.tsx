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
    pending_approvals?: number;
    total_products?: number;
    pending_orders?: number;
    total_revenue?: number;
}

export default function AdminDashboard({ stats }: PageProps<{ stats: AdminStats }>) {

    // សកម្មភាពថ្មីៗ
    const recentActivities = [
        { 
            id: 1, 
            action: 'កសិករថ្មីបានចុះឈ្មោះ', 
            user: 'កសិករម៉ឹង',
            time: '៥ នាទីមុន',
            status: 'pending',
            type: 'seller'
        },
        { 
            id: 2, 
            action: 'ផលិតផលថ្មីត្រូវបានបញ្ចូល', 
            user: 'កសិករសុខា',
            time: '២០ នាទីមុន',
            status: 'approved',
            type: 'product'
        },
        { 
            id: 3, 
            action: 'ការបញ្ជាទិញត្រូវបានបញ្ចប់', 
            user: 'លោក សុភា',
            time: '៤០ នាទីមុន',
            status: 'completed',
            type: 'order'
        },
        { 
            id: 4, 
            action: 'ការកែប្រែព័ត៌មានកសិករ', 
            user: 'កសិករវ៉ាន់',
            time: '១ ម៉ោងមុន',
            status: 'updated',
            type: 'profile'
        },
        { 
            id: 5, 
            action: 'ផលិតផលត្រូវបានកែសម្រួល', 
            user: 'កសិកររតនា',
            time: '៣ ម៉ោងមុន',
            status: 'modified',
            type: 'product'
        },
    ];

    // ការបញ្ជាទិញថ្មីៗ
    const recentOrders = [
        { id: 'ORD-001', customer: 'លោក សុខ', amount: '៛65,000', status: 'completed', date: 'ថ្ងៃនេះ' },
        { id: 'ORD-002', customer: 'លោកស្រី មាស', amount: '៛42,500', status: 'pending', date: 'ថ្ងៃនេះ' },
        { id: 'ORD-003', customer: 'លោក វិជ្ជា', amount: '៛38,000', status: 'processing', date: 'ម្សិលមិញ' },
        { id: 'ORD-004', customer: 'លោក ស៊ុន', amount: '៛92,000', status: 'completed', date: 'ម្សិលមិញ' },
        { id: 'ORD-005', customer: 'លោកស្រី ស្រីពេជ្រ', amount: '៛21,500', status: 'pending', date: 'ម្សិលមិញ' },
    ];

    // កសិកររង់ចាំអនុម័ត
    const pendingSellers = [
        { id: 1, name: 'កសិករម៉ឹង', location: 'ឯកភ្នំ', products: 12, date: '២ ថ្ងៃមុន' },
        { id: 2, name: 'កសិករសុខា', location: 'បវេល', products: 8, date: '១ ថ្ងៃមុន' },
        { id: 3, name: 'កសិករវ៉ាន់', location: 'មោង', products: 15, date: 'ថ្ងៃនេះ' },
    ];

    // ទទួលបានតម្លៃ default
    const safeStats = {
        total_users: stats?.total_users || 0,
        total_sellers: stats?.total_sellers || 0,
        total_customers: stats?.total_customers || 0,
        pending_approvals: stats?.pending_approvals || 3,
        total_products: stats?.total_products || 245,
        pending_orders: stats?.pending_orders || 12,
        total_revenue: stats?.total_revenue || 18500000,
    };

    // បម្លែងលុយទៅជាទ្រង់ទ្រាយ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('km-KH', {
            style: 'currency',
            currency: 'KHR',
            minimumFractionDigits: 0
        }).format(amount);
    };

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                                        <span className="text-sm font-medium">ការរីកចម្រើនផលិតផល</span>
                                        <span className="text-sm font-bold text-green-600">+{safeStats.total_products}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">75% កើនឡើងពីខែមុន</p>
                                </div>

                                {/* Order Completion */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">អត្រាបញ្ចប់ការបញ្ជាទិញ</span>
                                        <span className="text-sm font-bold text-green-600">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: '92%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">ការបញ្ជាទិញ {safeStats.pending_orders} នៅសល់</p>
                                </div>

                                {/* User Activity */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">សកម្មភាពអ្នកប្រើប្រាស់</span>
                                        <span className="text-sm font-bold text-green-600">សកម្ម 85%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: '85%' }}></div>
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
                                        {recentOrders.map((order) => (
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
                                {pendingSellers.map((seller) => (
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
                                    មើលកសិករទាំងអស់
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* System Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">ស្ថានភាពប្រព័ន្ធ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>ម៉ាស៊ីនមេ</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">ដំណើរការ</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>មូលដ្ឋានទិន្នន័យ</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">ស្ថេរ</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>ការទូទាត់</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">ដំណើរការ</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>ប្រព័ន្ធសុវត្ថិភាព</span>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">ធានា</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#228B22] font-moul">ស្ថិតិរហ័ស</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-green-700">{safeStats.total_products}</p>
                                        <p className="text-sm text-gray-600">ផលិតផលសរុប</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-700">{safeStats.pending_orders}</p>
                                        <p className="text-sm text-gray-600">ការបញ្ជាទិញរង់ចាំ</p>
                                    </div>
                                </div>
                                <div className="text-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    ធ្វើបច្ចុប្បន្នភាព: {new Date().toLocaleDateString('km-KH')}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#228B22] font-moul">សកម្មភាពរហ័ស</CardTitle>
                        <CardDescription>គ្រប់គ្រងប្រព័ន្ធដោយរហ័ស</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <Button className="bg-[#228B22] hover:bg-[#1a6b1a] text-white h-auto py-3">
                                <Users className="w-4 h-4 mr-2" />
                                គ្រប់គ្រងអ្នកប្រើ
                            </Button>
                            <Button className="bg-[#32CD32] hover:bg-[#28a428] text-white h-auto py-3">
                                <Store className="w-4 h-4 mr-2" />
                                អនុម័តកសិករ
                            </Button>
                            <Button className="bg-[#006400] hover:bg-[#004d00] text-white h-auto py-3">
                                <BarChart className="w-4 h-4 mr-2" />
                                របាយការណ៍
                            </Button>
                            <Button className="bg-[#90EE90] hover:bg-[#7cd87c] text-gray-800 h-auto py-3">
                                <Shield className="w-4 h-4 mr-2" />
                                សុវត្ថិភាព
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#228B22] font-moul">សកម្មភាពថ្មីៗ</CardTitle>
                        <CardDescription>សកម្មភាពចុងក្រោយនៅលើប្រព័ន្ធ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                                    <div className={`p-2 rounded-full ${
                                        activity.type === 'seller' ? 'bg-blue-100' :
                                        activity.type === 'product' ? 'bg-green-100' :
                                        activity.type === 'order' ? 'bg-purple-100' : 'bg-yellow-100'
                                    }`}>
                                        {activity.type === 'seller' ? <Users className="w-4 h-4 text-blue-600" /> :
                                         activity.type === 'product' ? <Package className="w-4 h-4 text-green-600" /> :
                                         activity.type === 'order' ? <ShoppingCart className="w-4 h-4 text-purple-600" /> :
                                         <FileText className="w-4 h-4 text-yellow-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{activity.action}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm text-gray-500">{activity.user}</span>
                                            <Badge 
                                                variant="outline" 
                                                className={
                                                    activity.status === 'approved' ? 'border-green-200 text-green-700' :
                                                    activity.status === 'completed' ? 'border-blue-200 text-blue-700' :
                                                    activity.status === 'pending' ? 'border-yellow-200 text-yellow-700' :
                                                    'border-gray-200 text-gray-700'
                                                }
                                            >
                                                {activity.status === 'approved' ? 'បានអនុម័ត' :
                                                 activity.status === 'completed' ? 'បានបញ្ចប់' :
                                                 activity.status === 'pending' ? 'រង់ចាំ' : 'បានកែប្រែ'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
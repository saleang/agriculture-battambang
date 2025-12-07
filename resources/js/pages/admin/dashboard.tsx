// import AppLayout from '@/layouts/app-layout';
// import { Head } from '@inertiajs/react';
// import { PageProps } from '@/types';

// interface AdminStats {
//     total_users: number;
//     total_sellers: number;
//     total_customers: number;
// }

// export default function AdminDashboard({ stats }: PageProps<{ stats: AdminStats }>) {
//     return (
//         <AppLayout>
//             <div className="mb-6">
//                 <h2 className="text-xl font-semibold leading-tight text-gray-800">
//                     Admin Dashboard
//                 </h2>
//             </div>
//             <Head title="Admin Dashboard" />

//             <div className="py-12">
//                 <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
//                     <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
//                         <div className="p-6 text-gray-900">
//                             <h3 className="text-2xl font-bold mb-4">Welcome, Admin! 👋</h3>

//                             <div className="grid grid-cols-3 gap-6 mt-6">
//                                 <div className="bg-blue-50 p-6 rounded-lg">
//                                     <div className="text-3xl font-bold text-blue-600">
//                                         {stats.total_users}
//                                     </div>
//                                     <div className="text-gray-600">Total Users</div>
//                                 </div>
//                                 <div className="bg-green-50 p-6 rounded-lg">
//                                     <div className="text-3xl font-bold text-green-600">
//                                         {stats.total_sellers}
//                                     </div>
//                                     <div className="text-gray-600">Sellers</div>
//                                 </div>
//                                 <div className="bg-purple-50 p-6 rounded-lg">
//                                     <div className="text-3xl font-bold text-purple-600">
//                                         {stats.total_customers}
//                                     </div>
//                                     <div className="text-gray-600">Customers</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }

import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import {
    Card,
    CardContent,
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

interface AdminStats {
    total_users: number;
    total_sellers: number;
    total_customers: number;
}

export default function AdminDashboard({ stats }: PageProps<{ stats: AdminStats }>) {

    const recentActivities = [
        { id: 1, action: 'New seller registration request', time: '5 minutes ago' },
        { id: 2, action: 'User updated profile', time: '20 minutes ago' },
        { id: 3, action: 'Payment #2 processed successfully - $120.00', time: '40 minutes ago' },
        { id: 4, action: 'New product submitted by Seller A', time: '1 hour ago' },
        { id: 5, action: 'Inventory restocked for Product #30', time: '3 hours ago' },
    ];

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 py-10 px-6">

                <div>
                    <h1 className="text-[#228B22] font-bold text-3xl">Admin Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <Card className="border-l-4 border-l-[#228B22] shadow hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-xl font-bold">{stats.total_users}</p>
                                </div>
                                <Users className="text-[#228B22]" size={40} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#228B22] shadow hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Sellers</p>
                                    <p className="text-xl font-bold">{stats.total_sellers}</p>
                                </div>
                                <Package className="text-[#228B22]" size={40} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#228B22] shadow hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Customers</p>
                                    <p className="text-xl font-bold">{stats.total_customers}</p>
                                </div>
                                <ShoppingCart className="text-[#228B22]" size={40} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#32CD32] shadow hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Revenue</p>
                                    <p className="text-xl font-bold">$8,500</p>
                                </div>
                                <TrendingUp className="text-[#228B22]" size={40} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* STATUS SUMMARY SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Fake "Chart" using bars */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-[#228B22]">System Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div>
                                <p className="text-sm font-semibold">Platform Activity Trend</p>
                                <div className="mt-2 w-full bg-gray-200 h-3 rounded-md">
                                    <div className="h-3 bg-[#228B22] rounded-md w-[65%]"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">65% higher than last week</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Daily Completion Rate</p>
                                <div className="mt-2 w-full bg-gray-200 h-3 rounded-md">
                                    <div className="h-3 bg-[#32CD32] rounded-md w-[80%]"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">80% system tasks finished</p>
                            </div>

                        </CardContent>
                    </Card>

                    {/* USER ROLE SUMMARY */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-[#228B22]">User Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">

                                <li className="flex justify-between text-sm">
                                    <span>Customers</span>
                                    <span className="font-bold text-[#228B22]">{stats.total_customers}</span>
                                </li>

                                <li className="flex justify-between text-sm">
                                    <span>Sellers</span>
                                    <span className="font-bold text-[#228B22]">{stats.total_sellers}</span>
                                </li>

                                <li className="flex justify-between text-sm">
                                    <span>Admins</span>
                                    <span className="font-bold text-[#228B22]">1</span>
                                </li>

                            </ul>
                        </CardContent>
                    </Card>

                </div>

                {/* TABLE SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#228B22]">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recentActivities.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.action}</TableCell>
                                        <TableCell className="text-right text-gray-500">{item.time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </CardContent>
                </Card>

                {/* QUICK ACTIONS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#228B22]">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">Manage Users</Button>
                            <Button className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">View Reports</Button>
                            <Button className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">Approve Products</Button>
                            <Button className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">Payments Review</Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}

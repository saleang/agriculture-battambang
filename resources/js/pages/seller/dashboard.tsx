import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function SellerDashboard({ seller }: PageProps<{ seller: any }>) {
    // Mock data - replace with real data from your backend
    const stats = [
        {
            name: 'Total Sales',
            value: seller?.total_sales ? `$${parseFloat(seller.total_sales).toFixed(2)}` : '$0.00',
            change: '+12.5%',
            changeType: 'positive',
            icon: '💰',
        },
        {
            name: 'Active Products',
            value: '24',
            change: '+3',
            changeType: 'positive',
            icon: '📦',
        },
        {
            name: 'Average Rating',
            value: seller?.rating_average ? `${seller.rating_average}⭐` : 'No ratings',
            change: seller?.rating_count ? `${seller.rating_count} reviews` : '',
            changeType: 'neutral',
            icon: '⭐',
        },
        {
            name: 'Pending Orders',
            value: '8',
            change: '2 urgent',
            changeType: 'warning',
            icon: '🛒',
        },
    ];

    const recentOrders = [
        { id: '#1234', customer: 'John Doe', product: 'Organic Tomatoes', amount: '$45.00', status: 'Pending' },
        { id: '#1233', customer: 'Jane Smith', product: 'Fresh Lettuce', amount: '$28.50', status: 'Shipped' },
        { id: '#1232', customer: 'Bob Wilson', product: 'Farm Eggs', amount: '$15.00', status: 'Delivered' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getChangeColor = (type: string) => {
        switch (type) {
            case 'positive':
                return 'text-green-600';
            case 'warning':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout>
            <Head title="Seller Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {seller?.farm_name || 'Seller'}! 👋
                        </h1>
                        <p className="mt-1 text-gray-600">
                            📍 {seller?.location_district || 'Location not set'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm">
                            View Shop
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md">
                            + Add Product
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.name}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                    {stat.change && (
                                        <p className={`text-sm mt-2 font-medium ${getChangeColor(stat.changeType)}`}>
                                            {stat.change}
                                        </p>
                                    )}
                                </div>
                                <div className="text-4xl">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {order.customer}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {order.product}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {order.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                                    <span className="text-2xl">📦</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Manage Products</p>
                                        <p className="text-sm text-gray-500">Add or edit items</p>
                                    </div>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <p className="font-medium text-gray-900">View Analytics</p>
                                        <p className="text-sm text-gray-500">Sales reports</p>
                                    </div>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                                    <span className="text-2xl">💬</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Messages</p>
                                        <p className="text-sm text-gray-500">3 unread</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Shop Info */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Shop Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🏪</span>
                                    <div>
                                        <p className="text-sm text-gray-600">Shop Name</p>
                                        <p className="font-semibold text-gray-900">{seller?.farm_name || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900">{seller?.location_district || 'Not set'}</p>
                                    </div>
                                </div>
                                {seller?.certification && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">✅</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Certification</p>
                                            <p className="font-semibold text-gray-900">{seller.certification}</p>
                                        </div>
                                    </div>
                                )}
                                {seller?.description && (
                                    <div className="pt-3 border-t border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">About</p>
                                        <p className="text-sm text-gray-700">{seller.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

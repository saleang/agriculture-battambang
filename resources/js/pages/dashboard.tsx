import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ShoppingCart,
  Calendar
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

// Mock data for charts and stats
const statCards = [
  {
    title: 'Total Revenue',
    value: '$24,580',
    change: '+12.5%',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    title: 'Orders',
    value: '1,248',
    change: '+8.2%',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: 'Active Users',
    value: '892',
    change: '+5.7%',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    title: 'Products',
    value: '4,126',
    change: '+3.4%',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Smith', date: '2024-01-15', amount: '$245', status: 'Delivered' },
  { id: '#ORD-002', customer: 'Emma Johnson', date: '2024-01-14', amount: '$189', status: 'Processing' },
  { id: '#ORD-003', customer: 'Michael Chen', date: '2024-01-14', amount: '$312', status: 'Delivered' },
  { id: '#ORD-004', customer: 'Sarah Williams', date: '2024-01-13', amount: '$98', status: 'Pending' },
  { id: '#ORD-005', customer: 'David Lee', date: '2024-01-13', amount: '$456', status: 'Delivered' },
];

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {card.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {card.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {card.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts & Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Last 30 days performance
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
              <PlaceholderPattern className="absolute inset-0 size-full stroke-gray-200 dark:stroke-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">$24.5K</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total revenue this month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Latest customer orders
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{order.amount}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : order.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
              View all orders →
            </button>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Activity Overview
          </h3>
          <div className="relative min-h-[400px] overflow-hidden rounded-lg">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-gray-200 dark:stroke-gray-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Activity Tracking
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monitor user engagement, sales trends, and store performance in real-time.
                  Connect analytics tools for detailed insights.
                </p>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                  Connect Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Conversion Rate',
              value: '3.24%',
              description: 'Above average',
              trend: 'up',
            },
            {
              title: 'Avg. Order Value',
              value: '$89.42',
              description: 'Monthly growth',
              trend: 'up',
            },
            {
              title: 'Customer Satisfaction',
              value: '4.8/5',
              description: 'Based on 892 reviews',
              trend: 'stable',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {stat.title}
              </h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <div className="flex items-center text-sm">
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : stat.trend === 'down' ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1 transform rotate-180" />
                ) : (
                  <div className="w-4 h-4 mr-1" />
                )}
                <span className="text-gray-600 dark:text-gray-400">
                  {stat.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
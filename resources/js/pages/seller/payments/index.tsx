// resources/js/pages/seller/payments/index.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Payment {
    payment_id: string;
    order_id: string;
    order_date: string;
    customer_name: string;
    customer_phone: string;
    method: string;
    amount_received: number;
    transaction_id: string;
    status: 'completed' | 'pending' | 'refunded' | 'failed';
    payment_date: string | null;
    refund_amount: number | null;
}

interface PaginatedPayments {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface PaymentStatistics {
    total_earnings: number;
    pending_payouts: number;
    this_month_earnings: number;
    total_refunds: number;
    completed_count: number;
    pending_count: number;
    refunded_count: number;
}

interface Filters {
    search: string;
    status: string;
    method: string;
    date_from: string;
    date_to: string;
}

interface Props {
    payments: PaginatedPayments;
    statistics: PaymentStatistics;
    filters: Filters;
}

type PaymentStatus = 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'all' | 'KHQR' | 'manual(cash)' | 'bank_transfer' | 'mobile_banking';

const SellerPaymentManagement: React.FC<Props> = ({ payments, statistics, filters: initialFilters }) => {
    const [searchTerm, setSearchTerm] = useState<string>(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>((initialFilters.status as PaymentStatus) || 'all');
    const [methodFilter, setMethodFilter] = useState<PaymentMethod>((initialFilters.method as PaymentMethod) || 'all');
    const [dateFrom, setDateFrom] = useState<string>(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(initialFilters.date_to || '');

    const getStatusColor = (status: Payment['status']): string => {
        const colors: Record<Payment['status'], string> = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleSearch = () => {
        router.get('/seller/payments', {
            search: searchTerm,
            status: statusFilter,
            method: methodFilter,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setMethodFilter('all');
        setDateFrom('');
        setDateTo('');
        
        router.get('/seller/payments', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/seller/payments', {
            page,
            search: searchTerm,
            status: statusFilter,
            method: methodFilter,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleExport = () => {
        window.location.href = '/seller/payments/export?' + new URLSearchParams({
            search: searchTerm,
            status: statusFilter,
            method: methodFilter,
            date_from: dateFrom,
            date_to: dateTo
        }).toString();
    };

    return (
        <AppLayout>
            <Head title="Payment Management" />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">AgriMarket Battambang</h1>
                </div>

                {/* Dashboard Links */}
                <div className="flex flex-wrap gap-4 mb-8 text-blue-600">
                    <Link href="/seller/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="text-gray-400">-</span>
                    <Link href="/seller/profile" className="hover:underline">Profile Management</Link>
                    <span className="text-gray-400">-</span>
                    <Link href="/seller/product" className="hover:underline">Product Management</Link>
                    <span className="text-gray-400">-</span>
                    <Link href="/seller/orders" className="hover:underline">Order Processing</Link>
                </div>

                {/* Payment Management Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Management</h2>
                    <p className="text-gray-600">Track your earnings and manage payments</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <p className="text-gray-600 text-sm mb-2">Total Earnings</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(statistics.total_earnings)}</p>
                        <p className="text-sm text-gray-500 mt-2">{statistics.completed_count} completed payments</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-600 text-sm mb-2">Pending Payouts</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(statistics.pending_payouts)}</p>
                        <p className="text-sm text-gray-500 mt-2">{statistics.pending_count} pending payments</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <p className="text-gray-600 text-sm mb-2">This Month</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(statistics.this_month_earnings)}</p>
                        <p className="text-sm text-gray-500 mt-2">{new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <p className="text-gray-600 text-sm mb-2">Total Refunds</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(statistics.total_refunds)}</p>
                        <p className="text-sm text-gray-500 mt-2">{statistics.refunded_count} refunded orders</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by order ID or transaction ID..."
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Method Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value as PaymentMethod)}
                            >
                                <option value="all">All Methods</option>
                                <option value="KHQR">KHQR</option>
                                <option value="manual(cash)">Cash on Delivery</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="mobile_banking">Mobile Banking</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Refund
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-lg">No payments found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment) => (
                                        <tr 
                                            key={payment.payment_id} 
                                            className="hover:bg-gray-50 cursor-pointer transition"
                                            onClick={() => router.get(`/seller/payments/${payment.payment_id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                                                {payment.payment_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(payment.order_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                                                <div className="text-sm text-gray-500">{payment.customer_phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {payment.method}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(payment.amount_received)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                {payment.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(payment.payment_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {payment.refund_amount ? formatCurrency(payment.refund_amount) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.total > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(payments.current_page - 1) * payments.per_page + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(payments.current_page * payments.per_page, payments.total)}
                                </span>{' '}
                                of <span className="font-medium">{payments.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(payments.current_page - 1)}
                                    disabled={!payments.links.prev}
                                    className={`px-4 py-2 border rounded-lg ${
                                        payments.links.prev 
                                            ? 'hover:bg-gray-50 text-gray-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {payments.current_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(payments.current_page + 1)}
                                    disabled={!payments.links.next}
                                    className={`px-4 py-2 border rounded-lg ${
                                        payments.links.next 
                                            ? 'hover:bg-gray-50 text-gray-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Farmer Profile Link */}
                <div className="mt-8 text-right">
                    <Link href="/seller/farm-info" className="text-blue-600 hover:underline inline-flex items-center gap-2">
                        Farmer Profile
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
};

export default SellerPaymentManagement;
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

interface Props {
    payments: PaginatedPayments;
    statistics: PaymentStatistics;
    filters: any;
}

const SellerPaymentManagement: React.FC<Props> = ({ payments, statistics, filters: initialFilters }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
    const [methodFilter, setMethodFilter] = useState(initialFilters.method || 'all');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('km-KH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('km-KH', {
            minimumFractionDigits: 0
        }).format(Math.floor(amount)) + ' ៛';
    };

    const handleSearch = () => {
        router.get('/seller/payments', {
            search: searchTerm,
            status: statusFilter,
            method: methodFilter,
            date_from: dateFrom,
            date_to: dateTo
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setMethodFilter('all');
        setDateFrom('');
        setDateTo('');
        
        router.get('/seller/payments', {}, { preserveState: true, preserveScroll: true });
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
            <Head title="ការគ្រប់គ្រងការទូទាត់" />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-2xl text-gray-800 mb-2 font-moul">ការគ្រប់គ្រងការទូទាត់</h2>
                    <p className="text-gray-600">តាមដានចំណូល និងគ្រប់គ្រងការទូទាត់របស់អ្នក</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <p className="text-gray-600 text-sm">ចំណូលសរុប</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(statistics.total_earnings)}</p>
                        <p className="text-sm text-gray-500 mt-3">{statistics.completed_count} ប្រតិបត្តិការ</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-600 text-sm">ការទូទាត់មិនទាន់ទទួល</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(statistics.pending_payouts)}</p>
                        <p className="text-sm text-gray-500 mt-3">{statistics.pending_count} រង់ចាំ</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <p className="text-gray-600 text-sm">ចំណូលខែនេះ</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(statistics.this_month_earnings)}</p>
                        <p className="text-sm text-gray-500 mt-3">
                            {new Date().toLocaleString('km-KH', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <p className="text-gray-600 text-sm">ការបង្វិលសងសរុប</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(statistics.total_refunds)}</p>
                        <p className="text-sm text-gray-500 mt-3">{statistics.refunded_count} លើក</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ស្វែងរក</label>
                            <input
                                type="text"
                                placeholder="ស្វែងរតាមលេខបញ្ជាទិញ ឬលេខប្រតិបត្តិការ..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ពីថ្ងៃ</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ដល់ថ្ងៃ</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ស្ថានភាព</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">ទាំងអស់</option>
                                <option value="completed">បានបញ្ចប់</option>
                                <option value="pending">រង់ចាំ</option>
                                <option value="refunded">បានបង្វិលសង</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">វិធីសាស្ត្រទូទាត់</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                            >
                                <option value="all">ទាំងអស់</option>
                                <option value="KHQR">KHQR</option>
                                <option value="manual(cash)">សាច់ប្រាក់ពេលទទួល</option>
                                <option value="bank_transfer">ផ្ទេរប្រាក់តាមធនាគារ</option>
                                <option value="mobile_banking">ទូទាត់តាមកម្មវិធី</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleSearch}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                អនុវត្តតម្រង
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                កំណត់ឡើងវិញ
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                ទាញយក CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">លេខការទូទាត់</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">លេខបញ្ជាទិញ</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">កាលបរិច្ឆេទ</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">អតិថិជន</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">វិធីទូទាត់</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ទឹកប្រាក់</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">លេខប្រតិបត្តិការ</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ស្ថានភាព</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">កាលបរិច្ឆេទទូទាត់</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">បង្វិលសង</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-16 text-center text-gray-500">
                                            មិនមានការទូទាត់ទេ សូមព្យាយាមកែតម្រង
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment) => (
                                        <tr 
                                            key={payment.payment_id} 
                                            className="hover:bg-gray-50 cursor-pointer transition"
                                            onClick={() => router.get(`/seller/payments/${payment.payment_id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {payment.payment_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.order_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(payment.order_date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                                                <div className="text-sm text-gray-500">{payment.customer_phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.method}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(payment.amount_received)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                {payment.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                                                    {payment.status === 'completed' && 'បានបញ្ចប់'}
                                                    {payment.status === 'pending' && 'រង់ចាំ'}
                                                    {payment.status === 'refunded' && 'បានបង្វិលសង'}
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
                                បង្ហាញពី <span className="font-medium">{(payments.current_page - 1) * payments.per_page + 1}</span> ដល់{' '}
                                <span className="font-medium">
                                    {Math.min(payments.current_page * payments.per_page, payments.total)}
                                </span> នៃ <span className="font-medium">{payments.total}</span> លទ្ធផល
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get(payments.links.prev || '#')}
                                    disabled={!payments.links.prev}
                                    className={`px-4 py-2 border rounded-lg ${payments.links.prev ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    មុន
                                </button>
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {payments.current_page}
                                </span>
                                <button
                                    onClick={() => router.get(payments.links.next || '#')}
                                    disabled={!payments.links.next}
                                    className={`px-4 py-2 border rounded-lg ${payments.links.next ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    បន្ទាប់
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default SellerPaymentManagement;
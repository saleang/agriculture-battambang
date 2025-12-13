import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from '@/lib/route';
import { Search, Filter, Plus, Edit2, Trash2, MapPin, Calendar, Mail, Phone, Store } from 'lucide-react';
import { toast } from 'sonner';
interface Seller {
    user_id: number;
    username: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'banned';
    created_at: string;
    seller?: {
        farm_name: string;
        location_district: string;
    };
}

interface SellersPageProps extends PageProps {
    sellers: {
        data: Seller[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function SellersIndex({ sellers, filters }: SellersPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleSearch = () => {
        router.get(
            route('admin.sellers.index'),
            { search, status },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete seller "${name}"? This cannot be undone.`)) {
            router.delete(route('admin.sellers.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
            toast.success(`Seller "${name}" has been deleted successfully.`);
        },
        onError: (errors) => {
            toast.error('Failed to delete seller. Please try again.');
        },
            });
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            inactive: 'bg-slate-50 text-slate-700 border-slate-200',
            banned: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return colors[status as keyof typeof colors];
    };

    const getStatusDot = (status: string) => {
        const colors = {
            active: 'bg-emerald-500',
            inactive: 'bg-slate-400',
            banned: 'bg-rose-500',
        };
        return colors[status as keyof typeof colors];
    };

    // Calculate stats
    const totalSellers = sellers.data.length;
    const activeSellers = sellers.data.filter(s => s.status === 'active').length;
    const inactiveSellers = sellers.data.filter(s => s.status === 'inactive').length;
    const bannedSellers = sellers.data.filter(s => s.status === 'banned').length;

    return (
        <AppLayout>
            <Head title="Sellers Management" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sellers Management</h1>
                                <p className="text-slate-600">Manage and monitor all registered sellers</p>
                            </div>
                            <Link
                                href={route('admin.sellers.create')}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <Plus size={20} />
                                <span className="font-semibold">Add Seller</span>
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, or farm..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>

                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-medium transition-colors"
                                >
                                    Filter
                                </button>

                                <div className="flex bg-slate-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-4 py-2 rounded-lg transition-all ${
                                            viewMode === 'grid'
                                                ? 'bg-white shadow-sm text-slate-900'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-lg transition-all ${
                                            viewMode === 'list'
                                                ? 'bg-white shadow-sm text-slate-900'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Total Sellers</span>
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Store size={20} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{totalSellers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Active</span>
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{activeSellers}</div>
                            <p className="text-sm text-slate-500 mt-1">
                                {totalSellers > 0 ? Math.round((activeSellers / totalSellers) * 100) : 0}% of total
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Inactive</span>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{inactiveSellers}</div>
                            <p className="text-sm text-slate-500 mt-1">
                                {totalSellers > 0 ? Math.round((inactiveSellers / totalSellers) * 100) : 0}% of total
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Banned</span>
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{bannedSellers}</div>
                            <p className="text-sm text-slate-500 mt-1">
                                {totalSellers > 0 ? Math.round((bannedSellers / totalSellers) * 100) : 0}% of total
                            </p>
                        </div>
                    </div>

                    {/* Sellers Grid/List */}
                    {sellers.data.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No sellers found</h3>
                            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sellers.data.map((seller) => (
                                <div
                                    key={seller.user_id}
                                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(seller.status)}`}>
                                            <div className={`w-2 h-2 rounded-full ${getStatusDot(seller.status)}`}></div>
                                            {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={route('admin.sellers.edit', seller.user_id)}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(seller.user_id, seller.username)}
                                                className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{seller.username}</h3>
                                        <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-3">
                                            <Store size={16} />
                                            <span className="text-sm">{seller.seller?.farm_name}</span>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail size={16} className="text-slate-400" />
                                            <span className="truncate">{seller.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone size={16} className="text-slate-400" />
                                            <span>{seller.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span>{seller.seller?.location_district}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} />
                                        <span>Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Seller</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Farm</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {sellers.data.map((seller) => (
                                            <tr key={seller.user_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{seller.username}</div>
                                                        <div className="text-sm text-slate-600">{seller.email}</div>
                                                        <div className="text-sm text-slate-500">{seller.phone}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                                        <Store size={16} />
                                                        {seller.seller?.farm_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={16} className="text-slate-400" />
                                                        {seller.seller?.location_district}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(seller.status)}`}>
                                                        <div className={`w-2 h-2 rounded-full ${getStatusDot(seller.status)}`}></div>
                                                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('admin.sellers.edit', seller.user_id)}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(seller.user_id, seller.username)}
                                                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {sellers.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {sellers.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            link.active
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

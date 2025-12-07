import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import { Search, Plus, Edit2, Trash2, Mail, Phone, Store, Calendar, Shield, User as UserIcon, ShoppingCart } from 'lucide-react';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    created_at: string;
    seller?: {
        farm_name: string;
        location_district: string;
    };
}

interface PaginatedUsers {
    data: User[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export default function UserIndex({
    users,
    filters,
}: PageProps<{
    users: PaginatedUsers;
    filters: { search?: string; role?: string; status?: string };
}>) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedRole, setSelectedRole] = useState(filters.role || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const handleFilter = () => {
        router.get(
            route("admin.users.index"),
            {
                search,
                role: selectedRole,
                status: selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (userId: number, username: string) => {
        if (confirm(`Are you sure you want to delete user "${username}"?`)) {
            router.get(route("admin.users.destroy", userId), {
                preserveScroll: true,
            });
        }
    };

    const getRoleColor = (role: string) => {
        const colors = {
            admin: 'bg-purple-50 text-purple-700 border-purple-200',
            seller: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            customer: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return colors[role as keyof typeof colors] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getRoleDot = (role: string) => {
        const colors = {
            admin: 'bg-purple-500',
            seller: 'bg-emerald-500',
            customer: 'bg-blue-500',
        };
        return colors[role as keyof typeof colors] || 'bg-slate-400';
    };

    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'admin': return <Shield size={16} />;
            case 'seller': return <Store size={16} />;
            case 'customer': return <ShoppingCart size={16} />;
            default: return <UserIcon size={16} />;
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
    const totalUsers = users.data.length;
    const adminUsers = users.data.filter(u => u.role === 'admin').length;
    const sellerUsers = users.data.filter(u => u.role === 'seller').length;
    const customerUsers = users.data.filter(u => u.role === 'customer').length;
    const activeUsers = users.data.filter(u => u.status === 'active').length;

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
                                <p className="text-slate-600">Manage all users in the system</p>
                            </div>
                            <Link
                                href={route("admin.users.create")}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <Plus size={20} />
                                <span className="font-semibold">Add User</span>
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="seller">Seller</option>
                                    <option value="customer">Customer</option>
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>

                                <button
                                    onClick={handleFilter}
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Total Users</span>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                    <UserIcon size={20} className="text-slate-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Admins</span>
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <Shield size={20} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{adminUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Sellers</span>
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Store size={20} className="text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{sellerUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Customers</span>
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <ShoppingCart size={20} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{customerUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">Active</span>
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{activeUsers}</div>
                        </div>
                    </div>

                    {/* Users Grid/List */}
                    {users.data.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
                            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.data.map((user) => (
                                <div
                                    key={user.user_id}
                                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Role & Status Badges */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={route("admin.users.edit", user.user_id)}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.user_id, user.username)}
                                                className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{user.username}</h3>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                            <div className={`w-2 h-2 rounded-full ${getStatusDot(user.status)}`}></div>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail size={16} className="text-slate-400" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone size={16} className="text-slate-400" />
                                            <span>{user.phone}</span>
                                        </div>
                                        {user.seller && (
                                            <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                                <Store size={16} />
                                                <span className="truncate">{user.seller.farm_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} />
                                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {users.data.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{user.username}</div>
                                                        <div className="text-sm text-slate-600">{user.email}</div>
                                                        {user.seller && (
                                                            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                                <Store size={12} />
                                                                {user.seller.farm_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                                        <div className={`w-2 h-2 rounded-full ${getStatusDot(user.status)}`}></div>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route("admin.users.edit", user.user_id)}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.user_id, user.username)}
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
                    {users.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {users.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            link.active
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
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

// pages/admin/users/index.tsx (កែសម្រួលពេញលេញ)
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import { Search, Plus, Edit2, Trash2, Mail, Phone, Store, Calendar, Shield, User as UserIcon, ShoppingCart, Grid, List, Eye, Filter } from 'lucide-react';
import { toast } from "sonner";
// import '@/css/font.css';

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
        if (confirm(`តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើប្រាស់ "${username}" នេះមែនទេ?`)) {
            router.delete(route("admin.users.destroy", userId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`បានលុបអ្នកប្រើប្រាស់ "${username}" ដោយជោគជ័យ`);
                },
                onError: () => {
                    toast.error(`មិនអាចលុបអ្នកប្រើប្រាស់ "${username}" បានទេ`);
                }
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

    const getRoleLabel = (role: string) => {
        const labels = {
            admin: 'អ្នកគ្រប់គ្រង',
            seller: 'កសិករ',
            customer: 'អតិថិជន',
        };
        return labels[role as keyof typeof labels] || role;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            inactive: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            banned: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return colors[status as keyof typeof colors];
    };

    const getStatusDot = (status: string) => {
        const colors = {
            active: 'bg-emerald-500',
            inactive: 'bg-yellow-500',
            banned: 'bg-rose-500',
        };
        return colors[status as keyof typeof colors];
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            active: 'សកម្ម',
            inactive: 'មិនសកម្ម',
            banned: 'បានបិទ',
        };
        return labels[status as keyof typeof labels] || status;
    };

    // Calculate stats
    const totalUsers = users.data.length;
    const adminUsers = users.data.filter(u => u.role === 'admin').length;
    const sellerUsers = users.data.filter(u => u.role === 'seller').length;
    const customerUsers = users.data.filter(u => u.role === 'customer').length;
    const activeUsers = users.data.filter(u => u.status === 'active').length;

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('km-KH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="ការគ្រប់គ្រងអ្នកប្រើប្រាស់ - កសិផលខេត្តបាត់ដំបង" />
            
            {/* Add custom fonts
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet" />
                <style>{`
                    .font-moul { font-family: 'Moul', serif; }
                    .font-siemreap { font-family: 'Siemreap', sans-serif; }
                `}</style>
            </Head> */}

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-siemreap">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-moul">ការគ្រប់គ្រងអ្នកប្រើប្រាស់</h1>
                                <p className="text-slate-600">គ្រប់គ្រងអ្នកប្រើប្រាស់ទាំងអស់នៅក្នុងប្រព័ន្ធ</p>
                            </div>
                            <Link
                                href={route("admin.users.create")}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#228B22] to-[#32CD32] text-white rounded-xl hover:from-[#1a6b1a] hover:to-[#28a428] shadow-lg shadow-green-200 transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <Plus size={20} />
                                <span className="font-semibold">បន្ថែមអ្នកប្រើ</span>
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរកតាមឈ្មោះ, អ៊ីមែល, ឬលេខទូរស័ព្ទ..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:bg-white transition-all font-siemreap"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#228B22] cursor-pointer font-siemreap"
                                >
                                    <option value="">រាល់តួនាទី</option>
                                    <option value="admin">អ្នកគ្រប់គ្រង</option>
                                    <option value="seller">កសិករ</option>
                                    <option value="customer">អតិថិជន</option>
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#228B22] cursor-pointer font-siemreap"
                                >
                                    <option value="">រាល់ស្ថានភាព</option>
                                    <option value="active">សកម្ម</option>
                                    <option value="inactive">មិនសកម្ម</option>
                                    <option value="banned">បានបិទ</option>
                                </select>

                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-3 bg-[#228B22] text-white rounded-xl hover:bg-[#1a6b1a] font-medium transition-colors flex items-center gap-2"
                                >
                                    <Filter size={18} />
                                    តម្រង
                                </button>

                                <div className="flex bg-slate-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                            viewMode === 'grid'
                                                ? 'bg-white shadow-sm text-slate-900'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        <Grid size={16} />
                                        ទម្រង់ក្រឡា
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                            viewMode === 'list'
                                                ? 'bg-white shadow-sm text-slate-900'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        <List size={16} />
                                        ទម្រង់បញ្ជី
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">អ្នកប្រើសរុប</span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                    <UserIcon size={16} className="text-slate-600" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">អ្នកគ្រប់គ្រង</span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <Shield size={16} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{adminUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">កសិករ</span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Store size={16} className="text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{sellerUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">អតិថិជន</span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <ShoppingCart size={16} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{customerUsers}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 text-sm font-medium">សកម្ម</span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{activeUsers}</div>
                        </div>
                    </div>

                    {/* Users Grid/List */}
                    {users.data.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon size={24} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">រកមិនឃើញអ្នកប្រើ</h3>
                            <p className="text-slate-600">សូមសាកល្បងកែសម្រួលលក្ខខណ្ឌស្វែងរក ឬតម្រងរបស់អ្នក</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.data.map((user) => (
                                <div
                                    key={user.user_id}
                                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Role & Status Badges */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {getRoleLabel(user.role)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={route("admin.users.edit", user.user_id)}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="កែសម្រួល"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.user_id, user.username)}
                                                className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                title="លុប"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{user.username}</h3>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                            <div className={`w-2 h-2 rounded-full ${getStatusDot(user.status)}`}></div>
                                            {getStatusLabel(user.status)}
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
                                        <span>ចុះឈ្មោះ {formatDate(user.created_at)}</span>
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
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">អ្នកប្រើ</th>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">តួនាទី</th>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ស្ថានភាព</th>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ថ្ងៃចុះឈ្មោះ</th>
                                            <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">សកម្មភាព</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {users.data.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 sm:px-6 py-4">
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
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {getRoleLabel(user.role)}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                                        <div className={`w-2 h-2 rounded-full ${getStatusDot(user.status)}`}></div>
                                                        {getStatusLabel(user.status)}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route("admin.users.show", user.user_id)}
                                                            className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                            title="មើលព័ត៌មាន"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            href={route("admin.users.edit", user.user_id)}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="កែសម្រួល"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.user_id, user.username)}
                                                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                            title="លុប"
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
                            <div className="flex flex-wrap gap-2">
                                {users.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                            link.active
                                                ? 'bg-[#228B22] text-white shadow-lg shadow-green-200'
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
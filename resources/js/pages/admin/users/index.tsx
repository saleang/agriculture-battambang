// pages/admin/users/index.tsx
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/route';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Edit2,
    Filter,
    Grid,
    House,
    List,
    Mail,
    Phone,
    Plus,
    Search,
    Shield,
    ShoppingCart,
    Store,
    Trash2,
    User as UserIcon,
    Users2,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

// ── SweetAlert2 themed config matching the brand palette ──────────────────
const swal = Swal.mixin({
    customClass: {
        popup: '!rounded-2xl !shadow-2xl !border !border-slate-200 !font-[Kantumruy_Pro,sans-serif]',
        title: '!text-slate-900 !text-base !font-bold',
        htmlContainer: '!text-slate-600 !text-base',
        confirmButton:
            '!bg-rose-600 hover:!bg-rose-700 !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none',
        cancelButton:
            '!bg-white hover:!bg-slate-50 !border !border-slate-200 !text-slate-700 !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none',
    },
    buttonsStyling: false,
    reverseButtons: true,
});
const C = {
    bg: '#f9fafb',
    surface: '#ffffff',
    border: '#e5e7eb',
    border2: '#d1fae5',
    muted: '#9ca3af',
    sub: '#6b7280',
    text: '#374151',
    strong: '#111827',
    p: '#228B22',
    a: '#32CD32',
    gold: '#FFD700',
    goldD: '#ca8a04',
    light: '#90EE90',
    dark: '#006400',
    bgG: '#f0fdf4',
    bgY: '#fefce8',
    font: "'Kh os Battambang', sans-serif",
    display: "'Moul', serif",
    mono: "'JetBrains Mono', monospace",
};

const swalSuccess = Swal.mixin({
    customClass: {
        popup: '!rounded-2xl !shadow-xl !border !border-emerald-100 !font-[Kantumruy_Pro,sans-serif]',
        title: '!text-emerald-800 !text-base !font-bold',
        htmlContainer: '!text-emerald-700 !text-base',
        confirmButton:
            '!bg-[#228B22] hover:!bg-[#1a6b1a] !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none',
    },
    buttonsStyling: false,
    icon: 'success',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
});

// ── Types ──────────────────────────────────────────────────────────────────
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
        full_location?: string;
    };
}

interface PaginatedUsers {
    data: User[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface TotalStats {
    total_users: number;
    total_admins: number;
    total_sellers: number;
    total_customers: number;
    total_active: number;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function UserIndex({
    users,
    filters,
    totalStats,
}: PageProps<{
    users: PaginatedUsers;
    filters: { search?: string; role?: string; status?: string };
    totalStats: TotalStats;
}>) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const handleFilter = () => {
        router.get(
            route('admin.users.index'),
            { search, role: selectedRole, status: selectedStatus },
            { preserveState: true, replace: true },
        );
    };

    // ── Delete with SweetAlert2 confirm ─────────────────────────────────────
    const handleDelete = async (userId: number, username: string) => {
        const result = await swal.fire({
            icon: 'warning',
            title: 'លុបអ្នកប្រើប្រាស់?',
            html: `តើអ្នកប្រាកដជាចង់លុប <strong>${username}</strong> មែនទេ?<br/><span class="text-base text-slate-400 mt-1 block">សកម្មភាពនេះមិនអាចមានកថ្មីវិញបានទេ</span>`,
            showCancelButton: true,
            confirmButtonText: 'បាទ/ចាស លុប',
            cancelButtonText: 'បោះបង់',
        });

        if (!result.isConfirmed) return;

        const url = `/admin/users/${userId}/destroy`;

        router.post(
            url,
            {},
            {
                preserveState: false,
                preserveScroll: false,
                onSuccess: () => {
                    swalSuccess.fire({
                        title: 'បានលុបដោយជោគជ័យ!',
                        html: `អ្នកប្រើប្រាស់ <strong>${username}</strong> ត្រូវបានលុបចេញ`,
                    });
                },
                onError: () => {
                    swal.fire({
                        icon: 'error',
                        title: 'មិនអាចលុបបានទេ',
                        html: `មានបញ្ហាក្នុងការលុប <strong>${username}</strong>`,
                        showCancelButton: false,
                        confirmButtonText: 'យល់ព្រម',
                    });
                },
            },
        );
    };

    // ── Helpers ───────────────────────────────────────────────────────────
    const getRoleStyle = (role: string) =>
        ({
            admin: {
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                dot: 'bg-purple-500',
            },
            seller: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                dot: 'bg-emerald-500',
            },
            customer: {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                dot: 'bg-blue-500',
            },
        })[role] ?? {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            dot: 'bg-slate-400',
        };

    const getStatusStyle = (status: string) =>
        ({
            active: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                dot: 'bg-emerald-500',
            },
            inactive: {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                dot: 'bg-amber-500',
            },
            banned: {
                bg: 'bg-rose-50',
                text: 'text-rose-700',
                dot: 'bg-rose-500',
            },
        })[status] ?? {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            dot: 'bg-slate-400',
        };

    const getRoleIcon = (r: string) =>
        ({
            admin: <Shield size={14} />,
            seller: <Store size={14} />,
            customer: <ShoppingCart size={14} />,
        })[r] ?? <UserIcon size={14} />;

    const getRoleLabel = (r: string) =>
        ({ admin: 'អ្នកគ្រប់គ្រង', seller: 'កសិករ', customer: 'អតិថិជន' })[r] ??
        r;
    const getStatusLabel = (s: string) =>
        ({ active: 'សកម្ម', inactive: 'មិនសកម្ម', banned: 'បានបិទ' })[s] ?? s;
    const KM_MONTHS = [
        'មករា',
        'កុម្ភៈ',
        'មីនា',
        'មេសា',
        'ឧសភា',
        'មិថុនា',
        'កក្កដា',
        'សីហា',
        'កញ្ញា',
        'តុលា',
        'វិច្ឆិកា',
        'ធ្នូ',
    ];
    const formatDate = (d: string) => {
        const dt = new Date(d);
        return `${dt.getDate()} ${KM_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
    };

    return (
        <AppLayout>
            <Head title="ការគ្រប់គ្រងអ្នកប្រើប្រាស់" />

            <div className="min-h-screen bg-slate-50/70">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 11,
                                    background: `linear-gradient(135deg,${C.p},${C.dark})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Users2 size={20} color="#fff" />
                            </div>
                            <div>
                                {/* Big header — 24px */}
                                <h1
                                    style={{
                                        fontFamily: C.display,
                                        color: C.p,
                                        fontSize: 20,
                                        margin: 0,
                                    }}
                                >
                                    ការគ្រប់គ្រងអ្នកប្រើប្រាស់
                                </h1>
                                {/* Normal text — 14px */}
                                <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
                                    គ្រប់គ្រងគ្រប់អ្នកប្រើប្រាស់ទាំងអស់ក្នុងប្រព័ន្ធ
                                </p>
                            </div>
                        </div>

                        {/* Normal text — 16px */}
                        <Link
                            href={route('admin.users.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-green-700"
                        >
                            <Plus size={17} /> បន្ថែមអ្នកប្រើប្រាស់
                        </Link>
                    </div>

                    {/* ── Stats ── */}
                    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {[
                            { label: 'អ្នកប្រើសរុប',  value: totalStats.total_users,     icon: UserIcon,      color: 'text-gray-600' },
                            { label: 'អ្នកគ្រប់គ្រង', value: totalStats.total_admins,    icon: Shield,        color: 'text-purple-600' },
                            { label: 'កសិករ',          value: totalStats.total_sellers,   icon: Store,         color: 'text-emerald-600' },
                            { label: 'អតិថិជន',        value: totalStats.total_customers, icon: ShoppingCart,  color: 'text-blue-600' },
                            { label: 'សកម្ម',          value: totalStats.total_active,    icon: null,          color: 'text-emerald-600', dot: true },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    {/* Normal text — 16px */}
                                    <span className="text-[16px] font-medium text-gray-600">
                                        {s.label}
                                    </span>
                                    {s.icon && (
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 ${s.color}`}>
                                            <s.icon size={17} />
                                        </div>
                                    )}
                                    {s.dot && (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                        </div>
                                    )}
                                </div>
                                {/* Big text — 18px (stat numbers) */}
                                <div className="text-[18px] font-bold text-gray-900">
                                    {s.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filters ── */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={17} />
                                {/* Normal text — 16px */}
                                <input
                                    type="text"
                                    placeholder="ស្វែងរក ឈ្មោះ, អ៊ីមែល, លេខទូរស័ព្ទ..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-11 text-base transition focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {/* Normal text — 16px */}
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="min-w-[140px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">គ្រប់តួនាទី</option>
                                    <option value="admin">អ្នកគ្រប់គ្រង</option>
                                    <option value="seller">កសិករ</option>
                                    <option value="customer">អតិថិជន</option>
                                </select>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="min-w-[140px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">គ្រប់ស្ថានភាព</option>
                                    <option value="active">សកម្ម</option>
                                    <option value="inactive">មិនសកម្ម</option>
                                    <option value="banned">បានបិទ</option>
                                </select>
                                <button
                                    onClick={handleFilter}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-green-700 cursor-pointer"
                                >
                                    <Filter size={15} /> ស្វែងរក
                                </button>
                                {/* New Reset Button */}
            <button
                onClick={() => {
                    setSearch('');
                    setSelectedRole('');
                    setSelectedStatus('');
                    router.get(route('admin.users.index'), {}, { 
                        preserveState: true, 
                        replace: true 
                    });
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
            >
                <RefreshCw size={15} /> កំណត់ឡើងវិញ
            </button>
                                <div className="flex rounded-lg bg-gray-100 p-1 cursor-pointer">
                                    {(['list', 'grid'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`rounded-md px-3 py-1.5 text-base font-medium transition ${viewMode === mode ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {mode === 'list' ? (
                                                <><List size={14} className="mr-1 inline" />បញ្ជី</>
                                            ) : (
                                                <><Grid size={14} className="mr-1 inline" />ក្រឡា</>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Content ── */}
                    {users.data.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                            <UserIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            {/* Normal header — 22px */}
                            <h3 className="mb-2 text-[22px] font-semibold text-gray-800">
                                មិនមានអ្នកប្រើប្រាស់
                            </h3>
                            {/* Normal text — 16px */}
                            <p className="text-base text-gray-500">
                                សូមព្យាយាមកែប្រែលក្ខខណ្ឌស្វែងរក
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* ── Grid view ── */
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {users.data.map((user) => {
                                const rs = getRoleStyle(user.role);
                                const ss = getStatusStyle(user.status);
                                return (
                                    <div
                                        key={user.user_id}
                                        className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-green-200 hover:shadow-md"
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            {/* Normal text — 16px */}
                                            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-medium ${rs.bg} ${rs.text}`}>
                                                {getRoleIcon(user.role)}
                                                {getRoleLabel(user.role)}
                                            </div>
                                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Link
                                                    href={route('admin.users.edit', user.user_id)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                    title="កែប្រែ"
                                                >
                                                    <Edit2 size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.user_id, user.username)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                                    title="លុប"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Normal header — 22px for username */}
                                        <h3 className="mb-2 text-[16px] font-semibold text-gray-900">
                                            {user.username}
                                        </h3>

                                        {/* Normal text — 16px */}
                                        <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-medium ${ss.bg} ${ss.text}`}>
                                            <div className={`h-2 w-2 rounded-full ${ss.dot}`} />
                                            {getStatusLabel(user.status)}
                                        </div>

                                        {/* Normal text — 16px */}
                                        <div className="space-y-1.5 text-base text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="flex-shrink-0 text-gray-400" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="flex-shrink-0 text-gray-400" />
                                                <span>{user.phone || '—'}</span>
                                            </div>
                                            {user.seller && (
                                                <div className="flex items-center gap-2 font-medium text-emerald-600">
                                                    <Store size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{user.seller.farm_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Normal text — 16px */}
                                        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-base text-gray-400">
                                            <Calendar size={12} /> ចុះឈ្មោះ {formatDate(user.created_at)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ── List / Table view ── */
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            {[
                                                'អ្នកប្រើប្រាស់',
                                                'តួនាទី',
                                                'ស្ថានភាព',
                                                'ថ្ងៃចុះឈ្មោះ',
                                                'សកម្មភាព',
                                            ].map((h, i) => (
                                                <th
                                                    key={h}
                                                    /* Normal header — 22px for table column headers */
                                                    className={`px-6 py-3.5 text-[16px] font-semibold tracking-wider text-gray-500 uppercase ${i === 4 ? 'text-right' : 'text-left'}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.data.map((user) => {
                                            const rs = getRoleStyle(user.role);
                                            const ss = getStatusStyle(user.status);
                                            return (
                                                <tr
                                                    key={user.user_id}
                                                    className="transition-colors hover:bg-gray-50/60"
                                                >
                                                    <td className="px-6 py-4">
                                                        {/* Normal header — 22px for username in table */}
                                                        <div className="text-[16px] font-medium text-gray-900">
                                                            {user.username}
                                                        </div>
                                                        {/* Normal text — 16px */}
                                                        <div className="mt-0.5 text-base text-gray-500">
                                                            {user.email}
                                                        </div>
                                                        {user.seller && (
                                                            <div className="mt-1 flex items-center gap-1 text-base text-emerald-600">
                                                                <Store size={11} />
                                                                {user.seller.farm_name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Normal text — 16px */}
                                                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-base font-medium ${rs.bg} ${rs.text}`}>
                                                            {getRoleIcon(user.role)}
                                                            {getRoleLabel(user.role)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Normal text — 16px */}
                                                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-base font-medium ${ss.bg} ${ss.text}`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />
                                                            {getStatusLabel(user.status)}
                                                        </div>
                                                    </td>
                                                    {/* Normal text — 16px */}
                                                    <td className="px-6 py-4 text-base text-gray-500">
                                                        {formatDate(user.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Normal text — 16px */}
                                                            <Link
                                                                href={route('admin.users.edit', user.user_id)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-base font-medium text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                <Edit2 size={13} /> កែប្រែ
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(user.user_id, user.username)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-base font-medium text-rose-600 transition hover:bg-rose-100"
                                                            >
                                                                <Trash2 size={13} /> លុប
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {users.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                {users.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        /* Normal text — 16px */
                                        className={`px-4 py-2 text-base font-medium transition-colors ${
                                            link.active
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
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
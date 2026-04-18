/** @jsxImportSource react */
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Star, MessageSquare, Search, Trash2, ChevronDown } from 'lucide-react';
import type { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface RatingItem {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user: { id: number; name: string; avatar: string | null };
    farm: { id: number; name: string };
}

interface FarmSummary {
    farm_id: number;
    farm_name: string;
    total_ratings: number;
    average_rating: number;
}

interface Props extends PageProps {
    ratings: RatingItem[];
    farmSummaries: FarmSummary[];
    totalRatings: number;
    averageRating: number;
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                    fill={i <= rating ? 'currentColor' : 'none'}
                />
            ))}
        </div>
    );
}

function getImageUrl(url: string | null | undefined): string {
    if (!url) return 'https://placehold.co/80x80?text=U';
    if (url.startsWith('http')) return url;
    return `/storage/${url.startsWith('/') ? url.substring(1) : url}`;
}

export default function AdminRatings({
    ratings,
    farmSummaries,
    totalRatings,
    averageRating,
}: Props) {
    const [search, setSearch] = useState('');
    const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
    const [filterStar, setFilterStar] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'farms'>('all');

    const filtered = ratings.filter((r) => {
        const matchFarm = selectedFarm ? r.farm.id === selectedFarm : true;
        const matchStar = filterStar ? r.rating === filterStar : true;
        const matchSearch =
            search === '' ||
            r.user.name.toLowerCase().includes(search.toLowerCase()) ||
            r.farm.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.comment ?? '').toLowerCase().includes(search.toLowerCase());
        return matchFarm && matchStar && matchSearch;
    });

    const handleDelete = (id: number) => {
        if (confirm('តើអ្នកពិតជាចង់លុបការវាយតម្លៃនេះមែនទេ?')) {
            router.delete(`/admin/ratings/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
        <div className="min-h-screen bg-gray-50">
            <Head title="ការគ្រប់គ្រងការវាយតម្លៃ" />

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="h-7 w-7 text-amber-500" />
                        ការគ្រប់គ្រងការវាយតម្លៃ
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        មើល និងគ្រប់គ្រងការវាយតម្លៃទាំងអស់ពីអតិថិជន
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-medium text-gray-500">មតិសរុប</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{totalRatings}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-medium text-gray-500">ជាមធ្យម</p>
                        <p className="mt-1 text-3xl font-bold text-amber-500">
                            {averageRating || '–'}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-medium text-gray-500">កសិដ្ឋានទាំងអស់</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">
                            {farmSummaries.length}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-medium text-gray-500">5 ★</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                            {ratings.filter((r) => r.rating === 5).length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 rounded-xl bg-white border border-gray-100 shadow-sm p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                            activeTab === 'all'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        មតិទាំងអស់
                    </button>
                    <button
                        onClick={() => setActiveTab('farms')}
                        className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                            activeTab === 'farms'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        សង្ខេបតាមកសិដ្ឋាន
                    </button>
                </div>

                {activeTab === 'farms' ? (
                    /* Farm Summary Table */
                    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">
                                សង្ខេបការវាយតម្លៃតាមកសិដ្ឋាន
                            </h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 font-medium text-gray-500">
                                        ឈ្មោះកសិដ្ឋាន
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-center">
                                        ចំនួនមតិ
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-center">
                                        ជាមធ្យម
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {farmSummaries.map((f) => (
                                    <tr key={f.farm_id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {f.farm_name}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {f.total_ratings}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                                                <Star className="h-4 w-4" fill="currentColor" />
                                                {f.average_rating}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedFarm(f.farm_id);
                                                    setActiveTab('all');
                                                }}
                                                className="text-xs text-green-600 hover:underline font-medium"
                                            >
                                                មើលមតិ →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* All Ratings */
                    <>
                        {/* Filters */}
                        <div className="mb-4 flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរក..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                                />
                            </div>

                            <select
                                value={selectedFarm ?? ''}
                                onChange={(e) =>
                                    setSelectedFarm(e.target.value ? Number(e.target.value) : null)
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                            >
                                <option value="">កសិដ្ឋានទាំងអស់</option>
                                {farmSummaries.map((f) => (
                                    <option key={f.farm_id} value={f.farm_id}>
                                        {f.farm_name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-1">
                                {[5, 4, 3, 2, 1].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() =>
                                            setFilterStar(filterStar === s ? null : s)
                                        }
                                        className={`rounded-lg px-3 py-2 text-xs font-medium transition flex items-center gap-1 ${
                                            filterStar === s
                                                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
                                        }`}
                                    >
                                        {s}
                                        <Star className="h-3 w-3" fill="currentColor" />
                                    </button>
                                ))}
                            </div>

                            {(selectedFarm || filterStar || search) && (
                                <button
                                    onClick={() => {
                                        setSelectedFarm(null);
                                        setFilterStar(null);
                                        setSearch('');
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    លុបតម្រង
                                </button>
                            )}
                        </div>

                        <p className="mb-3 text-sm text-gray-500">
                            បង្ហាញ {filtered.length} / {totalRatings} មតិ
                        </p>

                        {/* Ratings Table */}
                        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                            {filtered.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left">
                                            <th className="px-6 py-3 font-medium text-gray-500">
                                                អតិថិជន
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500">
                                                កសិដ្ឋាន
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500">
                                                ការវាយតម្លៃ
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500">
                                                មតិ
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500">
                                                កាលបរិច្ឆេទ
                                            </th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={getImageUrl(r.user.avatar)}
                                                            alt={r.user.name}
                                                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                                        />
                                                        <span className="font-medium text-gray-900 truncate max-w-32">
                                                            {r.user.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                        {r.farm.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StarDisplay rating={r.rating} />
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="truncate text-gray-600">
                                                        {r.comment || (
                                                            <span className="italic text-gray-400">
                                                                គ្មានមតិ
                                                            </span>
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    {new Date(r.created_at).toLocaleDateString(
                                                        'km-KH',
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(r.id)}
                                                        className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50"
                                                        title="លុបការវាយតម្លៃ"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-16 text-center text-gray-400">
                                    <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-30" />
                                    <p>រកមិនឃើញការវាយតម្លៃ</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
        </AppLayout>
    );
}
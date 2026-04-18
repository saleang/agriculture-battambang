/** @jsxImportSource react */
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Star, MessageSquare, TrendingUp, User } from 'lucide-react';
import type { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface RatingUser {
    id: number;
    name: string;
    avatar: string | null;
}

interface RatingItem {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user: RatingUser;
}

interface Props extends PageProps {
    ratings: RatingItem[];
    averageRating: number;
    totalRatings: number;
    ratingCounts: Record<string, number>;
    farmName: string;
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const sz = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${sz} ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}
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

export default function SellerReviews({
    ratings,
    averageRating,
    totalRatings,
    ratingCounts,
    farmName,
}: Props) {
    const [filterRating, setFilterRating] = useState<number | null>(null);

    const filtered = filterRating
        ? ratings.filter((r) => r.rating === filterRating)
        : ratings;

    const pct = (star: number) => {
        if (totalRatings === 0) return 0;
        return Math.round(((ratingCounts[star] ?? 0) / totalRatings) * 100);
    };

    return (
        <AppLayout>
        <div className="min-h-screen bg-gray-50">
            <Head title={`ការវាយតម្លៃ `} />

            <div className="mx-auto max-w-5xl px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-green-600" />
                        ការវាយតម្លៃ
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        មតិយោបល់ និងការវាយតម្លៃពីអតិថិជនរបស់អ្នក
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {/* Average Rating */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">ការវាយតម្លៃជាមធ្យម</p>
                        <p className="text-5xl font-bold text-amber-500">{averageRating || '–'}</p>
                        <div className="mt-2">
                            <StarDisplay rating={Math.round(averageRating)} size="lg" />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">ពី {totalRatings} មតិ</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:col-span-2">
                        <p className="text-sm font-medium text-gray-500 mb-4">ការចែកចាយការវាយតម្លៃ</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <button
                                    key={star}
                                    onClick={() =>
                                        setFilterRating(filterRating === star ? null : star)
                                    }
                                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-50 ${filterRating === star ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
                                >
                                    <span className="w-6 text-right text-sm font-medium text-gray-700">
                                        {star}
                                    </span>
                                    <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                                    <div className="flex-1 rounded-full bg-gray-100 h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-amber-400 transition-all"
                                            style={{ width: `${pct(star)}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-xs text-gray-500">
                                        {ratingCounts[star] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {filterRating && (
                            <button
                                onClick={() => setFilterRating(null)}
                                className="mt-3 text-xs text-green-600 hover:underline"
                            >
                                ✕ លុបតម្រង
                            </button>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">
                            {filterRating
                                ? `ការវាយតម្លៃ ${filterRating} ★ (${filtered.length})`
                                : `មតិទាំងអស់ (${totalRatings})`}
                        </h2>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((r) => (
                                <div key={r.id} className="flex gap-4 px-6 py-5">
                                    <img
                                        src={getImageUrl(r.user.avatar)}
                                        alt={r.user.name}
                                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-medium text-gray-900 truncate">
                                                {r.user.name}
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {new Date(r.created_at).toLocaleDateString('km-KH')}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <StarDisplay rating={r.rating} />
                                        </div>
                                        {r.comment && (
                                            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                                {r.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-gray-400">
                            <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-30" />
                            <p>មិនទាន់មានការវាយតម្លៃ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </AppLayout>
    );
}
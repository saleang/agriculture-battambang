/** @jsxImportSource react */
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { MapPin, Briefcase, DollarSign, Users } from 'lucide-react';

import { Header } from './header';
import { Footer } from './customer/footer-customer';
import type { PageProps } from '@/types';

interface Seller {
    seller_id: number;
    farm_name: string;
    description: string | null;
    full_location: string;
    rating_average: number | null;
    rating_count: number;
    followers_count: number;
    user: {
        photo: string | null;
    };
    /**
     * Represents whether the current authenticated user is following this seller.
     * This should be provided by the backend.
     */
    is_followed?: boolean;
}

interface FarmersPageProps extends PageProps {
    sellers: Seller[];
}

export default function Farmers({ sellers: initialSellers, auth }: FarmersPageProps) {
    const user = auth?.user ?? null;
    const [searchQuery, setSearchQuery] = useState('');
    const [sellers, setSellers] = useState(initialSellers);

    const filteredSellers = sellers.filter(seller =>
        seller.farm_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getImageUrl = (url: string | null | undefined): string => {
        if (!url) return 'https://via.placeholder.com/150?text=កសិដ្ឋាន';
        if (url.startsWith('http')) return url;
        return `/storage/${url.startsWith('/') ? url.substring(1) : url}`;
    };

    const handleFollowToggle = async (e: React.MouseEvent, sellerId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.visit('/login');
            return;
        }

        // Find the original seller to revert to in case of an error
        const originalSellers = [...sellers];
        const sellerIndex = sellers.findIndex(s => s.seller_id === sellerId);
        if (sellerIndex === -1) return;

        const seller = sellers[sellerIndex];
        const originalIsFollowed = seller.is_followed;
        const originalFollowersCount = seller.followers_count;

        // Optimistic UI update
        const updatedSellers = [...sellers];
        updatedSellers[sellerIndex] = {
            ...seller,
            is_followed: !originalIsFollowed,
            followers_count: originalIsFollowed
                ? originalFollowersCount - 1
                : originalFollowersCount + 1,
        };
        setSellers(updatedSellers);

        try {
            // The endpoint from FarmDetail.tsx uses 'farms'
            const response = await axios.post(`/farms/toggle-follow/${sellerId}`);

            // Update with authoritative data from server
            const { isFollowing, followersCount } = response.data;
            const finalSellers = [...sellers];
            const finalSellerIndex = finalSellers.findIndex(s => s.seller_id === sellerId);
            if (finalSellerIndex !== -1) {
                finalSellers[finalSellerIndex] = {
                    ...finalSellers[finalSellerIndex],
                    is_followed: isFollowing,
                    followers_count: followersCount,
                };
                setSellers(finalSellers);
            }
        } catch (error) {
            console.error('Follow toggle failed:', error);
            // Revert on error
            setSellers(originalSellers);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="ហាង/កសិករ - កសិផលខេត្តបាត់ដំបង" />

            <Header
                isAuthenticated={!!user}
                userName={user?.username ?? ''}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="mx-auto max-w-7xl px-4 py-47 lg:px-5">
                {/* Grid - 2 columns on mobile, 3 on tablet, stays responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSellers.length > 0 ? (
                        filteredSellers.map((seller) => (
                            <Link
                                key={seller.seller_id}
                                href={`/farm/${seller.seller_id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
                            >
                                <div className="p-6 flex gap-5">
                                    {/* Circular Avatar */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={getImageUrl(seller.user.photo)}
                                            alt={seller.farm_name}
                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Name + Status Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                {seller.farm_name}
                                            </h3>

                                            <button
                                                onClick={(e) => handleFollowToggle(e, seller.seller_id)}
                                                className={`px-6 py-1 text-sm font-medium rounded-full text-white whitespace-nowrap ${
                                                    seller.is_followed ? 'bg-gray-500' : 'bg-red-500'
                                                }`}
                                            >
                                                {seller.is_followed ? 'ឈប់តាមដាន' : 'តាមដាន'}
                                            </button>
                                        </div>

                                        {/* Job Title / Role (you can adjust this) */}
                                        <p className="text-green-600 font-medium mt-1 text-sm">
                                            កសិករ / ផលិតករ
                                        </p>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            <span>{seller.full_location}</span>
                                        </div>

                                        {/* Experience + Followers (adapted from your data) */}
                                        <div className="flex items-center justify-between mt-6 text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span>{seller.followers_count} អ្នកតាមដាន</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom border accent */}
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-xl text-gray-500">
                                រកមិនឃើញកសិករ សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
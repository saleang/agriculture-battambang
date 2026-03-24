/** @jsxImportSource react */
import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Star, MapPin, BookOpen } from 'lucide-react';

import { Header } from './header';
import { Footer } from './customer/footer-customer';
import type { PageProps } from '@/types';

interface Seller {
    seller_id: number;
    farm_name: string;
    description: string | null;
    location_district: string;
    rating_average: number;
    rating_count: number;
    user: {
        photo_url: string | null;
    };
}

interface FarmersPageProps extends PageProps {
    sellers: Seller[];
}

export default function Farmers({ sellers, auth }: FarmersPageProps) {
    const user = auth?.user ?? null;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSellers = sellers.filter(seller =>
        seller.farm_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
                {halfStar && <Star key="half" className="h-4 w-4 text-yellow-400" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
                ))}
            </>
        );
    };

    return (
        <div className="font-siemreap min-h-screen bg-gray-50">
            <Head title="ហាង/កសិករ - កសិផលខេត្តបាត់ដំបង" />
            <Header
                isAuthenticated={!!user}
                userName={user?.username ?? ''}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h1 className="font-moul text-4xl font-bold text-gray-900">
                        ហាង និងកសិករដៃគូ
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        ស្វែងរក និងគាំទ្រកសិករក្នុងស្រុកដែលបានចុះបញ្ជីជាមួយយើង
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSellers.map((seller) => (
                        <Link
                            key={seller.seller_id}
                            href={`/farm/${seller.seller_id}`}
                            className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-green-300 hover:shadow-lg"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={seller.user.photo_url || 'https://via.placeholder.com/400?text=គ្មានរូបភាព'}
                                    alt={seller.farm_name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="font-moul text-xl font-bold text-gray-900 truncate">
                                    {seller.farm_name}
                                </h2>

                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span>{seller.location_district}</span>
                                </div>

                                <div className="mt-3 flex items-center gap-1">
                                    {renderStars(seller.rating_average)}
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({seller.rating_count} ការវាយតម្លៃ)
                                    </span>
                                </div>

                                <p className="mt-4 text-sm text-gray-600 line-clamp-2 h-10">
                                    {seller.description || 'មិនមានការពិពណ៌នា'}
                                </p>

                                <div className="mt-6 flex items-center justify-end">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 transition-colors group-hover:text-green-700">
                                        មើលហាង
                                        <BookOpen className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
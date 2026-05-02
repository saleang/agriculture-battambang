/** @jsxImportSource react */
import type { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    Facebook,
    Heart, // <-- Add Heart icon
    Mail,
    MessageCircle,
    MessageSquare,
    Phone,
    Send,
    ShoppingBag,
    Star,
    User,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { route } from '@/lib/route';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { useCart } from './customer/orders/cart-context'; // <-- Import useCart
import { Footer } from './customer/footer-customer';
import { Header } from './header';

// ... (rest of the file is the same until the component)

// ────────────────────────────────────────────────
// Interfaces (extended for contact)
interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    images: { image_url: string }[];
}

interface Farm {
    id: number;
    farm_name: string;
    description: string;
    full_location: string;
    user: {
        photo: string;
        email: string;
        phone: string;
    };
    products: Product[];
    // Add these if your backend sends them (or make optional)
    facebook?: string | null;
    telegram?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
    // ... add more channels as needed (email, website, etc.)
}

interface Rating {
    id: number;
    user: {
        id: number;
        name: string;
        avatar: string;
    };
    rating: number;
    comment: string;
    created_at: string;
}

interface Props extends PageProps {
    farm: Farm;
    ratings: Rating[];
    isFollowing: boolean;
    followersCount: number;
    wishlistedProductIds?: number[];
    canReview: boolean;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

export default function FarmDetail({
    auth,
    farm,
    ratings,
    isFollowing: initialIsFollowing,
    followersCount: initialFollowersCount,
    wishlistedProductIds = [],
    canReview,
}: Props) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followersCount, setFollowersCount] = useState(initialFollowersCount);
    const [activeTab, setActiveTab] = useState<
        'products' | 'reviews' | 'contact'
    >('products');
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState<Set<number>>(
        new Set(wishlistedProductIds),
    );
    const [sortOrder, setSortOrder] = useState<
        'default' | 'price-asc' | 'price-desc'
    >('default');

    const handleSort = (order: 'price-asc' | 'price-desc') => {
        setSortOrder(order);
    };

    // This is the crucial fix.
    // This effect will run every time the `wishlistedProductIds` prop changes,
    // which happens when you navigate from one farm page to another.
    // It ensures the `wishlist` state is always in sync with the current farm's data.
    useEffect(() => {
        setWishlist(new Set(wishlistedProductIds));
    }, [wishlistedProductIds]);


    useEffect(() => {
        const handleFollowChange = (event: CustomEvent) => {
            const { farmId, isFollowing, followersCount } = event.detail;
            if (farm.id === farmId) {
                setIsFollowing(isFollowing);
                setFollowersCount(followersCount);
            }
        };

        window.addEventListener(
            'follow-status-changed',
            handleFollowChange as EventListener,
        );

        return () => {
            window.removeEventListener(
                'follow-status-changed',
                handleFollowChange as EventListener,
            );
        };
    }, [farm.id]);


        const {
        data,
        setData,
        post,
        delete: deleteRating,
        processing,
        errors,
        reset,
    } = useForm({
        rating: 0,
        comment: '',
    });

    const handleDelete = (ratingId: number) => {
        if (confirm('តើអ្នកពិតជាចង់លុបមតិនេះមែនទេ?')) {
            deleteRating(route('ratings.destroy', { rating: ratingId }), {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Delete rating error:', errors);
                },
            });
        }
    };

    const handleRatingSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Manually construct the URL to bypass any potential Ziggy caching issues.
        post(`/farms/${farm.id}/ratings`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('rating', 'comment');
            },
            onError: (err) => {
                console.error('Rating submission error:', err);
            },
        });
    };

    const handleFollowToggle = async () => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }

        const originalIsFollowing = isFollowing;
        const originalFollowersCount = followersCount;

        // Optimistic UI update
        setIsFollowing(!originalIsFollowing);
        setFollowersCount(
            originalIsFollowing
                ? originalFollowersCount - 1
                : originalFollowersCount + 1,
        );

        try {
            const response = await axios.post(`/farms/toggle-follow/${farm.id}`);

            const {
                isFollowing: newIsFollowing,
                followersCount: newFollowersCount,
            } = response.data;

            // Update state with authoritative data from server
            setIsFollowing(newIsFollowing);
            setFollowersCount(newFollowersCount);

            // Broadcast the change to other open pages
            window.dispatchEvent(
                new CustomEvent('follow-status-changed', {
                    detail: {
                        farmId: farm.id,
                        isFollowing: newIsFollowing,
                        followersCount: newFollowersCount,
                    },
                }),
            );
        } catch (error) {
            // Revert on error
            setIsFollowing(originalIsFollowing);
            setFollowersCount(originalFollowersCount);
            console.error('Follow toggle failed:', error);
            alert(
                'An error occurred while trying to follow. Please try again.',
            );
        }
    };

    const getImageUrl = (url: string | null | undefined): string => {
        if (!url) {
            // If no URL, return a placeholder
            return 'https://placehold.co/600x400?text=គ្មានរូបភាព';
        }
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // If it's already a full URL, use it as is
            return url;
        }
        // For all other cases (like 'users/avatar.png'), prepend /storage/
        // The initial '/' is critical. It makes the path absolute to the domain root.
        return `/storage/${url.startsWith('/') ? url.substring(1) : url}`;
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i < rating ? 'currentColor' : 'none'}
                />,
            );
        }
        return stars;
    };

    const StarRatingInput = ({
        rating,
        setRating,
    }: {
        rating: number;
        setRating: (rating: number) => void;
    }) => {
        const [hoverRating, setHoverRating] = useState(0);

        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                            (hoverRating || rating) >= star
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
        );
    };

    // --- Handlers for Cart and Wishlist ---
    const handleAddToCart = (
        product: Farm['products'][number],
        quantity: number = 1,
    ) => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }
        if (auth.user?.role === 'seller') {
            toast.info('មុខងារសម្រាប់តែអតិថិជន', {
                description:
                    'ដើម្បីអាចបញ្ជាទិញបាន សូមបង្កើតគណនីថ្មីជាអតិថិជន។',
                action: {
                    label: 'ចុះឈ្មោះ',
                    onClick: () => (window.location.href = '/register'),
                },
            });
            return;
        }

        addToCart(
            {
                product_id: product.product_id,
                productname: product.productname,
                price: product.price,
                unit: product.unit,
                image: product.images?.[0]?.image_url, // Use the first image
                seller_id: farm.id, // Get seller_id from the main farm object
                farm_name: farm.farm_name, // Get farm_name from the main farm object
            },
            quantity,
        );

        toast.success(`${product.productname} បានបញ្ចូលក្នុងកន្ត្រក`);
    };

    const handleWishlistToggle = async (productId: number) => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }

        if (auth.user.role === 'seller') {
            toast.info('មុខងារសម្រាប់តែអតិថិជន', {
                description:
                    'ដើម្បីអាចប្រើ Wishlist បាន សូមបង្កើតគណនីថ្មីជាអតិថិជន។',
                action: {
                    label: 'ចុះឈ្មោះ',
                    onClick: () => (window.location.href = '/register'),
                },
            });
            return;
        }

        const originalWishlist = new Set(wishlist);
        const newWishlist = new Set(originalWishlist);

        if (newWishlist.has(productId)) {
            newWishlist.delete(productId);
        } else {
            newWishlist.add(productId);
        }
        setWishlist(newWishlist); // Optimistic update

        try {
            // Use RESTful endpoint. Crucially, check against the *original* wishlist state
            // to determine the correct action (POST to add, DELETE to remove).
            const method = originalWishlist.has(productId) ? 'DELETE' : 'POST';
            const url = `/wishlist/${productId}`;

            const response = await axios({
                method,
                url,
            });

            if (response.data.success) {
                // Dispatch a global event so other parts of the app can update, like the header count
                window.dispatchEvent(
                    new CustomEvent('wishlist-updated', {
                        detail: { count: response.data.wishlist_count },
                    }),
                );
            } else {
                // If the server indicates failure, revert to the original state
                setWishlist(originalWishlist);
                toast.error('មានបញ្ហាក្នុងការកែប្រែ Wishlist');
            }
        } catch (error) {
            console.error('Wishlist toggle failed:', error);
            // If the API call itself fails, revert to the original state
            setWishlist(originalWishlist);
            toast.error('មានបញ្ហាក្នុងការកែប្រែ Wishlist');
        }
    };

    const sortedProducts = [...farm.products].sort((a, b) => {
        if (sortOrder === 'price-asc') {
            return a.price - b.price;
        }
        if (sortOrder === 'price-desc') {
            return b.price - a.price;
        }
        return 0; // 'default' order remains as is from the server
    });
    

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster richColors position="top-right" />
            <Head title={`${farm.farm_name} - កសិផលខេត្តបាត់ដំបង`} />

            <Header
                searchQuery=""
                onSearchChange={() => {}}
                isAuthenticated={!!auth.user}
                userName={auth.user?.username}
                userPhoto={auth.user?.photo_url ?? null}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 md:py-45">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>ត្រឡប់ក្រោយ</span>
                    </button>
                </div>

                {/* Farm Header */}
                <div className="mb-10 rounded-xl bg-white p-6 shadow-md md:p-8">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                        {farm.user.photo ? (
                            <img
                                src={getImageUrl(farm.user.photo)}
                                alt={farm.farm_name}
                                className="h-32 w-32 shrink-0 rounded-full border-4 border-green-200 object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                                }}
                            />
                        ) : null}
                        <div
                            className="h-32 w-32 shrink-0 rounded-full border-4 border-green-200 bg-green-100 flex items-center justify-center"
                            style={farm.user.photo ? { display: 'none' } : {}}
                        >
                            <span className="text-green-700 font-bold text-3xl">
                                {(() => {
                                    const chars = [...farm.farm_name.trim()];
                                    const words = farm.farm_name.trim().split(/\s+/);
                                    return words.length >= 2
                                        ? [...words[0]][0] + [...words[1]][0]
                                        : chars.length >= 2 ? chars[0] + chars[1] : chars[0] ?? '?';
                                })()}
                            </span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                                {farm.farm_name}
                            </h1>
                            <p className="mt-2 flex items-center justify-center gap-1.5 text-lg text-gray-600 md:justify-start">
                                <span>{farm.full_location}</span>
                            </p>
                            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-500 md:justify-start">
                                {farm.user.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        {farm.user.phone}
                                    </span>
                                )}
                                {farm.user.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {farm.user.email}
                                    </span>
                                )}
                            </div>
                            <p className="mt-4 max-w-3xl text-base text-gray-700">
                                {farm.description}
                            </p>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start md:gap-6">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="h-5 w-5" />
                                    <span className="font-semibold">
                                        {followersCount.toLocaleString('km-KH')}{' '}
                                        នាក់តាមដាន
                                    </span>
                                </div>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`rounded-full px-6 py-2.5 font-semibold text-white shadow-sm transition ${
                                        isFollowing
                                            ? 'bg-gray-500 hover:bg-gray-600'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isFollowing ? 'បោះបង់តាមដាន' : 'តាមដាន'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors md:text-base ${
                                activeTab === 'products'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <ShoppingBag className="mr-2 inline h-5 w-5" />
                            ផលិតផល ({farm.products.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors md:text-base ${
                                activeTab === 'reviews'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <MessageSquare className="mr-2 inline h-5 w-5" />
                            ការវាយតម្លៃ ({ratings.length})
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
                    {activeTab === 'products' && (
                        <>
                            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
                                    ផលិតផលពីហាងនេះ
                                </h2>
                                <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">តម្រៀបតាមតម្លៃ:</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSort('price-desc')}
                                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
                                                    sortOrder === 'price-desc'
                                                        ? 'bg-green-100 text-green-700 font-semibold'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                aria-label="Sort by price: high to low"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                                <span>ខ្ពស់</span>
                                            </button>
                                            <button
                                                onClick={() => handleSort('price-asc')}
                                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
                                                    sortOrder === 'price-asc'
                                                        ? 'bg-green-100 text-green-700 font-semibold'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                aria-label="Sort by price: low to high"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                                <span>ទាប</span>
                                            </button>
                                        </div>
                                    </div>
                            </div>
                            {farm.products?.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {sortedProducts.map((product) => (
                                        <div
                                            key={product.product_id}
                                            className="group relative flex flex-col"
                                        >
                                            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-green-200 hover:shadow-lg">
                                                <Link
                                                    href={route('product.show', {
                                                        id: product.product_id,
                                                    })}
                                                >
                                                    <img
                                                        src={getImageUrl(
                                                            product.images[0]
                                                                ?.image_url,
                                                        )}
                                                        alt={
                                                            product.productname
                                                        }
                                                        className="h-48 w-full cursor-pointer object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </Link>
                                                <div className="flex flex-1 flex-col p-4">
                                                    <Link
                                                        href={route(
                                                            'product.show',
                                                            {
                                                                id: product.product_id,
                                                            },
                                                        )}
                                                    >
                                                        <h3 className="cursor-pointer truncate font-semibold text-gray-800 hover:text-green-600">
                                                            {product.productname}
                                                        </h3>
                                                    </Link>
                                                    <div className="mt-2 flex-1">
                                                        <p className="text-lg font-bold text-green-600">
                                                            {new Intl.NumberFormat(
                                                                'km-KH',
                                                                {
                                                                    style: 'decimal',
                                                                    minimumFractionDigits: 0,
                                                                },
                                                            ).format(
                                                                product.price,
                                                            )}
                                                            <span className="text-sm font-normal text-gray-500">
                                                                {' ៛ / '}
                                                                {product.unit}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product,
                                                                )
                                                            }
                                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                                                        >
                                                            <ShoppingBag className="mr-2 inline h-4 w-4" />
                                                            <span>
                                                                បញ្ចូលកន្ត្រក
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleWishlistToggle(
                                                                    product.product_id,
                                                                )
                                                            }
                                                            className={`rounded-lg p-2 transition ${
                                                                wishlist.has(
                                                                    product.product_id,
                                                                )
                                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            <Heart className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-gray-50 p-10 text-center text-gray-500">
                                    មិនទាន់មានផលិតផលនៅឡើយទេ
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <>
                            <h2 className="font-moul mb-6 text-2xl font-bold text-gray-800 md:text-3xl">
                                ការវាយតម្លៃ និងមតិយោបល់
                            </h2>

                            {/* Review Form */}
                            {auth.user ? (
                                canReview ? (
                                    <form
                                        onSubmit={handleRatingSubmit}
                                        className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                                    >
                                        <h3 className="mb-4 text-xl font-semibold text-gray-800">
                                            បញ្ចេញមតិរបស់អ្នក
                                        </h3>
                                        <div className="mb-4">
                                            <label className="mb-2 block font-medium text-gray-700">
                                                ការវាយតម្លៃរបស់អ្នក
                                            </label>
                                            <StarRatingInput
                                                rating={data.rating}
                                                setRating={(rating) =>
                                                    setData('rating', rating)
                                                }
                                            />
                                            {errors.rating && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.rating}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="comment"
                                                className="mb-2 block font-medium text-gray-700"
                                            >
                                                មតិយោបល់
                                            </label>
                                            <textarea
                                                id="comment"
                                                value={data.comment}
                                                onChange={(e) =>
                                                    setData(
                                                        'comment',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                rows={4}
                                                placeholder="សរសេរមតិយោបល់របស់អ្នកនៅទីនេះ..."
                                            ></textarea>
                                            {errors.comment && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.comment}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursora_not-allowed disabled:opacity-70"
                                        >
                                            {processing
                                                ? 'កំពុងផ្ញើ...'
                                                : 'ផ្ញើមតិ'}
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="mb-8 rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center text-yellow-800">
                                        <p className="font-medium">
                                            អ្នកត្រូវតែទិញផលិតផលពីកសិដ្ឋាននេះជាមុនសិន
                                            ទើបអាចបញ្ចេញមតិបាន។
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        ចង់បញ្ចេញមតិដែរទេ?
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        សូម{' '}
                                        <Link
                                            href={route('login')}
                                            className="font-semibold text-green-600 hover:underline"
                                        >
                                            ចូលគណនី
                                        </Link>{' '}
                                        ដើម្បីវាយតម្លៃហាងនេះ។
                                    </p>
                                </div>
                            )}

                            {/* Existing Ratings */}
                            {ratings?.length > 0 ? (
                                <div className="space-y-6">
                                    {ratings.map((rating) => (
                                        <div
                                            key={rating.id}
                                            className="border-b pb-6 last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(
                                                            rating.user.avatar,
                                                        )}
                                                        alt={rating.user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {rating.user.name}
                                                        </p>
                                                        <div className="mt-1 flex">
                                                            {renderStars(
                                                                rating.rating,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(
                                                        rating.created_at,
                                                    ).toLocaleDateString(
                                                        'km-KH',
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-4 text-gray-700">
                                                {rating.comment}
                                            </p>

                                            {/* Show delete button if current user owns the rating */}
                                            {auth.user?.id ===
                                                rating.user.id && (
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                rating.id,
                                                            )
                                                        }
                                                        disabled={processing}
                                                        className="text-sm font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        លុប
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-gray-50 p-10 text-center text-gray-500">
                                    មិនទាន់មានការវាយតម្លៃនៅឡើយទេ
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'contact' && (
                        <>
                            <h2 className="font-moul mb-6 text-2xl font-bold text-gray-800 md:text-3xl">
                                ទំនាក់ទំនងកសិករ
                            </h2>
                            {farm.facebook ||
                            farm.telegram ||
                            farm.whatsapp ||
                            farm.phone ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {farm.facebook && (
                                        <a
                                            href={farm.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-blue-50"
                                        >
                                            <Facebook className="h-8 w-8 text-blue-600" />
                                            <div>
                                                <p className="font-medium">
                                                    Facebook
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ចុចដើម្បីទៅកាន់ទំព័រ
                                                </p>
                                            </div>
                                        </a>
                                    )}

                                    {farm.telegram && (
                                        <a
                                            href={farm.telegram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-sky-50"
                                        >
                                            <Send className="h-8 w-8 text-sky-500" />
                                            <div>
                                                <p className="font-medium">
                                                    Telegram
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ផ្ញើសារភ្លាមៗ
                                                </p>
                                            </div>
                                        </a>
                                    )}

                                    {farm.whatsapp && (
                                        <a
                                            href={farm.whatsapp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-green-50"
                                        >
                                            <MessageCircle className="h-8 w-8 text-green-600" />
                                            <div>
                                                <p className="font-medium">
                                                    WhatsApp
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ផ្ញើសារឬហៅ
                                                </p>
                                            </div>
                                        </a>
                                    )}

                                    {farm.phone && (
                                        <a
                                            href={`tel:${farm.phone}`}
                                            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-purple-50"
                                        >
                                            <Phone className="h-8 w-8 text-purple-600" />
                                            <div>
                                                <p className="font-medium">
                                                    ទូរស័ព្ទ
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {farm.phone}
                                                </p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-gray-50 p-10 text-center text-gray-500">
                                    មិនទាន់មានព័ត៌មានទំនាក់ទំនងនៅឡើយទេ
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
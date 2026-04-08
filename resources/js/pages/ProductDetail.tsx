/** @jsxImportSource react */
import type { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';

import { route } from '@/lib/route';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Heart,
    Leaf,
    MessageCircle,
    Minus,
    Plus,
    Share2,
    Shield,
    Truck,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { Footer } from './customer/footer-customer';
import { useCart } from './customer/orders/cart-context';
import { Header } from './header';

// ────────────────────────────────────────────────
// Global Window Extension
// ────────────────────────────────────────────────

declare global {
    interface Window {
        updateWishlistCount?: () => void;
    }
}

// ────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────

interface Category {
    category_id: number;
    seller_id: number;
    seller_category_id: number;
    categoryname: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ProductImage {
    image_id: number;
    product_id: number;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

interface Seller {
    seller_id: number;
    farm_name?: string;
    user?: {
        user_id: number;
        photo?: string | null;
    };
}

interface User {
    id: number;
    username: string;
    photo?: string | null;
    role?: string;
}

interface Comment {
    comment_id: number;
    product_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    description?: string | null;
    stock?: 'available' | 'out_of_stock' | string;
    origin?: string;
    images: ProductImage[];
    category?: Category;
    seller?: Seller;
    comments?: Comment[];
}

interface Props extends PageProps {
    product: Product;
    is_in_wishlist: boolean;
    is_following: boolean;
    followers_count: number;
    errors?: Record<string, string>;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

export default function ProductDetail({
    auth,
    product,
    is_in_wishlist,
    is_following,
    followers_count = 0, // Default to 0
    errors: pageErrors = {},
}: Props) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(is_in_wishlist);
    const [isFollowing, setIsFollowing] = useState(is_following);
    const [followersCount, setFollowersCount] = useState(followers_count || 0);
    const { addToCart } = useCart();
    const { post, processing } = useForm();

    // Comment form state
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentErrors, setCommentErrors] = useState<Record<string, string>>(
        {},
    );

    // Comment management with local state
    const [localComments, setLocalComments] = useState<Comment[]>(
        product.comments || [],
    );
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null,
    );
    const [editingContent, setEditingContent] = useState('');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

    // Update localComments when product changes
    useEffect(() => {
        setLocalComments(product.comments || []);
    }, [product.comments]);

    useEffect(() => {
        setIsInWishlist(is_in_wishlist);
        setIsFollowing(is_following);
        setFollowersCount(followers_count || 0); // Default to 0
    }, [is_in_wishlist, is_following, followers_count, product.product_id]);

    useEffect(() => {
        const handleFollowChange = (event: CustomEvent) => {
            if (!product.seller) return;

            const { farmId, isFollowing, followersCount } = event.detail;

            if (product.seller.seller_id === farmId) {
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
    }, [product.seller?.seller_id]);

    const images = product.images || [];
    const mainImage =
        images[currentImageIndex] ||
        images.find((img) => img.is_primary) ||
        null;

    const getImageUrl = (url: string | null | undefined): string => {
        if (!url) return 'https://placehold.co/600?text=គ្មានរូបភាព';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `/storage/${url}`;
    };

    const mainImageUrl = getImageUrl(mainImage?.image_url);

    const nextImage = () =>
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () =>
        setCurrentImageIndex(
            (prev) => (prev - 1 + images.length) % images.length,
        );

    const toKhmerPrice = (num: number): string => {
        const formatted = Math.floor(num).toLocaleString('en-US');
        return formatted.replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
    };

    const handleAddToCart = () => {
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
                image: mainImage?.image_url,
                seller_id: product.seller?.seller_id,
                farm_name: product.seller?.farm_name || 'Unknown Farm',
            },
            quantity,
        );
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
    };

    const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
    const increaseQty = () => setQuantity((q) => q + 1);

    const isAvailable = product.stock !== 'out_of_stock';

    // Comments helpers
    const getCommentCountText = (count: number) => {
        if (count === 0) return 'មិនទាន់មានមតិយោបល់';
        if (count === 1) return '១ មតិយោបល់';
        return `${count} មតិយោបល់`;
    };

    const formatCommentDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('km-KH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!commentContent.trim()) {
            setCommentErrors({ content: 'សូមបញ្ចូលមតិយោបល់' });
            return;
        }

        setIsSubmitting(true);
        setCommentErrors({});

        try {
            const response = await axios.post(route('comments.store'), {
                content: commentContent,
                product_id: product.product_id,
            });

            if (response.data.success) {
                setCommentContent('');
                // Add the new comment to local state
                setLocalComments((prev) => [response.data.comment, ...prev]);
            }
        } catch (error: any) {
            console.error('Comment post failed:', error);
            if (error.response?.data?.errors) {
                setCommentErrors(error.response.data.errors);
            } else {
                alert('មានបញ្ហាក្នុងការបញ្ជូនមតិ។ សូមព្យាយាមម្តងទៀត។');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }

        if (!product.seller?.seller_id) {
            console.error('Seller ID is not available.');
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
            const response = await axios.post(
                `/farms/toggle-follow/${product.seller.seller_id}`,
            );

            const {
                isFollowing: newIsFollowing,
                followersCount: newFollowersCount,
            } = response.data;

            // Broadcast the change to other open pages
            window.dispatchEvent(
                new CustomEvent('follow-status-changed', {
                    detail: {
                        farmId: product.seller.seller_id,
                        isFollowing: newIsFollowing,
                        followersCount: newFollowersCount,
                    },
                }),
            );

            // Tell Inertia to refresh its props from the server.
            // This is crucial for persisting the state when navigating away and back.
            router.visit(window.location.href, {
                only: ['is_following', 'followers_count'],
                preserveScroll: true,
                preserveState: true,
            });
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

    const handleWishlistToggle = async () => {
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

        const original = isInWishlist;
        setIsInWishlist(!original);

        try {
            // Use RESTful endpoint with POST for adding and DELETE for removing
            const response = await axios({
                method: original ? 'DELETE' : 'POST',
                url: `/wishlist/${product.product_id}`,
            });

            if (response.data.success) {
                window.dispatchEvent(
                    new CustomEvent('wishlist-updated', {
                        detail: { count: response.data.wishlist_count },
                    }),
                );
            } else {
                setIsInWishlist(original);
            }
        } catch (error) {
            console.error('Wishlist toggle failed:', error);
            setIsInWishlist(original);
            toast.error('មានបញ្ហាក្នុងការកែប្រែ Wishlist');
        }
    };

    const handleDelete = async (
        e: React.MouseEvent<HTMLButtonElement>,
        commentId: number,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDeleting(commentId);

        try {
            const url = `/comments/${commentId}`;
            console.log('Deleting comment at:', url);

            const response = await axios.delete(url);

            if (response.status === 200 || response.status === 204) {
                // Update local state by filtering out the deleted comment
                setLocalComments((prev) =>
                    prev.filter((c) => c.comment_id !== commentId),
                );
                console.log('Comment deleted successfully');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('មានបញ្ហាក្នុងការលុបមតិយោបល់។ សូមព្យាយាមម្តងទៀត។');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleUpdate = async (
        e: React.MouseEvent<HTMLButtonElement>,
        commentId: number,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const trimmed = editingContent.trim();
        if (!trimmed) {
            alert('មតិយោបល់មិនអាចទទេបានទេ។');
            return;
        }

        setIsUpdating(commentId);

        try {
            // Use the route helper with the correct parameter name 'comment'
            const url = route('comments.update', { comment: commentId });
            console.log('Updating comment at:', url);

            // Use PATCH instead of PUT
            const response = await axios.patch(url, {
                content: trimmed,
            });

            if (response.status === 200) {
                // Update local state with the edited comment
                setLocalComments((prev) =>
                    prev.map((c) =>
                        c.comment_id === commentId
                            ? {
                                  ...c,
                                  content: trimmed,
                                  updated_at: new Date().toISOString(),
                              }
                            : c,
                    ),
                );
                setEditingCommentId(null);
                setEditingContent('');
                console.log('Comment updated successfully');
            }
        } catch (error: any) {
            console.error('កំហុសក្នុងការកែមតិយោបល់:', error);
            console.error('Error response:', error.response?.data);

            // Show more specific error message if available
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។';
            alert(errorMessage);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleEdit = (
        e: React.MouseEvent<HTMLButtonElement>,
        comment: Comment,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCommentId(comment.comment_id);
        setEditingContent(comment.content);
    };

    const handleCancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCommentId(null);
        setEditingContent('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`${product.productname} - កសិផលខេត្តបាត់ដំបង`} />
            <Toaster position="top-right" richColors />

            <Header
                searchQuery=""
                onSearchChange={() => {}}
                isAuthenticated={!!auth.user}
                userName={auth.user?.username}
            />

            <main className="mx-auto max-w-6xl px-4 py-8 md:py-44">
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>ត្រឡប់ក្រោយ</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-5">
                        <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-xl">
                            <img
                                src={mainImageUrl}
                                alt={product.productname}
                                className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
                                onError={(e) =>
                                    (e.currentTarget.src =
                                        'https://placehold.co/600?text=គ្មានរូបភាព')
                                }
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-md hover:bg-white"
                                        aria-label="រូបមុន"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-md hover:bg-white"
                                        aria-label="រូបបន្ទាប់"
                                    >
                                        <ChevronRight className="h-6 w-6 text-gray-800" />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="scrollbar-thin scrollbar-thumb-green-300 flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.image_id}
                                        onClick={() =>
                                            setCurrentImageIndex(idx)
                                        }
                                        className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                            idx === currentImageIndex
                                                ? 'border-green-600 shadow-sm'
                                                : 'border-transparent hover:border-green-400'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(img.image_url)}
                                            alt=""
                                            className="h-20 w-20 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-4 flex flex-wrap gap-3">
                            <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                                {product.category?.categoryname || 'សរីរាង្គ'}
                            </span>
                            {product.origin && (
                                <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm text-emerald-700">
                                    {product.origin}
                                </span>
                            )}
                        </div>

                        <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
                            {product.productname}
                        </h1>

                        <div className="mb-6 flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-green-700 md:text-5xl">
                                {toKhmerPrice(product.price)}
                            </span>
                            <span className="text-2xl text-gray-600">
                                ៛ /{product.unit}
                            </span>
                        </div>

                        <div className="mb-8 flex flex-wrap gap-6 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-green-600" />
                                <span>សរីរាង្គ ១០០%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                <span>គ្មានថ្នាំពុល</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-green-600" />
                                <span>ដឹកជញ្ជូនរហ័ស</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label className="mb-3 block text-base font-medium text-gray-700">
                                បរិមាណ ({product.unit})
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex rounded-xl border border-gray-300 bg-white">
                                    <button
                                        onClick={decreaseQty}
                                        className="px-5 py-3 text-xl font-bold hover:bg-gray-100 disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-5 w-5" />
                                    </button>
                                    <div className="flex w-20 items-center justify-center border-x border-gray-300 text-xl font-medium">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={increaseQty}
                                        className="px-5 py-3 text-xl font-bold hover:bg-gray-100"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isAvailable || auth.user?.role === 'seller'}
                                    className={`flex-1 rounded-xl py-4 text-lg font-semibold transition ${
                                        isAvailable && auth.user?.role !== 'seller'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'cursor-not-allowed bg-gray-400 text-white'
                                    }`}
                                >
                                    {isAvailable
                                        ? 'បញ្ចូលទៅកន្ត្រក'
                                        : 'អស់ស្តុក'}
                                </button>
                            </div>

                            {addedToCart && (
                                <p className="mt-3 text-center text-sm font-medium text-green-700">
                                    បានបញ្ចូលក្នុងកន្ត្រករួចរាល់!
                                </p>
                            )}
                        </div>

                        <div className="mb-10">
                            <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-gray-900">
                                <FileText className="h-6 w-6 text-green-600" />
                                ពិពណ៌នា
                            </h3>
                            <p className="leading-relaxed whitespace-pre-line text-gray-700">
                                {product.description || 'មិនមានការពិពណ៌នា'}
                            </p>
                        </div>

                        {product.seller && (
                            <div className="mb-10 rounded-2xl border border-green-100 bg-green-50/60 p-6 transition hover:border-green-200 hover:shadow-md">
                                <div className="flex items-center justify-between gap-4">
                                    <Link
                                        href={
                                            product.seller.seller_id
                                                ? route('farm.show', {
                                                      id: product.seller.seller_id,
                                                  })
                                                : '#'
                                        }
                                        className="flex items-center gap-4"
                                    >
                                        <img
                                            src={getImageUrl(
                                                product.seller?.user?.photo,
                                            )}
                                            alt={
                                                product.seller?.farm_name ||
                                                'កសិករ'
                                            }
                                            className="h-14 w-14 rounded-full border-2 border-green-200 object-cover shadow-sm"
                                            onError={(e) =>
                                                (e.currentTarget.src =
                                                    'https://placehold.co/56?text=កសិករ')
                                            }
                                        />
                                        <div>
                                            <strong className="block text-lg text-gray-900 hover:text-green-700">
                                                {product.seller?.farm_name ||
                                                    'កសិករក្នុងស្រុក'}
                                            </strong>
                                        </div>
                                    </Link>
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={!auth.user}
                                            className={`w-32 flex-shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                                                isFollowing
                                                    ? 'border border-gray-300 bg-gray-500 text-white hover:bg-gray-700'
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                            } ${
                                                !auth.user
                                                    ? 'cursor-not-allowed opacity-50'
                                                    : ''
                                            }`}
                                        >
                                            {isFollowing ? 'ឈប់តាមដាន' : 'តាមដាន'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={handleWishlistToggle}
                                disabled={auth.user?.role === 'seller'}
                                className={`flex items-center gap-2 rounded-xl border px-6 py-3 transition ${
                                    isInWishlist
                                        ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50`}
                            >
                                <Heart
                                    className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`}
                                />
                                {isInWishlist ? 'បានចូលចិត្ត' : 'ចូលចិត្ត'}
                            </button>
                            <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 hover:bg-gray-50">
                                <Share2 className="h-5 w-5" />
                                ចែករំលែក
                            </button>
                        </div>
                    </div>
                </div>

                {/* COMMENTS SECTION */}
                <div className="mt-16">
                    <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-gray-900">
                        <MessageCircle className="h-7 w-7 text-green-600" />
                        {getCommentCountText(localComments.length)}
                    </h2>

                    {auth.user ? (
                        auth.user.role === 'customer' ? (
                            <form onSubmit={handleSubmit} className="mb-10">
                                <textarea
                                    value={commentContent}
                                    onChange={(e) =>
                                        setCommentContent(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-200 p-4 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-60"
                                    rows={4}
                                    placeholder="សរសេរមតិយោបល់របស់អ្នក..."
                                    disabled={isSubmitting}
                                />
                                {commentErrors.content && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {commentErrors.content}
                                    </p>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !commentContent.trim()
                                        }
                                        className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? 'កំពុងផ្ញើ...'
                                            : 'បញ្ជូនមតិ'}
                                    </button>
                                </div>
                            </form>
                        ) : null
                    ) : (
                        <div className="mb-10 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                            <p className="text-gray-700">
                                សូម{' '}
                                <Link
                                    href={route('login')}
                                    className="font-bold text-green-600 hover:underline"
                                >
                                    ចូលគណនី
                                </Link>{' '}
                                ដើម្បីបញ្ចេញមតិយោបល់។
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {localComments.length > 0 ? (
                            localComments.map((comment) => {
                                const isOwner =
                                    auth.user &&
                                    Number(auth.user.user_id) ===
                                        Number(comment.user_id);

                                return (
                                    <article
                                        key={comment.comment_id}
                                        className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Avatar - professional size, no hover scale */}
                                            <img
                                                src={getImageUrl(
                                                    comment.user?.photo,
                                                )}
                                                alt={
                                                    comment.user?.username ??
                                                    'User'
                                                }
                                                className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-200 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://placehold.co/40x40?text=User';
                                                }}
                                            />

                                            <div className="min-w-0 flex-1">
                                                {/* Header row: name + metadata */}
                                                <div className="flex flex-wrap items-baseline justify-between gap-4">
                                                    <div className="flex items-baseline gap-3">
                                                        <span className="text-base font-medium text-gray-900">
                                                            {comment.user
                                                                ?.username ??
                                                                'អ្នកប្រើប្រាស់'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            <time
                                                                dateTime={
                                                                    comment.created_at
                                                                }
                                                            >
                                                                {formatCommentDate(
                                                                    comment.created_at,
                                                                )}
                                                            </time>
                                                            {comment.updated_at !==
                                                                comment.created_at && (
                                                                <span className="ml-1.5 text-xs text-gray-400 italic">
                                                                    (បានកែ)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content or Edit mode */}
                                                {editingCommentId ===
                                                comment.comment_id ? (
                                                    <div className="mt-4">
                                                        <textarea
                                                            value={
                                                                editingContent
                                                            }
                                                            onChange={(e) =>
                                                                setEditingContent(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="min-h-[80px] w-full resize-y rounded-md border border-gray-300 bg-white px-4 py-3 text-base leading-relaxed text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-500"
                                                            rows={3}
                                                            disabled={
                                                                isUpdating ===
                                                                comment.comment_id
                                                            }
                                                            autoFocus
                                                            placeholder="កែសម្រួលមតិរបស់អ្នក..."
                                                        />

                                                        <div className="mt-4 flex items-center gap-4">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleUpdate(
                                                                        e,
                                                                        comment.comment_id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating ===
                                                                    comment.comment_id
                                                                }
                                                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {isUpdating ===
                                                                comment.comment_id
                                                                    ? 'កំពុងរក្សា...'
                                                                    : 'រក្សាទុក'}
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    handleCancelEdit
                                                                }
                                                                disabled={
                                                                    isUpdating ===
                                                                    comment.comment_id
                                                                }
                                                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                បោះបង់
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3">
                                                        <p className="text-base leading-relaxed break-words whitespace-pre-line text-gray-800">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Actions - clean, professional, only when not editing */}
                                                {!editingCommentId &&
                                                    isOwner && (
                                                        <div className="mt-4 flex items-center gap-5 text-sm">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleEdit(
                                                                        e,
                                                                        comment,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeleting ===
                                                                    comment.comment_id
                                                                }
                                                                className="font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                                            >
                                                                កែសម្រួល
                                                            </button>

                                                            <button
                                                                onClick={(e) =>
                                                                    handleDelete(
                                                                        e,
                                                                        comment.comment_id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeleting ===
                                                                    comment.comment_id
                                                                }
                                                                className="font-medium text-red-600 transition-colors duration-150 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                                            >
                                                                {isDeleting ===
                                                                comment.comment_id
                                                                    ? 'កំពុងលុប...'
                                                                    : 'លុប'}
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-500">
                                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-lg">
                                    មិនទាន់មានមតិយោបល់នៅឡើយទេ
                                </p>
                                <p className="mt-1">
                                    ជាអ្នកទីមួយដែលនឹងបញ្ចេញមតិ!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
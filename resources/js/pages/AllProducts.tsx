import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Footer } from './customer/footer-customer';
import { useCart } from './customer/orders/cart-context';
import { Header } from './header';

interface Product {
    product_id: number;
    productname: string;
    price: string;
    unit: string; // Added for cart context
    images: { image_url: string }[];
    seller: {
        seller_id: number; // Added for cart context
        farm_name: string;
    };
    category: {
        // Added to display category name
        name: string;
    };
}

interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Category {
    category_id: number;
    name: string;
}

const AllProducts = ({
    products,
    wishlistProductIds = [],
    categories = [],
    minPrice = 0,
    maxPrice = 50000,
    filters = {},
}: {
    products: PaginatedProducts;
    wishlistProductIds?: number[];
    categories?: Category[];
    minPrice?: number;
    maxPrice?: number;
    filters?: { max_price?: string; tags?: number[], search?: string };
}) => {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTags, setActiveTags] = useState<number[]>(
        (filters.tags || []).map(Number),
    );
    const [priceLimit, setPriceLimit] = useState(
        filters.max_price ? parseInt(filters.max_price, 10) : maxPrice,
    );

    // Effect to sync state with props when filters change (e.g., browser back/forward)
    useEffect(() => {
        setPriceLimit(
            filters.max_price ? parseInt(filters.max_price, 10) : maxPrice,
        );
        setActiveTags((filters.tags || []).map(Number));
    }, [filters]);

    // Debounced effect for all filters
    useEffect(() => {
        const handler = setTimeout(() => {
            const queryParams: {
                max_price?: number;
                tags?: number[];
                search?: string;
            } = {};

            const currentFilterTags = (filters.tags || []).map(Number);
            const currentFilterPrice = filters.max_price
                ? parseInt(filters.max_price, 10)
                : maxPrice;
            const currentSearch = filters.search || '';

            const priceChanged = priceLimit !== currentFilterPrice;
            const tagsChanged =
                JSON.stringify(activeTags.sort()) !==
                JSON.stringify(currentFilterTags.sort());
            const searchChanged = searchQuery !== currentSearch;

            if (priceChanged || tagsChanged || searchChanged) {
                if (priceLimit < maxPrice) {
                    queryParams.max_price = priceLimit;
                }
                if (activeTags.length > 0) {
                    queryParams.tags = activeTags;
                }
                if (searchQuery) {
                    queryParams.search = searchQuery;
                }

                router.get('/allproducts', queryParams as any, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [priceLimit, activeTags, searchQuery, filters, maxPrice]);

    const { data, links, next_page_url, prev_page_url } = products;
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;
    const isSeller = user?.role === 'seller';

    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState<Set<number>>(
        new Set(wishlistProductIds),
    );

    useEffect(() => {
        setWishlist(new Set(wishlistProductIds));
    }, [wishlistProductIds]);

    const primaryImage = (product: Product) =>
        product.images.length > 0
            ? product.images[0].image_url
            : 'https://via.placeholder.com/400x300?text=No+Image';

    const requireLogin = () => (window.location.href = '/login');

    const handleAddToCart = (product: Product) => {
        if (!user) {
            requireLogin();
            return;
        }
        if (user?.role === 'seller') {
            toast.info('មុខងារសម្រាប់តែអតិថិជន', {
                description: 'ដើម្បីអាចបញ្ជាទិញបាន សូមបង្កើតគណនីថ្មីជាអតិថិជន។',
            });
            return;
        }

        addToCart({
            product_id: product.product_id,
            productname: product.productname,
            price: parseFloat(product.price),
            unit: product.unit,
            image: primaryImage(product),
            seller_id: product.seller.seller_id,
            farm_name: product.seller.farm_name,
        });
    };

    const handleWishlistToggle = async (productId: number) => {
        if (!user) {
            requireLogin();
            return;
        }
        if (user.role === 'seller') {
            toast.info('មុខងារសម្រាប់តែអតិថិជន');
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
            const method = originalWishlist.has(productId) ? 'DELETE' : 'POST';
            const url = `/wishlist/${productId}`;
            const response = await axios({ method, url });

            if (response.data.success) {
                window.dispatchEvent(
                    new CustomEvent('wishlist-updated', {
                        detail: { count: response.data.wishlist_count },
                    }),
                );
            } else {
                setWishlist(originalWishlist);
                toast.error('មានបញ្ហាក្នុងការកែប្រែ Wishlist');
            }
        } catch (error) {
            setWishlist(originalWishlist);
            toast.error('មានបញ្ហាក្នុងការកែប្រែ Wishlist');
        }
    };
    const toggleTag = (tagId: number) => {
        setActiveTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId],
        );
    };

    return (
        <>
            <Head title="ផលិតផលទាំងអស់" />
            <Header
                isAuthenticated={!!user}
                userName={user?.username ?? ''}
                userPhoto={user?.photo_url ?? null}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="min-h-screen bg-white py-45">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-10 lg:flex-row">
                        {/* LEFT SIDEBAR */}
                        <div className="flex-shrink-0 lg:w-72">
                            <div className="sticky top-6 space-y-10">
                                {/* Sort by Price Range */}
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        ចម្រាញ់តាមតម្លៃ
                                    </h3>
                                    <div className="px-1">
                                        <input
                                            type="range"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceLimit}
                                            onChange={(e) =>
                                                setPriceLimit(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full accent-green-600"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                                            <span>
                                                {minPrice.toLocaleString()} ៛
                                            </span>
                                            <span>
                                                {priceLimit.toLocaleString()} ៛
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ==================== SORT BY TAGS ==================== */}
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        ចម្រាញ់តាមស្លាក
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.category_id}
                                                onClick={() =>
                                                    toggleTag(cat.category_id)
                                                }
                                                className={`rounded-full border px-5 py-2 text-sm transition-all ${
                                                    activeTags.includes(
                                                        cat.category_id,
                                                    )
                                                        ? 'border-green-600 bg-green-600 text-white'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* ==================================================== */}

                                {/* Best Sellers */}
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Best Sellers
                                    </h3>
                                    <div className="space-y-4">
                                        {data.slice(0, 4).map((product) => (
                                            <Link
                                                key={product.product_id}
                                                href={`/product/${product.product_id}`}
                                                className="group flex gap-3"
                                            >
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                    <img
                                                        src={primaryImage(
                                                            product,
                                                        )}
                                                        alt={
                                                            product.productname
                                                        }
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="line-clamp-2 text-sm leading-tight font-medium text-gray-800">
                                                        {product.productname}
                                                    </p>
                                                    <p className="mt-1 text-base font-semibold text-green-600">
                                                        {parseInt(
                                                            product.price,
                                                        ).toLocaleString()}{' '}
                                                        ៛ /{product.unit}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAIN PRODUCT GRID */}
                        <div className="flex-1">
                            <div className="mb-8 flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    កសិផលទាំងអស់
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {data.map((product) => (
                                    <Link
                                        href={`/product/${product.product_id}`}
                                        key={product.product_id}
                                        className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                                            <img
                                                src={primaryImage(product)}
                                                alt={product.productname}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />

                                            {/* Hover action buttons */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-all group-hover:opacity-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleWishlistToggle(
                                                            product.product_id,
                                                        );
                                                    }}
                                                    disabled={isSeller}
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full shadow active:scale-95 ${
                                                        isSeller
                                                            ? 'cursor-not-allowed bg-gray-100'
                                                            : 'bg-white hover:bg-pink-50'
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`h-5 w-5 ${
                                                            isSeller
                                                                ? 'text-gray-400'
                                                                : 'text-pink-500'
                                                        } ${wishlist.has(product.product_id) ? 'fill-current' : ''}`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleAddToCart(
                                                            product,
                                                        );
                                                    }}
                                                    disabled={isSeller}
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full shadow active:scale-95 ${
                                                        isSeller
                                                            ? 'cursor-not-allowed bg-gray-100'
                                                            : 'bg-white hover:bg-green-50'
                                                    }`}
                                                >
                                                    <ShoppingCart
                                                        className={`h-5 w-5 ${
                                                            isSeller
                                                                ? 'text-gray-400'
                                                                : 'text-green-600'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 text-center">
                                            <p className="mb-1 text-xs text-gray-500">
                                                {product.category.name}
                                            </p>
                                            <h3 className="line-clamp-2 min-h-[2.2rem] text-lg font-semibold text-gray-900">
                                                {product.productname}
                                            </h3>
                                            <div className="mt-0">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {parseInt(
                                                        product.price,
                                                    ).toLocaleString()}
                                                    ​ ៛
                                                    <span className="ml-1 text-base font-normal text-gray-600">
                                                        / {product.unit}
                                                    </span>
                                                </p>
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500">
                                                {product.seller.farm_name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {links.length > 3 && (
                                <div className="mt-16 flex justify-center">
                                    <div className="flex items-center gap-1 rounded-3xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
                                        {prev_page_url && (
                                            <Link
                                                href={prev_page_url}
                                                className="rounded-2xl px-6 py-3 text-sm text-gray-600 hover:bg-gray-100"
                                            >
                                                ← Previous
                                            </Link>
                                        )}
                                        <div className="flex gap-1 px-4">
                                            {links.map((link, index) => {
                                                if (
                                                    index === 0 ||
                                                    index === links.length - 1
                                                )
                                                    return null;
                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`rounded-2xl px-5 py-3 text-sm font-medium transition-all ${
                                                            link.active
                                                                ? 'bg-green-600 text-white'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {next_page_url && (
                                            <Link
                                                href={next_page_url}
                                                className="rounded-2xl px-6 py-3 text-sm text-gray-600 hover:bg-gray-100"
                                            >
                                                Next →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default AllProducts;
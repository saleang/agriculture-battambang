import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Header } from './header';
import { Footer } from './customer/footer-customer';
import { PageProps } from '@/types';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from './customer/orders/cart-context';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

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
    category: { // Added to display category name
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
    products: PaginatedProducts,
    wishlistProductIds?: number[],
    categories?: Category[],
    minPrice?: number,
    maxPrice?: number,
    filters?: { max_price?: string, tags?: number[] },
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTags, setActiveTags] = useState<number[]>((filters.tags || []).map(Number));
    const [priceLimit, setPriceLimit] = useState(filters.max_price ? parseInt(filters.max_price, 10) : maxPrice);

    // Effect to sync state with props when filters change (e.g., browser back/forward)
    useEffect(() => {
        setPriceLimit(filters.max_price ? parseInt(filters.max_price, 10) : maxPrice);
        setActiveTags((filters.tags || []).map(Number));
    }, [filters]);

    // Debounced effect for all filters
    useEffect(() => {
        const handler = setTimeout(() => {
            const queryParams: { max_price?: number; tags?: number[] } = {};

            const currentFilterTags = (filters.tags || []).map(Number);
            const currentFilterPrice = filters.max_price ? parseInt(filters.max_price, 10) : maxPrice;

            const priceChanged = priceLimit !== currentFilterPrice;
            const tagsChanged = JSON.stringify(activeTags.sort()) !== JSON.stringify(currentFilterTags.sort());


            if (priceChanged || tagsChanged) {
                if (priceLimit < maxPrice) {
                    queryParams.max_price = priceLimit;
                }
                if (activeTags.length > 0) {
                    queryParams.tags = activeTags;
                }

                router.get('/allproducts', queryParams as any, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [priceLimit, activeTags, filters, maxPrice]);


    const { data, links, next_page_url, prev_page_url } = products;
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;

    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState<Set<number>>(new Set(wishlistProductIds));

    useEffect(() => {
        setWishlist(new Set(wishlistProductIds));
    }, [wishlistProductIds]);

    const primaryImage = (product: Product) =>
        product.images.length > 0 ? product.images[0].image_url : 'https://via.placeholder.com/400x300?text=No+Image';

    const requireLogin = () => window.location.href = '/login';

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
                window.dispatchEvent(new CustomEvent('wishlist-updated', {
                    detail: { count: response.data.wishlist_count },
                }));
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
        setActiveTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <>
            <Head title="ផលិតផលទាំងអស់" />
            <Toaster richColors position="top-right" />
            <Header searchQuery={searchQuery} onSearchChange={(q) => setSearchQuery(q)} isAuthenticated={!!user} userName={user?.username} />

            <main className="bg-white min-h-screen py-45">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* LEFT SIDEBAR */}
                        <div className="lg:w-72 flex-shrink-0">
                            <div className="sticky top-6 space-y-10">
                                {/* Sort by Price Range */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">ចម្រាញ់តាមតម្លៃ</h3>
                                    <div className="px-1">
                                        <input
                                            type="range"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceLimit}
                                            onChange={(e) => setPriceLimit(Number(e.target.value))}
                                            className="w-full accent-green-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{minPrice.toLocaleString()} ៛</span>
                                            <span>{priceLimit.toLocaleString()} ៛</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ==================== SORT BY TAGS ==================== */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">ចម្រាញ់តាមស្លាក</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.category_id}
                                                onClick={() => toggleTag(cat.category_id)}
                                                className={`px-5 py-2 text-sm rounded-full border transition-all ${
                                                    activeTags.includes(cat.category_id)
                                                        ? 'bg-green-600 text-white border-green-600'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
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
                                    <h3 className="font-semibold text-lg mb-4">Best Sellers</h3>
                                    <div className="space-y-4">
                                        {data.slice(0, 4).map(product => (
                                            <Link
                                                key={product.product_id}
                                                href={`/product/${product.product_id}`}
                                                className="flex gap-3 group"
                                            >
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={primaryImage(product)}
                                                        alt={product.productname}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium line-clamp-2 leading-tight text-gray-800">
                                                        {product.productname}
                                                    </p>
                                                    <p className="text-green-600 font-semibold mt-1 text-base">
                                                        {parseInt(product.price).toLocaleString()} ៛ /{product.unit}
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

                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">កសិផលទាំងអស់</h1>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {data.map((product) => (
                                    <div
                                        key={product.product_id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                                    >
                                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                            <Link href={`/farm/${product.seller.seller_id}`}>
                                                <img
                                                    src={primaryImage(product)}
                                                    alt={product.productname}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </Link>

                                            {/* Hover action buttons */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlistToggle(product.product_id); }}
                                                    className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-pink-50 active:scale-95"
                                                >
                                                    <Heart
                                                        className={`h-5 w-5 text-pink-500 ${wishlist.has(product.product_id) ? 'fill-current' : ''}`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                                                    className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-green-50 active:scale-95"
                                                >
                                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 text-center">
                                            <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[2.2rem]">
                                                {product.productname}
                                            </h3>
                                            <div className="mt-0">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {parseInt(product.price).toLocaleString()}​ ៛
                                                    <span className="ml-1 text-base font-normal text-gray-600">
                                                / {product.unit}
                                            </span>
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-2">
                                                {product.seller.farm_name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {links.length > 3 && (
                                <div className="mt-16 flex justify-center">
                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-3xl px-2 py-2 shadow-sm">
                                        {prev_page_url && <Link href={prev_page_url} className="px-6 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-2xl">← Previous</Link>}
                                        <div className="flex gap-1 px-4">
                                            {links.map((link, index) => {
                                                if (index === 0 || index === links.length - 1) return null;
                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`px-5 py-3 text-sm font-medium rounded-2xl transition-all ${
                                                            link.active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {next_page_url && <Link href={next_page_url} className="px-6 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-2xl">Next →</Link>}
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
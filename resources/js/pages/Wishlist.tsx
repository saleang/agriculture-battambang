import type { PageProps, Product } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ExternalLink,
    Heart,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Footer } from './customer/footer-customer';
import { useCart } from './customer/orders/cart-context';
import { Header } from './header';

interface WishlistItem {
    id: number;
    product: Product;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    wishlists: Paginated<WishlistItem>;
}

export default function Wishlist({ auth, wishlists }: Props) {
    const wishlistItems = wishlists.data;
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const event = new CustomEvent('wishlist-updated', {
            detail: { count: wishlistItems.length },
        });
        window.dispatchEvent(event);
    }, [wishlistItems.length]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('km-KH', {
            style: 'currency',
            currency: 'KHR',
            minimumFractionDigits: 2,
        }).format(price);
    };

    const handleRemove = (productId: number | undefined | null) => {
        // Strict check – prevent bad requests entirely
        if (
            !productId ||
            typeof productId !== 'number' ||
            isNaN(productId) ||
            productId <= 0
        ) {
            console.warn(
                'Cannot remove from wishlist — invalid or missing product_id:',
                productId,
            );
            return; // Silent fail – no request sent
        }

        router.delete(`/wishlist/${productId}`, {
            preserveScroll: true,
            preserveState: true,
            // No onSuccess popup – let Inertia refresh props naturally
            onError: (errors) => {
                console.error('Wishlist remove failed:', errors);
                // Keep silent, or add minimal toast only if you want
            },
        });
    };

    const handleAddToCart = (product: Product) => {
        // Set the main image for the cart
        const mainImage =
            product.images?.find((i: any) => i.is_primary)?.image_url ||
            product.images?.[0]?.image_url;
        const productWithImage = { ...product, image: mainImage };

        addToCart(productWithImage);
        handleRemove(product.product_id);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `${product.productname} បាន​បញ្ចូល​ទៅ​ក្នុង​រទេះ​របស់​អ្នក និង​ដក​ចេញ​ពី​បញ្ជី​ទំនិញ។`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    return (
        <>
            <Head title="បញ្ជីទំនិញ" />
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isAuthenticated={!!auth.user}
                userName={auth.user?.username ?? ''}
            />

            <div className="py-8 md:py-43">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      {/* Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center rounded-lg border border-gray-200 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span>ត្រឡប់ក្រោយ</span>
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 py-4">
                        បញ្ជីទំនិញ ({wishlistItems.length})
                    </h1>
                    {wishlistItems.length === 0 ? (
                        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
                            <Heart
                                className="h-16 w-16 text-gray-400"
                                strokeWidth={1.5}
                            />
                            <h2 className="mt-6 text-2xl font-semibold text-gray-700">
                                ​ទទេ
                            </h2>
                            <p className="mt-3 max-w-md text-gray-500">
                                អ្នក​មិន​ទាន់​បាន​រក្សា​ទុក​ផលិតផល​ណា​មួយ​នៅ​ឡើយ​ទេ។
                                ចាប់​ផ្ដើម​បន្ថែម​របស់​ដែល​អ្នក​ចូលចិត្ត!
                            </p>
                            <Link
                                href="/#products"
                                className="mt-6 inline-flex items-center rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
                            >
                                រកមើល​ផលិតផល
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 rounded-xl border bg-white shadow-sm">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center"
                                >
                                    {/* Image */}
                                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                                        {(() => {
                                            const images =
                                                item.product.images || [];
                                            const mainImage =
                                                images.find(
                                                    (i: any) => i.is_primary,
                                                )?.image_url ||
                                                images[0]?.image_url;
                                            return mainImage ? (
                                                <img
                                                    src={mainImage}
                                                    alt={
                                                        item.product.productname
                                                    }
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                    <Heart size={32} />
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/product/${item.product.product_id}`}
                                            className="line-clamp-2 text-lg font-medium text-gray-900 hover:text-green-700"
                                        >
                                            {item.product.productname}
                                        </Link>

                                        <div className="mt-2 flex items-baseline gap-3">
                                            <span className="text-xl font-semibold text-gray-900">
                                                {formatPrice(
                                                    item.product.price,
                                                )}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                / {item.product.unit}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            បាន​បន្ថែម​នៅ{' '}
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                        <button
                                            onClick={() =>
                                                handleAddToCart(item.product)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                        >
                                            <ShoppingCart size={18} />
                                            បញ្ចូល​ក្នុង​រទេះ
                                        </button>
                                        <button
                                            onClick={() => {
                                                const id =
                                                    item?.product?.product_id;

                                                // Extra safety: typeof + number check
                                                if (
                                                    typeof id === 'number' &&
                                                    !isNaN(id) &&
                                                    id > 0
                                                ) {
                                                    handleRemove(id);
                                                } else {
                                                    console.warn(
                                                        'Skipping remove — broken wishlist item (missing product_id):',
                                                        item,
                                                    );
                                                }
                                            }}
                                            className="rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                            title="ដក​ចេញ​ពី​បញ្ជី​wunschliste"
                                            // Optional: disable button visually if broken
                                            disabled={
                                                typeof item?.product
                                                    ?.product_id !== 'number' ||
                                                isNaN(item?.product?.product_id)
                                            }
                                        >
                                            <Trash2 size={20} />
                                        </button>

                                        <Link
                                            href={`/product/${item.product.product_id}`}
                                            className="rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-gray-100"
                                            title="មើល​ផលិតផល"
                                        >
                                            <ExternalLink size={20} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

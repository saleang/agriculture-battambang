import React, { useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useCart } from './cart-context';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Store } from 'lucide-react';
import Header from '@/pages/header';
import { Footer } from '../footer-customer';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    address?: string;
}

interface CartPageProps {
    auth?: {
        user?: User;
    };
}

export default function CartPage({ auth }: CartPageProps) {
    const user = auth?.user ?? null;
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, setFarmNameForSeller } = useCart();

    const placeholderImage = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='%23e5e7eb'%3e%3cpath d='M0 0h200v200H0z'/%3e%3ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16px' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'%3eគ្មានរូបភាព%3c/text%3e%3c/svg%3e`;

    // ✅ GROUP ITEMS BY SELLER
    const itemsBySeller = useMemo(() => {
        const grouped: Record<string, typeof cartItems> = {};

        cartItems.forEach(item => {
            const sellerId = item.seller_id || 'unknown';
            const sellerKey = `seller_${sellerId}`;

            if (!grouped[sellerKey]) {
                grouped[sellerKey] = [];
            }
            grouped[sellerKey].push(item);
        });

        return grouped;
    }, [cartItems]);

    const sellerCount = Object.keys(itemsBySeller).length;

    // attempt to resolve missing farm names for existing cart entries
    useEffect(() => {
        Object.values(itemsBySeller).forEach(items => {
            const sellerId = items[0]?.seller_id;
            const farmName = items[0]?.farm_name;
            if (sellerId && (!farmName || farmName === 'Unknown Farm')) {
                axios.get(`/seller/${sellerId}/farm-name`)
                    .then(res => {
                        const name = res.data?.farm_name;
                        if (name) setFarmNameForSeller(sellerId, name);
                    })
                    .catch(() => {
                        // ignore errors
                    });
            }
        });
    }, [itemsBySeller, setFarmNameForSeller]);

    const toKhmerPrice = (price: number): string => {
        const formatted = Math.floor(price).toLocaleString('en-US');
        return formatted.replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
    };

    const getSellerTotal = (items: typeof cartItems): number => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // calculate shipping per seller/farm based on quantity
    const getShippingCost = (items: typeof cartItems): number => {
        const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
        // only calculate for first 50 units; cap quantity
        const qty = Math.min(totalQty, 50);
        // 100៛ per 10 items (or portion thereof)
        const blocks = Math.ceil(qty / 10);
        return blocks * 100;
    };

    // total shipping across all sellers
    const totalShipping = Object.values(itemsBySeller).reduce((sum, items) => sum + getShippingCost(items), 0);

    const handleCheckout = () => {
        if (!user) {
            router.visit('/login', {
                data: { redirect: '/customer/orders/checkout' }
            });
            return;
        }
        router.visit('/customer/orders/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Head title="រទេះទិញទំនិញ - កសិផលខេត្តបាត់ដំបង" />
                <div className="min-h-screen bg-gray-50">
                    <Header
                        searchQuery=""
                        onSearchChange={() => {}}
                        isAuthenticated={!!user}
                        userName={user?.username ?? ''}
                    />

                    <div className="pt-32 pb-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-2xl mx-auto text-center py-20">
                                <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-moul">
                                    រទេះទិញទំនិញរបស់អ្នកទទេ
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    សូមបន្ថែមផលិតផលទៅក្នុងរទេះទិញទំនិញ ដើម្បីបន្តការទិញ
                                </p>
                                <Link
                                    href="/#products"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    បន្តទិញទំនិញ
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="រទេះទិញទំនិញ - កសិផលខេត្តបាត់ដំបង" />
            <div className="min-h-screen bg-gray-50">
                <Header
                    searchQuery=""
                    onSearchChange={() => {}}
                    isAuthenticated={!!user}
                    userName={user?.username ?? ''}
                />

                <div className="pt-32 pb-16 md:py-46">
                    <div className="container mx-auto px-4">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-moul">
                                រទេះទិញទំនិញ ({getTotalItems()} ផលិតផល)
                            </h1>

                            {/* ✅ SHOW SELLER COUNT */}
                            {sellerCount > 1 && (
                                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-flex mt-2">
                                    <Store className="w-5 h-5" />
                                    <span className="font-medium">
                                        អ្នកកំពុងទិញពី {sellerCount} ចម្ការ/ហាង
                                    </span>
                                </div>
                            )}

                            <Link
                                href="/#products"
                                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                បន្តទិញទំនិញ
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items - GROUPED BY SELLER */}
                            <div className="lg:col-span-2 space-y-6">
                                {Object.entries(itemsBySeller).map(([sellerKey, items], sellerIndex) => {
                                    const farmName = items[0]?.farm_name || `ចម្ការ ${sellerIndex + 1}`;
                                    const sellerTotal = getSellerTotal(items);
                                    const shipping = getShippingCost(items);

                                    return (
                                        <div key={sellerKey} className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
                                            {/* ✅ SELLER HEADER */}
                                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                                                <div className="flex items-center justify-between text-white">
                                                    <div className="flex items-center gap-3">
                                                        <Store className="w-6 h-6" />
                                                        <div>
                                                            <h3 className="font-bold text-lg">{farmName}</h3>
                                                            <p className="text-sm text-green-100">
                                                                {items.length} ផលិតផល
                                                            </p>
                                                            {/* shipping line below name */}
                                                            <p className="text-xs text-green-200">
                                                                ដឹកជញ្ជូន: {toKhmerPrice(shipping)} ៛
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-green-100">សរុប</p>
                                                        <p className="font-bold text-xl">
                                                            {toKhmerPrice(sellerTotal)} ៛
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SELLER ITEMS */}
                                            <div className="p-4 space-y-4">
                                                {items.map((item) => (
                                                    <div
                                                        key={item.product_id}
                                                        className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-300 transition"
                                                    >
                                                        {/* Product Image */}
                                                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={item.image ? `/storage/${item.image.split('/').slice(-2).join('/')}` : placeholderImage}
                                                                alt={item.productname}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = placeholderImage;
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                                {item.productname}
                                                            </h4>
                                                            <p className="text-green-700 font-bold text-lg mb-3">
                                                                {toKhmerPrice(item.price)} ៛
                                                                <span className="text-sm text-gray-600 font-normal ml-1">
                                                                    / {item.unit}
                                                                </span>
                                                            </p>

                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="text-lg font-semibold w-10 text-center">
                                                                        {toKhmerPrice(item.quantity)}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold text-gray-900">
                                                                        {toKhmerPrice(item.price * item.quantity)} ៛
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeFromCart(item.product_id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                        title="លុបចេញ"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-32">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-moul">
                                        សង្ខេបការបញ្ជាទិញ
                                    </h2>

                                    {/* ✅ SELLER BREAKDOWN */}
                                    {sellerCount > 1 && (
                                        <div className="mb-6 pb-6 border-b">
                                            <p className="text-sm text-gray-600 mb-3">ការបែងចែកតាមចម្ការ:</p>
                                            {Object.entries(itemsBySeller).map(([sellerKey, items], index) => {
                                                const farmName = items[0]?.farm_name || `ចម្ការ ${index + 1}`;
                                                const sellerTotal = getSellerTotal(items);
                                                const shipping = getShippingCost(items);

                                                return (
                                                    <div key={sellerKey} className="mb-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-700">{farmName}</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {toKhmerPrice(sellerTotal)} ៛
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm mt-1">
                                                            <span className="text-gray-700">ថ្លៃដឹកជញ្ជូន</span>
                                                            <span className="font-semibold text-gray-900">
                                                                 {toKhmerPrice(shipping)} ៛
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-700">
                                            <span>សរុបរង ({getTotalItems()} ផលិតផល)</span>
                                            <span className="font-semibold">{toKhmerPrice(getTotalPrice())} ៛</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>ការដឹកជញ្ជូន</span>
                                            <span className="text-green-600 font-semibold">
                                                {totalShipping > 0 ? `${toKhmerPrice(totalShipping)} ៛` : 'ឥតគិតថ្លៃ'}
                                            </span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>សរុប</span>
                                            <span className="text-2xl text-green-700">
                                                {toKhmerPrice(getTotalPrice() + totalShipping)} ៛
                                            </span>
                                        </div>
                                    </div>

                                    {/* ✅ MULTI-SELLER WARNING */}
                                    {sellerCount > 1 && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>📢 ចំណាំ:</strong> អ្នកកំពុងបញ្ជាទិញពី {sellerCount} ចម្ការ/ហាង ។
                                                ថ្លៃដឹកជញ្ជូនគិតឡើងក្រោមតាមចំនួនផលិតផលក្នុងមួយចម្ការ។
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                                    >
                                        បន្តទៅការទូទាត់
                                    </button>

                                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            ✓ ការដឹកជញ្ជូនឥតគិតថ្លៃសម្រាប់ការបញ្ជាទិញលើសពី ៥០,០០០៛
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
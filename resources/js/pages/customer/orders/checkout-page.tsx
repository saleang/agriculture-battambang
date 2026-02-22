import React, { useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { useCart } from './cart-context';
import CheckoutForm from './checkout-form';
import Header from '@/pages/header';
import { Footer } from '../footer-customer';
import { ShoppingBag, ArrowLeft, Store, AlertCircle } from 'lucide-react';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    address?: string;
}

interface CheckoutPageProps {
    auth?: {
        user?: User;
    };
}

export default function CheckoutPage({ auth }: CheckoutPageProps) {
    const user = auth?.user ?? null;
    const { cartItems, clearCart, getTotalItems, getSellerCount } = useCart();

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

    const sellerCount = getSellerCount();

    React.useEffect(() => {
        if (!user) {
            router.visit('/login', {
                data: { redirect: '/customer/orders/checkout' }
            });
        }
    }, [user]);

    if (cartItems.length === 0) {
        return (
            <>
                <Head title="ការទូទាត់ - កសិផលខេត្តបាត់ដំបង" />
                <div className="min-h-screen bg-gray-50 font-siemreap">
                    <Header
                        cartCount={0}
                        wishlistCount={0}
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
                                <a
                                    href="/"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    បន្តទិញទំនិញ
                                </a>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>
            </>
        );
    }

    const handleSuccess = (response: any) => {
        clearCart();

        const ordersCount = response.sellers_count || 1;
        const message = ordersCount === 1
            ? `ការបញ្ជាទិញបានជោគជ័យ!`
            : `បានបង្កើតការបញ្ជាទិញ ${ordersCount} ចំនួន (សម្រាប់ចម្ការនីមួយៗ)`;

        router.visit('/customer/orders', {
            preserveState: false,
        });

        alert(message);
    };

    return (
        <>
            <Head title="ការទូទាត់ - កសិផលខេត្តបាត់ដំបង" />
            <div className="min-h-screen bg-gray-50 font-siemreap">
                <Header
                    cartCount={getTotalItems()}
                    wishlistCount={0}
                    searchQuery=""
                    onSearchChange={() => {}}
                    isAuthenticated={!!user}
                    userName={user?.username ?? ''}
                />

                <div className="pt-32 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-moul">
                                ការទូទាត់
                            </h1>
                            
                            {/* ✅ MULTI-SELLER NOTICE */}
                            {sellerCount > 1 && (
                                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-blue-900 mb-1">
                                            អ្នកកំពុងបញ្ជាទិញពី {sellerCount} ចម្ការផ្សេងគ្នា
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            យើងនឹងបង្កើតការបញ្ជាទិញដាច់ដោយឡែក {sellerCount} ចំនួន (មួយសម្រាប់ចម្ការនីមួយៗ)។ 
                                            ការទូទាត់នឹងត្រូវធ្វើដាច់ដោយឡែកតាមចម្ការ។
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <a
                                href="/customer/cart"
                                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                ត្រឡប់ទៅរទេះទិញទំនិញ
                            </a>
                        </div>

                        {/* ✅ SHOW SELLER BREAKDOWN */}
                        {sellerCount > 1 && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(itemsBySeller).map(([sellerKey, items], index) => {
                                    const sellerName = items[0]?.farm_name || `ចម្ការ ${index + 1}`;
                                    const sellerTotal = items.reduce((sum, item) => 
                                        sum + (item.price * item.quantity), 0
                                    );
                                    
                                    return (
                                        <div key={sellerKey} className="bg-white rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Store className="w-5 h-5 text-green-600" />
                                                <h3 className="font-semibold text-gray-900">{sellerName}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {items.length} ផលិតផល
                                            </p>
                                            <p className="font-bold text-green-700 text-lg">
                                                ៛{sellerTotal.toLocaleString()}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <CheckoutForm
                            cartItems={cartItems}
                            user={user ?? undefined}
                            onSuccess={handleSuccess}
                            // sellerCount={sellerCount}
                        />
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
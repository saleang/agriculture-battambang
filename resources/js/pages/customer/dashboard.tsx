import { Footer } from '@/components/footer-customer';
import { Header } from '@/components/header-customer';
// import AppLayout from '@/layouts/app-layout';
// import { Head } from '@inertiajs/react';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

export default function CustomerDashboard({ auth }: PageProps) {
    const user = auth.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount] = useState(2);
    const [wishlistCount] = useState(5);
    return (
    //     <AppLayout>
    //         <div className="mb-6">
    //             <h2 className="text-xl font-semibold leading-tight text-gray-800">
    //                 Customer Dashboard
    //             </h2>
    //         </div>
    //         <Head title="Customer Dashboard" />

    //         <div className="py-12">
    //             <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
    //                 <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
    //                     <div className="p-6 text-gray-900">
    //                         <h3 className="text-2xl font-bold mb-4">Welcome, Customer! 🛒</h3>
    //                         <p>Start shopping for fresh products!</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </AppLayout>
    // );
    // return (
            <>
                <Head title="Home" />
    
                <div className="min-h-screen bg-white text-gray-800">
    
                    {/* Header */}
                    <Header
                        cartCount={cartCount}
                        wishlistCount={wishlistCount}
                        onNavigate={() => {}}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
    
                    {/* ============================
                       HERO (Agriculture Modern)
                    ============================ */}
                    <section className="relative pt-32 pb-40 overflow-hidden">
    
                        {/* Soft Earth & Green Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-amber-50"></div>
                        <div className="absolute -top-32 -right-10 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-40"></div>
                        <div className="absolute -bottom-40 -left-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
    
                        <div className="relative max-w-6xl mx-auto px-6 text-center">
    
                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                                Fresh From the Farm
                                <br />
                                <span className="text-green-600">To Your Home</span>
                            </h1>
    
                            {/* Subtitle */}
                            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Connecting local farmers with the community through an easy,
                                modern, and nature-inspired marketplace experience.
                            </p>
    
                        </div>  
                    </section>
    
                    {/* ============================
                       FEATURES (Agri Modern)
                    ============================ */}
                    <section className="py-28 bg-white">
                        <div className="max-w-6xl mx-auto px-6">
    
                            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-gray-900">
                                អ្វីដែលធ្វើឱ្យយើងខុសគេ
                            </h2>
    
                            <div className="grid md:grid-cols-3 gap-12">
    
                                {[
                                    {
                                        icon: "🌾",
                                        title: "ផលិតផលស្រស់ពីកសិដ្ឋាន",
                                        desc: "ផលិតផលស្រស់ៗមកពីកសិករដ៏ទំនុកចិត្តបាននៅក្នុងតំបន់។",
                                        color: "bg-green-50 border-green-200"
                                    },
                                    {
                                        icon: "🚚",
                                        title: "ដឹកជញ្ជូនលឿន",
                                        desc: "ទទួលបានសាច់ញាតិថ្មីៗគ្រប់ពេល ដោយសេវាដឹកជញ្ជូនមានគុណភាព។",
                                        color: "bg-amber-50 border-amber-200"
                                    },
                                    {
                                        icon: "💳",
                                        title: "ការទូទាត់មានសុវត្ថិភាព",
                                        desc: "ABA, Wing, និងវិធីទូទាត់ទំនើបនានាដែលមានសុវត្ថិភាពខ្ពស់។",
                                        color: "bg-lime-50 border-lime-200"
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={`p-10 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${item.color}`}
                                    >
                                        <div className="text-6xl mb-6">{item.icon}</div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
    
                            </div>
                        </div>
                    </section>
    
                    <Footer />
                </div>
            </>
        );
}

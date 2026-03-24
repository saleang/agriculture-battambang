/** @jsxImportSource react */
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Heart,
    Leaf,
    Mail,
    MessageSquareText,
    Phone,
    Shield,
    Truck,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Footer } from './customer/footer-customer';
import { useCart } from './customer/orders/cart-context';
import { Header } from './header';

interface ProductImage {
    image_url: string;
    is_primary: boolean;
}

interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    category_name?: string;
    images?: ProductImage[];
}

export default function Home({
    auth,
    wishlistProductIds,
}: PageProps<{ wishlistProductIds: number[] }>) {
    const user = auth?.user ?? null;
    const { addToCart } = useCart();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [currentImages, setCurrentImages] = useState<Record<string, number>>(
        {},
    );
    const [wishlist, setWishlist] = useState<number[]>(
        wishlistProductIds || [],
    );
    const [orderedProducts, setOrderedProducts] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem('orderedProducts');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(
            'orderedProducts',
            JSON.stringify(orderedProducts),
        );
    }, [orderedProducts]);

    // Fetch public products
    useEffect(() => {
        fetch('/products/public')
            .then((res) => {
                if (!res.ok)
                    throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const rawProducts = data.products ?? [];
                setProducts(
                    rawProducts.map((p: any) => ({
                        product_id: p.product_id,
                        productname: p.productname || 'គ្មានឈ្មោះ',
                        price: Number(p.price) || 0,
                        unit: p.unit || 'kg',
                        category_name: p.category_name || 'ផ្សេងៗ',
                        images: (p.images || []).map((img: any) => ({
                            image_url:
                                img.image_url ||
                                'https://via.placeholder.com/400?text=គ្មានរូបភាព',
                            is_primary: !!img.is_primary,
                        })),
                    })),
                );

                const rawCategories = data.categories ?? [];
                setCategories(rawCategories);
            })
            .catch((err) => {
                console.error('Fetch products failed:', err);
                setError('មិនអាចផ្ទុកផលិតផលបានទេ។ សូមព្យាយាមម្តងទៀត។');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleOrder = (product: Product) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        addToCart(product);
        setOrderedProducts((prev) => [
            ...new Set([...prev, product.product_id]),
        ]);
    };

    const handleAddToWishlist = async (product: Product) => {
        if (!user || !product.product_id) return;

        const id = product.product_id;
        const isIn = wishlist.includes(id);
        const original = [...wishlist];

        setWishlist((prev) =>
            isIn ? prev.filter((pid) => pid !== id) : [...prev, id],
        );

        try {
            await fetch('/sanctum/csrf-cookie');
            const csrf = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            )?.content;

            const res = await fetch(`/wishlist/${id}`, {
                method: isIn ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'កំហុសបណ្តាញ');
            }

            const data = await res.json();
            window.dispatchEvent(
                new CustomEvent('wishlist-updated', {
                    detail: { count: data.wishlist_count },
                }),
            );
        } catch (err: any) {
            setWishlist(original);
            toast.error(
                err.message || 'មិនអាចធ្វើបច្ចុប្បន្នភាព wishlist បានទេ',
            );
        }
    };

    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory((prev) =>
            prev === categoryName ? null : categoryName,
        );
    };

    // Khmer text normalization (helps with Khmer script variations)
    const normalizeKhmer = (str: string = '') => {
        if (!str) return '';
        // Use Unicode property escapes to remove all combining marks (diacritics, vowels).
        // Also explicitly remove the COENG character (U+17D2) which is a formatter, not a mark.
        // This creates a "base" version of the string for more reliable searching.
        return str
            .normalize('NFD')
            .replace(/\p{M}/gu, '')
            .replace(/\u17D2/g, '') // Remove COENG (subscript connector)
            .normalize('NFC')
            .toLowerCase()
            .trim();
    };

    const filteredProducts = products.filter((p) => {
        const nameNorm = normalizeKhmer(p.productname);
        const queryNorm = normalizeKhmer(searchQuery);
        const catNorm = normalizeKhmer(p.category_name || 'ផ្សេងៗ');

        const matchesSearch = !queryNorm || nameNorm.includes(queryNorm);

        const selectedNorm = normalizeKhmer(selectedCategory || '');
        const matchesCategory =
            !selectedCategory ||
            catNorm === selectedNorm ||
            catNorm.includes(selectedNorm) ||
            selectedNorm.includes(catNorm);

        return matchesSearch && matchesCategory;
    });

    const getMainImage = (images: ProductImage[] = [], idx: number) => {
        if (!images.length)
            return 'https://via.placeholder.com/400?text=គ្មានរូបភាព';
        const curr = images[idx];
        if (curr) return curr.image_url;
        const primary = images.find((i) => i.is_primary);
        return primary ? primary.image_url : images[0].image_url;
    };

    const nextImage = (pid: number, total: number) => {
        setCurrentImages((prev) => ({
            ...prev,
            [String(pid)]: ((prev[String(pid)] ?? 0) + 1) % total,
        }));
    };

    const prevImage = (pid: number, total: number) => {
        setCurrentImages((prev) => ({
            ...prev,
            [String(pid)]: ((prev[String(pid)] ?? 0) - 1 + total) % total,
        }));
    };

    const toKhmerPrice = (price: number): string =>
        Math.floor(price)
            .toLocaleString('en-US')
            .replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);

    const getCategoryImage = (categoryName: string) => {
        const name = (categoryName || '').trim();
        switch (name) {
            case 'ផ្លែឈើ':
                return 'https://i.pinimg.com/1200x/77/97/ba/7797ba60e5bf2e69ad299c5ccc303f0a.jpg';
            case 'បន្លែ':
                return 'https://i.pinimg.com/1200x/57/e8/d3/57e8d34dccb9149a36e33ae90644db53.jpg';
            case 'សាច់':
                return 'https://i.pinimg.com/1200x/8b/bf/60/8bbf60a0da4737b9eb4418be536ee851.jpg';
            case 'ត្រី':
                return 'https://i.pinimg.com/1200x/8c/49/09/8c4909205002d9c851e560df608c6187.jpg';
            case 'គ្រាប់ធញ្ញជាតិ':
                return 'https://i.pinimg.com/736x/a0/b0/56/a0b05698b37f25b1d32ae62d4fbeaed7.jpg';
            case 'គ្រឿងទេស':
                return 'https://i.pinimg.com/1200x/ca/c1/73/cac173d073c8d629c0dfb82a5b362cfc.jpg';
            case 'ផលិតផលសត្វ':
                return 'https://i.pinimg.com/1200x/7b/16/e3/7b16e3021bab44bc5291cfddd2c7141e.jpg';
            case 'កសិផលកែច្នៃ':
                return 'https://i.pinimg.com/736x/4d/59/8b/4d598b3c0f8e5b5b695f9a2536e0a284.jpg';
            case 'ដំណាំឧស្សាហកម្ម':
                return 'https://i.pinimg.com/1200x/16/06/c7/1606c7dc000bf7050ad4eb11fedb602f.jpg';
            case 'គ្រាប់ពូជ':
                return 'https://i.pinimg.com/1200x/21/a0/dc/21a0dcf6f6573aff92e163c6ead6405a.jpg';
            case 'ផ្សិត':
                return 'https://i.pinimg.com/736x/6f/2a/08/6f2a08560400998fc09f3441fd8b45f2.jpg';
            case 'ផ្សេងៗ':
                return 'https://i.pinimg.com/1200x/57/e8/d3/57e8d34dccb9149a36e33ae90644db53.jpg';
        }
    };

    // Static data
    const advantages = [
        {
            icon: <Truck className="h-8 w-8" />,
            title: 'បញ្ជាទិញតាមអនឡាញ',
            desc: 'ការដឹកជញ្ជូនដល់ផ្ទះ',
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: 'ទំនិញធានាសុវត្ថិភាព',
            desc: 'គ្មានការប្រើប្រាស់ថ្នាំសម្លាប់សត្វល្អិត',
        },
        {
            icon: <Leaf className="h-8 w-8" />,
            title: 'ផលិតផលសរីរាង្គ',
            desc: 'ប្រមូលផលពីស្រែធម្មជាតិ',
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'គាំទ្រកសិករក្នុងស្រុក',
            desc: 'ទិញផ្ទាល់ពីកសិករ',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="ទំព័រដើម - កសិផលខេត្តបាត់ដំបង" />
            <Toaster position="top-right" richColors />

            {/* Top Bar */}
            <div className="bg-gray-900 px-4 py-2.5 text-sm text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" /> +855 123 456 789
                        </span>
                        <span className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />{' '}
                            agriconnectbtb312@gmail.com
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <span>My Account</span>
                        <span>USD 💵</span>
                    </div>
                </div>
            </div>

            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isAuthenticated={!!user}
                userName={user?.username ?? ''}
            />

            {/* Hero */}
            <section
                id="hero"
                className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-800 pt-20 pb-40 text-white md:py-45"
            >
                {/* Background Rays */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'repeating-radial-gradient(circle at 50% 100%, white 0, white 2px, transparent 2px, transparent 10px)',
                    }}
                />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Text content */}
            <div className="text-center lg:text-left">
                <p className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold uppercase tracking-wide">
                បញ្ចុះតម្លៃរហូតដល់ 50%
                </p>

                <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                ស្រស់ៗពីកសិដ្ឋាន <br className="hidden sm:block" />
                <span className="text-green-600">សរីរាង្គ</span>
                </h1>

                <p className="mb-8 text-lg sm:text-xl text-gray-700 max-w-xl mx-auto lg:mx-0">
                ទិញកសិផលស្រស់ៗ គ្មានគីមី ដឹកជញ្ជូនរហ័ស ដល់ផ្ទះអ្នក។ សុខភាពល្អ ចាប់ផ្តើមពីឥឡូវនេះ!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                    href={user ? '/shop' : '/login'}
                    className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-4 text-base sm:text-lg font-semibold text-white shadow-lg hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    {user ? 'ទិញឥឡូវនេះ →' : 'ចូលគណនីដើម្បីទិញ →'}
                </Link>

                <p className="text-sm text-gray-600">
                    ដឹកជញ្ជូនឥតគិតថ្លៃ សម្រាប់ការបញ្ជាទិញលើសពី ៥០,០០០រៀល
                </p>
                </div>
            </div>

            {/* Right - Image */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-green-200/50">
                <img
                    src="https://c8.alamy.com/comp/2B3HE74/colorful-fruit-and-vegetables-on-market-in-cambodia-2B3HE74.jpg"
                    alt="កសិផលស្រស់ៗពីទីផ្សារកម្ពុជា"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                />
                </div>
            </div>
            </div>
        </div>

                {/* Bottom Bar */}
                <div
                    className="absolute right-0 bottom-0 left-0 h-28 bg-gray-900/90 backdrop-blur-sm"
                    style={{ clipPath: 'ellipse(80% 100% at 50% 100%)' }}
                >
                    <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 text-white sm:px-8 lg:px-12">
                        <div className="flex items-center gap-3">
                            <Truck className="h-8 w-8 text-yellow-400" />
                            <div>
                                <p className="text-sm font-semibold text-gray-300">
                                    សម្រាប់ការដឹកជញ្ជូន
                                </p>
                                <p className="text-lg font-bold">
                                    +855 123 456 789
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href={user ? '/shop' : '/login'}
                                className="inline-flex items-center justify-center rounded-lg bg-green-500 px-6 py-3 text-base font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-green-400 focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-gray-900"
                            >
                                {user ? 'ទិញឥឡូវនេះ' : 'ចូលគណនី'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages - Colorful & Modern Version */}
            <section
                id="advantages"
                className="mx-auto max-w-7xl bg-gradient-to-b from-green-50/50 to-white px-4 py-12 sm:px-6 lg:px-8"
            >
                <div className="mb-10">
                    <h2 className="font-moul text-3xl font-bold text-green-800 md:text-4xl">
                        អត្ថប្រយោជន៍របស់យើង
                    </h2>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        យើងផ្តល់ជូនផលិតផលស្រស់ស្រាយ មានសុវត្ថិភាព
                        និងគាំទ្រកសិករក្នុងស្រុក
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {advantages.map((adv, index) => {
                        // Cycle through nice color themes for each card
                        const colors = [
                            {
                                bg: 'bg-green-100',
                                text: 'text-green-700',
                                hover: 'hover:bg-green-200 hover:text-green-800',
                            },
                            {
                                bg: 'bg-blue-100',
                                text: 'text-blue-700',
                                hover: 'hover:bg-blue-200 hover:text-blue-800',
                            },
                            {
                                bg: 'bg-emerald-100',
                                text: 'text-emerald-700',
                                hover: 'hover:bg-emerald-200 hover:text-emerald-800',
                            },
                            {
                                bg: 'bg-teal-100',
                                text: 'text-teal-700',
                                hover: 'hover:bg-teal-200 hover:text-teal-800',
                            },
                        ];
                        const theme = colors[index % colors.length];

                        return (
                            <div
                                key={adv.title}
                                className={`group relative overflow-hidden rounded-2xl ${theme.bg} border border-gray-100/50 p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl md:p-8 ${theme.hover} `}
                            >
                                {/* Subtle gradient background on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                {/* Icon with colored circle */}
                                <div
                                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20 ${theme.text} bg-white/80 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                                >
                                    {adv.icon}
                                </div>

                                <h3
                                    className={`mb-3 text-xl font-bold md:text-2xl ${theme.text} transition-colors duration-300 group-hover:text-gray-900`}
                                >
                                    {adv.title}
                                </h3>

                                <p className="text-base leading-relaxed text-gray-700">
                                    {adv.desc}
                                </p>

                                {/* Decorative bottom accent */}
                                <div
                                    className={`absolute bottom-0 left-1/2 h-1.5 w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-${theme.text.replace('text-', 'bg-')} rounded-t-full to-transparent transition-all duration-500 group-hover:w-3/4`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Optional: Add a few illustrative images below the cards for visual appeal */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Fresh farm produce */}
                    <img
                        src="https://i.pinimg.com/1200x/69/41/28/69412880a1b161ab39865a2f9f748e2b.jpg"
                        alt="កសិករកម្ពុជាថែសួនបន្លែសរីរាង្គ"
                        className="h-48 w-full rounded-xl object-cover shadow-lg transition-transform hover:scale-105"
                    />
                    {/* Organic vegetables in greenhouse */}
                    <img
                        src="https://i0.wp.com/asiapacificfarmersforum.net/wp-content/uploads/2019/07/Organic-vegetables-cambodia.jpg?resize=908%2C681&ssl=1"
                        alt="បន្លែសរីរាង្គក្នុងផ្ទះកញ្ចក់"
                        className="h-48 w-full rounded-xl object-cover shadow-lg transition-transform hover:scale-105"
                    />
                    {/* Fresh safe produce in fridge */}
                    <img
                        src="https://d2evkimvhatqav.cloudfront.net/images/food-safety-organic-food-in-fridge-124401472.jpg?v=1666013851%2C0.4821%2C0.6477"
                        alt="បន្លែស្រស់សុវត្ថិភាពក្នុងទូទឹកកក"
                        className="h-48 w-full rounded-xl object-cover shadow-lg transition-transform hover:scale-105"
                    />
                    {/* Cambodian farmers harvesting */}
                    <img
                        src="https://i.pinimg.com/1200x/c8/65/dc/c865dc6fe871e928eaff79866fabd9cc.jpg"
                        alt="កសិករកម្ពុជាប្រមូលផលស្រូវ"
                        className="h-48 w-full rounded-xl object-cover shadow-lg transition-transform hover:scale-105"
                    />
                </div>
            </section>

            {/* Categories */}
            <section id="categories" className="mx-auto max-w-7xl px-4 py-3">
                <div className="mb-12 text-left">
                    <h2 className="font-moul mb-4 text-2xl font-bold text-green-800 md:text-4xl">
                        ប្រភេទកសិផលពេញនិយម
                    </h2>
                    <p className="max-w-2xl text-gray-600">
                        រកមើលកសិផលគ្រប់ប្រភេទដែលមាននៅក្នុងខេត្តបាត់ដំបង
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
                    {categories.map((cat) => {
                        const isSelected =
                            selectedCategory === cat.categoryname;
                        return (
                            <div
                                key={cat.category_id}
                                onClick={() =>
                                    handleCategoryClick(cat.categoryname)
                                }
                                className={`group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-500/50'
                                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                                <div className="aspect-w-1 aspect-h-1">
                                    <img
                                        src={getCategoryImage(cat.categoryname)}
                                        alt={cat.categoryname}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-3 text-center">
                                    <h3
                                        className={`truncate text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-800'}`}
                                    >
                                        {cat.categoryname}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Products */}
            <section id="products" className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-12">
                    <h2 className="font-moul relative inline-block pb-3 text-4xl font-bold text-green-800 md:text-5xl">
                        កសិផលទាំងអស់
                        <span className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        ផលិតផល ពីកសិករក្នុងខេត្តបាត់ដំបង
                        ការដឹកជញ្ជូនរហ័សទាន់ចិត្ត
                    </p>
                </div>
                {loading ? (
                    <div className="animate-pulse py-20 text-center text-lg text-gray-500">
                        កំពុងផ្ទុកផលិតផល...
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-lg text-red-600">
                        {error}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center text-lg text-gray-600">
                        មិនមានផលិតផលត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ។
                        <br />
                        <span className="mt-2 block text-base opacity-80">
                            សូមព្យាយាមពាក្យផ្សេង ឬជ្រើសប្រភេទផ្សេងទៀត។
                            <br />
                            (បើមិនមានផលិតផលនៅឡើយ សូមទាក់ទងអ្នកគ្រប់គ្រង)
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredProducts.map((p) => {
                            const images = p.images || [];
                            const currentIndex =
                                currentImages[String(p.product_id)] ?? 0;
                            const mainImage = getMainImage(
                                images,
                                currentIndex,
                            );

                            return (
                                <div
                                    key={p.product_id}
                                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-green-200 hover:shadow-2xl"
                                >
                                    <div className="relative aspect-square bg-gray-50">
                                        <Link href={`/product/${p.product_id}`}>
                                            <img
                                                src={mainImage}
                                                alt={p.productname}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://via.placeholder.com/400?text=រូបភាពមិនដំណើរការ';
                                                }}
                                            />
                                        </Link>

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        prevImage(
                                                            p.product_id,
                                                            images.length,
                                                        )
                                                    }
                                                    className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                                                    aria-label="រូបមុន"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        nextImage(
                                                            p.product_id,
                                                            images.length,
                                                        )
                                                    }
                                                    className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                                                    aria-label="រូបបន្ទាប់"
                                                >
                                                    →
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <Link href={`/product/${p.product_id}`}>
                                            <h3 className="mb-3 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-green-700">
                                                {p.productname}
                                            </h3>
                                        </Link>

                                        <p className="mb-3 text-2xl font-bold text-green-700">
                                            {toKhmerPrice(p.price)} ៛
                                            <span className="ml-1 text-base font-normal text-gray-600">
                                                / {p.unit}
                                            </span>
                                        </p>

                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleOrder(p)}
                                                disabled={orderedProducts.includes(
                                                    p.product_id,
                                                )}
                                                className="flex-1 rounded-xl bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                            >
                                                {orderedProducts.includes(
                                                    p.product_id,
                                                )
                                                    ? 'បានបញ្ជាទិញ'
                                                    : 'បញ្ជាទិញ'}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-xl"
                                                onClick={() =>
                                                    handleAddToWishlist(p)
                                                }
                                            >
                                                <Heart
                                                    className={`h-5 w-5 ${
                                                        wishlist.includes(
                                                            p.product_id,
                                                        )
                                                            ? 'fill-red-500 text-red-500'
                                                            : 'text-gray-500'
                                                    }`}
                                                />
                                            </Button>

                                            <Link
                                                href={`/product/${p.product_id}#comments`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-xl"
                                                >
                                                    <MessageSquareText className="h-5 w-5 text-gray-500" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
            <footer id="about" className="bg-gray-900 text-white">
                <Footer />
            </footer>
        </div>
    );
}
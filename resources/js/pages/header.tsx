// header-customer.tsx
import {
    Award,
    ChevronDown,
    Heart,
    Home,
    Leaf,
    LogOut,
    Menu,
    Package,
    Search,
    ShoppingBag,
    ShoppingCart,
    Store,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface HeaderProps {
    cartCount: number;
    wishlistCount: number;
    onNavigate?: (page: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isAuthenticated?: boolean;
    userName?: string | null;
    userPhoto?: string | null;
}

type UserRole = 'customer' | 'seller';

const getHrefMap = (role: UserRole): Record<string, string> => ({
    home: '/',
    login: '/login',
    profile: role === 'seller' ? '/seller/dashboard' : '/customer/profile',
    cart: role === 'seller' ? '/seller/orders' : '/cart',
    wishlist: '/wishlist',
    orders: role === 'seller' ? '/seller/orders' : '/orders',
    logout: '/logout',
    about: '/about',
    faq: '/faq',
    contact: '/contact',
    shop: '/shop',
    farmers: '/farmers',
    blog: '/blog',
    departments: '/departments',
});

export function Header({
    cartCount,
    wishlistCount,
    searchQuery,
    onSearchChange,
    isAuthenticated = false,
    userName = null,
    userPhoto = null,
}: HeaderProps) {
    const page = usePage<any>();
    const authUser = page.props.auth?.user;

    const role: UserRole = 
        authUser?.role === 'seller' ? 'seller' : 'customer';

    const hrefMap = getHrefMap(role);

    // Use photo_url from backend accessor (recommended)
    // Fallback to passed prop or null
    const displayPhoto = authUser?.photo_url ?? userPhoto ?? null;
    const displayName = authUser?.name ?? authUser?.username ?? userName ?? 'អ្នកប្រើ';

    const effectiveIsAuthenticated = !!authUser || isAuthenticated;

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Rotating messages
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const messages = [
        'កម្ពុជាស្រឡាញ់សន្តិភាព',
        'លើកស្ទួយតម្លៃកសិករខ្មែរ ដោយគាំទ្រកសិផលខ្មែរ',
        'ដាំដោយខ្មែរ ញ៉ាំដោយខ្មែរ ដើម្បីសុខភាពខ្មែរ',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // ────────────────────────────────────────────────
    // Debug logs – check browser console after login
    useEffect(() => {
        console.log('Header - Auth Debug:', {
            isAuthenticated: effectiveIsAuthenticated,
            role,
            displayName,
            photo: {
                raw: authUser?.photo,
                photo_url: authUser?.photo_url,
                displayPhotoUsed: displayPhoto,
                fullUrl: displayPhoto ? window.location.origin + displayPhoto : null,
            },
            profileLink: hrefMap.profile,
        });
    }, [authUser, role, hrefMap, effectiveIsAuthenticated, displayName, displayPhoto]);

    // Fixed logo (Vite recommended way)
    const logoSrc = new URL('@/assets/image.png', import.meta.url).href;

    return (
        <header className="fixed top-0 right-0 left-0 z-50 border-b bg-white shadow-sm">
            {/* Top rotating message bar */}
            <div className="bg-gradient-to-r from-green-800 to-green-700 py-2 text-white">
                <div className="container mx-auto px-6">
                    <div className="flex h-6 items-center justify-center">
                        <div className="relative mx-auto h-6 w-full max-w-3xl overflow-hidden">
                            <div
                                className="absolute w-full transition-all duration-500 ease-in-out"
                                style={{ transform: `translateY(-${currentMessageIndex * 24}px)` }}
                            >
                                {messages.map((message, index) => (
                                    <div key={index} className="flex h-6 items-center justify-center">
                                        <span className="font-siemreap flex w-full items-center justify-center gap-2 text-center text-sm font-medium whitespace-nowrap">
                                            {index === 0 && <Award className="h-3.5 w-3.5" />}
                                            {index === 1 && <Users className="h-3.5 w-3.5" />}
                                            {index === 2 && <Leaf className="h-3.5 w-3.5" />}
                                            {message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="bg-white">
                <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 md:h-20 md:gap-8">
                    {/* Logo mobile */}
                    <div className="md:hidden">
                        <a href={hrefMap.home} className="flex items-center">
                            <img src={logoSrc} alt="កសិផលខេត្តបាត់ដំបង" className="h-10" />
                        </a>
                    </div>

                    {/* Logo desktop */}
                    <div className="hidden items-center md:flex">
                        <a href={hrefMap.home} className="inline-flex items-center text-2xl font-bold text-green-700">
                            <img src={logoSrc} alt="កសិផលខេត្តបាត់ដំបង" className="h-14" />
                            <div className="ml-2">
                                <div className="font-moul text-lg font-bold text-green-800">កសិផលខេត្តបាត់ដំបង</div>
                                <div className="font-siemreap text-xs text-gray-600">ទំនាក់ទំនងកសិករដោយផ្ទាល់</div>
                            </div>
                        </a>
                    </div>

                    {/* Search desktop */}
                    <div className="relative hidden max-w-2xl flex-1 md:flex">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="ស្វែងរកកសិផល..."
                            className="font-siemreap h-10 rounded-full border border-green-200 bg-gray-50 pl-10 focus:border-green-500 focus:bg-white"
                        />
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-2 md:gap-5">
                        {/* Mobile search icon */}
                        <button className="rounded-full p-2 hover:bg-gray-100 md:hidden">
                            <Search className="h-5 w-5 text-gray-700" />
                        </button>

                        {/* Cart & Wishlist - customer only */}
                        {role === 'customer' && (
                            <>
                                <a href={hrefMap.wishlist} className="group relative hidden md:block">
                                    <div className="rounded-full p-2 transition hover:bg-green-50">
                                        <Heart className="h-5 w-5 text-gray-700 group-hover:text-green-600" />
                                    </div>
                                    {wishlistCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center bg-red-500 p-0 text-xs text-white">
                                            {wishlistCount}
                                        </Badge>
                                    )}
                                </a>

                                <a href={hrefMap.cart} className="group relative">
                                    <div className="rounded-full p-2 transition hover:bg-green-50">
                                        <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-green-600" />
                                    </div>
                                    {cartCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center bg-green-600 p-0 text-xs text-white">
                                            {cartCount}
                                        </Badge>
                                    )}
                                </a>
                            </>
                        )}

                        {/* Auth / Profile Dropdown */}
                        {!effectiveIsAuthenticated ? (
                            <a href={hrefMap.login} className="hidden md:inline-block">
                                <Button className="font-siemreap h-9 rounded-full bg-green-600 text-sm text-white hover:bg-green-700 md:h-10 md:text-base">
                                    <User className="mr-1 h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">ចូលគណនី</span>
                                    <span className="md:hidden">ចូល</span>
                                </Button>
                            </a>
                        ) : (
                            <div className="relative" ref={menuRef}>
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen((s) => !s);
                                    }}
                                    className="flex h-9 items-center gap-2 rounded-full border-green-200 px-2 hover:border-green-500 md:h-10 md:px-3"
                                >
                                    {displayPhoto ? (
                                        <div className="h-7 w-7 overflow-hidden rounded-full border border-green-300 md:h-8 md:w-8">
                                            <img 
                                                src={displayPhoto} 
                                                alt={displayName} 
                                                className="h-full w-full object-cover" 
                                                onError={(e) => {
                                                    console.error('Profile photo failed to load:', displayPhoto);
                                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-green-300 bg-green-100 md:h-8 md:w-8">
                                            <User className="h-3.5 w-3.5 text-green-600 md:h-4 md:w-4" />
                                        </div>
                                    )}
                                    <div className="hidden text-left md:block">
                                        <div className="font-siemreap max-w-[120px] truncate text-sm font-medium text-gray-900">
                                            {displayName}
                                        </div>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </Button>

                                {menuOpen && (
                                    <div className="font-siemreap absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg">
                                        <div className="border-b px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {displayPhoto ? (
                                                    <div className="h-10 w-10 overflow-hidden rounded-full border border-green-300">
                                                        <img 
                                                            src={displayPhoto} 
                                                            alt={displayName} 
                                                            className="h-full w-full object-cover" 
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName);
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-300 bg-green-100">
                                                        <User className="h-5 w-5 text-green-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{displayName}</div>
                                                    <div className="text-xs text-gray-500">សូមស្វាគមន៍អ្នកវិញ!</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <a
                                                href={hrefMap.profile}
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 transition hover:bg-green-50"
                                            >
                                                <User className="h-4 w-4 text-gray-600" />
                                                <span>{role === 'seller' ? 'ផ្ទាំងគ្រប់គ្រងហាង' : 'ប្រូហ្វាល់របស់ខ្ញុំ'}</span>
                                            </a>

                                            <a
                                                href={hrefMap.orders}
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 transition hover:bg-green-50"
                                            >
                                                <Package className="h-4 w-4 text-gray-600" />
                                                <span>{role === 'seller' ? 'ការបញ្ជាទិញអតិថិជន' : 'ការបញ្ជាទិញរបស់ខ្ញុំ'}</span>
                                            </a>

                                            {role === 'customer' && (
                                                <a
                                                    href={hrefMap.wishlist}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 transition hover:bg-green-50"
                                                >
                                                    <Heart className="h-4 w-4 text-gray-600" />
                                                    <span>បញ្ជីចំណូលចិត្ត</span>
                                                </a>
                                            )}
                                        </div>

                                        <hr className="my-1" />
                                        <Link
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-red-600 transition hover:bg-red-50"
                                            href={logout()}
                                            as="button"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            ចាកចេញ
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation bar */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex h-12 items-center justify-between">
                        {/* Desktop Navigation */}
                        <div className="hidden w-full items-center gap-1 md:flex">
                            <nav className="flex flex-1 gap-4">
                                {role === 'customer' ? (
                                    <>
                                        <a href="/" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <Home className="h-4 w-4" />ទំព័រដើម
                                        </a>
                                        <a href="/shop" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <Store className="h-4 w-4" />ទិញទំនិញ
                                        </a>
                                        <a href="/farmers" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <Users className="h-4 w-4" />ហាង/កសិករ
                                        </a>
                                        <a href="/departments" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <ShoppingBag className="h-4 w-4" />ប្រភេទទំនិញ
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a href="/seller/dashboard" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <Store className="h-4 w-4" />Dashboard
                                        </a>
                                        <a href="/seller/products" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <Package className="h-4 w-4" />Products
                                        </a>
                                        <a href="/seller/orders" className="font-siemreap flex items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-green-800/30 hover:text-green-200">
                                            <ShoppingCart className="h-4 w-4" />Orders
                                        </a>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Mobile Navigation (placeholder) */}
                        <div className="flex w-full items-center justify-between md:hidden">
                            <Button className="font-siemreap h-9 gap-2 rounded-lg bg-green-800 px-3 text-sm text-white hover:bg-green-900">
                                <Menu className="h-4 w-4" />
                                ម៉ឺនុយ
                            </Button>
                            <div className="px-2 text-center text-xs text-white">
                                <div className="font-siemreap font-medium">កសិផលខេត្តបាត់ដំបង</div>
                                <div className="font-siemreap truncate text-green-200">ទំនាក់ទំនងកសិករដោយផ្ទាល់</div>
                            </div>
                            <div className="w-9"></div>
                        </div>

                        {/* Desktop welcome */}
                        <div className="font-siemreap ml-4 hidden items-center text-sm text-white md:flex">
                            <span className="font-medium text-green-200">ស្វាគមន៍!</span>
                            <span className="ml-2">ទិញកសិផលពីកសិករបាត់ដំបងដោយផ្ទាល់</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
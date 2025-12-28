import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  LogOut,
  Package
} from 'lucide-react';

import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import image from '@/assets/image.png';
import { logout } from '@/routes';
import { Link, router } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onNavigate?: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAuthenticated?: boolean;
  userName?: string | null;
}

export function Header({
  cartCount,
  wishlistCount,
//   onNavigate,
  searchQuery,
  onSearchChange,
  isAuthenticated = false,
  userName = null,
}: HeaderProps) {
  const hrefMap: Record<string, string> = {
    home: '/',
    login: '/login',
    profile: '/profile',
    cart: '/cart',
    wishlist: '/wishlist',
    orders: '/orders',
    logout: '/logout',
    about: '/about',
    faq: '/faq',
    contact: '/contact',
    shop: '/shop',
    pages: '/pages',
    blog: '/blog',
    'shop-by-department': '/departments',
  };

  const cleanup = useMobileNavigation();
  
      const handleLogout = () => {
          cleanup();
          router.flushAll();
      };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#f7f7f7] border-b">

      {/* 🔹 Top info bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 h-10 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-600" />
            <span>Call us: (1800) 88-66-991</span>
          </div>
          <div className="flex gap-4">
            <a href={hrefMap.about} className="hover:text-green-600">About</a>
            <a href={hrefMap.faq} className="hover:text-green-600">FAQ</a>
            <a href={hrefMap.contact} className="hover:text-green-600">Contact</a>
          </div>
        </div>
      </div>

      {/* 🔹 Main header */}
      <div className="bg-white">
        <div className="container mx-auto px-6 h-20 flex items-center gap-8">

          {/* Logo */}
          <a href={hrefMap.home} className="text-2xl font-bold text-green-700 inline-flex items-center">
            <img src={image} alt="Agriculture Marketplace" className="h-20" />
          </a>

          {/* Search */}
          <div className="flex-1 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for products..."
              className="pl-10 h-11 rounded-full bg-gray-50 border border-gray-200 focus:bg-white"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-5">

            <a href={hrefMap.wishlist} className="relative">
              <Heart className="w-5 h-5 text-gray-700" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white">
                  {wishlistCount}
                </Badge>
              )}
            </a>

            <a href={hrefMap.cart} className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white">
                  {cartCount}
                </Badge>
              )}
            </a>

            {/* Login / Profile */}
            {!isAuthenticated ? (
              <a href={hrefMap.login} className="inline-block">
                <Button variant="outline" className="h-10 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  Login
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
                  className="h-10 rounded-full flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{userName ?? 'Profile'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                    <a 
                      href={hrefMap.profile} 
                      onClick={() => setMenuOpen(false)} 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span>My Profile</span>
                    </a>
                    <a 
                      href={hrefMap.orders} 
                      onClick={() => setMenuOpen(false)} 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                    >
                      <Package className="w-4 h-4 text-gray-600" />
                      <span>My Orders</span>
                    </a>
                    <hr className="my-1" />
                    <Link
                    className=" w-full px-4 py-2 text-red-600 hover:bg-gray-100 transition flex items-center gap-2"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="w-4 h-4" />
                    Log out
                </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Navigation bar */}
      <div className="bg-green-700">
        <div className="container mx-auto px-6 h-12 flex items-center gap-8 text-white text-sm">
        
          <a
  href="/shop-by-department"
  className="font-semibold hover:opacity-80"
>
  Shop by Department
</a>

<nav className="flex gap-6">
  <a href="/" className="hover:opacity-80">Home</a>
  <a href="/shop" className="hover:opacity-80">Shop</a>
  <a href="/pages" className="hover:opacity-80">Pages</a>
  <a href="/blog" className="hover:opacity-80">Blog</a>
  <a href="/contact" className="hover:opacity-80">Contact</a>
</nav>


        </div>
      </div>
    </header>
  );
}

export default Header;
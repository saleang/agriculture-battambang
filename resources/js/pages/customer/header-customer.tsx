// header-customer.tsx (កែសម្រួលពេញលេញ)
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  LogOut,
  Package,
  Home,
  Store,
  Users,
  FileText,
  MessageSquare,
  Menu,
  ShoppingBag,
  Award,
  Leaf
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
  userPhoto?: string | null;
}

export function Header({
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  isAuthenticated = false,
  userName = null,
  userPhoto = null,
}: HeaderProps) {
  const hrefMap: Record<string, string> = {
    home: '/',
    login: '/login',
    profile: '/customer/profile',
    cart: '/cart',
    wishlist: '/wishlist',
    orders: '/orders',
    logout: '/logout',
    about: '/about',
    faq: '/faq',
    contact: '/contact',
    shop: '/shop',
    farmers: '/farmers',
    blog: '/blog',
    departments: '/departments',
  };

  const cleanup = useMobileNavigation();

  const handleLogout = () => {
    cleanup();
    router.flushAll();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  // Rotating messages state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = [
    "កម្ពុជាស្រឡាញ់សន្តិភាព",
    "លើកស្ទួយតម្លៃកសិករខ្មែរ ដោយគាំទ្រកសិផលខ្មែរ",
    "ដាំដោយខ្មែរ ញ៉ាំដោយខ្មែរ ដើម្បីសុខភាពខ្មែរ"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">

      {/* 🔹 Top rotating message bar */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-2">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-6">
            <div className="relative h-6 w-full max-w-3xl mx-auto overflow-hidden">
              <div 
                className="absolute w-full transition-all duration-500 ease-in-out"
                style={{ transform: `translateY(-${currentMessageIndex * 24}px)` }}
              >
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className="h-6 flex items-center justify-center"
                  >
                    <span className="font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2 font-siemreap text-center w-full">
                      {index === 0 && <Award className="w-3.5 h-3.5" />}
                      {index === 1 && <Users className="w-3.5 h-3.5" />}
                      {index === 2 && <Leaf className="w-3.5 h-3.5" />}
                      {message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Main header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">

          {/* Logo - Mobile */}
          <div className="md:hidden">
            <a href={hrefMap.home} className="flex items-center">
              <img src={image} alt="កសិផលខេត្តបាត់ដំបង" className="h-10" />
            </a>
          </div>

          {/* Logo - Desktop */}
          <div className="hidden md:flex items-center">
            <a href={hrefMap.home} className="text-2xl font-bold text-green-700 inline-flex items-center">
              <img src={image} alt="កសិផលខេត្តបាត់ដំបង" className="h-14" />
              <div className="ml-2">
                <div className="text-lg font-bold text-green-800 font-moul">កសិផលខេត្តបាត់ដំបង</div>
                <div className="text-xs text-gray-600 font-siemreap">ទំនាក់ទំនងកសិករដោយផ្ទាល់</div>
              </div>
            </a>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ស្វែងរកកសិផល..."
              className="pl-10 h-10 rounded-full bg-gray-50 border border-green-200 focus:bg-white focus:border-green-500 font-siemreap"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 md:gap-5">

            {/* Search - Mobile */}
            <button className="md:hidden p-2 rounded-full hover:bg-gray-100">
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            <a href={hrefMap.wishlist} className="relative group hidden md:block" title="បញ្ជីចំណូលចិត្ត">
              <div className="p-2 rounded-full hover:bg-green-50 transition">
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-green-600" />
              </div>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                  {wishlistCount}
                </Badge>
              )}
            </a>

            <a href={hrefMap.cart} className="relative group" title="រទេះទិញទំនិញ">
              <div className="p-2 rounded-full hover:bg-green-50 transition">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-green-600" />
              </div>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                  {cartCount}
                </Badge>
              )}
            </a>

            {/* Login / Profile */}
            {!isAuthenticated ? (
              <a href={hrefMap.login} className="hidden md:inline-block">
                <Button className="h-9 md:h-10 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-siemreap">
                  <User className="w-4 h-4 mr-1 md:mr-2" />
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
                  className="h-9 md:h-10 rounded-full flex items-center gap-2 border-green-200 hover:border-green-500 px-2 md:px-3"
                >
                  {userPhoto ? (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-green-300">
                      <img 
                        src={userPhoto} 
                        alt={userName || 'អ្នកប្រើ'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-300">
                      <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] font-siemreap">
                      {userName || 'អ្នកប្រើ'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50 font-siemreap">
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        {userPhoto ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-green-300">
                            <img 
                              src={userPhoto} 
                              alt={userName || 'អ្នកប្រើ'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border border-green-300">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{userName || 'អ្នកប្រើ'}</div>
                          <div className="text-xs text-gray-500">សូមស្វាគមន៍អ្នកវិញ!</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <a
                        href={hrefMap.profile}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-green-50 transition text-gray-700"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span>ប្រូហ្វាល់របស់ខ្ញុំ</span>
                      </a>
                      <a
                        href={hrefMap.orders}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-green-50 transition text-gray-700"
                      >
                        <Package className="w-4 h-4 text-gray-600" />
                        <span>ការបញ្ជាទិញរបស់ខ្ញុំ</span>
                      </a>
                      <a
                        href={hrefMap.wishlist}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-green-50 transition text-gray-700"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                        <span>បញ្ជីចំណូលចិត្ត</span>
                      </a>
                    </div>
                    <hr className="my-1" />
                    <Link
                      className="w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      href={logout()}
                      as="button"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      ចាកចេញ
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Navigation bar */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 w-full">
              <nav className="flex gap-4 flex-1">
                <a href="/" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <Home className="w-4 h-4" />
                  ទំព័រដើម
                </a>
                <a href="/shop" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <Store className="w-4 h-4" />
                  ទិញទំនិញ
                </a>
                <a href="/farmers" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <Users className="w-4 h-4" />
                  ហាង/កសិករ
                </a>
                <a href="/departments" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <ShoppingBag className="w-4 h-4" />
                  ប្រភេទទំនិញ
                </a>
                <a href="/about" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <FileText className="w-4 h-4" />
                  អំពីយើង
                </a>
                <a href="/contact" className="text-white hover:text-green-200 font-medium flex items-center gap-2 transition-colors py-2 px-3 rounded-md hover:bg-green-800/30 font-siemreap">
                  <MessageSquare className="w-4 h-4" />
                  ទំនាក់ទំនង
                </a>
              </nav>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-between w-full">
              <Button className="bg-green-800 hover:bg-green-900 text-white h-9 rounded-lg px-3 gap-2 text-sm font-siemreap">
                <Menu className="w-4 h-4" />
                ម៉ឺនុយ
              </Button>
              
              <div className="text-white text-xs text-center px-2">
                <div className="font-medium font-siemreap">កសិផលខេត្តបាត់ដំបង</div>
                <div className="text-green-200 truncate font-siemreap">ទំនាក់ទំនងកសិករដោយផ្ទាល់</div>
              </div>
              
              <div className="w-9"></div> {/* Spacer for alignment */}
            </div>

            {/* Desktop welcome message */}
            <div className="hidden md:flex items-center text-white text-sm ml-4 font-siemreap">
              <span className="text-green-200 font-medium">ស្វាគមន៍!</span>
              <span className="ml-2">ទិញកសិផលពីកសិករបាត់ដំបងដោយផ្ទាល់</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
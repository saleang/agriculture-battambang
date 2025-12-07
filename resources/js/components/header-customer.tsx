import { Search, ShoppingCart, User, Bell, Globe, ChevronDown, Heart, Menu } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ cartCount, wishlistCount, onNavigate, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-modern">
      {/* Modern gradient decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#228B22] via-[#32CD32] to-[#228B22]"></div>

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo with modern styling */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#228B22] to-[#32CD32] rounded-2xl flex items-center justify-center shadow-modern group-hover:shadow-modern-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-2xl">🌾</span>
            </div>
            <div className="text-left">
              <h1 className="gradient-text transition-smooth">AgriMarket</h1>
              <p className="text-xs text-gray-500">Fresh from Battambang</p>
            </div>
          </button>

          {/* Modern Search Bar */}
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#228B22]/10 to-[#32CD32]/10 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#228B22] transition-colors z-10" />
            <Input
              type="text"
              placeholder="Search for rice, vegetables, fruits..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onNavigate('search')}
              className="relative pl-12 pr-4 py-6 rounded-full border-2 border-gray-200 focus:border-[#228B22] bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Right Actions with modern styling */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100/80 rounded-full">
              <Globe className="w-4 h-4" />
              <span className="text-sm">EN</span>
            </Button>

            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-300 hover:scale-105">
              <Bell className="w-5 h-5 text-gray-700" />
              <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 min-w-5 h-5 flex items-center justify-center shadow-modern animate-pulse">
                3
              </Badge>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white px-1.5 min-w-5 h-5 flex items-center justify-center shadow-modern">
                  {wishlistCount}
                </Badge>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-[#228B22] to-[#32CD32] text-white px-1.5 min-w-5 h-5 flex items-center justify-center shadow-modern">
                  {cartCount}
                </Badge>
              )}
            </button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100/80 rounded-full transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#228B22] to-[#32CD32] flex items-center justify-center text-white shadow-modern">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-modern-lg rounded-2xl">
                <DropdownMenuItem onClick={() => onNavigate('profile')} className="gap-2 py-3 rounded-lg">
                  👤 My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('orders')} className="gap-2 py-3 rounded-lg">
                  📦 My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('wishlist')} className="gap-2 py-3 rounded-lg">
                  💖 My Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('reviews')} className="gap-2 py-3 rounded-lg">
                  ⭐ My Reviews
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('payment')} className="gap-2 py-3 rounded-lg">
                  💳 Payment Methods
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

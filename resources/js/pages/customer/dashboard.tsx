import { Footer } from '@/pages/customer/footer-customer';
import Header from '@/pages/customer/header-customer';
// import AppLayout from '@/layouts/app-layout';
// import { Head } from '@inertiajs/react';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
// import { useState } from 'react';
import React, { useState } from 'react';
import { ShoppingCart, Heart, User, Search, ChevronLeft, ChevronRight, Star, Phone, Mail, Facebook, Instagram, MapPin } from 'lucide-react';

export default function CustomerDashboard({ auth }: PageProps) {
    const [searchQuery, setSearchQueryHeader] = useState('');
  const user = auth?.user ?? null;
  const userName = user ? (user.username ?? user.name ?? null) : null;

  const categories = [
    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop' },
    { name: 'Coffee & Drinks', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop' },
    { name: 'Meat', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop' },
    { name: 'Milk & Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop' },
    { name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop' },
    { name: 'Cleaning Essential', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=300&fit=crop' },
  ];

  const bannerProducts = [
    { title: 'Fresh & Healthy', subtitle: 'VEGETABLES', bg: 'from-green-50 to-green-100', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&h=400&fit=crop' },
    { title: 'Fresh & Healthy', subtitle: 'VEGETABLES', bg: 'from-orange-50 to-orange-100', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop' },
    { title: 'Fresh & Healthy', subtitle: 'VEGETABLES', bg: 'from-blue-50 to-blue-100', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop' },
  ];

  const featuredProducts = [
    { name: 'Organic Tomato', price: '$3', oldPrice: '$5', rating: 4.5, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop', discount: '-40%' },
    { name: 'Vegan Egg Replacer', price: '$5.99', oldPrice: '$8', rating: 4.0, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop' },
    { name: 'Strawberry Vanilla', price: '$6.48', oldPrice: '$9', rating: 4.5, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', discount: '-28%' },
  ];

  const dealProducts = [
    { name: 'Fresh Orange Juice', price: '$1.99', oldPrice: '$3', rating: 4.0, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop' },
    { name: 'Green Peas', price: '$2.99', oldPrice: '$4', rating: 4.0, image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=400&fit=crop' },
    { name: 'Tomato Sauce', price: '$1.99', oldPrice: '$3', rating: 4.0, image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop' },
    { name: 'Green Tea Bag', price: '$5.99', oldPrice: '$8', rating: 4.5, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2.5 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />+84 387 945 346</span>
            <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />homedokan@gmail.com</span>
          </div>
          <div className="flex gap-4"><span>My Account</span><span>USD 💵</span></div>
        </div>
      </div>

      {/* Header */}
      <Header
        cartCount={0}
        wishlistCount={0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQueryHeader}
        isAuthenticated={!!user}
        userName={userName}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto mt-20 px-4 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-green-600 font-semibold mb-3 text-sm uppercase tracking-wide">UPTO 50% OFF</p>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">Farm Fresh Organic<br /><span className="text-green-600">Vegetables.</span></h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">Get our lorem ipsum suspendisse ultrices gravida.<br />Risus commodo viverra maecenas accumsan.</p>

              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">Shop Online →</button>
            </div>
            <div className="relative">
              <div className="absolute top-0 right-0 w-full h-full bg-green-400 rounded-full blur-3xl opacity-20"></div>
              <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=800&fit=crop" alt="Fresh Vegetables" className="relative rounded-3xl shadow-2xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Banner Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {bannerProducts.map((item, i) => (
            <div key={i} className={`bg-gradient-to-br ${item.bg} rounded-2xl p-8 relative overflow-hidden hover:shadow-lg transition`}>
              <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-xs font-bold shadow-lg">OFF<br />30%</div>
              <p className="text-green-600 text-sm font-semibold mb-2 uppercase tracking-wide">{item.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{item.subtitle}</h3>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition transform hover:-translate-y-0.5">Shop Now →</button>
              <img src={item.image} alt={item.subtitle} className="absolute bottom-0 right-0 w-40 h-40 object-cover opacity-60 rounded-tl-3xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-green-600 text-sm font-semibold mb-2 uppercase tracking-wide">Categories</p>
            <h2 className="text-4xl font-bold text-gray-900">Top Categories</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 border-2 rounded-full hover:bg-gray-50 transition"><ChevronLeft className="w-5 h-5" /></button>
            <button className="p-2.5 border-2 rounded-full bg-green-500 text-white border-green-500"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white border-2 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer group">
              <div className="aspect-square overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4 text-center"><p className="font-semibold text-gray-900">{cat.name}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
          <div className="flex gap-6 text-sm font-medium">
            <button className="text-green-600 border-b-2 border-green-600 pb-1">Featured</button>
            <button className="text-gray-600 hover:text-green-600 transition">Best Sellers</button>
            <button className="text-gray-600 hover:text-green-600 transition">Popular</button>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Categories</h3>
            <ul className="space-y-3 text-gray-600">
              {['Coffee & Pastry', 'Bread & Bakery', 'Snacks', 'Dairy', 'Confectionery', 'Popular Items', 'Chocolate & Wafers', 'Beverage'].map((cat, i) => (
                <li key={i} className="hover:text-green-600 cursor-pointer transition font-medium">{cat}</li>
              ))}
            </ul>
            <button className="mt-8 bg-green-500 text-white w-full py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg">Shop Now →</button>
          </div>
          {featuredProducts.map((p, i) => (
            <div key={i} className="bg-white border rounded-2xl p-6 hover:shadow-xl transition group">
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-gray-50">
                {p.discount && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold z-10">{p.discount}</span>}
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition"><Heart className="w-4 h-4" /></button>
                  <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition"><Search className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < Math.floor(p.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />)}
                <span className="text-sm text-gray-500 ml-1">({p.rating})</span>
              </div>
              <div className="flex items-center justify-between">
                <div><span className="text-xl font-bold text-gray-900">{p.price}</span>{p.oldPrice && <span className="text-sm text-gray-400 line-through ml-2">{p.oldPrice}</span>}</div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banners */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-12 relative overflow-hidden hover:shadow-lg transition">
            <p className="text-green-600 text-sm font-semibold mb-2 uppercase tracking-wide">UPTO 15% OFF</p>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Fresh Vegetable</h3>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition transform hover:-translate-y-0.5 shadow-lg">Shop Now →</button>
            <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop" alt="Vegetables" className="absolute bottom-0 right-0 w-64 h-64 object-cover opacity-40 rounded-tl-3xl" />
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl p-12 relative overflow-hidden hover:shadow-lg transition">
            <h3 className="text-4xl font-bold mb-6">All Tasted Organic &<br />Fresh Products</h3>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition transform hover:-translate-y-0.5 shadow-lg">Shop Now →</button>
            <img src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=400&fit=crop" alt="Products" className="absolute bottom-0 right-0 w-64 h-64 object-cover opacity-30 rounded-tl-3xl" />
          </div>
        </div>
      </section>

      {/* Deal of Week */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Deal Of The Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {dealProducts.map((p, i) => (
            <div key={i} className="bg-white border rounded-2xl p-6 hover:shadow-xl transition text-center group">
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 mb-4">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < Math.floor(p.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />)}
                <span className="text-sm text-gray-500 ml-1">({p.rating})</span>
              </div>
              <div className="mb-4"><span className="text-xl font-bold text-gray-900">{p.price}</span><span className="text-sm text-gray-400 line-through ml-2">{p.oldPrice}</span></div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <button className="p-2 rounded-full border-2 hover:bg-green-50 hover:border-green-500 transition"><Heart className="w-4 h-4" /></button>
                <button className="p-2 rounded-full border-2 bg-green-500 text-white hover:bg-green-600 border-green-500 transition"><ShoppingCart className="w-4 h-4" /></button>
                <button className="p-2 rounded-full border-2 hover:bg-green-50 hover:border-green-500 transition"><Search className="w-4 h-4" /></button>
              </div>
              <button className={`w-full py-2.5 rounded-xl text-white font-semibold transition ${i === 1 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>Shop Now</button>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          <button className="p-2.5 border-2 rounded-full hover:bg-gray-50 transition"><ChevronLeft className="w-5 h-5" /></button>
          <button className="p-2.5 border-2 rounded-full bg-green-500 text-white border-green-500 transition"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

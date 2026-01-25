/** @jsxImportSource react */
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, Heart, User, Search, Star, Phone, Mail, MapPin, Clock, Shield, Truck, Award } from 'lucide-react';
import { PageProps } from '@/types';
import { Header } from './customer/header-customer';
import { Footer } from './customer/footer-customer';

export default function Home({ auth }: PageProps) {
  const [searchQuery, setSearchQueryHeader] = useState('');
  const user = auth?.user ?? null;

  const categories = [
    { 
      name: 'Vegetables', 
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      count: 42
    },
    { 
      name: 'Coffee & Drinks', 
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      count: 28
    },
    { 
      name: 'Meat & Poultry', 
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
      count: 15
    },
    { 
      name: 'Dairy Products', 
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
      count: 36
    },
    { 
      name: 'Fresh Fruits', 
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
      count: 24
    },
    { 
      name: 'Pantry Essentials', 
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=300&fit=crop',
      count: 51
    },
  ];

  const featuredProducts = [
    { 
      name: 'Organic Tomato', 
      price: '$3.99', 
      oldPrice: '$5.99', 
      rating: 4.5, 
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop', 
      discount: '-40%',
      organic: true
    },
    { 
      name: 'Vegan Egg Replacer', 
      price: '$5.99', 
      oldPrice: '$8.99', 
      rating: 4.0, 
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
      organic: true
    },
    { 
      name: 'Strawberry Vanilla Yogurt', 
      price: '$6.48', 
      oldPrice: '$9.99', 
      rating: 4.5, 
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', 
      discount: '-28%',
      organic: false
    },
    { 
      name: 'Artisanal Sourdough', 
      price: '$4.99', 
      oldPrice: '$6.99', 
      rating: 4.8, 
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      discount: '-20%',
      organic: true
    },
  ];

  const dealProducts = [
    { 
      name: 'Fresh Orange Juice', 
      price: '$1.99', 
      oldPrice: '$3.49', 
      rating: 4.0, 
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
      timeLeft: '02:15:30'
    },
    { 
      name: 'Organic Green Peas', 
      price: '$2.99', 
      oldPrice: '$4.99', 
      rating: 4.2, 
      image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=400&fit=crop',
      timeLeft: '01:45:20'
    },
    { 
      name: 'Tomato Sauce', 
      price: '$1.99', 
      oldPrice: '$3.49', 
      rating: 4.0, 
      image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop',
      timeLeft: '03:30:45'
    },
    { 
      name: 'Premium Green Tea', 
      price: '$5.99', 
      oldPrice: '$8.99', 
      rating: 4.5, 
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
      timeLeft: '04:15:10'
    },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'On orders over $50'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'Freshness guaranteed'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Always here to help'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Best organic store 2024'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Home Chef',
      content: 'The quality of produce is exceptional. Everything arrives fresh and lasts longer than supermarket produce.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'Restaurant Owner',
      content: 'Reliable delivery and consistent quality. My go-to supplier for all organic ingredients.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Nutritionist',
      content: 'Perfect for health-conscious families. The organic certification gives me peace of mind.',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head title="Fresh Organic Groceries | AgriConnect" />
      
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-200 py-3 px-4 text-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>+855 123 456 789</span>
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>agriconnectbtb312@gmail.com</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon-Sun: 8:00-20:00</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none">
              <option value="USD">USD 💵</option>
              <option value="EUR">EUR 💶</option>
              <option value="GBP">GBP 💷</option>
            </select>
            <span className="hidden sm:inline">|</span>
            <Link href={user ? "/profile" : "/login"} className="hover:text-white transition-colors">
              {user ? `Welcome, ${user.username}` : 'My Account'}
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        cartCount={0}
        wishlistCount={0}
        onNavigate={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQueryHeader}
        isAuthenticated={!!user}
        userName={user?.username ?? ''}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative z-10">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold mb-6">
                🎉 UPTO 50% OFF - Limited Time
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Farm Fresh
                <span className="block text-green-600 dark:text-green-400">Organic Vegetables</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                Experience the difference with our hand-picked organic produce. 
                Delivered fresh from farm to your table within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={user ? "/shop" : "/login"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {user ? 'Shop Online Now' : 'Login to Shop'}
                  <span className="ml-2">→</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full font-semibold text-lg transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative lg:pl-12">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl opacity-20 blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=800&fit=crop"
                  alt="Fresh Organic Vegetables"
                  className="relative rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-700 shadow-sm">
                      <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-green-600 dark:text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Shop by Category
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse through our carefully curated selection of fresh, organic products
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href="/shop"
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category.count} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12">
            <div>
              <span className="inline-block text-green-600 dark:text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
                Best Sellers
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Featured Products
              </h2>
            </div>
            <div className="flex space-x-1 mt-4 sm:mt-0">
              <button className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400">
                Featured
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Best Sellers
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Popular
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mb-4">
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {product.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {product.discount}
                    </span>
                  )}
                  {product.organic && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      Organic
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({product.rating})
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                        {product.oldPrice}
                      </span>
                    )}
                  </div>
                  <Link
                    href={user ? "/shop" : "/login"}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors duration-300"
                  >
                    {user ? 'Add to Cart' : 'Shop Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
              <div className="relative z-10 max-w-md">
                <span className="inline-block text-green-600 dark:text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
                  Fresh & Organic
                </span>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Fresh Vegetables Delivery
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Get your daily dose of vitamins with our farm-fresh vegetables, 
                  delivered right to your doorstep within hours of harvest.
                </p>
                <Link
                  href={user ? "/shop" : "/login"}
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors duration-300"
                >
                  {user ? 'Shop Vegetables' : 'Browse Selection'} →
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop"
                alt="Fresh Vegetables"
                className="absolute bottom-0 right-0 w-64 h-64 object-cover opacity-20 lg:opacity-100 rounded-tl-3xl"
              />
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-2xl p-8 lg:p-12 relative overflow-hidden">
              <div className="relative z-10 max-w-md">
                <h3 className="text-3xl font-bold mb-6">
                  Premium Quality
                  <span className="block text-green-400">Organic Products</span>
                </h3>
                <p className="text-gray-300 mb-8">
                  Every product in our store is carefully selected for quality, 
                  freshness, and sustainability. Taste the difference today.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors duration-300"
                >
                  Learn About Our Standards →
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=400&fit=crop"
                alt="Premium Products"
                className="absolute bottom-0 right-0 w-64 h-64 object-cover opacity-20 lg:opacity-40 rounded-tl-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Deal of the Week */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-red-500 text-sm font-semibold uppercase tracking-wider mb-3">
              Limited Time Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Deal Of The Week
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Don't miss out on these amazing deals. Limited quantities available!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map((product, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mb-4">
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      🔥 Hot Deal
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.price}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                    {product.oldPrice}
                  </span>
                </div>
                
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    ⏰ Ends in: {product.timeLeft}
                  </div>
                </div>
                
                <Link
                  href={user ? "/shop" : "/login"}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-colors duration-300 flex items-center justify-center ${
                    index === 1
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {user ? 'Add to Cart' : 'Shop Now'}
                  <ShoppingCart className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-green-600 dark:text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Customer Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their daily groceries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Subscribe to our newsletter for exclusive deals, recipes, and health tips
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
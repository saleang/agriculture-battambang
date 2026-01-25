// dashboard.tsx (កែសម្រួលសម្រាប់កសិផលបាត់ដំបង)
import { Footer } from '@/pages/customer/footer-customer';
import Header from '@/pages/customer/header-customer';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import React, { useState } from 'react';
import { ShoppingCart, Heart, User, Search, ChevronLeft, ChevronRight, Star, Phone, Mail, Facebook, Instagram, MapPin, Truck, Shield, Leaf, Users, Award } from 'lucide-react';

export default function CustomerDashboard({ auth }: PageProps) {
  const [searchQuery, setSearchQueryHeader] = useState('');
  const user = auth?.user ?? null;
  const userName = user ? (user.username ?? user.name ?? null) : null;
  const userPhoto: string | null = user && typeof user === 'object' && 'photo_url' in user ? (user.photo_url as string | null) : null;

  // ប្រភេទកសិផលក្នុងខេត្តបាត់ដំបង
  const battambangCategories = [
    { name: 'ស្ពាន់ស', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', desc: 'បន្លែស្រស់ពីស្រែ' },
    { name: 'ផ្លែឈើ', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop', desc: 'ផ្លែឈើស្រស់បំផុត' },
    { name: 'ស្រូវនិងអង្ករ', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', desc: 'ស្រូវសាយដំបងល្បីល្បាញ' },
    { name: 'ដំណាំឧស្សាហកម្ម', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', desc: 'កាកាវ ត្នោត ដូង' },
    { name: 'សាច់សត្វ', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop', desc: 'សាច់ស្រស់ពីកសិករ' },
    { name: 'ទឹកដោះគោ', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop', desc: 'ទឹកដោះគោស្អាត' },
  ];

  // កសិករល្បីៗក្នុងខេត្ត
  const featuredFarmers = [
    { name: 'កសិករម៉ឹង', location: 'ស្រុកឯកភ្នំ', rating: 4.8, products: 'ស្ពាន់ស ត្រសក់' },
    { name: 'កសិករសុខា', location: 'ស្រុកបវេល', rating: 4.9, products: 'ស្រូវសាយ អង្ករ' },
    { name: 'កសិករវ៉ាន់', location: 'ស្រុកមោង', rating: 4.7, products: 'ផ្លែត្របែក ល្ហុង' },
  ];

  // ផលិតផលពិសេស
  const battambangProducts = [
    { 
      name: 'ស្រូវសាយដំបង', 
      price: '៛8,500/kg', 
      farmer: 'កសិករសុខា', 
      location: 'បវេល',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      rating: 4.9,
      organic: true
    },
    { 
      name: 'ស្ពាន់សស្រស់', 
      price: '៛3,000/kg', 
      oldPrice: '៛4,000', 
      farmer: 'កសិករម៉ឹង', 
      location: 'ឯកភ្នំ',
      image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop',
      rating: 4.7,
      discount: '-25%',
      organic: true
    },
    { 
      name: 'ផ្លែត្របែកខេត្ត', 
      price: '៛4,500/kg', 
      farmer: 'កសិករវ៉ាន់', 
      location: 'មោង',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
      rating: 4.8,
      organic: true
    },
    { 
      name: 'ទឹកដោះគោស្រស់', 
      price: '៛6,000/លីត្រ', 
      farmer: 'កសិកររតនា', 
      location: 'បាត់ដំបង',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      rating: 4.6
    },
  ];

  // គុណសម្បត្តិ
  const advantages = [
    { icon: <Truck className="w-8 h-8" />, title: 'បញ្ជាទិញតាមអនឡាញ', desc: 'ផ្គត់ផ្គង់ដល់ទ្វារផ្ទះ' },
    { icon: <Shield className="w-8 h-8" />, title: 'ទំនិញធានាសុវត្ថិភាព', desc: 'គ្មានថ្នាំកូនសម្លាប់សត្វល្អិត' },
    { icon: <Leaf className="w-8 h-8" />, title: 'ផលិតផលសរីរាង្គ', desc: 'ប្រមូលផលពីស្រែធម្មជាតិ' },
    { icon: <Users className="w-8 h-8" />, title: 'គាំទ្រកសិករក្នុងស្រុក', desc: 'ទិញផ្ទាល់ពីកសិករ គ្មានអ្នកកាត់កណ្តាល' },
  ];

  return (
    <div className="min-h-screen bg-white font-siemreap">
      <Head title="ទំព័រដើម - កសិផលខេត្តបាត់ដំបង" />
      
      {/* Add custom fonts to Head */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet" />
        <style>{`
          .font-moul { font-family: 'Moul', serif; }
          .font-siemreap { font-family: 'Siemreap', sans-serif; }
        `}</style>
      </Head>

      {/* Header */}
      <Header
        cartCount={0}
        wishlistCount={0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQueryHeader}
        isAuthenticated={!!user}
        userName={userName}
        userPhoto={userPhoto}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                កសិផលស្រស់ពីស្រែបាត់ដំបង
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight font-moul">
                ស្វាគមន៍ទៅកាន់<br />
                <span className="text-green-600">ទីផ្សារកសិផល</span><br />
                ខេត្តបាត់ដំបង
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                ទិញកសិផលស្រស់ៗពីកសិករដោយផ្ទាល់។ គាំទ្រកសិករក្នុងស្រុក 
                និងទទួលបានផលិតផលគុណភាពខ្ពស់ដោយតម្លៃសមរម្យ។
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center font-siemreap">
                  ទិញកសិផលឥឡូវនេះ →
                </button>
                <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-full font-semibold text-lg transition-all font-siemreap">
                  ស្គាល់កសិកររបស់យើង
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute top-0 right-0 w-full h-full bg-green-400 rounded-full blur-3xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=800&fit=crop" 
                alt="កសិផលបាត់ដំបង" 
                className="relative rounded-3xl shadow-2xl w-full border-8 border-white"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">កសិករដៃគូ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <div key={index} className="bg-white border border-green-100 rounded-2xl p-6 hover:shadow-lg transition group">
              <div className="text-green-600 mb-4 group-hover:scale-110 transition-transform">
                {advantage.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{advantage.title}</h3>
              <p className="text-gray-600 text-sm">{advantage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-moul">ប្រភេទកសិផលពេញនិយម</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">រកមើលកសិផលគ្រប់ប្រភេទដែលផលិតនៅក្នុងខេត្តបាត់ដំបង</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {battambangCategories.map((cat, index) => (
            <div key={index} className="bg-white border border-green-100 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer group">
              <div className="aspect-square overflow-hidden bg-green-50">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-moul">ផលិតផលពិសេស</h2>
              <p className="text-gray-600 mt-2">កសិផលប្រណីតពីកសិករបាត់ដំបង</p>
            </div>
            <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2">
              មើលទាំងអស់ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {battambangProducts.map((product, index) => (
              <div key={index} className="bg-white border border-green-100 rounded-2xl overflow-hidden hover:shadow-xl transition group">
                <div className="relative aspect-square overflow-hidden bg-green-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                  {product.discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                      {product.discount}
                    </div>
                  )}
                  {product.organic && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> សរីរាង្គ
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <div className="text-sm opacity-90">កសិករ: {product.farmer}</div>
                    <div className="text-xs opacity-75">{product.location}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-green-600">{product.price}</span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">{product.oldPrice}</span>
                      )}
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      ទិញ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-moul">កសិករដៃគូរបស់យើង</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">ស្គាល់កសិករដែលផ្គត់ផ្គង់កសិផលស្រស់ៗដល់អ្នក</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredFarmers.map((farmer, index) => (
            <div key={index} className="bg-white border border-green-100 rounded-2xl p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{farmer.name}</h3>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {farmer.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(farmer.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{farmer.rating}</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">ផលិតផល:</span> {farmer.products}
              </div>
              <button className="w-full border border-green-600 text-green-600 hover:bg-green-50 py-2.5 rounded-lg font-medium transition">
                ទំនាក់ទំនងកសិករ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-moul">ចូលរួមជាមួយយើង</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            ប្រសិនបើអ្នកជាកសិករនៅខេត្តបាត់ដំបង ហើយចង់លក់ផលិតផលរបស់អ្នកតាមអនឡាញ
            សូមចុះឈ្មោះជាសមាជិកជាមួយយើងឥឡូវនេះ!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg shadow-lg">
              ចុះឈ្មោះជាកសិករ
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg">
              ស្វែងយល់បន្ថែម
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
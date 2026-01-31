import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Heart,
  Star,
  Phone,
  Mail,
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Header } from './customer/header-customer';
import { Footer } from './customer/footer-customer';

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface Product {
  product_id: number;
  productname: string;
  price: number;
  unit: string;
  images: ProductImage[];
}

export default function Home({ auth }: PageProps) {
  const user = auth?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImages, setCurrentImages] = useState<{ [key: number]: number }>({});

  /* Fetch public products */
  useEffect(() => {
    fetch('/products/public')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data ?? data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* Filter products based on search */
  const filteredProducts = products.filter(p =>
    p.productname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* Handle next/previous image */
  const nextImage = (productId: number, total: number) => {
    setCurrentImages(prev => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % total,
    }));
  };

  const prevImage = (productId: number, total: number) => {
    setCurrentImages(prev => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + total) % total,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Head title="Home" />

      {/* ================= TOP BAR ================= */}
      <div className="bg-gray-900 text-white py-2.5 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> +855 123 456 789
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> agriconnectbtb312@gmail.com
            </span>
          </div>
          <div className="flex gap-4">
            <span>My Account</span>
            <span>USD 💵</span>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <Header
        cartCount={0}
        wishlistCount={0}
        onNavigate={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAuthenticated={!!user}
        userName={user?.username ?? ''}
      />

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-green-600 font-semibold mb-3 text-sm uppercase">
                បញ្ចុះតម្លៃរហូតដល់ 50%
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                ស្រស់ៗពីកសិដ្ឋាន សរីរាង្គ
                <br />
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Get our lorem ipsum suspendisse ultrices gravida.
              </p>

              {user ? (
                <Link
                  href="/shop"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold"
                >
                  Shop Online →
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold"
                >
                  Login to Shop →
                </Link>
              )}
            </div>

            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800"
              alt="Hero"
              className="rounded-3xl shadow-2xl object-cover w-full max-w-md md:max-w-lg lg:max-w-xl h-auto mx-auto"
            />
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-0">
        <h2 className="text-4xl font-bold mb-8">🧺 ផលិតផលទាំងអស់</h2>
        {loading ? (
          <p className="text-center text-gray-500">កំពុងផ្ទុកផលិតផល...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">រកមិនឃើញផលិតផល</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(p => {
              const images = p.images || [];
              const currentIndex = currentImages[p.product_id] ?? 0;

              return (
                <div key={p.product_id} className="bg-white rounded-2xl border hover:shadow-xl transition">
                  {/* Image carousel */}
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100 ">
                    <img
                      src={images[currentIndex]?.image_url || 'https://via.placeholder.com/400'}
                      alt={p.productname}
                      className="w-full h-full object-cover transition"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(p.product_id, images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => nextImage(p.product_id, images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow"
                        >
                          →
                        </button>
                      </>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{p.productname}</h3>

                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                      ))}
                    </div>

                    <p className="text-green-600 font-bold mb-3">
                      {p.price.toLocaleString()} ៛ / {p.unit}
                    </p>

                    <div className="flex gap-2">
                      <Link
                        href={`/product/${p.product_id}`}
                        className="flex-1 bg-green-500 text-white text-center py-2 rounded-xl"
                      >
                        ទិញឥឡូវនេះ
                      </Link>
                      <button className="p-2 border rounded-xl">
                        <ShoppingCart />
                      </button>
                      <button className="p-2 border rounded-xl">
                        <Heart />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

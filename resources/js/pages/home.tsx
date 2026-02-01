/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import {
  Heart,
  Mail,
  Phone,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Leaf,
  Users,
  Award,
  MapPin,
  User,
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Footer } from './customer/footer-customer';
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
  images?: ProductImage[];
}

export default function Home({ auth }: PageProps) {
  const user = auth?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImages, setCurrentImages] = useState<Record<number, number>>({});

  // Fetch public products
  useEffect(() => {
    fetch('/products/public')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const raw = data.data ?? data ?? [];
        setProducts(
          raw.map((p: any) => ({
            product_id: p.product_id,
            productname: p.productname || 'គ្មានឈ្មោះ',
            price: Number(p.price) || 0,
            unit: p.unit || 'kg',
            images: (p.images || []).map((img: any) => ({
              // Use the URL directly from API (model already adds asset('storage/...'))
              image_url: img.image_url || 'https://via.placeholder.com/400?text=គ្មានរូបភាព',
              is_primary: img.is_primary || false,
            })),
          }))
        );
      })
      .catch((err) => {
        console.error('Fetch products failed:', err);
        setError('មិនអាចផ្ទុកផលិតផល ឬរូបភាពបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.productname.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Image carousel
  const nextImage = (productId: number, total: number) => {
    setCurrentImages((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % total,
    }));
  };

  const prevImage = (productId: number, total: number) => {
    setCurrentImages((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + total) % total,
    }));
  };

  // Khmer price formatter
  const toKhmerPrice = (price: number): string => {
    const formatted = Math.floor(price).toLocaleString('en-US');
    return formatted.replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
  };

  // Static data (advantages, categories, farmers)
  const advantages = [
    { icon: <Truck className="w-8 h-8" />, title: 'បញ្ជាទិញតាមអនឡាញ', desc: 'ផ្គត់ផ្គង់ដល់ទ្វារផ្ទះ' },
    { icon: <Shield className="w-8 h-8" />, title: 'ទំនិញធានាសុវត្ថិភាព', desc: 'គ្មានថ្នាំកូនសម្លាប់សត្វល្អិត' },
    { icon: <Leaf className="w-8 h-8" />, title: 'ផលិតផលសរីរាង្គ', desc: 'ប្រមូលផលពីស្រែធម្មជាតិ' },
    { icon: <Users className="w-8 h-8" />, title: 'គាំទ្រកសិករក្នុងស្រុក', desc: 'ទិញផ្ទាល់ពីកសិករ គ្មានអ្នកកាត់កណ្តាល' },
  ];

  const battambangCategories = [
    { name: 'ស្ពាន់ស', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', desc: 'បន្លែស្រស់ពីស្រែ' },
    { name: 'ផ្លែឈើ', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop', desc: 'ផ្លែឈើស្រស់បំផុត' },
    { name: 'ស្រូវនិងអង្ករ', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', desc: 'ស្រូវសាយដំបងល្បីល្បាញ' },
    { name: 'ដំណាំឧស្សាហកម្ម', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', desc: 'កាកាវ ត្នោត ដូង' },
    { name: 'សាច់សត្វ', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop', desc: 'សាច់ស្រស់ពីកសិករ' },
    { name: 'ទឹកដោះគោ', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop', desc: 'ទឹកដោះគោស្អាត' },
  ];

  const featuredFarmers = [
    { name: 'កសិករម៉ឹង', location: 'ស្រុកឯកភ្នំ', rating: 4.8, products: 'ស្ពាន់ស ត្រសក់' },
    { name: 'កសិករសុខា', location: 'ស្រុកបវេល', rating: 4.9, products: 'ស្រូវសាយ អង្ករ' },
    { name: 'កសិករវ៉ាន់', location: 'ស្រុកមោង', rating: 4.7, products: 'ផ្លែត្របែក ល្ហុង' },
  ];

  return (
    <div className="min-h-screen bg-white font-siemreap">
      <Head title="ទំព័រដើម - កសិផលខេត្តបាត់ដំបង" />

      {/* Top Bar */}
      <div className="bg-gray-900 px-4 py-2.5 text-sm text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> +855 123 456 789
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> agriconnectbtb312@gmail.com
            </span>
          </div>
          <div className="flex gap-4">
            <span>My Account</span>
            <span>USD 💵</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        cartCount={0}
        wishlistCount={0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAuthenticated={!!user}
        userName={user?.username ?? ''}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pt-16 md:pt-40 pb-16 md:pb-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.15)_0%,transparent_50%)]"></div>
        </div>

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

                {/* Optional secondary CTA or trust element */}
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

                {/* Optional floating badge / accent */}
                <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg border border-green-100">
                <p className="text-sm font-medium text-green-700">100% សរីរាង្គ</p>
                </div>
            </div>
            </div>
        </div>
        </section>

      {/* Advantages */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="rounded-2xl border border-green-100 bg-white p-6 text-center hover:shadow-lg transition group"
            >
              <div className="mb-4 text-green-600 group-hover:scale-110 transition-transform">
                {adv.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{adv.title}</h3>
              <p className="text-sm text-gray-600">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-moul">
            ប្រភេទកសិផលពេញនិយម
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            រកមើលកសិផលគ្រប់ប្រភេទដែលផលិតនៅក្នុងខេត្តបាត់ដំបង
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {battambangCategories.map((cat, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-green-100 bg-white hover:shadow-lg transition cursor-pointer group"
            >
              <div className="aspect-square overflow-hidden bg-green-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
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

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-moul">
            🧺 ផលិតផលទាំងអស់
          </h2>
          <div className="text-gray-600 font-medium">
            {filteredProducts.length} ផលិតផល
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-lg text-gray-500 animate-pulse">
            កំពុងផ្ទុកផលិតផល...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-lg text-red-600">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 py-20 text-center">
            <p className="text-xl font-medium text-gray-700 mb-3">
              មិនទាន់មានផលិតផលសម្រាប់បង្ហាញទេ
            </p>
            <p className="text-gray-500">
              កសិផលស្រស់ៗពីបាត់ដំបងកំពុងមកដល់ឆាប់ៗនេះ! សូមត្រឡប់មកម្តងទៀត។
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => {
              const images = p.images || [];
              const currentIndex = currentImages[p.product_id] ?? 0;
              const mainImage =
                images[currentIndex]?.image_url ||
                images.find((i) => i.is_primary)?.image_url ||
                'https://via.placeholder.com/400?text=គ្មានរូបភាព';

              return (
                <div
                  key={p.product_id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-2xl hover:border-green-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-gray-50">
                    <img
                      src={mainImage}
                      alt={p.productname}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Image load failed for:', mainImage);
                        e.currentTarget.src = 'https://via.placeholder.com/400?text=រូបភាពមិនដំណើរការ';
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(p.product_id, images.length)}
                          className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                          aria-label="រូបមុន"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => nextImage(p.product_id, images.length)}
                          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                          aria-label="រូបបន្ទាប់"
                        >
                          →
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-green-700 transition-colors">
                      {p.productname}
                    </h3>

                    <div className="mb-3 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                      ))}
                    </div>

                    <p className="mb-4 text-2xl font-bold text-green-700">
                      {toKhmerPrice(p.price)} ៛
                      <span className="ml-1 text-base font-normal text-gray-600">/ {p.unit}</span>
                    </p>

                    <div className="flex gap-3">
                      <Link
                        href={`/product/${p.product_id}`}
                        className="flex-1 rounded-xl bg-green-600 py-3 text-center text-white font-medium hover:bg-green-700 transition"
                      >
                        ទិញឥឡូវនេះ
                      </Link>
                      <button className="rounded-xl border border-gray-300 p-3 hover:bg-gray-50 transition">
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                      <button className="rounded-xl border border-gray-300 p-3 hover:bg-gray-50 transition">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-600 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold font-moul">
            ចូលរួមជាមួយយើង
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-xl opacity-90">
            ប្រសិនបើអ្នកជាកសិករនៅខេត្តបាត់ដំបង ហើយចង់លក់ផលិតផលរបស់អ្នកតាមអនឡាញ
            សូមចុះឈ្មោះជាសមាជិកជាមួយយើងឥឡូវនេះ!
          </p>
          <div className="flex flex-col justify-center gap-5 sm:flex-row">
            <button className="rounded-full bg-white px-10 py-5 font-bold text-green-700 shadow-lg hover:bg-gray-100 transition">
              ចុះឈ្មោះជាកសិករ
            </button>
            <button className="rounded-full border-2 border-white px-10 py-5 font-bold hover:bg-white/10 transition">
              ស្វែងយល់បន្ថែម
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
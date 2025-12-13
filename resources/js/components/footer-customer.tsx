import { Facebook, Instagram, Mail, Phone, MapPin} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold mb-4"><span className="text-orange-500">HOME</span><span className="text-green-500">DOKAN</span></div>
              <p className="text-gray-400 mb-6 leading-relaxed">Connecting local farmers with the community through an easy, modern marketplace experience.</p>
              <div className="flex items-center gap-3">
                <img src="https://flagcdn.com/w40/kh.png" alt="Cambodia" className="w-8 h-5 rounded" />
                <span className="text-sm text-gray-400">Proudly Cambodian</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">{['About Us', 'Contact', 'Terms & Conditions', 'Privacy Policy', 'FAQs'].map((l, i) => <li key={i}><a href="#" className="text-gray-400 hover:text-green-500 transition">{l}</a></li>)}</ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">Categories</h3>
              <ul className="space-y-3">{['Vegetables', 'Fresh Fruits', 'Organic Products', 'Dairy & Eggs', 'Meat & Fish'].map((c, i) => <li key={i}><a href="#" className="text-gray-400 hover:text-green-500 transition">{c}</a></li>)}</ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">Contact Us</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-400">Battambang, Cambodia</span></div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-green-500 flex-shrink-0" /><span className="text-gray-400">+855 12 345 678</span></div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-green-500 flex-shrink-0" /><span className="text-gray-400">info@homedokan.kh</span></div>
              </div>
              <div className="flex items-center gap-3">
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2025 HomeDokan. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-green-500 transition">Privacy Policy</a>
                <a href="#" className="hover:text-green-500 transition">Terms of Service</a>
                <a href="#" className="hover:text-green-500 transition">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
}

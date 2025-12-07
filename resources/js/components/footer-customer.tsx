import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto mb-16 md:mb-0">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#228B22] mb-3">About AgriMarket</h3>
            <p className="text-sm text-gray-600">
              Connecting Battambang buyers with local farmers for fresh agricultural products.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <img
                src="https://flagcdn.com/w40/kh.png"
                alt="Cambodia Flag"
                className="w-6 h-4"
              />
              <span className="text-sm text-gray-600">Proudly Cambodian</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#228B22] mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-[#228B22] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[#228B22] mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Rice</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Vegetables</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Fruits</a></li>
              <li><a href="#" className="hover:text-[#228B22] transition-colors">Organic Products</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-[#228B22] mb-3">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+855 12 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@agrimarket.kh</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-600 hover:text-[#228B22] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#228B22] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>© 2025 AgriMarket Battambang. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

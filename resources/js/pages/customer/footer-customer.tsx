import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20" style={{ fontFamily: "'Battambang', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Battambang:wght@400;700&display=swap');
        .font-moul { font-family: 'Moul', serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="font-moul text-2xl mb-4 leading-relaxed">
              <span className="text-orange-500">កសិផល</span>
              <span className="text-green-500">ខេត្តបាត់ដំបង</span>
            </div>
            <p className="text-gray-400 mb-6 leading-loose text-sm">
              ផ្សារភ្ជាប់កសិករ អាជីវករក្នុងស្រុកជាមួយសហគមន៍ តាមរយៈបទពិសោធន៍ទីផ្សារដែលងាយស្រួល និងទំនើប។
            </p>
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/w40/kh.png" alt="Cambodia" className="w-8 h-5 " />
              <span className="text-sm text-gray-400">កសិផលខេត្តបាត់ដំបង</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-moul text-base mb-6 leading-relaxed">តំណភ្ជាប់រហ័ស</h3>
            <ul className="space-y-3">
              {[
                'អំពីយើង',
                'ទំនាក់ទំនង',
                'លក្ខខណ្ឌ និងកំណត់ចំណាំ',
                'គោលការណ៍ភាពឯកជន',
                // 'សំណួរញឹកញាប់',
              ].map((l, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-green-500 transition text-sm leading-loose">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-moul text-base mb-6 leading-relaxed">ប្រភេទផលិតផល</h3>
            <ul className="space-y-3">
              {[
                'បន្លែ',
                'ផ្លែឈើស្រស់',
                // 'ផលិតផលធម្មជាតិ',
                'ទឹកដោះគោ និងពង',
                'សាច់ និងត្រី',
              ].map((c, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-green-500 transition text-sm leading-loose">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-moul text-base mb-6 leading-relaxed">ទំនាក់ទំនងយើង</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm leading-loose">បាត់ដំបង, កម្ពុជា</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+855 88 983 6146</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">agri-battambang@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/share/1FfwAf3D24/?mibextid=wwXIfr" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/somphors_1?igsh=MW4xMHIxbGpzanp0aA%3D%3D&utm_source=qr" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:agri-battambang@gmail.com" className="bg-gray-800 p-3 rounded-full hover:bg-green-500 transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 កសិផលខេត្តបាត់ដំបង. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-green-500 transition">គោលការណ៍ភាពឯកជន</a>
              <a href="#" className="hover:text-green-500 transition">លក្ខខណ្ឌសេវាកម្ម</a>
              <a href="#" className="hover:text-green-500 transition">គូគីស</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { FormEventHandler, useEffect, useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const checkUsernameAvailability = async (username: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-username', { params: { username } });
    return resp?.data?.available ?? null;
  } catch (e) {
    console.error('checkUsernameAvailability error', e);
    return null;
  }
};

const checkEmailAvailability = async (email: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-email', { params: { email } });
    return resp?.data?.available ?? null;
  } catch (e) {
    console.error('checkEmailAvailability error', e);
    return null;
  }
};

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as 'customer' | 'seller',
    phone: '',
    farm_name: '',
    location_district: '',
    description: '',
  });

  const [isSeller, setIsSeller] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => reset('password', 'password_confirmation');
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Username availability
  useEffect(() => {
    if (data.username.length < 3) return setUsernameStatus('idle');
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailability(data.username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 800);
    return () => clearTimeout(timer);
  }, [data.username]);

  // Email availability
  useEffect(() => {
    if (!data.email) return setEmailStatus('idle');
    if (!validateEmail(data.email)) return setEmailStatus('invalid');
    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkEmailAvailability(data.email);
      setEmailStatus(available ? 'valid' : 'taken');
    }, 800);
    return () => clearTimeout(timer);
  }, [data.email]);

  const handleRoleChange = (role: 'customer' | 'seller') => {
    setData('role', role);
    setIsSeller(role === 'seller');
  };

  const passwordsMatch = useMemo(() => {
    if (!data.password_confirmation) return null;
    return data.password === data.password_confirmation;
  }, [data.password, data.password_confirmation]);

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    post('/register', {
      onError: (errors) => console.error('Registration error:', errors),
      onSuccess: () => console.log('Registration successful'),
    });
  };

  const ValidationIndicator = ({ status }: { status: string }) => {
    if (status === 'checking') return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    if (status === 'available' || status === 'valid') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'taken' || status === 'invalid') return <XCircle className="w-5 h-5 text-red-600" />;
    return null;
  };

  const isPasswordValid =
    data.password.length >= 8 &&
    /[a-z]/.test(data.password) &&
    /[A-Z]/.test(data.password) &&
    /[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password) &&
    passwordsMatch;

  return (
    <>
      <Head title="Register" />
      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-0 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-2">
            <h1 className="text-2xl font-bold text-green-600">AgriMarket Battambang</h1>
            <div className="mt-1">
              <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
              <div className="w-12 h-1 bg-green-600 mt-0"></div>
            </div>

            <form onSubmit={submit} className="space-y-2 mt-2">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Register as:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('customer')}
                    className={`p-2 border-2 rounded-lg text-center transition ${
                      data.role === 'customer' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🛒 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('seller')}
                    className={`p-2 border-2 rounded-lg text-center transition ${
                      data.role === 'seller' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🏪 Seller
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    className="w-full px-2 py-1 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Choose a username"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={usernameStatus} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full px-1 py-1 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={emailStatus} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+855 12 345 678"
                  required
                />
              </div>

              {/* Seller Info */}
              {isSeller && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <input
                    id="farm_name"
                    name="farm_name"
                    type="text"
                    value={data.farm_name}
                    onChange={(e) => setData('farm_name', e.target.value)}
                    placeholder="Farm/Shop Name"
                    required={isSeller}
                    className="w-full px-1 py-1 border rounded-lg"
                  />
                  <input
                    id="location_district"
                    name="location_district"
                    type="text"
                    value={data.location_district}
                    onChange={(e) => setData('location_district', e.target.value)}
                    placeholder="Location (District)"
                    required={isSeller}
                    className="w-full px-1 py-1 border rounded-lg"
                  />
                  <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* HubSpot-style password checklist */}
                <div className="mt-2 text-sm space-y-1">
                  <p className={data.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>• At least 8 characters</p>
                  <p className={/[a-z]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>• One lowercase letter</p>
                  <p className={/[A-Z]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>• One uppercase letter</p>
                  <p className={/[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>
                    • One number, symbol, or space
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                {data.password_confirmation && data.password !== data.password_confirmation && (
                  <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                )}
                {data.password_confirmation && data.password === data.password_confirmation && (
                  <p className="text-green-600 text-xs mt-1">Passwords match</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <p className="text-center text-sm text-gray-600 mb-4">
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 underline">
                    Already registered?
                  </Link>
                </p>
                <button
                  type="submit"
                  disabled={processing || usernameStatus === 'taken' || emailStatus === 'taken' || emailStatus === 'invalid' || !isPasswordValid}
                  className="w-full bg-green-600 text-white py-1 rounded-full font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Registering...' : 'Register'}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-xs text-gray-500">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <span className="mx-2">•</span>
                <a href="#" className="hover:underline">Terms & Conditions</a>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 to-green-600 items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-4">Hello,</h2>
            <h2 className="text-5xl font-bold mb-6">Friend!</h2>
            <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
            <p className="text-xl mb-8 max-w-md mx-auto">
              Fill up personal information and start journey with us.
            </p>
            <Link
              href="/login"
              className="inline-block px-12 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-green-600 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

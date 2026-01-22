import { FormEventHandler, useEffect, useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

// const checkUsernameAvailability = async (username: string): Promise<boolean | null> => {
//   try {
//     const resp = await axios.get('/check-username', { params: { username } });
//     return resp?.data?.available ?? null;
//   } catch (e) {
//     console.error('checkUsernameAvailability error', e);
//     return null;
//   }
// };

const checkEmailAvailability = async (email: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-email', { params: { email } });
    return resp?.data?.available ?? null;
  } catch (e) {
    console.error('checkEmailAvailability error', e);
    return null;
  }
};

const checkPhoneAvailability = async (phone: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-phone', { params: { phone } });
    return resp?.data?.available ?? null;
  } catch (e) {
    console.error('checkPhoneAvailability error', e);
    return null;
  }
};

interface Location {
  province_id?: number;
  district_id?: number;
  commune_id?: number;
  village_id?: number;
  name_en: string;
  name_km: string;
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'customer' as 'customer' | 'seller',
  phone: '',
  // កុំប្រើ undefined, ប្រើ empty string
  farm_name: '',
  province_id: '',
  district_id: '',
  commune_id: '',
  village_id: '',
  description: '',
});

  const [isSeller, setIsSeller] = useState(false);
//   const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  // Location data states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [communes, setCommunes] = useState<Location[]>([]);
  const [villages, setVillages] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    return () => reset('password', 'password_confirmation');
  }, []);

  // Fetch provinces when seller is selected
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!isSeller) return;

      setLoadingLocations(true);
      try {
        const response = await axios.get('/api/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchProvinces();
  }, [isSeller]);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!data.province_id) {
        setDistricts([]);
        setCommunes([]);
        setVillages([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await axios.get(`/api/districts/${data.province_id}`);
        setDistricts(response.data);
        setCommunes([]);
        setVillages([]);
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchDistricts();
    setData((prev) => ({ ...prev, district_id: '', commune_id: '', village_id: '' }));
  }, [data.province_id]);

  // Fetch communes when district changes
  useEffect(() => {
    const fetchCommunes = async () => {
      if (!data.district_id) {
        setCommunes([]);
        setVillages([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await axios.get(`/api/communes/${data.district_id}`);
        setCommunes(response.data);
        setVillages([]);
      } catch (error) {
        console.error('Error fetching communes:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchCommunes();
    setData((prev) => ({ ...prev, commune_id: '', village_id: '' }));
  }, [data.district_id]);

  // Fetch villages when commune changes
  useEffect(() => {
    const fetchVillages = async () => {
      if (!data.commune_id) {
        setVillages([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await axios.get(`/api/villages/${data.commune_id}`);
        setVillages(response.data);
      } catch (error) {
        console.error('Error fetching villages:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchVillages();
    setData((prev) => ({ ...prev, village_id: '' }));
  }, [data.commune_id]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{9,10}$/.test(phone);

//   // Username availability
//   useEffect(() => {
//     if (data.username.length < 3) return setUsernameStatus('idle');
//     setUsernameStatus('checking');
//     const timer = setTimeout(async () => {
//       const available = await checkUsernameAvailability(data.username);
//       setUsernameStatus(available ? 'available' : 'taken');
//     }, 800);
//     return () => clearTimeout(timer);
//   }, [data.username]);

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

  // Phone availability
  useEffect(() => {
    if (!data.phone) return setPhoneStatus('idle');
    if (!validatePhone(data.phone)) return setPhoneStatus('invalid');
    setPhoneStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkPhoneAvailability(data.phone);
      setPhoneStatus(available ? 'valid' : 'taken');
    }, 800);
    return () => clearTimeout(timer);
  }, [data.phone]);

  const handleRoleChange = (role: 'customer' | 'seller') => {
    setData('role', role);
    setIsSeller(role === 'seller');
//     if (role === 'customer') {
//     setData('farm_name', undefined);
//     setData('province_id', undefined);
//     setData('district_id', undefined);
//     setData('commune_id', undefined);
//     setData('village_id', undefined);
//     setData('description', undefined);
//   } else {
//     setData('farm_name', '');
//     setData('province_id', '');
//     setData('district_id', '');
//     setData('commune_id', '');
//     setData('village_id', '');
//     setData('description', '');
//   }
  };

  const passwordsMatch = useMemo(() => {
    if (!data.password_confirmation) return null;
    return data.password === data.password_confirmation;
  }, [data.password, data.password_confirmation]);

//   const submit: FormEventHandler<HTMLFormElement> = (e) => {
//     e.preventDefault();
//     post('/register', {
//       onError: (errors) => console.error('Registration error:', errors),
//       onSuccess: () => {},
//     });
//   };
const submit: FormEventHandler<HTMLFormElement> = (e) => {
  e.preventDefault();

  console.log('=== FORM SUBMIT DEBUG ===');
  console.log('Data being sent:', data);
  console.log('Username:', data.username);
  console.log('Email:', data.email);
  console.log('Phone:', data.phone);
  console.log('Role:', data.role);
  console.log('Is Seller:', isSeller);
  console.log('Is Form Valid:', isFormValid);
  console.log('Processing:', processing);

  post('/register', {
    onError: (errors) => {
      console.error('❌ Registration error:', errors);
    },
    onSuccess: (response) => {
      console.log('✅ Registration success:', response);
    },
    onFinish: () => {
      console.log('🏁 Request finished');
    },
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

  const isFormValid =
    data.username.length >= 3 &&
    emailStatus === 'valid' &&
    phoneStatus === 'valid' &&
    isPasswordValid &&
    (!isSeller || (data.farm_name && data.province_id && data.district_id));

  return (
    <>
      <Head title="Register" />
      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-6">
            <h1 className="text-2xl font-bold text-green-600">សូមស្វាគមន៍មកកាន់វេទិកាកសិផលខេត្តបាត់ដំបង</h1>
            <div className="mt-2">
              <h6 className="text-3xl font-bold text-gray-900">បង្កើតគណនី</h6>
              <div className="w-12 h-1 bg-green-600 mt-1"></div>
            </div>

            <form onSubmit={submit} className="space-y-3 mt-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ចុះឈ្មោះជា</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('customer')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      data.role === 'customer' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🛒 អតិថិជន
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('seller')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      data.role === 'seller' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🏪 អាជីវករ
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  ឈ្មោះអ្នកប្រើ (Username)
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="បំពេញឈ្មោះពេញលេញរបស់អ្នក"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {/* <ValidationIndicator status={usernameStatus} /> */}
                  </div>
                </div>
                {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">អ៊ីមែល</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ឧទាហរណ៍ ៈ your@email.com"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={emailStatus} />
                  </div>
                </div>
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  លេខទូរស័ព្ទ
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setData('phone', value);
                      }
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="បំពេញលេខទូរស័ព្ទរបស់អ្នក"
                    required
                    maxLength={10}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={phoneStatus} />
                  </div>
                </div>
                {phoneStatus === 'invalid' && data.phone.length > 0 && (
                  <p className="text-red-600 text-xs mt-1">លេខទូរស័ព្ទត្រូវមាន 9-10 ខ្ទង់</p>
                )}
                {phoneStatus === 'taken' && (
                  <p className="text-red-600 text-xs mt-1">លេខទូរស័ព្ទនេះត្រូវបានចុះឈ្មោះរួចហើយ</p>
                )}
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Seller Info */}
              {isSeller && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  {/* Farm Name */}
                  <div>
                    <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700 mb-1">
                      ឈ្មោះហាង/កសិដ្ឋាន <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="farm_name"
                      name="farm_name"
                      type="text"
                      value={data.farm_name || ''}
                      onChange={(e) => setData('farm_name', e.target.value)}
                      placeholder="បំពេញឈ្មោះហាង/កសិដ្ឋាន"
                      required={isSeller}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.farm_name && <p className="text-red-600 text-xs mt-1">{errors.farm_name}</p>}
                  </div>

                  {/* Province */}
                  <div>
                    <label htmlFor="province_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ខេត្ត <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="province_id"
                      name="province_id"
                      value={data.province_id || ''}
                      onChange={(e) => setData('province_id', e.target.value)}
                      required={isSeller}
                      disabled={loadingLocations}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">-- ជ្រើសរើសខេត្ត --</option>
                      {provinces.map((province) => (
                        <option key={province.province_id} value={province.province_id}>
                          {province.name_km}
                        </option>
                      ))}
                    </select>
                    {errors.province_id && <p className="text-red-600 text-xs mt-1">{errors.province_id}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="district_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ស្រុក/ក្រុង <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="district_id"
                      name="district_id"
                      value={data.district_id || ''}
                      onChange={(e) => setData('district_id', e.target.value)}
                      required={isSeller}
                      disabled={!data.province_id || loadingLocations}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">-- ជ្រើសរើសស្រុក/ក្រុង --</option>
                      {districts.map((district) => (
                        <option key={district.district_id} value={district.district_id}>
                          {district.name_km}
                        </option>
                      ))}
                    </select>
                    {errors.district_id && <p className="text-red-600 text-xs mt-1">{errors.district_id}</p>}
                  </div>

                  {/* Commune */}
                  <div>
                    <label htmlFor="commune_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ឃុំ/សង្កាត់
                    </label>
                    <select
                      id="commune_id"
                      name="commune_id"
                      value={data.commune_id || ''}
                      onChange={(e) => setData('commune_id', e.target.value)}
                      disabled={!data.district_id || loadingLocations}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">-- ជ្រើសរើសឃុំ/សង្កាត់ (ស្រេចចិត្ត) --</option>
                      {communes.map((commune) => (
                        <option key={commune.commune_id} value={commune.commune_id}>
                          {commune.name_km}
                        </option>
                      ))}
                    </select>
                    {errors.commune_id && <p className="text-red-600 text-xs mt-1">{errors.commune_id}</p>}
                  </div>

                  {/* Village */}
                  <div>
                    <label htmlFor="village_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ភូមិ
                    </label>
                    <select
                      id="village_id"
                      name="village_id"
                      value={data.village_id || ''}
                      onChange={(e) => setData('village_id', e.target.value)}
                      disabled={!data.commune_id || loadingLocations}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">-- ជ្រើសរើសភូមិ (ស្រេចចិត្ត) --</option>
                      {villages.map((village) => (
                        <option key={village.village_id} value={village.village_id}>
                          {village.name_km}
                        </option>
                      ))}
                    </select>
                    {errors.village_id && <p className="text-red-600 text-xs mt-1">{errors.village_id}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      ពិពណ៌នាអំពីហាង/កសិដ្ឋាន
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={data.description || ''}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="ពិពណ៌នាអំពីហាង/កសិដ្ឋានរបស់អ្នក (ស្រេចចិត្ត)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">ពាក្យសម្ងាត់</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                {/* Password checklist */}
                <div className="mt-2 text-sm space-y-1">
                  <p className={data.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    • យ៉ាងតិចត្រូវមាន 8 តួ
                  </p>
                  <p className={/[a-z]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>
                    • យ៉ាងតិចត្រូវមានអក្សរតូច 1 តួ
                  </p>
                  <p className={/[A-Z]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>
                    • យ៉ាងតិចត្រូវមានអក្សរធំ 1 តួ
                  </p>
                  <p className={/[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password) ? 'text-green-600' : 'text-gray-500'}>
                    • យ៉ាងតិចត្រូវមានលេខ និងសញ្ញា 1 តួ
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  បញ្ជាក់ពាក្យសម្ងាត់
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                {data.password_confirmation && data.password !== data.password_confirmation && (
                  <p className="text-red-600 text-xs mt-1">ពាក្យសម្ងាត់មិនត្រូវគ្នា</p>
                )}
                {data.password_confirmation && data.password === data.password_confirmation && (
                  <p className="text-green-600 text-xs mt-1">ពាក្យសម្ងាត់ត្រូវគ្នា</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <p className="text-center text-sm text-gray-600 mb-4">
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 underline">
                    បានបង្កើតគណនីរួចហើយ?
                  </Link>
                </p>
                <button
                  type="submit"
                  disabled={processing || !isFormValid}
                  className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'កំពុងចុះឈ្មោះ...' : 'ចុះឈ្មោះ'}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-500">
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

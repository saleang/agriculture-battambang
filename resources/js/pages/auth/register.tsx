import { FormEventHandler, useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft, User, Store, MapPin, Lock, Leaf } from 'lucide-react';
import axios from 'axios';

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as 'customer' | 'seller',
    phone: '',
    farm_name: '',
    province_id: '',
    district_id: '',
    commune_id: '',
    village_id: '',
    description: '',
  });

  const [isSeller, setIsSeller] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  
  // Location data states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [communes, setCommunes] = useState<Location[]>([]);
  const [villages, setVillages] = useState<Location[]>([]);

  useEffect(() => {
    return () => reset('password', 'password_confirmation');
  }, []);

  // Fetch provinces when seller is selected
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!isSeller) return;
      try {
        const response = await axios.get('/api/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
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
      try {
        const response = await axios.get(`/api/districts/${data.province_id}`);
        setDistricts(response.data);
        setCommunes([]);
        setVillages([]);
      } catch (error) {
        console.error('Error fetching districts:', error);
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
      try {
        const response = await axios.get(`/api/communes/${data.district_id}`);
        setCommunes(response.data);
        setVillages([]);
      } catch (error) {
        console.error('Error fetching communes:', error);
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
      try {
        const response = await axios.get(`/api/villages/${data.commune_id}`);
        setVillages(response.data);
      } catch (error) {
        console.error('Error fetching villages:', error);
      }
    };
    fetchVillages();
    setData((prev) => ({ ...prev, village_id: '' }));
  }, [data.commune_id]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{9,10}$/.test(phone);

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
  };

  const passwordsMatch = data.password_confirmation ? data.password === data.password_confirmation : null;

  const isStep1Valid = () => {
    const basicValid = data.username.length >= 3 && emailStatus === 'valid' && phoneStatus === 'valid';
    if (isSeller) {
      return basicValid && data.farm_name.trim().length > 0;
    }
    return basicValid;
  };

  const isStep2Valid = () => {
    if (!isSeller) return true;
    return data.province_id && data.district_id;
  };

  const isStep3Valid = () => {
    const passwordValid = data.password.length >= 8 &&
      /[a-z]/.test(data.password) &&
      /[A-Z]/.test(data.password) &&
      /[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password);
    return passwordValid && passwordsMatch;
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      if (!isSeller) {
        setCurrentStep(3); // Skip location step for customers
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3 && !isSeller) {
      setCurrentStep(1); // Go back to step 1 for customers
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep3Valid() || (isSeller && !isStep2Valid())) return;
    
    post('/register', {
      onError: (errors) => {
        console.error('❌ Registration error:', errors);
      },
      onSuccess: (response) => {
        console.log('✅ Registration success:', response);
      },
    });
  };

  const ValidationIndicator = ({ status }: { status: string }) => {
    if (status === 'checking') return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    if (status === 'available' || status === 'valid') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'taken' || status === 'invalid') return <XCircle className="w-5 h-5 text-red-600" />;
    return null;
  };

  return (
    <>
      <Head title="ចុះឈ្មោះគណនី - កសិផលបាត់ដំបង" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-2 sm:p-4">
        <div className="w-full max-w-6xl bg-white rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row" style={{ maxHeight: '90vh' }}>
          {/* Left Panel - Registration Form */}
          <div className="w-full lg:w-2/3 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full overflow-hidden">
              {/* Header - Fixed */}
              <div className="flex-shrink-0 mb-4 lg:mb-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">ចុះឈ្មោះគណនី</h1>
                    <div className="flex items-center gap-2 mt-1.5 lg:mt-2">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full">
                        <User className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="text-[10px] sm:text-xs lg:text-sm font-medium">
                          {isSeller ? 'អាជីវករ (អ្នកលក់)' : 'អតិថិជន (អ្នកទិញ)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-700 text-[10px] sm:text-xs lg:text-sm font-medium">
                    មានគណនីរួច?
                  </Link>
                </div>
                
                {/* Progress Steps */}
                <div className="mb-3 lg:mb-4">
                  <div className="flex items-center justify-between relative max-w-md mx-auto">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                    {[1, 2, 3].map((step) => {
                      // Hide step 2 progress for customers
                      if (!isSeller && step === 2) return null;
                      
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center flex-1">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                            <span className="text-[10px] sm:text-xs lg:text-sm font-medium">
                              {!isSeller && step === 3 ? '2' : step}
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] lg:text-xs mt-1 lg:mt-1.5 text-center whitespace-nowrap">
                            {step === 1 && 'ព័ត៌មាន'}
                            {step === 2 && isSeller && 'ទីតាំង'}
                            {step === 3 && 'សុវត្ថិភាព'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Container - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                <form onSubmit={submit} className="space-y-4 lg:space-y-5">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
                      <div>
                        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2.5 lg:mb-3 flex items-center gap-1.5 lg:gap-2">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
                          ជ្រើសរើសប្រភេទគណនី
                        </h2>
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4">
                          <button
                            type="button"
                            onClick={() => handleRoleChange('customer')}
                            className={`p-3 sm:p-4 lg:p-5 border-2 rounded-lg lg:rounded-xl text-center transition-all ${data.role === 'customer' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex flex-col items-center gap-1.5 lg:gap-2">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600" />
                              <span className="font-medium text-xs sm:text-sm lg:text-base">អតិថិជន</span>
                              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">ទិញផលិតផលស្រស់ៗ</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoleChange('seller')}
                            className={`p-3 sm:p-4 lg:p-5 border-2 rounded-lg lg:rounded-xl text-center transition-all ${data.role === 'seller' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex flex-col items-center gap-1.5 lg:gap-2">
                              <Store className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600" />
                              <span className="font-medium text-xs sm:text-sm lg:text-base">អាជីវករ</span>
                              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">លក់ផលិតផលតាមអនឡាញ</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4">
                        {/* Username */}
                        <div>
                          <label htmlFor="username" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ឈ្មោះអ្នកប្រើប្រាស់
                          </label>
                          <input
                            id="username"
                            name="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="បំពេញឈ្មោះពេញលេញ"
                            required
                          />
                          {errors.username && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            អ៊ីមែល
                          </label>
                          <div className="relative">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={data.email}
                              onChange={(e) => setData('email', e.target.value)}
                              className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="your@email.com"
                              required
                            />
                            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                              <ValidationIndicator status={emailStatus} />
                            </div>
                          </div>
                          {errors.email && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="phone" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
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
                                if (value.length <= 10) setData('phone', value);
                              }}
                              className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="បំពេញលេខទូរស័ព្ទ"
                              required
                              maxLength={10}
                            />
                            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                              <ValidationIndicator status={phoneStatus} />
                            </div>
                          </div>
                          {phoneStatus === 'invalid' && data.phone.length > 0 && (
                            <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">លេខទូរស័ព្ទត្រូវមាន 9-10 ខ្ទង់</p>
                          )}
                          {errors.phone && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.phone}</p>}
                        </div>

                        {/* Farm Name (Seller only) */}
                        {isSeller && (
                          <div>
                            <label htmlFor="farm_name" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                              ឈ្មោះហាង/កសិដ្ឋាន
                            </label>
                            <input
                              id="farm_name"
                              name="farm_name"
                              type="text"
                              value={data.farm_name}
                              onChange={(e) => setData('farm_name', e.target.value)}
                              className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="បំពេញឈ្មោះហាង/កសិដ្ឋាន"
                              required={isSeller}
                            />
                            {errors.farm_name && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.farm_name}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location (Seller only) */}
                  {currentStep === 2 && isSeller && (
                    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
                      <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2.5 lg:mb-3 flex items-center gap-1.5 lg:gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
                        ព័ត៌មានទីតាំង
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4">
                        {/* Province */}
                        <div>
                          <label htmlFor="province_id" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ខេត្ត
                          </label>
                          <select
                            id="province_id"
                            name="province_id"
                            value={data.province_id}
                            onChange={(e) => setData('province_id', e.target.value)}
                            required={isSeller}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">-- ជ្រើសរើសខេត្ត --</option>
                            {provinces.map((province) => (
                              <option key={province.province_id} value={province.province_id}>
                                {province.name_km}
                              </option>
                            ))}
                          </select>
                          {errors.province_id && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.province_id}</p>}
                        </div>

                        {/* District */}
                        <div>
                          <label htmlFor="district_id" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ស្រុក/ក្រុង
                          </label>
                          <select
                            id="district_id"
                            name="district_id"
                            value={data.district_id}
                            onChange={(e) => setData('district_id', e.target.value)}
                            required={isSeller}
                            disabled={!data.province_id}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">-- ជ្រើសរើសស្រុក/ក្រុង --</option>
                            {districts.map((district) => (
                              <option key={district.district_id} value={district.district_id}>
                                {district.name_km}
                              </option>
                            ))}
                          </select>
                          {errors.district_id && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.district_id}</p>}
                        </div>

                        {/* Commune */}
                        <div>
                          <label htmlFor="commune_id" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ឃុំ/សង្កាត់
                          </label>
                          <select
                            id="commune_id"
                            name="commune_id"
                            value={data.commune_id}
                            onChange={(e) => setData('commune_id', e.target.value)}
                            disabled={!data.district_id}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">-- ជ្រើសរើសឃុំ/សង្កាត់ (ស្រេចចិត្ត) --</option>
                            {communes.map((commune) => (
                              <option key={commune.commune_id} value={commune.commune_id}>
                                {commune.name_km}
                              </option>
                            ))}
                          </select>
                          {errors.commune_id && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.commune_id}</p>}
                        </div>

                        {/* Village */}
                        <div>
                          <label htmlFor="village_id" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ភូមិ
                          </label>
                          <select
                            id="village_id"
                            name="village_id"
                            value={data.village_id}
                            onChange={(e) => setData('village_id', e.target.value)}
                            disabled={!data.commune_id}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">-- ជ្រើសរើសភូមិ (ស្រេចចិត្ត) --</option>
                            {villages.map((village) => (
                              <option key={village.village_id} value={village.village_id}>
                                {village.name_km}
                              </option>
                            ))}
                          </select>
                          {errors.village_id && <p className="text-red-600 text-[10px] sm:text-xs mt-0.5 lg:mt-1">{errors.village_id}</p>}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                          ពិពណ៌នាអំពីហាង/កសិដ្ឋាន
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          placeholder="ពិពណ៌នាអំពីហាង/កសិដ្ឋានរបស់អ្នក (ស្រេចចិត្ត)"
                          className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Password */}
                  {currentStep === 3 && (
                    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
                      <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2.5 lg:mb-3 flex items-center gap-1.5 lg:gap-2">
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
                        ការកំណត់សុវត្ថិភាព
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {/* Password */}
                        <div>
                          <label htmlFor="password" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            ពាក្យសម្ងាត់
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={data.password}
                              onChange={(e) => setData('password', e.target.value)}
                              className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="••••••••"
                              autoComplete="new-password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                            </button>
                          </div>

                          {/* Password requirements */}
                          <div className="mt-2 lg:mt-3 space-y-1 lg:space-y-1.5">
                            <div className="flex items-center gap-1.5 lg:gap-2">
                              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${data.password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                              <span className={`text-[10px] sm:text-xs lg:text-sm ${data.password.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                                យ៉ាងតិច 8 តួអក្សរ
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 lg:gap-2">
                              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${/[a-z]/.test(data.password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                              <span className={`text-[10px] sm:text-xs lg:text-sm ${/[a-z]/.test(data.password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                                យ៉ាងតិច 1 អក្សរតូច
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 lg:gap-2">
                              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${/[A-Z]/.test(data.password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                              <span className={`text-[10px] sm:text-xs lg:text-sm ${/[A-Z]/.test(data.password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                                យ៉ាងតិច 1 អក្សរធំ
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 lg:gap-2">
                              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${/[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                              <span className={`text-[10px] sm:text-xs lg:text-sm ${/[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                                យ៉ាងតិច 1 តួលេខ ឬសញ្ញា
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="password_confirmation" className="block text-[11px] sm:text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1.5">
                            បញ្ជាក់ពាក្យសម្ងាត់
                          </label>
                          <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                          />
                          {data.password_confirmation && data.password !== data.password_confirmation && (
                            <p className="text-red-600 text-[10px] sm:text-xs mt-1.5 lg:mt-2 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> ពាក្យសម្ងាត់មិនត្រូវគ្នា
                            </p>
                          )}
                          {data.password_confirmation && data.password === data.password_confirmation && (
                            <p className="text-emerald-600 text-[10px] sm:text-xs mt-1.5 lg:mt-2 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> ពាក្យសម្ងាត់ត្រូវគ្នា
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Navigation Buttons - Fixed */}
              <div className="flex-shrink-0 pt-3 sm:pt-4 lg:pt-5 mt-3 sm:mt-4 lg:mt-5 border-t flex justify-between items-center">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-[11px] sm:text-xs lg:text-base"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                      ត្រឡប់ក្រោយ
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
                    ជំហាន {!isSeller && currentStep === 3 ? '2' : currentStep}/{!isSeller ? '2' : '3'}
                  </span>
                  
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        (currentStep === 1 && !isStep1Valid()) ||
                        (currentStep === 2 && !isStep2Valid())
                      }
                      className="px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-[11px] sm:text-xs lg:text-base"
                    >
                      បន្តទៅមុខ
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={processing || !isStep3Valid() || !isStep1Valid() || (isSeller && !isStep2Valid())}
                      className="px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-[11px] sm:text-xs lg:text-base whitespace-nowrap"
                    >
                      {processing ? 'កំពុងចុះឈ្មោះ...' : 'បញ្ចប់ការចុះឈ្មោះ'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Benefits */}
          <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-b from-emerald-600 to-green-700 text-white p-6 lg:p-8 flex-col justify-between overflow-y-auto">
            <div>
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-2">កសិផលបាត់ដំបង</h2>
                <p className="text-white/80 text-sm">ផលិតផលស្រស់ៗពីកសិករផ្ទាល់</p>
              </div>

              <div className="space-y-4 lg:space-y-5">
                <div className="flex items-start gap-2.5 lg:gap-3">
                  <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                    <Leaf className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm lg:text-base">កសិផលធម្មជាតិពិតៗ 100%</h4>
                    <p className="text-white/80 text-xs lg:text-sm">ធម្មជាតិសម្រាប់សុខភាពល្អ</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 lg:gap-3">
                  <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                    <Store className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm lg:text-base">ទិញផ្ទាល់ពីកសិករ</h4>
                    <p className="text-white/80 text-xs lg:text-sm">គ្មានឈ្មួញកណ្ដាល តម្លៃសមរម្យ</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 lg:gap-3">
                  <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                    <Truck className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm lg:text-base">ដឹកជញ្ជូនរហ័ស</h4>
                    <p className="text-white/80 text-xs lg:text-sm">ដល់គេហដ្ឋាន</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 lg:gap-3">
                  <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm lg:text-base">ការទូទាត់មានសុវត្ថិភាព</h4>
                    <p className="text-white/80 text-xs lg:text-sm">ប្រព័ន្ធទូទាត់តាមអនឡាញដោយសុវត្ថិភាព</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-8">
              <div className="bg-white/10 p-3 lg:p-4 rounded-lg">
                <p className="text-xs lg:text-sm text-white/90">
                  <span className="font-semibold">ចំណាំ៖</span> អ្នកអាចចូលគណនីបានដោយប្រើទាំងអ៊ីមែល ឬលេខទូរស័ព្ទ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}

// Add missing Lucide icons
const Truck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
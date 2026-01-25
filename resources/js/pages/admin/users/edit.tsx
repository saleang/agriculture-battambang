// edit.tsx (កែសម្រួលពេញលេញ)
import { FormEventHandler, useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowLeft, User, Mail, Phone, Lock, Store, MapPin, FileText, Shield, ShoppingCart, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    user_id: number;
    username: string;
    email: string;
    phone: string;
    role: 'admin' | 'seller' | 'customer';
    status: 'active' | 'inactive' | 'banned';
    seller?: {
        seller_id: number;
        farm_name: string;
        location_district: string;
        description: string | null;
    };
}

export default function EditUser({ user }: PageProps<{ user: UserData }>) {
    const { data, setData, processing, errors, reset } = useForm({
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        farm_name: user.seller?.farm_name || '',
        location_district: user.seller?.location_district || '',
        description: user.seller?.description || '',
        password: '',
        password_confirmation: '',
    });

    const [isSeller, setIsSeller] = useState(user.role === 'seller');

    useEffect(() => {
        setIsSeller(data.role === 'seller');
    }, [data.role]);

    const handleRoleChange = (role: 'admin' | 'seller' | 'customer') => {
        setData('role', role);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const updateUrl = `/admin/users/${user.user_id}`;

        router.post(updateUrl, data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('បានកែសម្រួលអ្នកប្រើប្រាស់ដោយជោគជ័យ!');
                reset('password', 'password_confirmation');
            },
            onError: (errors) =>{
                if(errors.password){
                    toast.error('ការផ្លាស់ប្តូរពាក្យសម្ងាត់បរាជ័យ។ សូមធានាថាពាក្យសម្ងាត់ត្រូវគ្នា និងបំពេញតម្រូវការ។');
                }else{
                    toast.error('មិនអាចកែសម្រួលអ្នកប្រើប្រាស់បានទេ។ សូមពិនិត្យទិន្នន័យ។');
                }
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`កែសម្រួលអ្នកប្រើ - ${user.username}`} />
            
            {/* Add custom fonts */}
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet" />
                <style>{`
                    .font-moul { font-family: 'Moul', serif; }
                    .font-siemreap { font-family: 'Siemreap', sans-serif; }
                `}</style>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 font-siemreap">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <Link 
                            href="/admin/users"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">ត្រលប់ទៅការគ្រប់គ្រងអ្នកប្រើ</span>
                        </Link>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-moul">កែសម្រួលអ្នកប្រើ</h1>
                                <p className="text-slate-600 mt-2">កែសម្រួលព័ត៌មានសម្រាប់ {user.username}</p>
                            </div>
                            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                <span className="text-sm font-medium text-blue-700">លេខសម្គាល់: {user.user_id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <form onSubmit={submit}>
                            {/* Role Selection Section */}
                            <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-2 font-moul">តួនាទីអ្នកប្រើ</h2>
                                    <p className="text-sm text-slate-600">ជ្រើសរើសតួនាទីដែលសមស្របសម្រាប់អ្នកប្រើប្រាស់នេះ</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('admin')}
                                        className={`p-4 sm:p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'admin'
                                                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100 scale-105'
                                                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Shield size={20} className="text-purple-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">អ្នកគ្រប់គ្រង</div>
                                        <div className="text-xs text-slate-600">ចូលប្រើប្រាស់ទាំងប្រព័ន្ធ</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('seller')}
                                        className={`p-4 sm:p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'seller'
                                                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-105'
                                                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Store size={20} className="text-emerald-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">កសិករ</div>
                                        <div className="text-xs text-slate-600">គ្រប់គ្រងផលិតផល</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('customer')}
                                        className={`p-4 sm:p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'customer'
                                                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-105'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <ShoppingCart size={20} className="text-blue-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">អតិថិជន</div>
                                        <div className="text-xs text-slate-600">ទិញ និងមើលផលិតផល</div>
                                    </button>
                                </div>
                                {errors.role && (
                                    <p className="text-rose-600 text-sm mt-3 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Account Information Section */}
                            <div className="p-6 sm:p-8 border-b border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <User size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 font-moul">ព័ត៌មានគណនី</h2>
                                        <p className="text-sm text-slate-600">ព័ត៌មានគណនីជាមូលដ្ឋាន</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            ឈ្មោះអ្នកប្រើ <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <User size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.username 
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                        : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'
                                                }`}
                                                placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            អ៊ីមែល <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Mail size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.email 
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                        : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'
                                                }`}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            លេខទូរស័ព្ទ <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Phone size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.phone 
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                        : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'
                                                }`}
                                                placeholder="+855 12 345 678"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            ស្ថានភាពគណនី
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white transition-all cursor-pointer"
                                        >
                                            <option value="active">សកម្ម</option>
                                            <option value="inactive">មិនសកម្ម</option>
                                            <option value="banned">បានបិទ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Information Section */}
                            {isSeller && (
                                <div className="p-6 sm:p-8 border-b border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                            <Store size={20} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 font-moul">ព័ត៌មានកសិករ</h2>
                                            <p className="text-sm text-slate-600">ព័ត៌មានពិសេសសម្រាប់កសិករ</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                ឈ្មោះដីកសិកម្ម/ហាង <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    <Store size={18} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.farm_name}
                                                    onChange={(e) => setData('farm_name', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                        errors.farm_name 
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                            : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                                                    }`}
                                                    placeholder="បញ្ចូលឈ្មោះដីកសិកម្ម ឬហាង"
                                                />
                                            </div>
                                            {errors.farm_name && (
                                                <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                    {errors.farm_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                ស្រុក/ខណ្ឌ <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    <MapPin size={18} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.location_district}
                                                    onChange={(e) => setData('location_district', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                        errors.location_district 
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                            : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                                                    }`}
                                                    placeholder="បញ្ចូលស្រុក/ខណ្ឌ"
                                                />
                                            </div>
                                            {errors.location_district && (
                                                <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                    {errors.location_district}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            ការពិពណ៌នា
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-4">
                                                <FileText size={18} className="text-slate-400" />
                                            </div>
                                            <textarea
                                                rows={4}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                                                placeholder="រៀបរាប់អំពីដីកសិកម្ម ឬអាជីវកម្មរបស់អ្នក..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password Change Section */}
                            <div className="p-6 sm:p-8 border-b border-slate-200 bg-amber-50/30">
                                <div className="flex items-start gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Lock size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 font-moul">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
                                        <p className="text-sm text-slate-600">មិនកាត់បន្ថយ - ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់បច្ចុប្បន្ន</p>
                                    </div>
                                </div>

                                {/* Info Alert */}
                                <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800">
                                        សូមបំពេញវាលទាំងនេះតែនៅពេលដែលអ្នកចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់អ្នកប្រើប្រាស់។ បើមិនដូច្នេះទេ សូមទុកទទេ។
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            ពាក្យសម្ងាត់ថ្មី
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Lock size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.password 
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
                                                        : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22]'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.password}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">យ៉ាងតិច ៨ តួអក្សរ</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Lock size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="p-6 sm:p-8 bg-slate-50">
                                <div className="flex flex-col sm:flex-row justify-end gap-4">
                                    <Link
                                        href="/admin/users"
                                        className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-white hover:border-slate-300 transition-all text-center"
                                    >
                                        បោះបង់
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-8 py-3 bg-gradient-to-r from-[#228B22] to-[#32CD32] text-white rounded-xl hover:from-[#1a6b1a] hover:to-[#28a428] font-semibold shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                កំពុងកែសម្រួល...
                                            </span>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                រក្សាទុកការផ្លាស់ប្តូរ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
// pages/admin/users/create.tsx
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, User, Mail, Phone, Lock, Store,
    FileText, Shield, ShoppingCart, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import LocationDropdown, { LocationValue } from '@/pages/admin/components/LocationDropdown';

export default function CreateUser() {

    const { data, setData, post, processing, errors } = useForm({
        username:              '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        role:                  'customer' as 'admin' | 'seller' | 'customer',
        phone:                 '',
        status:                'active' as 'active' | 'inactive' | 'banned',
        farm_name:             '',
        description:           '',
        // Location sent as strings — controller null-cleans these only
        province_id: '',
        district_id: '',
        commune_id:  '',
        village_id:  '',
    });

    const [isSeller, setIsSeller] = useState(false);

    const handleRoleChange = (role: 'admin' | 'seller' | 'customer') => {
        setData(prev => ({
            ...prev,
            role,
            ...(role !== 'seller' ? {
                farm_name: '', description: '',
                province_id: '', district_id: '', commune_id: '', village_id: '',
            } : {}),
        }));
        setIsSeller(role === 'seller');
    };

    const locVal: LocationValue = {
        province_id: data.province_id || null,
        district_id: data.district_id || null,
        commune_id:  data.commune_id  || null,
        village_id:  data.village_id  || null,
    };

    const handleLocChange = (loc: LocationValue) => {
        setData(prev => ({
            ...prev,
            province_id: String(loc.province_id ?? ''),
            district_id: String(loc.district_id ?? ''),
            commune_id:  String(loc.commune_id  ?? ''),
            village_id:  String(loc.village_id  ?? ''),
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            // FIX: preserveState:false so on success Inertia fully navigates
            // to the redirected page (admin.users.index) with fresh data
            preserveState: false,
            onSuccess: () => {
                toast.success('បានបង្កើតអ្នកប្រើប្រាស់ថ្មីដោយជោគជ័យ!');
                // DO NOT call router.visit() here — Inertia already follows
                // the server redirect. Calling it again causes double-navigation.
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                toast.error(first ? String(first) : 'មិនអាចបង្កើតបានទេ។ សូមពិនិត្យទិន្នន័យ។');
            },
        });
    };

    const inputCls = (field: string) => `
        w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm
        focus:outline-none focus:ring-2 transition-all
        ${(errors as any)[field]
            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'
        }
    `;

    const Err = ({ f }: { f: string }) =>
        (errors as any)[f] ? (
            <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-rose-600 rounded-full inline-block" />
                {(errors as any)[f]}
            </p>
        ) : null;

    return (
        <AppLayout>
            <Head title="បង្កើតអ្នកប្រើប្រាស់ថ្មី" />
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{`.font-moul{font-family:'Moul',serif}`}</style>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">

                    <div className="mb-8">
                        <Link href="/admin/users"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors text-sm">
                            <ArrowLeft size={18} /> ត្រលប់ទៅការគ្រប់គ្រងអ្នកប្រើ
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-moul">បង្កើតអ្នកប្រើប្រាស់ថ្មី</h1>
                        <p className="text-slate-500 mt-2 text-sm">បន្ថែមអ្នកប្រើប្រាស់ថ្មីទៅក្នុងប្រព័ន្ធ</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <form onSubmit={submit}>

                            {/* ── Role ── */}
                            <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                                <h2 className="text-lg font-bold text-slate-900 mb-1 font-moul">ជ្រើសរើសតួនាទី</h2>
                                <p className="text-sm text-slate-500 mb-5">ជ្រើសរើសតួនាទីដែលសមស្រប</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {([
                                        { r: 'admin',    label: 'អ្នកគ្រប់គ្រង', sub: 'ចូលប្រើប្រាស់ទាំងប្រព័ន្ធ',   icon: <Shield size={20} className="text-purple-600" />,   ab: 'border-purple-500',  ag: 'bg-purple-50',  as_: 'shadow-purple-100',  hb: 'hover:border-purple-300',  hg: 'hover:bg-purple-50/50',  ib: 'bg-purple-100'  },
                                        { r: 'seller',   label: 'កសិករ',          sub: 'គ្រប់គ្រងផលិតផល',           icon: <Store size={20} className="text-emerald-600" />,   ab: 'border-emerald-500', ag: 'bg-emerald-50', as_: 'shadow-emerald-100', hb: 'hover:border-emerald-300', hg: 'hover:bg-emerald-50/50', ib: 'bg-emerald-100' },
                                        { r: 'customer', label: 'អតិថិជន',        sub: 'ទិញ និងមើលផលិតផល',         icon: <ShoppingCart size={20} className="text-blue-600" />, ab: 'border-blue-500',    ag: 'bg-blue-50',    as_: 'shadow-blue-100',    hb: 'hover:border-blue-300',    hg: 'hover:bg-blue-50/50',    ib: 'bg-blue-100'    },
                                    ] as const).map(r => (
                                        <button key={r.r} type="button" onClick={() => handleRoleChange(r.r as any)}
                                            className={`p-5 border-2 rounded-xl text-center transition-all ${
                                                data.role === r.r
                                                    ? `${r.ab} ${r.ag} shadow-lg ${r.as_} scale-[1.03]`
                                                    : `border-slate-200 ${r.hb} ${r.hg}`
                                            }`}>
                                            <div className={`w-11 h-11 ${r.ib} rounded-xl flex items-center justify-center mx-auto mb-3`}>{r.icon}</div>
                                            <p className="font-bold text-slate-900 mb-1 text-sm">{r.label}</p>
                                            <p className="text-xs text-slate-500">{r.sub}</p>
                                        </button>
                                    ))}
                                </div>
                                <Err f="role" />
                            </div>

                            {/* ── Account Info ── */}
                            <div className="p-6 sm:p-8 border-b border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <User size={18} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 font-moul">ព័ត៌មានគណនី</h2>
                                        <p className="text-xs text-slate-500">ព័ត៌មានជាមូលដ្ឋាន</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">ឈ្មោះអ្នកប្រើ <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={data.username}
                                                onChange={e => setData('username', e.target.value)}
                                                className={inputCls('username')} placeholder="បញ្ចូលឈ្មោះ" />
                                        </div>
                                        <Err f="username" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">អ៊ីមែល <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="email" value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={inputCls('email')} placeholder="email@example.com" />
                                        </div>
                                        <Err f="email" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">លេខទូរស័ព្ទ <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="tel" value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className={inputCls('phone')} placeholder="0XX XXX XXXX" />
                                        </div>
                                        <Err f="phone" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">ស្ថានភាព</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value as any)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white transition-all cursor-pointer">
                                            <option value="active">សកម្ម</option>
                                            <option value="inactive">មិនសកម្ម</option>
                                            <option value="banned">បានបិទ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">ពាក្យសម្ងាត់ <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="password" value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                className={inputCls('password')} placeholder="••••••••"
                                                autoComplete="new-password" />
                                        </div>
                                        <Err f="password" />
                                        <p className="text-xs text-slate-400 mt-1">យ៉ាងតិច ៨ តួអក្សរ</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="password" value={data.password_confirmation}
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white transition-all"
                                                placeholder="••••••••" autoComplete="new-password" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Seller Info ── */}
                            {isSeller && (
                                <div className="p-6 sm:p-8 border-b border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                                            <Store size={18} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 font-moul">ព័ត៌មានកសិករ</h2>
                                            <p className="text-xs text-slate-500">ព័ត៌មានពិសេសសម្រាប់កសិករ</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            ឈ្មោះដីកសិកម្ម / ហាង <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Store size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={data.farm_name}
                                                onChange={e => setData('farm_name', e.target.value)}
                                                className={inputCls('farm_name')} placeholder="ឈ្មោះដីកសិកម្ម ឬហាង" />
                                        </div>
                                        <Err f="farm_name" />
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 bg-gradient-to-b from-[#228B22] to-[#32CD32] rounded-full" />
                                            <span className="text-sm font-semibold text-slate-700">ទីតាំង</span>
                                            <span className="text-xs text-slate-400">(ខេត្ត និងស្រុកត្រូវបំពេញ)</span>
                                        </div>
                                        <LocationDropdown
                                            value={locVal}
                                            onChange={handleLocChange}
                                            errors={{
                                                province_id: errors.province_id,
                                                district_id: errors.district_id,
                                                commune_id:  errors.commune_id,
                                                village_id:  errors.village_id,
                                            }}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">ការពិពណ៌នា</label>
                                        <div className="relative">
                                            <FileText size={17} className="absolute left-4 top-4 text-slate-400" />
                                            <textarea rows={3} value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                                                placeholder="រៀបរាប់អំពីដីកសិកម្ម ឬអាជីវកម្ម..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Actions ── */}
                            <div className="p-6 sm:p-8 bg-slate-50">
                                <div className="flex flex-col sm:flex-row justify-end gap-4">
                                    <Link href="/admin/users"
                                        className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all text-center">
                                        បោះបង់
                                    </Link>
                                    <button type="submit" disabled={processing}
                                        className="px-8 py-3 bg-gradient-to-r from-[#228B22] to-[#32CD32] text-white rounded-xl hover:from-[#1a6b1a] hover:to-[#28a428] text-sm font-semibold shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {processing
                                            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>កំពុងបង្កើត...</>
                                            : <><Plus size={16} />បង្កើតអ្នកប្រើ</>
                                        }
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
// pages/admin/users/edit.tsx
import { FormEventHandler, useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    ArrowLeft, User, Mail, Phone, Lock, Store,
    FileText, Shield, ShoppingCart, AlertCircle, Save, Users2, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import LocationDropdown, { LocationValue } from '@/pages/admin/components/LocationDropdown';

const C = {
    p: '#228B22',
    dark: '#006400',
    sub: '#6b7280',
    display: "'Moul', serif",
};

interface UserData {
    user_id:  number;
    username: string;
    email:    string;
    phone:    string;
    role:     'admin' | 'seller' | 'customer';
    status:   'active' | 'inactive' | 'banned';
    seller?: {
        seller_id:   number;
        farm_name:   string;
        description: string | null;
        province_id: number | null;
        district_id: number | null;
        commune_id:  number | null;
        village_id:  number | null;
    };
}

type Role   = 'admin' | 'seller' | 'customer';
type Status = 'active' | 'inactive' | 'banned';

export default function EditUser({ user }: PageProps<{ user: UserData }>) {
    const { data, setData, post, processing, errors } = useForm({
        username: user.username, email: user.email, phone: user.phone,
        role: user.role, status: user.status,
        farm_name:   user.seller?.farm_name   ?? '',
        description: user.seller?.description ?? '',
        password: '', password_confirmation: '',
        province_id: user.seller?.province_id ? String(user.seller.province_id) : '',
        district_id: user.seller?.district_id ? String(user.seller.district_id) : '',
        commune_id:  user.seller?.commune_id  ? String(user.seller.commune_id)  : '',
        village_id:  user.seller?.village_id  ? String(user.seller.village_id)  : '',
    });

    const [activeTab, setActiveTab] = useState(0);
    const isSeller = data.role === 'seller';

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
        post(`/admin/users/${user.user_id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('បានកែសម្រួលអ្នកប្រើប្រាស់ដោយជោគជ័យ!');
                setData(prev => ({ ...prev, password: '', password_confirmation: '' }));
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                toast.error(first ? String(first) : 'មិនអាចកែសម្រួលបានទេ។ សូមពិនិត្យទិន្នន័យ។');
            },
        });
    };

    const inputCls = (field: string) => `
        w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-lg text-base
        focus:outline-none focus:ring-2 transition-all
        ${(errors as any)[field]
            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
            : 'border-gray-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'}
    `;

    const Err = ({ f }: { f: string }) =>
        (errors as any)[f] ? (
            <p className="mt-1.5 flex items-center gap-1 text-base text-rose-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-600" />
                {(errors as any)[f]}
            </p>
        ) : null;

    // Tabs — seller tab injected when isSeller; password is always last
    const tabs = [
        { id: 0, label: 'តួនាទី',       icon: <Shield size={15} />,  errorFields: ['role'] },
        { id: 1, label: 'ព័ត៌មានគណនី',  icon: <User size={15} />,    errorFields: ['username','email','phone'] },
        ...(isSeller ? [{ id: 2, label: 'ព័ត៌មានកសិករ', icon: <Store size={15} />, errorFields: ['farm_name','province_id','district_id'] }] : []),
        { id: 3, label: 'ពាក្យសម្ងាត់', icon: <Lock size={15} />,    errorFields: ['password'] },
    ];
    const maxTabIdx    = tabs.length - 1;
    const currentTabIdx = tabs.findIndex(t => t.id === activeTab);
    const hasError = (fields: string[]) => fields.some(f => !!(errors as any)[f]);

    const goNext = () => { const i = Math.min(currentTabIdx + 1, maxTabIdx); setActiveTab(tabs[i].id); };
    const goPrev = () => { const i = Math.max(currentTabIdx - 1, 0);        setActiveTab(tabs[i].id); };

    return (
        <AppLayout>
            <Head title={`កែសម្រួល - ${user.username}`} />
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            {/* Full viewport height, no page scroll */}
            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-slate-50/70">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">

                    {/* ── Header ── */}
                    <div className="mb-5 flex flex-shrink-0 items-center justify-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 11,
                                background: `linear-gradient(135deg,${C.p},${C.dark})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Users2 size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ fontFamily: C.display, color: C.p, fontSize: 22, margin: 0 }}>
                                    កែសម្រួលអ្នកប្រើប្រាស់
                                </h1>
                                <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
                                    កែសម្រួលព័ត៌មានសម្រាប់ {user.username}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                                <span className="text-base font-medium text-blue-700">ID: #{user.user_id}</span>
                            </div>
                            <Link href="/admin/users"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                                <ArrowLeft size={15} /> ត្រលប់ទៅបញ្ជី
                            </Link>
                        </div>
                    </div>

                    {/* ── Card ── */}
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        {/* Tab bar */}
                        <div className="flex flex-shrink-0 border-b border-gray-200 bg-gray-50">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const err = hasError(tab.errorFields);
                                return (
                                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-base font-medium transition-all ${
                                            isActive
                                                ? 'border-b-2 border-green-600 bg-white text-green-700'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}>
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        {err && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panel */}
                        <div className="min-h-0 flex-1 overflow-y-auto p-1 sm:p-8">

                            {/* ── Tab: Role ── */}
                            {activeTab === 0 && (
                                <div className="flex h-full flex-col">
                                    <p className="mb-6 text-base text-gray-500">ជ្រើសរើសតួនាទីដែលសមស្រប</p>
                                    <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-3 content-center">
                                        {([
                                            { r: 'admin',    label: 'អ្នកគ្រប់គ្រង', sub: 'ចូលប្រើប្រាស់ទាំងប្រព័ន្ធ',  icon: <Shield size={30} className="text-purple-600" />,    ab: 'border-purple-500', ag: 'bg-purple-50', as_: 'shadow-purple-100', ib: 'bg-purple-100' },
                                            { r: 'seller',   label: 'កសិករ',          sub: 'គ្រប់គ្រងផលិតផល',            icon: <Store size={30} className="text-emerald-600" />,    ab: 'border-emerald-500', ag: 'bg-emerald-50', as_: 'shadow-emerald-100', ib: 'bg-emerald-100' },
                                            { r: 'customer', label: 'អតិថិជន',        sub: 'ទិញ និងមើលផលិតផល',          icon: <ShoppingCart size={30} className="text-blue-600" />, ab: 'border-blue-500', ag: 'bg-blue-50', as_: 'shadow-blue-100', ib: 'bg-blue-100' },
                                        ] as const).map(r => (
                                            <button key={r.r} type="button" onClick={() => setData('role', r.r as Role)}
                                                className={`flex flex-col items-center justify-center rounded-xl border-2 py-10 text-center transition-all ${
                                                    data.role === r.r
                                                        ? `${r.ab} ${r.ag} scale-[1.02] shadow-lg ${r.as_}`
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${r.ib}`}>{r.icon}</div>
                                                <p className="mb-1 text-base font-semibold text-gray-900">{r.label}</p>
                                                <p className="text-base text-gray-500">{r.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <Err f="role" />
                                </div>
                            )}

                            {/* ── Tab: Account ── */}
                            {activeTab === 1 && (
                                <div>
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                                            <User size={17} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: C.display }}>ព័ត៌មានគណនី</h2>
                                            <p className="text-base text-gray-500">ព័ត៌មានជាមូលដ្ឋានរបស់អ្នកប្រើ</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ឈ្មោះអ្នកប្រើ <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} className={inputCls('username')} />
                                            </div>
                                            <Err f="username" />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">អ៊ីមែល <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputCls('email')} />
                                            </div>
                                            <Err f="email" />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">លេខទូរស័ព្ទ <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputCls('phone')} />
                                            </div>
                                            <Err f="phone" />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ស្ថានភាព</label>
                                            <select value={data.status} onChange={e => setData('status', e.target.value as Status)}
                                                className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                                                <option value="active">សកម្ម</option>
                                                <option value="inactive">មិនសកម្ម</option>
                                                <option value="banned">បានបិទ</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab: Seller Info ── */}
                            {activeTab === 2 && isSeller && (
                                <div>
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                                            <Store size={17} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: C.display }}>ព័ត៌មានកសិករ</h2>
                                            <p className="text-base text-gray-500">ព័ត៌មានពិសេសសម្រាប់កសិករ</p>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ឈ្មោះដីកសិកម្ម / ហាង <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="text" value={data.farm_name} onChange={e => setData('farm_name', e.target.value)} className={inputCls('farm_name')} placeholder="ឈ្មោះដីកសិកម្ម ឬហាង" />
                                            </div>
                                            <Err f="farm_name" />
                                        </div>
                                        <div>
                                            <div className="mb-3 flex items-center gap-2">
                                                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#228B22] to-[#32CD32]" />
                                                <span className="text-base font-medium text-gray-700">ទីតាំង</span>
                                                {data.province_id && (
                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-base font-medium text-emerald-600">
                                                        ✓ មានទីតាំង
                                                    </span>
                                                )}
                                            </div>
                                            <LocationDropdown value={locVal} onChange={handleLocChange}
                                                errors={{ province_id: errors.province_id, district_id: errors.district_id, commune_id: errors.commune_id, village_id: errors.village_id }}
                                                required />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ការពិពណ៌នា</label>
                                            <div className="relative">
                                                <FileText size={16} className="absolute left-4 top-4 text-gray-400" />
                                                <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                                                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-base transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                    placeholder="រៀបរាប់អំពីដីកសិកម្ម ឬអាជីវកម្ម..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab: Password ── */}
                            {activeTab === 3 && (
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                                            <Lock size={17} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: C.display }}>ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
                                            <p className="text-base text-gray-500">ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់បច្ចុប្បន្ន</p>
                                        </div>
                                    </div>
                                    <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3.5">
                                        <AlertCircle size={17} className="mt-0.5 flex-shrink-0 text-blue-600" />
                                        <p className="text-base text-blue-800">
                                            សូមបំពេញតែនៅពេលដែលអ្នកចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់។ បើមិនដូច្នេះ ទុកទទេ។
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ពាក្យសម្ងាត់ថ្មី</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-lg text-base focus:outline-none focus:ring-2 transition-all ${
                                                        errors.password
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                            : 'border-gray-200 focus:ring-[#228B22] focus:border-[#228B22]'
                                                    }`}
                                                    placeholder="••••••••" autoComplete="new-password" />
                                            </div>
                                            <Err f="password" />
                                            <p className="mt-1 text-base text-gray-400">យ៉ាងតិច ៨ តួអក្សរ</p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] transition-all"
                                                    placeholder="••••••••" autoComplete="new-password" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Non-seller: tab id=2 maps to password in tab list */}
                            {activeTab === 2 && !isSeller && (
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                                            <Lock size={17} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: C.display }}>ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
                                            <p className="text-base text-gray-500">ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់បច្ចុប្បន្ន</p>
                                        </div>
                                    </div>
                                    <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3.5">
                                        <AlertCircle size={17} className="mt-0.5 flex-shrink-0 text-blue-600" />
                                        <p className="text-base text-blue-800">
                                            សូមបំពេញតែនៅពេលដែលអ្នកចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់។ បើមិនដូច្នេះ ទុកទទេ។
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">ពាក្យសម្ងាត់ថ្មី</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-lg text-base focus:outline-none focus:ring-2 transition-all ${
                                                        errors.password
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                            : 'border-gray-200 focus:ring-[#228B22] focus:border-[#228B22]'
                                                    }`}
                                                    placeholder="••••••••" autoComplete="new-password" />
                                            </div>
                                            <Err f="password" />
                                            <p className="mt-1 text-base text-gray-400">យ៉ាងតិច ៨ តួអក្សរ</p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-base font-medium text-gray-700">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] transition-all"
                                                    placeholder="••••••••" autoComplete="new-password" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer: prev / dots / save ── */}
                        <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button type="button" onClick={goPrev} disabled={currentTabIdx === 0}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-base font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                                <ChevronLeft size={16} /> មុន
                            </button>

                            {/* Progress dots */}
                            <div className="flex items-center gap-2">
                                {tabs.map((tab) => (
                                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                        className={`h-2 rounded-full transition-all ${
                                            activeTab === tab.id ? 'w-6 bg-green-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`} />
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                {currentTabIdx < maxTabIdx ? (
                                    <button type="button" onClick={goNext}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-green-700">
                                        បន្ទាប់ <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                                        {processing
                                            ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>កំពុងរក្សាទុក...</>
                                            : <><Save size={16} />រក្សាទុកការផ្លាស់ប្តូរ</>
                                        }
                                    </button>
                                )}
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
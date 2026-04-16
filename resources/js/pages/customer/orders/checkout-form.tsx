import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import {
    User, Phone, MapPin, CreditCard, Wallet,
    FileText, ChevronRight, ShieldCheck, Package,
    CheckCircle2, Lock, Store, Truck, ChevronDown, ChevronUp,
} from 'lucide-react';

interface User {
    user_id: number; username: string; email: string;
    phone?: string; address?: string;
}
interface CartItem {
    product_id: number; productname: string; price: number;
    quantity: number; unit: string; image?: string;
    seller_id?: number; farm_name?: string; seller_photo?: string;
}
interface Order {
    order_id: number; order_number: string; status: string;
}
interface CheckoutFormProps {
    cartItems: CartItem[];
    user?: User;
    onSuccess?: (order: Order) => void;
}
interface FormData {
    recipient_name: string; recipient_phone: string;
    shipping_address: string; payment_method: 'KHQR' | 'manual(cash)';
    customer_notes: string;
}
interface ValidationErrors {
    recipient_name?: string[]; recipient_phone?: string[];
    shipping_address?: string[]; payment_method?: string[];
    customer_notes?: string[]; items?: string[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cartItems, user, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        recipient_name: user?.username || '',
        recipient_phone: user?.phone || '',
        shipping_address: user?.address || '',
        payment_method: 'KHQR',
        customer_notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

    useEffect(() => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Accept'] = 'application/json';
    }, []);

    useEffect(() => {
        if (user) setFormData(prev => ({
            ...prev,
            recipient_name: user.username || '',
            recipient_phone: user.phone || '',
            shipping_address: user.address || '',
        }));
    }, [user]);

    // Group cart items by seller
    const groupedBySeller = useMemo(() => {
        const groups: Record<string, { farmName: string; sellerPhoto?: string; items: CartItem[]; subtotal: number }> = {};
        cartItems.forEach(item => {
            const key = `seller_${item.seller_id ?? 'unknown'}`;
            if (!groups[key]) {
                groups[key] = {
                    farmName: item.farm_name || 'ចម្ការ/ហាង',
                    sellerPhoto: item.seller_photo,
                    items: [],
                    subtotal: 0,
                };
            }
            groups[key].items.push(item);
            groups[key].subtotal += parseFloat(item.price as any) * item.quantity;
        });
        return groups;
    }, [cartItems]);

    const sellerKeys = Object.keys(groupedBySeller);
    const hasMultipleSellers = sellerKeys.length > 1;
    const subtotal = cartItems.reduce((s, i) => s + parseFloat(i.price as any) * i.quantity, 0);

    const fmt = (n: number) => Math.floor(n).toLocaleString('km-KH') + ' ៛';

    const toggleStore = (key: string) => {
        setExpandedStores(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const getInitials = (name: string) => {
        const words = name.trim().split(/\s+/);
        return words.length === 1 ? words[0].charAt(0) : words[0].charAt(0) + words[1].charAt(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof ValidationErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const response = await axios.post<{ message: string; data: Order }>('/customer/orders', {
                ...formData,
                items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
            });
            toast.success('ការបញ្ជាទិញបានដាក់ជោគជ័យ!');
            if (onSuccess) onSuccess(response.data.data);
        } catch (error: any) {
            if (error.response?.status === 419) {
                toast.error('សម័យប្រើប្រាស់ផុតកំណត់។ សូមផ្ទុកទំព័រឡើងវិញ។');
            } else if (error.response?.status === 401) {
                toast.error('សូមចូលគណនីដើម្បីដាក់ការបញ្ជាទិញ។');
                window.location.href = '/login';
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error(Object.values(error.response.data.errors).flat()[0] as string || 'មានបញ្ហាក្នុងការបំពេញទម្រង់។');
            } else {
                toast.error(error.response?.data?.message || 'មិនអាចដាក់ការបញ្ជាទិញបាន។');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputBase = 'w-full border rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition';
    const inputError = 'border-red-300 bg-red-50';
    const inputNormal = 'border-gray-200';

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" richColors />

            {/* Top secure bar
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <span className="text-green-700 font-bold text-lg font-moul">កសិផលខេត្តបាត់ដំបង</span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Lock size={11} /><span>ការទូទាត់មានសុវត្ថិភាព SSL</span>
                    </div>
                </div>
            </div> */}

            <div className="max-w-5xl mx-auto px-4 py-8">

                 {/* Breadcrumb */}
                {/* <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <span>រទេះទំនិញ</span>
                    <ChevronRight size={14} />
                    <span className="text-green-700 font-medium">ការទូទាត់</span>
                    <ChevronRight size={14} />
                    <span>បញ្ជាក់</span>
                </div>  */}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                        {/* ── LEFT COLUMN ── */}
                        <div className="lg:col-span-3 space-y-5">

                            {/* Step 1 — Delivery */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                                    <h3 className="font-semibold text-gray-900 font-moul text-base">ព័ត៌មានដឹកជញ្ជូន</h3>
                                </div>
                                <div className="px-6 py-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ឈ្មោះអ្នកទទួល</label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange}
                                                    placeholder={user?.username || 'ឈ្មោះអ្នកទទួល'}
                                                    className={`${inputBase} pl-10 ${errors.recipient_name ? inputError : inputNormal}`} />
                                            </div>
                                            {errors.recipient_name && <p className="text-red-500 text-xs mt-1">{errors.recipient_name[0]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">លេខទូរស័ព្ទ</label>
                                            <div className="relative">
                                                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="tel" name="recipient_phone" value={formData.recipient_phone} onChange={handleChange}
                                                    placeholder={user?.phone || '0XX XXX XXX'}
                                                    className={`${inputBase} pl-10 ${errors.recipient_phone ? inputError : inputNormal}`} />
                                            </div>
                                            {errors.recipient_phone && <p className="text-red-500 text-xs mt-1">{errors.recipient_phone[0]}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                            អាសយដ្ឋានដឹកជញ្ជូន <span className="text-red-400 normal-case font-normal">(ចាំបាច់)</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <textarea name="shipping_address" rows={3} required value={formData.shipping_address} onChange={handleChange}
                                                placeholder="ភូមិ ឃុំ ស្រុក ខេត្ត..."
                                                className={`${inputBase} pl-10 resize-none ${errors.shipping_address ? inputError : inputNormal}`} />
                                        </div>
                                        {errors.shipping_address && <p className="text-red-500 text-xs mt-1">{errors.shipping_address[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                            កំណត់ចំណាំ <span className="text-gray-400 normal-case font-normal">(ស្រេចចិត្ត)</span>
                                        </label>
                                        <div className="relative">
                                            <FileText size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <textarea name="customer_notes" rows={2} value={formData.customer_notes} onChange={handleChange}
                                                placeholder="សេចក្តីណែនាំពិសេស..."
                                                className={`${inputBase} pl-10 resize-none ${inputNormal}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 — Payment */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                                    <h3 className="font-semibold text-gray-900 font-moul text-base">វិធីបង់ប្រាក់</h3>
                                </div>
                                <div className="px-6 py-5 space-y-3">
                                    {/* KHQR */}
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.payment_method === 'KHQR' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                        <input type="radio" name="payment_method" value="KHQR" checked={formData.payment_method === 'KHQR'} onChange={handleChange} className="sr-only" />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.payment_method === 'KHQR' ? 'border-green-500' : 'border-gray-300'}`}>
                                            {formData.payment_method === 'KHQR' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-[#D0021B] flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-black text-[10px] tracking-tight leading-none">KHQR</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">KHQR / Bakong</p>
                                            <p className="text-xs text-gray-400 mt-0.5">ស្កែន QR ដើម្បីបង់ប្រាក់តាមអ៊ីនធឺណិត</p>
                                        </div>
                                        {formData.payment_method === 'KHQR' && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                                    </label>

                                    {/* Cash */}
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.payment_method === 'manual(cash)' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                        <input type="radio" name="payment_method" value="manual(cash)" checked={formData.payment_method === 'manual(cash)'} onChange={handleChange} className="sr-only" />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.payment_method === 'manual(cash)' ? 'border-green-500' : 'border-gray-300'}`}>
                                            {formData.payment_method === 'manual(cash)' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Wallet size={18} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">សាច់ប្រាក់ពេលទទួល</p>
                                            <p className="text-xs text-gray-400 mt-0.5">បង់ប្រាក់ដោយផ្ទាល់នៅពេលទទួលទំនិញ</p>
                                        </div>
                                        {formData.payment_method === 'manual(cash)' && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                                    </label>

                                    {formData.payment_method === 'KHQR' && (
                                        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                            <CreditCard size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-600 leading-relaxed">QR នឹងបង្ហាញបន្ទាប់ពីអ្នកលក់រៀបចំរួច។ អ្នកមានពេល ២៥ នាទីដើម្បីស្កែន។</p>
                                        </div>
                                    )}
                                    {formData.payment_method === 'manual(cash)' && (
                                        <div className="flex gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                                            <Wallet size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-emerald-600 leading-relaxed">អ្នកលក់នឹងទំនាក់ទំនងជាមួយអ្នកនៅពេលដឹកជញ្ជូន ហើយអ្នកបង់ជាសាច់ប្រាក់។</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Important notes */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2.5">ព័ត៌មានសំខាន់</p>
                                <ul className="space-y-2">
                                    {[
                                        'ការបញ្ជាទិញនឹងបោះបង់ ប្រសិនបើអ្នកលក់មិនឆ្លើយតបក្នុង ៣០ នាទី',
                                        'បន្ទាប់ពីអ្នកលក់បញ្ចប់ អ្នកមានពេល ៣០ នាទីដើម្បីទូទាត់',
                                        'អ្នកអាចលុបចោលការបញ្ជាទិញនៅស្ថានភាព "បានបញ្ជាក់"',
                                    ].map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-amber-700 leading-relaxed">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN — Order Summary ── */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">

                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                                    <h3 className="font-semibold text-gray-900 font-moul text-base">សង្ខេបការបញ្ជាទិញ</h3>
                                    {hasMultipleSellers && (
                                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                            <Store size={10} /> {sellerKeys.length} ហាង
                                        </span>
                                    )}
                                </div>

                                {/* Per-seller groups */}
                                <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                                    {sellerKeys.map((key, idx) => {
                                        const group = groupedBySeller[key];
                                        const isExpanded = expandedStores.has(key) || sellerKeys.length === 1;
                                        const showToggle = sellerKeys.length > 1;

                                        return (
                                            <div key={key}>
                                                {/* Store header */}
                                                <div
                                                    className={`px-5 py-3 flex items-center gap-3 ${showToggle ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                                    onClick={() => showToggle && toggleStore(key)}
                                                >
                                                    {/* Store avatar */}
                                                    {group.sellerPhoto ? (
                                                        <img src={group.sellerPhoto.startsWith('http') ? group.sellerPhoto : `/storage/${group.sellerPhoto}`}
                                                            alt={group.farmName}
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-green-700 font-bold text-xs">{getInitials(group.farmName)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{group.farmName}</p>
                                                        <p className="text-xs text-gray-400">{group.items.length} ផលិតផល · {fmt(group.subtotal)}</p>
                                                    </div>
                                                    {showToggle && (
                                                        isExpanded
                                                            ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
                                                            : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                                                    )}
                                                </div>

                                                {/* Store items */}
                                                {isExpanded && (
                                                    <div className="px-5 pb-3 space-y-3">
                                                        {group.items.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3 pl-11">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.productname} className="w-full h-full object-cover"
                                                                            onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }} />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package size={14} className="text-gray-300" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-800 truncate">{item.productname}</p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">{item.quantity} {item.unit} × {fmt(parseFloat(item.price as any))}</p>
                                                                </div>
                                                                <p className="text-xs font-semibold text-gray-700 flex-shrink-0">
                                                                    {fmt(item.quantity * parseFloat(item.price as any))}
                                                                </p>
                                                            </div>
                                                        ))}

                                                        {/* Shipping note per store */}
                                                        <div className="pl-11 flex items-center gap-1.5 text-xs text-gray-400">
                                                            <Truck size={11} />
                                                            <span className="italic">ថ្លៃដឹកជញ្ជូននឹងបញ្ជាក់ដោយអ្នកលក់</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Multi-seller notice */}
                                {hasMultipleSellers && (
                                    <div className="mx-5 mb-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                                        <Store size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-600 leading-relaxed">
                                            អ្នកកំពុងបញ្ជាទិញពី <strong>{sellerKeys.length} ហាង</strong> — នឹងបង្កើត {sellerKeys.length} ការបញ្ជាទិញដាច់ដោយឡែក
                                        </p>
                                    </div>
                                )}

                                {/* Totals */}
                                <div className="px-5 py-3 border-t border-dashed border-gray-200 space-y-1.5">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>សរុបរង ({cartItems.length} ផលិតផល)</span>
                                        <span>{fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Truck size={12} /> ដឹកជញ្ជូន</span>
                                        <span className="italic text-xs text-amber-500">អ្នកលក់នឹងបញ្ជាក់</span>
                                    </div>
                                </div>

                                {/* Grand total + CTA */}
                                <div className="px-5 py-4 border-t border-gray-100">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <span className="font-semibold text-gray-700 text-sm">សរុបផលិតផល</span>
                                        <span className="text-2xl font-black text-green-700">{fmt(subtotal)}</span>
                                    </div>

                                    <button type="submit" disabled={loading || cartItems.length === 0}
                                        className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                កំពុងដាក់ការបញ្ជាទិញ...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} />
                                                បញ្ជាក់ការបញ្ជាទិញ
                                                {hasMultipleSellers && <span className="text-green-200 text-xs font-normal">({sellerKeys.length} ការបញ្ជាទិញ)</span>}
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                                        <Lock size={10} /><span>ការទូទាត់ត្រូវបានការពារដោយ SSL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;

import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Search, Plus, Trash2, Tag, Check, X, AlertTriangle } from 'lucide-react';

interface Category {
    category_id: number;
    category_name: string;
    description: string | null;
    category_image: string | null;
    is_chosen: boolean;
}

interface PageProps {
    categories: Category[];
    [key: string]: unknown;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
            type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
            {type === 'success'
                ? <Check className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
                : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />}
            <p className="text-sm leading-relaxed">{message}</p>
            <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

const CategoryPage: React.FC = () => {
    const { categories: initial } = usePage<PageProps>().props;

    const [categories, setCategories] = useState<Category[]>(initial);
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAttach = async (categoryId: number) => {
        setLoadingId(categoryId);
        try {
            const { data } = await axios.post('/seller/category/attach', { category_id: categoryId });
            setCategories(prev =>
                prev.map(c => c.category_id === categoryId ? { ...c, is_chosen: true } : c)
            );
            showToast(data.message, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'មានបញ្ហាកើតឡើង', 'error');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDetach = async (categoryId: number) => {
        setLoadingId(categoryId);
        try {
            const { data } = await axios.delete(`/seller/category/${categoryId}/detach`);
            setCategories(prev =>
                prev.map(c => c.category_id === categoryId ? { ...c, is_chosen: false } : c)
            );
            showToast(data.message, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'មិនអាចលុបបានទេ', 'error');
        } finally {
            setLoadingId(null);
        }
    };

    const filtered = categories.filter(c =>
        c.category_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const chosen = filtered.filter(c => c.is_chosen);
    const available = filtered.filter(c => !c.is_chosen);

    return (
        <AppLayout>
            <Head title="ប្រភេទផលិតផលរបស់ខ្ញុំ" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ប្រភេទផលិតផល</h1>
                        <p className="text-sm text-gray-500 mt-1">ជ្រើសរើសប្រភេទដែលអ្នកចង់លក់ — ប្រភេទដែលបានជ្រើសនឹងបង្ហាញក្នុង dropdown ផលិតផល</p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ស្វែងរកប្រភេទ..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        />
                    </div>

                    {/* My chosen categories */}
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            ប្រភេទរបស់ខ្ញុំ ({chosen.length})
                        </h2>
                        {chosen.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-400">មិនទាន់មានប្រភេទណាមួយបានជ្រើសទេ</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {chosen.map(cat => (
                                    <div key={cat.category_id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                                        {cat.category_image ? (
                                            <img src={`/storage/${cat.category_image}`} alt={cat.category_name}
                                                className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                <Tag className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{cat.category_name}</p>
                                            {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleDetach(cat.category_id)}
                                            disabled={loadingId === cat.category_id}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                            title="លុបចេញ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available categories */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            ប្រភេទដែលអាចជ្រើសបាន ({available.length})
                        </h2>
                        {available.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">បានជ្រើសប្រភេទទាំងអស់ហើយ</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {available.map(cat => (
                                    <div key={cat.category_id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:border-emerald-300 transition-colors">
                                        {cat.category_image ? (
                                            <img src={`/storage/${cat.category_image}`} alt={cat.category_name}
                                                className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                <Tag className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{cat.category_name}</p>
                                            {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleAttach(cat.category_id)}
                                            disabled={loadingId === cat.category_id}
                                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 hover:text-emerald-700 transition-colors disabled:opacity-40"
                                            title="បន្ថែម"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
};

export default CategoryPage;

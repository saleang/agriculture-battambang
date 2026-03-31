import { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
    ChevronLeft, ChevronRight, X, AlertTriangle, Check,
    Filter, Tag, RefreshCw, Users, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
    category_id: number;
    category_name: string;
    category_image: string | null;
    description: string | null;
    is_active: boolean;
    sellers_count: number;
}

interface PaginatedCategories {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    categories: PaginatedCategories;
    filters: { search?: string; is_active?: string };
    [key: string]: unknown;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
    open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
            type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
            {type === 'success' ? (
                <Check className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
            ) : (
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            )}
            <p className="text-sm leading-relaxed whitespace-pre-line">{message}</p>
            <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Empty form shape ─────────────────────────────────────────────────────────
const emptyForm = {
    category_name: '',
    category_image: null as File | null,
    description: '',
    is_active: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminCategoryPage() {
    const { categories, filters } = usePage<PageProps>().props;

    const [form, setForm] = useState(emptyForm);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Filters
    const [search, setSearch] = useState(filters.search ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.is_active ?? '');

    const applyFilters = useCallback(() => {
        router.get('/admin/categories', {
            ...(search ? { search } : {}),
            ...(filterStatus !== '' ? { is_active: filterStatus } : {}),
        }, { preserveState: true, replace: true });
    }, [search, filterStatus]);

    const resetFilters = () => {
        setSearch('');
        setFilterStatus('');
        router.get('/admin/categories', {}, { preserveState: false, replace: true });
    };

    // ── Create ────────────────────────────────────────────────────────────────
    const openCreate = () => {
        setForm(emptyForm);
        setErrors({});
        setShowCreate(true);
    };

    const handleCreate = async () => {
    setSubmitting(true);
    setErrors({});

    try {
        const formData = new FormData();
        formData.append('category_name', form.category_name);
        formData.append('description', form.description || '');
        formData.append('is_active', form.is_active ? '1' : '0');
        if (form.category_image) formData.append('category_image', form.category_image);

        const { data } = await axios.post('/admin/categories', formData);

        setShowCreate(false);
        showToast(data.message || 'បានបន្ថែមប្រភេទជោគជ័យ', 'success');
        router.reload({ only: ['categories'] });
    } catch (err: any) {
        if (err.response?.status === 422) {
            setErrors(err.response.data.errors || {});
            showToast('សូមពិនិត្យទិន្នន័យឡើងវិញ', 'error');
        } else {
            showToast('មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យ', 'error');
        }
    } finally {
        setSubmitting(false);
    }
};

    // ── Edit ──────────────────────────────────────────────────────────────────
    const openEdit = (cat: Category) => {
        setEditTarget(cat);
        setForm({
            category_name: cat.category_name,
            category_image: null,
            description: cat.description ?? '',
            is_active: cat.is_active,
        });
        setErrors({});
        setShowEdit(true);
    };

    const handleEdit = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    setErrors({});

    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('category_name', form.category_name);
        formData.append('description', form.description || '');
        formData.append('is_active', form.is_active ? '1' : '0');
        if (form.category_image) formData.append('category_image', form.category_image);

        const { data } = await axios.post(`/admin/categories/${editTarget.category_id}`, formData);

        setShowEdit(false);
        showToast(data.message || 'បានកែប្រែជោគជ័យ', 'success');
        router.reload({ only: ['categories'] });
    } catch (err: any) {
        if (err.response?.status === 422) {
            setErrors(err.response.data.errors || {});
            showToast('សូមពិនិត្យទិន្នន័យឡើងវិញ', 'error');
        } else {
            showToast('មានបញ្ហាក្នុងការកែប្រែ', 'error');
        }
    } finally {
        setSubmitting(false);
    }
};

    const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
        const { data } = await axios.delete(`/admin/categories/${deleteTarget.category_id}`);
        setDeleteTarget(null);
        showToast(data.message, 'success');
        router.reload({ only: ['categories'] });
    } catch (err: any) {
        const msg = err.response?.data?.message || 'មានបញ្ហាក្នុងការលុប';
        setDeleteTarget(null);
        showToast(msg, 'error');
    } finally {
        setSubmitting(false);
    }
};

    // ── Toggle Status ─────────────────────────────────────────────────────────
    const handleToggle = async (cat: Category) => {
        try {
            const res = await fetch(`/admin/categories/${cat.category_id}/toggle-status`, {
                method: 'PATCH',
                headers: { 'X-CSRF-TOKEN': getCsrf() },
            });

            const data = await res.json();
            showToast(data.message, res.ok ? 'success' : 'error');

            if (res.ok) {
                router.reload({ only: ['categories'] });
            }
        } catch {
            showToast('មានបញ្ហាក្នុងការផ្លាស់ប្តូរស្ថានភាព', 'error');
        }
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const goToPage = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Admin – គ្រប់គ្រងប្រភេទផលិតផល" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-moul text-green-500 dark:text-white">គ្រប់គ្រងប្រភេទផលិតផល</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                គ្រប់គ្រងប្រភេទផលិតផលសកលសម្រាប់អ្នកលក់ទាំងអស់
                            </p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> បន្ថែមប្រភេទថ្មី
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរកតាមឈ្មោះ ឬការពិពណ៌នា..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            >
                                <option value="">ស្ថានភាពទាំងអស់</option>
                                <option value="1">សកម្ម</option>
                                <option value="0">មិនសកម្ម</option>
                            </select>
                            <button onClick={applyFilters} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
                                <Filter className="w-4 h-4" /> តម្រង
                            </button>
                            <button onClick={resetFilters} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl flex items-center gap-2 transition-colors">
                                <RefreshCw className="w-4 h-4" /> កំណត់ឡើងវិញ
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 w-8">#</th>
                                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ឈ្មោះប្រភេទ</th>
                                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">រូបភាព</th>
                                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ការពិពណ៌នា</th>
                                        <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">អ្នកលក់ប្រើ</th>
                                        <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ស្ថានភាព</th>
                                        <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">សកម្មភាព</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-gray-400">
                                                <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                                <p>មិនមានប្រភេទណាមួយទេ</p>
                                            </td>
                                        </tr>
                                    ) : categories.data.map((cat, i) => (
                                        <tr key={cat.category_id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-4 text-gray-400 text-xs">
                                                {(categories.current_page - 1) * categories.per_page + i + 1}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                                                {cat.category_name}
                                            </td>
                                            <td className="px-5 py-4">
                                                {cat.category_image ? (
                                                    <img
                                                        src={`/storage/${cat.category_image}`}
                                                        alt={cat.category_name}
                                                        className="h-10 w-10 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-xs">
                                                <span className="line-clamp-2">{cat.description ?? '—'}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {cat.sellers_count}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(cat)}
                                                    title={cat.is_active ? 'ចុចដើម្បីបិទ' : 'ចុចដើម្បីបើក'}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                                                    style={cat.is_active
                                                        ? { background: '#d1fae5', color: '#065f46' }
                                                        : { background: '#fee2e2', color: '#991b1b' }}
                                                >
                                                    {cat.is_active
                                                        ? <><ToggleRight className="w-3.5 h-3.5" /> សកម្ម</>
                                                        : <><ToggleLeft className="w-3.5 h-3.5" /> មិនសកម្ម</>}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEdit(cat)}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                                                        title="កែសម្រួល"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(cat)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                                        title="លុប"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500">
                                    បង្ហាញ {(categories.current_page - 1) * categories.per_page + 1}–
                                    {Math.min(categories.current_page * categories.per_page, categories.total)} នៃ {categories.total}
                                </p>
                                <div className="flex gap-1">
                                    <button onClick={() => goToPage(categories.links[0]?.url)} disabled={categories.current_page === 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {categories.links.slice(1, -1).map((link, i) => (
                                        <button key={i} onClick={() => goToPage(link.url)}
                                            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                    <button onClick={() => goToPage(categories.links[categories.links.length - 1]?.url)} disabled={categories.current_page === categories.last_page}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="បន្ថែមប្រភេទថ្មី">
                <CategoryForm
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreate(false)}
                    submitting={submitting}
                    submitLabel="បន្ថែមប្រភេទ"
                    isEdit={false}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal open={showEdit} onClose={() => setShowEdit(false)} title="កែសម្រួលប្រភេទ">
                <CategoryForm
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    onSubmit={handleEdit}
                    onCancel={() => setShowEdit(false)}
                    submitting={submitting}
                    submitLabel="រក្សាទុកការផ្លាស់ប្តូរ"
                    isEdit={true}
                    currentImage={editTarget?.category_image ?? null}
                />
            </Modal>

            {/* Delete Confirm */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="លុបប្រភេទ">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                តើអ្នកប្រាកដជាចង់លុប <span className="font-bold">"{deleteTarget?.category_name}"</span> ឬ?
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ បើមានផលិតផលកំពុងប្រើ នឹងមិនអាចលុបបានទេ។
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteTarget(null)}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                            បោះបង់
                        </button>
                        <button onClick={handleDelete} disabled={submitting}
                            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50">
                            {submitting ? 'កំពុងលុប...' : 'លុប'}
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}

// ─── Category Form Component ──────────────────────────────────────────────────
type FormShape = typeof emptyForm;

function CategoryForm({
    form,
    setForm,
    errors,
    onSubmit,
    onCancel,
    submitting,
    submitLabel,
    isEdit = false,
    currentImage = null,
}: {
    form: FormShape;
    setForm: (f: FormShape) => void;
    errors: Record<string, string[]>;
    onSubmit: () => void;
    onCancel: () => void;
    submitting: boolean;
    submitLabel: string;
    isEdit?: boolean;
    currentImage?: string | null;
}) {
    const getError = (key: string) => errors[key]?.[0] || '';

    return (
        <div className="space-y-5">
            {/* Category Name */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    ឈ្មោះប្រភេទ *
                </label>
                <input
                    type="text"
                    value={form.category_name}
                    onChange={e => setForm({ ...form, category_name: e.target.value })}
                    placeholder="ឧ. បន្លែស្រស់, ផ្លែឈើស្រស់..."
                    className={`w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white ${getError('category_name') ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                />
                {getError('category_name') && <p className="mt-1 text-xs text-red-500">{getError('category_name')}</p>}
            </div>

            {/* Category Image */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    រូបភាពប្រភេទ {isEdit ? '(បើមិនផ្លាស់ប្តូរ រក្សាដដែល)' : '*'}
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => {
                        if (e.target.files?.[0]) {
                            setForm({ ...form, category_image: e.target.files[0] });
                        }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-gray-700 dark:file:text-emerald-300"
                />
                {getError('category_image') && <p className="mt-1 text-xs text-red-500">{getError('category_image')}</p>}

                {isEdit && currentImage && !form.category_image && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">រូបភាពបច្ចុប្បន្ន:</p>
                        <img
                            src={`/storage/${currentImage}`}
                            alt="រូបភាពប្រភេទបច្ចុប្បន្ន"
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                    </div>
                )}

                {form.category_image && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">រូបភាពថ្មី:</p>
                        <img
                            src={URL.createObjectURL(form.category_image)}
                            alt="Preview"
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    ការពិពណ៌នា
                </label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="ពិពណ៌នាបន្ថែម (មិនចាំបាច់)..."
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none"
                />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ស្ថានភាពសកម្ម</span>
                <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                >
                    បោះបង់
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium"
                >
                    {submitting ? 'កំពុងរក្សាទុក...' : submitLabel}
                </button>
            </div>
        </div>
    );
}

function getCsrf(): string {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return meta?.content ?? '';
}

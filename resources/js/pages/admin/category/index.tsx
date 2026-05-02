import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    Filter,
    House,
    Image as ImageIcon,
    LucideLayoutPanelLeft,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Tag,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useState } from 'react';

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
function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
/* ─── Color palette ──────────────────────────── */
const C = {
    bg:      '#f9fafb',
    surface: '#ffffff',
    border:  '#e5e7eb',
    border2: '#d1fae5',
    muted:   '#9ca3af',
    sub:     '#6b7280',
    text:    '#374151',
    strong:  '#111827',
    p:       '#228B22',
    a:       '#32CD32',
    gold:    '#FFD700',
    goldD:   '#ca8a04',
    light:   '#90EE90',
    dark:    '#006400',
    bgG:     '#f0fdf4',
    bgY:     '#fefce8',
    font:    "'Khmer os Battambang', sans-serif",
    display: "'Moul', serif",
    mono:    "'JetBrains Mono', monospace",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}) {
    return (
        <div
            className={`fixed right-6 bottom-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
                type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-800'
            }`}
        >
            {type === 'success' ? (
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            )}
            <p className="text-sm leading-relaxed whitespace-pre-line">
                {message}
            </p>
            <button
                onClick={onClose}
                className="ml-2 shrink-0 opacity-60 hover:opacity-100"
            >
                <X className="h-4 w-4" />
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
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Filters
    const [search, setSearch] = useState(filters.search ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.is_active ?? '');

    const applyFilters = useCallback(() => {
        router.get(
            '/admin/categories',
            {
                ...(search ? { search } : {}),
                ...(filterStatus !== '' ? { is_active: filterStatus } : {}),
            },
            { preserveState: true, replace: true },
        );
    }, [search, filterStatus]);

    const resetFilters = () => {
        setSearch('');
        setFilterStatus('');
        router.get(
            '/admin/categories',
            {},
            { preserveState: false, replace: true },
        );
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
            if (form.category_image)
                formData.append('category_image', form.category_image);

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
            if (form.category_image)
                formData.append('category_image', form.category_image);

            const { data } = await axios.post(
                `/admin/categories/${editTarget.category_id}`,
                formData,
            );

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
            const { data } = await axios.delete(
                `/admin/categories/${deleteTarget.category_id}`,
            );
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
            const res = await fetch(
                `/admin/categories/${cat.category_id}/toggle-status`,
                {
                    method: 'PATCH',
                    headers: { 'X-CSRF-TOKEN': getCsrf() },
                },
            );

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
            <Head title="គ្រប់គ្រងប្រភេទផលិតផល" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                    {/* Header */}
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        {/* <div>
                            <h1 className="font-moul text-2xl text-green-500 dark:text-white">
                                គ្រប់គ្រងប្រភេទផលិតផល
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                គ្រប់គ្រងប្រភេទផលិតផលសកលសម្រាប់អ្នកលក់ទាំងអស់
                            </p>
                        </div> */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 11,
                                    background: `linear-gradient(135deg,${C.p},${C.dark})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LucideLayoutPanelLeft size={20} color="#fff" />
                            </div>
                            <div>
                                <h1
                                    style={{
                                        fontFamily: C.display,
                                        color: C.p,
                                        fontSize: 20,
                                        margin: 0,
                                    }}
                                >
                                    គ្រប់គ្រងប្រភេទផលិតផល{' '}
                                </h1>
                                <p
                                    style={{
                                        color: C.sub,
                                        fontSize: 12,
                                        margin: 0,
                                    }}
                                >
                                    គ្រប់គ្រងប្រភេទផលិតផលសកលសម្រាប់អ្នកលក់ទាំងអស់
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> បន្ថែមប្រភេទថ្មី
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរកតាមឈ្មោះ ឬការពិពណ៌នា..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applyFilters()
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-9 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">ស្ថានភាពទាំងអស់</option>
                                <option value="1">សកម្ម</option>
                                <option value="0">មិនសកម្ម</option>
                            </select>
                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700"
                            >
                                <Filter className="h-4 w-4" /> ស្វែងរក
                            </button>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <RefreshCw className="h-4 w-4" /> កំណត់ឡើងវិញ
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                        <th className="w-8 px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-400">
                                            #
                                        </th>
                                        <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-400">
                                            ឈ្មោះប្រភេទផលិតផល
                                        </th>
                                        <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-400">
                                            រូបភាព
                                        </th>
                                        <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-400">
                                            ការពិពណ៌នា
                                        </th>
                                        <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-gray-400">
                                            ចំនួនអ្នកលក់ប្រើប្រាស់
                                        </th>
                                        <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-gray-400">
                                            ស្ថានភាព
                                        </th>
                                        <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-gray-400">
                                            សកម្មភាព
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-16 text-center text-gray-400"
                                            >
                                                <Tag className="mx-auto mb-3 h-10 w-10 opacity-30" />
                                                <p>មិនមានប្រភេទផលិតផលលណាមួយទេ</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.data.map((cat, i) => (
                                            <tr
                                                key={cat.category_id}
                                                className="border-b border-gray-50 transition-colors hover:bg-gray-50/60 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                                            >
                                                <td className="px-5 py-4 text-xs text-gray-400">
                                                    {(categories.current_page -
                                                        1) *
                                                        categories.per_page +
                                                        i +
                                                        1}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                                                    {cat.category_name}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {cat.category_image ? (
                                                        <img
                                                            src={`/storage/${cat.category_image}`}
                                                            alt={
                                                                cat.category_name
                                                            }
                                                            className="h-10 w-10 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700">
                                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="max-w-xs px-5 py-4 text-gray-500 dark:text-gray-400">
                                                    <span className="line-clamp-2">
                                                        {cat.description ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {cat.sellers_count}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleToggle(cat)
                                                        }
                                                        title={
                                                            cat.is_active
                                                                ? 'ចុចដើម្បីបិទ'
                                                                : 'ចុចដើម្បីបើក'
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                                                        style={
                                                            cat.is_active
                                                                ? {
                                                                      background:
                                                                          '#d1fae5',
                                                                      color: '#065f46',
                                                                  }
                                                                : {
                                                                      background:
                                                                          '#fee2e2',
                                                                      color: '#991b1b',
                                                                  }
                                                        }
                                                    >
                                                        {cat.is_active ? (
                                                            <>
                                                                <ToggleRight className="h-3.5 w-3.5" />{' '}
                                                                សកម្ម
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleLeft className="h-3.5 w-3.5" />{' '}
                                                                មិនសកម្ម
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                openEdit(cat)
                                                            }
                                                            className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                            title="កែសម្រួល"
                                                        >
                                                            <Pencil className="h-4 w-4" /> កែប្រែ
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    cat,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            title="លុប"
                                                        >
                                                            <Trash2 className="h-4 w-4" />លុប
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                                <p className="text-xs text-gray-500">
                                    បង្ហាញ{' '}
                                    {(categories.current_page - 1) *
                                        categories.per_page +
                                        1}
                                    –
                                    {Math.min(
                                        categories.current_page *
                                            categories.per_page,
                                        categories.total,
                                    )}{' '}
                                    នៃ {categories.total}
                                </p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() =>
                                            goToPage(categories.links[0]?.url)
                                        }
                                        disabled={categories.current_page === 1}
                                        className="rounded-lg p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-800"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {categories.links
                                        .slice(1, -1)
                                        .map((link, i) => (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium transition-colors ${link.active ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    <button
                                        onClick={() =>
                                            goToPage(
                                                categories.links[
                                                    categories.links.length - 1
                                                ]?.url,
                                            )
                                        }
                                        disabled={
                                            categories.current_page ===
                                            categories.last_page
                                        }
                                        className="rounded-lg p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-800"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="បន្ថែមប្រភេទថ្មី"
            >
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
            <Modal
                open={showEdit}
                onClose={() => setShowEdit(false)}
                title="កែសម្រួលប្រភេទ"
            >
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
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="លុបប្រភេទ"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                តើអ្នកប្រាកដជាចង់លុប{' '}
                                <span className="font-bold">
                                    "{deleteTarget?.category_name}"
                                </span>{' '}
                                ឬ?
                            </p>
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                បើមានផលិតផលកំពុងប្រើ នឹងមិនអាចលុបបានទេ។
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            បោះបង់
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {submitting ? 'កំពុងលុប...' : 'លុប'}
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
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
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    ឈ្មោះប្រភេទ *
                </label>
                <input
                    type="text"
                    value={form.category_name}
                    onChange={(e) =>
                        setForm({ ...form, category_name: e.target.value })
                    }
                    placeholder="ឧ. បន្លែស្រស់, ផ្លែឈើស្រស់..."
                    className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-gray-800 dark:text-white ${getError('category_name') ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                />
                {getError('category_name') && (
                    <p className="mt-1 text-xs text-red-500">
                        {getError('category_name')}
                    </p>
                )}
            </div>

            {/* Category Image */}
            <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    រូបភាពប្រភេទផលិតផល {isEdit ? '(បើមិនផ្លាស់ប្តូរ រក្សាដដែល)' : '*'}
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setForm({
                                ...form,
                                category_image: e.target.files[0],
                            });
                        }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-gray-700 dark:file:text-emerald-300"
                />
                {getError('category_image') && (
                    <p className="mt-1 text-xs text-red-500">
                        {getError('category_image')}
                    </p>
                )}

                {isEdit && currentImage && !form.category_image && (
                    <div className="mt-3">
                        <p className="mb-1 text-xs text-gray-500">
                            រូបភាពបច្ចុប្បន្ន:
                        </p>
                        <img
                            src={`/storage/${currentImage}`}
                            alt="រូបភាពប្រភេទផលិតផលបច្ចុប្បន្ន"
                            className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />
                    </div>
                )}

                {form.category_image && (
                    <div className="mt-3">
                        <p className="mb-1 text-xs text-gray-500">
                            រូបភាពថ្មី:
                        </p>
                        <img
                            src={URL.createObjectURL(form.category_image)}
                            alt="Preview"
                            className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    ការពិពណ៌នា
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="ពិពណ៌នាបន្ថែម (មិនចាំបាច់)..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ស្ថានភាពសកម្ម
                </span>
                <button
                    type="button"
                    onClick={() =>
                        setForm({ ...form, is_active: !form.is_active })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    បោះបង់
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? 'កំពុងរក្សាទុក...' : submitLabel}
                </button>
            </div>
        </div>
    );
}

function getCsrf(): string {
    const meta = document.querySelector(
        'meta[name="csrf-token"]',
    ) as HTMLMetaElement;
    return meta?.content ?? '';
}

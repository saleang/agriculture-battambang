// pages/admin/products/index.tsx
import { useState, useCallback } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import {
    Search, Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon,
    Grid, List, RefreshCw, ToggleLeft, ToggleRight, Check, AlertTriangle, X
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    stock: string;
    is_active: boolean;
    category: { categoryname: string };
    seller: { farm_name: string; user: { username: string } };
    images: Array<{ image_url: string; is_primary: boolean }>;
}

interface Category { category_id: number; categoryname: string }

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface PagePropsExtended {
    products: PaginatedProducts;
    categories: Category[];
    filters: { search?: string; category_id?: string; status?: string; stock?: string };
    [key: string]: unknown;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
            type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
            {type === "success"
                ? <Check className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
                : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />}
            <p className="text-sm leading-relaxed whitespace-pre-line">{message}</p>
            <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductIndex() {
    const { products, categories, filters } = usePage<PagePropsExtended>().props;

    const [search, setSearch] = useState(filters.search || "");
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
    const [selectedStock, setSelectedStock] = useState(filters.stock || "");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const applyFilters = useCallback(() => {
        router.get(route("admin.products.index"), {
            ...(search ? { search } : {}),
            ...(selectedCategory ? { category_id: selectedCategory } : {}),
            ...(selectedStatus ? { status: selectedStatus } : {}),
            ...(selectedStock ? { stock: selectedStock } : {}),
        }, { preserveState: true, replace: true });
    }, [search, selectedCategory, selectedStatus, selectedStock]);

    const resetFilters = () => {
        setSearch(""); setSelectedCategory(""); setSelectedStatus(""); setSelectedStock("");
        router.get(route("admin.products.index"), {}, { preserveState: false, replace: true });
    };

    const handleToggleActive = (product: Product) => {
        router.patch(route("admin.products.toggle-active", product.product_id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`ផលិតផល${product.is_active ? "បានបិទ" : "បានបើក"}ដោយជោគជ័យ!`, "success");
                router.reload({ only: ["products"] });
            },
            onError: () => showToast("បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាព", "error"),
        });
    };

    const handleDelete = async (product: Product) => {
        const result = await Swal.fire({
            title: "លុបផលិតផល?",
            html: `តើអ្នកប្រាកដជាចង់លុប <strong>"${product.productname}"</strong> ឬ?<br/><small style="color:#dc2626">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "លុប",
            cancelButtonText: "បោះបង់",
        });
        if (!result.isConfirmed) return;
        router.delete(route("admin.products.destroy", product.product_id), {
            preserveScroll: true,
            onSuccess: () => { showToast("លុបផលិតផលដោយជោគជ័យ!", "success"); router.reload({ only: ["products"] }); },
            onError: () => showToast("បរាជ័យក្នុងការលុបផលិតផល", "error"),
        });
    };

    const handleBulkAction = async (action: string) => {
        if (selectedProducts.length === 0) { showToast("សូមជ្រើសរើសផលិតផលជាមុន", "error"); return; }
        const label: Record<string, string> = { activate: "បើក", deactivate: "បិទ", delete: "លុប" };
        if (action === "delete") {
            const result = await Swal.fire({
                title: "លុបផលិតផលដែលបានជ្រើស?",
                html: `លុប <strong>${selectedProducts.length}</strong> ផលិតផល?<br/><small style="color:#dc2626">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</small>`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "លុប",
                cancelButtonText: "បោះបង់",
            });
            if (!result.isConfirmed) return;
        }
        router.post(route("admin.products.bulk-action"), { action, product_ids: selectedProducts }, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`ផលិតផល${label[action]}ដោយជោគជ័យ!`, "success");
                setSelectedProducts([]);
                router.reload({ only: ["products"] });
            },
            onError: () => showToast("បរាជ័យ", "error"),
        });
    };

    const toggleSel = (id: number) =>
        setSelectedProducts(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
    const selectAll = () =>
        setSelectedProducts(selectedProducts.length === products.data.length ? [] : products.data.map(p => p.product_id));

    const getImg = (product: Product) => {
        const img = product.images.find(i => i.is_primary);
        if (!img) return null;
        return img.image_url.startsWith("http") ? img.image_url : `/storage/${img.image_url}`;
    };

    const goToPage = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="គ្រប់គ្រងផលិតផល" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">គ្រប់គ្រងផលិតផល</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ផលិតផលទាំងអស់ក្នុងទីផ្សារ — សរុប {products.total}
                            </p>
                        </div>
                        <Link href={route("admin.products.create")}>
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                                <Plus className="w-4 h-4" /> បន្ថែមផលិតផល
                            </button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរកផលិតផល..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && applyFilters()}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                />
                            </div>
                            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                                className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                                <option value="">ប្រភេទទាំងអស់</option>
                                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.categoryname}</option>)}
                            </select>
                            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                                className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                                <option value="">ស្ថានភាពទាំងអស់</option>
                                <option value="active">សកម្ម</option>
                                <option value="inactive">អសកម្ម</option>
                            </select>
                            <select value={selectedStock} onChange={e => setSelectedStock(e.target.value)}
                                className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                                <option value="">ស្តុកទាំងអស់</option>
                                <option value="available">មានស្តុក</option>
                                <option value="out_of_stock">អស់ស្តុក</option>
                            </select>
                            <button onClick={applyFilters} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
                                <Filter className="w-4 h-4" /> តម្រង
                            </button>
                            <button onClick={resetFilters} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl flex items-center gap-2 transition-colors">
                                <RefreshCw className="w-4 h-4" /> កំណត់ឡើងវិញ
                            </button>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

                        {/* Bulk bar */}
                        {selectedProducts.length > 0 && (
                            <div className="flex items-center justify-between px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                                <span className="text-sm text-amber-800 dark:text-amber-300">
                                    បានជ្រើស <strong>{selectedProducts.length}</strong> ផលិតផល
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleBulkAction("activate")} className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">បើក</button>
                                    <button onClick={() => handleBulkAction("deactivate")} className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">បិទ</button>
                                    <button onClick={() => handleBulkAction("delete")} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">លុប</button>
                                </div>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                <input type="checkbox"
                                    checked={selectedProducts.length === products.data.length && products.data.length > 0}
                                    onChange={selectAll}
                                    className="accent-emerald-600" />
                                <span>ជ្រើសទាំងអស់</span>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span>{products.data.length} ផលិតផល</span>
                            </label>
                            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <button onClick={() => setViewMode("list")}
                                    className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                    <List className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode("grid")}
                                    className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                    <Grid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List View */}
                        {viewMode === "list" ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                            <th className="w-8 px-5 py-3.5"></th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ផលិតផល</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">អ្នកលក់</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ប្រភេទ</th>
                                            <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">តម្លៃ</th>
                                            <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ស្តុក</th>
                                            <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">ស្ថានភាព</th>
                                            <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">សកម្មភាព</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-16 text-gray-400">
                                                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                                    <p>មិនមានផលិតផលណាមួយទេ</p>
                                                </td>
                                            </tr>
                                        ) : products.data.map(product => (
                                            <tr key={product.product_id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <input type="checkbox" checked={selectedProducts.includes(product.product_id)} onChange={() => toggleSel(product.product_id)} className="accent-emerald-600" />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                                                            {getImg(product)
                                                                ? <img src={getImg(product)!} alt={product.productname} className="w-full h-full object-cover" />
                                                                : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800 dark:text-gray-200">{product.productname}</div>
                                                            <div className="text-xs text-gray-400">{product.unit}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-gray-700 dark:text-gray-300 text-sm">{product.seller.farm_name}</div>
                                                    <div className="text-xs text-gray-400">@{product.seller.user.username}</div>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{product.category.categoryname}</td>
                                                <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">៛ {product.price}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        product.stock === "available"
                                                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                                    }`}>
                                                        {product.stock === "available" ? "មានស្តុក" : "អស់ស្តុក"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleActive(product)}
                                                        title={product.is_active ? "ចុចដើម្បីបិទ" : "ចុចដើម្បីបើក"}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                                            product.is_active
                                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}>
                                                        {product.is_active
                                                            ? <><ToggleRight className="w-3.5 h-3.5" /> សកម្ម</>
                                                            : <><ToggleLeft className="w-3.5 h-3.5" /> អសកម្ម</>}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link href={route("admin.products.show", product.product_id)}>
                                                            <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="មើល"><Eye className="w-4 h-4" /></button>
                                                        </Link>
                                                        <Link href={route("admin.products.edit", product.product_id)}>
                                                            <button className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors" title="កែសម្រួល"><Edit2 className="w-4 h-4" /></button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="លុប">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Grid View */
                            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.data.map(product => (
                                    <div key={product.product_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-square bg-gray-50 dark:bg-gray-700 relative flex items-center justify-center overflow-hidden">
                                            {getImg(product)
                                                ? <img src={getImg(product)!} alt={product.productname} className="w-full h-full object-cover" />
                                                : <ImageIcon className="w-8 h-8 text-gray-300" />}
                                            <div className="absolute top-2 left-2">
                                                <input type="checkbox" checked={selectedProducts.includes(product.product_id)} onChange={() => toggleSel(product.product_id)} className="accent-emerald-600" />
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {product.is_active ? "សកម្ម" : "អសកម្ម"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{product.productname}</div>
                                            <div className="text-xs text-gray-400 mt-0.5 mb-2">{product.category.categoryname}</div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-bold text-sm text-gray-800 dark:text-white">${product.price}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock === "available" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                    {product.stock === "available" ? "មានស្តុក" : "អស់"}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={route("admin.products.show", product.product_id)} className="flex-1 text-center py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">មើល</Link>
                                                <Link href={route("admin.products.edit", product.product_id)} className="flex-1 text-center py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors">កែ</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500">
                                    បង្ហាញ {(products.current_page - 1) * products.per_page + 1}–{Math.min(products.current_page * products.per_page, products.total)} នៃ {products.total}
                                </p>
                                <div className="flex gap-1">
                                    <button onClick={() => goToPage(products.links[0]?.url)} disabled={products.current_page === 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">‹</button>
                                    {products.links.slice(1, -1).map((link, i) => (
                                        <button key={i} onClick={() => goToPage(link.url)}
                                            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${link.active ? "bg-emerald-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                    <button onClick={() => goToPage(products.links[products.links.length - 1]?.url)} disabled={products.current_page === products.last_page}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">›</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}
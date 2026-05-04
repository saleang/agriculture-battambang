// pages/admin/products/index.tsx
import { useState, useCallback } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import {
    Search, Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon,
    Grid, List, RefreshCw, ToggleLeft, ToggleRight, Check, AlertTriangle, X,
    Package
} from "lucide-react";
import Swal from "sweetalert2";
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    stock: string;
    is_active: boolean;
    category: { category_name: string };
    seller: { farm_name: string; user: { username: string } };
    images: Array<{ image_url: string; is_primary: boolean }>;
}

interface Category { 
    category_id: number; 
    category_name: string 
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

/* ─── Color palette ──────────────────────────── */
const C = {
    p: '#228B22',
    dark: '#006400',
    sub: '#6b7280',
    display: "'Moul', serif",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { 
    message: string; 
    type: "success" | "error"; 
    onClose: () => void 
}) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
            type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-red-50 border-red-200 text-red-800"
        }`}>
            {type === "success" ? (
                <Check className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
            ) : (
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            )}
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{message}</p>
            <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductIndex() {
    const { products, categories, filters } = usePage<PageProps<{ 
        products: PaginatedProducts;
        categories: Category[];
        filters: { search?: string; category_id?: string; status?: string; stock?: string };
    }>>().props;

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
        setSearch("");
        setSelectedCategory("");
        setSelectedStatus("");
        setSelectedStock("");
        router.get(route("admin.products.index"), {}, { preserveState: false, replace: true });
    };

    const handleToggleActive = async (product: Product) => {
        try {
            await axios.patch(`/admin/products/${product.product_id}/toggle-active`);
            showToast(
                `ផលិតផល${product.is_active ? "បានបិទ" : "បានបើក"}ដោយជោគជ័យ!`,
                "success"
            );
            router.reload({ only: ["products"] });
        } catch (err: any) {
            console.error('Toggle error:', err.response?.data);
            showToast("បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាព", "error");
        }
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
            onSuccess: () => {
                showToast("លុបផលិតផលដោយជោគជ័យ!", "success");
                router.reload({ only: ["products"] });
            },
            onError: () => showToast("បរាជ័យក្នុងការលុបផលិតផល", "error"),
        });
    };

    const handleBulkAction = async (action: string) => {
        if (selectedProducts.length === 0) {
            showToast("សូមជ្រើសរើសផលិតផលជាមុន", "error");
            return;
        }

        const label: Record<string, string> = { 
            activate: "បើក", 
            deactivate: "បិទ", 
            delete: "លុប" 
        };

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

        router.post(route("admin.products.bulk-action"), { 
            action, 
            product_ids: selectedProducts 
        }, {
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
        setSelectedProducts(selectedProducts.length === products.data.length 
            ? [] 
            : products.data.map(p => p.product_id)
        );

    const getImg = (product: Product) => {
        const img = product.images.find(i => i.is_primary);
        if (!img) return null;
        return img.image_url.startsWith("http") 
            ? img.image_url 
            : `/storage/${img.image_url}`;
    };

    const goToPage = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="គ្រប់គ្រងផលិតផល" />

            <div className="min-h-screen bg-slate-50/70">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 11,
                                background: `linear-gradient(135deg,${C.p},${C.dark})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ 
                                    fontFamily: C.display, 
                                    color: C.p, 
                                    fontSize: 22, 
                                    margin: 0 
                                }}>
                                    ផ្ទាំងគ្រប់គ្រងផលិតផល
                                </h1>
                                <p style={{ color: C.sub, fontSize: 15, margin: 0 }}>
                                    គ្រប់គ្រងផលិតផលទាំងអស់ក្នុងប្រព័ន្ធ
                                </p>
                            </div>
                        </div>

                        {/* <Link href={route("admin.products.create")}>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-[16px] font-medium text-white hover:bg-green-700 transition-colors">
                                <Plus size={18} /> បន្ថែមផលិតផល
                            </button>
                        </Link> */}
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="ស្វែងរកផលិតផល..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && applyFilters()}
                                    className="w-full pl-11 pr-4 py-3.5 text-[16px] bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>

                            <select 
                                value={selectedCategory} 
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="min-w-[80px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[16px] focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                            >
                                <option value="">ប្រភេទទាំងអស់</option>
                                {categories.map(c => (
                                    <option key={c.category_id} value={c.category_id}>
                                        {c.category_name}
                                    </option>
                                ))}
                            </select>

                            <select 
                                value={selectedStatus} 
                                onChange={e => setSelectedStatus(e.target.value)}
                                className="min-w-[160px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[16px] focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                            >
                                <option value="">ស្ថានភាពទាំងអស់</option>
                                <option value="active">សកម្ម</option>
                                <option value="inactive">អសកម្ម</option>
                            </select>

                            <select 
                                value={selectedStock} 
                                onChange={e => setSelectedStock(e.target.value)}
                                className="min-w-[160px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[16px] focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                            >
                                <option value="">ស្តុកទាំងអស់</option>
                                <option value="available">មានស្តុក</option>
                                <option value="out_of_stock">អស់ស្តុក</option>
                            </select>

                            <button 
                                onClick={applyFilters}
                                className="px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white text-[16px] font-medium rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <Filter size={16} /> ស្វែងរក
                            </button>

                            <button 
                                onClick={resetFilters}
                                className="px-6 py-3.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[16px] font-medium rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} /> កំណត់ឡើងវិញ
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Bulk Action Bar */}
                        {selectedProducts.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-3.5 bg-amber-50 border-b border-amber-200">
                                <span className="text-[16px] text-amber-800">
                                    កំពុងជ្រើសរើស <strong>{selectedProducts.length}</strong> ផលិតផល
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleBulkAction("activate")} 
                                        className="px-4 py-2 text-[16px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                        បើក
                                    </button>
                                    <button onClick={() => handleBulkAction("deactivate")} 
                                        className="px-4 py-2 text-[16px] bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                                        បិទ
                                    </button>
                                    <button onClick={() => handleBulkAction("delete")} 
                                        className="px-4 py-2 text-[16px] bg-red-600 hover:bg-red-700 text-white rounded-xl">
                                        លុប
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <label className="flex items-center gap-2 text-[16px] text-gray-600 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={selectedProducts.length === products.data.length && products.data.length > 0}
                                    onChange={selectAll}
                                    className="accent-emerald-600 w-4 h-4"
                                />
                                <span>ជ្រើសទាំងអស់</span>
                                <span className="text-gray-300">|</span>
                                <span>{products.data.length} ផលិតផល</span>
                            </label>

                            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                <button 
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    <List size={18} />
                                </button>
                                <button 
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    <Grid size={18} />
                                </button>
                            </div>
                        </div>

                        {/* List View */}
                        {viewMode === "list" ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] text-[16px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-10 px-6 py-4"></th>
                                            <th className="text-left px-6 py-4 font-semibold text-gray-600">ផលិតផល</th>
                                            <th className="text-left px-6 py-4 font-semibold text-gray-600">អ្នកលក់</th>
                                            <th className="text-left px-6 py-4 font-semibold text-gray-600">ប្រភេទ</th>
                                            <th className="text-left px-6 py-4 font-semibold text-gray-600">តម្លៃ</th>
                                            <th className="text-center px-6 py-4 font-semibold text-gray-600">ស្តុក</th>
                                            <th className="text-center px-6 py-4 font-semibold text-gray-600">ស្ថានភាព</th>
                                            <th className="text-center px-6 py-4 font-semibold text-gray-600">សកម្មភាព</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-16 text-center">
                                                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                    <p className="text-[16px] text-gray-500">មិនមានផលិតផលណាមួយទេ</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            products.data.map((product) => (
                                                <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedProducts.includes(product.product_id)}
                                                            onChange={() => toggleSel(product.product_id)}
                                                            className="accent-emerald-600 w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                                                {getImg(product) ? (
                                                                    <img src={getImg(product)!} alt={product.productname} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{product.productname}</div>
                                                                <div className="text-[15px] text-gray-500">{product.unit}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-800">{product.seller.farm_name}</div>
                                                        <div className="text-[15px] text-gray-500">@{product.seller.user.username}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{product.category.category_name}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">៛ {product.price}
                                                        
                                                    </td>
                                                    <td className="px-3 py-4 text-center">
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-[15px] font-medium ${
                                                            product.stock === "available" 
                                                                ? "bg-emerald-50 text-emerald-700" 
                                                                : "bg-red-50 text-red-700"
                                                        }`}>
                                                            {product.stock === "available" ? "មានស្តុក" : "អស់ស្តុក"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleToggleActive(product)}
                                                            className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[15px] cursor-pointer font-medium transition-colors ${
                                                                product.is_active
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {product.is_active ? (
                                                                <><ToggleRight size={16} /> សកម្ម</>
                                                            ) : (
                                                                <><ToggleLeft size={16} /> អសកម្ម</>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2 ">
                                                            <Link href={route("admin.products.show", product.product_id)}>
                                                                <button className="flex items-center gap-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-[16px] transition-colors cursor-pointer">
                                                                    <Eye size={16} /> មើល
                                                                </button>
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleDelete(product)}
                                                                className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-[16px] transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 size={16} /> លុប
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Grid View */
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                                {products.data.map(product => (
                                    <div key={product.product_id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white group">
                                        <div className="aspect-square relative bg-gray-100">
                                            {getImg(product) ? (
                                                <img src={getImg(product)!} alt={product.productname} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                                </div>
                                            )}

                                            {/* Checkbox Top Left */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.product_id)}
                                                    onChange={() => toggleSel(product.product_id)}
                                                    className="w-5 h-5 accent-green-600 bg-white border-2 border-white shadow-sm rounded cursor-pointer"
                                                />
                                            </div>

                                            {/* Status Badge Top Right */}
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-3 py-1 text-[14px] font-medium rounded-full ${
                                                    product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {product.is_active ? "សកម្ម" : "អសកម្ម"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="font-medium text-[16px] text-gray-900 line-clamp-2 mb-1">
                                                {product.productname}
                                            </div>
                                            <div className="text-[15px] text-gray-500 mb-3">{product.category.category_name}</div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-[16px] font-semibold text-gray-900">៛ {product.price.toLocaleString()}</div>
                                                    <div className="text-[14px] text-gray-500">{product.unit}</div>
                                                </div>
                                                <Link href={route("admin.products.show", product.product_id)}>
                                                    <button className="px-5 py-2 text-[16px] bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
                                                        មើល
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                                <p className="text-[15px] text-gray-500">
                                    បង្ហាញ {(products.current_page - 1) * products.per_page + 1}–{Math.min(products.current_page * products.per_page, products.total)} នៃ {products.total}
                                </p>
                                {/* Your pagination buttons */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}
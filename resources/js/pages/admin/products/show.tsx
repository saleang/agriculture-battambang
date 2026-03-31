// pages/admin/products/show.tsx
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import {
    ArrowLeft, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon,
    Eye, Mail, Phone, MapPin, Store, Check, AlertTriangle, X, ToggleLeft, ToggleRight
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    product_id: number;
    productname: string;
    price: number;
    unit: string;
    stock: string;
    description: string;
    is_active: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    category: { category_name: string };
    seller: {
        farm_name: string;
        location_province: string;
        location_district: string;
        user: { username: string; email: string; phone: string };
    };
    images: Array<{ image_id: number; image_url: string; is_primary: boolean; display_order: number }>;
}

interface PagePropsExtended {
    product: Product;
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

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0 text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">{label}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{children}</span>
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ title, children, bodyClass = "p-5" }: { title: string; children: React.ReactNode; bodyClass?: string }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-4 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <div className="w-1 h-4 bg-emerald-500 rounded-full shrink-0"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
            </div>
            <div className={bodyClass}>{children}</div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductShow() {
    const { product } = usePage<PagePropsExtended>().props;
    const [currentImg, setCurrentImg] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const getUrl = (url: string) => url.startsWith("http") ? url : `/storage/${url}`;

    const handleToggle = () => {
        router.patch(route("admin.products.toggle-active", product.product_id), {}, {
            preserveScroll: true,
            onSuccess: () => { showToast(`ផលិតផល${product.is_active ? "បានបិទ" : "បានបើក"}!`, "success"); window.location.reload(); },
            onError: () => showToast("បរាជ័យ", "error"),
        });
    };

    const handleDelete = async () => {
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
            onSuccess: () => { showToast("លុបផលិតផលដោយជោគជ័យ!", "success"); router.visit(route("admin.products.index")); },
            onError: () => showToast("បរាជ័យ", "error"),
        });
    };

    return (
        <AppLayout>
            <Head title={`ផលិតផល: ${product.productname}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-wrap">
                        <div className="flex items-center gap-3">
                            <Link href={route("admin.products.index")}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> ត្រឡប់ក្រោយ
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{product.productname}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">ព័ត៌មានលម្អិត</p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Link href={route("admin.products.edit", product.product_id)}>
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
                                    <Edit2 className="w-3.5 h-3.5" /> កែសម្រួល
                                </button>
                            </Link>
                            <button
                                onClick={handleToggle}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                                    product.is_active
                                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}>
                                {product.is_active
                                    ? <><ToggleLeft className="w-3.5 h-3.5" /> បិទផលិតផល</>
                                    : <><ToggleRight className="w-3.5 h-3.5" /> បើកផលិតផល</>}
                            </button>
                            <button onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> លុប
                            </button>
                        </div>
                    </div>

                    {/* Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

                        {/* Left Column */}
                        <div>
                            {/* Images */}
                             <Card title="រូបភាព" bodyClass="p-3">
                                {product.images.length > 0 ? (
                                    <>
                                        <img
                                            src={getUrl(product.images[currentImg].image_url)}
                                            alt={product.productname}
                                            className="w-100 aspect-square object-cover bg-gray-50 dark:bg-gray-800 rounded-xl block"
                                            onError={e => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/280?text=No+Image" }}
                                        />
                                        {product.images.length > 1 && (
                                            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                                                {product.images.map((img, i) => (
                                                    <button key={img.image_id} onClick={() => setCurrentImg(i)}
                                                        className={`w-10 h-10 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImg ? "border-emerald-500" : "border-gray-200 dark:border-gray-700"}`}>
                                                        <img src={getUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <ImageIcon className="w-8 h-8 opacity-40" />
                                        <span className="text-xs">គ្មានរូបភាព</span>
                                    </div>
                                )}
                            </Card>


                            {/* Description */}
                            <Card title="បរិយាយ">
                                {product.description
                                    ? <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                                    : <p className="text-sm text-gray-400 italic">មិនមានការបរិយាយ</p>}
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Product Info */}
                            <Card title="ព័ត៌មានផលិតផល" bodyClass="px-5 py-2">
                                <InfoRow label="ស្ថានភាព">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        product.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                                        {product.is_active ? "សកម្ម" : "អសកម្ម"}
                                    </span>
                                </InfoRow>
                                <InfoRow label="ស្តុក">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        product.stock === "available" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    }`}>
                                        {product.stock === "available" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {product.stock === "available" ? "មានស្តុក" : "អស់ស្តុក"}
                                    </span>
                                </InfoRow>
                                <InfoRow label="តម្លៃ">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">៛{product.price} <span className="text-gray-400 font-normal text-xs">/ {product.unit}</span></span>
                                </InfoRow>
                                <InfoRow label="ប្រភេទ">{product.category.category_name}</InfoRow>
                                {/* <InfoRow label={<><Eye className="w-3.5 h-3.5" /> ចំនួនមើល</>}>{product.views_count.toLocaleString()}</InfoRow> */}
                                <InfoRow label="បានបង្កើត">
                                    <span className="text-xs">{new Date(product.created_at).toLocaleDateString("km-KH")}</span>
                                </InfoRow>
                                <InfoRow label="បានធ្វើបច្ចុប្បន្នភាព">
                                    <span className="text-xs">{new Date(product.updated_at).toLocaleDateString("km-KH")}</span>
                                </InfoRow>
                            </Card>

                            {/* Seller Info */}
                            <Card title="ព័ត៌មានអ្នកលក់" bodyClass="px-5 py-2">
                                <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60">
                                    <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                                        <Store className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{product.seller.farm_name}</div>
                                        <div className="text-xs text-gray-400">@{product.seller.user.username}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60">
                                    <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{product.seller.user.email}</span>
                                </div>
                                {product.seller.user.phone && (
                                    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60">
                                        <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{product.seller.user.phone}</span>
                                    </div>
                                )}
                                {(product.seller.location_province || product.seller.location_district) && (
                                    <div className="flex items-center gap-3 py-2.5">
                                        <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {[product.seller.location_district, product.seller.location_province].filter(Boolean).join(", ")}
                                        </span>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}

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
import axios from 'axios';

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
            type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-red-50 border-red-200 text-red-800"
        }`}>
            {type === "success" ? <Check className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" /> 
                                : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />}
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{message}</p>
            <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-[16px] text-gray-500">{label}</span>
            <span className="text-[16px] font-medium text-gray-900 text-right">{children}</span>
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ title, children, bodyClass = "p-5" }: { 
    title: string; 
    children: React.ReactNode; 
    bodyClass?: string 
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-[16px] font-semibold text-gray-800">{title}</h3>
            </div>
            <div className={bodyClass}>{children}</div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductShow() {
    const { product } = usePage<PageProps<{ product: Product }>>().props;
    const [currentImg, setCurrentImg] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const getUrl = (url: string) => url.startsWith("http") ? url : `/storage/${url}`;

    const handleToggle = async () => {
        try {
            await axios.patch(`/admin/products/${product.product_id}/toggle-active`);
            showToast(`ផលិតផល${product.is_active ? "បានបិទ" : "បានបើក"}!`, "success");
            router.reload();
        } catch (err: any) {
            console.error('Toggle error:', err.response?.data);
            showToast("បរាជ័យ", "error");
        }
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
            onSuccess: () => {
                showToast("លុបផលិតផលដោយជោគជ័យ!", "success");
                router.visit(route("admin.products.index"));
            },
            onError: () => showToast("បរាជ័យ", "error"),
        });
    };

    return (
        <AppLayout>
            <Head title={`ផលិតផល: ${product.productname}`} />

            <div className="min-h-screen bg-slate-50/70">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route("admin.products.index")}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-[16px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <ArrowLeft size={18} /> ត្រឡប់ក្រោយ
                            </Link>
                            <div>
                                <h1 style={{ 
                                    fontFamily: C.display, 
                                    color: C.p, 
                                    fontSize: 22, 
                                    margin: 0 
                                }}>
                                    {product.productname}
                                </h1>
                                <p style={{ color: C.sub, fontSize: 15, margin: 0 }}>
                                    ព័ត៌មានលម្អិតផលិតផល
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleToggle}
                                className={`inline-flex items-center gap-2 px-5 py-3 text-[16px] font-medium rounded-xl transition-colors ${
                                    product.is_active
                                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                }`}>
                                {product.is_active
                                    ? <><ToggleLeft size={18} /> បិទផលិតផល</>
                                    : <><ToggleRight size={18} /> បើកផលិតផល</>}
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-5 py-3 text-[16px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                            >
                                <Trash2 size={18} /> លុប
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Images Card */}
<Card title="រូបភាពផលិតផល" bodyClass="p-4">
    {product.images.length > 0 ? (
        <>
            <div className="max-w-md mx-auto">
                <img
                    src={getUrl(product.images[currentImg].image_url)}
                    alt={product.productname}
                    className="w-full rounded-2xl shadow-sm border border-gray-100"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/600?text=No+Image";
                    }}
                />
            </div>

            {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                    {product.images.map((img, i) => (
                        <button
                            key={img.image_id}
                            onClick={() => setCurrentImg(i)}
                            className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                i === currentImg ? "border-green-500 scale-105" : "border-gray-200"
                            }`}
                        >
                            <img 
                                src={getUrl(img.image_url)} 
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                        </button>
                    ))}
                </div>
            )}
        </>
    ) : (
        <div className="w-full aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-[16px]">គ្មានរូបភាព</span>
        </div>
    )}
</Card>

                            {/* Description Card */}
                            <Card title="បរិយាយ">
                                {product.description ? (
                                    <p className="text-[16px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                ) : (
                                    <p className="text-[16px] text-gray-400 italic">មិនមានការបរិយាយ</p>
                                )}
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Product Info */}
                            <Card title="ព័ត៌មានផលិតផល">
                                <InfoRow label="ស្ថានភាព">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[15px] font-medium ${
                                        product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                                        {product.is_active ? "សកម្ម" : "អសកម្ម"}
                                    </span>
                                </InfoRow>

                                <InfoRow label="ស្តុក">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[15px] font-medium ${
                                        product.stock === "available" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                    }`}>
                                        {product.stock === "available" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {product.stock === "available" ? "មានស្តុក" : "អស់ស្តុក"}
                                    </span>
                                </InfoRow>

                                <InfoRow label="តម្លៃ">
                                    <span className="text-[17px] font-semibold text-emerald-600">
                                        ៛ {product.price} 
                                        <span className="text-gray-400 text-[15px] font-normal"> / {product.unit}</span>
                                    </span>
                                </InfoRow>

                                <InfoRow label="ប្រភេទ">{product.category.category_name}</InfoRow>
                                <InfoRow label="បានបង្កើត">
                                    {new Date(product.created_at).toLocaleDateString("km-KH")}
                                </InfoRow>
                                <InfoRow label="បានធ្វើបច្ចុប្បន្នភាព">
                                    {new Date(product.updated_at).toLocaleDateString("km-KH")}
                                </InfoRow>
                            </Card>

                            {/* Seller Info */}
                            <Card title="ព័ត៌មានអ្នកលក់">
                                <div className="space-y-4 py-1">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mt-0.5">
                                            <Store size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[16px] font-medium text-gray-900">{product.seller.farm_name}</div>
                                            <div className="text-[15px] text-gray-500">@{product.seller.user.username}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                            <Mail size={18} />
                                        </div>
                                        <span className="text-[16px] text-gray-700">{product.seller.user.email}</span>
                                    </div>

                                    {product.seller.user.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                                <Phone size={18} />
                                            </div>
                                            <span className="text-[16px] text-gray-700">{product.seller.user.phone}</span>
                                        </div>
                                    )}

                                    {(product.seller.location_province || product.seller.location_district) && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mt-0.5">
                                                <MapPin size={18} />
                                            </div>
                                            <span className="text-[16px] text-gray-700">
                                                {[product.seller.location_district, product.seller.location_province].filter(Boolean).join(", ")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}
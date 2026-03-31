// pages/admin/products/edit.tsx
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import { route } from "@/lib/route";
import { ArrowLeft, Upload, X, Check, AlertTriangle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    product_id: number; productname: string; price: number; unit: string; stock: string;
    description: string; is_active: boolean; category_id: number; seller_id: number;
    category: { category_name: string };
    seller: { farm_name: string; user: { username: string } };
    images: Array<{ image_id: number; image_url: string; is_primary: boolean; display_order: number }>;x
}
interface Category { category_id: number; category_name: string }
interface Seller { seller_id: number; farm_name: string; user: { username: string } }

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

// ─── Form Card ────────────────────────────────────────────────────────────────
function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-1 h-4 bg-emerald-500 rounded-full shrink-0"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductEdit({ product, categories, sellers }: PageProps<{ product: Product; categories: Category[]; sellers: Seller[] }>) {
    const { data, setData, put, processing, errors } = useForm({
        seller_id: product.seller_id.toString(),
        productname: product.productname,
        price: product.price.toString(),
        category_id: product.category_id.toString(),
        unit: product.unit,
        stock: product.stock,
        description: product.description || "",
        is_active: product.is_active,
        images: [] as File[],
        delete_images: [] as string[],
    });
    const [imagePreviews, setImagePreviews] = useState<string[]>(
        product.images.map(img => img.image_url.startsWith("http") ? img.image_url : `/storage/${img.image_url}`)
    );
    const [existingImages, setExistingImages] = useState(product.images);
    const [dragOver, setDragOver] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleImageChange = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        const previews = [...imagePreviews];
        newFiles.forEach(file => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = e => { previews.push(e.target?.result as string); setImagePreviews([...previews]); };
                reader.readAsDataURL(file);
            }
        });
        setData("images", [...data.images, ...newFiles]);
    };

    const removeImage = (index: number) => {
        if (index < existingImages.length) {
            const img = existingImages[index];
            setData("delete_images", [...data.delete_images, `/storage/${img.image_url}`]);
            setExistingImages(existingImages.filter((_, i) => i !== index));
        } else {
            setData("images", data.images.filter((_, i) => i !== index - existingImages.length));
        }
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("seller_id", data.seller_id);
        fd.append("productname", data.productname);
        fd.append("price", data.price);
        fd.append("category_id", data.category_id);
        fd.append("unit", data.unit);
        fd.append("stock", data.stock);
        fd.append("description", data.description);
        fd.append("is_active", data.is_active ? "1" : "0");
        data.delete_images.forEach((url, i) => fd.append(`delete_images[${i}]`, url));
        data.images.forEach((img, i) => fd.append(`images[${i}]`, img));
        put(route("admin.products.update", product.product_id), {
            data: fd,
            onSuccess: () => { showToast("ធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!", "success"); router.visit(route("admin.products.index")); },
            onError: () => showToast("បរាជ័យ — សូមពិនិត្យទម្រង់បែបបទ", "error"),
        });
    };

    const inputCls = (hasError?: string) =>
        `w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-colors ${
            hasError ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"
        }`;

    return (
        <AppLayout>
            <Head title="កែសម្រួលផលិតផល" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <Link href={route("admin.products.index")}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> ត្រឡប់ក្រោយ
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">កែសម្រួលផលិតផល</h1>
                            <p className="text-xs text-gray-400 mt-0.5">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផលិតផល</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Two-column layout: left = form fields, right = images + status */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

                            {/* ── Left column ── */}
                            <div className="space-y-5">
                                <FormCard title="ព័ត៌មានមូលដ្ឋាន">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Seller */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">អ្នកលក់ <span className="text-red-500">*</span></label>
                                            <select value={data.seller_id} onChange={e => setData("seller_id", e.target.value)} required className={inputCls(errors.seller_id)}>
                                                <option value="">— ជ្រើសរើស —</option>
                                                {sellers.map(s => <option key={s.seller_id} value={s.seller_id}>{s.farm_name} (@{s.user.username})</option>)}
                                            </select>
                                            {errors.seller_id && <p className="text-xs text-red-500">{errors.seller_id}</p>}
                                        </div>

                                        {/* Product Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">ឈ្មោះផលិតផល <span className="text-red-500">*</span></label>
                                            <input type="text" value={data.productname} onChange={e => setData("productname", e.target.value)} required className={inputCls(errors.productname)} />
                                            {errors.productname && <p className="text-xs text-red-500">{errors.productname}</p>}
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">ប្រភេទ <span className="text-red-500">*</span></label>
                                            <select value={data.category_id} onChange={e => setData("category_id", e.target.value)} required className={inputCls(errors.category_id)}>
                                                <option value="">— ជ្រើសរើស —</option>
                                                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                            </select>
                                            {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                                        </div>

                                        {/* Price */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">តម្លៃ <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">៛ </span>
                                                <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData("price", e.target.value)} required className={`${inputCls(errors.price)} pl-7`} />
                                            </div>
                                            {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                                        </div>

                                        {/* Unit */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">ឯកតា</label>
                                            <select value={data.unit} onChange={e => setData("unit", e.target.value)} className={inputCls()}>
                                                <option value="kg">គីឡូក្រាម (kg)</option>
                                                <option value="g">ក្រាម (g)</option>
                                                <option value="lb">ផោន (lb)</option>
                                                <option value="oz">អោន (oz)</option>
                                                <option value="ton">តោន</option>
                                                <option value="piece">គ្រឿង</option>
                                                <option value="dozen">ដូហ្សែន</option>
                                                <option value="pack">កញ្ចប់</option>
                                                <option value="box">ប្រអប់</option>
                                            </select>
                                        </div>

                                        {/* Stock */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">ស្ថានភាពស្តុក <span className="text-red-500">*</span></label>
                                            <select value={data.stock} onChange={e => setData("stock", e.target.value)} required className={inputCls()}>
                                                <option value="available">មានស្តុក</option>
                                                <option value="out_of_stock">អស់ស្តុក</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-gray-100 dark:border-gray-800"></div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">បរិយាយ</label>
                                        <textarea value={data.description} onChange={e => setData("description", e.target.value)} rows={5} placeholder="បរិយាយអំពីផលិតផល..." className={`${inputCls()} resize-none`} />
                                    </div>
                                </FormCard>
                            </div>

                            {/* ── Right column ── */}
                            <div className="space-y-5">
                                {/* Images */}
                                <FormCard title="រូបភាពផលិតផល">
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                                        onDrop={e => { e.preventDefault(); setDragOver(false); handleImageChange(e.dataTransfer.files); }}
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                                    >
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            អូស ឬ{" "}
                                            <label className="text-emerald-600 cursor-pointer underline">
                                                រុករក
                                                <input type="file" multiple accept="image/*" onChange={e => handleImageChange(e.target.files)} className="hidden" />
                                            </label>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG — អតិបរិមា 10 រូប</p>
                                    </div>

                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {imagePreviews.map((src, i) => {
                                                const isExisting = i < existingImages.length;
                                                const existingImg = isExisting ? existingImages[i] : null;
                                                return (
                                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                                        <img src={src} alt="" className="w-full h-full object-cover"
                                                            onError={e => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/80?text=!" }} />
                                                        <button type="button" onClick={() => removeImage(i)}
                                                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full hidden group-hover:flex items-center justify-center">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        {existingImg?.is_primary && (
                                                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] rounded-md">ចម្បង</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </FormCard>

                                {/* Status */}
                                <FormCard title="ការកំណត់">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">សកម្ម — អ្នកទិញអាចមើលឃើញ</span>
                                        <button type="button" onClick={() => setData("is_active", !data.is_active)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.is_active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${data.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </FormCard>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <button type="submit" disabled={processing}
                                        className="w-full py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium">
                                        {processing ? "កំពុងរក្សាទុក..." : "រក្សាទុកការផ្លាស់ប្តូរ"}
                                    </button>
                                    <Link href={route("admin.products.index")}
                                        className="w-full py-2.5 text-sm text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                                        បោះបង់
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppLayout>
    );
}

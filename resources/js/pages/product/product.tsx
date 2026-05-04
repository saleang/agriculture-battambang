import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import React, { KeyboardEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Product {
    product_id: number;
    seller_product_id: number;
    productname: string;
    description?: string;
    price: number;
    unit: string;
    category_id: number;
    is_active: boolean;
    stock: 'available' | 'out_of_stock';
    created_at: string;
    updated_at: string;
    images?: { image_url: string; is_primary: boolean }[];
}

interface Category {
    category_id: number;
    category_name: string;
    is_active?: boolean;
}

interface ProductFormData extends Partial<Product> {
    existingImages?: { image_url: string; is_primary: boolean }[];
    newImages?: File[];
    newImagePreviews?: string[];
    deletedImages?: string[];
}

const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // New: Control form visibility
    const [showForm, setShowForm] = useState(true);

    const [formData, setFormData] = useState<ProductFormData>({
        stock: 'available',
        is_active: true,
        newImages: [],
        newImagePreviews: [],
        existingImages: [],
        deletedImages: [],
    });

    const [displayPrice, setDisplayPrice] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState<
        'seller_product_id' | 'name' | 'category' | 'price'
    >('name');
    const [selectedProductName, setSelectedProductName] = useState<string>('');
    const [selectedImages, setSelectedImages] = useState<
        { image_url: string; is_primary: boolean }[]
    >([]);
    const [showImageModal, setShowImageModal] = useState(false);

    const getCategoryName = (id?: number) =>
        categories.find((c) => c.category_id === id)?.category_name ?? 'មិនមាន';

    const khmerToWestern = (value: string): string => {
        const map: Record<string, string> = {
            '០': '0',
            '១': '1',
            '២': '2',
            '៣': '3',
            '៤': '4',
            '៥': '5',
            '៦': '6',
            '៧': '7',
            '៨': '8',
            '៩': '9',
        };
        return [...value]
            .map((c) => map[c] ?? c)
            .join('')
            .replace(/[^0-9]/g, '');
    };

    const westernToKhmer = (num: number | undefined): string => {
        if (num == null || Number.isNaN(num)) return '';
        return String(num).replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
    };

    const toKhmerPrice = (price: number | undefined): string => {
        if (price == null || Number.isNaN(price)) return '—';
        const whole = Math.floor(price);
        const formatted = whole.toLocaleString('en-US');
        return formatted.replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
    };

    const normalizeName = (name?: string): string =>
        (name || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[.,!?។ៗ។៕៖;]/g, '');

    const handlePriceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const char = e.key;
        if (
            [
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Tab',
                'Enter',
                'Home',
                'End',
                'Escape',
            ].includes(char)
        )
            return;
        if (/[0-9]/.test(char) || /[០-៩]/.test(char)) return;
        e.preventDefault();
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/seller/product');
            const list = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];
            setProducts(
                list.map((p: any) => ({
                    ...p,
                    price: p.price != null ? Number(p.price) : 0,
                })),
            );
        } catch (err) {
            console.error('កំហុសក្នុងការទាញយកផលិតផល៖', err);
            Swal.fire({
                title: 'កំហុស',
                text: 'មិនអាចផ្ទុកបញ្ជីផលិតផលបានទេ',
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/seller/category/my-categories');
            const data = res.data?.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('កំហុសក្នុងការទាញយកប្រភេទ៖', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (formData.price != null && !Number.isNaN(formData.price)) {
            setDisplayPrice(westernToKhmer(formData.price));
        } else {
            setDisplayPrice('');
        }
    }, [formData.price]);

    const cleanupNewImages = () => {
        formData.newImagePreviews?.forEach((url) => {
            if (url) URL.revokeObjectURL(url);
        });
    };

    const resetForm = () => {
        cleanupNewImages();
        setFormData({
            stock: 'available',
            is_active: true,
            productname: '',
            price: undefined,
            category_id: undefined,
            unit: 'គ.ក្រ',
            description: '',
            newImages: [],
            newImagePreviews: [],
            existingImages: [],
            deletedImages: [],
            product_id: undefined,
        });
        setDisplayPrice('');
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let newValue: string | number | boolean | undefined;

        if (type === 'checkbox') {
            newValue = checked;
        } else if (name === 'price') {
            if (value !== displayPrice) setDisplayPrice(value);
            const normalized = khmerToWestern(value);
            newValue = normalized ? Number(normalized) : undefined;
        } else if (name === 'category_id') {
            newValue = value === '' ? undefined : Number(value);
        } else {
            newValue = value;
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const getFileKey = (file: File) =>
        `${file.name.toLowerCase().trim()}|${file.size}|${file.lastModified}`;

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newFiles = Array.from(e.target.files) as File[];

        setFormData((prev) => {
            const currentFiles = prev.newImages ?? [];
            const currentPreviews = prev.newImagePreviews ?? [];

            const sessionKeys = new Set(currentFiles.map(getFileKey));
            const existingFilenames = new Set(
                (prev.existingImages || [])
                    .map(
                        (img) =>
                            img.image_url
                                .split('/')
                                .pop()
                                ?.toLowerCase()
                                .trim() || '',
                    )
                    .filter(Boolean),
            );

            const reallyNewFiles: File[] = [];
            const newPreviews: string[] = [];
            let skippedCount = 0;
            const skippedReasons: string[] = [];

            newFiles.forEach((file) => {
                const sessionKey = getFileKey(file);
                const fileNameLower = file.name.toLowerCase().trim();

                if (sessionKeys.has(sessionKey)) {
                    skippedCount++;
                    skippedReasons.push(`មានរួចហើយ៖ ${file.name}`);
                    return;
                }

                if (existingFilenames.has(fileNameLower)) {
                    skippedCount++;
                    skippedReasons.push(`មានរួចហើយនៅលើផលិតផល៖ ${file.name}`);
                    return;
                }

                sessionKeys.add(sessionKey);
                reallyNewFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            });

            if (skippedCount > 0) {
                Swal.fire({
                    title:
                        skippedCount === newFiles.length
                            ? 'រូបភាពស្ទួន'
                            : 'រូបភាពខ្លះត្រូវបានរំលង',
                    html: `${skippedCount} រូបភាពស្ទួន៖<br><ul>${skippedReasons.map((r) => `<li>${r}</li>`).join('')}</ul>`,
                    icon: 'info',
                });
            }

            return {
                ...prev,
                newImages: [...currentFiles, ...reallyNewFiles],
                newImagePreviews: [...currentPreviews, ...newPreviews],
            };
        });

        e.target.value = '';
    };

    const removeImage = (index: number, isNew: boolean) => {
        setFormData((prev) => {
            const newState = { ...prev };

            if (isNew) {
                const previewUrl = prev.newImagePreviews?.[index];
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                newState.newImages =
                    prev.newImages?.filter((_, i) => i !== index) || [];
                newState.newImagePreviews =
                    prev.newImagePreviews?.filter((_, i) => i !== index) || [];
            } else {
                const removed = prev.existingImages?.[index];
                if (removed) {
                    newState.existingImages =
                        prev.existingImages?.filter((_, i) => i !== index) ||
                        [];
                    newState.deletedImages = [
                        ...(prev.deletedImages || []),
                        removed.image_url,
                    ];
                }
            }
            return newState;
        });
    };

    const handleSubmit = async () => {
        const isUpdate = !!formData.product_id;

        const required = ['productname', 'price', 'category_id'] as const;
        const missing = required.filter(
            (key) => formData[key] == null || formData[key] === '',
        );
        if (missing.length > 0) {
            Swal.fire({
                title: 'កំហុស',
                text: `ខ្វះព័ត៌មាន៖ ${missing.join(', ')}`,
                icon: 'error',
            });
            return;
        }

        if (!isUpdate) {
            const normalizedNewName = normalizeName(formData.productname);
            const isDuplicate = products.some(
                (p) => normalizeName(p.productname) === normalizedNewName,
            );
            if (isDuplicate) {
                Swal.fire({
                    title: 'ផលិតផលស្ទួន',
                    html: `ឈ្មោះផលិតផល <b>"${formData.productname}"</b> មានរួចហើយក្នុងបញ្ជីរបស់អ្នក។<br>សូមប្រើឈ្មោះផ្សេង ឬកែសម្រួលផលិតផលដែលមានស្រាប់។`,
                    icon: 'warning',
                });
                return;
            }
        }

        let imagesToSend = formData.newImages ?? [];
        const seen = new Map<string, File>();
        imagesToSend.forEach((file) => {
            const key = getFileKey(file);
            if (!seen.has(key)) seen.set(key, file);
        });

        const dedupedFiles = Array.from(seen.values());

        const fd = new FormData();

        const coreFields = [
            'productname',
            'price',
            'category_id',
            'unit',
            'stock',
            'description',
            'is_active',
        ] as const;

        coreFields.forEach((key) => {
            const val = formData[key];
            if (val !== undefined && val !== null) {
                if (key === 'price' && typeof val === 'number') {
                    fd.append(key, val.toFixed(0));
                } else {
                    fd.append(
                        key,
                        typeof val === 'boolean'
                            ? val
                                ? '1'
                                : '0'
                            : String(val),
                    );
                }
            }
        });

        if (isUpdate) fd.append('_method', 'PUT');
        if (isUpdate && formData.deletedImages?.length) {
            formData.deletedImages.forEach((url) =>
                fd.append('delete_images[]', url),
            );
        }

        dedupedFiles.forEach((file) => fd.append('images[]', file));

        try {
            const url = isUpdate
                ? `/seller/product/${formData.product_id}`
                : '/seller/product';
            await axios.post(url, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({
                title: 'ជោគជ័យ',
                text: isUpdate
                    ? 'ផលិតផលត្រូវបានកែប្រែ'
                    : 'ផលិតផលត្រូវបានបន្ថែម',
                icon: 'success',
                timer: 1800,
                showConfirmButton: false,
            });

            cleanupNewImages();
            resetForm();
            fetchProducts();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ';
            Swal.fire('កំហុស', msg, 'error');
        }
    };

    const toggleActive = async (product_id: number, currentStatus: boolean) => {
        try {
            await axios.patch(`/seller/product/${product_id}/toggle-active`);
            setProducts((prev) =>
                prev.map((p) =>
                    p.product_id === product_id
                        ? { ...p, is_active: !currentStatus }
                        : p,
                ),
            );
        } catch {
            Swal.fire(
                'មានកំហុស',
                'មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពបានទេ',
                'error',
            );
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'តើអ្នកពិតជាចង់លុបមែនឬ?',
            text: 'ផលិតផលនេះនឹងត្រូវបានលុប!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'បាទ/ចាស!',
            cancelButtonText: 'បោះបង់',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/seller/product/${id}`);
                    Swal.fire({
                        title: 'បានលុប!',
                        text: 'ផលិតផលត្រូវបានលុបរួចរាល់។',
                        icon: 'success',
                        timer: 1500,
                    });
                    fetchProducts();
                } catch {
                    Swal.fire('កំហុស!', 'មិនអាចលុបបានទេ', 'error');
                }
            }
        });
    };

    const handleEdit = (p: Product) => {
        cleanupNewImages();
        setFormData({
            ...p,
            unit: p.unit || 'គ.ក្រ',
            stock: p.stock || 'available',
            description: p.description || '',
            is_active: p.is_active ?? true,
            existingImages: p.images ?? [],
            newImages: [],
            newImagePreviews: [],
            deletedImages: [],
        });
    };

    const openImageModal = (product: Product) => {
        if (!product.images?.length) return;
        setSelectedProductName(product.productname);
        setSelectedImages(product.images);
        setShowImageModal(true);
    };

    const filteredProducts = products.filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.trim().toLowerCase();
        switch (searchBy) {
            case 'seller_product_id':
                return String(p.seller_product_id).includes(term);
            case 'name':
                return p.productname.toLowerCase().includes(term);
            case 'category':
                return getCategoryName(p.category_id)
                    .toLowerCase()
                    .includes(term);
            case 'price':
                return String(p.price).includes(term);
            default:
                return true;
        }
    });

    const toggleForm = () => setShowForm((prev) => !prev);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 py-6 font-khmer">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header with Toggle */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-moul text-green-700 mb-2">
                            ការគ្រប់គ្រងផលិតផល
                        </h2>
                        <button
                            onClick={toggleForm}
                            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-red-600"
                        >
                            {showForm ? 'លាក់ទម្រង់ ↑' : 'បង្ហាញទម្រង់ ↓'}
                        </button>
                    </div>

                    {/* Form Section */}
                    {showForm && (
                        <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                            <h2 className="mb-5 text-2xl font-semibold text-gray-800">
                                {formData.product_id
                                    ? 'កែសម្រួលផលិតផល'
                                    : 'បន្ថែមផលិតផលថ្មី'}
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        ឈ្មោះផលិតផល
                                    </label>
                                    <input
                                        name="productname"
                                        placeholder="ឈ្មោះផលិតផល"
                                        value={formData.productname || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-green-700 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        តម្លៃ (រៀល)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        name="price"
                                        placeholder="តម្លៃ (ឧ. ១០០០០៛)"
                                        value={displayPrice}
                                        onChange={handleChange}
                                        onKeyDown={handlePriceKeyDown}
                                        className="w-full rounded-xl border border-green-700 px-4 py-3 font-khmer text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        ឯកតា
                                    </label>
                                    <input
                                        name="unit"
                                        placeholder="ឯកតា (ឧ. គ.ក្រ)"
                                        value={formData.unit || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-green-700 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        ស្ថានភាពស្តុក
                                    </label>
                                    <select
                                        name="stock"
                                        value={formData.stock || 'available'}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-green-700 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
                                    >
                                        <option value="available">
                                            មានទំនិញ
                                        </option>
                                        <option value="out_of_stock">
                                            អស់ទំនិញ
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        ប្រភេទផលិតផល
                                    </label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id ?? ''}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-green-700 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
                                    >
                                        <option value="">ជ្រើសរើសប្រភេទ</option>
                                        {categories.map((c) => (
                                            <option
                                                key={c.category_id}
                                                value={c.category_id}
                                            >
                                                {c.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 md:col-span-2">
                                    <label className="text-lg font-medium text-gray-700">
                                        ស្ថានភាពផលិតផល៖
                                    </label>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active ?? true}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-emerald-600"
                                    />
                                    <span
                                        className={`text-lg font-medium ${formData.is_active ? 'text-emerald-600' : 'text-red-600'}`}
                                    >
                                        {formData.is_active
                                            ? 'ដាក់លក់'
                                            : 'មិនទាន់ដាក់លក់'}
                                    </span>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        រូបភាពផលិតផល
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImagesChange}
                                        className="w-full rounded-xl border border-green-700 bg-green-50 px-4 py-4 text-base"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3 md:col-span-2">
                                    {formData.existingImages?.map((img, i) => (
                                        <div
                                            key={`exist-${i}`}
                                            className="group relative"
                                        >
                                            <img
                                                src={img.image_url}
                                                alt="existing"
                                                className="h-20 w-20 rounded-xl border object-cover"
                                            />
                                            <button
                                                onClick={() =>
                                                    removeImage(i, false)
                                                }
                                                className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-600 text-lg leading-none text-white shadow hover:bg-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {formData.newImagePreviews?.map(
                                        (previewUrl, i) => (
                                            <div
                                                key={`new-${i}`}
                                                className="group relative"
                                            >
                                                <img
                                                    src={previewUrl}
                                                    alt="new"
                                                    className="h-20 w-20 rounded-xl border object-cover"
                                                />
                                                <button
                                                    onClick={() =>
                                                        removeImage(i, true)
                                                    }
                                                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-600 text-lg leading-none text-white shadow hover:bg-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-lg font-medium text-gray-700">
                                        ការពិពណ៌នា
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="ពិពណ៌នាអំពីផលិតផល..."
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        className="min-h-[80px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                                        rows={3}
                                    />
                                </div>

                                <div className="mt-4 md:col-span-2">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
                                        disabled={loading}
                                    >
                                        {formData.product_id
                                            ? 'កែប្រែផលិតផល'
                                            : 'បន្ថែមផលិតផល'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product List */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <h2 className="mb-5 text-xl font-semibold text-gray-800">
                            បញ្ជីផលិតផល (សរុបចំនួន: {products.length})
                        </h2>

                        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <select
                                value={searchBy}
                                onChange={(e) =>
                                    setSearchBy(e.target.value as any)
                                }
                                className="rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-emerald-500"
                            >
                                <option value="seller_product_id">
                                    លេខសម្គាល់
                                </option>
                                <option value="name">ឈ្មោះ</option>
                                <option value="category">ប្រភេទ</option>
                                <option value="price">តម្លៃ</option>
                            </select>
                            <input
                                type={
                                    searchBy === 'price' ||
                                    searchBy === 'seller_product_id'
                                        ? 'number'
                                        : 'text'
                                }
                                placeholder="ស្វែងរក..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-emerald-500 focus:ring-1"
                            />
                        </div>

                        {loading ? (
                            <p className="py-12 text-center text-sm text-gray-500">
                                កំពុងផ្ទុក...
                            </p>
                        ) : filteredProducts.length === 0 ? (
                            <p className="py-12 text-center text-sm text-gray-500">
                                {searchTerm
                                    ? 'រកមិនឃើញផលិតផល'
                                    : 'មិនទាន់មានផលិតផល'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-lg">
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">
                                                ល.រ
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                ឈ្មោះ
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                តម្លៃ
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                ឯកតា
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                ប្រភេទ
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                រូបភាព
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                ស្ថានភាព
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                សកម្មភាព
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredProducts.map((p) => (
                                            <tr
                                                key={p.product_id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    {p.seller_product_id}
                                                </td>
                                                <td className="px-4 py-4 font-medium">
                                                    {p.productname}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-emerald-600">
                                                    {toKhmerPrice(p.price)} ៛
                                                </td>
                                                <td className="px-4 py-4">
                                                    {p.unit}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {getCategoryName(
                                                        p.category_id,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div
                                                        className="flex cursor-pointer items-center gap-2"
                                                        onClick={() =>
                                                            p.images?.length &&
                                                            openImageModal(p)
                                                        }
                                                    >
                                                        {p.images &&
                                                        p.images.length > 0 ? (
                                                            <>
                                                                <img
                                                                    src={
                                                                        p
                                                                            .images[0]
                                                                            .image_url
                                                                    }
                                                                    alt=""
                                                                    className="h-12 w-12 rounded-lg border object-cover"
                                                                />
                                                                {p.images
                                                                    .length >
                                                                    1 && (
                                                                    <span className="text-xs font-medium text-gray-500">
                                                                        +
                                                                        {p
                                                                            .images
                                                                            .length -
                                                                            1}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                គ្មាន
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() =>
                                                            toggleActive(
                                                                p.product_id,
                                                                p.is_active,
                                                            )
                                                        }
                                                        className={`cursor-pointer rounded-xl px-4 py-1 text-sm font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        {p.is_active
                                                            ? 'ដាក់លក់'
                                                            : 'មិនដាក់លក់'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(p)
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            កែប្រែ
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    p.product_id,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            លុប
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Modal */}
                {showImageModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div
                            className="relative w-full max-w-4xl rounded-2xl bg-white p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {selectedImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="overflow-hidden rounded-xl"
                                    >
                                        <img
                                            src={img.image_url}
                                            alt=""
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ProductPage;

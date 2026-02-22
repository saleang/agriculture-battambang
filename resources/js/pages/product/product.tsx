import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
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
    views_count: number;
    created_at: string;
    updated_at: string;
    images?: { image_url: string; is_primary: boolean }[];
}

interface Category {
    category_id: number;
    categoryname: string;
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

    // ──────────────────────────────────────────────
    // Utility & Helper Functions
    // ──────────────────────────────────────────────

    const getCategoryName = (id?: number) =>
        categories.find((c) => c.category_id === id)?.categoryname ?? 'មិនមាន';

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
        // Always display as whole number (floor to remove any decimal part)
        const whole = Math.floor(price);
        // Format with thousand separators (using en-US locale), then convert digits to Khmer
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
        ) {
            return;
        }

        if (/[0-9]/.test(char)) return;
        if (/[០-៩]/.test(char)) return;

        e.preventDefault();
    };

    // ──────────────────────────────────────────────
    // Data Fetching
    // ──────────────────────────────────────────────

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/seller/product');
            const list = Array.isArray(res.data)
                ? res.data
                : res.data?.data || [];
            setProducts(list);
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
            const res = await axios.get('/seller/category');
            const data = res.data?.data || res.data || [];
            setCategories(
                Array.isArray(data) ? data.filter((c) => c.is_active) : [],
            );
        } catch (err) {
            console.error('កំហុសក្នុងការទាញយកប្រភេទ៖', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Sync displayPrice when formData.price changes (edit/load)
    useEffect(() => {
        if (formData.price != null && !Number.isNaN(formData.price)) {
            setDisplayPrice(westernToKhmer(formData.price));
        } else {
            setDisplayPrice('');
        }
    }, [formData.price]);

    // ──────────────────────────────────────────────
    // Form Handlers
    // ──────────────────────────────────────────────

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
            if (value !== displayPrice) {
                setDisplayPrice(value);
            }
            const normalized = khmerToWestern(value);
            newValue = normalized ? Number(normalized) : undefined;
        } else if (['category_id'].includes(name)) {
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
                    html: `
            ${skippedCount} រូបភាពស្ទួន៖<br>
            <ul>${skippedReasons.map((r) => `<li>${r}</li>`).join('')}</ul>
          `,
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

    // ──────────────────────────────────────────────
    // Action Handlers
    // ──────────────────────────────────────────────

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

        // Prevent duplicate product name when creating new product
        if (!isUpdate) {
            const normalizedNewName = normalizeName(formData.productname);
            const isDuplicate = products.some(
                (p) => normalizeName(p.productname) === normalizedNewName,
            );

            if (isDuplicate) {
                Swal.fire({
                    title: 'ផលិតផលស្ទួន',
                    html: `ឈ្មោះផលិតផល <b>"${formData.productname}"</b> មានរួចហើយក្នុងបញ្ជីរបស់អ្នក។<br>
                 សូមប្រើឈ្មោះផ្សេង ឬកែសម្រួលផលិតផលដែលមានស្រាប់។`,
                    icon: 'warning',
                    confirmButtonText: 'យល់ព្រម',
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

        if (dedupedFiles.length < imagesToSend.length) {
            Swal.fire({
                title: 'បានសម្អាតស្ទួន',
                text: `បានលុប ${imagesToSend.length - dedupedFiles.length} ឯកសារស្ទួន`,
                icon: 'info',
                timer: 2200,
            });
        }

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

        if (isUpdate) {
            fd.append('_method', 'PUT');
        }

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
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.join?.(', ') ||
                'ប្រតិបត្តិការបរាជ័យ';
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
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/seller/product/${id}`);
                    Swal.fire({
                        title: 'បានលុប!',
                        text: 'ផលិតផលត្រូវបានលុបរួចរាល់។',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
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

    // ──────────────────────────────────────────────
    // Computed Values
    // ──────────────────────────────────────────────

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

    // ──────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────

    return (
        <AppLayout>
            <div
                className="min-h-screen bg-gray-50 p-6 font-khmer"
                style={{
                    fontFamily: "'Khmer OS Battambang', 'Khmer', sans-serif",
                }}
            >
                <h1 className="mb-6 text-center text-3xl font-bold md:text-left">
                    ការគ្រប់គ្រងផលិតផល
                </h1>

                {/* Form Section */}
                <div className="mb-2 rounded-xl border bg-white p-6 shadow-lg">
                    <h2 className="mb-2 text-2xl font-semibold">
                        {formData.product_id
                            ? 'កែសម្រួលផលិតផល'
                            : 'បន្ថែមផលិតផលថ្មី'}
                    </h2>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">
                                ឈ្មោះផលិតផល *
                            </label>
                            <input
                                name="productname"
                                placeholder="ឈ្មោះផលិតផល"
                                value={formData.productname || ''}
                                onChange={handleChange}
                                className="w-full rounded border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                តម្លៃ (រៀល) *
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="price"
                                placeholder="តម្លៃ (ឧ. ១០០០០ ឬ 10000)"
                                value={displayPrice}
                                onChange={handleChange}
                                onKeyDown={handlePriceKeyDown}
                                className="w-full rounded border p-3 font-khmer focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                ឯកតា
                            </label>
                            <input
                                name="unit"
                                placeholder="ឯកតា (ឧ. គ.ក្រ, ដប, កញ្ចប់)"
                                value={formData.unit || ''}
                                onChange={handleChange}
                                className="w-full rounded border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                ស្ថានភាពស្តុក
                            </label>
                            <select
                                name="stock"
                                value={formData.stock || 'available'}
                                onChange={handleChange}
                                className="w-full rounded border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option value="available">មានទំនិញ</option>
                                <option value="out_of_stock">អស់ទំនិញ</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                ប្រភេទផលិតផល *
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id ?? ''}
                                onChange={handleChange}
                                className="w-full rounded border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option value="">ជ្រើសរើសប្រភេទ</option>
                                {categories.map((c) => (
                                    <option
                                        key={c.category_id}
                                        value={c.category_id}
                                    >
                                        {c.categoryname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4 md:col-span-2">
                            <label className="font-medium">
                                ស្ថានភាពផលិតផល៖
                            </label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active ?? true}
                                onChange={handleChange}
                                className="h-5 w-5 text-green-600"
                            />
                            <span
                                className={
                                    formData.is_active
                                        ? 'font-medium text-green-600'
                                        : 'font-medium text-red-600'
                                }
                            >
                                {formData.is_active
                                    ? 'ដាក់លក់'
                                    : 'មិនទាន់ដាក់លក់'}
                            </span>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block font-medium">
                                រូបភាពផលិតផល
                            </label>
                            <p className="mb-2 text-sm text-gray-600">
                                អាចបញ្ជូលរូបភាពច្រើនបាន។
                                មិនអាចបញ្ជូលរូបភាពស្ទួន។
                            </p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagesChange}
                                className="w-full rounded border p-3 file:mr-4 file:rounded file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 md:col-span-2">
                            {formData.existingImages?.map((img, i) => (
                                <div
                                    key={`exist-${i}`}
                                    className="group relative"
                                >
                                    <img
                                        src={img.image_url}
                                        alt="រូបចាស់"
                                        className="h-24 w-24 rounded-lg border object-cover shadow-sm transition group-hover:scale-105"
                                    />
                                    <button
                                        onClick={() => removeImage(i, false)}
                                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white shadow-md"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {formData.newImagePreviews?.map((previewUrl, i) => (
                                <div
                                    key={`new-${i}`}
                                    className="group relative"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="រូបថ្មី"
                                        className="h-24 w-24 rounded-lg border object-cover shadow-sm transition group-hover:scale-105"
                                    />
                                    <button
                                        onClick={() => removeImage(i, true)}
                                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white shadow-md"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block font-medium">
                                ការពិពណ៌នា
                            </label>
                            <textarea
                                name="description"
                                placeholder="ពិពណ៌នាអំពីផលិតផលរបស់អ្នក ..."
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="min-h-[100px] w-full rounded border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                rows={4}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="mt-8 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                        >
                            {formData.product_id
                                ? 'កែប្រែផលិតផល'
                                : 'បន្ថែមផលិតផល'}
                        </button>
                    </div>
                </div>

                {/* Product List */}
                <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-lg">
                    <h2 className="text-1xl mb-6 font-semibold">
                        បញ្ជីឈ្មោះផលិតផល សរុប: {products.length} ផលិតផល
                    </h2>

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <select
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value as any)}
                            className="min-w-[180px] rounded-lg border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                            <option value="seller_product_id">
                                លេខសម្គាល់ផលិតផល
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
                            placeholder={`ស្វែងរកតាម ${searchBy === 'name' ? 'ឈ្មោះ' : searchBy === 'category' ? 'ប្រភេទ' : searchBy === 'price' ? 'តម្លៃ' : 'លេខសម្គាល់'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 rounded-lg border p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>

                    {loading ? (
                        <p className="animate-pulse py-12 text-center text-lg text-gray-500">
                            កំពុងផ្ទុកទិន្នន័យ...
                        </p>
                    ) : filteredProducts.length === 0 ? (
                        <p className="py-12 text-center text-lg text-gray-500">
                            {searchTerm
                                ? 'រកមិនឃើញផលិតផលផ្គូផ្គង'
                                : 'មិនទាន់មានផលិតផល'}
                        </p>
                    ) : (
                        <table className="w-full min-w-[1000px] text-base">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">ល.រ</th>
                                    <th className="px-6 py-4 text-left">
                                        ឈ្មោះ
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        តម្លៃ
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        ឯកតា
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        ប្រភេទ
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        ពិពណ៌នា
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        រូបភាព
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        ចំនួនអ្នកមើល
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        ស្ថានភាព
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        សកម្មភាព
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr
                                        key={p.product_id}
                                        className="border-b transition hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            {p.seller_product_id}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {p.productname}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {toKhmerPrice(p.price)} រៀល
                                        </td>
                                        <td className="px-6 py-4">{p.unit}</td>
                                        <td className="px-6 py-4">
                                            {getCategoryName(p.category_id)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className={`flex flex-wrap gap-2 ${p.images?.length ? 'cursor-pointer hover:opacity-90' : 'text-gray-400'}`}
                                                onClick={() =>
                                                    openImageModal(p)
                                                }
                                            >
                                                {p.images
                                                    ?.slice(0, 3)
                                                    .map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img.image_url}
                                                            alt={`${p.productname} - ${idx + 1}`}
                                                            className="h-14 w-14 rounded-lg border object-cover shadow-sm transition hover:scale-105"
                                                        />
                                                    ))}
                                                {p.images &&
                                                    p.images.length > 3 && (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-gray-100 text-sm font-medium">
                                                            +
                                                            {p.images.length -
                                                                3}
                                                        </div>
                                                    )}
                                                {(!p.images ||
                                                    p.images.length === 0) && (
                                                    <span className="text-gray-400 italic">
                                                        គ្មានរូបភាព
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <th className="px-6 py-4">
                                            {p.views_count}
                                        </th>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    toggleActive(
                                                        p.product_id,
                                                        p.is_active,
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-1.5 text-sm font-medium ${
                                                    p.is_active
                                                        ? 'border-green-300 bg-green-100 text-green-700'
                                                        : 'border-red-300 bg-red-100 text-red-700'
                                                } transition hover:opacity-90`}
                                            >
                                                {p.is_active
                                                    ? 'សកម្ម'
                                                    : 'អសកម្ម'}
                                            </button>
                                        </td>
                                        <td className="space-x-4 px-6 py-4">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                កែប្រែ
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(p.product_id)
                                                }
                                                className="font-medium text-red-600 hover:text-red-800"
                                            >
                                                លុប
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Image Modal */}
                {showImageModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div
                            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5 shadow-sm">
                                <h3 className="text-2xl font-bold">
                                    {selectedProductName} — រូបភាព (
                                    {selectedImages.length})
                                </h3>
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="text-4xl text-gray-500 hover:text-gray-800"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {selectedImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="relative w-full overflow-hidden rounded-xl border shadow-md">
                                            <img
                                                src={img.image_url}
                                                alt={`រូបភាពទី ${idx + 1}`}
                                                className="h-auto max-h-[60vh] w-full object-contain"
                                            />
                                            {img.is_primary && (
                                                <span className="absolute top-3 left-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white shadow">
                                                    រូបភាពគោល
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm text-gray-600">
                                            រូបទី {idx + 1}{' '}
                                            {img.is_primary ? 'គោល' : ''}
                                        </p>
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

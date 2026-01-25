import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';

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
    existingImages: [],
    deletedImages: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'seller_product_id' | 'name' | 'category' | 'price'>('name');

  const getCategoryName = (id?: number) =>
    categories.find((c) => c.category_id === id)?.categoryname ?? 'N/A';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/seller/product');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProducts(list);
    } catch (err) {
      console.error('Fetch products error:', err);
      Swal.fire('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/seller/category');
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data.filter((c) => c.is_active) : []);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const resetForm = () => {
    formData.newImages?.forEach((file) => {
      URL.revokeObjectURL(URL.createObjectURL(file));
    });

    setFormData({
      stock: 'available',
      is_active: true,
      productname: '',
      price: undefined,
      category_id: undefined,
      unit: 'kg',
      description: '',
      newImages: [],
      existingImages: [],
      deletedImages: [],
      product_id: undefined,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let newValue: string | number | boolean | undefined;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (['price', 'category_id'].includes(name)) {
      newValue = value === '' ? undefined : Number(value);
    } else {
      newValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files) as File[];

    setFormData((prev) => {
      const current = prev.newImages ?? [];

      // Strong deduplication: filename (lowercase) + exact size
      const seen = new Set<string>();
      current.forEach((f) => {
        seen.add(`${f.name.toLowerCase().trim()}|${f.size}`);
      });

      const uniqueNewFiles: File[] = [];
      newFiles.forEach((file) => {
        const key = `${file.name.toLowerCase().trim()}|${file.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueNewFiles.push(file);
        }
      });

      if (uniqueNewFiles.length < newFiles.length && newFiles.length > 0) {
        Swal.fire({
          title: 'រូបភាពស្ទួនគ្នា',
          text: `សូមបញ្ចូលរូបភាពផ្សេង!​អរគុណ`,
          icon: 'info',
        });
      }

      return {
        ...prev,
        newImages: [...current, ...uniqueNewFiles],
      };
    });

    e.target.value = '';
  };

  const removeImage = (index: number, isNew: boolean) => {
    setFormData((prev) => {
      const newState = { ...prev };

      if (isNew) {
        const fileToRemove = prev.newImages?.[index];
        if (fileToRemove) {
          URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
        }
        newState.newImages = prev.newImages?.filter((_, i) => i !== index) || [];
      } else {
        const removed = prev.existingImages?.[index];
        if (removed) {
          newState.existingImages = prev.existingImages?.filter((_, i) => i !== index) || [];
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
      (key) => formData[key] == null || formData[key] === ''
    );
    if (missing.length > 0) {
      Swal.fire('Error', `Missing: ${missing.join(', ')}`, 'error');
      return;
    }

    // Final defensive deduplication before upload
    let imagesToSend = formData.newImages ?? [];

    if (imagesToSend.length > 0) {
      const seen = new Set<string>();
      const originalCount = imagesToSend.length;

      imagesToSend = imagesToSend.filter((file) => {
        const key = `${file.name.toLowerCase().trim()}|${file.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (imagesToSend.length < originalCount) {
        setFormData((prev) => ({ ...prev, newImages: imagesToSend }));
        Swal.fire({
          title: 'Cleaned before upload',
          text: `Removed ${originalCount - imagesToSend.length} duplicate image(s)`,
          icon: 'info',
          timer: 1800,
        });
      }
    }

    // Debug: log what is actually being sent (remove after testing)
    console.log('=== FILES SENT TO SERVER ===', {
      mode: isUpdate ? 'UPDATE' : 'ADD',
      count: imagesToSend.length,
      files: imagesToSend.map(f => ({
        name: f.name,
        size: f.size,
        lastModified: new Date(f.lastModified).toISOString()
      }))
    });

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
        fd.append(key, typeof val === 'boolean' ? (val ? '1' : '0') : String(val));
      }
    });

    if (isUpdate) {
      fd.append('_method', 'PUT');
    }

    if (isUpdate && formData.deletedImages?.length) {
      formData.deletedImages.forEach((url) => fd.append('delete_images[]', url));
    }

    imagesToSend.forEach((file) => fd.append('images[]', file));

    try {
      const url = isUpdate ? `/seller/product/${formData.product_id}` : '/seller/product';
      await axios.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        title: 'Success',
        text: isUpdate ? 'Product updated' : 'Product added',
        icon: 'success',
        timer: 1800,
      });

      resetForm();
      fetchProducts();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join?.(', ') ||
        'Operation failed';
      Swal.fire('Error', msg, 'error');
    }
  };

  const toggleActive = async (product_id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/seller/product/${product_id}/toggle-active`);
      setProducts((prev) =>
        prev.map((p) => (p.product_id === product_id ? { ...p, is_active: !currentStatus } : p))
      );
    } catch {
      Swal.fire('Error', 'Status update failed', 'error');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/seller/product/${id}`);
          Swal.fire('Deleted!', 'Product deleted.', 'success');
          fetchProducts();
        } catch {
          Swal.fire('Error!', 'Failed to delete', 'error');
        }
      }
    });
  };

  const handleEdit = (p: Product) => {
    formData.newImages?.forEach((f) => URL.revokeObjectURL(URL.createObjectURL(f)));

    setFormData({
      ...p,
      unit: p.unit || 'kg',
      stock: p.stock || 'available',
      description: p.description || '',
      is_active: p.is_active ?? true,
      existingImages: p.images ?? [],
      newImages: [],
      deletedImages: [],
    });
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
        return getCategoryName(p.category_id).toLowerCase().includes(term);
      case 'price':
        return String(p.price).includes(term);
      default:
        return true;
    }
  });

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Product Management</h1>

        <div className="mb-6 p-5 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold mb-4">
            {formData.product_id ? 'Edit Product' : 'Add Product'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="productname"
              placeholder="Product Name *"
              value={formData.productname || ''}
              onChange={handleChange}
              className="border p-3 rounded"
            />
            <input
              type="number"
              name="price"
              placeholder="Price *"
              value={formData.price ?? ''}
              onChange={handleChange}
              className="border p-3 rounded"
            />
            <input
              name="unit"
              placeholder="Unit (e.g. kg)"
              value={formData.unit || ''}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <select
              name="stock"
              value={formData.stock || 'available'}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              name="category_id"
              value={formData.category_id ?? ''}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="">Select Category *</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.categoryname}
                </option>
              ))}
            </select>

            <div className="col-span-2 flex items-center gap-4">
              <span className="font-medium">Status:</span>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active ?? true}
                onChange={handleChange}
                className="h-5 w-5"
              />
              <span className={formData.is_active ? 'text-green-600' : 'text-red-600'}>
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-medium">Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="col-span-2 flex flex-wrap gap-3">
              {formData.existingImages?.map((img, i) => (
                <div key={`exist-${i}`} className="relative">
                  <img
                    src={img.image_url}
                    alt="existing"
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(i, false)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}

              {formData.newImages?.map((file, i) => (
                <div key={`new-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="new preview"
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(i, true)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description || ''}
            onChange={handleChange}
            className="border p-3 rounded w-full mt-4"
            rows={3}
          />

          <button
            onClick={handleSubmit}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {formData.product_id ? 'Update Product' : 'Add Product'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Product List ({products.length})</h2>

          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as any)}
              className="border p-2 rounded"
            >
              <option value="seller_product_id">Seller ID</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="price">Price</option>
            </select>
            <input
              type={searchBy === 'price' || searchBy === 'seller_product_id' ? 'number' : 'text'}
              placeholder={`Search by ${searchBy}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded flex-1 min-w-[200px]"
            />
          </div>

          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-10 text-gray-500">
              {searchTerm ? 'No matching products' : 'No products yet'}
            </p>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Images</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.product_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{p.seller_product_id}</td>
                    <td className="px-4 py-3">{p.productname}</td>
                    <td className="px-4 py-3">${p.price}</td>
                    <td className="px-4 py-3">{p.unit}</td>
                    <td className="px-4 py-3">{getCategoryName(p.category_id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.images?.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.image_url}
                            alt={`${p.productname} - ${idx + 1}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ))}
                        {p.images && p.images.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                            +{p.images.length - 3}
                          </div>
                        )}
                        {(!p.images || p.images.length === 0) && (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p.product_id, p.is_active)}
                        className={`px-3 py-1 rounded text-xs ${
                          p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductPage;
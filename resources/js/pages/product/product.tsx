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
  quantity_available: number;
  category_id: number;
  harvest_date?: string;
  expiry_date?: string;
  is_active: boolean;
  stock: 'available' | 'out_of_stock' | 'discontinued';
  views_count: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  images?: { image_url: string; is_primary: boolean }[];
}

interface Category {
  category_id: number;
  categoryname: string;
  is_active?: boolean;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Product> & { [key: string]: any }>({
    stock: 'available',
    is_active: true,
  });

  /** Helpers **/
  const getCategoryName = (id?: number) =>
    categories.find(c => c.category_id === id)?.categoryname ?? 'N/A';

  const formatDate = (d?: string | null) => (d ? d.split('T')[0] : 'N/A');
  const formatDateForInput = (d?: string | null) => (d ? d.split('T')[0] : '');

  /** Fetch Products **/
const fetchProducts = async () => {
  try {
    setLoading(true);
    const res = await axios.get('/seller/product');
    const data = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.data)
        ? res.data.data
        : [];

    setProducts(data);
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Failed to fetch products', 'error');
  } finally {
    setLoading(false);
  }
};
  /** Fetch Categories **/
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/seller/category');
      const data = res.data?.data || res.data;
      const activeCategories = Array.isArray(data) ? data.filter(c => c.is_active) : [];
      setCategories(activeCategories);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', 'Failed to fetch categories', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /** Form Handlers **/
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, type, value, checked } = e.target;
    if (type === 'file') return;

    let finalValue: any = type === 'checkbox' ? checked : value;
    if (['price', 'quantity_available', 'category_id', 'discount_percentage'].includes(name)) {
      finalValue = Number(finalValue);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(files), // safe now because files is not null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: [],
      }));
    }
  };
  /** Add Product **/
  const handleAddProduct = async () => {
    const required = ['productname', 'price', 'quantity_available', 'category_id'];
    const missing = required.filter(key => formData[key] === undefined || formData[key] === null || formData[key] === '');
    if (missing.length > 0) {
      return Swal.fire('Error', `Please fill all required fields: ${missing.join(', ')}`, 'error');
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'images') continue;
        let value = formData[key];
        if (typeof value === 'boolean') value = value ? '1' : '0';
        else if (typeof value === 'number') value = value.toString();
        else if (value === undefined || value === null) value = '';
        data.append(key, value);
      }

      if (Array.isArray(formData.images)) {
        formData.images.forEach(img => {
          if (img instanceof File) data.append('images[]', img);
        });
      }

      await axios.post('/seller/product', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      Swal.fire('Added!', 'Product has been added.', 'success');
    setFormData({
      stock: 'available',
      is_active: true,
    });
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error!', error.response?.data?.message || 'Something went wrong.', 'error');
    }
  };

  /** Update Product **/
  const handleUpdateProduct = async () => {
    if (!formData.product_id) return;

    const data = new FormData();
    for (const key in formData) {
      const value = formData[key];
      if (value === undefined || value === null) continue;
      if (key === 'images') continue;

      let finalValue: any = value;
      if (typeof value === 'boolean') finalValue = value ? '1' : '0';
      else if (typeof value === 'number') finalValue = value.toString();
      else if (typeof value === 'string') finalValue = value;

      data.append(key, finalValue);
    }

    data.append('_method', 'PUT');

    if (Array.isArray(formData.images) && formData.images.length > 0) {
      formData.images.forEach(img => {
        if (img instanceof File) data.append('images[]', img);
      });
    }

    try {
      await axios.post(`/seller/product/${formData.product_id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire('Updated!', 'Product has been updated.', 'success');
      setFormData({});
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error!', error.response?.data?.message || 'Something went wrong.', 'error');
    }
  };

  // Toggle Active Status
  const toggleActive = async (product_id: number, currentStatus: boolean) => {
    try {
      // Use product_id to fill the {id} in route
      await axios.patch(`/seller/product/${product_id}/toggle-active`);

      // Update frontend state immediately
      setProducts(prev =>
        prev.map(p =>
          p.product_id === product_id
            ? { ...p, is_active: !currentStatus }
            : p
        )
      );

    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Failed to update status.', 'error');
    }
  };

  /** Delete Product **/
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/seller/product/${id}`);
          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          fetchProducts();
        } catch (error) {
          console.error(error);
          Swal.fire('Error!', 'Failed to delete product', 'error');
        }
      }
    });
  };

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Product Management</h1>
        {/* Form */}
        <div className="mb-5 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3">{formData.product_id ? 'Edit Product' : 'Add Product'}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input type="text" name="productname" placeholder="Product Name" value={formData.productname || ''} onChange={handleChange} className="border p-2 rounded w-full" />
            <input type="number" name="price" placeholder="Price" value={formData.price || ''} onChange={handleChange} className="border p-2 rounded w-full" />
            <input type="number" name="quantity_available" placeholder="Quantity Available" value={formData.quantity_available || ''} onChange={handleChange} className="border p-2 rounded w-full" />
            <input type="text" name="unit" placeholder="Unit" value={formData.unit || ''} onChange={handleChange} className="border p-2 rounded w-full" />
            <select
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              >
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
            <input type="date" name="harvest_date" value={formData.harvest_date || ''} onChange={handleChange} className="border p-2 rounded w-full" />
            <input type="date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} className="border p-2 rounded w-full" />

            <select name="category_id" value={formData.category_id || ''} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.categoryname}</option>)}
            </select>

            <input type="number" step="0.01" name="discount_percentage" placeholder="Discount %" value={formData.discount_percentage || 0} onChange={handleChange} className="border p-2 rounded w-full" />

            {/* Active checkbox */}
            <div className="flex items-center gap-4 col-span-2 mt-2">
              <span className="font-medium text-gray-700">Status:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active ?? true}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span className={formData.is_active ? 'text-green-600' : 'text-red-600'}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
            <label className="flex flex-col col-span-2">
              Product Images
              <input type="file" name="images[]" accept="image/*" multiple onChange={handleImagesChange} className="border p-2 rounded w-full mt-1" />
            </label>

            <div className="flex gap-2 flex-wrap mt-2 col-span-2">
              {formData.images?.map((img: File | { image_url: string }, index: number) => (
                img instanceof File
                  ? <img key={index} src={URL.createObjectURL(img)} alt={`preview-${index}`} className="w-20 h-20 object-cover rounded border" />
                  : <img key={index} src={img.image_url} alt={`existing-${index}`} className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
          </div>
          <textarea name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} className="border p-2 rounded w-full mt-3" />
          <button onClick={formData.product_id ? handleUpdateProduct : handleAddProduct} className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {formData.product_id ? 'Update' : 'Add'}
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-700">Product List</h2>
                    <div className="text-sm text-gray-500">
                        Total: {products.length} products
                    </div>
                </div>
          {loading ? <p>Loading products...</p> : (
            <table className="w-full table-auto min-w-[900px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Qty</th>  
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>  
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Discount %</th> 
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Images</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Harvest</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Expiry</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Views</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id}>
                    <td className="border px-2 py-1">{p.seller_product_id}</td>
                    <td className="border px-2 py-1">{p.productname}</td>
                    <td className="border px-2 py-1">{p.price}</td>
                    <td className="border px-2 py-1">{p.quantity_available}</td>
                    <td className="border px-2 py-1">{p.unit}</td>
                    <td className="border px-2 py-1">{p.stock}</td>
                    <td className="border px-2 py-1">{getCategoryName(p.category_id)}</td>
                    <td className="border px-2 py-1">{p.discount_percentage}%</td>
                    <td className="border px-2 py-1">{p.description || 'N/A'}</td>
                    <td className="border px-2 py-1 flex gap-1 flex-wrap">{p.images?.map((img, i) => (
                      <img key={i} src={img.image_url} alt={`img-${i}`} className="w-16 h-16 object-cover rounded border" />
                    ))}</td>
                    <td className="border px-2 py-1">{formatDate(p.harvest_date)}</td>
                    <td className="border px-2 py-1">{formatDate(p.expiry_date)}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => toggleActive(p.product_id, p.is_active)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                          p.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="border px-2 py-1">{p.views_count}</td>
                    <td className="border px-2 py-1 space-x-2">
                      <button
                        onClick={() => setFormData({
                          ...p,
                          harvest_date: formatDateForInput(p.harvest_date),
                          expiry_date: formatDateForInput(p.expiry_date),
                        })}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition duration-200"
                      >Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition duration-200">Delete</button>
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

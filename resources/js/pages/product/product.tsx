import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';

interface Product {
  product_id: number;
  productname: string;
  description?: string;
  price: number;
  unit: string;
  quantity_available: number;
  category_id: number;
  harvest_date?: string;
  expiry_date?: string;
  is_organic: boolean;
  is_featured: boolean;
  status: 'available' | 'out_of_stock' | 'discontinued';
  views_count: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  images?: { image_url: string; is_primary: boolean }[];
}

interface Category {
  category_id: number;
  categoryname: string;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Product> & { [key: string]: any }>({});

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/seller/product');
      setProducts(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Swal.fire('Error', 'Failed to fetch products', 'error');
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/seller/category');
      const data = res.data?.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', 'Failed to fetch categories', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    let value: string | boolean | number =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    const name = target.name;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: filesArray,
      }));
    }
  };

  // Add or update product
  const handleSubmit = async () => {
    const required = ['productname', 'price', 'quantity_available', 'category_id'];
    const missing = required.filter(key => !formData[key]);
    if (missing.length > 0) {
      return Swal.fire('Error', `Please fill all required fields: ${missing.join(', ')}`, 'error');
    }

    try {
      const data = new FormData();

      // Append normal fields except images
      for (const key in formData) {
        if (key !== 'images' && formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }

    // Append new image files only
    if (formData.images) {
      // Append new image files
      formData.images.forEach(img => {
        if (img instanceof File) {
          data.append('images[]', img); 
        } else {
          // Existing image URLs as strings
          data.append('existing_images[]', img.image_url);
        }
      });
    }

      if (formData.product_id) {
        await axios.put(`/seller/product/${formData.product_id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Swal.fire('Updated!', 'Product has been updated.', 'success');
      } else {
        await axios.post('/seller/product', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Swal.fire('Added!', 'Product has been added.', 'success');
      }

      setFormData({});
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error!', error.response?.data?.message || 'Something went wrong.', 'error');
    }
  };

  // Delete product
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
          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          fetchProducts();
        } catch (error) {
          console.error(error);
          Swal.fire('Error!', 'Failed to delete product', 'error');
        }
      }
    });
  };

  const getCategoryName = (id?: number) =>
    categories.find(c => c.category_id === id)?.categoryname ?? 'N/A';
  const formatDate = (d?: string | null) => (d ? d.split('T')[0] : 'N/A');

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Product Management</h1>

        {/* Product Form */}
        <div className="mb-5 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3">
            {formData.product_id ? 'Edit Product' : 'Add Product'}
          </h2>

          <div className="grid gap-2 md:grid-cols-2">
            <input
              type="text"
              name="productname"
              placeholder="Product Name"
              value={formData.productname || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              name="quantity_available"
              placeholder="Quantity Available"
              value={formData.quantity_available || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              name="unit"
              placeholder="Unit (e.g., kg, piece)"
              value={formData.unit || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <select
              name="status"
              value={formData.status || 'available'}
              onChange={handleChange}
              className="border p-2 rounded w-full">
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>

            <label>
              Harvest Date
              <input
                type="date"
                name="harvest_date"
                value={formData.harvest_date || ''}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </label>

            <label>
              Expiry Date
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date || ''}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </label>

            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>
                  {c.categoryname}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_organic"
                checked={formData.is_organic || false}
                onChange={handleChange}
              />
              <span>Is Organic</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured || false}
                onChange={handleChange}
              />
              <span>Is Featured</span>
            </label>

            <input
              type="number"
              step="0.01"
              name="discount_percentage"
              placeholder="Discount %"
              value={formData.discount_percentage || 0}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            {/* Multiple images input */}
            <label className="flex flex-col col-span-2">
              Product Images
              <input
                type="file"
                name="images[]"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="border p-2 rounded w-full mt-1"
              />
            </label>

            {/* Preview selected or existing images */}
            <div className="flex gap-2 flex-wrap mt-2 col-span-2">
              {formData.images?.map((img: File | { image_url: string; is_primary: boolean }, index: number) => {
                if (img instanceof File) {
                  return (
                    <img
                      key={index}
                      src={URL.createObjectURL(img)}
                      alt={`preview-${index}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  );
                } else {
                  return (
                    <img
                      key={index}
                      src={img.image_url}
                      alt={`existing-${index}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  );
                }
              })}
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description || ''}
            onChange={handleChange}
            className="border p-2 rounded w-full mt-3"
          />

          <button
            onClick={handleSubmit}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {formData.product_id ? 'Update' : 'Add'}
          </button>
        </div>

        {/* Product List */}
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <table className="w-full table-auto min-w-[900px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Price</th>
                  <th className="border px-2 py-1">Quantity</th>
                  <th className="border px-2 py-1">Unit</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Category</th>
                  <th className="border px-2 py-1">Organic</th>
                  <th className="border px-2 py-1">Featured</th>
                  <th className="border px-2 py-1">Images</th>
                  <th className="border px-2 py-1">Harvest Date</th>
                  <th className="border px-2 py-1">Expiry Date</th>
                  <th className="border px-2 py-1">Views</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id}>
                    <td className="border px-2 py-1">{p.product_id}</td>
                    <td className="border px-2 py-1">{p.productname}</td>
                    <td className="border px-2 py-1">{p.price}</td>
                    <td className="border px-2 py-1">{p.quantity_available}</td>
                    <td className="border px-2 py-1">{p.unit}</td>
                    <td className="border px-2 py-1">{p.status}</td>
                    <td className="border px-2 py-1">{getCategoryName(p.category_id)}</td>
                    <td className="border px-2 py-1">{p.is_organic ? 'Yes' : 'No'}</td>
                    <td className="border px-2 py-1">{p.is_featured ? 'Yes' : 'No'}</td>
                    <td className="border px-2 py-1">
                      <div className="flex gap-1 flex-wrap">
                        {p.images?.map((img, index) => (
                          <img
                            key={index}
                            src={img.image_url}
                            alt={`product-${p.product_id}-${index}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="border px-2 py-1">{formatDate(p.harvest_date)}</td>
                    <td className="border px-2 py-1">{formatDate(p.expiry_date)}</td>
                    <td className="border px-2 py-1">{p.views_count}</td>
                    <td className="border px-2 py-1 space-x-2">
                      <button
                        onClick={() =>
                          setFormData({
                            ...p,
                            harvest_date: formatDate(p.harvest_date),
                            expiry_date: formatDate(p.expiry_date),
                          })
                        }
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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

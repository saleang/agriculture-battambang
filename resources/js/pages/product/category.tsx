import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';

interface Category {
    category_id: number;
    seller_category_id: number;
    categoryname: string;
    description?: string;
    is_active: boolean;
}

const CategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        categoryname: '',
        description: '',
        is_active: true
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Predefined top-level grocery categories (common in Cambodia/SE Asia online supermarkets)
    const predefinedCategories = [
        'Fruits',
        'Vegetables',
        'Meat & Poultry',
        'Seafood',
        'Dairy & Eggs',
        'Bakery',
        'Beverages',
        'Snacks & Confectionery',
        'Frozen Foods',
        'Canned & Packaged Goods',
        'Rice, Noodles & Grains',
        'Oils, Sauces & Spices',
        'Household & Cleaning',
        'Personal Care & Beauty',
        'Baby & Kids',
        'Pet Supplies',
    ];

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/seller/category');
            setCategories(response.data.data || response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error!', 'Failed to fetch categories.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'is_active') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryname) {
            Swal.fire('Required!', 'Please select a category name.', 'warning');
            return;
        }

        setSubmitting(true);

        try {
            const apiData = {
                categoryname: formData.categoryname,
                description: formData.description,
                is_active: formData.is_active
            };

            if (editingId) {
                await axios.put(`/seller/category/${editingId}`, apiData);
                Swal.fire('Updated!', 'Category updated successfully.', 'success');
            } else {
                await axios.post('/seller/category', apiData);
                Swal.fire('Added!', 'Category created successfully.', 'success');
            }

            resetForm();
            fetchCategories();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('<br>');
                Swal.fire('Validation Error!', errorMessages, 'error');
            } else {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            categoryname: '',
            description: '',
            is_active: true
        });
        setEditingId(null);
    };

    const handleEdit = (category: Category) => {
        setFormData({
            categoryname: category.categoryname,
            description: category.description || '',
            is_active: category.is_active
        });
        setEditingId(category.category_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete the category and all its sub-categories!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/seller/category/${id}`);
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                fetchCategories();
            } catch (error: any) {
                console.error(error);
                if (error.response?.status === 409) {
                    Swal.fire('Cannot Delete!', error.response.data.message, 'error');
                } else {
                    Swal.fire('Error!', 'Failed to delete category.', 'error');
                }
            }
        }
    };

    const toggleActive = async (id: number, currentStatus: boolean) => {
        try {
            await axios.patch(`/seller/category/${id}/toggle-status`, {
                is_active: !currentStatus
            });
            Swal.fire('Updated!', 'Status updated successfully.', 'success');
            fetchCategories();
        } catch (error) {
            console.error(error);
            Swal.fire('Error!', 'Failed to update status.', 'error');
        }
    };

    const filteredCategories = categories.filter((category) => {
        const term = searchTerm.toLowerCase();
        const matchesId = category.seller_category_id.toString().includes(term);
        const matchesName = category.categoryname.toLowerCase().includes(term);
        return matchesId || matchesName;
    });

    return (
        <AppLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Category Management</h1>

                {/* Form Section */}
                <div className="bg-white rounded-lg shadow-md p-3 mb-2">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Category Name *
                            </label>
                            <select
                                name="categoryname"
                                value={formData.categoryname}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
                                required
                                disabled={submitting || loading}
                            >
                                <option value="" disabled>
                                    {editingId
                                        ? 'Keep current or select new category'
                                        : '-- Choose main category --'}
                                </option>

                                {predefinedCategories.map((catName) => (
                                    <option key={catName} value={catName}>
                                        {catName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Description
                            </label>
                            <textarea
                                name="description"
                                placeholder="Optional: Enter description..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                disabled={submitting}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                disabled={submitting}
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-600">
                                Active
                            </label>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2 rounded-lg font-medium ${
                                    submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition duration-200`}
                            >
                                {submitting ? 'Processing...' : editingId ? 'Update Category' : 'Add Category'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={submitting}
                                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Categories List Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-700">Category List</h2>
                        <div className="text-sm text-gray-500">
                            Total: {filteredCategories.length} categories
                        </div>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No categories found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.category_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{category.seller_category_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{category.categoryname}</div>
                                                {category.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleActive(category.category_id, category.is_active)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition duration-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.category_id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition duration-200"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default CategoryPage;
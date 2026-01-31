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
    const [localCategories, setLocalCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        categoryname: '',
        description: '',
        is_active: true
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const predefinedCategories = [
        'ប្រភេទផ្លែឈើ',
        'ប្រភេទបន្លែ',
        'ប្រភេទសាច់',
        'ប្រភេទទឹកដោះគោ និងស៊ុត',
        'ប្រភេទអាហារសម្រន់ និងផ្អែម',
        'ប្រភេទអាហារកក',
        'ប្រភេទអាហារកំប៉ុង និងខ្ចប់',
        'ប្រភេទស្រូវ មី និងគ្រាប់ធញ្ញជាតិ',
        'ប្រភេទប្រេង និងគ្រឿងទេស',
        'ប្រភេទគ្រឿងផ្គត់ផ្គង់សត្វចិញ្ចឹម',
    ];

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/seller/category');
            const data = response.data.data || response.data;
            setCategories(data);
            setLocalCategories(data);
        } catch (error) {
            console.error(error);
            Swal.fire('មានបញ្ហា!', 'មិនអាចទាញយកប្រភេទផលិតផលបានទេ។', 'error');
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

    const checkDuplicate = (name: string, excludeId?: number): boolean => {
        const lowerName = name.trim().toLowerCase();
        return categories.some(
            (cat) =>
                cat.categoryname.trim().toLowerCase() === lowerName &&
                cat.category_id !== excludeId
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryname.trim()) {
            Swal.fire('តម្រូវការ!', 'សូមជ្រើសរើសឈ្មោះប្រភេទផលិតផល។', 'warning');
            return;
        }

        if (checkDuplicate(formData.categoryname, editingId ?? undefined)) {
            Swal.fire(
                'ឈ្មោះប្រភេទស្ទួនគ្នា!',
                editingId
                    ? 'ឈ្មោះប្រភេទនេះមានរួចហើយ (សូមជ្រើសរើសឈ្មោះប្រភេទថ្មី)។'
                    : 'ឈ្មោះប្រភេទនេះមានរួចហើយ មិនអាចបន្ថែមស្ទួនបានទេ។',
                'warning'
            );
            return;
        }

        setSubmitting(true);

        try {
            const apiData = {
                categoryname: formData.categoryname.trim(),
                description: formData.description.trim() || undefined,
                is_active: formData.is_active
            };

            if (editingId) {
                await axios.put(`/seller/category/${editingId}`, apiData);
                Swal.fire('ជោគជ័យ!', 'បានកែប្រែឈ្មោះប្រភេទរួចរាល់។', 'success');
            } else {
                await axios.post('/seller/category', apiData);
                Swal.fire('ជោគជ័យ!', 'បានបន្ថែមឈ្មោះប្រភេទថ្មី។', 'success');
            }

            resetForm();
            fetchCategories();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('<br>');
                Swal.fire('កំហុសក្នុងការបញ្ជាក់!', errorMessages, 'error');
            } else {
                Swal.fire('មានបញ្ហា!', error.response?.data?.message || 'មានបញ្ហាមួយចំនួនកើតឡើង។', 'error');
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
            title: 'តើអ្នកប្រាកដទេ?',
            text: 'ថានឹងលុបឈ្មោះប្រភេទនេះ!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'បាទ/ចាស',
            cancelButtonText: 'បោះបង់',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/seller/category/${id}`);
                Swal.fire('បានលុប!', 'ឈ្មោះប្រភេទត្រូវបានលុបរួចរាល់។', 'success');
                fetchCategories();
            } catch (error: any) {
                console.error(error);
                if (error.response?.status === 409) {
                    Swal.fire('មិនអាចលុបបាន!', error.response.data.message, 'error');
                } else {
                    Swal.fire('មានបញ្ហា!', 'មិនអាចលុបឈ្មោះប្រភេទនេះបានទេ។', 'error');
                }
            }
        }
    };

    const toggleActive = async (id: number, currentStatus: boolean) => {
        if (togglingId === id) return;

        setTogglingId(id);

        setLocalCategories(prev =>
            prev.map(cat =>
                cat.category_id === id
                    ? { ...cat, is_active: !currentStatus }
                    : cat
            )
        );

        try {
            await axios.patch(`/seller/category/${id}/toggle-status`, {
                is_active: !currentStatus
            });

            setCategories(prev =>
                prev.map(cat =>
                    cat.category_id === id
                        ? { ...cat, is_active: !currentStatus }
                        : cat
                )
            );
        } catch (error) {
            console.error('Failed to toggle status:', error);

            setLocalCategories(prev =>
                prev.map(cat =>
                    cat.category_id === id
                        ? { ...cat, is_active: currentStatus }
                        : cat
                )
            );
        } finally {
            setTogglingId(null);
        }
    };

    const filteredCategories = localCategories.filter((category) => {
        const term = searchTerm.toLowerCase();
        return (
            category.seller_category_id.toString().includes(term) ||
            category.categoryname.toLowerCase().includes(term)
        );
    });

    return (
        <AppLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-2 text-gray-800">គ្រប់គ្រងឈ្មោះប្រភេទផលិតផល</h1>

                <div className="bg-white rounded-lg shadow-md p-3 mb-2">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">
                        {editingId ? 'កែសម្រួលឈ្មោះប្រភេទ' : 'បន្ថែមឈ្មោះប្រភេទថ្មី'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                ឈ្មោះប្រភេទ *
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
                                        ? 'រក្សាឈ្មោះបច្ចុប្បន្ន ឬជ្រើសថ្មី'
                                        : '-- ជ្រើសរើសឈ្មោះប្រភេទ --'}
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
                                ការពិពណ៌នា
                            </label>
                            <textarea
                                name="description"
                                placeholder="ពិពណ៌នាពីប្រភេទ..."
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
                                {formData.is_active ? 'ប្រើប្រាស់' : 'មិនទាន់ប្រើប្រាស់'}
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
                                {submitting
                                    ? 'កំពុងដំណើរការ...'
                                    : editingId
                                    ? 'កែប្រែឈ្មោះប្រភេទ'
                                    : 'បន្ថែមឈ្មោះប្រភេទ'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={submitting}
                                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition duration-200"
                                >
                                    បោះបង់
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-700">បញ្ជីឈ្មោះប្រភេទ</h2>
                        <div className="text-sm text-gray-500">
                            សរុប៖ {filteredCategories.length} ប្រភេទ
                        </div>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="ស្វែងរកតាមលេខសម្គាល់ ឬឈ្មោះ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-600">
                            កំពុងផ្ទុកប្រភេទ...
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            រកមិនឃើញឈ្មោះប្រភេទណាមួយទេ។
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">លេខសម្គាល់</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ឈ្មោះប្រភេទ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ស្ថានភាព</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">សកម្មភាព</th>
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
                                                    disabled={togglingId === category.category_id}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 min-w-[90px] ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    } ${togglingId === category.category_id ? 'opacity-60 cursor-wait' : ''}`}
                                                >
                                                    {category.is_active ? 'ប្រើប្រាស់' : 'មិនប្រើប្រាស់'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition duration-200"
                                                >
                                                    កែប្រែ
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.category_id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition duration-200"
                                                >
                                                    លុប
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
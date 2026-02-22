import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    address?: string;
}

interface CartItem {
    product_id: number;
    productname: string;
    price: number;
    quantity: number;
    unit: string;
    image?: string;
}

interface Order {
    order_id: number;
    order_number: string;
    status: string;
}

interface CheckoutFormProps {
    cartItems: CartItem[];
    user?: User;
    onSuccess?: (order: Order) => void;
}

interface FormData {
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    payment_method: 'KHQR' | 'manual(cash)';
    customer_notes: string;
}

interface ValidationErrors {
    recipient_name?: string[];
    recipient_phone?: string[];
    shipping_address?: string[];
    payment_method?: string[];
    customer_notes?: string[];
    items?: string[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cartItems, user, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        recipient_name: user?.username || '',
        recipient_phone: user?.phone || '',
        shipping_address: user?.address || '',
        payment_method: 'KHQR',
        customer_notes: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // ✅ Configure axios CSRF token
    useEffect(() => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
        }
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Accept'] = 'application/json';
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                recipient_name: user.username || '',
                recipient_phone: user.phone || '',
                shipping_address: user.address || ''
            }));
        }
    }, [user]);

    const calculateTotal = (): string => {
        return cartItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0).toFixed(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name as keyof ValidationErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Prepare order items
        const orderItems = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));

        // ✅ DEBUG LOGGING
        console.log('🛒 Submitting order:', {
            formData,
            orderItems,
            itemCount: orderItems.length,
            totalAmount: calculateTotal()
        });

        try {
            const response = await axios.post<{ message: string; data: Order }>('/customer/orders', {
                ...formData,
                items: orderItems
            });

            console.log('✅ Order created successfully:', response.data);
            alert('Order placed successfully!');
            
            if (onSuccess) {
                onSuccess(response.data.data);
            }
        } catch (error: any) {
            // ✅ COMPREHENSIVE ERROR LOGGING
            console.error('❌ Order creation failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                fullError: error
            });

            // Handle specific error types
            if (error.response?.status === 419) {
                alert('Session expired. Please refresh the page and try again.');
            } else if (error.response?.status === 401) {
                alert('Please log in to place an order.');
                window.location.href = '/login';
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join('\n');
                alert(`Validation errors:\n${errorMessages}`);
            } else if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`);
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to place order. Please check your internet connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 font-moul">ការទូទាត់</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 font-moul">ព័ត៌មានដឹកជញ្ជូន</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                ឈ្មោះអ្នកទទួល (ស្រេចចិត្ត - លំនាំដើមឈ្មោះអ្នកប្រើ)
                            </label>
                            <input
                                type="text"
                                name="recipient_name"
                                value={formData.recipient_name}
                                onChange={handleChange}
                                placeholder={user?.username || 'បញ្ចូលឈ្មោះអ្នកទទួល'}
                                className={`w-full border rounded px-3 py-2 ${
                                    errors.recipient_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.recipient_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.recipient_name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                លេខទូរស័ព្ទ (ស្រេចចិត្ត - លំនាំដើមលេខទូរស័ព្ទរបស់អ្នក)
                            </label>
                            <input
                                type="tel"
                                name="recipient_phone"
                                value={formData.recipient_phone}
                                onChange={handleChange}
                                placeholder={user?.phone || 'បញ្ចូលលេខទូរស័ព្ទ'}
                                className={`w-full border rounded px-3 py-2 ${
                                    errors.recipient_phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.recipient_phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.recipient_phone[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                អាសយដ្ឋានដឹកជញ្ជូន (ស្រេចចិត្ត - លំនាំដើមអាសយដ្ឋានរបស់អ្នក)
                            </label>
                            <textarea
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleChange}
                                rows={3}
                                placeholder={user?.address || 'បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន'}
                                className={`w-full border rounded px-3 py-2 ${
                                    errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.shipping_address && (
                                <p className="text-red-500 text-sm mt-1">{errors.shipping_address[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                វិធីសាស្ត្របង់ប្រាក់ <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            >
                                <option value="KHQR">KHQR</option>
                                <option value="manual(cash)">សាច់ប្រាក់នៅពេលទទួល</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                កំណត់ចំណាំអតិថិជន (ស្រេចចិត្ត)
                            </label>
                            <textarea
                                name="customer_notes"
                                value={formData.customer_notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="សេចក្តីណែនាំពិសេស ឬកំណត់ចំណាំ..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || cartItems.length === 0}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'កំពុងដាក់ការបញ្ជាទិញ...' : 'ដាក់ការបញ្ជាទិញ'}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 font-moul">សង្ខេបការបញ្ជាទិញ</h3>
                    
                    <div className="space-y-3 mb-4">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center pb-3 border-b">
                                <div className="flex items-center gap-3">
                                    {item.image && (
                                        <img 
                                            src={item.image}
                                            alt={item.productname}
                                            className="w-12 h-12 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/200?text=No+Image';
                                            }}
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{item.productname}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.quantity} {item.unit} × ៛{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-semibold">
                                    ៛{(item.quantity * item.price).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>សរុប:</span>
                            <span className="text-2xl text-green-600">៛ {calculateTotal()}</span>
                        </div>
                    </div>

                    {formData.payment_method === 'KHQR' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>ចំណាំ:</strong> បន្ទាប់ពីដាក់ការបញ្ជាទិញ អ្នកនឹងអាចបង់ប្រាក់តាមរយៈ KHQR 
                                នៅពេលដែលអ្នកលក់រៀបចំការបញ្ជាទិញរបស់អ្នករួច។
                            </p>
                        </div>
                    )}

                    {formData.payment_method === 'manual(cash)' && (
                        <div className="mt-4 p-4 bg-green-50 rounded">
                            <p className="text-sm text-green-800">
                                <strong>ចំណាំ:</strong> អ្នកនឹងបង់ប្រាក់ជាសាច់ប្រាក់នៅពេលទទួលការបញ្ជាទិញ។ 
                                អ្នកលក់នឹងធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់ដោយដៃ។
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Important Information */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2 font-moul">ព័ត៌មានសំខាន់:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• ការបញ្ជាទិញរបស់អ្នកនឹងត្រូវបានបោះបង់ដោយស្វ័យប្រវត្តិ ប្រសិនបើអ្នកលក់មិនឆ្លើយតបក្នុងរយៈពេល ៣០ នាទី</li>
                    <li>• បន្ទាប់ពីអ្នកលក់បានបញ្ចប់ការបញ្ជាទិញរបស់អ្នក អ្នកមានពេល ៣០ នាទីដើម្បីធ្វើការទូទាត់</li>
                    <li>• អ្នកអាចលុបចោលការបញ្ជាទិញរបស់អ្នកនៅពេលវាស្ថិតក្នុងស្ថានភាព "កំពុងដំណើរការ"</li>
                </ul>
            </div>
        </div>
    );
};

export default CheckoutForm;
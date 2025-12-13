import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, Lock, Store, MapPin, FileText, Shield, ShoppingCart } from 'lucide-react';
import {toast} from 'sonner';
export default function CreateUser() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer' as 'admin' | 'seller' | 'customer',
        phone: '',
        status: 'active' as 'active' | 'inactive' | 'banned',
        farm_name: '',
        location_district: '',
        description: '',
    });

    const [isSeller, setIsSeller] = useState(false);

    const handleRoleChange = (role: 'admin' | 'seller' | 'customer') => {
        setData('role', role);
        setIsSeller(role === 'seller');
        if (role !== 'seller') {
            setData((prevData) => ({
                ...prevData,
                role: role,
                farm_name: '',
                location_district: '',
                description: '',
            }));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Ner User created successfully!');
                reset();
                router.visit('/admin/users');
            },
            onError: (errors) => {
                toast.error('Failed to create user. Please check the data.');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Create User" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back to Users</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Create New User</h1>
                        <p className="text-slate-600 mt-2">Add a new user to the system</p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <form onSubmit={submit}>
                            {/* Role Selection Section */}
                            <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Select User Role</h2>
                                    <p className="text-sm text-slate-600">Choose the role that best fits this user's responsibilities</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('admin')}
                                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'admin'
                                                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100 scale-105'
                                                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Shield size={24} className="text-purple-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">Admin</div>
                                        <div className="text-xs text-slate-600">Full system access</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('seller')}
                                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'seller'
                                                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-105'
                                                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Store size={24} className="text-emerald-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">Seller</div>
                                        <div className="text-xs text-slate-600">Manage products</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange('customer')}
                                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                                            data.role === 'customer'
                                                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-105'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <ShoppingCart size={24} className="text-blue-600" />
                                        </div>
                                        <div className="font-bold text-slate-900 mb-1">Customer</div>
                                        <div className="text-xs text-slate-600">Browse & purchase</div>
                                    </button>
                                </div>
                                {errors.role && (
                                    <p className="text-rose-600 text-sm mt-3 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Account Information Section */}
                            <div className="p-8 border-b border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <User size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
                                        <p className="text-sm text-slate-600">Basic account details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Username <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <User size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.username
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-slate-200 focus:ring-purple-500 focus:border-purple-500 focus:bg-white'
                                                }`}
                                                placeholder="Enter username"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Email Address <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Mail size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.email
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-slate-200 focus:ring-purple-500 focus:border-purple-500 focus:bg-white'
                                                }`}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Phone Number <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Phone size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.phone
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-slate-200 focus:ring-purple-500 focus:border-purple-500 focus:bg-white'
                                                }`}
                                                placeholder="+855 12 345 678"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Account Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Password <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Lock size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                    errors.password
                                                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-slate-200 focus:ring-purple-500 focus:border-purple-500 focus:bg-white'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Confirm Password <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Lock size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Information Section */}
                            {isSeller && (
                                <div className="p-8 border-b border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                            <Store size={20} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Seller Information</h2>
                                            <p className="text-sm text-slate-600">Farm or shop details</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Farm/Shop Name <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    <Store size={18} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.farm_name}
                                                    onChange={(e) => setData('farm_name', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                        errors.farm_name
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                            : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                                                    }`}
                                                    placeholder="Enter farm or shop name"
                                                />
                                            </div>
                                            {errors.farm_name && (
                                                <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                    {errors.farm_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                District <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    <MapPin size={18} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.location_district}
                                                    onChange={(e) => setData('location_district', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                                        errors.location_district
                                                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                                                            : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                                                    }`}
                                                    placeholder="Enter district"
                                                />
                                            </div>
                                            {errors.location_district && (
                                                <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-rose-600 rounded-full"></span>
                                                    {errors.location_district}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Description
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-4">
                                                <FileText size={18} className="text-slate-400" />
                                            </div>
                                            <textarea
                                                rows={4}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                                                placeholder="Tell us about the farm or business..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="p-8 bg-slate-50">
                                <div className="flex flex-col sm:flex-row justify-end gap-4">
                                    <Link
                                        href="/admin/users"
                                        className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-white hover:border-slate-300 transition-all text-center"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Creating...
                                            </span>
                                        ) : (
                                            'Create User'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

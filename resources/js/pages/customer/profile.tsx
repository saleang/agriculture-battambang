// resources/js/pages/customer/profile.tsx (COMPLETE FIX)
import { useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Edit, Check, Shield, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transition } from '@headlessui/react';
import InputError from '@/components/input-error';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import Header from '@/pages/customer/header-customer';
import { Footer } from '@/pages/customer/footer-customer';
import { toast } from 'sonner';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    gender?: string;
    address?: string;
    photo?: string;
    photo_url?: string;
    email_verified_at?: string;
}

interface PageProps extends InertiaPageProps {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ProfilePage() {
    const { auth, flash } = usePage<PageProps>().props;
    const [searchQuery, setSearchQueryHeader] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const user = auth?.user;
    const userName = user?.username ?? null;
    const isVerified = !!user?.email_verified_at;

    const profileForm = useForm({
        username: user?.username || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        address: user?.address || '',
        photo: null as File | null,
        _method: 'PATCH',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Photo must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            profileForm.setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhotoPreview(null);
        profileForm.setData('photo', null);
        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }
    };

    const handleSaveProfile = () => {
        profileForm.post('/customer/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setIsEditingProfile(false);
                setPhotoPreview(null);

                // Reload to get fresh user data including new photo
                router.reload({
                    only: ['auth'],
                    // preserveScroll: true,
                });
            },
            onError: (errors) => {
                toast.error('Failed to update profile');
                console.error(errors);
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/customer/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password updated successfully!');
                passwordForm.reset();
            },
            onError: (errors) => {
                toast.error('Failed to update password');
                console.error(errors);
            },
        });
    };

    return (
        <>
            <Head title="Profile" />

            {/* Header */}
            <Header
                cartCount={0}
                wishlistCount={0}
                searchQuery={searchQuery}
                onSearchChange={setSearchQueryHeader}
                isAuthenticated={!!user}
                userName={userName}
            />

            <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 mt-32">
                {/* Profile Header */}
                <Card className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#228B22] to-[#90EE90] rounded-full flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : user?.photo_url ? (
                                        <img
                                            src={user.photo_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                {isEditingProfile && (
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 rounded-full bg-[#228B22] p-1.5 text-white hover:bg-[#1a6b1a] transition"
                                    >
                                        <Camera className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {profileForm.data.username}
                                    </h2>
                                    {isVerified && (
                                        <Badge className="bg-[#228B22] text-white gap-1">
                                            <Check className="w-3 h-3" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-gray-600">{user?.email}</p>
                                {isEditingProfile && photoPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removePhoto}
                                        className="text-red-600 mt-1"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Remove photo
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>
                        <Button
                            onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                            className="bg-[#228B22] hover:bg-[#1a6b1a] gap-2"
                            disabled={profileForm.processing}
                        >
                            {isEditingProfile ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            {profileForm.processing ? 'Saving...' : (isEditingProfile ? 'Save' : 'Edit Profile')}
                        </Button>
                    </div>

                    {/* Profile Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="username" className="mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#228B22]" />
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={profileForm.data.username}
                                onChange={(e) => profileForm.setData('username', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={!isEditingProfile ? 'bg-gray-50' : ''}
                            />
                            <InputError message={profileForm.errors.username} />
                        </div>

                        <div>
                            <Label htmlFor="gender" className="mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#228B22]" />
                                Gender
                            </Label>
                            <select
                                id="gender"
                                value={profileForm.data.gender}
                                onChange={(e) => profileForm.setData('gender', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] ${!isEditingProfile ? 'bg-gray-50' : ''}`}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <InputError message={profileForm.errors.gender} />
                        </div>

                        <div>
                            <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#228B22]" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={user?.email || ''}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#228B22]" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={!isEditingProfile ? 'bg-gray-50' : ''}
                                placeholder="+855 12 345 678"
                            />
                            <InputError message={profileForm.errors.phone} />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="address" className="mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#228B22]" />
                                Address
                            </Label>
                            <textarea
                                id="address"
                                value={profileForm.data.address}
                                onChange={(e) => profileForm.setData('address', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md resize-y min-h-[100px] focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] ${!isEditingProfile ? 'bg-gray-50' : ''}`}
                                placeholder="Enter full address (e.g., House No. 123, Street 456, Village X, Commune Y, District Z, Province W)"
                            />
                            <InputError message={profileForm.errors.address} />
                        </div>

                        {!isVerified && (
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 col-span-2">
                                <Shield className="w-5 h-5 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="text-sm text-yellow-800">Account not verified</p>
                                    <Button variant="link" className="text-yellow-600 p-0 h-auto">
                                        Verify Now
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Password Change Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div>
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            />
                            <InputError message={passwordForm.errors.current_password} />
                        </div>
                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                            />
                            <InputError message={passwordForm.errors.password} />
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            />
                            <InputError message={passwordForm.errors.password_confirmation} />
                        </div>
                        <Button
                            type="submit"
                            className="bg-[#228B22] hover:bg-[#1a6b1a]"
                            disabled={passwordForm.processing}
                        >
                            {passwordForm.processing ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}

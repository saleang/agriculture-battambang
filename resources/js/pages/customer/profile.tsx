// resources/js/pages/customer/profile.tsx (Enhanced Error Display)
import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Edit, Check, Shield, Camera, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    errors?: {
        username?: string;
        phone?: string;
        gender?: string;
        address?: string;
        photo?: string;
        current_password?: string;
        password?: string;
        password_confirmation?: string;
    };
}

export default function ProfilePage() {
    const { auth, flash, errors: pageErrors } = usePage<PageProps>().props;
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

    // Show success toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Show error toasts for profile errors
    useEffect(() => {
        if (pageErrors) {
            if (pageErrors.username) {
                toast.error(pageErrors.username);
            }
            if (pageErrors.phone) {
                toast.error(pageErrors.phone);
            }
            if (pageErrors.photo) {
                toast.error(pageErrors.photo);
            }
        }
    }, [pageErrors]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('រូបភាពត្រូវតែតូចជាង 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('សូមបញ្ចូលរូបភាពប៉ុណ្ណោះ');
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
                toast.success('បានកែប្រែព័ត៌មានដោយជោគជ័យ!');
                setIsEditingProfile(false);
                setPhotoPreview(null);

                // Reload to get fresh user data including new photo
                router.reload({
                    only: ['auth'],
                });
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);

                // Show specific error messages
                if (errors.username) {
                    toast.error(errors.username);
                }
                if (errors.phone) {
                    toast.error(errors.phone);
                }
                if (errors.photo) {
                    toast.error(errors.photo);
                }
                if (errors.gender) {
                    toast.error(errors.gender);
                }
                if (errors.address) {
                    toast.error(errors.address);
                }
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation before submitting
        if (!passwordForm.data.current_password) {
            toast.error('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន');
            return;
        }

        if (!passwordForm.data.password) {
            toast.error('សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី');
            return;
        }

        if (passwordForm.data.password.length < 8) {
            toast.error('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ');
            return;
        }

        if (!passwordForm.data.password_confirmation) {
            toast.error('សូមបញ្ជាក់ពាក្យសម្ងាត់ថ្មី');
            return;
        }

        if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
            toast.error('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នាទេ');
            return;
        }

        // Submit the form
        passwordForm.post('/customer/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('បានផ្លាស់ប្ដូរពាក្យសម្ងាត់ដោយជោគជ័យ!');
                passwordForm.reset();
            },
            onError: (errors) => {
                console.error('Password update errors:', errors);

                // Show specific error messages
                if (errors.current_password) {
                    toast.error(errors.current_password);
                } else if (errors.password) {
                    toast.error(errors.password);
                } else if (errors.password_confirmation) {
                    toast.error(errors.password_confirmation);
                } else {
                    toast.error('មិនអាចផ្លាស់ប្ដូរពាក្យសម្ងាត់បានទេ');
                }
            },
        });
    };

    // Check if password form is valid
    const isPasswordFormValid =
        passwordForm.data.current_password.length > 0 &&
        passwordForm.data.password.length >= 8 &&
        passwordForm.data.password_confirmation.length > 0 &&
        passwordForm.data.password === passwordForm.data.password_confirmation;

    // Merge errors
    const allErrors = {
        ...pageErrors,
        ...profileForm.errors,
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
                                            បានផ្ទៀងផ្ទាត់
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
                                        លុបរូបភាព
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
                            {profileForm.processing ? 'កំពុងរក្សាទុក...' : (isEditingProfile ? 'រក្សាទុក' : 'កែប្រែព័ត៌មាន')}
                        </Button>
                    </div>

                    {/* Profile Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="username" className="mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#228B22]" />
                                ឈ្មោះ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                value={profileForm.data.username}
                                onChange={(e) => profileForm.setData('username', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`${!isEditingProfile ? 'bg-gray-50' : ''} ${allErrors.username ? 'border-red-500' : ''}`}
                            />
                            {allErrors.username && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{allErrors.username}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="gender" className="mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#228B22]" />
                                ភេទ
                            </Label>
                            <select
                                id="gender"
                                value={profileForm.data.gender}
                                onChange={(e) => profileForm.setData('gender', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] ${!isEditingProfile ? 'bg-gray-50' : ''} ${allErrors.gender ? 'border-red-500' : ''}`}
                            >
                                <option value="">ជ្រើសរើសភេទ</option>
                                <option value="male">ប្រុស</option>
                                <option value="female">ស្រី</option>
                                <option value="other">ផ្សេងៗ</option>
                            </select>
                            {allErrors.gender && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{allErrors.gender}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#228B22]" />
                                អ៊ីមែល
                            </Label>
                            <Input
                                id="email"
                                value={user?.email || ''}
                                disabled
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">អ៊ីមែលមិនអាចកែប្រែបានទេ</p>
                        </div>

                        <div>
                            <Label htmlFor="phone" className="mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#228B22]" />
                                លេខទូរស័ព្ទ
                            </Label>
                            <Input
                                id="phone"
                                value={profileForm.data.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        profileForm.setData('phone', value);
                                    }
                                }}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`${!isEditingProfile ? 'bg-gray-50' : ''} ${allErrors.phone ? 'border-red-500' : ''}`}
                                placeholder="0123456789"
                                maxLength={10}
                            />
                            {allErrors.phone && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{allErrors.phone}</p>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="address" className="mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#228B22]" />
                                អាសយដ្ឋាន
                            </Label>
                            <textarea
                                id="address"
                                value={profileForm.data.address}
                                onChange={(e) => profileForm.setData('address', e.target.value)}
                                disabled={!isEditingProfile || profileForm.processing}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md resize-y min-h-[100px] focus:ring-2 focus:ring-[#228B22] focus:border-[#228B22] ${!isEditingProfile ? 'bg-gray-50' : ''} ${allErrors.address ? 'border-red-500' : ''}`}
                                placeholder="បំពេញអាសយដ្ឋានរបស់អ្នក"
                            />
                            {allErrors.address && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{allErrors.address}</p>
                                </div>
                            )}
                        </div>

                        {!isVerified && (
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 col-span-2">
                                <Shield className="w-5 h-5 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="text-sm text-yellow-800">គណនីមិនទាន់បានផ្ទៀងផ្ទាត់</p>
                                    <Button variant="link" className="text-yellow-600 p-0 h-auto">
                                        ផ្ទៀងផ្ទាត់ឥឡូវនេះ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Password Change Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ផ្លាស់ប្ដូរពាក្យសម្ងាត់</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div>
                            <Label htmlFor="current_password" className="flex items-center gap-1">
                                ពាក្យសម្ងាត់បច្ចុប្បន្ន <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                                className={passwordForm.errors.current_password || pageErrors?.current_password ? 'border-red-500' : ''}
                                required
                            />
                            {(passwordForm.errors.current_password || pageErrors?.current_password) && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">
                                        {passwordForm.errors.current_password || pageErrors?.current_password}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password" className="flex items-center gap-1">
                                ពាក្យសម្ងាត់ថ្មី <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៨ តួអក្សរ)"
                                className={passwordForm.errors.password || pageErrors?.password ? 'border-red-500' : ''}
                                required
                            />
                            {(passwordForm.errors.password || pageErrors?.password) && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">
                                        {passwordForm.errors.password || pageErrors?.password}
                                    </p>
                                </div>
                            )}
                            {passwordForm.data.password && passwordForm.data.password.length < 8 && (
                                <p className="text-sm text-orange-600 mt-1">
                                    ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation" className="flex items-center gap-1">
                                បញ្ជាក់ពាក្យសម្ងាត់ថ្មី <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                                className={passwordForm.errors.password_confirmation ? 'border-red-500' : ''}
                                required
                            />
                            {passwordForm.errors.password_confirmation && (
                                <div className="mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">
                                        {passwordForm.errors.password_confirmation}
                                    </p>
                                </div>
                            )}
                            {passwordForm.data.password_confirmation &&
                             passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                <p className="text-sm text-red-600 mt-1">
                                    ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ
                                </p>
                            )}
                        </div>

                        {/* Helper text */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <strong>ចំណាំ:</strong> ពាក្យសម្ងាត់ថ្មីត្រូវមាន៖
                            </p>
                            <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                                <li>យ៉ាងតិច ៨ តួអក្សរ</li>
                                <li>ត្រូវគ្នានឹងពាក្យសម្ងាត់បញ្ជាក់</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            className="bg-[#228B22] hover:bg-[#1a6b1a] w-full"
                            disabled={passwordForm.processing || !isPasswordFormValid}
                        >
                            {passwordForm.processing ? 'កំពុងកែប្រែ...' : 'កែប្រែពាក្យសម្ងាត់'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}

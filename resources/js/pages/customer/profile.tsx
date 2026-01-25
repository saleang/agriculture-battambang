/** @jsxImportSource react */
// profile.tsx (កែសម្រួលពេញលេញ)
import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Edit, Check, Shield, Camera, X, AlertCircle, Lock, Eye, EyeOff, Calendar, Map, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    created_at?: string;
    updated_at?: string;
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
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const user = auth?.user;
    const userName = user?.username ?? null;
    const userPhoto = user?.photo_url ?? null;
    const isVerified = !!user?.email_verified_at;

    // Add custom fonts to Head
    const addFonts = () => (
        <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet" />
            <style>{`
                .font-moul { font-family: 'Moul', serif; }
                .font-siemreap { font-family: 'Siemreap', sans-serif; }
                body { font-family: 'Siemreap', sans-serif; }
            `}</style>
        </Head>
    );

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        let completed = 0;
        let total = 5; // username, email, phone, gender, address
        
        if (user?.username) completed++;
        if (user?.email) completed++;
        if (user?.phone) completed++;
        if (user?.gender) completed++;
        if (user?.address) completed++;
        
        return Math.round((completed / total) * 100);
    };

    const profileCompletion = calculateProfileCompletion();

    // Format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'មិនដឹង';
        return new Date(dateString).toLocaleDateString('kh-KH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const registrationDate = formatDate(user?.created_at);
    const lastUpdated = formatDate(user?.updated_at);

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

    // Show success/error toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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
                    preserveUrl: true,
                });
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    if (error) toast.error(error);
                });
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
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
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    if (error) toast.error(error);
                });
            },
        });
    };

    // Check if password form is valid
    const isPasswordFormValid =
        passwordForm.data.current_password.length > 0 &&
        passwordForm.data.password.length >= 8 &&
        passwordForm.data.password_confirmation.length > 0 &&
        passwordForm.data.password === passwordForm.data.password_confirmation;

    const cancelEdit = () => {
        setIsEditingProfile(false);
        setPhotoPreview(null);
        profileForm.reset();
        profileForm.clearErrors();
    };

    return (
        <>
            <Head title="ប្រូហ្វាល់របស់ខ្ញុំ - កសិផលខេត្តបាត់ដំបង" />
            {addFonts()}

            {/* Header with profile photo */}
            <Header
                cartCount={0}
                wishlistCount={0}
                searchQuery={searchQuery}
                onSearchChange={setSearchQueryHeader}
                isAuthenticated={!!user}
                userName={userName}
                userPhoto={photoPreview || userPhoto}
            />

            <div className="min-h-screen bg-gray-50 pt-28 pb-12 font-siemreap">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 font-moul">ប្រូហ្វាល់របស់ខ្ញុំ</h1>
                        <p className="text-gray-600 mt-2">គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងសុវត្ថិភាពគណនីរបស់អ្នក</p>
                        
                        {/* Profile Completion */}
                        <div className="mt-6 max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">ការបំពេញប្រូហ្វាល់</span>
                                <span className="text-sm font-bold text-green-600">{profileCompletion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-green-600 h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${profileCompletion}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {profileCompletion < 100 
                                    ? 'បំពេញព័ត៌មានបន្ថែមដើម្បីបញ្ចប់ប្រូហ្វាល់របស់អ្នក'
                                    : 'ប្រូហ្វាល់របស់អ្នកបានបញ្ចប់ហើយ!'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Tab Navigation */}
                        <div className="grid w-full max-w-md grid-cols-2 gap-2 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center justify-center py-3 px-4 font-medium transition-colors ${
                                    activeTab === 'profile'
                                        ? 'text-green-600 border-b-2 border-green-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <User className="w-4 h-4 mr-2" />
                                ព័ត៌មានផ្ទាល់ខ្លួន
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center justify-center py-3 px-4 font-medium transition-colors ${
                                    activeTab === 'security'
                                        ? 'text-green-600 border-b-2 border-green-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                សុវត្ថិភាព
                            </button>
                        </div>

                        {/* Profile Tab Content */}
                        {activeTab === 'profile' && (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left Column - Profile Card */}
                                <div className="lg:col-span-1">
                                    <Card className="sticky top-24 border-green-100">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col items-center text-center">
                                                {/* Profile Photo */}
                                                <div className="relative mb-4 group">
                                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-green-100 to-emerald-100">
                                                        {photoPreview ? (
                                                            <img
                                                                src={photoPreview}
                                                                alt="រូបថ្មី"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : userPhoto ? (
                                                            <img
                                                                src={userPhoto}
                                                                alt={userName || 'អ្នកប្រើ'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="w-16 h-16 text-green-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {isEditingProfile && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => photoInputRef.current?.click()}
                                                                className="absolute bottom-0 right-0 rounded-full bg-green-600 p-2 text-white hover:bg-green-700 transition shadow-lg"
                                                            >
                                                                <Camera className="h-4 w-4" />
                                                            </button>
                                                            <input
                                                                ref={photoInputRef}
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                                onChange={handlePhotoChange}
                                                                className="hidden"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {/* User Info */}
                                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                    {profileForm.data.username}
                                                </h2>
                                                
                                                <div className="flex items-center gap-2 mb-4">
                                                    {isVerified ? (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            បានផ្ទៀងផ្ទាត់
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            មិនទាន់ផ្ទៀងផ្ទាត់
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Contact Info */}
                                                <div className="w-full space-y-3">
                                                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <Mail className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                                        <span className="truncate">{user?.email}</span>
                                                    </div>
                                                    {user?.phone && (
                                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                            <Smartphone className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                    {user?.address && (
                                                        <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                            <Map className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-left">{user.address}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Account Info */}
                                                <div className="w-full mt-6 pt-4 border-t border-gray-100">
                                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>ចុះឈ្មោះ:</span>
                                                        </div>
                                                        <div className="text-right">{registrationDate}</div>
                                                        
                                                        <div className="flex items-center gap-1">
                                                            <Edit className="w-3 h-3" />
                                                            <span>កែសម្រួលចុងក្រោយ:</span>
                                                        </div>
                                                        <div className="text-right">{lastUpdated}</div>
                                                    </div>
                                                </div>

                                                {/* Photo Actions */}
                                                {isEditingProfile && photoPreview && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={removePhoto}
                                                        className="mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        លុបរូបភាពថ្មី
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Edit Form */}
                                <div className="lg:col-span-2">
                                    <Card className="border-green-100">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>ព័ត៌មានផ្ទាល់ខ្លួន</CardTitle>
                                                    <CardDescription>
                                                        កែប្រែព័ត៌មានគណនីរបស់អ្នក
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isEditingProfile ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                onClick={cancelEdit}
                                                                disabled={profileForm.processing}
                                                            >
                                                                បោះបង់
                                                            </Button>
                                                            <Button
                                                                onClick={handleSaveProfile}
                                                                className="bg-green-600 hover:bg-green-700"
                                                                disabled={profileForm.processing}
                                                            >
                                                                {profileForm.processing ? (
                                                                    <>
                                                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                                        កំពុងរក្សាទុក...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="w-4 h-4 mr-2" />
                                                                        រក្សាទុកការផ្លាស់ប្តូរ
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setIsEditingProfile(true)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            កែប្រែព័ត៌មាន
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Username */}
                                                    <div>
                                                        <Label htmlFor="username" className="mb-2 flex items-center gap-2">
                                                            <User className="w-4 h-4 text-green-600" />
                                                            ឈ្មោះអ្នកប្រើ <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="username"
                                                            value={profileForm.data.username}
                                                            onChange={(e) => profileForm.setData('username', e.target.value)}
                                                            disabled={!isEditingProfile || profileForm.processing}
                                                            className={profileForm.errors.username ? 'border-red-500 focus-visible:ring-red-500/50' : ''}
                                                            placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ"
                                                        />
                                                        {profileForm.errors.username && (
                                                            <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                {profileForm.errors.username}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Gender */}
                                                    <div>
                                                        <Label htmlFor="gender" className="mb-2 flex items-center gap-2">
                                                            <User className="w-4 h-4 text-green-600" />
                                                            ភេទ
                                                        </Label>
                                                        <select
                                                            id="gender"
                                                            value={profileForm.data.gender}
                                                            onChange={(e) => profileForm.setData('gender', e.target.value)}
                                                            disabled={!isEditingProfile || profileForm.processing}
                                                            className={`w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-siemreap ${
                                                                !isEditingProfile ? 'bg-gray-50' : 'bg-white'
                                                            } ${profileForm.errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                                                        >
                                                            <option value="">ជ្រើសរើសភេទ</option>
                                                            <option value="male">ប្រុស</option>
                                                            <option value="female">ស្រី</option>
                                                            <option value="other">ផ្សេងៗ</option>
                                                        </select>
                                                        {profileForm.errors.gender && (
                                                            <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                {profileForm.errors.gender}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Email (Read-only) */}
                                                <div>
                                                    <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-green-600" />
                                                        អ៊ីម៉ែល
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        value={user?.email || ''}
                                                        disabled
                                                        className="bg-gray-50"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        អ៊ីម៉ែលមិនអាចកែប្រែបានទេ។ សូមទាក់ទងការិយាល័យបើចង់ផ្លាស់ប្តូរ
                                                    </p>
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <Label htmlFor="phone" className="mb-2 flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                        លេខទូរស័ព្ទ
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+855</div>
                                                        <Input
                                                            id="phone"
                                                            value={profileForm.data.phone}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                if (value.length <= 9) {
                                                                    profileForm.setData('phone', value);
                                                                }
                                                            }}
                                                            disabled={!isEditingProfile || profileForm.processing}
                                                            className={`pl-16 ${profileForm.errors.phone ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
                                                            placeholder="123456789"
                                                            maxLength={9}
                                                        />
                                                    </div>
                                                    {profileForm.errors.phone && (
                                                        <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            {profileForm.errors.phone}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        លេខទូរស័ព្ទត្រូវមាន ៩ ខ្ទង់បន្ទាប់ពីលេខកូដប្រទេស (+855)
                                                    </p>
                                                </div>

                                                {/* Address */}
                                                <div>
                                                    <Label htmlFor="address" className="mb-2 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-green-600" />
                                                        អាសយដ្ឋាន
                                                    </Label>
                                                    <textarea
                                                        id="address"
                                                        value={profileForm.data.address}
                                                        onChange={(e) => profileForm.setData('address', e.target.value)}
                                                        disabled={!isEditingProfile || profileForm.processing}
                                                        className={`w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-y min-h-[100px] font-siemreap ${
                                                            !isEditingProfile ? 'bg-gray-50' : 'bg-white'
                                                        } ${profileForm.errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder="បំពេញអាសយដ្ឋានពេញលេញរបស់អ្នក..."
                                                    />
                                                    {profileForm.errors.address && (
                                                        <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            {profileForm.errors.address}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Email Verification */}
                                                {!isVerified && (
                                                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-yellow-800 font-medium">អ៊ីម៉ែលមិនទាន់បានផ្ទៀងផ្ទាត់</p>
                                                                <p className="text-yellow-700 text-sm mt-1">
                                                                    សូមផ្ទៀងផ្ទាត់អ៊ីម៉ែលរបស់អ្នកដើម្បីប្រើប្រាស់លក្ខណៈពិសេសទាំងអស់ និងទទួលបានការបន្តផ្សព្វផ្សាយពីកសិករ
                                                                </p>
                                                                <Button variant="link" className="text-yellow-600 p-0 h-auto mt-2">
                                                                    ផ្ញើតំណផ្ទៀងផ្ទាត់ឡើងវិញ
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Security Tab Content */}
                        {activeTab === 'security' && (
                            <Card className="border-green-100">
                                <CardHeader>
                                    <CardTitle>ការកំណត់សុវត្ថិភាព</CardTitle>
                                    <CardDescription>
                                        ផ្លាស់ប្តូរពាក្យសម្ងាត់របស់អ្នកដើម្បីរក្សាសុវត្ថិភាព
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                                        <div className="space-y-4">
                                            {/* Current Password */}
                                            <div>
                                                <Label htmlFor="current_password" className="mb-2 flex items-center gap-1">
                                                    ពាក្យសម្ងាត់បច្ចុប្បន្ន <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current_password"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        value={passwordForm.data.current_password}
                                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                        placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                                                        className={`pr-10 ${passwordForm.errors.current_password ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.current_password && (
                                                    <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                        {passwordForm.errors.current_password}
                                                    </div>
                                                )}
                                            </div>

                                            {/* New Password and Confirm */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="password" className="mb-2 flex items-center gap-1">
                                                        ពាក្យសម្ងាត់ថ្មី <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={passwordForm.data.password}
                                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                            placeholder="យ៉ាងតិច ៨ តួអក្សរ"
                                                            className={`pr-10 ${passwordForm.errors.password ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {passwordForm.errors.password && (
                                                        <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            {passwordForm.errors.password}
                                                        </div>
                                                    )}
                                                    {passwordForm.data.password && passwordForm.data.password.length < 8 && (
                                                        <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="password_confirmation" className="mb-2 flex items-center gap-1">
                                                        បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={passwordForm.data.password_confirmation}
                                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                            placeholder="វាយពាក្យសម្ងាត់ម្តងទៀត"
                                                            className={`pr-10 ${passwordForm.errors.password_confirmation ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {passwordForm.errors.password_confirmation && (
                                                        <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            {passwordForm.errors.password_confirmation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Password Match Validation */}
                                            {passwordForm.data.password_confirmation && 
                                             passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-red-700 text-sm flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Password Requirements */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="text-green-800 font-medium mb-3 flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                តម្រូវការពាក្យសម្ងាត់ដែលមានសុវត្ថិភាព
                                            </h4>
                                            <ul className="text-green-700 text-sm space-y-1.5">
                                                <li className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${passwordForm.data.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    យ៉ាងតិច ៨ តួអក្សរ
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(passwordForm.data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    មានអក្សរធំយ៉ាងតិចមួយ
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(passwordForm.data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    មានលេខយ៉ាងតិចមួយ
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(passwordForm.data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    មានតួអក្សរពិសេសយ៉ាងតិចមួយ
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-4">
                                            <Button
                                                type="submit"
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={passwordForm.processing || !isPasswordFormValid}
                                            >
                                                {passwordForm.processing ? (
                                                    <>
                                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        កំពុងកែប្រែ...
                                                    </>
                                                ) : (
                                                    'កែប្រែពាក្យសម្ងាត់'
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    passwordForm.reset();
                                                    setShowCurrentPassword(false);
                                                    setShowNewPassword(false);
                                                    setShowConfirmPassword(false);
                                                }}
                                            >
                                                សំអាតទម្រង់
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}
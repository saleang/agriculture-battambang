// components/SellerEditForm.tsx - FIXED with persistent file display
import React, { useRef, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, File, CheckCircle } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface SellerEditFormProps {
    seller: any;
    provinces: any[];
    onClose: () => void;
}

export default function SellerEditForm({ seller, provinces, onClose }: SellerEditFormProps) {
    const { auth } = usePage<any>().props;
    const [photoPreview, setPhotoPreview] = useState<string | null>(auth?.user?.photo_url || null);
    const [certPreview, setCertPreview] = useState<string | null>(seller?.certification_url || null);
    const [hasExistingCert, setHasExistingCert] = useState<boolean>(!!seller?.certification_url);
    const [newCertSelected, setNewCertSelected] = useState<boolean>(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const certInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        username: auth?.user?.username || '',
        email: auth?.user?.email || '',
        phone: auth?.user?.phone || '',
        gender: auth?.user?.gender || '',
        photo: null as File | null,
        certification: null as File | null,
        _method: 'PATCH',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Photo must be less than 2MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Certification file must be less than 5MB');
                if (certInputRef.current) {
                    certInputRef.current.value = '';
                }
                return;
            }

            setData('certification', file);
            setNewCertSelected(true);

            const reader = new FileReader();
            reader.onloadend = () => {
                setCertPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhotoPreview(auth?.user?.photo_url || null);
        setData('photo', null);
        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }
    };

    const removeCert = () => {
        setCertPreview(seller?.certification_url || null);
        setData('certification', null);
        setNewCertSelected(false);
        if (certInputRef.current) {
            certInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/seller/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully');

                router.reload({ only: ['auth', 'seller'] });
                onClose();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update profile');

                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(firstError as string);
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Photo Upload */}
            <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-2xl">
                                {auth?.user?.username?.[0]?.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-0 right-0 rounded-full bg-green-600 p-1.5 text-white hover:bg-green-700 transition"
                    >
                        <Camera className="h-3 w-3" />
                    </button>
                </div>
                <div className="flex-1">
                    <Label>Profile Photo</Label>
                    <p className="text-xs text-gray-600">JPG, PNG max 2MB</p>
                    {photoPreview && photoPreview !== auth?.user?.photo_url && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removePhoto}
                            className="text-red-600 mt-1"
                        >
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={photoInputRef}
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoChange}
                    className="hidden"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                        id="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="mt-1"
                        required
                    />
                    {errors.username && (
                        <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1"
                        required
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="mt-1"
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                        id="gender"
                        value={data.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                        <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                    )}
                </div>
            </div>

            {/* Certification Upload - IMPROVED */}
            <div className="pt-4 border-t">
                <Label>Certification / ID Card</Label>
                <p className="text-xs text-gray-600 mb-3">
                    Upload image of your ID or certificate (JPG, PNG, PDF - max 5MB)
                </p>

                {/* Show existing certification */}
                {hasExistingCert && !newCertSelected && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {certPreview && (
                                    <img
                                        src={certPreview}
                                        alt="Current Certification"
                                        className="h-20 w-20 object-cover rounded border-2 border-green-300"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                        Current Certification
                                    </span>
                                </div>
                                <p className="text-xs text-green-700">
                                    Your certification is already uploaded. Upload a new file to replace it.
                                </p>
                                {certPreview && (
                                    <a
                                        href={certPreview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-600 hover:text-green-700 underline mt-1 inline-block"
                                    >
                                        View full size →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Show new certification preview */}
                {newCertSelected && certPreview && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 relative">
                                <img
                                    src={certPreview}
                                    alt="New Certification"
                                    className="h-20 w-20 object-cover rounded border-2 border-blue-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeCert}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition shadow-lg"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        New Certification Selected
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700">
                                    This file will replace your current certification when you save.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* File input */}
                <div className="relative">
                    <input
                        ref={certInputRef}
                        id="certification"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,application/pdf"
                        onChange={handleCertChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-green-50 file:text-green-700
                            hover:file:bg-green-100 cursor-pointer
                            border border-gray-300 rounded-md"
                    />
                </div>

                {errors.certification && (
                    <p className="text-sm text-red-600 mt-2">{errors.certification}</p>
                )}

                {!hasExistingCert && !newCertSelected && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <File className="h-3 w-3" />
                        No certification uploaded yet
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    type="button"
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[120px]"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Success Message */}
            <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0"
                leave="transition ease-in-out duration-300"
                leaveTo="opacity-0"
            >
                <p className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded">
                    ✓ Profile updated successfully!
                </p>
            </Transition>
        </form>
    );
}

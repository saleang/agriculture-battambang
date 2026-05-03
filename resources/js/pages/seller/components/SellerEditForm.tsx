// components/SellerEditForm.tsx — Clean modern professional redesign
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

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
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
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be less than 2MB'); return; }
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        setData('photo', file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Certification file must be less than 5MB');
            if (certInputRef.current) certInputRef.current.value = '';
            return;
        }
        setData('certification', file);
        setNewCertSelected(true);
        const reader = new FileReader();
        reader.onloadend = () => setCertPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setPhotoPreview(auth?.user?.photo_url || null);
        setData('photo', null);
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const removeCert = () => {
        setCertPreview(seller?.certification_url || null);
        setData('certification', null);
        setNewCertSelected(false);
        if (certInputRef.current) certInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError ? (firstError as string) : 'Failed to update profile');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">

            {/* ── Photo Upload ───────────────────────────── */}
            <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="relative shrink-0">
                    <div className="h-18 w-18 h-[72px] w-[72px] overflow-hidden rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white shadow">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-2xl font-semibold">
                                {auth?.user?.username?.[0]?.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center
                                   rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700 transition-colors"
                    >
                        <Camera className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">រូបភាពប្រូហ្វាល់</p>
                    <p className="text-xs text-gray-500 mt-0.5">JPG, PNG · max 2MB</p>
                    {photoPreview && photoPreview !== auth?.user?.photo_url && (
                        <button
                            type="button"
                            onClick={removePhoto}
                            className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                            <X className="h-3 w-3" /> លុបរូបភាព
                        </button>
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

            {/* ── Personal Info Grid ─────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="username" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        គោត្តនាម​ និងនាម​ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="mt-1.5 h-9 text-sm border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                        required
                    />
                    <FieldError message={errors.username} />
                </div>

                <div>
                    <Label htmlFor="email" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        អ៊ីមែល <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1.5 h-9 text-sm border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                        required
                    />
                    <FieldError message={errors.email} />
                </div>

                <div>
                    <Label htmlFor="phone" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        លេខទូរស័ព្ទ
                    </Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="mt-1.5 h-9 text-sm border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                    <FieldError message={errors.phone} />
                </div>

                <div>
                    <Label htmlFor="gender" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        ភេទ
                    </Label>
                    <select
                        id="gender"
                        value={data.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                        className="mt-1.5 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm
                                   text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400
                                   focus:outline-none transition-colors"
                    >
                        <option value="">ជ្រើសរើសភេទ</option>
                        <option value="male">ប្រុស</option>
                        <option value="female">ស្រី</option>
                        <option value="other">មិនបញ្ជាក់</option>
                    </select>
                    <FieldError message={errors.gender} />
                </div>
            </div>

            {/* ── Certification Upload ───────────────────── */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        ឯកសារ (អត្តសញ្ញាណប័ណ្ណ / វិញ្ញាបនប័ត្រ)
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">JPG, PNG, PDF · max 5MB</p>
                </div>

                {/* Existing cert */}
                {hasExistingCert && !newCertSelected && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        {certPreview && (
                            <img
                                src={certPreview}
                                alt="Current Certification"
                                className="h-14 w-14 rounded-md border border-emerald-200 object-cover shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="text-xs font-semibold text-emerald-800">ឯកសារបច្ចុប្បន្នរបស់អ្នក</span>
                            </div>
                            <p className="text-xs text-emerald-700 mt-0.5">
                                បញ្ចូលឯកសារថ្មីដើម្បីជំនួស
                            </p>
                            {certPreview && (
                                <a
                                    href={certPreview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-600 hover:underline"
                                >
                                    មើលឯកសារ →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* New cert preview */}
                {newCertSelected && certPreview && (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <div className="relative shrink-0">
                            <img
                                src={certPreview}
                                alt="New Certification"
                                className="h-14 w-14 rounded-md border border-blue-200 object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeCert}
                                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center
                                           rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <Upload className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span className="text-xs font-semibold text-blue-800">ឯកសារថ្មីដែលបានជ្រើស</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-0.5">
                                ឯកសារនេះនឹងជំនួសឯកសារបច្ចុប្បន្ន
                            </p>
                        </div>
                    </div>
                )}

                {/* File Input */}
                <label
                    htmlFor="certification"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300
                               bg-gray-50 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-emerald-400
                               hover:bg-emerald-50 hover:text-emerald-700"
                >
                    <Upload className="h-4 w-4 shrink-0" />
                    <span>ជ្រើសឯកសារ...</span>
                    <input
                        ref={certInputRef}
                        id="certification"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,application/pdf"
                        onChange={handleCertChange}
                        className="hidden"
                    />
                </label>

                {errors.certification && <FieldError message={errors.certification} />}

                {!hasExistingCert && !newCertSelected && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                        <File className="h-3 w-3" />
                        មិនទាន់មានឯកសារ
                    </p>
                )}
            </div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={processing}
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    បោះបង់
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[110px] bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-none"
                >
                    {processing ? (
                        <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            កំពុងរក្សា...
                        </span>
                    ) : 'រក្សាទុក'}
                </Button>
            </div>

            {/* Success Toast */}
            <Transition
                show={recentlySuccessful}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveTo="opacity-0"
            >
                <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-100">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    ការធ្វើបច្ចុប្បន្នភាពបានជោគជ័យ!
                </p>
            </Transition>
        </form>
    );
}
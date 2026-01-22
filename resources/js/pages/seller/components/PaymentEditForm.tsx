// components/PaymentEditForm.tsx - ភាសាខ្មែរពេញលេញ
import React, { useRef, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Upload, CheckCircle, File as FileIcon } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface PaymentEditFormProps {
    onClose: () => void;
}

export default function PaymentEditForm({ onClose }: PaymentEditFormProps) {
    const { seller } = usePage<any>().props;
    const [qrPreview, setQrPreview] = useState<string | null>(
        seller?.payment_qr_code && !seller.payment_qr_code.startsWith('http')
            ? `/storage/${seller.payment_qr_code}`
            : seller?.payment_qr_code || null
    );
    const [hasExistingQr, setHasExistingQr] = useState<boolean>(!!seller?.payment_qr_code);
    const [newQrSelected, setNewQrSelected] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        bank_account_name: seller?.bank_account_name || '',
        bank_account_number: seller?.bank_account_number || '',
        payment_qr_code: null as File | null,
        _method: 'PATCH',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof typeof data, value);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('រូបភាព QR កូដត្រូវតែតូចជាង 5MB');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('សូមបញ្ចូលឯកសាររូបភាព');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setData('payment_qr_code', file);
            setNewQrSelected(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQr = () => {
        setData('payment_qr_code', null);
        setQrPreview(
            seller?.payment_qr_code && !seller.payment_qr_code.startsWith('http')
                ? `/storage/${seller.payment_qr_code}`
                : seller?.payment_qr_code || null
        );
        setNewQrSelected(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/seller/payment_info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('បានធ្វើបច្ចុប្បន្នភាពការកំណត់ការបង់ប្រាក់ដោយជោគជ័យ');
                router.reload({
                    only: ['seller'],
                    onSuccess: () => {
                        onClose();
                    },
                });
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('មិនអាចធ្វើបច្ចុប្បន្នភាពការកំណត់ការបង់ប្រាក់បានទេ');
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(firstError as string);
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="border-l-4 border-blue-600 pl-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-900">ព័ត៌មានការបង់ប្រាក់</h3>
                <p className="text-sm text-gray-600 mt-1">កំណត់រចនាសម្ព័ន្ធព័ត៌មានការបង់ប្រាក់របស់អ្នក</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Bank Account Name */}
                <div className="space-y-2">
                    <Label htmlFor="bank_account_name">ឈ្មោះគណនីធនាគារ</Label>
                    <Input
                        id="bank_account_name"
                        name="bank_account_name"
                        type="text"
                        value={data.bank_account_name}
                        onChange={handleChange}
                        placeholder="បញ្ចូលឈ្មោះគណនី"
                    />
                    {errors.bank_account_name && (
                        <p className="text-sm text-red-600">{errors.bank_account_name}</p>
                    )}
                </div>

                {/* Bank Account Number */}
                <div className="space-y-2">
                    <Label htmlFor="bank_account_number">លេខគណនីធនាគារ</Label>
                    <Input
                        id="bank_account_number"
                        name="bank_account_number"
                        type="text"
                        value={data.bank_account_number}
                        onChange={handleChange}
                        placeholder="បញ្ចូលលេខគណនី"
                    />
                    {errors.bank_account_number && (
                        <p className="text-sm text-red-600">{errors.bank_account_number}</p>
                    )}
                </div>
            </div>

            {/* Payment QR Code Upload */}
            <div className="space-y-2 pt-4 border-t">
                <Label>QR កូដបង់ប្រាក់</Label>
                <p className="text-xs text-gray-600 mb-2">
                    បញ្ចូលរូបភាព QR កូដបង់ប្រាក់របស់អ្នក (JPG, PNG - អតិបរមា 5MB)
                </p>

                {/* Show existing QR code */}
                {hasExistingQr && !newQrSelected && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {qrPreview && (
                                    <img
                                        src={qrPreview}
                                        alt="QR កូដបច្ចុប្បន្ន"
                                        className="h-24 w-24 object-contain rounded border-2 border-green-300"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                        QR កូដបច្ចុប្បន្ន
                                    </span>
                                </div>
                                <p className="text-xs text-green-700">
                                    បញ្ចូលរូបថ្មីដើម្បីជំនួស
                                </p>
                                {qrPreview && (
                                    <a
                                        href={qrPreview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-600 hover:text-green-700 underline mt-1 inline-block"
                                    >
                                        មើលទំហំពេញ →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Show new QR code preview */}
                {newQrSelected && qrPreview && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 relative">
                                <img
                                    src={qrPreview}
                                    alt="QR កូដថ្មី"
                                    className="h-24 w-24 object-contain rounded border-2 border-blue-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeQr}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition shadow-lg"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        បានជ្រើសរើស QR កូដថ្មី
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700">
                                    នឹងជំនួស QR កូដបច្ចុប្បន្នពេលរក្សាទុក
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* File input */}
                <input
                    ref={fileInputRef}
                    id="payment_qr_code_file"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFile}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 cursor-pointer
                        border border-gray-300 rounded-md"
                />

                {errors.payment_qr_code && (
                    <p className="text-sm text-red-600 mt-2">{errors.payment_qr_code}</p>
                )}

                {!hasExistingQr && !newQrSelected && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <FileIcon className="h-3 w-3" />
                        មិនទាន់មាន QR កូដទេ
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    type="button"
                    disabled={processing}
                >
                    បោះបង់
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[120px]"
                >
                    {processing ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}
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
                    ✓ បានធ្វើបច្ចុប្បន្នភាពការកំណត់ការបង់ប្រាក់ដោយជោគជ័យ!
                </p>
            </Transition>
        </form>
    );
}
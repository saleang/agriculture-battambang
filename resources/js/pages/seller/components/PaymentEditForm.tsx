// components/PaymentEditForm.tsx (renamed from provided payment_info.tsx, adjusted to be a full form with useForm and submit)
import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

interface PaymentEditFormProps {
    onClose: () => void;
}

export default function PaymentEditForm({ onClose }: PaymentEditFormProps) {
    const { seller } = usePage<any>().props;
    const [qrPreview, setQrPreview] = useState<string | null>(seller?.payment_qr_code || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        bank_account_name: seller?.bank_account_name || '',
        bank_account_number: seller?.bank_account_number || '',
        payment_qr_code: null as File | string | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof typeof data, value);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setData('payment_qr_code', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQr = () => {
        setData('payment_qr_code', null);
        setQrPreview(seller?.payment_qr_code || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/seller/payment_info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                <p className="text-sm text-gray-600 mt-1">Configure your payment information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Bank Account Name</Label>
                    <Input
                        id="bank_account_name"
                        name="bank_account_name"
                        type="text"
                        value={data.bank_account_name}
                        onChange={handleChange}
                        placeholder="Enter account name (optional)"
                    />
                    <InputError className="mt-1" message={errors.bank_account_name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Bank Account Number</Label>
                    <Input
                        id="bank_account_number"
                        name="bank_account_number"
                        type="text"
                        value={data.bank_account_number}
                        onChange={handleChange}
                        placeholder="Enter account number (optional)"
                    />
                    <InputError className="mt-1" message={errors.bank_account_number} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="payment_qr_code">Payment QR Code URL</Label>
                <Input
                    id="payment_qr_code"
                    name="payment_qr_code"
                    type="url"
                    value={typeof data.payment_qr_code === 'string' ? data.payment_qr_code : ''}
                    onChange={handleChange}
                    placeholder="Enter QR code URL (optional)"
                />
                <InputError className="mt-1" message={errors.payment_qr_code} />
                <div className="mt-2">
                    <Label htmlFor="payment_qr_code_file">Or upload QR Code image</Label>
                    {qrPreview && (
                        <div className="relative mt-2">
                            <img src={qrPreview} alt="QR Code" className="max-h-32 rounded border" />
                            <button
                                type="button"
                                onClick={removeQr}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        id="payment_qr_code_file"
                        name="payment_qr_code"
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="block w-full text-sm text-gray-500 mt-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600 font-medium">
                        ✓ Saved successfully!
                    </p>
                </Transition>
            </div>
        </form>
    );
}
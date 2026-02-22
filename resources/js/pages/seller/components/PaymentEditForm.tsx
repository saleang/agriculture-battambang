// components/PaymentEditForm.tsx - ភាសាខ្មែរពេញលេញ
import React from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface PaymentEditFormProps {
    onClose: () => void;
}

export default function PaymentEditForm({ onClose }: PaymentEditFormProps) {
    const { seller } = usePage<any>().props;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        bank_account_name: seller?.bank_account_name || '',
        bank_account_number: seller?.bank_account_number || '',
        payment_qr_code: seller?.payment_qr_code || '',
        _method: 'PATCH',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof typeof data, value);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/seller/payment_info', {
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

            {/* Shop/Farm Name */}
            <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="payment_qr_code">ឈ្មោះហាង / ស្រែ</Label>
                <Input
                    id="payment_qr_code"
                    name="payment_qr_code"
                    type="text"
                    value={data.payment_qr_code}
                    onChange={handleChange}
                    placeholder="បញ្ចូលឈ្មោះហាង ឬ ស្រែ"
                    //  placeholder="Enter shop/farm name (ASCII only)"
                />
                {errors.payment_qr_code && (
                    <p className="text-sm text-red-600">{errors.payment_qr_code}</p>
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

import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import PaymentEditForm from './components/PaymentEditForm';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface PageProps extends InertiaPageProps {
    seller: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ការកំណត់ការបង់ប្រាក់',
        href: '/seller/payment_info',
    },
];

export default function PaymentInfo() {
    const { seller } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    // field now holds shop/farm name directly
    const shopName = seller?.payment_qr_code || null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ការបង់ប្រាក់" />

            <SellerLayout>
                <div className="space-y-6">
                    <div>
                         <h2 className="text-xl font-moul text-green-700 mb-2">ការកំណត់ការបង់ប្រាក់</h2>
                         <p className="text-base text-gray-500 mb-4">មើល និងគ្រប់គ្រងព័ត៌មានការបង់ប្រាក់របស់អ្នក</p>
                    </div>
                <div>
            
                </div>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Bank Account Name */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700">ឈ្មោះគណនីធនាគារ</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.bank_account_name || '-'}</div>
                        </div>

                        {/* Bank Account Number */}
                        <div className="pt-6 border-t">
                            <Label className="text-sm font-medium text-gray-700">លេខគណនីធនាគារ</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.bank_account_number || '-'}</div>
                        </div>

                        {/* Farm/Shop Name */}
                        {shopName && (
                            <div className="pt-6 border-t">
                                <Label className="text-sm font-medium text-gray-700">ឈ្មោះហាង / ស្រែ</Label>
                                <div className="mt-2 text-base text-gray-900">{shopName}</div>
                            </div>
                        )}

                        {/* Edit Button */}
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button onClick={() => setOpen(true)}
                               className="cursor-pointer bg-emerald-600 hover:bg-emerald-800 text-white border-none"
    >
                                កែសម្រួលការកំណត់ការបង់ប្រាក់
                            </Button>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/50"
                                onClick={() => setOpen(false)}
                            />
                            <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl">
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h3 className="text-lg font-semibold">កែសម្រួលការកំណត់ការបង់ប្រាក់</h3>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setOpen(false)}
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <PaymentEditForm onClose={() => setOpen(false)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </AppLayout>
    );
}

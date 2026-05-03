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
                <div className="min-h-screen bg-gray-50 py-6 font-khmer">
                    <div className="mx-auto max-w-6xl px-2 sm:px-3 lg:px-4">
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-moul text-xl text-gray-900">ការកំណត់ការបង់ប្រាក់</h2>
                                <p className="text-base text-gray-500 mt-1">មើល និងគ្រប់គ្រងព័ត៌មានការបង់ប្រាក់របស់អ្នក</p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                                {/* Bank Account Name */}
                                <div>
                                    <Label className="text-base font-medium text-gray-700">ឈ្មោះគណនីធនាគារ</Label>
                                    <div className="mt-1 text-base text-gray-900">{seller?.bank_account_name || '-'}</div>
                                </div>

                                {/* Bank Account Number */}
                                <div className="pt-6 border-t">
                                    <Label className="text-base font-medium text-gray-700">លេខគណនីធនាគារ</Label>
                                    <div className="mt-1 text-base text-gray-900">{seller?.bank_account_number || '-'}</div>
                                </div>

                                {/* Farm/Shop Name */}
                                {shopName && (
                                    <div className="pt-6 border-t">
                                        <Label className="text-base font-medium text-gray-700">ឈ្មោះហាង</Label>
                                        <div className="mt-2">
                                            {shopName.startsWith('http') ? (
                                                <img 
                                                    src={shopName} 
                                                    alt="QR Code" 
                                                    className="h-28 w-auto rounded-lg border border-gray-200 object-cover"
                                                />
                                            ) : (
                                                <div className="text-base text-gray-900">{shopName}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Edit Button */}
                                <div className="flex items-center gap-4 pt-6 border-t">
                                    <Button 
                                        onClick={() => setOpen(true)}
                                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none px-5 py-2.5 text-base"
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
                                            <h3 className="text-lg font-moul text-gray-900">កែសម្រួលការកំណត់ការបង់ប្រាក់</h3>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setOpen(false)}
                                                size="sm"
                                                className="text-base"
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
                    </div>
                </div>
            </SellerLayout>
        </AppLayout>
    );
}
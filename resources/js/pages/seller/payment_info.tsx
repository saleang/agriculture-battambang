// payment_info.tsx (new page: implemented full payment page with show info and edit modal, using the provided Payment component renamed to PaymentEditForm)
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import PaymentEditForm from './components/PaymentEditForm'; // Renamed and adjusted the provided Payment component
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
interface PageProps extends InertiaPageProps{
    seller: any; // Adjust type as needed
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Settings',
        href: '/seller/payment_info',
    },
];

export default function PaymentInfo() {
    const { seller } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    const qrCodeUrl = seller?.payment_qr_code?.startsWith('http') 
        ? seller.payment_qr_code 
        : (seller?.payment_qr_code ? `/storage/${seller.payment_qr_code}` : null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Settings" />

            <SellerLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Payment Settings"
                        description="View and manage your payment details"
                    />

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Bank Account Name */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Bank Account Name</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.bank_account_name || '-'}</div>
                        </div>

                        {/* Bank Account Number */}
                        <div className="pt-6 border-t">
                            <Label className="text-sm font-medium text-gray-700">Bank Account Number</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.bank_account_number || '-'}</div>
                        </div>

                        {/* Payment QR Code */}
                        {qrCodeUrl && (
                            <div className="pt-6 border-t">
                                <Label className="text-sm font-medium text-gray-700">Payment QR Code</Label>
                                <div className="mt-2">
                                    <a
                                        href={qrCodeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <img
                                            src={qrCodeUrl}
                                            alt="Payment QR Code"
                                            className="max-h-40 rounded border-2 border-gray-200 hover:border-green-500 transition"
                                        />
                                    </a>
                                    <p className="text-xs text-gray-600 mt-1">Click to view full size</p>
                                </div>
                            </div>
                        )}

                        {/* Edit Button */}
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button onClick={() => setOpen(true)}>
                                Edit Payment Settings
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
                                    <h3 className="text-lg font-semibold">Edit Payment Settings</h3>
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
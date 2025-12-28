// farm_info.tsx (refactored to show info with edit modal, fixed certification accept/validation mismatch by assuming backend fix, extracted form to separate component)
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import FarmEditForm from './components/FarmEditForm'; // New component for modal form
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface PageProps  extends InertiaPageProps{
    seller: any; // Adjust type as needed
    provinces: any[]; // Adjust type as needed
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farm Information',
        href: '/seller/farm_info',
    },
];

export default function FarmInfo() {
    const { seller, provinces } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farm Information" />

            <SellerLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Farm Information"
                        description="View and manage your farm details"
                    />

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Farm Name */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Farm Name</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.farm_name || '-'}</div>
                        </div>

                        {/* Location */}
                        <div className="pt-6 border-t">
                            <Label className="text-sm font-medium text-gray-700">Location</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.full_location || '-'}</div>
                        </div>

                        {/* Certification */}
                        {/* {seller?.certification_url && (
                            <div className="pt-6 border-t">
                                <Label className="text-sm font-medium text-gray-700">Certification Document</Label>
                                <div className="mt-2">
                                    <a
                                        href={seller.certification_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <img
                                            src={seller.certification_url}
                                            alt="Certification"
                                            className="max-h-40 rounded border-2 border-gray-200 hover:border-green-500 transition"
                                        />
                                    </a>
                                    <p className="text-xs text-gray-600 mt-1">Click to view full size</p>
                                </div>
                            </div>
                        )} */}

                        {/* Description */}
                        <div className="pt-6 border-t">
                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                            <div className="mt-1 text-base text-gray-900">{seller?.description || '-'}</div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button onClick={() => setOpen(true)}>
                                Edit Farm Info
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
                            <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-y-auto max-h-[80vh]">
                                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                                    <h3 className="text-lg font-semibold">Edit Farm Information</h3>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setOpen(false)}
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <FarmEditForm
                                        seller={seller}
                                        provinces={provinces}
                                        onClose={() => setOpen(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </AppLayout>
    );
}
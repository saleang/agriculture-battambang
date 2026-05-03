import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import FarmEditForm from './components/FarmEditForm';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface PageProps extends InertiaPageProps {
    seller: any;
    provinces: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ព័ត៌មានហាង',
        href: '/seller/farm_info',
    },
];

export default function FarmInfo() {
    const { seller, provinces } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ព័ត៌មានហាង" />

            <SellerLayout>
                <div className="min-h-screen bg-gray-50 py-6 font-khmer">
                    <div className="mx-auto max-w-6xl px-2 sm:px-3 lg:px-4">
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-moul text-xl text-gray-900">ព័ត៌មានហាង</h2>
                                <p className="text-base text-gray-500 mt-1">មើល និងគ្រប់គ្រងព័ត៌មានហាងរបស់អ្នក</p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                                {/* Farm Name */}
                                <div>
                                    <Label className="text-base font-medium text-gray-700">ឈ្មោះហាង</Label>
                                    <div className="mt-1 text-base text-gray-900">{seller?.farm_name || '-'}</div>
                                </div>

                                {/* Location */}
                                <div className="pt-6 border-t">
                                    <Label className="text-base font-medium text-gray-700">ទីតាំង</Label>
                                    <div className="mt-1 text-base text-gray-900">{seller?.full_location || '-'}</div>
                                </div>

                                {/* Description */}
                                <div className="pt-6 border-t">
                                    <Label className="text-base font-medium text-gray-700">ការពិពណ៌នា</Label>
                                    <div className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{seller?.description || '-'}</div>
                                </div>

                                {/* Edit Button */}
                                <div className="flex items-center gap-4 pt-6 border-t">
                                    <Button 
                                        onClick={() => setOpen(true)}
                                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none px-5 py-2.5 text-base"
                                    >
                                        កែសម្រួលព័ត៌មានហាង
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
                                            <h3 className="text-lg font-moul text-gray-900">កែសម្រួលព័ត៌មានហាង</h3>
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
                    </div>
                </div>
            </SellerLayout>
        </AppLayout>
    );
}
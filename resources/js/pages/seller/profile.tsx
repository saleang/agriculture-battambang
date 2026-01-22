// profile.tsx (no major changes, but ensured consistency with modals)
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import SellerEditForm from './components/SellerEditForm';
import { User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/seller/profile',
    },
];

export default function SellerProfile() {
    const { auth, seller, provinces } = usePage<SharedData>().props as any;
    const [open, setOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SellerLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Manage your personal information"
                    />

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Photo Display */}
                        <div className="flex items-center gap-4 pb-6 border-b">
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {auth?.user?.photo_url ? (
                                    <img
                                        src={auth.user.photo_url}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{auth?.user?.username}</h3>
                                <p className="text-sm text-gray-600">{auth?.user?.email}</p>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">គោត្តនាម និងនាម</Label>
                                <div className="mt-1 text-base text-gray-900">{auth?.user?.username || '-'}</div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">អ៊ីមែល</Label>
                                <div className="mt-1 text-base text-gray-900">{auth?.user?.email || '-'}</div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">លេខទូរស័ព្ទ</Label>
                                <div className="mt-1 text-base text-gray-900">{auth?.user?.phone || '-'}</div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">ភេទ</Label>
                                <div className="mt-1 text-base text-gray-900">
                                    {auth?.user?.gender === 'male' ? 'ប្រុស' : 
                                    auth?.user?.gender === 'female' ? 'ស្រី' : 
                                    auth?.user?.gender === 'other' ? 'ផ្សេងទៀត' : 
                                    '-'}
                                </div>
                            </div>
                        </div>

                        {/* Certification Display */}
                        {seller?.certification_url && (
                            <div className="pt-6 border-t">
                                <Label className="text-sm font-medium text-gray-700">
                                     ឯកសារ (អត្តសញ្ញាណប័ណ្ណអ្នកលក់ / វិញ្ញាបនប័ត្រ)
                                </Label>
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
                                    <p className="text-xs text-gray-600 mt-1">
                                        ចុចលើរូបភាពដើម្បីមើលទំហំពេញ
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Edit Button */}
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button onClick={() => setOpen(true)}>
                                កែប្រែព័ត៌មានប្រូហ្វាយល៍
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
                                    <h3 className="text-lg font-semibold">កែប្រែព័ត៌មានប្រូហ្វាយល៍</h3>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setOpen(false)}
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <SellerEditForm
                                        seller={seller}
                                        provinces={provinces}
                                        onClose={() => setOpen(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DeleteUser />
            </SellerLayout>
        </AppLayout>
    );
}
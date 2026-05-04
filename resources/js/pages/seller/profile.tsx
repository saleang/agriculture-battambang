// profile.tsx — Clean & Fixed Version

import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import {
    BadgeCheck,
    FileText,
    Mail,
    Pencil,
    Phone,
    User,
    Users,
    X, // ✅ fixed missing import
} from 'lucide-react';

import SellerEditForm from './components/SellerEditForm';
import SellerLayout from './layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ការកំណត់ប្រវត្តិរូប', href: '/seller/profile' },
];

function Row({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <Icon className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="w-40 shrink-0 text-xs text-gray-500">{label}</span>
            <span className="truncate text-sm font-medium text-gray-900">
                {value || (
                    <span className="text-xs font-normal text-gray-400 italic">
                        មិនបានបញ្ជាក់
                    </span>
                )}
            </span>
        </div>
    );
}

export default function SellerProfile() {
    const { auth, seller } = usePage<SharedData>().props as any;

    const [open, setOpen] = useState(false);
    const [currentSeller, setCurrentSeller] = useState(seller);
    const [currentAuth, setCurrentAuth] = useState(auth);

    // ✅ keep UI updated after save
    useEffect(() => {
        setCurrentSeller(seller);
        setCurrentAuth(auth);
    }, [seller, auth]);

    const genderLabel =
        currentAuth?.user?.gender === 'male'
            ? 'ប្រុស'
            : currentAuth?.user?.gender === 'female'
            ? 'ស្រី'
            : currentAuth?.user?.gender === 'other'
            ? 'មិនបញ្ជាក់'
            : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ប្រវត្តិរូប" />

            <SellerLayout>
                <div className="w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-moul mb-2 text-xl text-green-700">
                                ព័ត៌មានផ្ទាល់ខ្លួន
                            </h2>
                            <p className="text-base text-gray-500">
                                គ្រប់គ្រងទិន្នន័យគណនីរបស់អ្នក
                            </p>
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-1.5"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            កែប្រែ
                        </Button>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 rounded-lg border bg-white px-5 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                            {currentAuth?.user?.photo_url ? (
                                <img
                                    src={currentAuth.user.photo_url}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-5 w-5 text-gray-400" />
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                {currentSeller?.username ||
                                    currentAuth?.user?.username ||
                                    '—'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {currentSeller?.email ||
                                    currentAuth?.user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="divide-y rounded-lg border bg-white">
                        <Row
                            icon={User}
                            label="គោត្តនាម និងនាម"
                            value={
                                currentSeller?.username ||
                                currentAuth?.user?.username
                            }
                        />
                        <Row
                            icon={Mail}
                            label="អ៊ីមែល"
                            value={
                                currentSeller?.email ||
                                currentAuth?.user?.email
                            }
                        />
                        <Row
                            icon={Phone}
                            label="លេខទូរសព្ទ"
                            value={
                                currentSeller?.phone ||
                                currentAuth?.user?.phone
                            }
                        />
                        <Row
                            icon={Users}
                            label="ភេទ"
                            value={genderLabel}
                        />

                        {/* Certification */}
                        {currentSeller?.certification_url && (
                            <div className="flex items-start gap-3 px-5 py-4">
                                <FileText className="h-4 w-4 text-gray-400" />

                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-2">
                                        ឯកសារអត្តសញ្ញាណ / វិញ្ញាបនបត្រ
                                    </p>

                                    <a
                                        href={
                                            currentSeller.certification_url
                                        }
                                        target="_blank"
                                        className="group"
                                    >
                                        <img
                                            src={
                                                currentSeller.certification_url
                                            }
                                            className="h-28 rounded border"
                                        />
                                        <p className="text-xs text-gray-400 group-hover:text-green-600">
                                            មើលឯកសារ →
                                        </p>
                                    </a>
                                </div>

                                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                    <BadgeCheck className="h-3 w-3" />
                                    បានផ្ទុក
                                </span>
                            </div>
                        )}
                    </div>

                    <DeleteUser />
                </div>

                {/* Modal */}
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={() => setOpen(false)}
                        />

                        <div className="relative bg-white rounded-xl w-full max-w-xl shadow-xl">
                            <div className="flex justify-between p-4 border-b">
                                <h3 className="text-sm font-moul">
                                    កែប្រែព័ត៌មាន
                                </h3>

                                <button onClick={() => setOpen(false)}>
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6">
                                <SellerEditForm
                                    seller={currentSeller}
                                    provinces={[]}
                                    onClose={() => setOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </SellerLayout>
        </AppLayout>
    );
}
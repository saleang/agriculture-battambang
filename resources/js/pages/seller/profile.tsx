// profile.tsx — Real settings page, grounded layout
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

    const genderLabel =
        auth?.user?.gender === 'male'
            ? 'ប្រុស'
            : auth?.user?.gender === 'female'
              ? 'ស្រី'
              : auth?.user?.gender === 'other'
                ? 'មិនបញ្ជាក់'
                : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ប្រវត្តិរូប" />

            <SellerLayout>
                <div className="w-full space-y-6">
                    {/* Section heading */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-moul mb-2 text-xl text-green-700">
                                ព័ត៌មានផ្ទាល់ខ្លួន
                            </h2>
                            <p className="mt-0.5 text-base text-gray-500">
                                គ្រប់គ្រងទិន្នន័យគណនីរបស់អ្នក
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpen(true)}
                            className="flex cursor-pointer items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            កែប្រែ
                        </Button>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                            {auth?.user?.photo_url ? (
                                <img
                                    src={auth.user.photo_url}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {auth?.user?.username || '—'}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                {auth?.user?.email || ''}
                            </p>
                        </div>
                    </div>

                    {/* Info table */}
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <Row
                            icon={User}
                            label="គោត្តនាម និងនាម"
                            value={auth?.user?.username}
                        />
                        <Row
                            icon={Mail}
                            label="អ៊ីមែល"
                            value={auth?.user?.email}
                        />
                        <Row
                            icon={Phone}
                            label="លេខទូរសព្ទ"
                            value={auth?.user?.phone}
                        />
                        <Row icon={Users} label="ភេទ" value={genderLabel} />

                        {seller?.certification_url && (
                            <div className="flex items-start gap-3 px-5 py-4">
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                <div className="min-w-0 flex-1">
                                    <p className="mb-2 text-xs text-gray-500">
                                        ឯកសារអត្តសញ្ញាណ / វិញ្ញាបនបត្រ
                                    </p>
                                    <a
                                        href={seller.certification_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex flex-col"
                                    >
                                        <img
                                            src={seller.certification_url}
                                            alt="Certification"
                                            className="h-28 w-auto rounded-md border border-gray-200 object-cover shadow-sm transition group-hover:shadow group-hover:brightness-95"
                                        />
                                        <span className="mt-1 text-xs text-gray-400 transition-colors group-hover:text-emerald-600">
                                            មើលឯកសារ →
                                        </span>
                                    </a>
                                </div>
                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    <BadgeCheck className="h-3 w-3" /> បានផ្ទុក
                                </span>
                            </div>
                        )}
                    </div>

                    <DeleteUser />
                </div>

                {/* Edit Modal */}
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={() => setOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h3 className="font-moul text-sm text-gray-900">
                                        កែប្រែព័ត៌មានប្រវត្តិរូប
                                    </h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                <SellerEditForm
                                    seller={seller}
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

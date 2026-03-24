// profile.tsx — Real settings page, grounded layout
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import SellerEditForm from './components/SellerEditForm';
import { User, Mail, Phone, Users, FileText, Pencil, BadgeCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ការកំណត់ប្រូហ្វាល់', href: '/seller/profile' },
];

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <Icon className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="w-40 shrink-0 text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-900 font-medium truncate">
                {value || <span className="font-normal text-gray-400 italic text-xs">មិនបានបញ្ជាក់</span>}
            </span>
        </div>
    );
}

export default function SellerProfile() {
    const { auth, seller } = usePage<SharedData>().props as any;
    const [open, setOpen] = useState(false);

    const genderLabel =
        auth?.user?.gender === 'male'   ? 'ប្រុស' :
        auth?.user?.gender === 'female' ? 'ស្រី'  :
        auth?.user?.gender === 'other'  ? 'មិនបញ្ជាក់' : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ប្រូហ្វាល់" />

            <SellerLayout>
                <div className="space-y-6 max-w-2xl">

                    {/* Section heading */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
                            <p className="text-sm text-gray-500 mt-0.5">គ្រប់គ្រងទិន្នន័យគណនីរបស់អ្នក</p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            កែប្រែ
                        </Button>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                            {auth?.user?.photo_url ? (
                                <img src={auth.user.photo_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{auth?.user?.username || '—'}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{auth?.user?.email || ''}</p>
                        </div>
                    </div>

                    {/* Info table */}
                    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
                        <Row icon={User}  label="គោត្តនាម និងនាម" value={auth?.user?.username} />
                        <Row icon={Mail}  label="អ៊ីមែល"           value={auth?.user?.email} />
                        <Row icon={Phone} label="លេខទូរស័ព្ទ"     value={auth?.user?.phone} />
                        <Row icon={Users} label="ភេទ"              value={genderLabel} />

                        {seller?.certification_url && (
                            <div className="flex items-start gap-3 px-5 py-4">
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 mb-2">ឯកសារអត្តសញ្ញាណ / វិញ្ញាបនប័ត្រ</p>
                                    <a
                                        href={seller.certification_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex flex-col"
                                    >
                                        <img
                                            src={seller.certification_url}
                                            alt="Certification"
                                            className="h-28 w-auto rounded-md border border-gray-200 object-cover shadow-sm
                                                       transition group-hover:shadow group-hover:brightness-95"
                                        />
                                        <span className="mt-1 text-xs text-gray-400 group-hover:text-emerald-600 transition-colors">
                                            មើលឯកសារ →
                                        </span>
                                    </a>
                                </div>
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shrink-0">
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
                        <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                        <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">កែប្រែព័ត៌មានប្រូហ្វាយល៍</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក</p>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400
                                               hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
// profile.tsx — Fixed to show updated data after save
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import SellerEditForm from './components/SellerEditForm';
import { User, Mail, Phone, Users, FileText, Pencil, BadgeCheck, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ការកំណត់ប្រវត្តិរូប', href: '/seller/profile' },
];

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <Icon className="h-5 w-5 shrink-0 text-gray-400" />
            <span className="w-40 shrink-0 text-base text-gray-500">{label}</span>
            <span className="text-base text-gray-900 font-medium truncate">
                {value || <span className="font-normal text-gray-400 italic">មិនបានបញ្ជាក់</span>}
            </span>
        </div>
    );
}

export default function SellerProfile() {
    const { auth, seller } = usePage<SharedData>().props as any;
    const [open, setOpen] = useState(false);
    const [currentSeller, setCurrentSeller] = useState(seller);
    const [currentAuth, setCurrentAuth] = useState(auth);

    // Update local state when page props change
    useEffect(() => {
        setCurrentSeller(seller);
        setCurrentAuth(auth);
    }, [seller, auth]);

    const genderLabel =
        currentSeller?.gender === 'male'   ? 'ប្រុស' :
        currentSeller?.gender === 'female' ? 'ស្រី'  :
        currentSeller?.gender === 'other'  ? 'មិនបញ្ជាក់' : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ប្រវត្តិរូប" />

            <SellerLayout>
                <div className="min-h-screen bg-gray-50 py-6 font-khmer">
                    <div className="mx-auto max-w-6xl px-2 sm:px-3 lg:px-4">
                        <div className="space-y-6 w-full">

                            {/* Section heading */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-moul text-gray-900">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
                                    <p className="text-base text-gray-500 mt-1">គ្រប់គ្រងទិន្នន័យគណនីរបស់អ្នក</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOpen(true)}
                                    className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer px-4 py-2 text-base"
                                >
                                    <Pencil className="h-4 w-4" />
                                    កែប្រែ
                                </Button>
                            </div>

                            {/* Avatar + name */}
                            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                                    {currentAuth?.user?.photo_url ? (
                                        <img src={currentAuth.user.photo_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-semibold text-gray-900 truncate">{currentSeller?.username || currentAuth?.user?.username || '—'}</p>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">{currentSeller?.email || currentAuth?.user?.email || ''}</p>
                                </div>
                            </div>

                            {/* Info table */}
                            <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
                                <Row icon={User}  label="គោត្តនាម និងនាម" value={currentSeller?.username || currentAuth?.user?.username} />
                                <Row icon={Mail}  label="អ៊ីមែល"           value={currentSeller?.email || currentAuth?.user?.email} />
                                <Row icon={Phone} label="លេខទូរសព្ទ"     value={currentSeller?.phone || currentAuth?.user?.phone} />
                                <Row icon={Users} label="ភេទ"              value={genderLabel} />

                                {currentSeller?.certification_url && (
                                    <div className="flex items-start gap-3 px-5 py-4">
                                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-base text-gray-500 mb-2">ឯកសារអត្តសញ្ញាណ / វិញ្ញាបនបត្រ</p>
                                            <a
                                                href={currentSeller.certification_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex flex-col"
                                            >
                                                <img
                                                    src={currentSeller.certification_url}
                                                    alt="Certification"
                                                    className="h-28 w-auto rounded-md border border-gray-200 object-cover shadow-sm
                                                               transition group-hover:shadow group-hover:brightness-95"
                                                />
                                                <span className="mt-1 text-sm text-gray-400 group-hover:text-emerald-600 transition-colors">
                                                    មើលឯកសារ →
                                                </span>
                                            </a>
                                        </div>
                                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 shrink-0">
                                            <BadgeCheck className="h-4 w-4" /> បានផ្ទុក
                                        </span>
                                    </div>
                                )}
                            </div>

                            <DeleteUser />
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                        <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h3 className="text-lg font-moul text-gray-900">កែប្រែព័ត៌មានប្រវត្តិរូប</h3>
                                    <p className="text-base text-gray-500 mt-0.5">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក</p>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400
                                               hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
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
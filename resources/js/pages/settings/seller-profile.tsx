import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea'; // Fixed import
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { route } from '@/lib/route';

const breadcrumbs = [
    {
        title: 'Seller Profile Settings',
        href: route('seller.profile.edit'), // Use route() helper instead
    },
];

export default function SellerProfile({
    seller,
}: {
    seller: {
        farm_name: string;
        location_district: string;
        certification: string | null;
        description: string | null;
        bank_account_name: string | null;
        bank_account_number: string | null;
        payment_qr_code: string | null;
    };
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Profile Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Seller Profile Information"
                        description="Update your farm and payment details"
                    />

                    <Form
                        method="patch"
                        action={route('seller.profile.update')} // Use route() helper
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="farm_name">Farm Name</Label>
                                    <Input
                                        id="farm_name"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.farm_name}
                                        name="farm_name"
                                        required
                                        placeholder="Farm Name"
                                    />
                                    <InputError className="mt-2" message={errors.farm_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="location_district">Location District</Label>
                                    <Input
                                        id="location_district"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.location_district}
                                        name="location_district"
                                        required
                                        placeholder="Location District"
                                    />
                                    <InputError className="mt-2" message={errors.location_district} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="certification">Certification</Label>
                                    <Input
                                        id="certification"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.certification ?? ''}
                                        name="certification"
                                        placeholder="Certification (optional)"
                                    />
                                    <InputError className="mt-2" message={errors.certification} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.description ?? ''}
                                        name="description"
                                        placeholder="Farm Description (optional)"
                                    />
                                    <InputError className="mt-2" message={errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account_name">Bank Account Name</Label>
                                    <Input
                                        id="bank_account_name"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.bank_account_name ?? ''}
                                        name="bank_account_name"
                                        placeholder="Bank Account Name (optional)"
                                    />
                                    <InputError className="mt-2" message={errors.bank_account_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account_number">Bank Account Number</Label>
                                    <Input
                                        id="bank_account_number"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.bank_account_number ?? ''}
                                        name="bank_account_number"
                                        placeholder="Bank Account Number (optional)"
                                    />
                                    <InputError className="mt-2" message={errors.bank_account_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_qr_code">Payment QR Code URL</Label>
                                    <Input
                                        id="payment_qr_code"
                                        className="mt-1 block w-full"
                                        defaultValue={seller.payment_qr_code ?? ''}
                                        name="payment_qr_code"
                                        placeholder="Payment QR Code URL (optional)"
                                    />
                                    <InputError className="mt-2" message={errors.payment_qr_code} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} data-test="update-seller-profile-button">
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

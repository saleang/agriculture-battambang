import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SellersLayout from '@/pages/seller/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/user-password';
import SellerPasswordController from '@/actions/App/Http/Controllers/Seller/SellerPasswordController';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ការកំណត់ពាក្យសម្ងាត់',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ពាក្យសម្ងាត់" />

            <SellersLayout>
                <div className="space-y-6">
                    <div>
                         <h2 className="text-xl font-moul text-green-700 mb-2">ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់</h2>
                         <p className="text-base text-gray-500 mb-4">ត្រូវប្រាកដថាគណនីរបស់អ្នកកំពុងប្រើពាក្យសម្ងាត់វែង និងចៃដន្យ ដើម្បីរក្សាសុវត្ថិភាព</p>
                    </div>

                    <Form
                        {...SellerPasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        ពាក្យសម្ងាត់បច្ចុប្បន្ន
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            className="mt-1 block w-full"
                                            autoComplete="current-password"
                                            placeholder="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400"
                                            onClick={toggleCurrentPasswordVisibility}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        ពាក្យសម្ងាត់ថ្មី
                                    </Label>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="ពាក្យសម្ងាត់ថ្មី"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        បញ្ជាក់ពាក្យសម្ងាត់
                                    </Label>

                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-800 text-white border-none">
                                        រក្សាទុកពាក្យសម្ងាត់
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            បានរក្សាទុក
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SellersLayout>
        </AppLayout>
    );
}
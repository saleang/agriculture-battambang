// import { login } from '@/routes';
// import { store } from '@/routes/register';
// import { Form, Head } from '@inertiajs/react';

// import InputError from '@/components/input-error';
// import TextLink from '@/components/text-link';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Spinner } from '@/components/ui/spinner';
// import AuthLayout from '@/layouts/auth-layout';

// export default function Register() {
//     return (
//         <AuthLayout
//             title="Create an account"
//             description="Enter your details below to create your account"
//         >
//             <Head title="Register" />
//             <Form
//                 {...store.form()}
//                 resetOnSuccess={['password', 'password_confirmation']}
//                 disableWhileProcessing
//                 className="flex flex-col gap-6"
//             >
//                 {({ processing, errors }) => (
//                     <>
//                         <div className="grid gap-6">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="name">Name</Label>
//                                 <Input
//                                     id="name"
//                                     type="text"
//                                     required
//                                     autoFocus
//                                     tabIndex={1}
//                                     autoComplete="name"
//                                     name="name"
//                                     placeholder="Full name"
//                                 />
//                                 <InputError
//                                     message={errors.name}
//                                     className="mt-2"
//                                 />
//                             </div>

//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email address</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     required
//                                     tabIndex={2}
//                                     autoComplete="email"
//                                     name="email"
//                                     placeholder="email@example.com"
//                                 />
//                                 <InputError message={errors.email} />
//                             </div>

//                             <div className="grid gap-2">
//                                 <Label htmlFor="password">Password</Label>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     required
//                                     tabIndex={3}
//                                     autoComplete="new-password"
//                                     name="password"
//                                     placeholder="Password"
//                                 />
//                                 <InputError message={errors.password} />
//                             </div>

//                             <div className="grid gap-2">
//                                 <Label htmlFor="password_confirmation">
//                                     Confirm password
//                                 </Label>
//                                 <Input
//                                     id="password_confirmation"
//                                     type="password"
//                                     required
//                                     tabIndex={4}
//                                     autoComplete="new-password"
//                                     name="password_confirmation"
//                                     placeholder="Confirm password"
//                                 />
//                                 <InputError
//                                     message={errors.password_confirmation}
//                                 />
//                             </div>

//                             <Button
//                                 type="submit"
//                                 className="mt-2 w-full"
//                                 tabIndex={5}
//                                 data-test="register-user-button"
//                             >
//                                 {processing && <Spinner />}
//                                 Create account
//                             </Button>
//                         </div>

//                         <div className="text-center text-sm text-muted-foreground">
//                             Already have an account?{' '}
//                             <TextLink href={login()} tabIndex={6}>
//                                 Log in
//                             </TextLink>
//                         </div>
//                     </>
//                 )}
//             </Form>
//         </AuthLayout>
//     );
// }

import { FormEventHandler, useEffect, useState } from 'react';
import GuestLayout from '../../layouts/guest-layout';
import InputError from '../../components/input-error';
import InputLabel from '../../components/input-label';
import PrimaryButton from '../../components/primary-button';
import TextInput from '../../components/text-input';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer' as 'customer' | 'seller',
        phone: '',
        farm_name: '',
        location_district: '',
        description: '',
    });

    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleRoleChange = (role: 'customer' | 'seller') => {
        setData('role', role);
        setIsSeller(role === 'seller');
    };

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        console.log('Form submitted with data:', data);
        post('/register', {
            onError: (errors) => {
                console.error('Registration error:', errors);
            },
            onSuccess: () => {
                console.log('Registration successful');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Join AgriMarket Battambang
                </p>
            </div>

            <form onSubmit={submit}>
                {/* Role Selection */}
                <div className="mb-6">
                    <InputLabel value="Register as:" />
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('customer')}
                            className={`p-4 border-2 rounded-lg text-center transition ${
                                data.role === 'customer'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <div className="text-2xl mb-2">🛒</div>
                            <div className="font-semibold">Customer</div>
                            <div className="text-xs text-gray-600 mt-1">Buy products</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('seller')}
                            className={`p-4 border-2 rounded-lg text-center transition ${
                                data.role === 'seller'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <div className="text-2xl mb-2">🏪</div>
                            <div className="font-semibold">Seller</div>
                            <div className="text-xs text-gray-600 mt-1">Sell products</div>
                        </button>
                    </div>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                {/* Username */}
                <div>
                    <InputLabel htmlFor="username" value="Username" />
                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('username', e.target.value)}
                        required
                    />
                    <InputError message={errors.username} className="mt-2" />
                </div>

                {/* Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Phone */}
                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="Phone Number" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
                        required
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                {/* Seller Fields */}
                {isSeller && (
                    <>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Seller Information
                            </h3>
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="farm_name" value="Farm/Shop Name" />
                            <TextInput
                                id="farm_name"
                                name="farm_name"
                                value={data.farm_name}
                                className="mt-1 block w-full"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('farm_name', e.target.value)}
                                required={isSeller}
                            />
                            <InputError message={errors.farm_name} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="location_district" value="Location (District)" />
                            <TextInput
                                id="location_district"
                                name="location_district"
                                value={data.location_district}
                                className="mt-1 block w-full"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('location_district', e.target.value)}
                                required={isSeller}
                            />
                            <InputError message={errors.location_district} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="description" value="Description (Optional)" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                rows={3}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </>
                )}

                {/* Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-6">
                    <Link
                        href={'/login'}
                        className="underline text-sm text-gray-600 hover:text-gray-900"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

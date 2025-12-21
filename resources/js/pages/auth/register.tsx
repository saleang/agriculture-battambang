// import { login } from '@/routes';
// import { store } from '@/stores/auth/register';
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

// import { FormEventHandler, useEffect, useState } from 'react';
// import GuestLayout from '../../layouts/guest-layout';
// import InputError from '../../components/input-error';
// import InputLabel from '../../components/input-label';
// import PrimaryButton from '../../components/primary-button';
// import TextInput from '../../components/text-input';
// import { Head, Link, useForm } from '@inertiajs/react';

// export default function Register() {
//     const { data, setData, post, processing, errors, reset } = useForm({
//         username: '',
//         email: '',
//         password: '',
//         password_confirmation: '',
//         role: 'customer' as 'customer' | 'seller',
//         phone: '',
//         farm_name: '',
//         location_district: '',
//         description: '',
//     });

//     const [isSeller, setIsSeller] = useState(false);

//     useEffect(() => {
//         return () => {
//             reset('password', 'password_confirmation');
//         };
//     }, []);

//     const handleRoleChange = (role: 'customer' | 'seller') => {
//         setData('role', role);
//         setIsSeller(role === 'seller');
//     };

//     const submit: FormEventHandler<HTMLFormElement> = (e) => {
//         e.preventDefault();
//         console.log('Form submitted with data:', data);
//         post('/register', {
//             onError: (errors) => {
//                 console.error('Registration error:', errors);
//             },
//             onSuccess: () => {
//                 console.log('Registration successful');
//             },
//         });
//     };

//     return (
//         <GuestLayout>
//             <Head title="Register" />

//             <div className="mb-6 text-center">
//                 <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                     Join AgriMarket Battambang
//                 </p>
//             </div>

//             <form onSubmit={submit}>
//                 {/* Role Selection */}
//                 <div className="mb-6">
//                     <InputLabel value="Register as:" />
//                     <div className="mt-2 grid grid-cols-2 gap-4">
//                         <button
//                             type="button"
//                             onClick={() => handleRoleChange('customer')}
//                             className={`p-4 border-2 rounded-lg text-center transition ${
//                                 data.role === 'customer'
//                                     ? 'border-green-600 bg-green-50'
//                                     : 'border-gray-300 hover:border-gray-400'
//                             }`}
//                         >
//                             <div className="text-2xl mb-2">🛒</div>
//                             <div className="font-semibold">Customer</div>
//                             <div className="text-xs text-gray-600 mt-1">Buy products</div>
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => handleRoleChange('seller')}
//                             className={`p-4 border-2 rounded-lg text-center transition ${
//                                 data.role === 'seller'
//                                     ? 'border-green-600 bg-green-50'
//                                     : 'border-gray-300 hover:border-gray-400'
//                             }`}
//                         >
//                             <div className="text-2xl mb-2">🏪</div>
//                             <div className="font-semibold">Seller</div>
//                             <div className="text-xs text-gray-600 mt-1">Sell products</div>
//                         </button>
//                     </div>
//                     <InputError message={errors.role} className="mt-2" />
//                 </div>

//                 {/* Username */}
//                 <div>
//                     <InputLabel htmlFor="username" value="Username" />
//                     <TextInput
//                         id="username"
//                         name="username"
//                         value={data.username}
//                         className="mt-1 block w-full"
//                         autoComplete="username"
//                         isFocused={true}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('username', e.target.value)}
//                         required
//                     />
//                     <InputError message={errors.username} className="mt-2" />
//                 </div>

//                 {/* Email */}
//                 <div className="mt-4">
//                     <InputLabel htmlFor="email" value="Email" />
//                     <TextInput
//                         id="email"
//                         type="email"
//                         name="email"
//                         value={data.email}
//                         className="mt-1 block w-full"
//                         autoComplete="email"
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
//                         required
//                     />
//                     <InputError message={errors.email} className="mt-2" />
//                 </div>

//                 {/* Phone */}
//                 <div className="mt-4">
//                     <InputLabel htmlFor="phone" value="Phone Number" />
//                     <TextInput
//                         id="phone"
//                         type="tel"
//                         name="phone"
//                         value={data.phone}
//                         className="mt-1 block w-full"
//                         autoComplete="tel"
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
//                         required
//                     />
//                     <InputError message={errors.phone} className="mt-2" />
//                 </div>

//                 {/* Seller Fields */}
//                 {isSeller && (
//                     <>
//                         <div className="mt-6 pt-4 border-t border-gray-200">
//                             <h3 className="font-semibold text-gray-900 mb-4">
//                                 Seller Information
//                             </h3>
//                         </div>

//                         <div className="mt-4">
//                             <InputLabel htmlFor="farm_name" value="Farm/Shop Name" />
//                             <TextInput
//                                 id="farm_name"
//                                 name="farm_name"
//                                 value={data.farm_name}
//                                 className="mt-1 block w-full"
//                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('farm_name', e.target.value)}
//                                 required={isSeller}
//                             />
//                             <InputError message={errors.farm_name} className="mt-2" />
//                         </div>

//                         <div className="mt-4">
//                             <InputLabel htmlFor="location_district" value="Location (District)" />
//                             <TextInput
//                                 id="location_district"
//                                 name="location_district"
//                                 value={data.location_district}
//                                 className="mt-1 block w-full"
//                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('location_district', e.target.value)}
//                                 required={isSeller}
//                             />
//                             <InputError message={errors.location_district} className="mt-2" />
//                         </div>

//                         <div className="mt-4">
//                             <InputLabel htmlFor="description" value="Description (Optional)" />
//                             <textarea
//                                 id="description"
//                                 name="description"
//                                 value={data.description}
//                                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
//                                 rows={3}
//                                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
//                             />
//                             <InputError message={errors.description} className="mt-2" />
//                         </div>
//                     </>
//                 )}

//                 {/* Password */}
//                 <div className="mt-4">
//                     <InputLabel htmlFor="password" value="Password" />
//                     <TextInput
//                         id="password"
//                         type="password"
//                         name="password"
//                         value={data.password}
//                         className="mt-1 block w-full"
//                         autoComplete="new-password"
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
//                         required
//                     />
//                     <InputError message={errors.password} className="mt-2" />
//                 </div>

//                 {/* Confirm Password */}
//                 <div className="mt-4">
//                     <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
//                     <TextInput
//                         id="password_confirmation"
//                         type="password"
//                         name="password_confirmation"
//                         value={data.password_confirmation}
//                         className="mt-1 block w-full"
//                         autoComplete="new-password"
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
//                         required
//                     />
//                     <InputError message={errors.password_confirmation} className="mt-2" />
//                 </div>

//                 <div className="flex items-center justify-end mt-6">
//                     <Link
//                         href={'/login'}
//                         className="underline text-sm text-gray-600 hover:text-gray-900"
//                     >
//                         Already registered?
//                     </Link>

//                     <PrimaryButton className="ms-4" disabled={processing}>
//                         Register
//                     </PrimaryButton>
//                 </div>
//             </form>
//         </GuestLayout>
//     );
// }

import { FormEventHandler, useEffect, useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const checkUsernameAvailability = async (username: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-username', { params: { username } });
    if (resp && resp.data && typeof resp.data.available !== 'undefined') return !!resp.data.available;
    return null;
  } catch (e) {
    console.error('checkUsernameAvailability error', e);
    return null;
  }
};

const checkEmailAvailability = async (email: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-email', { params: { email } });
    if (resp && resp.data && typeof resp.data.available !== 'undefined') return !!resp.data.available;
    return null;
  } catch (e) {
    console.error('checkEmailAvailability error', e);
    return null;
  }
};

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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');

  useEffect(() => {
    return () => {
      reset('password', 'password_confirmation');
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (data.username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailability(data.username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 800);

    return () => clearTimeout(timer);
  }, [data.username]);

  useEffect(() => {
    if (data.email.length === 0) {
      setEmailStatus('idle');
      return;
    }

    if (!validateEmail(data.email)) {
      setEmailStatus('invalid');
      return;
    }

    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkEmailAvailability(data.email);
      setEmailStatus(available ? 'valid' : 'taken');
    }, 800);

    return () => clearTimeout(timer);
  }, [data.email]);

  const handleRoleChange = (role: 'customer' | 'seller') => {
    setData('role', role);
    setIsSeller(role === 'seller');
  };

  const passwordsMatch = useMemo(() => {
    if (!data.password_confirmation) return null;
    return data.password === data.password_confirmation;
  }, [data.password, data.password_confirmation]);

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

  const ValidationIndicator = ({ status }: { status: string }) => {
    if (status === 'checking') {
      return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
    if (status === 'available' || status === 'valid') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status === 'taken' || status === 'invalid') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  return (
    <>
      <Head title="Register" />

      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">
                <span className="text-green-600">AgriMarket</span>
              </h1>
              <h1 className="text-2xl font-bold text-gray-900">Battambang</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create</h2>
              <h2 className="text-3xl font-bold text-gray-900">Your</h2>
              <h2 className="text-3xl font-bold text-gray-900">Account</h2>
              <div className="w-12 h-1 bg-green-600 mt-2"></div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-xl">f</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-xl">in</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-xl">G+</span>
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mb-6">or use your email account</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Register as:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('customer')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      data.role === 'customer'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-xl mb-1">🛒</div>
                    <div className="font-semibold text-sm">Customer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('seller')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      data.role === 'seller'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-xl mb-1">🏪</div>
                    <div className="font-semibold text-sm">Seller</div>
                  </button>
                </div>
                {errors.role && (
                  <p className="text-red-600 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Choose a username"
                    autoComplete="username"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={usernameStatus} />
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-red-600 text-xs mt-1">Username is already taken</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-green-600 text-xs mt-1">Username is available</p>
                )}
                {errors.username && (
                  <p className="text-red-600 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator status={emailStatus} />
                  </div>
                </div>
                {emailStatus === 'invalid' && (
                  <p className="text-red-600 text-xs mt-1">Please enter a valid email address</p>
                )}
                {emailStatus === 'taken' && (
                  <p className="text-red-600 text-xs mt-1">Email is already registered</p>
                )}
                {emailStatus === 'valid' && (
                  <p className="text-green-600 text-xs mt-1">Email is valid and available</p>
                )}
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+855 12 345 678"
                  autoComplete="tel"
                  required
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {isSeller && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-semibold text-gray-900">Seller Information</h3>

                  <div>
                    <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Farm/Shop Name
                    </label>
                    <input
                      id="farm_name"
                      name="farm_name"
                      type="text"
                      value={data.farm_name}
                      onChange={(e) => setData('farm_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={isSeller}
                    />
                    {errors.farm_name && (
                      <p className="text-red-600 text-xs mt-1">{errors.farm_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location_district" className="block text-sm font-medium text-gray-700 mb-1">
                      Location (District)
                    </label>
                    <input
                      id="location_district"
                      name="location_district"
                      type="text"
                      value={data.location_district}
                      onChange={(e) => setData('location_district', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={isSeller}
                    />
                    {errors.location_district && (
                      <p className="text-red-600 text-xs mt-1">{errors.location_district}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                {data.password_confirmation && passwordsMatch === false && (
                  <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                )}
                {data.password_confirmation && passwordsMatch === true && (
                  <p className="text-green-600 text-xs mt-1">Passwords match</p>
                )}
                {errors.password_confirmation && (
                  <p className="text-red-600 text-xs mt-1">{errors.password_confirmation}</p>
                )}
              </div>

              <div className="pt-2">
                <p className="text-center text-sm text-gray-600 mb-4">
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 underline">
                    Already registered?
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={processing || usernameStatus === 'taken' || emailStatus === 'taken' || emailStatus === 'invalid'}
                  className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-gray-500">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span className="mx-2">•</span>
              <a href="#" className="hover:underline">Terms & Conditions</a>
            </div>
          </div>
        </div>

        {/* Right Panel - Welcome Message */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 to-green-600 items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-4">Hello,</h2>
            <h2 className="text-5xl font-bold mb-6">Friend!</h2>
            <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
            <p className="text-xl mb-8 max-w-md mx-auto">
              Fill up personal information and start journey with us.
            </p>
            <Link
              href="/login"
              className="inline-block px-12 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-green-600 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

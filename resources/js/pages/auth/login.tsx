// import InputError from '@/components/input-error';
// import TextLink from '@/components/text-link';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Spinner } from '@/components/ui/spinner';
// import AuthLayout from '@/layouts/auth-layout';
// import { register } from '@/routes';
// import { store } from '@/routes/login';
// import { request } from '@/routes/password';
// import { Form, Head } from '@inertiajs/react';

// interface LoginProps {
//     status?: string;
//     canResetPassword: boolean;
//     canRegister: boolean;
// }

// export default function Login({
//     status,
//     canResetPassword,
//     canRegister,
// }: LoginProps) {
//     return (
//         <AuthLayout
//             title="Log in to your account"
//             description="Enter your email and password below to log in"
//         >
//             <Head title="Log in" />

//             <Form
//                 {...store.form()}
//                 resetOnSuccess={['password']}
//                 className="flex flex-col gap-6"
//             >
//                 {({ processing, errors }) => (
//                     <>
//                         <div className="grid gap-6">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email address</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     name="email"
//                                     required
//                                     autoFocus
//                                     tabIndex={1}
//                                     autoComplete="email"
//                                     placeholder="email@example.com"
//                                 />
//                                 <InputError message={errors.email} />
//                             </div>

//                             <div className="grid gap-2">
//                                 <div className="flex items-center">
//                                     <Label htmlFor="password">Password</Label>
//                                     {canResetPassword && (
//                                         <TextLink
//                                             href={request()}
//                                             className="ml-auto text-sm"
//                                             tabIndex={5}
//                                         >
//                                             Forgot password?
//                                         </TextLink>
//                                     )}
//                                 </div>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     name="password"
//                                     required
//                                     tabIndex={2}
//                                     autoComplete="current-password"
//                                     placeholder="Password"
//                                 />
//                                 <InputError message={errors.password} />
//                             </div>

//                             <div className="flex items-center space-x-3">
//                                 <Checkbox
//                                     id="remember"
//                                     name="remember"
//                                     tabIndex={3}
//                                 />
//                                 <Label htmlFor="remember">Remember me</Label>
//                             </div>

//                             <Button
//                                 type="submit"
//                                 className="mt-4 w-full"
//                                 tabIndex={4}
//                                 disabled={processing}
//                                 data-test="login-button"
//                             >
//                                 {processing && <Spinner />}
//                                 Log in
//                             </Button>
//                         </div>

//                         {canRegister && (
//                             <div className="text-center text-sm text-muted-foreground">
//                                 Don't have an account?{' '}
//                                 <TextLink href={register()} tabIndex={5}>
//                                     Sign up
//                                 </TextLink>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </Form>

//             {status && (
//                 <div className="mb-4 text-center text-sm font-medium text-green-600">
//                     {status}
//                 </div>
//             )}
//         </AuthLayout>
//     );
// }

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Log in" />

            <div className="min-h-screen flex">
                {/* Left Side - Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-40 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-20 left-40 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                        {/* Logo/Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">AgriConnect</h1>
                                    <p className="text-sm text-emerald-100">Farm Management System</p>
                                </div>
                            </div>
                        </div>

                        {/* Center Illustration Area */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-md">
                                {/* Illustration Placeholder - You can replace this with an actual SVG or image */}
                                <div className="relative">
                                    <div className="w-80 h-80 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                                                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
                                            <p className="text-emerald-100 text-lg">
                                                Manage your agricultural business with ease
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decorative Elements */}
                                    <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full"></div>
                                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full"></div>
                                    <div className="absolute top-1/2 -right-20 w-16 h-16 bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="text-sm text-emerald-100">
                            <p>© 2024 AgriConnect. Powered by Innovation.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-white">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden mb-8 text-center">
                            <div className="inline-flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                                </div>
                                <div className="text-left">
                                    <h1 className="text-2xl font-bold text-slate-900">AgriConnect</h1>
                                    <p className="text-sm text-slate-600">Farm Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Login</h2>
                            <p className="text-slate-600">Enter your credentials to access your account</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Field */}
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-2 block">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Mail size={18} className="text-slate-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="Enter your email"
                                                className="pl-11 pr-4 py-6 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                                    tabIndex={5}
                                                >
                                                    Forgot Password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Lock size={18} className="text-slate-400" />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="pl-11 pr-12 py-6 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-slate-300"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-slate-700 cursor-pointer">
                                            Remember me
                                        </Label>
                                    </div>

                                    {/* Login Button */}
                                    <Button
                                        type="submit"
                                        className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all hover:shadow-xl text-base"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Spinner />
                                                Logging in...
                                            </span>
                                        ) : (
                                            'Login to Wifi'
                                        )}
                                    </Button>

                                    {/* Register Link */}
                                    {canRegister && (
                                        <div className="text-center pt-4">
                                            <p className="text-slate-600">
                                                Don't have an account?{' '}
                                                <TextLink
                                                    href={register()}
                                                    tabIndex={5}
                                                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                                                >
                                                    Register Now
                                                </TextLink>
                                            </p>
                                        </div>
                                    )}

                                    {/* Terms and Support */}
                                    <div className="pt-6 border-t border-slate-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                                            <a href="#" className="hover:text-emerald-600 transition-colors">Terms and Services</a>
                                            <a href="#" className="hover:text-emerald-600 transition-colors">Have a problem? Contact us at support@agriconnect.com</a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}

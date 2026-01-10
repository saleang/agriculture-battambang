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

            <div
    className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
    style={{
        backgroundImage:
            "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')",
    }}
>
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-600">Template</h1>
            <h2 className="text-xl font-semibold text-gray-800 mt-2">
                Welcome back to Template
            </h2>
            {canRegister && (
                <p className="text-sm text-gray-500 mt-1">
                    New here?{' '}
                    <TextLink
                        href={register()}
                        className="text-emerald-600 font-medium hover:underline"
                    >
                        Create an account
                    </TextLink>
                </p>
            )}
        </div>

        {/* Status */}
        {status && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                {status}
            </div>
        )}

        <Form {...store.form()} resetOnSuccess={['password']} className="space-y-4">
            {({ processing, errors }) => (
                <>
                    {/* Email */}
                    <div>
                        <Label className="text-sm text-gray-700">Email</Label>
                        <Input
                            name="email"
                            type="email"
                            required
                            autoFocus
                            placeholder="Enter your email"
                            className="mt-1 rounded-lg"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm text-gray-700">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="text-xs text-emerald-600 hover:underline"
                                >
                                    Forgot your password?
                                </TextLink>
                            )}
                        </div>

                        <Input
                            name="password"
                            type="password"
                            required
                            placeholder="Enter your password"
                            className="mt-1 rounded-lg"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Sign in */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 text-white font-semibold"
                    >
                        {processing ? 'Signing in...' : 'Sign In'}
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <div className="flex-1 h-px bg-gray-200" />
                        or sign in with
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Social Buttons */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-lg flex gap-2"
                    >
                        <img
                            src="https://www.svgrepo.com/show/355037/google.svg"
                            className="w-5 h-5"
                        />
                        Google
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-lg flex gap-2"
                    >
                        <img
                            src="https://www.svgrepo.com/show/448224/facebook.svg"
                            className="w-5 h-5"
                        />
                        Facebook
                    </Button>
                </>
            )}
        </Form>
    </div>
</div>

        </>
    );
}

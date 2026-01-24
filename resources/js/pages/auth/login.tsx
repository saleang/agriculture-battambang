import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { useForm, Head } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
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

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
            onError: (errors) => {
                console.log('Login errors:', errors);
            },
        });
    };

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
                        <h1 className="text-2xl font-bold text-emerald-600">
                            សូមស្វាគមន៍មកកាន់វេទិកាកសិផលខេត្តបាត់ដំបង
                        </h1>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email/Phone Field */}
                        <div>
                            <Label htmlFor="email" className="text-sm text-gray-700 font-medium">
                                អ៊ីមែល ឬលេខទូរស័ព្ទ
                            </Label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="text"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="អ៊ីមែល ឬលេខទូរស័ព្ទរបស់អ្នក"
                                    className={`pl-10 rounded-lg ${
                                        errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                You can login with email or phone number
                            </p>
                            {errors.email && (
                                <div className="mt-2 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-sm text-gray-700 font-medium">
                                    ពាក្យសម្ងាត់
                                </Label>
                            </div>

                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="បំពេញពាក្យសម្ងាត់របស់អ្នក"
                                    className={`pl-10 pr-10 rounded-lg ${
                                        errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="mt-2 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <Label htmlFor="remember" className="text-sm text-gray-700 font-medium">
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-emerald-600 hover:underline"
                                    >
                                        ភ្លេចពាក្យសម្ងាត់?
                                    </TextLink>
                                )}
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                className="rounded"
                            />
                            <Label
                                htmlFor="remember"
                                className="ml-2 text-sm text-gray-600 cursor-pointer"
                            >
                                ចងចាំខ្ញុំ
                            </Label>
                        </div>

                        {/* Sign in Button */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner className="h-4 w-4" />
                                    កំពុងចូលគណនី...
                                </span>
                            ) : (
                                'ចូលគណនី'
                            )}
                        </Button>

                        <div className="text-center mb-6">
                            {canRegister && (
                                <p className="text-sm text-gray-500 mt-1">
                                    មិនទាន់បានចុះឈ្មោះ?{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-emerald-600 font-medium hover:underline"
                                    >
                                        ចុះឈ្មោះទីនេះ
                                    </TextLink>
                                </p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <div className="flex-1 h-px bg-gray-200" />
                            ឬចូលគណនីដោយប្រើ
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Social Buttons */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-lg flex gap-2 items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src="https://www.svgrepo.com/show/355037/google.svg"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-lg flex gap-2 items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src="https://www.svgrepo.com/show/448224/facebook.svg"
                                alt="Facebook"
                                className="w-5 h-5"
                            />
                            Facebook
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

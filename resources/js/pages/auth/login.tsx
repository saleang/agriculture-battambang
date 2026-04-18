import React from 'react';
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
import { Mail, Lock, Eye, EyeOff, Smartphone, Leaf, ChevronRight } from 'lucide-react';
import { useState } from 'react';
// This file is for the login page. It uses Inertia.js for form handling and Tailwind CSS for styling.
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
    const [isPhoneMode, setIsPhoneMode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="ចូលគណនី - កសិផលខេត្តបាត់ដំបង" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                {/* Main container - centered, limited width, no overflow */}
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:max-h-none">
                        {/* Left - Form (will be centered vertically on desktop) */}
                        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center min-h-[50vh] lg:min-h-0">
                            {/* Header */}
                            <div className="text-center mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full mb-3 mx-auto">
                                    <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">ចូលគណនី</h1>
                                <p className="text-gray-600 text-xs sm:text-sm">កសិផលស្រស់ៗពីខេត្តបាត់ដំបង</p>
                            </div>
                            {status && (
                                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs sm:text-sm rounded-lg border border-emerald-200 text-center">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Identifier */}
                                <div>
                                    <Label htmlFor="email" className="text-sm text-gray-700 font-medium mb-1.5 block">
                                        {isPhoneMode ? 'លេខទូរស័ព្ទ' : 'អ៊ីមែល'}
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {isPhoneMode ? <Smartphone className="h-5 w-5 text-gray-400" /> : <Mail className="h-5 w-5 text-gray-400" />}
                                        </div>
                                        <Input
                                            id="email"
                                            type={isPhoneMode ? "tel" : "email"}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoFocus
                                            placeholder={isPhoneMode ? "ឧ. 012345678" : "ឧ. example@email.com"}
                                            className={`pl-10 h-10 sm:h-11 rounded-lg text-sm ${
                                                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                            }`}
                                        />
                                    </div>
                                    {errors.email && <InputError message={errors.email} className="mt-1 text-xs" />}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <Label htmlFor="password" className="text-sm text-gray-700 font-medium">
                                            ពាក្យសម្ងាត់
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink href={request()} className="text-xs text-emerald-600 hover:underline">
                                                ភ្លេច?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className={`pl-10 pr-10 h-10 sm:h-11 rounded-lg text-sm ${
                                                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <InputError message={errors.password} className="mt-1 text-xs" />}
                                </div>

                                <div className="flex items-center">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', !!checked)}
                                        className="rounded border-gray-300 h-4 w-4"
                                    />
                                    <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                                        ចងចាំខ្ញុំ
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-10 sm:h-11 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium rounded-lg mt-2 text-sm sm:text-base"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner className="h-4 w-4 sm:h-5 sm:w-5" />
                                            កំពុងចូល...
                                        </span>
                                    ) : (
                                        'ចូលគណនី'
                                    )}
                                </Button>

                                {/* Social login - optional, kept small */}
                                <div className="pt-3">
                                    <div className="relative my-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white text-gray-500">ឬចូលដោយប្រើ</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-9 sm:h-10 rounded-lg border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
                                            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-4 h-4 mr-1.5" />
                                            Google
                                        </Button>
                                        <Button variant="outline" className="h-9 sm:h-10 rounded-lg border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
                                            <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-4 h-4 mr-1.5" />
                                            Facebook
                                        </Button>
                                    </div>
                                </div>

                                {canRegister && (
                                    <div className="text-center pt-3 text-sm">
                                        មិនទាន់មានគណនី?{' '}
                                        <TextLink href={register()} className="text-emerald-600 font-semibold hover:text-emerald-700">
                                            ចុះឈ្មោះឥឡូវនេះ <ChevronRight className="inline w-3 h-3" />
                                        </TextLink>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Right - Benefits (desktop only) */}
                        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8 xl:p-10 flex-col justify-between">
                            <div>
                                <h2 className="text-xl xl:text-2xl font-bold mb-6">ទិញផ្ទាល់ពីកសិករបាត់ដំបង</h2>

                                <div className="space-y-5 xl:space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                            <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-1">ផលិតផលសរីរាង្គ 100%</h3>
                                            <p className="text-white/85 text-xs sm:text-sm">គ្មានថ្នាំគីមី គ្មានសារធាតុរក្សាទុក</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-1">ទិញផ្ទាល់ពីកសិករ</h3>
                                            <p className="text-white/85 text-xs sm:text-sm">គ្មានឈ្មួញកណ្ដាល តម្លៃសមរម្យ</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-1">ការបង់ប្រាក់មានសុវត្ថិភាព</h3>
                                            <p className="text-white/85 text-xs sm:text-sm">ប្រព័ន្ធទូទាត់ឆ្លាតវៃ រហ័ស</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-white/10 p-4 rounded-lg">
                                <p className="text-xs sm:text-sm text-white/90">
                                    <strong>ចំណាំ៖</strong> ចូលគណនីដើម្បីទទួលបានការបញ្ចុះតម្លៃ 50% លើការបញ្ជាទិញដំបូង
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
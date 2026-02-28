// forgot-password.tsx
import React from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { useForm, Head } from '@inertiajs/react';
import { Mail, Leaf, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="ភ្លេចពាក្យសម្ងាត់ - កសិផលខេត្តបាត់ដំបង" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                {/* Main container - centered, limited width, no overflow */}
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[95vh] lg:max-h-none">
                        {/* Left - Form (will be centered vertically on desktop) */}
                        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center min-h-[50vh] lg:min-h-0">
                            {/* Header */}
                            <div className="text-center mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full mb-3 mx-auto">
                                    <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">ភ្លេចពាក្យសម្ងាត់?</h1>
                                <p className="text-gray-600 text-xs sm:text-sm">បញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានតំណកំណត់ពាក្យសម្ងាត់ឡើងវិញ</p>
                            </div>

                            {status && (
                                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs sm:text-sm rounded-lg border border-emerald-200 text-center">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <Label htmlFor="email" className="text-sm text-gray-700 font-medium mb-1.5 block">
                                        អ៊ីមែល
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoFocus
                                            placeholder="ឧ. example@email.com"
                                            className={`pl-10 h-10 sm:h-11 rounded-lg text-sm ${
                                                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                            }`}
                                        />
                                    </div>
                                    {errors.email && <InputError message={errors.email} className="mt-1 text-xs" />}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-10 sm:h-11 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium rounded-lg mt-2 text-sm sm:text-base"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner className="h-4 w-4 sm:h-5 sm:w-5" />
                                            កំពុងផ្ញើ...
                                        </span>
                                    ) : (
                                        'ផ្ញើតំណកំណត់ពាក្យសម្ងាត់'
                                    )}
                                </Button>

                                {/* Back to Login */}
                                <div className="text-center pt-3 text-sm">
                                    <TextLink 
                                        href={login()} 
                                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        ត្រឡប់ទៅចូលគណនីវិញ
                                    </TextLink>
                                </div>
                            </form>
                        </div>

                        {/* Right - Benefits (desktop only) - Same as login page */}
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
                                    <strong>ចំណាំ៖</strong> យើងនឹងផ្ញើតំណកំណត់ពាក្យសម្ងាត់ឡើងវិញទៅកាន់អ៊ីមែលរបស់អ្នក
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SellersLayout from '@/pages/seller/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    
    // State for password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // State for password validation
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if all password requirements are met
    const isPasswordValid = () => {
        return passwordStrength.length &&
               passwordStrength.uppercase &&
               passwordStrength.lowercase &&
               passwordStrength.number &&
               passwordStrength.specialChar &&
               passwordMatch &&
               password.length > 0;
    };

    // Check password strength
    const checkPasswordStrength = (pwd: string) => {
        setPasswordStrength({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            specialChar: /[^A-Za-z0-9]/.test(pwd),
        });
    };

    // Handle password change
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkPasswordStrength(newPassword);
        setShowPasswordValidation(true);
        
        // Check match with confirm password
        if (confirmPassword) {
            setPasswordMatch(newPassword === confirmPassword);
        }
    };

    // Handle confirm password change
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirm = e.target.value;
        setConfirmPassword(newConfirm);
        setPasswordMatch(password === newConfirm);
    };

    // Get strength color
    const getStrengthColor = () => {
        const strength = Object.values(passwordStrength).filter(Boolean).length;
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    // Get strength text
    const getStrengthText = () => {
        const strength = Object.values(passwordStrength).filter(Boolean).length;
        if (strength <= 2) return 'ខ្សោយ';
        if (strength <= 3) return 'មធ្យម';
        if (strength <= 4) return 'រឹងមាំ';
        return 'រឹងមាំខ្លាំង';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ពាក្យសម្ងាត់" />

            <SellersLayout>
                <div className="space-y-6">
                    <div>
                         <h2 className="font-moul text-base text-gray-900">ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់</h2>
                         <p className="text-sm text-gray-500 mb-4">ត្រូវប្រាកដថាគណនីរបស់អ្នកកំពុងប្រើពាក្យសម្ងាត់វែង និងចៃដន្យ ដើម្បីរក្សាសុវត្ថិភាព</p>
                    </div>

                    {/* Custom validation error message */}
                    {validationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {validationError}
                            </p>
                        </div>
                    )}

                    <Form
                        {...SellerPasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                            onBeforeSubmit: (data: any) => {
                                // Client-side validation before sending to server
                                const passwordValue = data.get('password');
                                const confirmValue = data.get('password_confirmation');
                                
                                const hasLength = passwordValue?.length >= 8;
                                const hasUppercase = /[A-Z]/.test(passwordValue);
                                const hasLowercase = /[a-z]/.test(passwordValue);
                                const hasNumber = /[0-9]/.test(passwordValue);
                                const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);
                                const doMatch = passwordValue === confirmValue;
                                
                                if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
                                    setValidationError('ពាក្យសម្ងាត់មិនបំពេញតាមតម្រូវការ (យ៉ាងតិច ៨ខ្ទង់ អក្សរធំ អក្សរតូច លេខ និងតួអក្សរពិសេស)');
                                    setTimeout(() => setValidationError(''), 5000);
                                    return false;
                                }
                                
                                if (!doMatch) {
                                    setValidationError('ពាក្យសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ');
                                    setTimeout(() => setValidationError(''), 5000);
                                    return false;
                                }
                                
                                setValidationError('');
                                setIsSubmitting(true);
                                return true;
                            }
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            setIsSubmitting(false);
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        onSuccess={() => {
                            setIsSubmitting(false);
                            // Reset form fields
                            setPassword('');
                            setConfirmPassword('');
                            setPasswordStrength({
                                length: false,
                                uppercase: false,
                                lowercase: false,
                                number: false,
                                specialChar: false,
                            });
                            setPasswordMatch(true);
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => {
                            const isProcessing = processing || isSubmitting;
                            const isButtonDisabled = isProcessing || !isPasswordValid();
                            
                            return (
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
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="mt-1 block w-full pr-10"
                                            autoComplete="current-password"
                                            placeholder="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        ពាក្យសម្ងាត់ថ្មី
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type={showNewPassword ? "text" : "password"}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className="mt-1 block w-full pr-10"
                                            autoComplete="new-password"
                                            placeholder="ពាក្យសម្ងាត់ថ្មី"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password Requirements */}
                                    {(showPasswordValidation || password.length > 0) && (
                                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-sm font-medium text-gray-700 mb-2">តម្រូវការពាក្យសម្ងាត់៖</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {passwordStrength.length ? 
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    }
                                                    <span className={passwordStrength.length ? 'text-green-700' : 'text-gray-600'}>
                                                        យ៉ាងតិច ៨ តួអក្សរ
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordStrength.uppercase ? 
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    }
                                                    <span className={passwordStrength.uppercase ? 'text-green-700' : 'text-gray-600'}>
                                                        អក្សរធំ (A-Z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordStrength.lowercase ? 
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    }
                                                    <span className={passwordStrength.lowercase ? 'text-green-700' : 'text-gray-600'}>
                                                        អក្សរតូច (a-z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordStrength.number ? 
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    }
                                                    <span className={passwordStrength.number ? 'text-green-700' : 'text-gray-600'}>
                                                        លេខ (0-9)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordStrength.specialChar ? 
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    }
                                                    <span className={passwordStrength.specialChar ? 'text-green-700' : 'text-gray-600'}>
                                                        តួអក្សរពិសេស (!@#$%^&*)
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Strength indicator */}
                                            {password.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-gray-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-500">កម្រិតរឹងមាំ៖</span>
                                                        <span className={`text-xs font-medium ${getStrengthColor().replace('bg-', 'text-').replace('500', '600')}`}>
                                                            {getStrengthText()}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-300 rounded-full ${getStrengthColor()}`}
                                                            style={{ width: `${(Object.values(passwordStrength).filter(Boolean).length / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        បញ្ជាក់ពាក្យសម្ងាត់
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            className={`mt-1 block w-full pr-10 ${!passwordMatch && confirmPassword.length > 0 ? 'border-red-500' : ''}`}
                                            autoComplete="new-password"
                                            placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password match indicator */}
                                    {confirmPassword.length > 0 && (
                                        <div className="mt-1 flex items-center gap-2">
                                            {passwordMatch ? (
                                                <>
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    <span className="text-xs text-green-600">ពាក្យសម្ងាត់ត្រូវគ្នា</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                    <span className="text-xs text-red-600">ពាក្យសម្ងាត់មិនត្រូវគ្នា</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={isButtonDisabled}
                                        data-test="update-password-button"
                                        className={`cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none ${
                                            isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                កំពុងរក្សាទុក...
                                            </span>
                                        ) : (
                                            'រក្សាទុកពាក្យសម្ងាត់'
                                        )}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            បានរក្សាទុក
                                        </p>
                                    </Transition>
                                </div>
                                
                                {/* Show requirements not met message */}
                                {!isPasswordValid() && password.length > 0 && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        សូមបំពេញតម្រូវការពាក្យសម្ងាត់ទាំងអស់ខាងលើ
                                    </p>
                                )}
                            </>
                        )}}
                    </Form>
                </div>
            </SellersLayout>
        </AppLayout>
    );
}
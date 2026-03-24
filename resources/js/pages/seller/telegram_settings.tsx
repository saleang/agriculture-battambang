import { Head, usePage, useForm } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SellerLayout from './layout';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface PageProps extends InertiaPageProps {
    seller: any;
}

export default function TelegramSettings() {
    const { seller } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        telegram_bot_token: seller?.telegram_bot_token || '',
        telegram_chat_id: seller?.telegram_chat_id || '',
        telegram_notifications_enabled: seller?.telegram_notifications_enabled ?? false,
        _method: 'PATCH',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setData(name as keyof typeof data, type === 'checkbox' ? checked : value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/telegram_settings', { preserveScroll: true });
    };

    const breadcrumbs = [
        { title: 'ការកំណត់ Telegram', href: '/seller/telegram_settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ការកំណត់ Telegram" />

            <SellerLayout>
                <div className="space-y-6 max-w-2xl">
                    <HeadingSmall
                        title="ការជូនដំណឹងតាម Telegram"
                        description="កំណត់រចនាសម្ព័ន្ធ Bot Token, Chat ID និងបើកការជូនដំណឹង"
                    />

                    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit}>

                            {/* Bot Token */}
                            <div className="px-5 py-4">
                                <Label htmlFor="telegram_bot_token" className="text-xs font-medium text-gray-700">
                                    Bot Token
                                </Label>
                                <Input
                                    id="telegram_bot_token"
                                    name="telegram_bot_token"
                                    type="text"
                                    value={data.telegram_bot_token}
                                    onChange={handleChange}
                                    placeholder="បញ្ចូល Bot Token (ស្រេចចិត្ត)"
                                    className="mt-1.5 h-9 text-sm"
                                />
                                {errors.telegram_bot_token && (
                                    <p className="mt-1 text-xs text-red-500">{errors.telegram_bot_token}</p>
                                )}
                            </div>

                            {/* Chat ID */}
                            <div className="px-5 py-4">
                                <Label htmlFor="telegram_chat_id" className="text-xs font-medium text-gray-700">
                                    Chat ID
                                </Label>
                                <Input
                                    id="telegram_chat_id"
                                    name="telegram_chat_id"
                                    type="text"
                                    value={data.telegram_chat_id}
                                    onChange={handleChange}
                                    placeholder="បញ្ចូល Chat ID (ស្រេចចិត្ត)"
                                    className="mt-1.5 h-9 text-sm"
                                />
                                {errors.telegram_chat_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.telegram_chat_id}</p>
                                )}
                            </div>

                            {/* Toggle */}
                            <div className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">បើកការជូនដំណឹង</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        ទទួលការជូនដំណឹងថ្មីៗតាម Telegram
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={data.telegram_notifications_enabled}
                                    onClick={() => setData('telegram_notifications_enabled', !data.telegram_notifications_enabled)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                                                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                                                ${data.telegram_notifications_enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
                                                    ${data.telegram_notifications_enabled ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                                {recentlySuccessful ? (
                                    <p className="text-xs text-emerald-600 font-medium">✓ ការកំណត់បានរក្សាទុករួចហើយ</p>
                                ) : (
                                    <span />
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gray-900 hover:bg-gray-800 text-white text-sm shadow-none min-w-[100px]"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            កំពុងរក្សា...
                                        </span>
                                    ) : 'រក្សាទុក'}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </SellerLayout>
        </AppLayout>
    );
}
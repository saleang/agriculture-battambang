import { Head, usePage, router, useForm } from '@inertiajs/react';
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
        post('/seller/telegram_settings', {
            preserveScroll: true,
            onSuccess: () => {
                // nothing extra
            },
        });
    };

    const breadcrumbs = [
        { title: 'ការកំណត់ Telegram', href: '/seller/telegram_settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Telegram Settings" />

            <SellerLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Telegram Notifications"
                        description="Configure your telegram webhook/token/chat and enable alerts"
                    />

                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="telegram_bot_token">Bot Token</Label>
                                <Input
                                    id="telegram_bot_token"
                                    name="telegram_bot_token"
                                    type="text"
                                    value={data.telegram_bot_token}
                                    onChange={handleChange}
                                    placeholder="Enter bot token (optional)"
                                />
                                {errors.telegram_bot_token && (
                                    <p className="text-sm text-red-600">
                                        {errors.telegram_bot_token}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telegram_chat_id">Chat ID</Label>
                                <Input
                                    id="telegram_chat_id"
                                    name="telegram_chat_id"
                                    type="text"
                                    value={data.telegram_chat_id}
                                    onChange={handleChange}
                                    placeholder="Enter chat id (optional)"
                                />
                                {errors.telegram_chat_id && (
                                    <p className="text-sm text-red-600">
                                        {errors.telegram_chat_id}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="telegram_notifications_enabled"
                                    name="telegram_notifications_enabled"
                                    type="checkbox"
                                    checked={data.telegram_notifications_enabled}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <Label htmlFor="telegram_notifications_enabled">
                                    Enable telegram notifications
                                </Label>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save settings'}
                                </Button>
                            </div>

                            {recentlySuccessful && (
                                <p className="text-sm text-green-600">
                                    Settings updated successfully.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </SellerLayout>
        </AppLayout>
    );
}

import { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SellerLayout from './layout';
import SettingsLayout from '@/layouts/settings/layout';

// Define interfaces for type safety
interface Province {
    province_id: number;
    name_en: string;
    name_km: string;
}

interface District {
    district_id: number;
    name_en: string;
    name_km?: string;
    province_id: number;
}

interface Commune {
    commune_id: number;
    name_en: string;
    name_km?: string;
    district_id: number;
}

interface Village {
    village_id: number;
    name_en: string;
    name_km?: string;
    commune_id: number;
}

interface Seller {
    seller_id: number;
    farm_name: string;
    province_id: number | null;
    district_id: number | null;
    commune_id: number | null;
    village_id: number | null;
    certification: string | null;
    description: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    payment_qr_code: string | null;
}

interface Props {
    seller: Seller;
    provinces?: Province[];
}

const breadcrumbs = [
    {
        title: 'Seller Profile',
        href: '/seller/profile',
    },
];

export default function SellerProfile({ seller, provinces = [] }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        farm_name: seller?.farm_name || '',
        province_id: seller?.province_id?.toString() || '',
        district_id: seller?.district_id?.toString() || '',
        commune_id: seller?.commune_id?.toString() || '',
        village_id: seller?.village_id?.toString() || '',
        certification: seller?.certification || '',
        description: seller?.description || '',
        bank_account_name: seller?.bank_account_name || '',
        bank_account_number: seller?.bank_account_number || '',
        payment_qr_code: seller?.payment_qr_code || '',
    });

    const [districts, setDistricts] = useState<District[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingCommunes, setLoadingCommunes] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Load districts when province changes
    useEffect(() => {
        if (data.province_id) {
            setLoadingDistricts(true);
            // Fixed: Use template literal instead of route helper
            axios
                .get(`/seller/districts/${data.province_id}`)
                .then((res) => {
                    setDistricts(res.data);
                    setCommunes([]);
                    setVillages([]);
                    setLoadingDistricts(false);
                })
                .catch((error) => {
                    console.error('Error loading districts:', error);
                    setLoadingDistricts(false);
                });
        } else {
            setDistricts([]);
            setCommunes([]);
            setVillages([]);
        }
    }, [data.province_id]);

    // Load communes when district changes
    useEffect(() => {
        if (data.district_id) {
            setLoadingCommunes(true);
            // Fixed: Use template literal instead of route helper
            axios
                .get(`/seller/communes/${data.district_id}`)
                .then((res) => {
                    setCommunes(res.data);
                    setVillages([]);
                    setLoadingCommunes(false);
                })
                .catch((error) => {
                    console.error('Error loading communes:', error);
                    setLoadingCommunes(false);
                });
        } else {
            setCommunes([]);
            setVillages([]);
        }
    }, [data.district_id]);

    // Load villages when commune changes
    useEffect(() => {
        if (data.commune_id) {
            setLoadingVillages(true);
            // Fixed: Use template literal instead of route helper
            axios
                .get(`/seller/villages/${data.commune_id}`)
                .then((res) => {
                    setVillages(res.data);
                    setLoadingVillages(false);
                })
                .catch((error) => {
                    console.error('Error loading villages:', error);
                    setLoadingVillages(false);
                });
        } else {
            setVillages([]);
        }
    }, [data.commune_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/seller/profile');
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setData(name as keyof typeof data, value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
            <Head title="Seller Profile Settings" />

            <div className="space-y-6">
                <HeadingSmall
                    title="Seller Profile Information"
                    description="Update your farm and payment details"
                />

                <form onSubmit={handleSubmit} className="space-y-8 rounded-lg bg-white p-6 shadow-md">
                    {/* Farm Information Section */}
                    <div className="space-y-6">
                        <div className="border-l-4 border-green-600 pl-4">
                            <h3 className="text-xl font-semibold text-gray-900">Farm Information</h3>
                            <p className="text-sm text-gray-600 mt-1">Tell us about your farm</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="farm_name">
                                    Farm Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="farm_name"
                                    name="farm_name"
                                    type="text"
                                    value={data.farm_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your farm name"
                                />
                                <InputError className="mt-1" message={errors.farm_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="certification">Certification</Label>
                                <Input
                                    id="certification"
                                    name="certification"
                                    type="text"
                                    value={data.certification}
                                    onChange={handleChange}
                                    placeholder="Enter certification (optional)"
                                />
                                <InputError className="mt-1" message={errors.certification} />
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h4 className="font-medium text-gray-900">Location Details</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="province_id">
                                        Province <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="province_id"
                                        name="province_id"
                                        value={data.province_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setData('district_id', '');
                                            setData('commune_id', '');
                                            setData('village_id', '');
                                        }}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map((province) => (
                                            <option key={province.province_id} value={province.province_id}>
                                                {province.name_en} ({province.name_km})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors.province_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district_id">
                                        District <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="district_id"
                                        name="district_id"
                                        value={data.district_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setData('commune_id', '');
                                            setData('village_id', '');
                                        }}
                                        required
                                        disabled={!data.province_id || loadingDistricts}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loadingDistricts ? 'Loading...' : 'Select District'}
                                        </option>
                                        {districts.map((district) => (
                                            <option key={district.district_id} value={district.district_id}>
                                                {district.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors.district_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="commune_id">
                                        Commune <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="commune_id"
                                        name="commune_id"
                                        value={data.commune_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setData('village_id', '');
                                        }}
                                        required
                                        disabled={!data.district_id || loadingCommunes}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loadingCommunes ? 'Loading...' : 'Select Commune'}
                                        </option>
                                        {communes.map((commune) => (
                                            <option key={commune.commune_id} value={commune.commune_id}>
                                                {commune.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors.commune_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="village_id">Village</Label>
                                    <select
                                        id="village_id"
                                        name="village_id"
                                        value={data.village_id}
                                        onChange={handleChange}
                                        disabled={!data.commune_id || loadingVillages}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loadingVillages ? 'Loading...' : 'Select Village (Optional)'}
                                        </option>
                                        {villages.map((village) => (
                                            <option key={village.village_id} value={village.village_id}>
                                                {village.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors.village_id} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Farm Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                                placeholder="Describe your farm and farming practices (optional)"
                            />
                            <InputError className="mt-1" message={errors.description} />
                        </div>
                    </div>

                    {/* Payment Details Section */}
                    <div className="space-y-6">
                        <div className="border-l-4 border-blue-600 pl-4">
                            <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                            <p className="text-sm text-gray-600 mt-1">Configure your payment information</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name">Bank Account Name</Label>
                                <Input
                                    id="bank_account_name"
                                    name="bank_account_name"
                                    type="text"
                                    value={data.bank_account_name}
                                    onChange={handleChange}
                                    placeholder="Enter account name (optional)"
                                />
                                <InputError className="mt-1" message={errors.bank_account_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bank_account_number">Bank Account Number</Label>
                                <Input
                                    id="bank_account_number"
                                    name="bank_account_number"
                                    type="text"
                                    value={data.bank_account_number}
                                    onChange={handleChange}
                                    placeholder="Enter account number (optional)"
                                />
                                <InputError className="mt-1" message={errors.bank_account_number} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_qr_code">Payment QR Code URL</Label>
                            <Input
                                id="payment_qr_code"
                                name="payment_qr_code"
                                type="url"
                                value={data.payment_qr_code}
                                onChange={handleChange}
                                placeholder="Enter QR code URL (optional)"
                            />
                            <InputError className="mt-1" message={errors.payment_qr_code} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={processing}
                            data-test="update-seller-profile-button"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600 font-medium">
                                ✓ Saved successfully!
                            </p>
                        </Transition>
                    </div>
                </form>
            </div>
            </SettingsLayout>
        </AppLayout>
    );
}

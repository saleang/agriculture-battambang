// components/FarmEditForm.tsx - ភាសាខ្មែរពេញលេញ
import React, { useEffect, useRef, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUp, X, CheckCircle, Upload, File } from 'lucide-react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface FarmEditFormProps {
    seller: any;
    provinces: any[];
    onClose: () => void;
}

interface District {
    district_id: number;
    name_km: string;
}

interface Commune {
    commune_id: number;
    name_km: string;
}

interface Village {
    village_id: number;
    name_km: string;
}

export default function FarmEditForm({ seller, provinces, onClose }: FarmEditFormProps) {
    const [districts, setDistricts] = useState<District[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        farm_name: seller?.farm_name || '',
        province_id: seller?.province_id?.toString() || '',
        district_id: seller?.district_id?.toString() || '',
        commune_id: seller?.commune_id?.toString() || '',
        village_id: seller?.village_id?.toString() || '',
        description: seller?.description || '',
        _method: 'PATCH',
    });

    useEffect(() => {
        if (seller?.province_id) {
            loadDistricts(seller.province_id);
        }
        if (seller?.district_id) {
            loadCommunes(seller.district_id);
        }
        if (seller?.commune_id) {
            loadVillages(seller.commune_id);
        }
    }, []);

    const loadDistricts = async (provinceId: number) => {
        try {
            const res = await axios.get(`/seller/districts/${provinceId}`);
            setDistricts(res.data);
        } catch (error) {
            console.error('Error loading districts:', error);
            toast.error('មិនអាចទាញយកស្រុក/ខណ្ឌបានទេ');
        }
    };

    const loadCommunes = async (districtId: number) => {
        try {
            const res = await axios.get(`/seller/communes/${districtId}`);
            setCommunes(res.data);
        } catch (error) {
            console.error('Error loading communes:', error);
            toast.error('មិនអាចទាញយកឃុំ/សង្កាត់បានទេ');
        }
    };

    const loadVillages = async (communeId: number) => {
        try {
            const res = await axios.get(`/seller/villages/${communeId}`);
            setVillages(res.data);
        } catch (error) {
            console.error('Error loading villages:', error);
            toast.error('មិនអាចទាញយកភូមិបានទេ');
        }
    };

    const handleProvinceChange = (provinceId: string) => {
        setData({
            ...data,
            province_id: provinceId,
            district_id: '',
            commune_id: '',
            village_id: '',
        });
        setDistricts([]);
        setCommunes([]);
        setVillages([]);
        if (provinceId) {
            loadDistricts(Number(provinceId));
        }
    };

    const handleDistrictChange = (districtId: string) => {
        setData({
            ...data,
            district_id: districtId,
            commune_id: '',
            village_id: '',
        });
        setCommunes([]);
        setVillages([]);
        if (districtId) {
            loadCommunes(Number(districtId));
        }
    };

    const handleCommuneChange = (communeId: string) => {
        setData({
            ...data,
            commune_id: communeId,
            village_id: '',
        });
        setVillages([]);
        if (communeId) {
            loadVillages(Number(communeId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/seller/farm_info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានកសិដ្ឋានដោយជោគជ័យ');
                router.reload({
                    only: ['seller'],
                    onSuccess: () => {
                        onClose();
                    },
                });
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('មិនអាចធ្វើបច្ចុប្បន្នភាពព័ត៌មានកសិដ្ឋានបានទេ');
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(firstError as string);
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Farm Name */}
            <div className="space-y-2">
                <Label htmlFor="farm_name">
                    ឈ្មោះកសិដ្ឋាន <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="farm_name"
                    value={data.farm_name}
                    onChange={(e) => setData('farm_name', e.target.value)}
                    required
                    placeholder="បញ្ចូលឈ្មោះកសិដ្ឋានរបស់អ្នក"
                />
                {errors.farm_name && (
                    <p className="text-sm text-red-600">{errors.farm_name}</p>
                )}
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-900">ព័ត៌មានទីតាំង</h4>
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Province */}
                    <div className="space-y-2">
                        <Label htmlFor="province_id">ខេត្ត</Label>
                        <select
                            id="province_id"
                            value={data.province_id}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">ជ្រើសរើសខេត្ត</option>
                            {provinces.map((p) => (
                                <option key={p.province_id} value={p.province_id}>
                                    {p.name_km}
                                </option>
                            ))}
                        </select>
                        {errors.province_id && (
                            <p className="text-sm text-red-600">{errors.province_id}</p>
                        )}
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <Label htmlFor="district_id">ស្រុក/ខណ្ឌ</Label>
                        <select
                            id="district_id"
                            value={data.district_id}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            disabled={!data.province_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">ជ្រើសរើសស្រុក/ខណ្ឌ</option>
                            {districts.map((d) => (
                                <option key={d.district_id} value={d.district_id}>
                                    {d.name_km}
                                </option>
                            ))}
                        </select>
                        {errors.district_id && (
                            <p className="text-sm text-red-600">{errors.district_id}</p>
                        )}
                    </div>

                    {/* Commune */}
                    <div className="space-y-2">
                        <Label htmlFor="commune_id">ឃុំ/សង្កាត់</Label>
                        <select
                            id="commune_id"
                            value={data.commune_id}
                            onChange={(e) => handleCommuneChange(e.target.value)}
                            disabled={!data.district_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">ជ្រើសរើសឃុំ/សង្កាត់</option>
                            {communes.map((c) => (
                                <option key={c.commune_id} value={c.commune_id}>
                                    {c.name_km}
                                </option>
                            ))}
                        </select>
                        {errors.commune_id && (
                            <p className="text-sm text-red-600">{errors.commune_id}</p>
                        )}
                    </div>

                    {/* Village */}
                    <div className="space-y-2">
                        <Label htmlFor="village_id">ភូមិ</Label>
                        <select
                            id="village_id"
                            value={data.village_id}
                            onChange={(e) => setData('village_id', e.target.value)}
                            disabled={!data.commune_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">ជ្រើសរើសភូមិ (ស្រេចចិត្ត)</option>
                            {villages.map((v) => (
                                <option key={v.village_id} value={v.village_id}>
                                    {v.name_km}
                                </option>
                            ))}
                        </select>
                        {errors.village_id && (
                            <p className="text-sm text-red-600">{errors.village_id}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">ការពិពណ៌នាកសិដ្ឋាន</Label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="ពិពណ៌នាអំពីកសិដ្ឋាន និងការដាំដុះរបស់អ្នក"
                />
                {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    type="button"
                    disabled={processing}
                >
                    បោះបង់
                </Button>
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="min-w-[120px]"
                >
                    {processing ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}
                </Button>
            </div>

            {/* Success Message */}
            <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0"
                leave="transition ease-in-out duration-300"
                leaveTo="opacity-0"
            >
                <p className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded">
                    ✓ បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានកសិដ្ឋានដោយជោគជ័យ!
                </p>
            </Transition>
        </form>
    );
}
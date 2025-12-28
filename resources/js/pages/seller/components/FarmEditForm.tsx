// components/FarmEditForm.tsx - FIXED VERSION
import React, { useEffect, useRef, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
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
    name_en: string;
}

interface Commune {
    commune_id: number;
    name_en: string;
}

interface Village {
    village_id: number;
    name_en: string;
}

export default function FarmEditForm({ seller, provinces, onClose }: FarmEditFormProps) {
    const [districts, setDistricts] = useState<District[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [certPreview, setCertPreview] = useState<string | null>(seller?.certification_url || null);
    const [hasExistingCert, setHasExistingCert] = useState<boolean>(!!seller?.certification_url);
    const [newCertSelected, setNewCertSelected] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        farm_name: seller?.farm_name || '',
        province_id: seller?.province_id?.toString() || '',
        district_id: seller?.district_id?.toString() || '',
        commune_id: seller?.commune_id?.toString() || '',
        village_id: seller?.village_id?.toString() || '',
        certification: null as File | null,
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
            toast.error('Failed to load districts');
        }
    };

    const loadCommunes = async (districtId: number) => {
        try {
            const res = await axios.get(`/seller/communes/${districtId}`);
            setCommunes(res.data);
        } catch (error) {
            console.error('Error loading communes:', error);
            toast.error('Failed to load communes');
        }
    };

    const loadVillages = async (communeId: number) => {
        try {
            const res = await axios.get(`/seller/villages/${communeId}`);
            setVillages(res.data);
        } catch (error) {
            console.error('Error loading villages:', error);
            toast.error('Failed to load villages');
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

    const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Certification file must be less than 5MB');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setData('certification', file);
            setNewCertSelected(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCertPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCertification = () => {
        setData('certification', null);
        setCertPreview(seller?.certification_url || null);
        setNewCertSelected(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/seller/farm_info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Farm information updated successfully');
                router.reload({
                    only: ['seller'],
                    // preserveState: true,
                    onSuccess: () => {
                        onClose();
                    },
                });
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update farm information');
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
                    Farm Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="farm_name"
                    value={data.farm_name}
                    onChange={(e) => setData('farm_name', e.target.value)}
                    required
                    placeholder="Enter your farm name"
                />
                {errors.farm_name && (
                    <p className="text-sm text-red-600">{errors.farm_name}</p>
                )}
            </div>

            {/* Certification Image Upload - IMPROVED */}
            {/* <div className="space-y-2">
                <Label>Certification Document (Optional)</Label>
                <p className="text-xs text-gray-600 mb-2">
                    Upload your ID card or certificate (JPG, PNG, PDF - max 5MB)
                </p>

                {/* Show existing certification */}
                {/* {hasExistingCert && !newCertSelected && ( */}
                    {/* // <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    //     <div className="flex items-start gap-3">
                    //         <div className="flex-shrink-0">
                    //             {certPreview && (
                    //                 <img 
                    //                     src={certPreview} 
                    //                     alt="Current Certification" 
                    //                     className="h-20 w-20 object-cover rounded border-2 border-green-300" 
                    //                 />
                    //             )}
                    //         </div>
                    //         <div className="flex-1 min-w-0">
                    //             <div className="flex items-center gap-2 mb-1">
                    //                 <CheckCircle className="h-4 w-4 text-green-600" />
                    //                 <span className="text-sm font-medium text-green-900">
                    //                     Current Certification
                    //                 </span>
                    //             </div>
                    //             <p className="text-xs text-green-700">
                    //                 Upload a new file to replace it.
                    //             </p>
                    //         </div>
                    //     </div>
                    // </div> 
                )}

                {/* Show new certification preview */}
                {/* {newCertSelected && certPreview && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 relative">
                                <img 
                                    src={certPreview} 
                                    alt="New Certification" 
                                    className="h-20 w-20 object-cover rounded border-2 border-blue-300" 
                                />
                                <button
                                    type="button"
                                    onClick={removeCertification}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition shadow-lg"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        New Certification Selected
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700">
                                    This will replace the current file.
                                </p>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* File input */}
                {/* <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,application/pdf"
                    onChange={handleCertificationChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100 cursor-pointer
                        border border-gray-300 rounded-md"
                /> */}
                
                {/* {errors.certification && (
                    <p className="text-sm text-red-600 mt-2">{errors.certification}</p>
                )}

                {!hasExistingCert && !newCertSelected && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <File className="h-3 w-3" />
                        No certification uploaded yet
                    </p>
                )} */}
            {/* </div> */}

            {/* Location */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-900">Location Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="province_id">Province</Label>
                        <select
                            id="province_id"
                            value={data.province_id}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Select Province</option>
                            {provinces.map((p) => (
                                <option key={p.province_id} value={p.province_id}>
                                    {p.name_en}
                                </option>
                            ))}
                        </select>
                        {errors.province_id && (
                            <p className="text-sm text-red-600">{errors.province_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="district_id">District</Label>
                        <select
                            id="district_id"
                            value={data.district_id}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            disabled={!data.province_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select District</option>
                            {districts.map((d) => (
                                <option key={d.district_id} value={d.district_id}>
                                    {d.name_en}
                                </option>
                            ))}
                        </select>
                        {errors.district_id && (
                            <p className="text-sm text-red-600">{errors.district_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commune_id">Commune</Label>
                        <select
                            id="commune_id"
                            value={data.commune_id}
                            onChange={(e) => handleCommuneChange(e.target.value)}
                            disabled={!data.district_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Commune</option>
                            {communes.map((c) => (
                                <option key={c.commune_id} value={c.commune_id}>
                                    {c.name_en}
                                </option>
                            ))}
                        </select>
                        {errors.commune_id && (
                            <p className="text-sm text-red-600">{errors.commune_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="village_id">Village</Label>
                        <select
                            id="village_id"
                            value={data.village_id}
                            onChange={(e) => setData('village_id', e.target.value)}
                            disabled={!data.commune_id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Village (Optional)</option>
                            {villages.map((v) => (
                                <option key={v.village_id} value={v.village_id}>
                                    {v.name_en}
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
                <Label htmlFor="description">Farm Description</Label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Describe your farm and farming practices"
                />
                {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4 border-t">
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    type="button"
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="min-w-[120px]"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
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
                    ✓ Farm information updated successfully!
                </p>
            </Transition>
        </form>
    );
}
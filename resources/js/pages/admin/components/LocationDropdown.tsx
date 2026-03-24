// components/LocationDropdown.tsx
// Cascading Province → District → Commune → Village
// Uses the SAME API endpoints as the register page:
//   GET /api/provinces
//   GET /api/districts/{provinceId}
//   GET /api/communes/{districtId}
//   GET /api/villages/{communeId}

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
export interface LocationOption {
    province_id?: number;
    district_id?: number;
    commune_id?:  number;
    village_id?:  number;
    name_en: string;
    name_km: string;
}

export interface LocationValue {
    province_id: number | string | null;
    district_id: number | string | null;
    commune_id:  number | string | null;
    village_id:  number | string | null;
}

interface Props {
    value:       LocationValue;
    onChange:    (val: LocationValue) => void;
    errors?:     Partial<Record<keyof LocationValue, string>>;
    showVillage?: boolean;
    showCommune?: boolean;
    required?:   boolean;
    className?:  string;
}

/* ─── Single select ─────────────────────────────────── */
function SelectField({
    label, value, options, loading, disabled,
    placeholder, error, required, onChange,
}: {
    label:       string;
    value:       number | string | null;
    options:     LocationOption[];
    loading:     boolean;
    disabled:    boolean;
    placeholder: string;
    error?:      string;
    required?:   boolean;
    onChange:    (val: string) => void;
}) {
    // get the id key from whichever field exists
    const getId = (o: LocationOption) =>
        String(o.province_id ?? o.district_id ?? o.commune_id ?? o.village_id ?? '');
    const getName = (o: LocationOption) =>
        o.name_km || o.name_en;

    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}{required && <span className="text-rose-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loading
                        ? <Loader2 size={17} className="text-slate-400 animate-spin" />
                        : <MapPin  size={17} className={disabled ? 'text-slate-300' : 'text-slate-400'} />
                    }
                </div>
                <select
                    value={value ?? ''}
                    disabled={disabled || loading}
                    onChange={e => onChange(e.target.value)}
                    className={`
                        w-full pl-11 pr-9 py-3 bg-slate-50 border rounded-xl appearance-none
                        focus:outline-none focus:ring-2 transition-all cursor-pointer text-sm
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100
                        ${error
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-slate-200 focus:ring-[#228B22] focus:border-[#228B22] focus:bg-white'
                        }
                    `}
                >
                    <option value="">
                        {loading ? 'កំពុងផ្ទុក...' : placeholder}
                    </option>
                    {options.map(opt => (
                        <option key={getId(opt)} value={getId(opt)}>
                            {getName(opt)}
                        </option>
                    ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {error && (
                <p className="text-rose-600 text-sm mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 bg-rose-600 rounded-full inline-block" />
                    {error}
                </p>
            )}
        </div>
    );
}

/* ─── Main component ────────────────────────────────── */
export default function LocationDropdown({
    value,
    onChange,
    errors      = {},
    showVillage = true,
    showCommune = true,
    required    = false,
    className   = '',
}: Props) {

    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [communes,  setCommunes]  = useState<LocationOption[]>([]);
    const [villages,  setVillages]  = useState<LocationOption[]>([]);

    const [loadP, setLoadP] = useState(false);
    const [loadD, setLoadD] = useState(false);
    const [loadC, setLoadC] = useState(false);
    const [loadV, setLoadV] = useState(false);

    /* Load provinces on mount — same endpoint as register */
    useEffect(() => {
        setLoadP(true);
        fetch('/api/provinces', { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(setProvinces)
            .catch(console.error)
            .finally(() => setLoadP(false));
    }, []);

    /* Districts when province changes */
    useEffect(() => {
        setDistricts([]); setCommunes([]); setVillages([]);
        if (!value.province_id) return;
        setLoadD(true);
        fetch(`/api/districts/${value.province_id}`, { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(setDistricts)
            .catch(console.error)
            .finally(() => setLoadD(false));
    }, [value.province_id]);

    /* Communes when district changes */
    useEffect(() => {
        setCommunes([]); setVillages([]);
        if (!value.district_id || !showCommune) return;
        setLoadC(true);
        fetch(`/api/communes/${value.district_id}`, { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(setCommunes)
            .catch(console.error)
            .finally(() => setLoadC(false));
    }, [value.district_id]);

    /* Villages when commune changes */
    useEffect(() => {
        setVillages([]);
        if (!value.commune_id || !showVillage) return;
        setLoadV(true);
        fetch(`/api/villages/${value.commune_id}`, { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(setVillages)
            .catch(console.error)
            .finally(() => setLoadV(false));
    }, [value.commune_id]);

    /* Handlers — cascade-clear children */
    const onProvince = (v: string) =>
        onChange({ province_id: v || null, district_id: null, commune_id: null, village_id: null });

    const onDistrict = (v: string) =>
        onChange({ ...value, district_id: v || null, commune_id: null, village_id: null });

    const onCommune = (v: string) =>
        onChange({ ...value, commune_id: v || null, village_id: null });

    const onVillage = (v: string) =>
        onChange({ ...value, village_id: v || null });

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${className}`}>

            {/* Province */}
            <SelectField
                label="ខេត្ត / ក្រុង"
                value={value.province_id}
                options={provinces}
                loading={loadP}
                disabled={false}
                placeholder="-- ជ្រើសរើសខេត្ត --"
                error={errors.province_id}
                required={required}
                onChange={onProvince}
            />

            {/* District */}
            <SelectField
                label="ស្រុក / ខណ្ឌ"
                value={value.district_id}
                options={districts}
                loading={loadD}
                disabled={!value.province_id}
                placeholder={value.province_id ? '-- ជ្រើសរើសស្រុក --' : '-- ជ្រើសខេត្តជាមុន --'}
                error={errors.district_id}
                required={required}
                onChange={onDistrict}
            />

            {/* Commune */}
            {showCommune && (
                <SelectField
                    label="ឃុំ / សង្កាត់"
                    value={value.commune_id}
                    options={communes}
                    loading={loadC}
                    disabled={!value.district_id}
                    placeholder={value.district_id ? '-- ជ្រើសរើសឃុំ --' : '-- ជ្រើសស្រុកជាមុន --'}
                    error={errors.commune_id}
                    onChange={onCommune}
                />
            )}

            {/* Village */}
            {showVillage && (
                <SelectField
                    label="ភូមិ"
                    value={value.village_id}
                    options={villages}
                    loading={loadV}
                    disabled={!value.commune_id}
                    placeholder={value.commune_id ? '-- ជ្រើសរើសភូមិ --' : '-- ជ្រើសឃុំជាមុន --'}
                    error={errors.village_id}
                    onChange={onVillage}
                />
            )}

        </div>
    );
}
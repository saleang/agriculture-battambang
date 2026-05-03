// pages/admin/sellers/index.tsx
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Search, Plus, Edit2, Trash2, Mail, Phone, Store,
    Calendar, MapPin, Grid, List, Filter, Users2,
} from "lucide-react";
import Swal from "sweetalert2";

/* ── SweetAlert2 mixins ─────────────────────────────────────── */
const swal = Swal.mixin({
    customClass: {
        popup: "!rounded-2xl !shadow-2xl !border !border-slate-200 !font-[Kantumruy_Pro,sans-serif]",
        title: "!text-slate-900 !text-base !font-bold",
        htmlContainer: "!text-slate-600 !text-base",
        confirmButton: "!bg-rose-600 hover:!bg-rose-700 !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none",
        cancelButton: "!bg-white hover:!bg-slate-50 !border !border-slate-200 !text-slate-700 !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none",
    },
    buttonsStyling: false,
    reverseButtons: true,
});

const swalSuccess = Swal.mixin({
    customClass: {
        popup: "!rounded-2xl !shadow-xl !border !border-emerald-100 !font-[Kantumruy_Pro,sans-serif]",
        title: "!text-emerald-800 !text-base !font-bold",
        htmlContainer: "!text-emerald-700 !text-base",
        confirmButton: "!bg-[#228B22] hover:!bg-[#1a6b1a] !rounded-xl !px-6 !py-2.5 !text-base !font-semibold !shadow-none",
    },
    buttonsStyling: false,
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
});

/* ── Types ──────────────────────────────────────────────────── */
interface SellerUser {
    user_id: number;
    username: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
    seller?: {
        farm_name: string;
        full_location?: string;
    };
}

interface TotalStats {
    total: number;
    active: number;
    inactive: number;
    // banned: number;
}

/* ─── Color palette ──────────────────────────── */
const C = {
    p: "#228B22",
    dark: "#006400",
    sub: "#6b7280",
    display: "'Moul', serif",
    font: "'Kantumruy Pro', sans-serif",
};

export default function SellersIndex({
    sellers,
    filters,
    totalStats,
}: PageProps<{
    sellers: { data: SellerUser[]; links: any[] };
    filters: { search?: string; status?: string };
    totalStats: TotalStats;
}>) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const handleFilter = () => {
        router.get("/admin/sellers", { search, status }, { preserveState: true, replace: true });
    };

    const handleDelete = async (userId: number, username: string) => {
        const result = await swal.fire({
            icon: "warning",
            title: "លុបអ្នកលក់?",
            html: `តើអ្នកប្រាកដជាចង់លុប <strong>${username}</strong> មែនទេ?<br/><span class="text-base text-slate-400 mt-1 block">សកម្មភាពនេះមិនអាចមានកថ្មីវិញបានទេ</span>`,
            showCancelButton: true,
            confirmButtonText: "បាទ/ចាស លុប",
            cancelButtonText: "បោះបង់",
        });

        if (!result.isConfirmed) return;

        router.post(`/admin/sellers/${userId}`, { _method: 'delete' }, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => swalSuccess.fire({
                title: "បានលុបដោយជោគជ័យ!",
                html: `អ្នកលក់ <strong>${username}</strong> ត្រូវបានលុបចេញ`,
            }),
            onError: () => swal.fire({
                icon: "error",
                title: "មិនអាចលុបបានទេ",
                html: `មានបញ្ហាក្នុងការលុប <strong>${username}</strong>`,
            }),
        });
    };

    const getStatusStyle = (s: string) => ({
        active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
        inactive: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
        // banned: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
    }[s] ?? { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" });

    const getStatusLabel = (s: string) =>
        ({ active: "សកម្ម", inactive: "មិនសកម្ម"}[s] ?? s);

    const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const formatDate = (d: string) => {
        const dt = new Date(d);
        return `${dt.getDate()} ${KM_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
    };

    return (
        <AppLayout>
            <Head title="ការគ្រប់គ្រងអ្នកលក់" />

            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 11,
                                background: `linear-gradient(135deg,${C.p},${C.dark})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Users2 size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{
                                    fontFamily: C.display,
                                    color: C.p,
                                    fontSize: 24,
                                    margin: 0
                                }}>
                                    ការគ្រប់គ្រងអ្នកលក់
                                </h1>
                                <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
                                    គ្រប់គ្រងអ្នកលក់ និងកសិករក្នុងប្រព័ន្ធ
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/sellers/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-green-700 transition"
                        >
                            <Plus size={17} /> បន្ថែមអ្នកលក់
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "អាជីវករសរុប", value: totalStats.total, color: "text-gray-600", bg: "bg-gray-50", icon: Store },
                            { label: "សកម្ម", value: totalStats.active, color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
                            { label: "បានបិទ", value: totalStats.inactive, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
                            // { label: "បានបិទ", value: totalStats.banned, color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500" },
                        ].map((s, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[16px] font-medium text-gray-600">{s.label}</span>
                                    {s.icon ? (
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                                            <s.icon size={17} />
                                        </div>
                                    ) : (
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                                            <div className={`h-3 w-3 rounded-full ${s.dot}`} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-[18px] font-bold text-gray-900">
                                    {s.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                <input type="text"
                                    placeholder="ស្វែងរក ឈ្មោះ, អ៊ីមែល, លេខទូរស័ព្ទ, ឈ្មោះហាង..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleFilter()}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base" />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <select value={status} onChange={e => setStatus(e.target.value)}
                                    className="min-w-[150px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">គ្រប់ស្ថានភាព</option>
                                    <option value="active">សកម្ម</option>
                                    <option value="inactive">មិនសកម្ម</option>
                                    {/* <option value="banned">បានបិទ</option> */}
                                </select>


                                <button
                                    onClick={handleFilter}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-base font-medium text-white hover:bg-green-700"
                                >
                                    <Filter size={15} /> ស្វែងរក
                                </button>

                                {(search || status) && (
                                    <button
                                        onClick={() => { setSearch(""); setStatus(""); router.get("/admin/sellers", {}, { replace: true }); }}
                                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        លុបតម្រង
                                    </button>
                                )}

                                <div className="flex rounded-lg bg-gray-100 p-1">
                                    {(["list", "grid"] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`rounded-md px-3 py-1.5 text-base font-medium transition ${viewMode === mode ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            {mode === "list" ? (
                                                <><List size={14} className="mr-1 inline" />បញ្ជី</>
                                            ) : (
                                                <><Grid size={14} className="mr-1 inline" />ក្រឡា</>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area - Grid & List views updated with consistent font sizes */}
                    {sellers.data.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                            <Store className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h3 className="mb-2 text-[22px] font-semibold text-gray-800">មិនមានអ្នកលក់</h3>
                            <p className="text-base text-gray-500">សូមព្យាយាមកែប្រែលក្ខខណ្ឌស្វែងរក</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {sellers.data.map((seller) => {
                                const ss = getStatusStyle(seller.status);
                                return (
                                    <div
                                        key={seller.user_id}
                                        className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-green-200 hover:shadow-md transition-all"
                                    >
                                        {/* Status + Actions */}
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-medium ${ss.bg} ${ss.text}`}>
                                                <div className={`h-2 w-2 rounded-full ${ss.dot}`} />
                                                {getStatusLabel(seller.status)}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/sellers/${seller.user_id}/edit`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                >
                                                    <Edit2 size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(seller.user_id, seller.username)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="mb-2 text-[16px] font-semibold text-gray-900">{seller.username}</h3>

                                        {seller.seller && (
                                            <div className="mb-3 flex items-center gap-1.5 text-emerald-600 font-medium text-base">
                                                <Store size={14} />
                                                <span className="truncate">{seller.seller.farm_name}</span>
                                            </div>
                                        )}

                                        <div className="space-y-1.5 text-base text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="flex-shrink-0 text-gray-400" />
                                                <span className="truncate">{seller.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="flex-shrink-0 text-gray-400" />
                                                <span>{seller.phone || "—"}</span>
                                            </div>
                                            {seller.seller?.full_location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                                                    <span className="truncate">{seller.seller.full_location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-base text-gray-400">
                                            <Calendar size={12} /> ចុះឈ្មោះ {formatDate(seller.created_at)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            {["អ្នកលក់", "ហាង / ទីតាំង", "ស្ថានភាព", "ថ្ងៃចុះឈ្មោះ", "សកម្មភាព"].map((h, i) => (
                                                <th
                                                    key={h}
                                                    className={`px-6 py-3.5 text-[16px] font-semibold text-gray-500 uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sellers.data.map((seller) => {
                                            const ss = getStatusStyle(seller.status);
                                            return (
                                                <tr key={seller.user_id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-[16px] font-medium text-gray-900">{seller.username}</div>
                                                        <div className="mt-0.5 text-base text-gray-500">{seller.email}</div>
                                                        <div className="text-base text-gray-400">{seller.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {seller.seller && (
                                                            <>
                                                                <div className="flex items-center gap-1 text-base font-medium text-emerald-700">
                                                                    <Store size={14} />
                                                                    {seller.seller.farm_name}
                                                                </div>
                                                                {seller.seller.full_location && (
                                                                    <div className="mt-1 flex items-center gap-1 text-base text-gray-400">
                                                                        <MapPin size={13} />
                                                                        {seller.seller.full_location}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-base font-medium ${ss.bg} ${ss.text}`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />
                                                            {getStatusLabel(seller.status)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-base text-gray-500">
                                                        {formatDate(seller.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={`/admin/sellers/${seller.user_id}/edit`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-base font-medium text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Edit2 size={13} /> កែប្រែ
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(seller.user_id, seller.username)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-base font-medium text-rose-600 hover:bg-rose-100"
                                                            >
                                                                <Trash2 size={13} /> លុប
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {sellers.links?.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                {sellers.links.map((link: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        className={`px-4 py-2 text-base font-medium transition-colors ${link.active ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"} ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
// pages/admin/sellers/index.tsx
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Search, Plus, Edit2, Trash2, Mail, Phone, Store,
    Calendar, MapPin, Grid, List, Filter, User as UserIcon,
} from "lucide-react";
import Swal from "sweetalert2";

/* ── SweetAlert2 mixins ─────────────────────────────────────── */
const swal = Swal.mixin({
    customClass: {
        popup:         "!rounded-2xl !shadow-2xl !border !border-slate-200",
        title:         "!text-slate-900 !text-base !font-bold",
        htmlContainer: "!text-slate-600 !text-sm",
        confirmButton: "!bg-rose-600 hover:!bg-rose-700 !rounded-xl !px-6 !py-2.5 !text-sm !font-semibold !shadow-none",
        cancelButton:  "!bg-white hover:!bg-slate-50 !border !border-slate-200 !text-slate-700 !rounded-xl !px-6 !py-2.5 !text-sm !font-semibold !shadow-none",
    },
    buttonsStyling: false,
    reverseButtons: true,
});
const swalSuccess = Swal.mixin({
    customClass: {
        popup:         "!rounded-2xl !shadow-xl !border !border-emerald-100",
        title:         "!text-emerald-800 !text-base !font-bold",
        htmlContainer: "!text-emerald-700 !text-sm",
        confirmButton: "!bg-[#228B22] hover:!bg-[#1a6b1a] !rounded-xl !px-6 !py-2.5 !text-sm !font-semibold !shadow-none",
    },
    buttonsStyling: false,
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
});

/* ── Types ──────────────────────────────────────────────────── */
interface SellerUser {
    user_id:    number;
    username:   string;
    email:      string;
    phone:      string;
    status:     string;
    created_at: string;
    seller?: {
        farm_name:     string;
        full_location?: string;
    };
}

interface TotalStats {
    total: number; active: number; inactive: number; banned: number;
}

/* ── Component ──────────────────────────────────────────────── */
export default function SellersIndex({
    sellers, filters, totalStats,
}: PageProps<{
    sellers:    { data: SellerUser[]; links: any[] };
    filters:    { search?: string; status?: string };
    totalStats: TotalStats;
}>) {
    const [search,   setSearch]   = useState(filters.search || "");
    const [status,   setStatus]   = useState(filters.status || "");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // FIX: always navigate with both params so filter resets work
    const handleFilter = () => {
        router.get(
            "/admin/sellers",
            { search, status },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = async (userId: number, username: string) => {
        const result = await swal.fire({
            icon: "warning",
            title: "លុបអ្នកលក់?",
            html: `តើអ្នកប្រាកដជាចង់លុប <strong>${username}</strong> មែនទេ?<br/><span class="text-xs text-slate-400 mt-1 block">សកម្មភាពនេះមិនអាចមានកថ្មីវិញបានទេ</span>`,
            showCancelButton: true,
            confirmButtonText: "បាទ/ចាស លុប",
            cancelButtonText:  "បោះបង់",
        });
        if (!result.isConfirmed) return;

        // FIX: use hardcoded URL — same pattern as user delete fix
        router.post(`/admin/sellers/${userId}/destroy`, {}, {
            preserveState:  false,
            preserveScroll: false,
            onSuccess: () => swalSuccess.fire({
                title: "បានលុបដោយជោគជ័យ!",
                html:  `អ្នកលក់ <strong>${username}</strong> ត្រូវបានលុបចេញ`,
            }),
            onError: () => swal.fire({
                icon: "error", title: "មិនអាចលុបបានទេ",
                html: `មានបញ្ហាក្នុងការលុប <strong>${username}</strong>`,
                showCancelButton: false, confirmButtonText: "យល់ព្រម",
            }),
        });
    };

    const getStatusStyle = (s: string) => ({
        active:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
        inactive: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
        banned:   { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500"    },
    }[s] ?? { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" });

    const getStatusLabel = (s: string) =>
        ({ active: "សកម្ម", inactive: "មិនសកម្ម", banned: "បានបិទ" }[s] ?? s);

    const KM_MONTHS = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ការគ្រប់គ្រងអ្នកលក់</h1>
                            <p className="mt-1.5 text-gray-600 text-sm">គ្រប់គ្រងអ្នកលក់ និងកសិករក្នុងប្រព័ន្ធ</p>
                        </div>
                        <Link href="/admin/sellers/create"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 transition-colors text-sm">
                            <Plus size={17} /> បន្ថែមអ្នកលក់
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "អ្នកលក់សរុប", value: totalStats.total,    color: "text-gray-600",    bg: "bg-gray-50",    icon: Store      },
                            { label: "សកម្ម",        value: totalStats.active,   color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
                            { label: "មិនសកម្ម",     value: totalStats.inactive, color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-500"   },
                            { label: "បានបិទ",       value: totalStats.banned,   color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-500"    },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-600">{s.label}</span>
                                    {(s as any).icon
                                        ? <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}><s.icon size={17}/></div>
                                        : <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}><div className={`w-3 h-3 rounded-full ${(s as any).dot}`}/></div>
                                    }
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                <input type="text"
                                    placeholder="ស្វែងរក ឈ្មោះ, អ៊ីមែល, លេខទូរស័ព្ទ, ឈ្មោះហាង..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleFilter()}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm" />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <select value={status} onChange={e => setStatus(e.target.value)}
                                    className="min-w-[150px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">គ្រប់ស្ថានភាព</option>
                                    <option value="active">សកម្ម</option>
                                    <option value="inactive">មិនសកម្ម</option>
                                    <option value="banned">បានបិទ</option>
                                </select>
                                <button onClick={handleFilter}
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2 text-sm">
                                    <Filter size={15} /> ស្វែងរក
                                </button>
                                {/* Reset */}
                                {(search || status) && (
                                    <button onClick={() => { setSearch(""); setStatus(""); router.get("/admin/sellers", {}, { replace: true }); }}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition text-sm">
                                        លុបតម្រង
                                    </button>
                                )}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {(["list","grid"] as const).map(mode => (
                                        <button key={mode} onClick={() => setViewMode(mode)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === mode ? "bg-white shadow text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}>
                                            {mode === "list"
                                                ? <><List size={14} className="inline mr-1"/>បញ្ជី</>
                                                : <><Grid size={14} className="inline mr-1"/>ក្រឡា</>
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {sellers.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">មិនមានអ្នកលក់</h3>
                            <p className="text-gray-500 text-sm">សូមព្យាយាមកែប្រែលក្ខខណ្ឌស្វែងរក</p>
                        </div>

                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {sellers.data.map(seller => {
                                const ss = getStatusStyle(seller.status);
                                return (
                                    <div key={seller.user_id}
                                        className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-200 hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${ss.bg} ${ss.text}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`}/>{getStatusLabel(seller.status)}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/sellers/${seller.user_id}/edit`}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                                    <Edit2 size={15}/>
                                                </Link>
                                                <button onClick={() => handleDelete(seller.user_id, seller.username)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-1">{seller.username}</h3>
                                        {seller.seller && (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm mb-3">
                                                <Store size={14}/><span className="truncate">{seller.seller.farm_name}</span>
                                            </div>
                                        )}

                                        <div className="space-y-1.5 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400 flex-shrink-0"/><span className="truncate">{seller.email}</span></div>
                                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400 flex-shrink-0"/><span>{seller.phone || "—"}</span></div>
                                            {seller.seller?.full_location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-gray-400 flex-shrink-0"/>
                                                    <span className="truncate text-xs">{seller.seller.full_location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
                                            <Calendar size={12}/> ចុះឈ្មោះ {formatDate(seller.created_at)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {["អ្នកលក់","ហាង / ទីតាំង","ស្ថានភាព","ថ្ងៃចុះឈ្មោះ","សកម្មភាព"].map((h, i) => (
                                                <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i===4?"text-right":"text-left"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sellers.data.map(seller => {
                                            const ss = getStatusStyle(seller.status);
                                            return (
                                                <tr key={seller.user_id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 text-sm">{seller.username}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{seller.email}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{seller.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {seller.seller && <>
                                                            <div className="text-sm font-medium text-emerald-700 flex items-center gap-1"><Store size={13}/>{seller.seller.farm_name}</div>
                                                            {seller.seller.full_location && (
                                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={11}/>{seller.seller.full_location}</div>
                                                            )}
                                                        </>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ss.bg} ${ss.text}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`}/>{getStatusLabel(seller.status)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">{formatDate(seller.created_at)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/admin/sellers/${seller.user_id}/edit`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition">
                                                                <Edit2 size={13}/> កែប្រែ
                                                            </Link>
                                                            <button onClick={() => handleDelete(seller.user_id, seller.username)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium transition">
                                                                <Trash2 size={13}/> លុប
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
                            <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                                {sellers.links.map((link: any, i: number) => (
                                    <Link key={i} href={link.url || "#"}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${link.active ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"} ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState={false}
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
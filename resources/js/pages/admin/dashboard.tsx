/** @jsxImportSource react */
// pages/admin/dashboard.tsx — Fixed v8
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Users, Package, ShoppingCart, DollarSign, Store,
    UserCheck, Clock, CheckCircle, Shield,
    ArrowUpRight, ArrowDownRight, ChevronRight, ChevronLeft,
    Leaf, Eye, Settings,
    TrendingUp, House
} from 'lucide-react';
// FIX #2: Removed unused Bell and RefreshCw imports
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, PolarAngleAxis,
    PieChart, Pie, Cell
} from 'recharts';
import { useState } from 'react';

/* ─── Types ──────────────────────────────────── */
interface AdminStats {
    total_users: number;
    total_sellers: number;
    total_customers: number;
    total_products: number;
    active_products: number;
    pending_approvals: number;
    pending_orders: number;
    total_revenue: number;
    revenue_this_month: number; // used to label the trend badge correctly
}
interface Trends {
    user_trend: number;
    revenue_trend: number;
    order_trend: number;
    seller_trend: number;
}
interface PlatformHealth {
    active_rate: number;
    completion_rate: number;
    user_activity_rate: number;
    payment_success_rate: number;
}
interface MonthlyPoint { m: string; rev: number; ord: number; usr: number; }
interface CategoryPoint { name: string; v: number; }
interface SparkData    { revenue: number[]; orders: number[]; users: number[]; sellers: number[]; }
// FIX #8: Added sellers sparkline to SparkData interface
interface RecentOrder  { id: string; customer: string; amount: string; status: string; date: string; }
interface RecentActivity {
    id: string; action: string; user: string;
    time: string; status: string; type: string;
}
// Keys are "YYYY-MM-DD" strings (e.g. "2025-04-19")
type CalendarEvents = Record<string, { label: string; color: string }[]>;

/* ─── Color palette ──────────────────────────── */
const C = {
    bg:      '#f9fafb',
    surface: '#ffffff',
    border:  '#e5e7eb',
    border2: '#d1fae5',
    muted:   '#9ca3af',
    sub:     '#6b7280',
    text:    '#374151',
    strong:  '#111827',
    p:       '#228B22',
    a:       '#32CD32',
    gold:    '#FFD700',
    goldD:   '#ca8a04',
    light:   '#90EE90',
    dark:    '#006400',
    bgG:     '#f0fdf4',
    bgY:     '#fefce8',
    font:    "'Khmer os Battambang', sans-serif",
    display: "'Moul', serif",
    mono:    "'JetBrains Mono', monospace",
};

/* ─── Donut fill map (top 5 categories) ─────── */
const CAT_COLORS = [C.p, C.a, C.light, C.gold, C.dark];

/* ─── Khmer calendar strings ─────────────────── */
const KH_DAYS   = ['អាទិត្យ','ចន្ទ','អង្គារ','ពុធ','ព្រហ','សុក្រ','សៅរ៍'];
const KH_MONTHS = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];

/* ─── Helpers ────────────────────────────────── */
const card: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const fmtM = (n: number) => `${n.toLocaleString()} ៛`;

const formatRelativeTimeKhmer = (value: string): string => {
    const raw = value.trim();
    const normalized = raw.toLowerCase();

    if (/[០១២៣៤៥៦៧៨៩]/u.test(raw) || normalized.includes('មុន') || normalized.includes('ក្នុង')) {
        return raw;
    }

    if (normalized === 'just now' || normalized === 'now' || normalized === 'moments ago') {
        return 'ឥឡូវនេះ';
    }

    const cleaned = normalized.replace(/^about\s+/, '').replace(/^approximately\s+/, '');
    const match = cleaned.match(/^(?:an?|[0-9]+)\s+(second|minute|hour|day|week|month|year)s?\s*(ago|from now)?$/);
    if (!match) {
        return raw;
    }

    const [, unit, direction] = match;
    const countMatch = cleaned.match(/^(?:an?|[0-9]+)\s/);
    const count = countMatch ? Number(countMatch[0].replace(/[^0-9]/g, '') || 1) : 1;
    const unitMap: Record<string, string> = {
        second: 'វិនាទី',
        minute: 'នាទី',
        hour: 'ម៉ោង',
        day: 'ថ្ងៃ',
        week: 'សប្តាហ៍',
        month: 'ខែ',
        year: 'ឆ្នាំ',
    };

    const khmerUnit = unitMap[unit] ?? unit;
    if (direction === 'from now') {
        return `ក្នុង ${count} ${khmerUnit}`;
    }

    return `${count} ${khmerUnit} មុន`;
};

const trendBadge = (val: number) => ({
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
    color: val >= 0 ? '#166534' : '#991b1b',
    background: val >= 0 ? '#dcfce7' : '#fee2e2',
    display: 'flex' as const, alignItems: 'center' as const, gap: 2,
});

/* ─── Sparkline ──────────────────────────────── */
const Spark = ({ data, color }: { data: number[]; color: string }) => (
    <ResponsiveContainer width="100%" height={36}>
        <LineChart data={data.map((v, i) => ({ i, v }))}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
    </ResponsiveContainer>
);

/* ─── Tooltip ────────────────────────────────── */
const LightTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
            <p style={{ color: C.sub, marginBottom: 4, fontWeight: 600 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color, margin: 0, fontWeight: 700 }}>{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

/* ─── Status Pill ────────────────────────────── */
const Pill = ({ s }: { s: string }) => {
    const map: Record<string, [string, string]> = {
        completed:  ['#166534', '#dcfce7'],
        processing: ['#1e40af', '#dbeafe'],
        confirmed:  ['#166534', '#dcfce7'],
        cancelled:  ['#991b1b', '#fee2e2'],
        pending:    ['#854d0e', '#fef9c3'],
    };
    const label: Record<string, string> = {
        completed:  'បានបញ្ចប់',
        processing: 'កំពុងដំណើរ',
        confirmed:  'បានបញ្ជាក់',
        cancelled:  'បានបោះបង់',
        pending:    'រង់ចាំ',
    };
    // FIX #11: Safe fallback for unknown statuses — always show Khmer or a
    // neutral grey pill rather than raw English strings
    const [fg, bg] = map[s] ?? ['#374151', '#f3f4f6'];
    return (
        <span style={{ color: fg, background: bg, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {label[s] ?? 'មិនស្គាល់'}
        </span>
    );
};
/* ─── Khmer Translation Helper ───────────────── */
const translateActivity = (text: string): string => {
    return text
        .replace(/\bcompleted\b/gi, 'បានបញ្ចប់')
        .replace(/\bseller\b/gi, 'អាជីវករ')
        .replace(/\bcustomer\b/gi, 'អតិថិជន')
        .replace(/\buser\b/gi, 'អ្នកប្រើ')
        .replace(/\border\b/gi, 'ការបញ្ជាទិញ')
        .replace(/\bproduct\b/gi, 'ផលិតផល');
};
/* ─── Activity icon ──────────────────────────── */
const ActIcon = ({ type }: { type: string }) => {
    const map: Record<string, React.ReactNode> = {
        user:     <UserCheck size={14} color="#1e40af" />,
        order:    <ShoppingCart size={14} color={C.p} />,
        product:  <Package size={14} color={C.goldD} />,
        security: <Shield size={14} color="#991b1b" />,
    };
    const bg: Record<string, string> = {
        user: '#dbeafe', order: C.bgG, product: C.bgY, security: '#fee2e2',
    };
    return (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: bg[type] ?? C.bgG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {map[type] ?? <TrendingUp size={14} color={C.p} />}
        </div>
    );
};

/* ─── pad2 helper ────────────────────────────── */
const pad2 = (n: number) => String(n).padStart(2, '0');

/* ─── Calendar ───────────────────────────────── */
const Calendar = ({ events }: { events: CalendarEvents }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-based

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const monthPrefix = `${year}-${pad2(month + 1)}-`;

    const monthEvents: Record<number, { label: string; color: string }[]> = {};
    Object.entries(events).forEach(([dateStr, evs]) => {
        if (dateStr.startsWith(monthPrefix)) {
            const day = parseInt(dateStr.slice(8), 10);
            monthEvents[day] = evs;
        }
    });

    const upcomingEntries = Object.entries(monthEvents)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .slice(0, 4);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    style={{ background: C.bgG, border: `1px solid ${C.border2}`, borderRadius: 7, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.p }}>
                    <ChevronLeft size={13} />
                </button>
                <p style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.p, margin: 0 }}>
                    {KH_MONTHS[month]} {year}
                </p>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    style={{ background: C.bgG, border: `1px solid ${C.border2}`, borderRadius: 7, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.p }}>
                    <ChevronRight size={13} />
                </button>
            </div>

            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                {KH_DAYS.map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 10, color: C.muted, fontWeight: 600 }}>{d}</div>
                ))}
            </div>

            {/* Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                {cells.map((day, i) => {
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();
                    const dayEvents = day ? (monthEvents[day] ?? []) : [];
                    return (
                        <div key={i} style={{
                            minHeight: 36, borderRadius: 6, padding: 3,
                            background: isToday ? C.p : day ? C.surface : 'transparent',
                            border: isToday ? `1px solid ${C.p}` : day ? `1px solid ${C.border}` : '1px solid transparent',
                            cursor: day ? 'pointer' : 'default', transition: 'all 0.12s',
                        }}
                            onMouseEnter={e => { if (day && !isToday) { (e.currentTarget as HTMLDivElement).style.background = C.bgG; (e.currentTarget as HTMLDivElement).style.borderColor = '#86efac'; } }}
                            onMouseLeave={e => { if (day && !isToday) { (e.currentTarget as HTMLDivElement).style.background = C.surface; (e.currentTarget as HTMLDivElement).style.borderColor = C.border; } }}
                        >
                            {day && (
                                <>
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : C.strong, textAlign: 'center', lineHeight: 1.3 }}>{day}</p>
                                    {dayEvents.slice(0, 1).map((ev, ei) => (
                                        <div key={ei} style={{
                                            fontSize: 8, color: '#fff',
                                            background: ev.color === C.gold ? C.goldD : ev.color,
                                            borderRadius: 3, padding: '1px 3px', marginTop: 1,
                                            lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis', fontWeight: 700
                                        }}>{ev.label}</div>
                                    ))}
                                    {dayEvents.length > 1 && (
                                        <p style={{ fontSize: 8, color: C.muted, margin: 0, textAlign: 'center' }}>+{dayEvents.length - 1}</p>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Upcoming events for this viewed month */}
            {upcomingEntries.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 10, color: C.muted, margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ការបញ្ជាទិញក្នុងខែ</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {upcomingEntries.map(([day, evs]) =>
                            evs.slice(0, 1).map((ev, i) => (
                                <div key={`${day}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color === C.gold ? C.goldD : ev.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0, minWidth: 44 }}>ថ្ងៃទី {day}</span>
                                    <span style={{ fontSize: 11, color: C.text }}>{ev.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Main component ─────────────────────────── */
export default function AdminDashboard({
    stats, trends, platformHealth,
    monthlyData, categoryData, sparkData,
    recentOrders, recentActivities, calendarEvents,
}: PageProps<{
    stats: AdminStats;
    trends: Trends;
    platformHealth: PlatformHealth;
    monthlyData: MonthlyPoint[];
    categoryData: CategoryPoint[];
    sparkData: SparkData;
    recentOrders: RecentOrder[];
    recentActivities: RecentActivity[];
    calendarEvents: CalendarEvents;
    // FIX #1: pendingSellers removed — it is not consumed by this component.
    // The PHP controller should also remove that block (see DashboardController).
}>) {

    // Safe defaults
    const s = {
        total_users:         stats?.total_users         ?? 0,
        total_sellers:       stats?.total_sellers       ?? 0,
        total_customers:     stats?.total_customers     ?? 0,
        total_products:      stats?.total_products      ?? 0,
        active_products:     stats?.active_products     ?? 0,
        pending_approvals:   stats?.pending_approvals   ?? 0,
        pending_orders:      stats?.pending_orders      ?? 0,
        total_revenue:       stats?.total_revenue       ?? 0,
        revenue_this_month:  stats?.revenue_this_month  ?? 0,
    };
    const tr = {
        user_trend:    trends?.user_trend    ?? 0,
        revenue_trend: trends?.revenue_trend ?? 0,
        order_trend:   trends?.order_trend   ?? 0,
        seller_trend:  trends?.seller_trend  ?? 0,
    };
    const ph = {
        active_rate:          platformHealth?.active_rate          ?? 0,
        completion_rate:      platformHealth?.completion_rate      ?? 0,
        user_activity_rate:   platformHealth?.user_activity_rate   ?? 0,
        payment_success_rate: platformHealth?.payment_success_rate ?? 0,
    };
    const monthly    = monthlyData    ?? [];
    const catData    = (categoryData  ?? []).map((c, i) => ({ ...c, fill: CAT_COLORS[i] ?? C.p }));
    const spark = {
        revenue: (sparkData?.revenue ?? []) as number[],
        orders:  (sparkData?.orders  ?? []) as number[],
        users:   (sparkData?.users   ?? []) as number[],
        sellers: (sparkData?.sellers ?? []) as number[], // FIX #8: use dedicated sellers sparkline
    };
    const orders     = recentOrders     ?? [];
    const activities = recentActivities ?? [];
    const calEvents  = calendarEvents   ?? {};

    const headerButtons: { icon: React.ReactNode; label: string; badge: boolean }[] = [
        { icon: <Settings size={13}/>, label: 'ការកំណត់', badge: false },
    ];

    const kpiCards = [
        {
            label:   'អ្នកប្រើប្រាស់សរុប',
            value:   s.total_users.toLocaleString(),
            sub:     `${s.total_customers} អតិថិជន`,
            trend:   tr.user_trend,
            spark:   spark.users,
            color:   C.p,
            iconBg:  C.bgG,
            borderL: C.p,
            icon:    <Users size={18} color={C.p} />,
        },
        {
            label:   'អាជីវករសរុប',
            value:   s.total_sellers,
            sub:     `${s.pending_approvals} រង់ចាំ`,
            trend:   tr.seller_trend,
            spark:   spark.sellers, // FIX #8: was spark.users (wrong)
            color:   C.a,
            iconBg:  C.bgG,
            borderL: C.a,
            icon:    <Store size={18} color={C.a} />,
        },
        {
            label:   'ផលិតផលសរុប',
            value:   s.total_products,
            sub:     `${s.active_products} សកម្ម`,
            trend:   0,
            spark:   spark.orders,
            color:   C.goldD,
            iconBg:  C.bgY,
            borderL: C.gold,
            icon:    <Package size={18} color={C.goldD} />,
        },
        {
            // FIX #10: Renamed card to "ការបញ្ជាទិញ" so the subtitle (pending orders)
            // is semantically consistent with the card title.
            label:   'ផលិតផលកំពុងបញ្ជាទិញ',
            value:   s.pending_orders,
            sub:     `${s.total_customers} អតិថិជន`,
            trend:   tr.order_trend,
            spark:   spark.orders,
            color:   C.a,
            iconBg:  C.bgG,
            borderL: C.light,
            icon:    <ShoppingCart size={18} color={C.a} />,
        },
        {
            label:   'ចំណូលសរុប',
            value:   fmtM(s.total_revenue),
            // Show this month's revenue so the trend badge (month-over-month %)
            // is semantically tied to the sub-label, not the all-time total.
            sub:     `${fmtM(s.revenue_this_month)} ខែនេះ`,
            trend:   tr.revenue_trend,
            spark:   spark.revenue,
            color:   C.dark,
            iconBg:  C.bgG,
            borderL: C.dark,
            icon:    <DollarSign size={18} color={C.dark} />,
        },
    ];

    return (
        <AppLayout>
            <Head title="ផ្ទាំងគ្រប់គ្រង - កសិផលខេត្តបាត់ដំបង" />

            <div style={{ background: C.bg, minHeight: '100vh', fontFamily: C.font, color: C.text }}>
                <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── Header ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg,${C.p},${C.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <House size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ fontFamily: C.display, color: C.p, fontSize: 20, margin: 0 }}>ផ្ទាំងគ្រប់គ្រង</h1>
                                <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>សូមស្វាគមន៍ត្រឡប់មកវិញ!</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {headerButtons.map(btn => (
                                <button key={btn.label} style={{ position: 'relative', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '7px 12px', color: C.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontFamily: C.font }}>
                                    {btn.icon} {btn.label}
                                    {btn.badge && s.pending_approvals > 0 && (
                                        <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: '#ef4444', border: `2px solid ${C.bg}`, fontSize: 9, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                                            {s.pending_approvals}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── KPI Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
                        {kpiCards.map((k) => (
                            <div key={k.label} style={{ ...card, padding: 18, borderLeft: `4px solid ${k.borderL}`, transition: 'box-shadow 0.2s, transform 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                                    <span style={trendBadge(k.trend)}>
                                        {k.trend >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                        {k.trend >= 0 ? '+' : ''}{k.trend}%
                                    </span>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <p style={{ fontSize: 16, color: C.sub, margin: '0 0 2px', fontWeight: 500 }}>{k.label}</p>
                                    <p style={{ fontSize: 22, fontWeight: 700, color: C.strong, margin: 0, lineHeight: 1 }}>{k.value}</p>
                                    <p style={{ fontSize: 16, color: C.muted, margin: '4px 0 0' }}>{k.sub}</p>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Spark data={k.spark} color={k.color} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Charts Row ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 285px', gap: 14 }}>

                        {/* Area — revenue & orders */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: 0 }}>ចំណូល និងការបញ្ជាទិញ</p>
                                    <p style={{ color: C.sub, fontSize: 14, margin: '3px 0 0' }}>ទិន្នន័យ ៧ ខែ</p>
                                </div>
                                <div style={{ display: 'flex', gap: 14, fontSize: 14, color: C.sub }}>
                                    {[{ color: C.p, label: 'ចំណូល' }, { color: C.goldD, label: 'ការបញ្ជា' }].map(l => (
                                        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor={C.p}    stopOpacity={0.20} />
                                            <stop offset="100%" stopColor={C.p}    stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor={C.goldD} stopOpacity={0.18} />
                                            <stop offset="100%" stopColor={C.goldD} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" />
                                    <XAxis dataKey="m"   tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<LightTooltip />} />
                                    <Area type="monotone" dataKey="rev" name="ចំណូល(ពាន់រៀល)" stroke={C.p}     strokeWidth={2} fill="url(#lg1)" dot={false} activeDot={{ r: 4, fill: C.p }} />
                                    <Area type="monotone" dataKey="ord" name="ការបញ្ជា"  stroke={C.goldD} strokeWidth={2} fill="url(#lg2)" dot={false} activeDot={{ r: 4, fill: C.goldD }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar — users */}
                        <div style={card}>
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: 0 }}>អ្នកប្រើប្រាស់</p>
                                <p style={{ color: C.sub, fontSize: 14, margin: '3px 0 0' }}>ប្រចាំ ៧ ខែ</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthly} barSize={14} barGap={3} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="m"   tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<LightTooltip />} />
                                    <Bar dataKey="usr" name="អ្នកប្រើ"  fill={C.p}     radius={[4,4,0,0]} />
                                    <Bar dataKey="ord" name="ការបញ្ជា" fill={C.light}  radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Donut — categories */}
                        <div style={card}>
                            <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: '0 0 3px' }}>ប្រភេទផលិតផល</p>
                            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 6px' }}>ការប្រើប្រាស់ប្រភេទផលិតផល</p>
                            <div style={{ position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={145}>
                                    <PieChart>
                                        <Pie data={catData} dataKey="v" innerRadius={44} outerRadius={65} paddingAngle={3} startAngle={90} endAngle={-270}>
                                            {catData.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                                        </Pie>
                                        <Tooltip formatter={v => [`${v}%`]} contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: C.strong, margin: 0 }}>{s.total_products}</p>
                                    <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>ប.ផ</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {catData.map(d => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: 2, background: d.fill, display: 'inline-block' }} />
                                            <span style={{ color: C.sub }}>{d.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <div style={{ width: 50, height: 3, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ width: `${d.v}%`, height: '100%', background: d.fill }} />
                                            </div>
                                            <span style={{ color: C.strong, fontWeight: 600, width: 26, textAlign: 'right' }}>{d.v}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Row ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 14 }}>

                        {/* Orders table */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: 0 }}>ការបញ្ជាទិញថ្មីៗ</p>
                                    <p style={{ color: C.sub, fontSize: 14, margin: '3px 0 0' }}>ការបញ្ជាទិញ {orders.length} ចុងក្រោយ</p>
                                </div>
                                {/* <button style={{ background: C.bgG, color: C.p, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: C.font }}>
                                    មើលទាំងអស់ <ChevronRight size={11}/>
                                </button> */}
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['លេខកូដ','អតិថិជន','ចំនួនទឹកប្រាក់','ស្ថានភាព','ថ្ងៃ'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '0 10px 10px', fontSize: 16, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}
                                            onMouseEnter={e => (e.currentTarget.style.background = C.bgG)}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.12s'}}
                                        >
                                            <td style={{ padding: '12px 10px', fontFamily: C.mono, fontSize: 16, color: C.p, fontWeight: 600 }}>{o.id}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 16, color: C.strong }}>{o.customer}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 16, fontWeight: 700, color: C.p }}>{o.amount}</td>
                                            <td style={{ padding: '12px 10px',fontSize: 16 }}><Pill s={o.status} /></td>
                                            <td style={{ padding: '12px 10px', fontSize: 16, color: C.muted }}>{o.date}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: 14 }}>មិនមានការបញ្ជាទិញទេ</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Platform health */}
                        <div style={{ ...card, padding: 18 }}>
                            <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: '0 0 2px' }}>ស្ថិតិប្រព័ន្ធ</p>
                            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 10px' }}>ការវិភាគសកម្មភាព</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                <ResponsiveContainer width={80} height={80}>
                                    <RadialBarChart innerRadius={24} outerRadius={38}
                                        data={[{ value: ph.completion_rate, fill: C.p }]}
                                        startAngle={90} endAngle={-270}>
                                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div>
                                    <p style={{ fontSize: 28, fontWeight: 700, color: C.p, margin: 0, lineHeight: 1 }}>
                                        {ph.completion_rate}<span style={{ fontSize: 16, color: C.sub }}>%</span>
                                    </p>
                                    <p style={{ fontSize: 12, color: C.sub, margin: '3px 0 0' }}>ការបញ្ចប់ការបញ្ជា</p>
                                </div>
                            </div>
                            {[
                                { label: 'អត្រាផលិតផលសកម្ម',   pct: ph.active_rate,          color: C.p },
                                { label: 'អត្រាបញ្ចប់ការបញ្ជា',  pct: ph.completion_rate,      color: C.goldD },
                                { label: 'សកម្មភាពអ្នកប្រើ',    pct: ph.user_activity_rate,   color: C.dark },
                                { label: 'អត្រាទូទាត់ជោគជ័យ',  pct: ph.payment_success_rate, color: C.a },
                            ].map(r => (
                                <div key={r.label} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 14, color: C.text }}>{r.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.pct}%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(r.pct, 100)}%`, height: '100%', background: r.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent activities */}
                        <div style={{ ...card, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: 0 }}>សកម្មភាពថ្មីៗ</p>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.a, display: 'inline-block' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {activities.map(act => (
    <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <ActIcon type={act.type} />
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ 
                fontSize: 16, 
                color: C.text, 
                margin: 0, 
                lineHeight: 1.4 
            }}>
                {translateActivity(act.action)}
            </p>
            <p style={{ 
                fontSize: 12, 
                color: C.muted, 
                margin: '3px 0 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3 
            }}>
                <Clock size={9} />{formatRelativeTimeKhmer(act.time)}
            </p>
        </div>
    </div>
))}
                                {activities.length === 0 && (
                                    <p style={{ textAlign: 'center', color: C.muted, fontSize: 14 }}>មិនមានសកម្មភាព</p>
                                )}
                            </div>
                        </div>

                        {/* Calendar */}
                        <div style={{ ...card, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(${C.p},${C.a})` }} />
                                <p style={{ fontFamily: C.display, color: C.p, fontSize: 16, margin: 0 }}>ប្រតិទិន</p>
                            </div>
                            <Calendar events={calEvents} />
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

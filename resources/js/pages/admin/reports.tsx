/** @jsxImportSource react */
// pages/admin/reports.tsx — Full v2 (all functions working)
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useCallback, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    DollarSign, ShoppingCart, Users, Store, Download, RefreshCw,
    Calendar, FileText, ArrowUpRight, ArrowDownRight, Star, Eye,
    Package, BarChart2, Clock, CheckCircle, AlertCircle, X,
    ChevronRight, TrendingUp,
} from 'lucide-react';

/* ─── Brand colors ─────────────────────────────────── */
const C = {
    bg:'#f9fafb', surface:'#ffffff', border:'#e5e7eb',
    muted:'#9ca3af', sub:'#6b7280', text:'#374151', strong:'#111827',
    p:'#228B22', a:'#32CD32', gold:'#FFD700', goldD:'#ca8a04',
    light:'#90EE90', dark:'#006400',
    bgG:'#f0fdf4', bgY:'#fefce8', bgR:'#fef2f2',
    font:"'Battambang', sans-serif",
    display:"'Moul', serif",
    mono:"'JetBrains Mono', monospace",
};
const CAT_COLORS = [C.p,C.a,C.light,C.goldD,C.dark,'#4ade80','#16a34a','#15803d'];
const card: React.CSSProperties = {
    background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
};

/* ─── Types ─────────────────────────────────────────── */
interface KeyMetrics {
    total_revenue:number; total_orders:number; new_users:number;
    active_sellers:number; revenue_growth:number; orders_growth:number;
    users_growth:number; avg_order_value:number;
}
interface SalesByCategory { name:string; revenue:number; units_sold:number; orders:number; }
interface DailyPoint      { date:string; revenue:number; orders:number; }
interface DailyUserPoint  { date:string; users:number; }
interface TopSeller  { name:string; revenue:number; orders:number; units_sold:number; rating:number; rating_count:number; }
interface TopProduct { name:string; category:string; revenue:number; units_sold:number; views:number; unit:string; }
interface StatusBreak{ status:string; count:number; total:number; }
interface PayBreak   { method:string; count:number; total:number; }
interface InitialData {
    key_metrics:KeyMetrics; sales_summary:Record<string,number>;
    sales_by_category:SalesByCategory[]; daily_revenue:DailyPoint[];
    daily_user_growth:DailyUserPoint[]; top_sellers:TopSeller[];
    top_products:TopProduct[]; order_status_breakdown:StatusBreak[];
    payment_method_breakdown:PayBreak[];
}
interface RecentArchive {
    id:number; report_type:string; period:string;
    generated_at:string; generated_by:string;
}
interface GeneratedReport {
    success:boolean; report_type:string; archive_id:number|null;
    period:{ start:string; end:string; label:string; };
    data:{
        summary?:Record<string,number>;
        by_category?:SalesByCategory[]; daily_revenue?:DailyPoint[];
        daily_growth?:DailyUserPoint[]; top_sellers?:TopSeller[];
        top_products?:TopProduct[]; by_role?:{role:string;count:number}[];
        by_status?:any[]; by_payment_method?:PayBreak[];
        by_province?:{province:string;count:number}[];
    };
}

/* ─── Formatters ────────────────────────────────────── */
const fmtKHR = (n:number) => {
    if (!n||isNaN(n)) return '0 ៛';
    if (n>=1_000_000) return `${(n/1_000_000).toFixed(1)}M ៛`;
    if (n>=1_000)     return `${(n/1_000).toFixed(0)}K ៛`;
    return `${n.toFixed(0)} ៛`;
};
const fmtNum = (n:number) => (n??0).toLocaleString();
const fmtPct = (n:number) => `${n>=0?'+':''}${(n??0).toFixed(1)}%`;

/* ─── UI atoms ──────────────────────────────────────── */
const TrendBadge = ({val}:{val:number}) => (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20,
        color:val>=0?'#166534':'#991b1b', background:val>=0?'#dcfce7':'#fee2e2',
        display:'inline-flex', alignItems:'center', gap:3 }}>
        {val>=0?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{fmtPct(val)}
    </span>
);

const LightTooltip = ({active,payload,label}:any) => {
    if (!active||!payload?.length) return null;
    return (
        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', fontSize:11, boxShadow:'0 4px 16px rgba(0,0,0,0.10)' }}>
            <p style={{ color:C.sub, marginBottom:4, fontWeight:600 }}>{label}</p>
            {payload.map((p:any,i:number) => (
                <p key={i} style={{ color:p.color, margin:0, fontWeight:700 }}>
                    {p.name}: {typeof p.value==='number'&&p.value>999?fmtKHR(p.value):fmtNum(p.value)}
                </p>
            ))}
        </div>
    );
};

// const Stars = ({rating}:{rating:number}) => (
//     <span style={{ display:'inline-flex', alignItems:'center', gap:1 }}>
//         {[1,2,3,4,5].map(i=>(
//             <Star key={i} size={10}
//                 fill={i<=Math.round(rating)?C.goldD:'none'}
//                 color={i<=Math.round(rating)?C.goldD:C.muted}/>
//         ))}
//         <span style={{ fontSize:10, color:C.sub, marginLeft:3 }}>{(rating||0).toFixed(1)}</span>
//     </span>
// );
// In the Stars component, change:
const Stars = ({rating}:{rating:number}) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:1 }}>
        {[1,2,3,4,5].map(i=>(
            <Star key={i} size={10}
                fill={i<=Math.round(Number(rating))?C.goldD:'none'}  // ← Number() cast
                color={i<=Math.round(Number(rating))?C.goldD:C.muted}/>
        ))}
        <span style={{ fontSize:10, color:C.sub, marginLeft:3 }}>{(Number(rating)||0).toFixed(1)}</span>
    </span>
);

const Rank = ({n}:{n:number}) => {
    const colors=[C.goldD,'#94a3b8','#b45309',C.p,C.p];
    return (
        <span style={{ width:22, height:22, borderRadius:6, background:colors[n]||C.p, color:'#fff',
            fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {n+1}
        </span>
    );
};

const SectionTitle = ({title,sub}:{title:string;sub?:string}) => (
    <div style={{ marginBottom:14 }}>
        <p style={{ fontFamily:C.display, color:C.p, fontSize:14, margin:0 }}>{title}</p>
        {sub&&<p style={{ color:C.sub, fontSize:11, margin:'3px 0 0' }}>{sub}</p>}
    </div>
);

const STATUS_MAP:Record<string,[string,string,string]> = {
    completed: ['#166534','#dcfce7','បានបញ្ចប់'],
    processing:['#1e40af','#dbeafe','កំពុងដំណើរ'],
    confirmed: ['#166534','#dcfce7','បានបញ្ជាក់'],
    cancelled: ['#991b1b','#fee2e2','បានបោះបង់'],
    pending:   ['#854d0e','#fef9c3','រង់ចាំ'],
};
const StatusChip = ({s}:{s:string}) => {
    const [fg,bg,lbl]=STATUS_MAP[s]??STATUS_MAP.pending;
    return <span style={{ color:fg, background:bg, borderRadius:20, padding:'2px 9px', fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{lbl}</span>;
};

const EmptyRow = ({cols,msg='មិនមានទិន្នន័យ'}:{cols:number;msg?:string}) => (
    <tr><td colSpan={cols} style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>{msg}</td></tr>
);

/* ─── Toast ─────────────────────────────────────────── */
type ToastKind = 'success'|'error'|'info';
const Toast = ({msg,kind,onClose}:{msg:string;kind:ToastKind;onClose:()=>void}) => {
    const colors:Record<ToastKind,[string,string]> = {
        success:[C.p,'#dcfce7'], error:['#dc2626','#fee2e2'], info:['#1e40af','#dbeafe'],
    };
    const [fg,bg]=colors[kind];
    useEffect(()=>{ const t=setTimeout(onClose,4000); return ()=>clearTimeout(t); },[]);
    return (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:bg,
            border:`1px solid ${fg}40`, borderRadius:12, padding:'12px 16px',
            display:'flex', alignItems:'center', gap:10,
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)', minWidth:280, fontFamily:C.font }}>
            {kind==='success'&&<CheckCircle size={16} color={fg}/>}
            {kind==='error'&&<AlertCircle size={16} color={fg}/>}
            {kind==='info'&&<TrendingUp size={16} color={fg}/>}
            <span style={{ fontSize:13, fontWeight:600, color:fg, flex:1 }}>{msg}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:fg, display:'flex', alignItems:'center' }}><X size={14}/></button>
        </div>
    );
};

/* ─── Spinner icon (inline) ─────────────────────────── */
const Spin = ({size=13}:{size?:number}) => (
    <RefreshCw size={size} style={{ animation:'spin 1s linear infinite', flexShrink:0 }}/>
);

/* ─── Constants ─────────────────────────────────────── */
const REPORT_TYPES = [
    {value:'sales',   label:'ការលក់',  icon:<DollarSign size={13}/>},
    {value:'users',   label:'អ្នកប្រើ', icon:<Users size={13}/>},
    {value:'products',label:'ផលិតផល', icon:<Package size={13}/>},
    {value:'sellers', label:'កសិករ',   icon:<Store size={13}/>},
];
const ARCHIVE_LABELS:Record<string,string> = {
    admin_sales:'ការលក់', admin_users:'អ្នកប្រើ',
    admin_products:'ផលិតផល', admin_sellers:'កសិករ',
};
const TABS = [
    {key:'overview', label:'ទិដ្ឋភាពទូទៅ'},
    {key:'sales',    label:'ការលក់'},
    {key:'users',    label:'អ្នកប្រើ'},
    {key:'products', label:'ផលិតផល'},
    {key:'sellers',  label:'កសិករ'},
    {key:'generated',label:'📄 បានបង្កើត'},
    {key:'archives', label:'📁 ប្រវត្តិ'},
];

/* ═══════════════════════════════════════════════════════
   GENERATED REPORT RENDERER — renders any report type
═══════════════════════════════════════════════════════ */
const GeneratedReportView = ({report,onExport}:{report:GeneratedReport;onExport:()=>void}) => {
    const {data,report_type,period} = report;
    const typeLabel = REPORT_TYPES.find(r=>r.value===report_type)?.label ?? report_type;
    const btnOut:React.CSSProperties = {
        background:C.bgG, color:C.p, border:`1px solid #d1fae5`, borderRadius:9,
        padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, fontFamily:C.font,
    };
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Header */}
            <div style={{ ...card, borderLeft:`4px solid ${C.p}`, padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                    <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                            <span style={{ background:C.bgG, color:C.p, border:`1px solid #86efac`, borderRadius:6, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{typeLabel}</span>
                            {report.archive_id&&(
                                <span style={{ background:C.bgY, color:C.goldD, border:`1px solid #fde68a`, borderRadius:6, padding:'2px 10px', fontSize:11, fontWeight:700 }}>Archive #{report.archive_id}</span>
                            )}
                            <span style={{ background:'#f0f9ff', color:'#0369a1', border:'1px solid #bae6fd', borderRadius:6, padding:'2px 10px', fontSize:11, fontWeight:700 }}>✓ រក្សាទុករួច</span>
                        </div>
                        <p style={{ fontFamily:C.display, color:C.p, fontSize:17, margin:'0 0 4px' }}>របាយការណ៍{typeLabel}</p>
                        <p style={{ color:C.sub, fontSize:12, margin:0, display:'flex', alignItems:'center', gap:5 }}>
                            <Calendar size={12}/> {period?.label}
                            <span style={{ margin:'0 4px', color:C.border }}>·</span>
                            <Clock size={12}/> {new Date().toLocaleTimeString('km-KH')}
                        </p>
                    </div>
                    <button style={btnOut} onClick={onExport}><Download size={13}/> នាំចេញ</button>
                </div>
            </div>

            {/* Summary metrics */}
            {data?.summary&&Object.keys(data.summary).length>0&&(
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:12 }}>
                    {Object.entries(data.summary).map(([k,v],i)=>(
                        <div key={k} style={{ ...card, padding:'14px 16px', borderTop:`3px solid ${CAT_COLORS[i%CAT_COLORS.length]}` }}>
                            <p style={{ fontSize:16, color:C.sub, margin:'0 0 4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.replace(/_/g,' ')}</p>
                            <p style={{ fontSize:19, fontWeight:700, color:CAT_COLORS[i%CAT_COLORS.length], margin:0 }}>
                                {typeof v==='number'&&v>999?fmtKHR(v):fmtNum(v as number)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Daily revenue */}
            {data?.daily_revenue&&data.daily_revenue.length>0&&(
                <div style={card}>
                    <SectionTitle title="ចំណូលប្រចាំថ្ងៃ" sub="Daily revenue trend"/>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.daily_revenue} margin={{top:4,right:4,left:-15,bottom:0}}>
                            <defs>
                                <linearGradient id="gDR" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={C.p} stopOpacity={0.2}/><stop offset="100%" stopColor={C.p} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4"/>
                            <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                            <Tooltip content={<LightTooltip/>}/>
                            <Area type="monotone" dataKey="revenue" name="ចំណូល" stroke={C.p} strokeWidth={2} fill="url(#gDR)" dot={false} activeDot={{r:4}}/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* By category */}
            {data?.by_category&&data.by_category.length>0&&(
                <div style={card}>
                    <SectionTitle title="ការលក់តាមប្រភេទ" sub="Revenue by category"/>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.by_category} margin={{top:4,right:4,left:-15,bottom:0}}>
                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" vertical={false}/>
                            <XAxis dataKey="name" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                            <Tooltip content={<LightTooltip/>}/>
                            <Bar dataKey="revenue" name="ចំណូល" radius={[4,4,0,0]} barSize={28}>
                                {data.by_category.map((_,i)=><Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]}/>)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Daily user growth */}
            {data?.daily_growth&&data.daily_growth.length>0&&(
                <div style={card}>
                    <SectionTitle title="ការលូតលាស់អ្នកប្រើ" sub="New registrations per day"/>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.daily_growth} margin={{top:4,right:4,left:-20,bottom:0}}>
                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4"/>
                            <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                            <Tooltip content={<LightTooltip/>}/>
                            <Line type="monotone" dataKey="users" name="អ្នកប្រើថ្មី" stroke={C.p} strokeWidth={2.5} dot={{fill:C.p,r:3}} activeDot={{r:5}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* By role + by status (users report) */}
            {data?.by_role&&data.by_role.length>0&&(
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div style={card}>
                        <SectionTitle title="ចែកតាមតួនាទី" sub="Users by role"/>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={data.by_role} dataKey="count" nameKey="role" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                    {data.by_role.map((_,i)=><Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]} stroke="none"/>)}
                                </Pie>
                                <Tooltip formatter={(v,n)=>[fmtNum(v as number),n]} contentStyle={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:4 }}>
                            {data.by_role.map((r,i)=>(
                                <div key={r.role} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                                    <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <span style={{ width:8, height:8, borderRadius:2, background:CAT_COLORS[i], display:'inline-block' }}/>
                                        <span style={{ color:C.text }}>{r.role}</span>
                                    </span>
                                    <span style={{ fontWeight:700, color:C.strong }}>{fmtNum(r.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {data.by_status&&(
                        <div style={card}>
                            <SectionTitle title="ចែកតាមស្ថានភាព" sub="Users by account status"/>
                            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                                {(data.by_status as any[]).map((s:any,i)=>(
                                    <div key={s.status??s.role} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                                        <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{s.status??s.role}</span>
                                        <span style={{ fontSize:14, fontWeight:700, color:CAT_COLORS[i%CAT_COLORS.length] }}>{fmtNum(s.count)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Top sellers */}
            {data?.top_sellers&&data.top_sellers.length>0&&(
                <div style={card}>
                    <SectionTitle title="កសិករល្អបំផុត" sub="Top performers by revenue"/>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead><tr>
                            {['#','ឈ្មោះ','ចំណូល','ការបញ្ជា','ទំនិញ','ការវាយតម្លៃ'].map(h=>(
                                <th key={h} style={{ textAlign:'left', padding:'0 10px 10px', fontSize:10, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {data.top_sellers.map((s,i)=>(
                                <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                                    style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s', cursor:'pointer' }}>
                                    <td style={{ padding:'11px 10px' }}><Rank n={i}/></td>
                                    <td style={{ padding:'11px 10px', fontSize:13, fontWeight:600, color:C.strong }}>{s.name}</td>
                                    <td style={{ padding:'11px 10px', fontSize:13, fontWeight:700, color:C.p }}>{fmtKHR(s.revenue)}</td>
                                    <td style={{ padding:'11px 10px', fontSize:12, color:C.sub }}>{fmtNum(s.orders)}</td>
                                    <td style={{ padding:'11px 10px', fontSize:12, color:C.sub }}>{fmtNum(s.units_sold)}</td>
                                    <td style={{ padding:'11px 10px' }}><Stars rating={s.rating}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* By province */}
            {data?.by_province&&data.by_province.length>0&&(
                <div style={card}>
                    <SectionTitle title="កសិករតាមខេត្ត" sub="Seller distribution by province"/>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.by_province} layout="vertical" margin={{top:4,right:10,left:80,bottom:0}}>
                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" horizontal={false}/>
                            <XAxis type="number" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                            <YAxis dataKey="province" type="category" tick={{fill:C.text,fontSize:11}} axisLine={false} tickLine={false} width={80}/>
                            <Tooltip content={<LightTooltip/>}/>
                            <Bar dataKey="count" name="កសិករ" fill={C.p} radius={[0,4,4,0]} barSize={14}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top products */}
            {data?.top_products&&data.top_products.length>0&&(
                <div style={card}>
                    <SectionTitle title="ផលិតផលល្អបំផុត" sub="Top products by revenue"/>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead><tr>
                            {['#','ឈ្មោះ','ប្រភេទ','ចំណូល','ទំនិញ','Views','ឯកតា'].map(h=>(
                                <th key={h} style={{ textAlign:'left', padding:'0 10px 10px', fontSize:10, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {data.top_products.map((p,i)=>(
                                <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                                    style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}>
                                    <td style={{ padding:'11px 10px' }}><Rank n={i}/></td>
                                    <td style={{ padding:'11px 10px', fontSize:13, fontWeight:600, color:C.strong }}>{p.name}</td>
                                    <td style={{ padding:'11px 10px' }}><span style={{ fontSize:10, background:C.bgG, color:C.p, borderRadius:6, padding:'2px 8px', fontWeight:600 }}>{p.category}</span></td>
                                    <td style={{ padding:'11px 10px', fontSize:13, fontWeight:700, color:C.p }}>{fmtKHR(p.revenue)}</td>
                                    <td style={{ padding:'11px 10px', fontSize:12, color:C.sub }}>{fmtNum(p.units_sold)}</td>
                                    <td style={{ padding:'11px 10px', fontSize:11, color:C.sub, whiteSpace:'nowrap' }}><Eye size={11} style={{verticalAlign:'middle',marginRight:2}}/>{fmtNum(p.views)}</td>
                                    <td style={{ padding:'11px 10px', fontSize:11, color:C.muted }}>{p.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payment methods */}
            {data?.by_payment_method&&data.by_payment_method.length>0&&(
                <div style={card}>
                    <SectionTitle title="វិធីសាស្ត្រទូទាត់" sub="Payment method distribution"/>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                        {data.by_payment_method.map((pm,i)=>(
                            <div key={pm.method} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 14px' }}>
                                <p style={{ fontSize:10, color:C.sub, margin:'0 0 4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{pm.method}</p>
                                <p style={{ fontSize:18, fontWeight:700, color:CAT_COLORS[i%CAT_COLORS.length], margin:'0 0 2px' }}>{fmtNum(pm.count)}</p>
                                <p style={{ fontSize:11, color:C.muted, margin:0 }}>{fmtKHR(pm.total)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function AdminReports({
    initialData, recentArchives,
}: PageProps<{initialData:InitialData; recentArchives:RecentArchive[]}>) {

    const d  = initialData  ?? {} as InitialData;
    const km = (d.key_metrics ?? {}) as KeyMetrics;

    const today = new Date().toISOString().split('T')[0];
    const d30   = new Date(Date.now()-29*86400000).toISOString().split('T')[0];

    const [startDate,     setStartDate]     = useState(d30);
    const [endDate,       setEndDate]       = useState(today);
    const [activeTab,     setActiveTab]     = useState('overview');
    const [reportType,    setReportType]    = useState('sales');
    const [loading,       setLoading]       = useState(false);
    const [generated,     setGenerated]     = useState<GeneratedReport|null>(null);
    const [archives,      setArchives]      = useState<RecentArchive[]>(recentArchives??[]);
    const [toast,         setToast]         = useState<{msg:string;kind:ToastKind}|null>(null);
    const [archiveLoading,setArchiveLoading]= useState<number|null>(null);
    const [viewArchive,   setViewArchive]   = useState<any>(null);

    const showToast = (msg:string,kind:ToastKind='success') => setToast({msg,kind});
    const getCsrf   = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    /* Generate */
    const handleGenerate = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setGenerated(null);
        try {
            const res = await fetch('/admin/reports/generate', {
                method:'POST',
                headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':getCsrf()},
                body:JSON.stringify({report_type:reportType,start_date:startDate,end_date:endDate,save:true}),
            });
            if (!res.ok) {
                const err = await res.json().catch(()=>({})) as any;
                // validation errors from Laravel
                if (res.status===422&&err.errors) {
                    const msgs = Object.values(err.errors as Record<string,string[]>).flat().join(', ');
                    throw new Error(msgs);
                }
                throw new Error(err.message??`HTTP ${res.status}`);
            }
            const json:GeneratedReport = await res.json();
            if (json.success) {
                setGenerated(json);
                setActiveTab('generated');
                showToast('បានបង្កើតរបាយការណ៍ជោគជ័យ!','success');
                if (json.archive_id) {
                    setArchives(prev=>[{
                        id:json.archive_id!, report_type:'admin_'+reportType,
                        period:json.period.label, generated_at:'ទើបបង្កើត', generated_by:'Admin',
                    },...prev.slice(0,9)]);
                }
            } else {
                showToast('មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍','error');
            }
        } catch(e:any) {
            console.error('Report error:',e);
            showToast(`Error: ${e.message??'Unknown'}`, 'error');
        } finally {
            setLoading(false);
        }
    },[reportType,startDate,endDate,loading]);

    /* Export CSV */
    const handleExport = useCallback(()=>{
        const p=new URLSearchParams({report_type:reportType,start_date:startDate,end_date:endDate});
        showToast('កំពុង Export CSV...','info');
        window.location.href=`/admin/reports/export/csv?${p}`;
    },[reportType,startDate,endDate]);

    /* Load archive */
    const handleViewArchive = useCallback(async(id:number)=>{
        setArchiveLoading(id);
        setViewArchive(null);
        try {
            const res = await fetch(`/admin/reports/archive/${id}`,{
                headers:{'Accept':'application/json','X-CSRF-TOKEN':getCsrf()},
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.success) {
                setViewArchive(json.archive);
                showToast('បានផ្ទុករបាយការណ៍','info');
            }
        } catch(e:any) {
            showToast(`Error: ${e.message}`,'error');
        } finally {
            setArchiveLoading(null);
        }
    },[]);

    const setQuickRange = (days:number)=>{
        setStartDate(new Date(Date.now()-(days-1)*86400000).toISOString().split('T')[0]);
        setEndDate(today);
    };

    /* Styles */
    const btnPrimary:React.CSSProperties = {
        background:loading?'#6b9e6b':C.p, color:'#fff', border:'none', borderRadius:9,
        padding:'9px 18px', fontSize:12, fontWeight:700,
        cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:7,
        fontFamily:C.font, transition:'background 0.2s',
        boxShadow:loading?'none':`0 2px 8px ${C.p}44`,
    };
    const btnOutline:React.CSSProperties = {
        background:C.bgG, color:C.p, border:`1px solid #d1fae5`, borderRadius:9,
        padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, fontFamily:C.font,
    };
    const inputStyle:React.CSSProperties = {
        background:C.surface, border:`1px solid ${C.border}`, borderRadius:9,
        padding:'8px 12px', fontSize:12, color:C.strong, fontFamily:C.font, outline:'none',
    };
    const tabStyle=(active:boolean):React.CSSProperties=>({
        padding:'8px 16px', borderRadius:8, fontSize:12,
        fontWeight:active?700:500, background:active?C.p:'transparent',
        color:active?'#fff':C.sub, border:'none', cursor:'pointer',
        fontFamily:C.font, transition:'all 0.15s', whiteSpace:'nowrap',
    });

    return (
        <AppLayout>
            <Head title="របាយការណ៍ - Admin"/>
            {/* <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Battambang:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
            </Head> */}

            {toast&&<Toast msg={toast.msg} kind={toast.kind} onClose={()=>setToast(null)}/>}

            <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.font, color:C.text }}>
                <div style={{ maxWidth:1440, margin:'0 auto', padding:'28px 24px', display:'flex', flexDirection:'column', gap:20 }}>

                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:42, height:42, borderRadius:11, background:`linear-gradient(135deg,${C.p},${C.dark})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${C.p}44` }}>
                                <BarChart2 size={20} color="#fff"/>
                            </div>
                            <div>
                                <h1 style={{ fontFamily:C.display, color:C.p, fontSize:20, margin:0 }}>របាយការណ៍ & ស្ថិតិ</h1>
                                <p style={{ color:C.sub, fontSize:12, margin:0 }}>
                                    {new Date().toLocaleDateString('km-KH',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
                                </p>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <button style={btnOutline} onClick={handleExport}><Download size={13}/> Export CSV</button>
                            <button style={btnPrimary} onClick={handleGenerate} disabled={loading}>
                                {loading?<><Spin/> កំពុងបង្កើត...</>:<><FileText size={13}/> បង្កើតរបាយការណ៍</>}
                            </button>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div style={{ ...card, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                        <span style={{ fontSize:16, color:C.sub, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                            <Calendar size={13}/> រយៈពេល
                        </span>
                        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle}/>
                        <span style={{ color:C.muted }}>—</span>
                        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle}/>
                        <div style={{ width:1, height:24, background:C.border, margin:'0 4px' }}/>
                        <span style={{ fontSize:16, color:C.sub, fontWeight:600 }}>ប្រភេទ</span>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {REPORT_TYPES.map(rt=>(
                                <button key={rt.value} onClick={()=>setReportType(rt.value)}
                                    style={{ padding:'6px 12px', borderRadius:8, fontSize:16, fontWeight:600,
                                        background:reportType===rt.value?C.bgG:'transparent',
                                        color:reportType===rt.value?C.p:C.sub,
                                        border:reportType===rt.value?'1px solid #86efac':`1px solid ${C.border}`,
                                        cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                                        fontFamily:C.font, transition:'all 0.15s' }}>
                                    {rt.icon} {rt.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                            {[{l:'7ថ្ងៃ',d:7},{l:'30ថ្ងៃ',d:30},{l:'90ថ្ងៃ',d:90}].map(r=>(
                                <button key={r.d} onClick={()=>setQuickRange(r.d)}
                                    style={{ padding:'5px 10px', borderRadius:7, fontSize:14, background:C.bgG, color:C.p, border:'1px solid #d1fae5', cursor:'pointer', fontFamily:C.font, fontWeight:600 }}>
                                    {r.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display:'flex', gap:4, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:4, width:'fit-content', flexWrap:'wrap' }}>
                        {TABS.map(t=>(
                            <button key={t.key} style={tabStyle(activeTab===t.key)} onClick={()=>setActiveTab(t.key)}>
                                {t.label}
                                {t.key==='generated'&&generated&&(
                                    <span style={{ marginLeft:4, width:6, height:6, borderRadius:'50%', background:C.a, display:'inline-block' }}/>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab==='overview'&&(
                        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                            {/* KPI */}
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                                {[
                                    {label:'ចំណូលសរុប',       value:fmtKHR(km.total_revenue??0),  growth:km.revenue_growth??0, icon:<DollarSign size={18} color={C.p}/>,    bg:C.bgG, bl:C.p},
                                    {label:'ការបញ្ជាទិញ',     value:fmtNum(km.total_orders??0),   growth:km.orders_growth??0,  icon:<ShoppingCart size={18} color={C.goldD}/>,bg:C.bgY,bl:C.gold},
                                    {label:'អ្នកប្រើប្រាស់ថ្មី',value:fmtNum(km.new_users??0),     growth:km.users_growth??0,   icon:<Users size={18} color={C.dark}/>,        bg:C.bgG,bl:C.dark},
                                    {label:'កសិករសកម្ម',       value:fmtNum(km.active_sellers??0), growth:0,                    icon:<Store size={18} color={C.a}/>,           bg:C.bgG,bl:C.a},
                                ].map(k=>(
                                    <div key={k.label} style={{ ...card, borderLeft:`4px solid ${k.bl}`, padding:18, transition:'box-shadow 0.2s,transform 0.2s' }}
                                        onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.10)';(e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)';}}
                                        onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.06)';(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';}}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                            <div style={{ width:38, height:38, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>{k.icon}</div>
                                            <TrendBadge val={k.growth}/>
                                        </div>
                                        <p style={{ fontSize:16, color:C.sub, margin:'12px 0 2px', fontWeight:500 }}>{k.label}</p>
                                        <p style={{ fontSize:28, fontWeight:700, color:C.strong, margin:0 }}>{k.value}</p>
                                        <p style={{ fontSize:14, color:C.muted, margin:'4px 0 0' }}>AOV: {fmtKHR(km.avg_order_value??0)}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Area + Pie */}
                            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
                                <div style={card}>
                                    <SectionTitle title="ចំណូលប្រចាំថ្ងៃ" sub="ចំណូល និងការបញ្ជាទិញ"/>
                                    <ResponsiveContainer width="100%" height={230}>
                                        <AreaChart data={d.daily_revenue??[]} margin={{top:4,right:4,left:-15,bottom:0}}>
                                            <defs>
                                                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={C.p} stopOpacity={0.22}/><stop offset="100%" stopColor={C.p} stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={C.goldD} stopOpacity={0.18}/><stop offset="100%" stopColor={C.goldD} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4"/>
                                            <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                                            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                                            <Tooltip content={<LightTooltip/>}/>
                                            <Area type="monotone" dataKey="revenue" name="ចំណូល" stroke={C.p} strokeWidth={2} fill="url(#gR)" dot={false} activeDot={{r:4}}/>
                                            <Area type="monotone" dataKey="orders" name="ការបញ្ជា" stroke={C.goldD} strokeWidth={2} fill="url(#gO)" dot={false} activeDot={{r:4}}/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={card}>
                                    <SectionTitle title="ស្ថានភាពការបញ្ជា" sub="Order status breakdown"/>
                                    <ResponsiveContainer width="100%" height={170}>
                                        <PieChart>
                                            <Pie data={d.order_status_breakdown??[]} dataKey="count" nameKey="status" innerRadius={48} outerRadius={72} paddingAngle={3} startAngle={90} endAngle={-270}>
                                                {(d.order_status_breakdown??[]).map((_,i)=><Cell key={i} fill={CAT_COLORS[i]??C.p} stroke="none"/>)}
                                            </Pie>
                                            <Tooltip formatter={(v,n)=>[fmtNum(v as number),n]} contentStyle={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                        {(d.order_status_breakdown??[]).map((s,i)=>(
                                            <div key={s.status} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                    <span style={{ width:8, height:8, borderRadius:2, background:CAT_COLORS[i], display:'inline-block' }}/>
                                                    <StatusChip s={s.status}/>
                                                </div>
                                                <span style={{ fontWeight:700, color:C.strong }}>{fmtNum(s.count)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Category + User growth */}
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                <div style={card}>
                                    <SectionTitle title="ការលក់តាមប្រភេទ" sub="ចំណូលតាមរយៈប្រភេទកសិផល"/>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={d.sales_by_category??[]} layout="vertical" margin={{top:4,right:10,left:60,bottom:0}}>
                                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" horizontal={false}/>
                                            <XAxis type="number" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                                            <YAxis dataKey="name" type="category" tick={{fill:C.text,fontSize:11}} axisLine={false} tickLine={false} width={60}/>
                                            <Tooltip content={<LightTooltip/>}/>
                                            <Bar dataKey="revenue" name="ចំណូល" fill={C.p} radius={[0,4,4,0]} barSize={14}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={card}>
                                    <SectionTitle title="ការលូតលាស់អ្នកប្រើ" sub="អ្នកចុះឈ្មោះក្នុងមួយថ្ងៃ"/>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={d.daily_user_growth??[]} margin={{top:4,right:4,left:-20,bottom:0}}>
                                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" vertical={false}/>
                                            <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                                            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                                            <Tooltip content={<LightTooltip/>}/>
                                            <Bar dataKey="users" name="អ្នកប្រើថ្មី" fill={C.a} radius={[4,4,0,0]} barSize={10}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            {/* Tables row */}
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                <div style={card}>
                                    <SectionTitle title="អ្នកលក់ដែលល្អបំផុត" sub="អ្នកលក់ដែលល្អបំផុតតាមរយៈការបញ្ជាទិញ"/>
                                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                        <thead><tr>{['#','ឈ្មោះ','ចំណូល','ការបញ្ជាទិញ','ការវាយតម្លៃ'].map(h=><th key={h} style={{ textAlign:'left', padding:'0 8px 10px', fontSize:10, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {(d.top_sellers??[]).map((s,i)=>(
                                                <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')} style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s', cursor:'pointer' }}>
                                                    <td style={{ padding:'10px 8px' }}><Rank n={i}/></td>
                                                    <td style={{ padding:'10px 8px', fontSize:12, fontWeight:600, color:C.strong }}>{s.name}</td>
                                                    <td style={{ padding:'10px 8px', fontSize:12, fontWeight:700, color:C.p }}>{fmtKHR(s.revenue)}</td>
                                                    <td style={{ padding:'10px 8px', fontSize:12, color:C.sub }}>{fmtNum(s.orders)}</td>
                                                    <td style={{ padding:'10px 8px' }}><Stars rating={s.rating}/></td>
                                                </tr>
                                            ))}
                                            {!d.top_sellers?.length&&<EmptyRow cols={5}/>}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={card}>
                                    <SectionTitle title="ផលិតផលដែលលក់ដាច់បំផុត" sub="Top products by revenue"/>
                                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                        <thead><tr>{['#','ឈ្មោះ','ប្រភេទ','ចំណូល','Views'].map(h=><th key={h} style={{ textAlign:'left', padding:'0 8px 10px', fontSize:10, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {(d.top_products??[]).map((p,i)=>(
                                                <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')} style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s', cursor:'pointer' }}>
                                                    <td style={{ padding:'10px 8px' }}><Rank n={i}/></td>
                                                    <td style={{ padding:'10px 8px', fontSize:12, fontWeight:600, color:C.strong }}>{p.name}</td>
                                                    <td style={{ padding:'10px 8px' }}><span style={{ fontSize:10, background:C.bgG, color:C.p, borderRadius:6, padding:'2px 7px', fontWeight:600 }}>{p.category}</span></td>
                                                    <td style={{ padding:'10px 8px', fontSize:12, fontWeight:700, color:C.p }}>{fmtKHR(p.revenue)}</td>
                                                    <td style={{ padding:'10px 8px', fontSize:11, color:C.sub, whiteSpace:'nowrap' }}><Eye size={11} style={{verticalAlign:'middle',marginRight:2}}/>{fmtNum(p.views)}</td>
                                                </tr>
                                            ))}
                                            {!d.top_products?.length&&<EmptyRow cols={5}/>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Payment methods */}
                            <div style={card}>
                                <SectionTitle title="វិធីសាស្ត្រទូទាត់" sub="Payment method distribution"/>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
                                    {(d.payment_method_breakdown??[]).map((pm,i)=>{
                                        const maxC=Math.max(...(d.payment_method_breakdown??[]).map(x=>x.count),1);
                                        return (
                                            <div key={pm.method} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
                                                <p style={{ fontSize:11, color:C.sub, margin:'0 0 6px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{pm.method}</p>
                                                <p style={{ fontSize:20, fontWeight:700, color:CAT_COLORS[i]??C.p, margin:'0 0 2px' }}>{fmtNum(pm.count)}</p>
                                                <p style={{ fontSize:11, color:C.muted, margin:'0 0 8px' }}>{fmtKHR(pm.total)}</p>
                                                <div style={{ height:3, background:'#f3f4f6', borderRadius:2, overflow:'hidden' }}>
                                                    <div style={{ width:`${Math.min(100,(pm.count/maxC)*100)}%`, height:'100%', background:CAT_COLORS[i]??C.p, borderRadius:2 }}/>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!d.payment_method_breakdown?.length&&<p style={{ color:C.muted, fontSize:13 }}>មិនមានទិន្នន័យ</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SALES TAB ── */}
                    {activeTab==='sales'&&(
                        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                                {[
                                    {label:'ចំណូលសរុប',         value:fmtKHR(km.total_revenue??0),                    color:C.p},
                                    {label:'ចំណូលបានទូទាត់',   value:fmtKHR(d.sales_summary?.paid_revenue??0),       color:C.dark},
                                    {label:'ការបញ្ជាមធ្យម',    value:fmtKHR(km.avg_order_value??0),                  color:C.goldD},
                                    {label:'ការបញ្ជាទាំងអស់',   value:fmtNum(km.total_orders??0),                    color:C.p},
                                    {label:'ការបញ្ជាបានបញ្ចប់', value:fmtNum(d.sales_summary?.completed_orders??0),  color:C.a},
                                    {label:'ការបញ្ជាបានបោះបង់', value:fmtNum(d.sales_summary?.cancelled_orders??0),  color:'#dc2626'},
                                ].map(m=>(
                                    <div key={m.label} style={{ ...card, padding:'16px 18px' }}>
                                        <p style={{ fontSize:11, color:C.sub, margin:'0 0 6px', fontWeight:500 }}>{m.label}</p>
                                        <p style={{ fontSize:22, fontWeight:700, color:m.color, margin:0 }}>{m.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={card}>
                                <SectionTitle title="ចំណូលប្រចាំថ្ងៃ" sub="Daily revenue over selected period"/>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={d.daily_revenue??[]} margin={{top:4,right:4,left:-15,bottom:0}}>
                                        <defs><linearGradient id="gSA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.p} stopOpacity={0.2}/><stop offset="100%" stopColor={C.p} stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4"/>
                                        <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                                        <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                                        <Tooltip content={<LightTooltip/>}/>
                                        <Area type="monotone" dataKey="revenue" name="ចំណូល" stroke={C.p} strokeWidth={2} fill="url(#gSA)" dot={false} activeDot={{r:4}}/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={card}>
                                <SectionTitle title="ការលក់តាមប្រភេទ" sub="Category revenue breakdown"/>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={d.sales_by_category??[]} margin={{top:4,right:4,left:-15,bottom:0}}>
                                        <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" vertical={false}/>
                                        <XAxis dataKey="name" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                                        <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtKHR(v)}/>
                                        <Tooltip content={<LightTooltip/>}/>
                                        <Bar dataKey="revenue" name="ចំណូល" radius={[4,4,0,0]} barSize={28}>
                                            {(d.sales_by_category??[]).map((_,i)=><Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]}/>)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── USERS TAB ── */}
                    {activeTab==='users'&&(
                        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                                {[
                                    {label:'អ្នកប្រើថ្មី', value:fmtNum(km.new_users??0),   color:C.p},
                                    {label:'កំណើន',        value:fmtPct(km.users_growth??0), color:(km.users_growth??0)>=0?C.p:'#dc2626'},
                                    {label:'ការបញ្ជាទិញ', value:fmtNum(km.total_orders??0), color:C.goldD},
                                ].map(m=>(
                                    <div key={m.label} style={{ ...card, padding:'16px 18px' }}>
                                        <p style={{ fontSize:11, color:C.sub, margin:'0 0 6px' }}>{m.label}</p>
                                        <p style={{ fontSize:22, fontWeight:700, color:m.color, margin:0 }}>{m.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={card}>
                                <SectionTitle title="ការលូតលាស់អ្នកប្រើ" sub="New registrations per day"/>
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={d.daily_user_growth??[]} margin={{top:4,right:4,left:-20,bottom:0}}>
                                        <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4"/>
                                        <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                                        <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                                        <Tooltip content={<LightTooltip/>}/>
                                        <Line type="monotone" dataKey="users" name="អ្នកប្រើថ្មី" stroke={C.p} strokeWidth={2.5} dot={{fill:C.p,r:3}} activeDot={{r:5}}/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── SELLERS TAB ── */}
                    {activeTab==='sellers'&&(
                        <div style={card}>
                            <SectionTitle title="កសិករល្អបំផុត" sub="Full seller performance table"/>
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                <thead><tr>{['#','ឈ្មោះ','ចំណូល','ការបញ្ជា','ទំនិញ','ការវាយតម្លៃ','Reviews'].map(h=><th key={h} style={{ textAlign:'left', padding:'0 10px 12px', fontSize:11, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {(d.top_sellers??[]).map((s,i)=>(
                                        <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')} style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}>
                                            <td style={{ padding:'12px 10px' }}><Rank n={i}/></td>
                                            <td style={{ padding:'12px 10px', fontSize:13, fontWeight:600, color:C.strong }}>{s.name}</td>
                                            <td style={{ padding:'12px 10px', fontSize:13, fontWeight:700, color:C.p }}>{fmtKHR(s.revenue)}</td>
                                            <td style={{ padding:'12px 10px', fontSize:12, color:C.sub }}>{fmtNum(s.orders)}</td>
                                            <td style={{ padding:'12px 10px', fontSize:12, color:C.sub }}>{fmtNum(s.units_sold)}</td>
                                            <td style={{ padding:'12px 10px' }}><Stars rating={s.rating}/></td>
                                            <td style={{ padding:'12px 10px', fontSize:11, color:C.muted }}>{fmtNum(s.rating_count)}</td>
                                        </tr>
                                    ))}
                                    {!d.top_sellers?.length&&<EmptyRow cols={7}/>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── PRODUCTS TAB ── */}
                    {activeTab==='products'&&(
                        <div style={card}>
                            <SectionTitle title="ផលិតផលល្អបំផុត" sub="Products ranked by revenue"/>
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                <thead><tr>{['#','ឈ្មោះ','ប្រភេទ','ចំណូល','ទំនិញ','Views','ឯកតា'].map(h=><th key={h} style={{ textAlign:'left', padding:'0 10px 12px', fontSize:11, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {(d.top_products??[]).map((p,i)=>(
                                        <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')} style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}>
                                            <td style={{ padding:'12px 10px' }}><Rank n={i}/></td>
                                            <td style={{ padding:'12px 10px', fontSize:13, fontWeight:600, color:C.strong }}>{p.name}</td>
                                            <td style={{ padding:'12px 10px' }}><span style={{ fontSize:10, background:C.bgG, color:C.p, borderRadius:6, padding:'2px 8px', fontWeight:600 }}>{p.category}</span></td>
                                            <td style={{ padding:'12px 10px', fontSize:13, fontWeight:700, color:C.p }}>{fmtKHR(p.revenue)}</td>
                                            <td style={{ padding:'12px 10px', fontSize:12, color:C.sub }}>{fmtNum(p.units_sold)}</td>
                                            <td style={{ padding:'12px 10px', fontSize:11, color:C.sub, whiteSpace:'nowrap' }}><Eye size={11} style={{verticalAlign:'middle',marginRight:2}}/>{fmtNum(p.views)}</td>
                                            <td style={{ padding:'12px 10px', fontSize:11, color:C.muted }}>{p.unit}</td>
                                        </tr>
                                    ))}
                                    {!d.top_products?.length&&<EmptyRow cols={7}/>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── GENERATED TAB ── */}
                    {activeTab==='generated'&&(
                        generated
                            ? <GeneratedReportView report={generated} onExport={handleExport}/>
                            : (
                                <div style={{ ...card, padding:52, textAlign:'center' }}>
                                    <div style={{ width:64, height:64, borderRadius:16, background:C.bgG, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                                        <FileText size={28} color={C.p}/>
                                    </div>
                                    <p style={{ fontFamily:C.display, color:C.p, fontSize:16, margin:'0 0 6px' }}>មិនទាន់មានរបាយការណ៍</p>
                                    <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>
                                        ជ្រើសរើសរយៈពេល & ប្រភេទ ហើយចុច "បង្កើតរបាយការណ៍"
                                    </p>
                                    <button style={{ ...btnPrimary, margin:'0 auto' }} onClick={handleGenerate} disabled={loading}>
                                        {loading?<><Spin/> កំពុងបង្កើត...</>:<><FileText size={13}/> បង្កើតឥឡូវ</>}
                                    </button>
                                </div>
                            )
                    )}

                    {/* ── ARCHIVES TAB ── */}
                    {activeTab==='archives'&&(
                        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                            {/* Loaded archive detail */}
                            {viewArchive&&(
                                <div style={{ ...card, borderLeft:`4px solid ${C.goldD}`, padding:'16px 20px' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                        <div>
                                            <p style={{ fontFamily:C.display, color:C.goldD, fontSize:14, margin:0 }}>
                                                Archive #{viewArchive.id} — {ARCHIVE_LABELS[viewArchive.report_type]??viewArchive.report_type}
                                            </p>
                                            <p style={{ color:C.sub, fontSize:11, margin:'3px 0 0', display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
                                                <Calendar size={11}/>{viewArchive.period?.label}
                                                <span style={{ margin:'0 4px' }}>·</span>
                                                <Clock size={11}/>{viewArchive.generated_at}
                                                <span style={{ margin:'0 4px' }}>·</span>
                                                by {viewArchive.generated_by}
                                            </p>
                                        </div>
                                        <button onClick={()=>setViewArchive(null)} style={{ background:C.bgR, color:'#dc2626', border:'1px solid #fecaca', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:C.font }}>
                                            <X size={12}/> បិទ
                                        </button>
                                    </div>
                                    {viewArchive.summary&&Object.keys(viewArchive.summary).length>0&&(
                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
                                            {Object.entries(viewArchive.summary).map(([k,v]:any,i)=>(
                                                <div key={k} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 12px', borderTop:`2px solid ${CAT_COLORS[i%CAT_COLORS.length]}` }}>
                                                    <p style={{ fontSize:9, color:C.muted, margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{k.replace(/_/g,' ')}</p>
                                                    <p style={{ fontSize:16, fontWeight:700, color:CAT_COLORS[i%CAT_COLORS.length], margin:0 }}>
                                                        {typeof v==='number'&&v>999?fmtKHR(v):fmtNum(v)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Archive list */}
                            <div style={card}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                                    <div>
                                        <p style={{ fontFamily:C.display, color:C.p, fontSize:14, margin:0 }}>ប្រវត្តិរបាយការណ៍</p>
                                        <p style={{ color:C.sub, fontSize:11, margin:'3px 0 0' }}>Recently saved · {archives.length} ច្បាប់</p>
                                    </div>
                                </div>
                                {archives.length===0?(
                                    <div style={{ textAlign:'center', padding:'32px 0' }}>
                                        <FileText size={32} color={C.muted} style={{ margin:'0 auto 10px' }}/>
                                        <p style={{ color:C.muted, fontSize:13 }}>មិនទាន់មានប្រវត្តិ · បង្កើតរបាយការណ៍ដំបូង</p>
                                    </div>
                                ):(
                                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                        <thead><tr>
                                            {['ID','ប្រភេទ','រយៈពេល','បង្កើតដោយ','កាលបរិច្ឆេទ',''].map(h=>(
                                                <th key={h} style={{ textAlign:'left', padding:'0 12px 12px', fontSize:10, color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                                            ))}
                                        </tr></thead>
                                        <tbody>
                                            {archives.map(a=>(
                                                <tr key={a.id}
                                                    onMouseEnter={e=>(e.currentTarget.style.background=C.bgG)}
                                                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                                                    style={{ borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}>
                                                    <td style={{ padding:'12px', fontFamily:C.mono, fontSize:12, color:C.p, fontWeight:600 }}>#{a.id}</td>
                                                    <td style={{ padding:'12px' }}>
                                                        <span style={{ background:C.bgG, color:C.p, borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700, border:`1px solid #d1fae5` }}>
                                                            {ARCHIVE_LABELS[a.report_type]??a.report_type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding:'12px', fontSize:12, color:C.text }}>
                                                        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                                            <Calendar size={11} color={C.muted}/>{a.period}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding:'12px', fontSize:12, color:C.sub }}>{a.generated_by??'—'}</td>
                                                    <td style={{ padding:'12px', fontSize:11, color:C.muted }}>
                                                        <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                                                            <Clock size={10}/>{a.generated_at}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding:'12px' }}>
                                                        <button onClick={()=>handleViewArchive(a.id)} disabled={archiveLoading===a.id}
                                                            style={{ background:C.bgG, color:C.p, border:`1px solid #d1fae5`, borderRadius:7, padding:'5px 11px', fontSize:11, fontWeight:600, cursor:archiveLoading===a.id?'wait':'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:C.font, opacity:archiveLoading===a.id?0.6:1 }}>
                                                            {archiveLoading===a.id?<Spin size={11}/>:<Eye size={11}/>} មើល
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>
        </AppLayout>
    );
}

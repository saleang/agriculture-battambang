import { useState } from 'react';
import { Download, TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#228B22', '#90EE90', '#32CD32'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryMetrics {
    total_revenue?: number;
    revenue_growth?: number;
    total_orders?: number;
    orders_growth?: number;
    total_products_sold?: number;
    products_sold_growth?: number;
    avg_order_value?: number;
    avg_order_value_growth?: number;
}

interface MonthlySale {
    month: string;
    sales: number;
    orders: number;
}

interface CategoryItem {
    name: string;
    value: number;
    sales: number;
}

interface TopProduct {
    rank: number;
    name: string;
    sold: number;
    revenue: number;
    unit?: string;
}

interface ReportData {
    summary_metrics?: SummaryMetrics;
    monthly_sales?: MonthlySale[];
    category_breakdown?: CategoryItem[];
    top_products?: TopProduct[];
}

interface ReportsProps {
    auth: any;
    initialData: ReportData;
}

// ─── Quick-select helper ──────────────────────────────────────────────────────

function getQuickSelectDates(value: string): { from: string; to: string } | null {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    switch (value) {
        case 'today': {
            const s = fmt(today);
            return { from: s, to: s };
        }
        case 'week': {
            const d = new Date(today);
            d.setDate(d.getDate() - 7);
            return { from: fmt(d), to: fmt(today) };
        }
        case 'month': {
            const d = new Date(today);
            d.setDate(d.getDate() - 30);
            return { from: fmt(d), to: fmt(today) };
        }
        case 'quarter': {
            const d = new Date(today);
            d.setMonth(d.getMonth() - 3);
            return { from: fmt(d), to: fmt(today) };
        }
        case 'year': {
            return { from: `${today.getFullYear()}-01-01`, to: fmt(today) };
        }
        default:
            return null;
    }
}

// ─── Growth Badge ─────────────────────────────────────────────────────────────

function GrowthBadge({ value }: { value?: number }) {
    const v = value ?? 0;
    const positive = v >= 0;
    return (
        <p className={`text-xs mt-1 flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp className="w-3 h-3 inline" />
            {positive ? '+' : ''}{v.toFixed(1)}% បើប្រៀបនឹងដំណាក់មុន
        </p>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reports({ auth, initialData }: ReportsProps) {
    const [dateFrom, setDateFrom]   = useState('2025-01-01');
    const [dateTo, setDateTo]       = useState('2025-10-31');
    const [quickSelect, setQuickSelect] = useState('custom');
    const [loading, setLoading]     = useState(false);
    const [reportData, setReportData] = useState<ReportData>(initialData ?? {});
    const [errorMsg, setErrorMsg]   = useState<string | null>(null);

    // ── Derived data (safe defaults) ──────────────────────────────────────────
    const summaryMetrics: SummaryMetrics = reportData?.summary_metrics ?? {};
    const monthlySalesData: MonthlySale[]  = reportData?.monthly_sales ?? [];
    const categoryData: CategoryItem[]     = reportData?.category_breakdown ?? [];
    const topProducts: TopProduct[]        = reportData?.top_products ?? [];

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleQuickSelect = (value: string) => {
        setQuickSelect(value);
        const dates = getQuickSelectDates(value);
        if (dates) {
            setDateFrom(dates.from);
            setDateTo(dates.to);
        }
    };

    const handleApplyFilter = async () => {
        if (dateFrom > dateTo) {
            setErrorMsg('កាលបរិច្ឆេទចាប់ផ្ដើមមិនអាចធំជាងកាលបរិច្ឆេទបញ្ចប់បានទេ។');
            return;
        }
        setErrorMsg(null);
        setLoading(true);
        try {
            const response = await axios.post('/seller/reports/generate', {
                start_date: dateFrom,
                end_date: dateTo,
            });

            if (response.data.success) {
                setReportData(response.data.data);
            } else {
                setErrorMsg('បរាជ័យក្នុងការបង្កើតរបាយការណ៍។ សូមព្យាយាមម្ដងទៀត។');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            setErrorMsg('បរាជ័យក្នុងការបង្កើតរបាយការណ៍។ សូមព្យាយាមម្ដងទៀត។');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        const ext = format === 'excel' ? 'xlsx' : format;
        try {
            const response = await axios.post(
                `/seller/reports/export/${format}`,
                { start_date: dateFrom, end_date: dateTo },
                { responseType: 'blob' },
            );

            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href  = url;
            link.setAttribute('download', `sales_report_${dateFrom}_${dateTo}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // ← fix: release memory
        } catch (error) {
            console.error(`Error exporting ${format}:`, error);
            setErrorMsg(`បរាជ័យក្នុងការនាំចេញជា ${format.toUpperCase()}។ សូមព្យាយាមម្ដងទៀត។`);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout>
            <Head title="របាយការណ៍ & វិភាគទិន្នន័យ" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-[#228B22]">
                                របាយការណ៍ & វិភាគទិន្នន័យ
                            </h2>
                            <p className="text-gray-600 mt-1">
                                មើលការយល់ដឹងអំពីអាជីវកម្មកសិដ្ឋានរបស់អ្នក
                            </p>
                        </div>
                        <Button
                            onClick={() => handleExport('pdf')}
                            className="bg-[#228B22] hover:bg-[#1a6b1a]"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            នាំចេញរបាយការណ៍
                        </Button>
                    </div>

                    {/* ── Error Banner ── */}
                    {errorMsg && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {errorMsg}
                        </div>
                    )}

                    {/* ── Date Range Filter ── */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="dateFrom">ចាប់ពីថ្ងៃ</Label>
                                    <Input
                                        id="dateFrom"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            setQuickSelect('custom');
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateTo">រហូតដល់ថ្ងៃ</Label>
                                    <Input
                                        id="dateTo"
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            setQuickSelect('custom');
                                        }}
                                    />
                                </div>
                                <Select value={quickSelect} onValueChange={handleQuickSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ជ្រើសរើសរហ័ស" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">ថ្ងៃនេះ</SelectItem>
                                        <SelectItem value="week">៧ ថ្ងៃចុងក្រោយ</SelectItem>
                                        <SelectItem value="month">៣០ ថ្ងៃចុងក្រោយ</SelectItem>
                                        <SelectItem value="quarter">ត្រីមាសចុងក្រោយ</SelectItem>
                                        <SelectItem value="year">ឆ្នាំនេះ</SelectItem>
                                        <SelectItem value="custom">កំណត់ខ្លួនឯង</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleApplyFilter}
                                    disabled={loading}
                                    className="bg-[#228B22] hover:bg-[#1a6b1a]"
                                >
                                    {loading ? 'កំពុងដំណើរការ...' : 'អនុវត្ត'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Summary Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Revenue */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">ចំណូលសរុប</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            ៛{(summaryMetrics.total_revenue ?? 0).toLocaleString()}
                                        </p>
                                        <GrowthBadge value={summaryMetrics.revenue_growth} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Orders */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <ShoppingCart className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">ការបញ្ជាទិញសរុប</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {summaryMetrics.total_orders ?? 0}
                                        </p>
                                        <GrowthBadge value={summaryMetrics.orders_growth} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products Sold */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">ផលិតផលដែលបានលក់</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {(summaryMetrics.total_products_sold ?? 0).toFixed(2)} គីឡូក្រាម
                                        </p>
                                        <GrowthBadge value={summaryMetrics.products_sold_growth} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Order Value */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">តម្លៃការបញ្ជាទិញជាមធ្យម</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            ៛{(summaryMetrics.avg_order_value ?? 0).toLocaleString()}
                                        </p>
                                        <GrowthBadge value={summaryMetrics.avg_order_value_growth} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Charts Tabs ── */}
                    <Tabs defaultValue="sales" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                            <TabsTrigger value="sales">និន្នាការលក់</TabsTrigger>
                            <TabsTrigger value="categories">ប្រភេទ</TabsTrigger>
                            <TabsTrigger value="products">ផលិតផលពេញនិយម</TabsTrigger>
                        </TabsList>

                        {/* Sales Trends */}
                        <TabsContent value="sales" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-[#228B22]">
                                            ចំណូលលក់ប្រចាំខែ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlySalesData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={monthlySalesData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip formatter={(v: any) => [`៛${Number(v).toLocaleString()}`, 'ចំណូល']} />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="sales"
                                                        stroke="#228B22"
                                                        strokeWidth={2}
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                        name="ចំណូល (៛)"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <EmptyChart />
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-[#228B22]">
                                            ចំនួនការបញ្ជាទិញប្រចាំខែ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlySalesData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={monthlySalesData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip formatter={(v: any) => [v, 'ការបញ្ជាទិញ']} />
                                                    <Legend />
                                                    <Bar dataKey="orders" fill="#228B22" radius={[4, 4, 0, 0]} name="ការបញ្ជាទិញ" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <EmptyChart />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Categories */}
                        <TabsContent value="categories" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-[#228B22]">
                                            ការលក់តាមប្រភេទ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {categoryData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={categoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, value }) => `${name}: ${value}%`}
                                                        outerRadius={100}
                                                        dataKey="value"
                                                    >
                                                        {categoryData.map((_entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={COLORS[index % COLORS.length]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(v: any) => [`${v}%`, 'ចំណែក']} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <EmptyChart />
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-[#228B22]">
                                            ចំណូលតាមប្រភេទ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {categoryData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={categoryData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                                                    <Tooltip formatter={(v: any) => [`៛${Number(v).toLocaleString()}`, 'ចំណូល']} />
                                                    <Legend />
                                                    <Bar dataKey="sales" fill="#228B22" radius={[0, 4, 4, 0]} name="ចំណូល (៛)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <EmptyChart />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Top Products */}
                        <TabsContent value="products" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-[#228B22]">
                                        ផលិតផល ៥ ចំណាត់ថ្នាក់លក់ដាច់ជាងគេ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topProducts.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ចំណាត់ថ្នាក់</TableHead>
                                                        <TableHead>ឈ្មោះផលិតផល</TableHead>
                                                        <TableHead>បរិមាណដែលបានលក់</TableHead>
                                                        <TableHead>ចំណូល (៛)</TableHead>
                                                        <TableHead>សមត្ថភាព</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {topProducts.map((product) => {
                                                        const pct = topProducts[0].sold > 0
                                                            ? Math.round((product.sold / topProducts[0].sold) * 100)
                                                            : 0;
                                                        return (
                                                            <TableRow key={product.rank}>
                                                                <TableCell>
                                                                    <div className="w-8 h-8 rounded-full bg-[#228B22] text-white flex items-center justify-center font-bold text-sm">
                                                                        {product.rank}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {product.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {product.sold} {product.unit ?? 'គីឡូក្រាម'}
                                                                </TableCell>
                                                                <TableCell className="text-green-600 font-semibold">
                                                                    ៛{product.revenue.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                                            <div
                                                                                className="bg-[#228B22] h-2 rounded-full transition-all"
                                                                                style={{ width: `${pct}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-sm text-gray-600 w-8 text-right">
                                                                            {pct}%
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-gray-400 text-sm">
                                            មិនមានទិន្នន័យ
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* ── Export Options ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-[#228B22]">នាំចេញរបាយការណ៍</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('pdf')}
                                    className="border-[#228B22] text-[#228B22] hover:bg-green-50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    នាំចេញជា PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('excel')}
                                    className="border-[#228B22] text-[#228B22] hover:bg-green-50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    នាំចេញជា Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('csv')}
                                    className="border-[#228B22] text-[#228B22] hover:bg-green-50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    នាំចេញជា CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyChart() {
    return (
        <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
            មិនមានទិន្នន័យសម្រាប់រយៈពេលដែលបានជ្រើសរើស
        </div>
    );
}
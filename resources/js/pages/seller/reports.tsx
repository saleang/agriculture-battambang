import { useState } from 'react';
import { Download, Calendar, TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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

const COLORS = ['#228B22', '#90EE90', '#32CD32'];

interface ReportsProps {
  auth: any;
  initialData: any;
}

export default function Reports({ auth, initialData }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-10-31');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(initialData);

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/seller/reports/generate', {
        start_date: dateFrom,
        end_date: dateTo,
      });

      if (response.data.success) {
        setReportData(response.data.data);
        alert('Report generated successfully!');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.post('/seller/reports/export/pdf', {
        start_date: dateFrom,
        end_date: dateTo,
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${dateFrom}_${dateTo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDF export feature is coming soon!');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.post('/seller/reports/export/excel', {
        start_date: dateFrom,
        end_date: dateTo,
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${dateFrom}_${dateTo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Excel export feature is coming soon!');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.post('/seller/reports/export/csv', {
        start_date: dateFrom,
        end_date: dateTo,
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${dateFrom}_${dateTo}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const summaryMetrics = reportData?.summary_metrics || {};
  const monthlySalesData = reportData?.monthly_sales || [];
  const categoryData = reportData?.category_breakdown || [];
  const topProducts = reportData?.top_products || [];

  return (
    <AppLayout>
      <Head title="Reports & Analytics" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#228B22]">Reports & Analytics</h2>
              <p className="text-gray-600 mt-1">View insights about your farm business</p>
            </div>
            <Button
              onClick={handleExportPDF}
              className="bg-[#228B22] hover:bg-[#1a6b1a]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Date Range Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <Select defaultValue="custom">
                  <SelectTrigger>
                    <SelectValue placeholder="Quick select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleApplyFilter}
                  disabled={loading}
                  className="bg-[#228B22] hover:bg-[#1a6b1a]"
                >
                  {loading ? 'Loading...' : 'Apply Filter'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ៛{(summaryMetrics.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline" />
                      {summaryMetrics.revenue_growth >= 0 ? '+' : ''}
                      {(summaryMetrics.revenue_growth || 0).toFixed(1)}% from last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {summaryMetrics.total_orders || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline" />
                      {summaryMetrics.orders_growth >= 0 ? '+' : ''}
                      {(summaryMetrics.orders_growth || 0).toFixed(1)}% from last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Products Sold</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(summaryMetrics.total_products_sold || 0).toFixed(2)} kg
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline" />
                      {summaryMetrics.products_sold_growth >= 0 ? '+' : ''}
                      {(summaryMetrics.products_sold_growth || 0).toFixed(1)}% from last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ៛{(summaryMetrics.avg_order_value || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline" />
                      {summaryMetrics.avg_order_value_growth >= 0 ? '+' : ''}
                      {(summaryMetrics.avg_order_value_growth || 0).toFixed(1)}% from last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Tabs */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="sales">Sales Trends</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Sales Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#228B22]">Monthly Sales Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#228B22"
                          strokeWidth={2}
                          name="Sales (៛)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Orders Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#228B22]">Monthly Orders Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#228B22" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#228B22]">Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Revenue */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#228B22]">Revenue by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#228B22" name="Revenue (៛)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#228B22]">Top 5 Best Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Units Sold</TableHead>
                          <TableHead>Revenue (៛)</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProducts.map((product: any) => (
                          <TableRow key={product.rank}>
                            <TableCell>
                              <div className="w-8 h-8 rounded-full bg-[#228B22] text-white flex items-center justify-center font-bold">
                                {product.rank}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.sold} {product.unit || 'kg'}</TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              ៛{product.revenue.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="bg-[#228B22] h-2 rounded-full"
                                    style={{
                                      width: `${topProducts.length > 0 ? (product.sold / topProducts[0].sold) * 100 : 0}%`
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">
                                  {topProducts.length > 0 ? Math.round((product.sold / topProducts[0].sold) * 100) : 0}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#228B22]">Export Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="border-[#228B22] text-[#228B22]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  className="border-[#228B22] text-[#228B22]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="border-[#228B22] text-[#228B22]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

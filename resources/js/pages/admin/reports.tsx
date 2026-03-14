import { useState } from 'react';
import { Download, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

interface ReportsProps {
  auth: any;
  initialData: any;
}

export default function Reports({ auth, initialData }: ReportsProps) {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-11-01');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(initialData);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/admin/reports/generate', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      });

      if (response.data.success) {
        setReportData(response.data.data);
        alert('របាយការណ៍ត្រូវបានបង្កើតដោយជោគជ័យ!');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('ការបង្កើតរបាយការណ៍បានបរាជ័យ។ សូម​ព្យាយាម​ម្តង​ទៀត។');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.post('/admin/reports/export/pdf', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('មុខងារនាំចេញជា PDF នឹងមកដល់ឆាប់ៗនេះ!');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.post('/admin/reports/export/csv', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('ការនាំចេញ CSV បានបរាជ័យ។ សូម​ព្យាយាម​ម្តង​ទៀត។');
    }
  };

  return (
    <AppLayout>
      <Head title="របាយការណ៍ និងការវិភាគ" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#228B22]">របាយការណ៍ និងការវិភាគ</h2>
              <p className="text-gray-600 mt-1">មើលការយល់ដឹង និងបង្កើតរបាយការណ៍ផ្ទាល់ខ្លួន</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-[#228B22]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">ការលក់សរុប</p>
                    <p className="text-2xl font-bold mt-1">
                      ៛{(reportData?.key_metrics?.total_sales || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ↑ {(reportData?.key_metrics?.sales_growth || 0).toFixed(1)}% ក្នុងអំឡុងពេលនេះ
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#90EE90] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#228B22]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">កំណើនអ្នកប្រើប្រាស់</p>
                    <p className="text-2xl font-bold mt-1">
                      +{reportData?.key_metrics?.new_users || 0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">អ្នកប្រើប្រាស់ថ្មីក្នុងអំឡុងពេលនេះ</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">អ្នកលក់សកម្ម</p>
                    <p className="text-2xl font-bold mt-1">
                      {reportData?.key_metrics?.active_sellers || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ក្នុងអំឡុងពេលនេះ</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">ផលិតផលពេញនិយម</p>
                    <p className="text-2xl font-bold mt-1">
                      {reportData?.key_metrics?.popular_products || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ទំនិញកំពុងពេញនិយម</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Report Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#228B22]">បង្កើតរបាយការណ៍ផ្ទាល់ខ្លួន</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="report-type">ប្រភេទរបាយការណ៍</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">របាយការណ៍​ការ​លក់</SelectItem>
                      <SelectItem value="users">របាយការណ៍អ្នកប្រើប្រាស់</SelectItem>
                      <SelectItem value="products">របាយការណ៍​ផលិតផល</SelectItem>
                      <SelectItem value="sellers">របាយការណ៍អ្នកលក់</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">កាលបរិច្ឆេទចាប់ផ្តើម</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">កាលបរិច្ឆេទបញ្ចប់</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="bg-[#228B22] hover:bg-[#1a6b1a] text-white rounded-lg flex-1"
                  >
                    {loading ? 'កំពុងបង្កើត...' : 'បង្កើត'}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="gap-2 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  នាំចេញជា PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  នាំចេញជា CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#228B22]">ការលក់តាមប្រភេទ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.sales_by_category || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="category" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#228B22" name="ការលក់ (៛)" />
                    <Bar dataKey="orders" fill="#90EE90" name="ការបញ្ជាទិញ" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#228B22]">កំណើនអ្នកប្រើប្រាស់ប្រចាំថ្ងៃ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData?.daily_user_growth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#228B22"
                      strokeWidth={2}
                      dot={{ fill: '#228B22', r: 4 }}
                      name="អ្នកប្រើប្រាស់ថ្មី"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Sellers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#228B22]">អ្នកលក់កំពូល</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ឈ្មោះអ្នកលក់</TableHead>
                      <TableHead>ការលក់</TableHead>
                      <TableHead>ការបញ្ជាទិញ</TableHead>
                      <TableHead>ការវាយតម្លៃ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData?.top_sellers || []).map((seller: any, index: number) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{seller.name}</TableCell>
                        <TableCell>៛{seller.sales.toLocaleString()}</TableCell>
                        <TableCell>{seller.orders}</TableCell>
                        <TableCell>
                          <span className="text-yellow-600">★</span> {seller.rating}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#228B22]">ផលិតផលពេញនិយម</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ឈ្មោះ​ផលិតផល</TableHead>
                      <TableHead>ការលក់</TableHead>
                      <TableHead>ការមើល</TableHead>
                      <TableHead>ការវាយតម្លៃ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData?.top_products || []).map((product: any, index: number) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{product.name}</TableCell>
                        <TableCell>៛{product.sales.toLocaleString()}</TableCell>
                        <TableCell>{product.views}</TableCell>
                        <TableCell>
                          <span className="text-yellow-600">★</span> {product.rating}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

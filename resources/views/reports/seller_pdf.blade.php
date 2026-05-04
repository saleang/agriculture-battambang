<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Seller Sales Report</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            color: #222;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 24px;
        }
        .header {
            margin-bottom: 24px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 4px 0 0;
            font-size: 12px;
            color: #555;
        }
        .section-title {
            margin: 24px 0 12px;
            font-size: 16px;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            padding-bottom: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #f4f4f4;
        }
        .small {
            font-size: 12px;
            color: #555;
        }
        .metric-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .metric-grid td {
            border: 1px solid #ccc;
            padding: 10px;
            width: 25%;
        }
        .metric-label {
            font-size: 11px;
            color: #555;
            margin-bottom: 4px;
        }
        .metric-value {
            font-size: 14px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sales Report</h1>
            <p>Seller: {{ $sellerName }}</p>
            <p>Period: {{ $startDate->format('Y-m-d') }} – {{ $endDate->format('Y-m-d') }}</p>
            <p class="small">Generated on {{ now()->format('Y-m-d H:i') }}</p>
        </div>

        <div class="section-title">Summary Metrics</div>
        <table class="metric-grid">
            <tr>
                <td>
                    <div class="metric-label">Total Revenue</div>
                    <div class="metric-value">{{ number_format($summaryMetrics['total_revenue'], 0) }}៛</div>
                </td>
                <td>
                    <div class="metric-label">Total Orders</div>
                    <div class="metric-value">{{ $summaryMetrics['total_orders'] }}</div>
                </td>
                <td>
                    <div class="metric-label">Products Sold</div>
                    <div class="metric-value">{{ number_format($summaryMetrics['total_products_sold'], 0) }}</div>
                </td>
                <td>
                    <div class="metric-label">Avg Order Value</div>
                    <div class="metric-value">{{ number_format($summaryMetrics['avg_order_value'], 0) }}៛</div>
                </td>
            </tr>
        </table>

        <div class="section-title">Top Products</div>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topProducts as $product)
                    <tr>
                        <td>{{ $product['rank'] }}</td>
                        <td>{{ $product['name'] }}</td>
                        <td>{{ number_format($product['sold'], 0) }}</td>
                        <td>{{ number_format($product['revenue'], 0) }}៛</td>
                        <td>{{ $product['unit'] }}</td>
                    </tr>
                @endforeach
                @if(count($topProducts) === 0)
                    <tr>
                        <td colspan="5" class="small">No product sales found for this period.</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="section-title">Category Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                </tr>
            </thead>
            <tbody>
                @foreach($categoryBreakdown as $category)
                    <tr>
                        <td>{{ $category['category_name'] }}</td>
                        <td>{{ number_format($category['revenue'], 0) }}៛</td>
                        <td>{{ $category['orders'] }}</td>
                    </tr>
                @endforeach
                @if(count($categoryBreakdown) === 0)
                    <tr>
                        <td colspan="3" class="small">No category data available for this period.</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="section-title">Monthly Sales</div>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                </tr>
            </thead>
            <tbody>
                @foreach($monthlySales as $month)
                    <tr>
                        <td>{{ $month['month'] }}</td>
                        <td>{{ number_format($month['revenue'], 0) }}៛</td>
                        <td>{{ $month['orders'] }}</td>
                    </tr>
                @endforeach
                @if(count($monthlySales) === 0)
                    <tr>
                        <td colspan="3" class="small">No monthly sales data available.</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="section-title">Payment Methods</div>
        <table>
            <thead>
                <tr>
                    <th>Method</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paymentMethods as $paymentMethod)
                    <tr>
                        <td>{{ $paymentMethod['method'] }}</td>
                        <td>{{ $paymentMethod['count'] }}</td>
                        <td>{{ number_format($paymentMethod['total'], 0) }}៛</td>
                    </tr>
                @endforeach
                @if(count($paymentMethods) === 0)
                    <tr>
                        <td colspan="3" class="small">No payment method data for this period.</td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>
</body>
</html>

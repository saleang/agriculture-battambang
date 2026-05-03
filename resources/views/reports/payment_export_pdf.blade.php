<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>បញ្ជីការទូទាត់</title>
    <style>
        body {
            font-family: 'Khmer OS Siemreap', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .container {
            width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-family: 'Khmer OS Muol Light', sans-serif;
            font-size: 24px;
            margin: 0;
            color: #2c3e50;
        }
        .header p {
            margin: 5px 0;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-family: 'Khmer OS Content', sans-serif;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            background-color: #e8f4fd;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #777;
        }
        .badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            color: #fff;
        }
        .badge-completed { background-color: #28a745; }
        .badge-pending { background-color: #ffc107; color: #333; }
        .badge-refunded { background-color: #6f42c1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>បញ្ជីការទូទាត់</h1>
            <p>របាយការណ៍សម្រាប់: {{ $sellerName }}</p>
            <p>ទាញយកនៅថ្ងៃទី: {{ date('d-m-Y H:i:s') }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>លេខបញ្ជាទិញ</th>
                    <th>កាលបរិច្ឆេទ</th>
                    <th>អតិថិជន</th>
                    <th>វិធីទូទាត់</th>
                    <th>ទឹកប្រាក់</th>
                    <th>លេខប្រតិបត្តិការ</th>
                    <th>ស្ថានភាព</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payments as $payment)
                    <tr>
                        <td>{{ $payment['order_id'] }}</td>
                        <td>{{ $payment['order_date'] }}</td>
                        <td>{{ $payment['customer_name'] }}</td>
                        <td>{{ $payment['method'] }}</td>
                        <td class="text-right">{{ number_format($payment['amount_received'], 2) }} ៛</td>
                        <td>{{ $payment['transaction_id'] }}</td>
                        <td>
                            @if ($payment['status'] === 'completed')
                                <span class="badge badge-completed">បានបញ្ចប់</span>
                            @elseif ($payment['status'] === 'pending')
                                <span class="badge badge-pending">រង់ចាំ</span>
                            @elseif ($payment['status'] === 'refunded')
                                <span class="badge badge-refunded">បានបង្វិលសង</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center;">មិនមានទិន្នន័យការទូទាត់សម្រាប់បង្ហាញទេ។</td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>សរុប</strong></td>
                    <td class="text-right"><strong>{{ number_format($totalAmount, 2) }} ៛</strong></td>
                    <td colspan="2"></td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p> agriculture-battambang &copy; {{ date('Y') }}</p>
        </div>
    </div>
</body>
</html>
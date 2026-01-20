// ============================================
// CSV EXPORT UTILITY
// Convert sales data to CSV and trigger download
// ============================================

import toast from 'react-hot-toast';
import type { SaleWithDetails } from '../models/sales.types';

export function exportSalesToCSV(sales: SaleWithDetails[], filename: string = 'sales-export.csv') {
  if (sales.length === 0) {
    toast.error('No sales data to export', { duration: 3000 });
    return;
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Time',
    'Item',
    'Quantity',
    'Payment Method',
    'Revenue',
    'COGS',
    'Profit',
    'Profit Margin (%)',
  ];

  // Convert sales to CSV rows
  const rows = sales.map((sale) => {
    const date = new Date(sale.created_at);
    const profitMargin = Number(sale.revenue) > 0
      ? ((Number(sale.profit) / Number(sale.revenue)) * 100).toFixed(2)
      : '0.00';

    return [
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sale.menu_item?.name || 'Unknown',
      sale.quantity.toString(),
      sale.payment_method === 'cash' ? 'Cash' : sale.payment_method === 'omt' ? 'OMT' : 'Whish',
      Number(sale.revenue).toFixed(2),
      Number(sale.cogs).toFixed(2),
      Number(sale.profit).toFixed(2),
      profitMargin,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success('Export successful!', { duration: 2000 });
}

export function generateExportFilename(dateFrom?: string, dateTo?: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom).toISOString().split('T')[0];
    const to = new Date(dateTo).toISOString().split('T')[0];

    if (from === to) {
      return `sales-${from}.csv`;
    }

    return `sales-${from}_to_${to}.csv`;
  }

  return `sales-${timestamp}.csv`;
}

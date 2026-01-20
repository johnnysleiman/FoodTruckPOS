// ============================================
// SALES TABLE COMPONENT
// Sortable table displaying all sales (simplified - no channel column)
// ============================================

import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye } from 'lucide-react';
import type { SaleWithDetails } from '../models/sales.types';

interface SalesTableProps {
  sales: SaleWithDetails[];
  isLoading: boolean;
  onSaleClick?: (sale: SaleWithDetails) => void;
}

type SortField = 'created_at' | 'revenue' | 'cogs' | 'profit' | 'profit_margin';
type SortDirection = 'asc' | 'desc';

export function SalesTable({ sales, isLoading, onSaleClick }: SalesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'revenue':
        comparison = Number(a.revenue) - Number(b.revenue);
        break;
      case 'cogs':
        comparison = Number(a.cogs) - Number(b.cogs);
        break;
      case 'profit':
        comparison = Number(a.profit) - Number(b.profit);
        break;
      case 'profit_margin': {
        const marginA = Number(a.revenue) > 0 ? (Number(a.profit) / Number(a.revenue)) * 100 : 0;
        const marginB = Number(b.revenue) > 0 ? (Number(b.profit) / Number(b.revenue)) * 100 : 0;
        comparison = marginA - marginB;
        break;
      }
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatPercent = (revenue: number, profit: number) => {
    if (revenue === 0) return '0%';
    return `${((profit / revenue) * 100).toFixed(1)}%`;
  };

  const SortableHeader = ({
    field,
    label,
    align = 'left',
  }: {
    field: SortField;
    label: string;
    align?: 'left' | 'right';
  }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">COGS</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Margin</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-8 mx-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales found</h3>
          <p className="text-sm text-gray-500">
            No sales match your current filters. Try adjusting the date range or clearing filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="created_at" label="Date/Time" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <SortableHeader field="revenue" label="Revenue" align="right" />
              <SortableHeader field="cogs" label="COGS" align="right" />
              <SortableHeader field="profit" label="Profit" align="right" />
              <SortableHeader field="profit_margin" label="Margin" align="right" />
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedSales.map((sale) => {
              const profitMargin = Number(sale.revenue) > 0
                ? (Number(sale.profit) / Number(sale.revenue)) * 100
                : 0;

              return (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSaleClick?.(sale)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(sale.created_at)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(sale.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.menu_item?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sale.quantity}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {sale.payment_method === 'cash' && 'Cash'}
                      {sale.payment_method === 'omt' && 'OMT'}
                      {sale.payment_method === 'whish' && 'Whish'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(Number(sale.revenue))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(Number(sale.cogs))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                    <span
                      className={
                        Number(sale.profit) >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {formatCurrency(Number(sale.profit))}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span
                      className={
                        profitMargin >= 50
                          ? 'text-green-600'
                          : profitMargin >= 30
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {formatPercent(Number(sale.revenue), Number(sale.profit))}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaleClick?.(sale);
                      }}
                      className="inline-flex items-center p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

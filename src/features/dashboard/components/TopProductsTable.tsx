// ============================================
// TOP PRODUCTS TABLE
// Table view of best performing products
// ============================================

import { TrendingUp } from 'lucide-react';
import type { TopProduct } from '../models/dashboard.types';

interface TopProductsTableProps {
  data: TopProduct[];
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-gray-900 font-semibold">Top Products</h3>
          <p className="text-sm text-gray-500">This month's best performers</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          No sales data yet this month
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-gray-900 font-semibold">Top Products</h3>
        <p className="text-sm text-gray-500">This month's best performers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr
                key={product.name}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        index === 0
                          ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                    {index === 0 && (
                      <TrendingUp size={14} className="text-primary" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm text-gray-700">{product.sold}</span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    ${product.revenue.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-semibold text-green-600">
                    ${product.profit.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`text-sm font-medium ${
                    product.profitMargin >= 50 ? 'text-green-600' :
                    product.profitMargin >= 30 ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {product.profitMargin.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

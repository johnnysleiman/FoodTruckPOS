// ============================================
// RECENT SALES LIST
// Clean list of recent transactions
// ============================================

import { ArrowUpRight } from 'lucide-react';
import type { RecentSale } from '../models/dashboard.types';

interface RecentSalesListProps {
  data: RecentSale[];
}

export function RecentSalesList({ data }: RecentSalesListProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-gray-900 font-semibold">Recent Sales</h3>
          <p className="text-sm text-gray-500">Latest transactions</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          No sales yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-gray-900 font-semibold">Recent Sales</h3>
        <p className="text-sm text-gray-500">Latest transactions</p>
      </div>
      <div className="space-y-3">
        {data.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <ArrowUpRight size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {sale.menuItemName}
                  </p>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {sale.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">{sale.id}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${sale.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

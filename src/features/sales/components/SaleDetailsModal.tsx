// ============================================
// SALE DETAILS MODAL COMPONENT
// Clean, branded design with neutral theme
// ============================================

import { X } from 'lucide-react';
import type { SaleWithDetails } from '../models/sales.types';

interface SaleDetailsModalProps {
  sale: SaleWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailsModal({ sale, isOpen, onClose }: SaleDetailsModalProps) {
  if (!isOpen || !sale) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const profitMargin = Number(sale.revenue) > 0
    ? (Number(sale.profit) / Number(sale.revenue)) * 100
    : 0;

  const profitIsPositive = Number(sale.profit) >= 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{sale.menu_item?.name || 'Unknown Item'}</h2>
              <div className="flex items-center gap-3 text-sm text-primary-100">
                <span>{formatDateTime(sale.created_at)}</span>
                <span>•</span>
                <span className="font-medium">Qty: {sale.quantity}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-primary-dark rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Financial Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Revenue */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(sale.revenue))}
              </p>
            </div>

            {/* COGS */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(sale.cogs))}
              </p>
            </div>

            {/* Profit */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Profit</p>
              <p className={`text-2xl font-bold ${profitIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Number(sale.profit))}
              </p>
            </div>

            {/* Margin */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Margin</p>
              <p className={`text-2xl font-bold ${profitIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Sale Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Payment</span>
              <span className="text-sm font-semibold">
                {sale.payment_method === 'cash' && 'Cash'}
                {sale.payment_method === 'omt' && 'OMT'}
                {sale.payment_method === 'whish' && 'Whish'}
              </span>
            </div>

            {/* Discount Info */}
            {sale.discount_percent && sale.discount_percent > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Discount Applied</span>
                <span className="text-sm font-semibold text-yellow-700">
                  {sale.discount_percent}% (-{formatCurrency(Number(sale.discount_amount || 0))})
                </span>
              </div>
            )}
          </div>

          {/* Ingredient Details - Only if exists and has data */}
          {sale.ingredients && sale.ingredients.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-6"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Cost Breakdown ({sale.ingredients.length} items)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sale.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-600">Item {index + 1}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Number(ingredient.cost))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Variable Options - Only if exists */}
          {sale.selections && sale.selections.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-6"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Selected Options ({sale.selections.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sale.selections.map((selection) => (
                    <span
                      key={selection.id}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                    >
                      Option #{selection.menu_option_id.substring(0, 8)}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

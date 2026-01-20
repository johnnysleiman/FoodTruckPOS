// ============================================
// InventoryTable Component
// ============================================

import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { InventoryItemWithStatus } from '../models/inventory.types';
import { formatQuantity, formatCurrency, formatCategory, getStockStatusColor, formatStockStatus } from '../utils/formatters';

interface InventoryTableProps {
  items: InventoryItemWithStatus[];
  onAddStock: (item: InventoryItemWithStatus) => void;
  onEdit: (item: InventoryItemWithStatus) => void;
  onDelete: (item: InventoryItemWithStatus) => void;
}

export function InventoryTable({ items, onAddStock, onEdit, onDelete }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No inventory items found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      Avg cost: {formatCurrency(item.weighted_avg_cost, 4)}/{item.unit_of_measurement}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatCategory(item.category)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatQuantity(item.total_quantity, item.unit_of_measurement)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{formatCurrency(item.total_value)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(
                      item.stock_status
                    )}`}
                  >
                    {formatStockStatus(item.stock_status)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAddStock(item)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      title="Add Stock"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      title="Edit Item"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

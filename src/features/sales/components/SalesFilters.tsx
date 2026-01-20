// ============================================
// SALES FILTERS COMPONENT
// Compact inline filters (simplified - no channel filter)
// ============================================

import { X } from 'lucide-react';
import type { SalesFilters as SalesFiltersType } from '../models/sales.types';
import { useActiveMenuItems } from '../../menu/hooks/useMenu';

interface SalesFiltersProps {
  filters: SalesFiltersType;
  onFiltersChange: (filters: SalesFiltersType) => void;
}

export function SalesFilters({ filters, onFiltersChange }: SalesFiltersProps) {
  const { data: menuItems = [] } = useActiveMenuItems();

  const handlePaymentChange = (payment: 'cash' | 'omt' | 'whish' | '') => {
    onFiltersChange({
      ...filters,
      payment_method: payment || undefined,
    });
  };

  const handleMenuItemChange = (menuItemId: string) => {
    onFiltersChange({
      ...filters,
      menu_item_id: menuItemId || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      date_from: filters.date_from,
      date_to: filters.date_to,
    });
  };

  const activeFilterCount = [
    filters.payment_method,
    filters.menu_item_id,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Payment Method Filter */}
      <select
        value={filters.payment_method || ''}
        onChange={(e) => handlePaymentChange(e.target.value as any)}
        className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        <option value="">All Payments</option>
        <option value="cash">Cash</option>
        <option value="omt">OMT</option>
        <option value="whish">Whish</option>
      </select>

      {/* Menu Item Filter */}
      <select
        value={filters.menu_item_id || ''}
        onChange={(e) => handleMenuItemChange(e.target.value)}
        className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[120px] sm:min-w-[180px]"
      >
        <option value="">All Items</option>
        {menuItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );
}

// ============================================
// InventoryFilters Component
// ============================================

import { Search } from 'lucide-react';
import type { InventoryFilters as FiltersType, InventoryCategory } from '../models/inventory.types';
import { StockStatus } from '../models/inventory.types';
import { CATEGORY_LABELS } from '../models/inventory.constants';

interface InventoryFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function InventoryFilters({ filters, onFiltersChange }: InventoryFiltersProps) {
  const categories = Object.entries(CATEGORY_LABELS) as [InventoryCategory, string][];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value || undefined })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                category: (e.target.value as InventoryCategory) || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40">
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as StockStatus) || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value={StockStatus.IN_STOCK}>In Stock</option>
            <option value={StockStatus.LOW_STOCK}>Low Stock</option>
            <option value={StockStatus.OUT_OF_STOCK}>Out of Stock</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.category || filters.status) && (
          <button
            onClick={() => onFiltersChange({})}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

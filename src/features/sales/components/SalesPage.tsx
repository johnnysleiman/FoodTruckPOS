// ============================================
// SALES PAGE COMPONENT
// Main container for sales management and viewing
// ============================================

import { useState } from 'react';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { useSales, useSalesStats } from '../hooks/useSales';
import type { SalesFilters as SalesFiltersType, SaleWithDetails } from '../models/sales.types';
import { SalesStats } from './SalesStats';
import { DateRangePicker } from './DateRangePicker';
import { SalesFilters } from './SalesFilters';
import { SalesTable } from './SalesTable';
import { SaleDetailsModal } from './SaleDetailsModal';
import { exportSalesToCSV, generateExportFilename } from '../utils/csvExport';

export function SalesPage() {
  const [filters, setFilters] = useState<SalesFiltersType>({
    // Default to today
    date_from: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    date_to: new Date().toISOString().split('T')[0] + 'T23:59:59Z',
  });

  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch sales statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useSalesStats(
    filters.date_from,
    filters.date_to,
    {
      refetchOnWindowFocus: true,
    }
  );

  // Fetch sales list
  const { data: sales = [], isLoading: salesLoading, error: salesError } = useSales(
    filters,
    {
      refetchOnWindowFocus: true,
    }
  );

  const handleDateRangeChange = (dateFrom: string, dateTo: string) => {
    setFilters({
      ...filters,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  const handleExportCSV = () => {
    const filename = generateExportFilename(filters.date_from, filters.date_to);
    exportSalesToCSV(sales, filename);
  };

  const error = statsError || salesError;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">
              View sales history, analytics, and performance metrics
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={salesLoading || sales.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error.toString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-6">
        <SalesStats stats={stats || null} isLoading={statsLoading} />
      </div>

      {/* Compact Filters Bar - Date Presets + Filters in One Row */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Date Range Presets */}
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />

          {/* Right: Filters */}
          <SalesFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Sales Count Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {salesLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading sales...
            </span>
          ) : (
            <span>
              Showing <span className="font-semibold text-gray-900">{sales.length}</span> sale{sales.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* Sales Table */}
      <SalesTable
        sales={sales}
        isLoading={salesLoading}
        onSaleClick={(sale) => {
          setSelectedSale(sale);
          setShowDetailsModal(true);
        }}
      />

      {/* Sale Details Modal */}
      <SaleDetailsModal
        sale={selectedSale}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSale(null);
        }}
      />
    </div>
  );
}

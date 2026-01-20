// ============================================
// Sales Feature - Public Exports
// ============================================

// Components
export { SalesPage } from './components/SalesPage';
export { SalesTable } from './components/SalesTable';
export { SalesStats } from './components/SalesStats';
export { SalesFilters } from './components/SalesFilters';
export { DateRangePicker } from './components/DateRangePicker';
export { SaleDetailsModal } from './components/SaleDetailsModal';

// Hooks
export {
  useSales,
  useSale,
  useSalesStats,
  useTodaySalesStats,
  useCreateSale,
  useSalesManagement,
  salesKeys,
} from './hooks/useSales';

// Types
export type {
  Sale,
  SaleWithDetails,
  SaleIngredient,
  SaleSelection,
  CreateSaleData,
  CompleteSaleResult,
  SalesFilters as SalesFiltersType,
  SalesStats as SalesStatsType,
} from './models/sales.types';

// Services
export {
  createSale,
  getSales,
  getSaleById,
  getSalesStats,
  getTodaySalesStats,
} from './services/salesService';

// Utils
export { exportSalesToCSV, generateExportFilename } from './utils/csvExport';

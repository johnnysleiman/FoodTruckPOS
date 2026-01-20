// ============================================
// DASHBOARD FEATURE EXPORTS
// ============================================

// Components
export { DashboardPage } from './components/DashboardPage';
export { StatCard } from './components/StatCard';
export { QuickStats } from './components/QuickStats';
export { RevenueChart } from './components/RevenueChart';
export { TopProductsTable } from './components/TopProductsTable';
export { RecentSalesList } from './components/RecentSalesList';
export { SetInitialBalanceModal } from './components/SetInitialBalanceModal';
export { AdjustBalanceModal } from './components/AdjustBalanceModal';

// Hooks
export { useDashboardData } from './hooks/useDashboardData';

// Services
export { dashboardService } from './services/dashboardService';
export { balanceService } from './services/balanceService';

// Types
export type {
  DashboardStats,
  WeeklyStats,
  RevenueDataPoint,
  TopProduct,
  RecentSale,
  CurrentBalanceResponse,
} from './models/dashboard.types';

export type {
  OwnerBalance,
  OwnerBalanceAdjustment,
  BalanceBreakdown,
  SetInitialBalanceInput,
  CreateAdjustmentInput,
} from './models/balance.types';

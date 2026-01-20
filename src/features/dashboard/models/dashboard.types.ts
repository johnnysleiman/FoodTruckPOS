// ============================================
// DASHBOARD TYPES (simplified - no batches)
// ============================================

export interface DashboardStats {
  moneyOnHand: number;
  cashRunwayDays: number;
  mtdRevenue: number;
  mtdProfit: number;
  mtdProfitMargin: number;
  momRevenueChange: number;
  lowStockCount: number;
  inventoryValue: number;
  lastMonthRevenue: number;
  lastMonthProfit: number;
}

export interface WeeklyStats {
  thisWeekItemsSold: number;
  lastWeekItemsSold: number;
  weeklyChange: number;
  thisWeekOrders: number;
  lastWeekOrders: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface RecentSale {
  id: string;
  time: string;
  amount: number;
  status: 'completed' | 'pending';
  menuItemName: string;
}

export interface CurrentBalanceResponse {
  success: boolean;
  balance: number;
  has_initial_balance: boolean;
}

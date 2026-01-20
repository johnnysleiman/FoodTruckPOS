// ============================================
// DASHBOARD SERVICE (simplified - no batches)
// ============================================

import { supabase } from '../../../lib/supabase';
import type {
  DashboardStats,
  WeeklyStats,
  RevenueDataPoint,
  TopProduct,
  RecentSale,
  CurrentBalanceResponse,
} from '../models/dashboard.types';

interface DashboardStatsResponse {
  stats: DashboardStats;
  weeklyStats: WeeklyStats;
  balance: CurrentBalanceResponse;
}

class DashboardService {
  /**
   * Get all dashboard stats by calling multiple database functions
   */
  async getAllStats(): Promise<DashboardStatsResponse> {
    // Call the simple stats function
    const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats_simple');

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError);
      throw statsError;
    }

    // Call the balance function separately
    const { data: balanceData, error: balanceError } = await supabase.rpc('get_current_owner_balance');

    if (balanceError) {
      console.warn('Error fetching balance (may not be set up yet):', balanceError);
    }

    // The function returns a flat object with these keys:
    // mtd_revenue, mtd_profit, mtd_sales_count, inventory_value, low_stock_count, weekly_items_sold
    const mtdRevenue = statsData?.mtd_revenue || 0;
    const mtdProfit = statsData?.mtd_profit || 0;
    const mtdProfitMargin = mtdRevenue > 0 ? (mtdProfit / mtdRevenue) * 100 : 0;

    return {
      stats: {
        moneyOnHand: balanceData || 0,
        cashRunwayDays: 0, // Would need more complex calculation
        mtdRevenue,
        mtdProfit,
        mtdProfitMargin,
        momRevenueChange: 0, // Would need last month comparison
        lowStockCount: statsData?.low_stock_count || 0,
        inventoryValue: statsData?.inventory_value || 0,
        lastMonthRevenue: 0,
        lastMonthProfit: 0,
      },
      weeklyStats: {
        thisWeekItemsSold: statsData?.weekly_items_sold || 0,
        lastWeekItemsSold: 0,
        weeklyChange: 0,
        thisWeekOrders: statsData?.mtd_sales_count || 0, // Approximation
        lastWeekOrders: 0,
      },
      balance: {
        success: balanceData?.success || false,
        balance: balanceData?.balance || 0,
        has_initial_balance: balanceData?.has_initial_balance || false,
      },
    };
  }

  /**
   * Get last 30 days revenue data for chart
   */
  async getLast30DaysRevenue(): Promise<RevenueDataPoint[]> {
    const thirtyDaysAgo = new Date(Date.now() - 29 * 86400000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const { data: sales } = await supabase
      .from('sales')
      .select('revenue, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const dataMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize all 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    // Fill in actual sales
    sales?.forEach((sale) => {
      const dateStr = new Date(sale.created_at).toISOString().split('T')[0];
      const existing = dataMap.get(dateStr);
      if (existing) {
        existing.revenue += Number(sale.revenue);
        existing.orders += 1;
      }
    });

    const result: RevenueDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const data = dataMap.get(dateStr)!;

      result.push({
        name: dayName,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      });
    }

    return result;
  }

  /**
   * Get top 5 products by revenue for current month
   */
  async getTopProducts(): Promise<TopProduct[]> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: sales } = await supabase
      .from('sales')
      .select('menu_item_id, quantity, revenue, cogs, menu_items(name)')
      .gte('created_at', currentMonthStart.toISOString())
      .order('created_at', { ascending: false });

    if (!sales) return [];

    const byProduct: Record<
      string,
      { name: string; sold: number; revenue: number; cogs: number }
    > = {};

    sales.forEach((sale: any) => {
      const itemId = sale.menu_item_id;
      const itemName = sale.menu_items?.name || 'Unknown';

      if (!byProduct[itemId]) {
        byProduct[itemId] = { name: itemName, sold: 0, revenue: 0, cogs: 0 };
      }

      byProduct[itemId].sold += sale.quantity;
      byProduct[itemId].revenue += Number(sale.revenue);
      byProduct[itemId].cogs += Number(sale.cogs);
    });

    return Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => {
        const profit = p.revenue - p.cogs;
        const profitMargin = p.revenue > 0 ? (profit / p.revenue) * 100 : 0;

        return {
          name: p.name,
          sold: p.sold,
          revenue: Math.round(p.revenue * 100) / 100,
          profit: Math.round(profit * 100) / 100,
          profitMargin: Math.round(profitMargin * 10) / 10,
        };
      });
  }

  /**
   * Get recent 10 sales
   */
  async getRecentSales(): Promise<RecentSale[]> {
    const { data: sales } = await supabase
      .from('sales')
      .select('id, revenue, created_at, menu_items(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!sales) return [];

    return sales.map((sale: any) => {
      const createdAt = new Date(sale.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      let timeStr = '';
      if (diffMins < 1) timeStr = 'Just now';
      else if (diffMins < 60) timeStr = `${diffMins} min ago`;
      else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hr ago`;
      else timeStr = `${Math.floor(diffMins / 1440)} day ago`;

      return {
        id: `#${sale.id.slice(0, 8)}`,
        time: timeStr,
        amount: Math.round(Number(sale.revenue) * 100) / 100,
        status: 'completed' as const,
        menuItemName: sale.menu_items?.name || 'Unknown',
      };
    });
  }
}

export const dashboardService = new DashboardService();

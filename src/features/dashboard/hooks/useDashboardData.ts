// ============================================
// USE DASHBOARD DATA HOOK (simplified - no batches)
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import type {
  DashboardStats,
  WeeklyStats,
  RevenueDataPoint,
  TopProduct,
  RecentSale,
  CurrentBalanceResponse,
} from '../models/dashboard.types';

interface DashboardData {
  stats: DashboardStats | null;
  weeklyStats: WeeklyStats | null;
  balance: CurrentBalanceResponse | null;
  revenueData: RevenueDataPoint[];
  topProducts: TopProduct[];
  recentSales: RecentSale[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const { session, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData>({
    stats: null,
    weeklyStats: null,
    balance: null,
    revenueData: [],
    topProducts: [],
    recentSales: [],
    loading: true,
    error: null,
  });

  const fetchDashboardData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [allStats, revenueData, topProducts, recentSales] = await Promise.all([
        dashboardService.getAllStats(),
        dashboardService.getLast30DaysRevenue(),
        dashboardService.getTopProducts(),
        dashboardService.getRecentSales(),
      ]);

      setData({
        stats: allStats.stats,
        weeklyStats: allStats.weeklyStats,
        balance: allStats.balance,
        revenueData,
        topProducts,
        recentSales,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  };

  useEffect(() => {
    if (!authLoading && session) {
      fetchDashboardData();
    }
  }, [authLoading, session]);

  return { ...data, refetch: fetchDashboardData };
}

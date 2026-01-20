// ============================================
// DASHBOARD PAGE COMPONENT (simplified - no batches/channels)
// ============================================

import { useState, useEffect } from 'react';
import { Wallet, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatCard } from './StatCard';
import { QuickStats } from './QuickStats';
import { RevenueChart } from './RevenueChart';
import { TopProductsTable } from './TopProductsTable';
import { RecentSalesList } from './RecentSalesList';
import { SetInitialBalanceModal } from './SetInitialBalanceModal';
import { AdjustBalanceModal } from './AdjustBalanceModal';

export function DashboardPage() {
  const {
    stats,
    weeklyStats,
    balance,
    revenueData,
    topProducts,
    recentSales,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const [showSetInitialModal, setShowSetInitialModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  useEffect(() => {
    if (balance && !balance.has_initial_balance) {
      setShowSetInitialModal(true);
    }
  }, [balance]);

  const handleBalanceUpdate = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Failed to load dashboard</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate MTD average order value
  const mtdAvgOrderValue = stats && weeklyStats && weeklyStats.thisWeekItemsSold > 0
    ? stats.mtdRevenue / weeklyStats.thisWeekItemsSold
    : 0;

  // Format cash runway display
  const runwayDisplay = stats && stats.cashRunwayDays >= 999
    ? 'Healthy runway'
    : stats && stats.cashRunwayDays > 0
    ? `${stats.cashRunwayDays} days runway`
    : 'Low cash';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your business performance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="cursor-pointer"
          onClick={() => balance?.has_initial_balance && setShowAdjustModal(true)}
        >
          <StatCard
            title="MONEY ON HAND"
            value={`$${balance?.balance.toFixed(2) || '0.00'}`}
            change={balance?.has_initial_balance ? runwayDisplay : 'Click to set initial'}
            trend="neutral"
            icon={<Wallet size={24} />}
            gradient="from-green-400 to-emerald-500"
          />
        </div>
        <StatCard
          title="MTD REVENUE"
          value={`$${stats?.mtdRevenue.toFixed(2) || '0.00'}`}
          change={
            stats && stats.momRevenueChange !== 0
              ? `${stats.momRevenueChange > 0 ? '+' : ''}${stats.momRevenueChange.toFixed(1)}% vs last month`
              : stats && stats.lastMonthRevenue > 0
              ? 'Same as last month'
              : 'First month tracking'
          }
          trend={
            stats && stats.momRevenueChange > 0
              ? 'up'
              : stats && stats.momRevenueChange < 0
              ? 'down'
              : 'neutral'
          }
          icon={<DollarSign size={24} />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="MTD PROFIT"
          value={`$${stats?.mtdProfit.toFixed(2) || '0.00'}`}
          change={`${stats?.mtdProfitMargin.toFixed(1) || '0.0'}% margin`}
          trend={stats && stats.mtdProfit > 0 ? 'up' : 'neutral'}
          icon={<TrendingUp size={24} />}
          gradient="from-purple-500 to-indigo-500"
        />
        <StatCard
          title="INVENTORY STATUS"
          value={`$${stats?.inventoryValue.toFixed(0) || '0'}`}
          change={
            stats && stats.lowStockCount > 0
              ? `${stats.lowStockCount} items low stock`
              : 'All items in stock'
          }
          trend={stats && stats.lowStockCount > 0 ? 'warning' : 'neutral'}
          icon={<Package size={24} />}
          gradient="from-orange-400 to-amber-500"
        />
      </div>

      {/* Quick Stats */}
      {weeklyStats && stats && (
        <div className="mb-8">
          <QuickStats
            thisWeekItemsSold={weeklyStats.thisWeekItemsSold}
            weeklyChange={weeklyStats.weeklyChange}
            mtdAvgOrderValue={mtdAvgOrderValue}
            mtdProfitMargin={stats.mtdProfitMargin}
          />
        </div>
      )}

      {/* Revenue Chart - Full Width */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <RevenueChart data={revenueData} />
      </div>

      {/* Products and Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopProductsTable data={topProducts} />
        <RecentSalesList data={recentSales} />
      </div>

      {/* Modals */}
      {showSetInitialModal && (
        <SetInitialBalanceModal
          onClose={() => setShowSetInitialModal(false)}
          onSuccess={handleBalanceUpdate}
        />
      )}

      {showAdjustModal && balance && (
        <AdjustBalanceModal
          onClose={() => setShowAdjustModal(false)}
          onSuccess={handleBalanceUpdate}
          currentBalance={balance.balance}
        />
      )}
    </div>
  );
}

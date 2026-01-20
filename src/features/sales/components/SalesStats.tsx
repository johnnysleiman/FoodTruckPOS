// ============================================
// SALES STATS COMPONENT
// Display key sales metrics in card grid
// ============================================

import { DollarSign, TrendingUp, Package, Percent, ShoppingCart } from 'lucide-react';
import type { SalesStats as SalesStatsType } from '../models/sales.types';

interface SalesStatsProps {
  stats: SalesStatsType | null;
  isLoading: boolean;
}

export function SalesStats({ stats, isLoading }: SalesStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  const statCards = [
    {
      label: 'Total Sales',
      value: stats.total_sales.toString(),
      icon: ShoppingCart,
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary',
    },
    {
      label: 'Total COGS',
      value: formatCurrency(stats.total_cogs),
      icon: Package,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Total Profit',
      value: formatCurrency(stats.total_profit),
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Profit Margin',
      value: formatPercent(stats.profit_margin),
      icon: Percent,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-2 ${card.bgColor} rounded-lg`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

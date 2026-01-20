// ============================================
// QUICK STATS COMPONENT (simplified - no batches)
// ============================================

import { TrendingUp, ShoppingCart, Percent, ArrowUp, ArrowDown } from 'lucide-react';

interface QuickStat {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface QuickStatsProps {
  thisWeekItemsSold: number;
  weeklyChange: number;
  mtdAvgOrderValue: number;
  mtdProfitMargin: number;
}

export function QuickStats({
  thisWeekItemsSold,
  weeklyChange,
  mtdAvgOrderValue,
  mtdProfitMargin,
}: QuickStatsProps) {
  const quickStats: QuickStat[] = [
    {
      label: 'This Week Sales',
      value: thisWeekItemsSold.toString(),
      change: `${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}% vs last week`,
      icon: <ShoppingCart size={18} />,
      color: 'bg-primary',
      trend: weeklyChange > 0 ? 'up' : weeklyChange < 0 ? 'down' : 'neutral',
    },
    {
      label: 'MTD Avg Order',
      value: `$${mtdAvgOrderValue.toFixed(2)}`,
      icon: <TrendingUp size={18} />,
      color: 'bg-purple-500',
    },
    {
      label: 'MTD Profit Margin',
      value: `${mtdProfitMargin.toFixed(1)}%`,
      icon: <Percent size={18} />,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickStats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start gap-3">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              {stat.change && (
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' && <ArrowUp size={12} className="text-green-500" />}
                  {stat.trend === 'down' && <ArrowDown size={12} className="text-red-500" />}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// Clean, animated metric card
// ============================================

import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral' | 'warning';
  icon: React.ReactNode;
  gradient: string;
}

export function StatCard({ title, value, change, trend, icon, gradient }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-orange-500" />;
    if (trend === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs tracking-wider text-gray-500 mb-1">{title}</p>
            <p className="text-3xl text-gray-900 tracking-tight">{value}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span
            className={`text-sm ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                ? 'text-orange-600'
                : trend === 'warning'
                ? 'text-amber-600'
                : 'text-gray-600'
            }`}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

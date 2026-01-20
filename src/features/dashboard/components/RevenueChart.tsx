// ============================================
// REVENUE CHART COMPONENT
// Line chart showing last 30 days revenue and orders
// ============================================

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueDataPoint } from '../models/dashboard.types';

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-gray-900 font-semibold">Revenue Overview</h3>
        <p className="text-sm text-gray-500">Last 30 days performance</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8B4513"
            strokeWidth={3}
            dot={{ fill: '#8B4513', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue ($)"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

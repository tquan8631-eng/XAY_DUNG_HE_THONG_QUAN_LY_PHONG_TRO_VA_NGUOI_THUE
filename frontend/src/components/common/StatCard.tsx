import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'indigo' | 'green' | 'blue' | 'red' | 'yellow' | 'purple' | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'indigo', trend, subtitle }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  } as Record<string, string>;
  const iconClass = colorStyles[color] || color;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconClass}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center mt-4 text-sm">
          <span className={`flex items-center font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

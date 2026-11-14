import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  alert?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  highlight,
  alert,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white p-4.5 shadow-xs transition-all duration-200 dark:bg-zinc-900/90 select-none',
        alert
          ? 'border-rose-300/80 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/20'
          : highlight
          ? 'border-indigo-300/80 bg-indigo-50/20 dark:border-indigo-900/60 dark:bg-indigo-950/20'
          : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-tight">
          {title}
        </span>
        <div
          className={cn(
            'rounded-xl p-2 transition-transform group-hover:scale-105',
            alert
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : highlight
              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            'text-2xl font-bold tracking-tight',
            alert
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-zinc-900 dark:text-white'
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-semibold flex items-center',
              trendUp ? 'text-emerald-500' : 'text-zinc-400'
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

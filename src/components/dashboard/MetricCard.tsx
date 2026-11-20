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
        'group relative overflow-hidden rounded-2xl border p-3.5 sm:p-4.5 shadow-2xs transition-all duration-200 select-none cursor-pointer',
        alert
          ? 'border-[#EF4444] bg-white dark:bg-[#171717] hover:border-[#EF4444] shadow-sm dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]'
          : highlight
          ? 'border-[#DC2626]/40 dark:border-[#DC2626]/70 bg-white dark:bg-[#171717] hover:border-[#DC2626] shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:shadow-md dark:hover:shadow-[0_0_22px_rgba(220,38,38,0.45)]'
          : 'border-zinc-200 dark:border-[#292929] bg-white dark:bg-[#171717] hover:border-[#DC2626]/70 hover:shadow-xs dark:hover:shadow-[0_0_18px_rgba(220,38,38,0.2)]',
        'hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-[#A3A3A3] tracking-tight transition-colors group-hover:text-zinc-900 dark:group-hover:text-[#FAFAFA]">
          {title}
        </span>
        <div
          className={cn(
            'rounded-xl p-1.5 sm:p-2 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 shadow-2xs',
            alert
              ? 'bg-[#EF4444]/15 dark:bg-[#EF4444]/20 text-[#EF4444] group-hover:bg-[#EF4444]/25'
              : highlight
              ? 'bg-[#DC2626]/10 dark:bg-[#DC2626]/20 text-[#DC2626] group-hover:bg-[#DC2626]/20'
              : 'bg-zinc-100 dark:bg-[#111111] text-zinc-500 dark:text-[#A3A3A3] group-hover:text-[#DC2626]'
          )}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            'text-xl sm:text-2xl font-bold tracking-tight',
            alert
              ? 'text-[#EF4444]'
              : 'text-zinc-900 dark:text-[#FAFAFA]'
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-semibold flex items-center',
              trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-[#A3A3A3]'
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-[#A3A3A3] truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

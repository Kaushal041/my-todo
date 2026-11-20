import React from 'react';
import { cn } from '@/lib/utils';
import { Priority, TaskStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'priority' | 'status';
  priority?: Priority;
  status?: TaskStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  priority,
  status,
  children,
  ...props
}) => {
  if (variant === 'priority' && priority) {
    const priorityStyles: Record<Priority, string> = {
      urgent: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-[#DC2626]/20 dark:text-[#EF4444] dark:border-[#DC2626]/50 shadow-2xs dark:shadow-[0_0_12px_rgba(239,68,68,0.35)]',
      high: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-[#991B1B]/25 dark:text-[#EF4444] dark:border-[#991B1B]/40 shadow-2xs dark:shadow-[0_0_8px_rgba(220,38,38,0.25)]',
      medium: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-[#DC2626]/10 dark:text-[#FAFAFA] dark:border-[#DC2626]/30',
      low: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-[#171717] dark:text-[#A3A3A3] dark:border-[#292929]',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold tracking-wide uppercase',
          priorityStyles[priority],
          className
        )}
        {...props}
      >
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-[#EF4444] animate-pulse': priority === 'urgent',
            'bg-[#DC2626]': priority === 'high',
            'bg-[#991B1B]': priority === 'medium',
            'bg-[#A3A3A3]': priority === 'low',
          })}
        />
        {priority}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const statusStyles: Record<TaskStatus, { label: string; style: string }> = {
      not_started: { label: 'To Do', style: 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-[#171717] dark:text-[#A3A3A3] dark:border-[#292929]' },
      in_progress: { label: 'In Progress', style: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#DC2626]/15 dark:text-[#EF4444] dark:border-[#DC2626]/40 dark:shadow-[0_0_10px_rgba(220,38,38,0.25)]' },
      completed: { label: 'Completed', style: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30' },
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold',
          statusStyles[status].style,
          className
        )}
        {...props}
      >
        {statusStyles[status].label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-[#171717] dark:text-[#FAFAFA] dark:border-[#292929]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

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
      urgent: 'bg-[#DC2626]/20 text-[#EF4444] border border-[#DC2626]/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]',
      high: 'bg-[#991B1B]/25 text-[#EF4444] border border-[#991B1B]/40 shadow-[0_0_8px_rgba(220,38,38,0.25)]',
      medium: 'bg-[#DC2626]/10 text-[#FAFAFA] border border-[#DC2626]/30',
      low: 'bg-[#171717] text-[#A3A3A3] border border-[#292929]',
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
      not_started: { label: 'To Do', style: 'bg-[#171717] text-[#A3A3A3] border border-[#292929]' },
      in_progress: { label: 'In Progress', style: 'bg-[#DC2626]/15 text-[#EF4444] border border-[#DC2626]/40 shadow-[0_0_10px_rgba(220,38,38,0.25)]' },
      completed: { label: 'Completed', style: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
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
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#171717] text-[#FAFAFA] border border-[#292929]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

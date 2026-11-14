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
      urgent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
      high: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      medium: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
      low: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tracking-wide uppercase',
          priorityStyles[priority],
          className
        )}
        {...props}
      >
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-rose-500 animate-pulse': priority === 'urgent',
            'bg-amber-500': priority === 'high',
            'bg-sky-500': priority === 'medium',
            'bg-zinc-400': priority === 'low',
          })}
        />
        {priority}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const statusStyles: Record<TaskStatus, { label: string; style: string }> = {
      not_started: { label: 'To Do', style: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20' },
      in_progress: { label: 'In Progress', style: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' },
      completed: { label: 'Completed', style: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' },
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
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
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants: Record<string, string> = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 active:scale-[0.98]',
      secondary:
        'bg-zinc-200 hover:bg-zinc-300/80 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 active:scale-[0.98]',
      outline:
        'border border-zinc-200 hover:bg-zinc-100 text-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-800/60 dark:text-zinc-200 active:scale-[0.98]',
      ghost:
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-200',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 active:scale-[0.98]',
      subtle:
        'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40',
    };

    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

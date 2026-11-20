import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.97] active:duration-75';

    const variants: Record<string, string> = {
      primary:
        'bg-[#DC2626] hover:bg-[#EF4444] text-[#FAFAFA] shadow-md shadow-[#DC2626]/30 hover:shadow-lg hover:shadow-[#EF4444]/40 hover:-translate-y-0.5',
      secondary:
        'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-[#171717] dark:hover:bg-[#202020] dark:text-[#FAFAFA] dark:border-[#292929] hover:border-[#DC2626]/50 hover:shadow-xs hover:-translate-y-0.5',
      outline:
        'border border-zinc-200 hover:border-[#DC2626] hover:bg-zinc-50 text-zinc-800 dark:border-[#292929] dark:hover:border-[#DC2626] dark:hover:bg-[#171717] dark:text-[#FAFAFA] hover:shadow-xs dark:hover:shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:-translate-y-0.5',
      ghost:
        'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:hover:bg-[#171717] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA] hover:scale-[1.02]',
      danger:
        'bg-[#DC2626] hover:bg-[#EF4444] text-white shadow-md shadow-[#DC2626]/30 hover:shadow-lg hover:shadow-[#EF4444]/40 hover:-translate-y-0.5',
      subtle:
        'bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/20 dark:bg-[#DC2626]/15 dark:hover:bg-[#DC2626]/25 dark:text-[#EF4444] dark:border-[#DC2626]/30 hover:shadow-xs hover:-translate-y-0.5',
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

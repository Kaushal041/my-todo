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
        'bg-[#171717] hover:bg-[#202020] text-[#FAFAFA] border border-[#292929] hover:border-[#DC2626]/50 hover:shadow-xs hover:-translate-y-0.5',
      outline:
        'border border-[#292929] hover:border-[#DC2626] hover:bg-[#171717] text-[#FAFAFA] hover:shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:-translate-y-0.5',
      ghost:
        'hover:bg-[#171717] text-[#A3A3A3] hover:text-[#FAFAFA] hover:scale-[1.02]',
      danger:
        'bg-[#991B1B] hover:bg-[#DC2626] text-[#FAFAFA] shadow-md shadow-[#991B1B]/40 hover:shadow-lg hover:shadow-[#DC2626]/40 hover:-translate-y-0.5',
      subtle:
        'bg-[#DC2626]/15 hover:bg-[#DC2626]/25 text-[#EF4444] border border-[#DC2626]/30 hover:shadow-xs hover:-translate-y-0.5',
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

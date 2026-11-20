'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full rounded-2xl border border-zinc-200 dark:border-[#292929] bg-white dark:bg-[#171717] p-3.5 sm:p-6 shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-4 sm:zoom-in-95 text-zinc-900 dark:text-[#FAFAFA] z-10 max-h-[94vh] sm:max-h-[90vh] flex flex-col dark:shadow-[0_0_30px_rgba(220,38,38,0.25)]',
          widthClasses[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-zinc-200 dark:border-[#292929]">
          <div>
            {title && <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-[#FAFAFA]">{title}</h2>}
            {description && <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-[#A3A3A3] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 dark:text-[#A3A3A3] hover:bg-zinc-100 dark:hover:bg-[#111111] hover:text-[#DC2626] dark:hover:text-[#EF4444] transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-3 sm:py-4 flex-1 overscroll-contain">{children}</div>
      </div>
    </div>
  );
};

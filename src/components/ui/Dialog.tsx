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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full rounded-2xl border border-[#292929] bg-[#171717] p-4 sm:p-6 shadow-2xl transition-all duration-200 animate-in zoom-in-95 text-[#FAFAFA] z-10 max-h-[92vh] flex flex-col shadow-[0_0_30px_rgba(220,38,38,0.25)]',
          widthClasses[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#292929]">
          <div>
            {title && <h2 className="text-lg font-black tracking-tight text-[#FAFAFA]">{title}</h2>}
            {description && <p className="text-xs text-[#A3A3A3] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#A3A3A3] hover:bg-[#111111] hover:text-[#EF4444] transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 flex-1">{children}</div>
      </div>
    </div>
  );
};

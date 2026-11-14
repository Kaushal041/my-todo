'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const ToastContainer: React.FC = () => {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 text-sm font-medium text-zinc-900 dark:text-zinc-100 animate-in slide-in-from-bottom-5 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <span className="max-w-xs truncate">{toast.text}</span>

      {toast.action && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          onClick={() => {
            toast.action?.onClick();
            dismissToast();
          }}
        >
          {toast.action.label}
        </Button>
      )}

      <button
        onClick={dismissToast}
        className="ml-1 rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

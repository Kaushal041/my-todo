'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog } from '@/components/ui/Dialog';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useApp();

  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', desc: 'Open Command Palette & Global Search' },
    { key: 'N', desc: 'Create New Task' },
    { key: '?', desc: 'Show Keyboard Shortcuts (this modal)' },
    { key: 'Esc', desc: 'Close open modal or dropdown' },
    { key: '1', desc: 'Jump to Dashboard' },
    { key: '2', desc: 'Jump to My Day' },
    { key: '3', desc: 'Jump to Inbox' },
    { key: '4', desc: 'Jump to Kanban Board' },
    { key: '5', desc: 'Jump to Pomodoro Focus Timer' },
  ];

  return (
    <Dialog
      isOpen={isShortcutsOpen}
      onClose={() => setIsShortcutsOpen(false)}
      title="Keyboard Shortcuts"
      description="Quick access to accelerate your daily workflow"
      maxWidth="md"
    >
      <div className="space-y-2 mt-2">
        {shortcuts.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 text-xs"
          >
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{s.desc}</span>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono font-semibold text-[11px] shadow-xs">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </Dialog>
  );
};

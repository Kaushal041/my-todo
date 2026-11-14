'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveView, Task } from '@/types';
import { exportTasksToCSV } from '@/lib/export-csv';
import {
  Search,
  CheckSquare2,
  Calendar,
  Kanban,
  Timer,
  Flame,
  BarChart3,
  Settings,
  Plus,
  FileSpreadsheet,
  Moon,
  Sun,
  LayoutDashboard,
  SunMedium,
  Inbox,
  Clock,
  Archive,
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    setActiveView,
    openCreateTaskModal,
    openEditTaskModal,
    settings,
    updateSettings,
    setIsShortcutsOpen,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen, setIsShortcutsOpen]);

  // Reset index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const viewOptions: { id: string; label: string; view: ActiveView; icon: React.ElementType }[] = [
    { id: 'view-dash', label: 'Go to Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { id: 'view-myday', label: 'Go to My Day', view: 'my-day', icon: SunMedium },
    { id: 'view-inbox', label: 'Go to Inbox', view: 'inbox', icon: Inbox },
    { id: 'view-all', label: 'Go to All Tasks', view: 'all-tasks', icon: CheckSquare2 },
    { id: 'view-kanban', label: 'Go to Kanban Board', view: 'kanban', icon: Kanban },
    { id: 'view-calendar', label: 'Go to Calendar', view: 'calendar', icon: Calendar },
    { id: 'view-pomodoro', label: 'Open Pomodoro Timer', view: 'pomodoro', icon: Timer },
    { id: 'view-habits', label: 'Open Habit Tracker', view: 'habits', icon: Flame },
    { id: 'view-analytics', label: 'Open Analytics & Reports', view: 'analytics', icon: BarChart3 },
    { id: 'view-settings', label: 'Open Settings', view: 'settings', icon: Settings },
  ];

  const actionOptions = [
    {
      id: 'act-new-task',
      label: 'Create New Task',
      icon: Plus,
      action: () => openCreateTaskModal(),
    },
    {
      id: 'act-export-csv',
      label: 'Export Tasks to CSV',
      icon: FileSpreadsheet,
      action: () => exportTasksToCSV(tasks),
    },
    {
      id: 'act-toggle-theme',
      label: `Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: settings.theme === 'dark' ? Sun : Moon,
      action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
    },
  ];

  // Filter tasks based on query
  const matchingTasks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tasks
      .filter((t) => !t.inTrash && (t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.tags.some((tg) => tg.toLowerCase().includes(q))))
      .slice(0, 5);
  }, [tasks, query]);

  // Filter views based on query
  const matchingViews = useMemo(() => {
    if (!query.trim()) return viewOptions.slice(0, 4);
    const q = query.toLowerCase();
    return viewOptions.filter((v) => v.label.toLowerCase().includes(q));
  }, [query]);

  // Filter actions based on query
  const matchingActions = useMemo(() => {
    if (!query.trim()) return actionOptions;
    const q = query.toLowerCase();
    return actionOptions.filter((a) => a.label.toLowerCase().includes(q));
  }, [query, actionOptions]);

  // Combined flat list for keyboard arrow navigation
  const flatItems = useMemo(() => {
    const list: { type: 'task' | 'view' | 'action'; item: unknown }[] = [];
    matchingTasks.forEach((t) => list.push({ type: 'task', item: t }));
    matchingViews.forEach((v) => list.push({ type: 'view', item: v }));
    matchingActions.forEach((a) => list.push({ type: 'action', item: a }));
    return list;
  }, [matchingTasks, matchingViews, matchingActions]);

  const handleSelect = (idx: number) => {
    const selected = flatItems[idx];
    if (!selected) return;

    if (selected.type === 'task') {
      openEditTaskModal(selected.item as Task);
    } else if (selected.type === 'view') {
      const viewItem = selected.item as { view: ActiveView };
      setActiveView(viewItem.view);
    } else if (selected.type === 'action') {
      const actionItem = selected.item as { action: () => void };
      actionItem.action();
    }
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  const handleKeyDownDialog = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  let currentItemCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Card */}
      <div
        onKeyDown={handleKeyDownDialog}
        className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 z-10 animate-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-3 pb-3 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none dark:placeholder:text-zinc-500"
          />
          <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto py-2 space-y-4">
          {/* Matching Tasks */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Tasks
              </div>
              {matchingTasks.map((task) => {
                const index = currentItemCounter++;
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate font-medium">{task.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {task.category}
                      </span>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Views */}
          {matchingViews.length > 0 && (
            <div>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Navigation
              </div>
              {matchingViews.map((view) => {
                const index = currentItemCounter++;
                const isSelected = selectedIndex === index;
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium">{view.label}</span>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          {matchingActions.length > 0 && (
            <div>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Actions
              </div>
              {matchingActions.map((act) => {
                const index = currentItemCounter++;
                const isSelected = selectedIndex === index;
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium">{act.label}</span>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {flatItems.length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-400">
              No matching commands or tasks found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-3 pt-2 text-[10px] text-zinc-400 dark:border-zinc-800">
          <span>Navigate with ↑ ↓, press Enter to select</span>
          <span>Zenith Command</span>
        </div>
      </div>
    </div>
  );
};

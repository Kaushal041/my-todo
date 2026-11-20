'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveView } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  SunMedium,
  CalendarDays,
  Inbox,
  CheckSquare2,
  Kanban,
  Calendar,
  AlertCircle,
  Clock,
  Archive,
  Trash2,
  Timer,
  Flame,
  BookOpen,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
  Plus,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    tasks,
    openCreateTaskModal,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    setIsAiModalOpen,
  } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Counts
  const todayCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.dueDate === todayStr).length;
  const upcomingCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate > todayStr).length;
  const inboxCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && (!t.dueDate || t.category === 'Inbox')).length;
  const allActiveCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed').length;
  const importantCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;
  const overdueCount = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;
  const trashCount = tasks.filter((t) => t.inTrash).length;

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    onCloseMobile();
  };

  const navItem = (view: ActiveView, label: string, Icon: React.ElementType, badge?: number, badgeVariant?: 'default' | 'urgent') => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => handleSelectView(view)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group select-none text-left cursor-pointer active:scale-[0.98]',
          isActive
            ? 'bg-[#DC2626]/10 dark:bg-[#DC2626]/15 text-[#DC2626] dark:text-[#FAFAFA] font-bold border-l-4 border-[#DC2626] shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.25)]'
            : 'text-zinc-600 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA] hover:bg-zinc-100 dark:hover:bg-[#171717] hover:border-l-4 hover:border-[#DC2626] hover:translate-x-1'
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-125 group-hover:rotate-6',
              isActive
                ? 'text-[#DC2626] dark:text-[#EF4444]'
                : 'text-zinc-500 dark:text-[#A3A3A3] group-hover:text-[#DC2626] dark:group-hover:text-[#EF4444]'
            )}
          />
          <span className="truncate">{label}</span>
        </div>
        {typeof badge === 'number' && badge > 0 && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-xs font-bold shrink-0 tabular-nums transition-transform duration-150 group-hover:scale-105',
              badgeVariant === 'urgent'
                ? 'bg-[#DC2626]/15 dark:bg-[#DC2626]/20 text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/30 dark:border-[#DC2626]/40 shadow-xs'
                : isActive
                ? 'bg-[#DC2626]/20 dark:bg-[#DC2626]/25 text-[#DC2626] dark:text-[#FAFAFA]'
                : 'bg-zinc-100 dark:bg-[#171717] text-zinc-600 dark:text-[#A3A3A3] border border-zinc-200 dark:border-[#292929]'
            )}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 flex flex-col justify-between border-r border-zinc-200 dark:border-[#292929] bg-white dark:bg-[#080808] p-4 transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Logo & Workspace */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-gradient flex items-center justify-center shadow-lg shadow-[#DC2626]/35 text-white font-black text-base border border-[#EF4444]/40">
                Z
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-[#FAFAFA] flex items-center gap-1.5">
                  Zenith
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 dark:text-[#A3A3A3]">
                  Productivity OS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsAiModalOpen(true)}
                title="AI Assistant & Planner"
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#292929] bg-zinc-50 dark:bg-[#171717] hover:bg-[#DC2626]/10 hover:border-[#DC2626] text-[#DC2626] dark:text-[#EF4444] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Mobile close button */}
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA] md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Task Button */}
          <button
            onClick={() => openCreateTaskModal()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-[#FAFAFA] font-bold text-sm shadow-md shadow-[#DC2626]/35 hover:shadow-lg hover:shadow-[#EF4444]/40 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Task</span>
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-[#171717] text-zinc-600 dark:text-[#A3A3A3] border border-zinc-200 dark:border-[#292929]">
              N
            </span>
          </button>

          {/* Section 1: Core Views */}
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Overview
            </div>
            {navItem('dashboard', 'Dashboard', LayoutDashboard)}
            {navItem('my-day', 'My Day', SunMedium, todayCount)}
            {navItem('upcoming', 'Upcoming', CalendarDays, upcomingCount)}
            {navItem('inbox', 'Inbox', Inbox, inboxCount)}
            {navItem('all-tasks', 'All Tasks', CheckSquare2, allActiveCount)}
          </div>

          {/* Section 2: Task Views */}
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Views
            </div>
            {navItem('kanban', 'Kanban Board', Kanban)}
            {navItem('calendar', 'Calendar', Calendar)}
            {navItem('important', 'Important', AlertCircle, importantCount)}
            {navItem('overdue', 'Overdue', Clock, overdueCount, 'urgent')}
            {navItem('completed', 'Completed', Archive)}
            {navItem('trash', 'Trash', Trash2, trashCount)}
          </div>

          {/* Section 3: Focus & Habits */}
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Focus & Growth
            </div>
            {navItem('pomodoro', 'Pomodoro Timer', Timer)}
            {navItem('habits', 'Habit Tracker', Flame)}
            {navItem('journal', 'Notes & Journal', BookOpen)}
            {navItem('analytics', 'Analytics & Reports', BarChart3)}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-1">
          {navItem('settings', 'Settings', Settings)}
          
          <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <span>Command</span>
              <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">⌘K</kbd>
            </button>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard Shortcuts"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

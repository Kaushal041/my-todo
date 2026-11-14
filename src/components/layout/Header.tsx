'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveView } from '@/types';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    activeView,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    setIsCommandPaletteOpen,
    setIsAiModalOpen,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: settings.timeFormat === '12h',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.timeFormat]);

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Welcome to your daily command center' },
    'my-day': { title: 'My Day', subtitle: 'Focus on what matters most today' },
    upcoming: { title: 'Upcoming', subtitle: 'Timeline of planned tasks and deadlines' },
    inbox: { title: 'Inbox', subtitle: 'Capture and triage unorganized thoughts' },
    'all-tasks': { title: 'All Tasks', subtitle: 'Complete database of all active items' },
    kanban: { title: 'Kanban Board', subtitle: 'Visualize workflow across status stages' },
    calendar: { title: 'Calendar', subtitle: 'Schedule and manage deadline commitments' },
    important: { title: 'Important', subtitle: 'High priority and urgent responsibilities' },
    overdue: { title: 'Overdue', subtitle: 'Items that missed their scheduled deadline' },
    completed: { title: 'Completed', subtitle: 'Archive of finished tasks and milestones' },
    trash: { title: 'Trash', subtitle: 'Recover soft-deleted items or empty permanently' },
    pomodoro: { title: 'Pomodoro Timer', subtitle: 'Deep work focus blocks and scheduled recovery' },
    habits: { title: 'Habit Tracker', subtitle: 'Build continuous streaks and consistency' },
    journal: { title: 'Notes & Journal', subtitle: 'Daily reflections and personal logs' },
    analytics: { title: 'Analytics & Reports', subtitle: 'Productivity velocity and completion trends' },
    settings: { title: 'Settings', subtitle: 'Personal preferences and data management' },
  };

  const currentViewInfo = viewTitles[activeView] || { title: 'Zenith', subtitle: '' };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const toggleSound = () => {
    updateSettings({ soundEffects: !settings.soundEffects });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 md:px-8 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            {currentViewInfo.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
            {currentViewInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-100/70 pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Command palette button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <Command className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-[10px] font-mono text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Ctrl+K
          </kbd>
        </button>

        {/* AI Assistant button */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          title="Smart AI Breakdown"
          className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100/90 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline">AI Planner</span>
        </button>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          {currentTime || '00:00:00'}
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={settings.soundEffects ? 'Sound Enabled' : 'Sound Muted'}
          className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          {settings.soundEffects ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
};

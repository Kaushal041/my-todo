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
  ArrowLeft,
  ArrowRight,
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#292929] bg-[#080808]/90 px-4 md:px-8 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3">
        {/* Navigation History Back / Forward Controls */}
        <div className="flex items-center gap-1 mr-1">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.history.back();
            }}
            title="Go back (Browser Back)"
            className="p-1.5 rounded-xl border border-[#292929] bg-[#171717] hover:bg-[#DC2626]/15 hover:text-[#EF4444] hover:border-[#DC2626] text-[#A3A3A3] transition-all duration-150 cursor-pointer hover:scale-110 active:scale-90 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.history.forward();
            }}
            title="Go forward (Browser Forward)"
            className="p-1.5 rounded-xl border border-[#292929] bg-[#171717] hover:bg-[#DC2626]/15 hover:text-[#EF4444] hover:border-[#DC2626] text-[#A3A3A3] transition-all duration-150 cursor-pointer hover:scale-110 active:scale-90 shadow-2xs"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-xl p-2 text-[#A3A3A3] hover:bg-[#171717] md:hidden cursor-pointer transition-transform active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-[#FAFAFA] flex items-center gap-2">
            {currentViewInfo.title}
          </h1>
          <p className="text-xs text-[#A3A3A3] hidden sm:block">
            {currentViewInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#292929] bg-[#171717] pl-8 pr-3 py-1.5 text-xs text-[#FAFAFA] placeholder:text-[#A3A3A3] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/50 focus:outline-none transition-all"
          />
        </div>

        {/* Command palette button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#292929] bg-[#171717] px-2.5 py-1.5 text-xs font-semibold text-[#FAFAFA] hover:border-[#DC2626] hover:bg-[#202020] transition-all duration-150 cursor-pointer hover:shadow-2xs hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Command className="w-3.5 h-3.5 text-[#EF4444]" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="rounded bg-[#080808] px-1 py-0.5 text-[10px] font-mono text-[#A3A3A3] border border-[#292929]">
            Ctrl+K
          </kbd>
        </button>

        {/* AI Assistant button */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          title="Smart AI Breakdown"
          className="flex items-center gap-1.5 rounded-xl border border-[#DC2626]/60 bg-[#DC2626]/15 px-2.5 py-1.5 text-xs font-bold text-[#FAFAFA] hover:bg-[#DC2626]/25 hover:border-[#DC2626] transition-all duration-150 shadow-[0_0_15px_rgba(220,38,38,0.25)] cursor-pointer hover:shadow-lg hover:shadow-[#DC2626]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EF4444]" />
          <span className="hidden md:inline">AI Planner</span>
        </button>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center px-2.5 py-1 rounded-xl bg-[#171717] border border-[#292929] text-xs font-mono text-[#A3A3A3]">
          {currentTime || '00:00:00'}
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={settings.soundEffects ? 'Sound Enabled' : 'Sound Muted'}
          className="rounded-xl border border-[#292929] bg-[#171717] p-2 text-[#A3A3A3] hover:text-[#FAFAFA] hover:border-[#DC2626] transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
        >
          {settings.soundEffects ? <Volume2 className="w-4 h-4 text-[#EF4444]" /> : <VolumeX className="w-4 h-4 text-[#A3A3A3]" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl border border-[#292929] bg-[#171717] p-2 text-[#A3A3A3] hover:text-[#EF4444] hover:border-[#DC2626] transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#EF4444] transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#DC2626] transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
};

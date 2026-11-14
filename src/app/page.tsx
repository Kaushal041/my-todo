'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ShortcutsModal } from '@/components/layout/ShortcutsModal';
import { AiAssistantModal } from '@/components/smart/AiAssistantModal';
import { ToastContainer } from '@/components/ui/Toast';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';

// Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TaskListView } from '@/components/tasks/TaskListView';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CalendarView } from '@/components/tasks/CalendarView';
import { PomodoroTimer } from '@/components/productivity/PomodoroTimer';
import { HabitTracker } from '@/components/productivity/HabitTracker';
import { JournalNotes } from '@/components/productivity/JournalNotes';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { SettingsView } from '@/components/settings/SettingsView';

export default function Home() {
  const { activeView } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'my-day':
      case 'upcoming':
      case 'inbox':
      case 'all-tasks':
      case 'important':
      case 'overdue':
      case 'completed':
      case 'trash':
        return <TaskListView viewType={activeView} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'habits':
        return <HabitTracker />;
      case 'journal':
        return <JournalNotes />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/20 selection:text-indigo-500 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-6xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <TaskDetailModal />
      <CommandPalette />
      <ShortcutsModal />
      <AiAssistantModal />
      <ToastContainer />
    </div>
  );
}

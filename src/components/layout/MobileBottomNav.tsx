'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveView } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare2,
  Kanban,
  Menu,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

interface MobileBottomNavProps {
  onOpenMobileSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMobileSidebar,
}) => {
  const { activeView, setActiveView, tasks, openCreateTaskModal } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDueCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate === todayStr
  ).length;

  const isHomeActive = activeView === 'dashboard';
  const isTasksActive =
    activeView === 'my-day' ||
    activeView === 'all-tasks' ||
    activeView === 'upcoming' ||
    activeView === 'inbox' ||
    activeView === 'important' ||
    activeView === 'overdue' ||
    activeView === 'completed';
  const isKanbanActive = activeView === 'kanban';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-[#292929] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-5px_25px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home / Dashboard */}
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95',
            isHomeActive
              ? 'text-[#EF4444]'
              : 'text-[#A3A3A3] hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Tasks / My Day */}
        <button
          type="button"
          onClick={() => setActiveView('my-day')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 relative',
            isTasksActive
              ? 'text-[#EF4444]'
              : 'text-[#A3A3A3] hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <CheckSquare2 className="w-5 h-5" />
            {todayDueCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-black text-white shadow-xs">
                {todayDueCount}
              </span>
            )}
            {isTasksActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Tasks</span>
        </button>

        {/* 3. Center Primary "+ Task" Floating Action Button */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => openCreateTaskModal()}
            title="Create New Task"
            className="w-13 h-13 rounded-full bg-red-gradient text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/40 border-2 border-[#EF4444]/60 transition-transform active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-[#080808]"
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
        </div>

        {/* 4. Kanban Board */}
        <button
          type="button"
          onClick={() => setActiveView('kanban')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95',
            isKanbanActive
              ? 'text-[#EF4444]'
              : 'text-[#A3A3A3] hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <Kanban className="w-5 h-5" />
            {isKanbanActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Board</span>
        </button>

        {/* 5. Menu / All Views */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-[#A3A3A3] hover:text-[#FAFAFA] transition-all cursor-pointer select-none active:scale-95"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  onCloseMobileSidebar,
}) => {
  const { activeView, setActiveView, tasks, openCreateTaskModal } = useApp();

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const scrubSlotRef = useRef(0);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubSlot, setScrubSlot] = useState(0);
  const [isCancel, setIsCancel] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDueCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate === todayStr
  ).length;

  // Active status considering whether the Mobile Sidebar Menu is open
  const isMenuActive = isMobileSidebarOpen;
  const isHomeActive = !isMobileSidebarOpen && activeView === 'dashboard';
  const isTasksActive =
    !isMobileSidebarOpen &&
    (activeView === 'my-day' ||
      activeView === 'all-tasks' ||
      activeView === 'upcoming' ||
      activeView === 'inbox' ||
      activeView === 'important' ||
      activeView === 'overdue' ||
      activeView === 'completed');
  const isKanbanActive = !isMobileSidebarOpen && activeView === 'kanban';

  // Slot metadata for preview tooltip and visual feedback
  const slotData = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'tasks',
      label: todayDueCount > 0 ? `My Day (${todayDueCount})` : 'My Day',
      icon: CheckSquare2,
    },
    { id: 'fab', label: 'New Task', icon: Plus },
    { id: 'board', label: 'Kanban Board', icon: Kanban },
    {
      id: 'menu',
      label: isMobileSidebarOpen ? 'Close Menu' : 'All Menu',
      icon: Menu,
    },
  ];

  const calculateSlot = (clientX: number): number => {
    const container = navContainerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const fraction = relativeX / rect.width;
    if (fraction < 0.2) return 0;
    if (fraction < 0.4) return 1;
    if (fraction < 0.6) return 2;
    if (fraction < 0.8) return 3;
    return 4;
  };

  const executeSlotAction = (slot: number) => {
    switch (slot) {
      case 0:
        setActiveView('dashboard');
        onCloseMobileSidebar();
        break;
      case 1:
        setActiveView('my-day');
        onCloseMobileSidebar();
        break;
      case 2:
        openCreateTaskModal();
        onCloseMobileSidebar();
        break;
      case 3:
        setActiveView('kanban');
        onCloseMobileSidebar();
        break;
      case 4:
        onToggleMobileSidebar();
        break;
    }
  };

  // Touch Handlers for Bottom Nav Scrubbing
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;
    const slot = calculateSlot(touch.clientX);
    scrubSlotRef.current = slot;
    setScrubSlot(slot);
    setIsCancel(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = touch.clientY - touchStartRef.current.y;

    // Enter scrubbing mode once moved > 8px
    if (!isDraggingRef.current && dx > 8) {
      isDraggingRef.current = true;
      setIsScrubbing(true);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    }

    if (isDraggingRef.current) {
      // If user slides finger up > 75px above bottom bar, indicate cancel gesture
      if (dy < -75) {
        setIsCancel(true);
      } else {
        setIsCancel(false);
        const newSlot = calculateSlot(touch.clientX);
        if (newSlot !== scrubSlotRef.current) {
          scrubSlotRef.current = newSlot;
          setScrubSlot(newSlot);
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      didDragRef.current = true;
      setTimeout(() => {
        didDragRef.current = false;
      }, 120);

      if (!isCancel) {
        executeSlotAction(scrubSlotRef.current);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(22);
        }
      }
      setIsScrubbing(false);
      setIsCancel(false);
      isDraggingRef.current = false;
    }
  };

  const handleTouchCancel = () => {
    setIsScrubbing(false);
    setIsCancel(false);
    isDraggingRef.current = false;
    didDragRef.current = false;
  };

  // Desktop Mouse Support for scrubbing (during emulation/testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    const slot = calculateSlot(e.clientX);
    scrubSlotRef.current = slot;
    setScrubSlot(slot);
    setIsCancel(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const dx = Math.abs(e.clientX - touchStartRef.current.x);
    const dy = e.clientY - touchStartRef.current.y;

    if (!isDraggingRef.current && dx > 8) {
      isDraggingRef.current = true;
      setIsScrubbing(true);
    }

    if (isDraggingRef.current) {
      if (dy < -75) {
        setIsCancel(true);
      } else {
        setIsCancel(false);
        const newSlot = calculateSlot(e.clientX);
        if (newSlot !== scrubSlotRef.current) {
          scrubSlotRef.current = newSlot;
          setScrubSlot(newSlot);
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      didDragRef.current = true;
      setTimeout(() => {
        didDragRef.current = false;
      }, 120);

      if (!isCancel) {
        executeSlotAction(scrubSlotRef.current);
      }
      setIsScrubbing(false);
      setIsCancel(false);
      isDraggingRef.current = false;
    }
  };

  const ActiveTooltipIcon = slotData[scrubSlot].icon;

  return (
    <nav
      aria-label="Mobile Navigation"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-[#292929] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.8)] touch-none select-none"
    >
      <div
        ref={navContainerRef}
        className="flex items-center justify-around max-w-md mx-auto relative"
      >
        {/* Floating Scrubbing Tooltip Indicator */}
        {isScrubbing && (
          <div
            className="absolute -top-12 -translate-x-1/2 pointer-events-none transition-all duration-150 ease-out z-50 flex flex-col items-center animate-in fade-in zoom-in-90 duration-100"
            style={{
              left: `${scrubSlot * 20 + 10}%`,
            }}
          >
            <div
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md border transition-colors',
                isCancel
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  : 'bg-zinc-900/95 dark:bg-[#171717]/95 text-white dark:text-[#FAFAFA] border-zinc-700 dark:border-[#DC2626]/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
              )}
            >
              {isCancel ? (
                <span className="text-[11px]">Slide down to select</span>
              ) : (
                <>
                  <ActiveTooltipIcon className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#EF4444]" />
                  <span>{slotData[scrubSlot].label}</span>
                </>
              )}
            </div>
            {/* Notch indicator pointing down */}
            <div
              className={cn(
                'w-2 h-2 rotate-45 -mt-1 border-r border-b',
                isCancel
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-zinc-900 dark:bg-[#171717] border-zinc-700 dark:border-[#DC2626]/50'
              )}
            />
          </div>
        )}

        {/* Sliding Active Pill Background across slots */}
        <div
          className={cn(
            'absolute top-0.5 bottom-0.5 rounded-2xl transition-all duration-150 ease-out pointer-events-none',
            isScrubbing && !isCancel
              ? 'opacity-100 bg-[#DC2626]/12 dark:bg-[#DC2626]/20 border border-[#DC2626]/30 dark:border-[#DC2626]/40 shadow-sm'
              : 'opacity-0'
          )}
          style={{
            left: `${scrubSlot * 20}%`,
            width: '20%',
          }}
        />

        {/* 1. Home / Dashboard */}
        <button
          type="button"
          onClick={() => {
            if (didDragRef.current) return;
            setActiveView('dashboard');
            onCloseMobileSidebar();
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 flex-1 z-10',
            (isScrubbing ? scrubSlot === 0 : isHomeActive)
              ? 'text-[#DC2626] dark:text-[#EF4444] scale-105'
              : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5 transition-transform" />
            {(isScrubbing ? scrubSlot === 0 : isHomeActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Tasks / My Day */}
        <button
          type="button"
          onClick={() => {
            if (didDragRef.current) return;
            setActiveView('my-day');
            onCloseMobileSidebar();
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 relative flex-1 z-10',
            (isScrubbing ? scrubSlot === 1 : isTasksActive)
              ? 'text-[#DC2626] dark:text-[#EF4444] scale-105'
              : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <CheckSquare2 className="w-5 h-5 transition-transform" />
            {todayDueCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-black text-white shadow-xs">
                {todayDueCount}
              </span>
            )}
            {(isScrubbing ? scrubSlot === 1 : isTasksActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Tasks</span>
        </button>

        {/* 3. Center Primary "+ Task" Floating Action Button */}
        <div className="relative -top-4 flex items-center justify-center flex-1 z-20">
          <button
            type="button"
            onClick={() => {
              if (didDragRef.current) return;
              openCreateTaskModal();
              onCloseMobileSidebar();
            }}
            title="Create New Task"
            className={cn(
              'w-13 h-13 rounded-full bg-red-gradient text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/40 border-2 border-[#EF4444]/60 transition-all active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-white dark:ring-[#080808]',
              isScrubbing && scrubSlot === 2 && 'scale-110 shadow-[0_0_20px_rgba(220,38,38,0.7)]'
            )}
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
        </div>

        {/* 4. Kanban Board */}
        <button
          type="button"
          onClick={() => {
            if (didDragRef.current) return;
            setActiveView('kanban');
            onCloseMobileSidebar();
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 flex-1 z-10',
            (isScrubbing ? scrubSlot === 3 : isKanbanActive)
              ? 'text-[#DC2626] dark:text-[#EF4444] scale-105'
              : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <Kanban className="w-5 h-5 transition-transform" />
            {(isScrubbing ? scrubSlot === 3 : isKanbanActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Board</span>
        </button>

        {/* 5. Menu / All Views (Toggleable) */}
        <button
          type="button"
          onClick={() => {
            if (didDragRef.current) return;
            onToggleMobileSidebar();
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 flex-1 z-10',
            (isScrubbing ? scrubSlot === 4 : isMenuActive)
              ? 'text-[#DC2626] dark:text-[#EF4444] scale-105'
              : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
          )}
        >
          <div className="relative">
            <Menu className="w-5 h-5 transition-transform" />
            {(isScrubbing ? scrubSlot === 4 : isMenuActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};

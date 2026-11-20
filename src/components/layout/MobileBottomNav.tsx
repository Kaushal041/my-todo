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
  Calendar,
  Clock,
  Inbox,
  AlertCircle,
  Archive,
  Timer,
  Flame,
  BookOpen,
  BarChart3,
  Settings,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

interface MobileBottomNavProps {
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
}

type ButtonId = 'home' | 'tasks' | 'fab' | 'board' | 'menu';

interface QuickActionOption {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  badge?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  onCloseMobileSidebar,
}) => {
  const {
    activeView,
    setActiveView,
    tasks,
    openCreateTaskModal,
    setIsAiModalOpen,
  } = useApp();

  const [activePopup, setActivePopup] = useState<ButtonId | null>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldTriggered = useRef(false);
  const actionExecutedRef = useRef(false);
  const touchStartCoord = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDueCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate === todayStr
  ).length;
  const upcomingCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate > todayStr
  ).length;
  const inboxCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && (!t.dueDate || t.category === 'Inbox')
  ).length;
  const importantCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')
  ).length;
  const overdueCount = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  ).length;

  // Active status considering whether the Mobile Sidebar Menu is open
  const isMenuActive = isMobileSidebarOpen || activePopup === 'menu';
  const isHomeActive = !isMobileSidebarOpen && activeView === 'dashboard' && activePopup !== 'tasks' && activePopup !== 'board' && activePopup !== 'menu';
  const isTasksActive =
    !isMobileSidebarOpen &&
    (activeView === 'my-day' ||
      activeView === 'all-tasks' ||
      activeView === 'upcoming' ||
      activeView === 'inbox' ||
      activeView === 'important' ||
      activeView === 'overdue' ||
      activeView === 'completed') &&
    activePopup !== 'home' &&
    activePopup !== 'board' &&
    activePopup !== 'menu';
  const isKanbanActive = !isMobileSidebarOpen && (activeView === 'kanban' || activeView === 'calendar') && activePopup !== 'home' && activePopup !== 'tasks' && activePopup !== 'menu';

  const closePopup = () => {
    setActivePopup(null);
    setHoveredOptionId(null);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  // Close popup if user clicks Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global touchmove and touchend listener when popup is active
  useEffect(() => {
    if (!activePopup) return;

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        moveHold(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleWindowTouchEnd = () => {
      if (!isHoldTriggered.current || !activePopup || actionExecutedRef.current) return;
      if (hoveredOptionId) {
        actionExecutedRef.current = true;
        const opt = optionsMap[activePopup]?.find((o) => o.id === hoveredOptionId);
        if (opt) {
          opt.action();
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(25);
          }
        }
        closePopup();
      }
    };

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd);
    window.addEventListener('touchcancel', closePopup);

    return () => {
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', closePopup);
    };
  }, [activePopup, hoveredOptionId]);

  // Quick Action Options for each held button
  const optionsMap: Record<ButtonId, QuickActionOption[]> = {
    home: [
      {
        id: 'home-dash',
        label: 'Dashboard Overview',
        subtitle: 'Daily metrics & summary',
        icon: LayoutDashboard,
        action: () => {
          setActiveView('dashboard');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'home-analytics',
        label: 'Analytics & Reports',
        subtitle: 'Productivity trends',
        icon: BarChart3,
        action: () => {
          setActiveView('analytics');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'home-pomodoro',
        label: 'Focus Timer',
        subtitle: 'Pomodoro deep work',
        icon: Timer,
        action: () => {
          setActiveView('pomodoro');
          onCloseMobileSidebar();
        },
      },
    ],
    tasks: [
      {
        id: 'tasks-myday',
        label: 'My Day (Today)',
        icon: CheckSquare2,
        badge: todayDueCount,
        action: () => {
          setActiveView('my-day');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'tasks-upcoming',
        label: 'Upcoming Deadlines',
        icon: Calendar,
        badge: upcomingCount,
        action: () => {
          setActiveView('upcoming');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'tasks-inbox',
        label: 'Inbox Triage',
        icon: Inbox,
        badge: inboxCount,
        action: () => {
          setActiveView('inbox');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'tasks-important',
        label: 'Important & Urgent',
        icon: AlertCircle,
        badge: importantCount,
        action: () => {
          setActiveView('important');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'tasks-overdue',
        label: 'Overdue Items',
        icon: Clock,
        badge: overdueCount,
        action: () => {
          setActiveView('overdue');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'tasks-completed',
        label: 'Completed Archive',
        icon: Archive,
        action: () => {
          setActiveView('completed');
          onCloseMobileSidebar();
        },
      },
    ],
    fab: [
      {
        id: 'fab-task',
        label: 'New Task',
        subtitle: 'Add work commitment',
        icon: Plus,
        action: () => {
          openCreateTaskModal();
          onCloseMobileSidebar();
        },
      },
      {
        id: 'fab-ai',
        label: 'AI Planner Assistant',
        subtitle: 'Break down complex goals',
        icon: Sparkles,
        action: () => {
          setIsAiModalOpen(true);
          onCloseMobileSidebar();
        },
      },
      {
        id: 'fab-pomodoro',
        label: 'Start Pomodoro Block',
        subtitle: '25-minute deep focus',
        icon: Timer,
        action: () => {
          setActiveView('pomodoro');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'fab-habit',
        label: 'Habit Tracker',
        subtitle: 'Build daily streaks',
        icon: Flame,
        action: () => {
          setActiveView('habits');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'fab-journal',
        label: 'Write Quick Note',
        subtitle: 'Reflections & journal',
        icon: BookOpen,
        action: () => {
          setActiveView('journal');
          onCloseMobileSidebar();
        },
      },
    ],
    board: [
      {
        id: 'board-kanban',
        label: 'Kanban Workflow Board',
        subtitle: 'Drag & drop stages',
        icon: Kanban,
        action: () => {
          setActiveView('kanban');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'board-calendar',
        label: 'Calendar Schedule',
        subtitle: 'Monthly & weekly views',
        icon: Calendar,
        action: () => {
          setActiveView('calendar');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'board-analytics',
        label: 'Productivity Velocity',
        subtitle: 'Charts & completion stats',
        icon: BarChart3,
        action: () => {
          setActiveView('analytics');
          onCloseMobileSidebar();
        },
      },
    ],
    menu: [
      {
        id: 'menu-sidebar',
        label: isMobileSidebarOpen ? 'Close Menu Drawer' : 'Open Menu Drawer',
        subtitle: 'All views & categories',
        icon: Menu,
        action: () => {
          onToggleMobileSidebar();
        },
      },
      {
        id: 'menu-settings',
        label: 'Settings & Workspace',
        subtitle: 'Theme, profile & fields',
        icon: Settings,
        action: () => {
          setActiveView('settings');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'menu-habits',
        label: 'Habit Tracker',
        subtitle: 'Streaks & rituals',
        icon: Flame,
        action: () => {
          setActiveView('habits');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'menu-journal',
        label: 'Notes & Journal',
        subtitle: 'Daily reflections',
        icon: BookOpen,
        action: () => {
          setActiveView('journal');
          onCloseMobileSidebar();
        },
      },
      {
        id: 'menu-trash',
        label: 'Recycle Bin (10 Days)',
        subtitle: 'Recover deleted items',
        icon: Trash2,
        action: () => {
          setActiveView('trash');
          onCloseMobileSidebar();
        },
      },
    ],
  };

  // Touch handlers for Hold & Slide gesture
  const startHold = (buttonId: ButtonId, clientX: number, clientY: number) => {
    touchStartCoord.current = { x: clientX, y: clientY };
    isHoldTriggered.current = false;
    actionExecutedRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      isHoldTriggered.current = true;
      setActivePopup(buttonId);
      setHoveredOptionId(null);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    }, 280);
  };

  const moveHold = (clientX: number, clientY: number) => {
    // If not triggered yet, cancel if moved significantly (like scrolling)
    if (!isHoldTriggered.current) {
      const dx = Math.abs(clientX - touchStartCoord.current.x);
      const dy = Math.abs(clientY - touchStartCoord.current.y);
      if (dx > 12 || dy > 12) {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      }
      return;
    }

    // Inspect which element is currently under the sliding finger
    const elem = document.elementFromPoint(clientX, clientY);
    const target = elem?.closest('[data-option-id]') as HTMLElement | null;
    const optId = target?.dataset?.optionId || null;

    if (optId !== hoveredOptionId) {
      setHoveredOptionId(optId);
      if (optId && typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const endHold = (buttonId: ButtonId, defaultAction: () => void) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    if (!isHoldTriggered.current) {
      // Normal quick tap (<280ms)
      closePopup();
      defaultAction();
      return;
    }

    // Hold was active: check if user released finger over an option
    if (hoveredOptionId && !actionExecutedRef.current) {
      actionExecutedRef.current = true;
      const opt = optionsMap[buttonId]?.find((o) => o.id === hoveredOptionId);
      if (opt) {
        opt.action();
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      }
      closePopup();
    }
    // If hoveredOptionId is null, finger was released in empty area or button itself:
    // we keep the popup open so the user can easily tap whichever option they choose!
  };

  // Popup alignment styles
  const popupPositions: Record<ButtonId, string> = {
    home: 'left-3 sm:left-6 origin-bottom-left',
    tasks: 'left-6 sm:left-16 origin-bottom-left',
    fab: 'left-1/2 -translate-x-1/2 origin-bottom',
    board: 'right-6 sm:right-16 origin-bottom-right',
    menu: 'right-3 sm:right-6 origin-bottom-right',
  };

  return (
    <>
      {/* Dimmed backdrop when a Hold-Popup is active */}
      {activePopup && (
        <div
          className="fixed inset-0 z-45 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 md:hidden"
          onClick={closePopup}
          onTouchStart={closePopup}
        />
      )}

      {/* Floating Hold & Slide Quick-Action Picker Popover */}
      {activePopup && (
        <div
          className={cn(
            'fixed bottom-22 z-50 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-zinc-200 dark:border-[#292929] bg-white/95 dark:bg-[#171717]/95 p-1.5 shadow-2xl dark:shadow-[0_0_30px_rgba(220,38,38,0.3)] backdrop-blur-xl animate-in slide-in-from-bottom-3 zoom-in-95 duration-150 select-none touch-none md:hidden',
            popupPositions[activePopup]
          )}
        >
          {/* Header tip */}
          <div className="px-2.5 py-1 mb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            <span>Slide or tap option</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          </div>

          {/* Options List */}
          <div className="space-y-1">
            {optionsMap[activePopup].map((option) => {
              const isHovered = hoveredOptionId === option.id;
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  data-option-id={option.id}
                  type="button"
                  onClick={() => {
                    option.action();
                    closePopup();
                  }}
                  onMouseEnter={() => setHoveredOptionId(option.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer',
                    isHovered
                      ? 'bg-[#DC2626] text-white shadow-md shadow-[#DC2626]/30 scale-[1.02]'
                      : 'hover:bg-zinc-100 dark:hover:bg-[#202020] text-zinc-800 dark:text-[#FAFAFA]'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform',
                        isHovered
                          ? 'text-white scale-110'
                          : 'text-zinc-500 dark:text-[#A3A3A3]'
                      )}
                    />
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.subtitle && (
                        <span
                          className={cn(
                            'text-[10px] font-normal truncate',
                            isHovered
                              ? 'text-white/80'
                              : 'text-zinc-400 dark:text-zinc-500'
                          )}
                        >
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {typeof option.badge === 'number' && option.badge > 0 && (
                    <span
                      className={cn(
                        'ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                        isHovered
                          ? 'bg-white text-[#DC2626]'
                          : 'bg-zinc-100 dark:bg-[#111111] text-zinc-600 dark:text-[#A3A3A3] border border-zinc-200 dark:border-[#292929]'
                      )}
                    >
                      {option.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-[#292929] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.8)] touch-none"
        onTouchMove={(e) => {
          if (activePopup || isHoldTriggered.current) {
            moveHold(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Home / Dashboard (Tap or Hold & Slide) */}
          <button
            type="button"
            onTouchStart={(e) => startHold('home', e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() =>
              endHold('home', () => {
                setActiveView('dashboard');
                onCloseMobileSidebar();
              })
            }
            onMouseDown={(e) => startHold('home', e.clientX, e.clientY)}
            onMouseUp={() =>
              endHold('home', () => {
                setActiveView('dashboard');
                onCloseMobileSidebar();
              })
            }
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95',
              isHomeActive
                ? 'text-[#DC2626] dark:text-[#EF4444]'
                : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
            )}
          >
            <div className="relative">
              <LayoutDashboard className="w-5 h-5" />
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* 2. Tasks / My Day (Tap or Hold & Slide) */}
          <button
            type="button"
            onTouchStart={(e) => startHold('tasks', e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() =>
              endHold('tasks', () => {
                setActiveView('my-day');
                onCloseMobileSidebar();
              })
            }
            onMouseDown={(e) => startHold('tasks', e.clientX, e.clientY)}
            onMouseUp={() =>
              endHold('tasks', () => {
                setActiveView('my-day');
                onCloseMobileSidebar();
              })
            }
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 relative',
              isTasksActive
                ? 'text-[#DC2626] dark:text-[#EF4444]'
                : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
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
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Tasks</span>
          </button>

          {/* 3. Center Primary "+ Task" Floating Action Button (Tap or Hold & Slide) */}
          <div className="relative -top-4 flex items-center justify-center">
            <button
              type="button"
              onTouchStart={(e) => startHold('fab', e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={() =>
                endHold('fab', () => {
                  openCreateTaskModal();
                  onCloseMobileSidebar();
                })
              }
              onMouseDown={(e) => startHold('fab', e.clientX, e.clientY)}
              onMouseUp={() =>
                endHold('fab', () => {
                  openCreateTaskModal();
                  onCloseMobileSidebar();
                })
              }
              title="Create New Task (or hold to choose option)"
              className="w-13 h-13 rounded-full bg-red-gradient text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/40 border-2 border-[#EF4444]/60 transition-transform active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-white dark:ring-[#080808]"
            >
              <Plus className="w-6 h-6 stroke-[2.75]" />
            </button>
          </div>

          {/* 4. Kanban Board (Tap or Hold & Slide) */}
          <button
            type="button"
            onTouchStart={(e) => startHold('board', e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() =>
              endHold('board', () => {
                setActiveView('kanban');
                onCloseMobileSidebar();
              })
            }
            onMouseDown={(e) => startHold('board', e.clientX, e.clientY)}
            onMouseUp={() =>
              endHold('board', () => {
                setActiveView('kanban');
                onCloseMobileSidebar();
              })
            }
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95',
              isKanbanActive
                ? 'text-[#DC2626] dark:text-[#EF4444]'
                : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
            )}
          >
            <div className="relative">
              <Kanban className="w-5 h-5" />
              {isKanbanActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Board</span>
          </button>

          {/* 5. Menu / All Views (Tap to Toggle or Hold & Slide) */}
          <button
            type="button"
            onTouchStart={(e) => startHold('menu', e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() =>
              endHold('menu', () => {
                onToggleMobileSidebar();
              })
            }
            onMouseDown={(e) => startHold('menu', e.clientX, e.clientY)}
            onMouseUp={() =>
              endHold('menu', () => {
                onToggleMobileSidebar();
              })
            }
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95',
              isMenuActive
                ? 'text-[#DC2626] dark:text-[#EF4444]'
                : 'text-zinc-500 dark:text-[#A3A3A3] hover:text-zinc-900 dark:hover:text-[#FAFAFA]'
            )}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {isMenuActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};

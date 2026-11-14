'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Check,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CalendarView: React.FC = () => {
  const { tasks, openCreateTaskModal, openEditTaskModal } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const activeTasks = tasks.filter((t) => !t.inTrash);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Week View calculation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h3>

          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-xl bg-zinc-100 p-0.5 dark:bg-zinc-800">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'month'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'week'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Week
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              openCreateTaskModal({
                dueDate: format(currentDate, 'yyyy-MM-dd'),
              })
            }
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {calendarMode === 'month' ? (
        /* Monthly Grid */
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
            {days.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayTasks = activeTasks.filter((t) => t.dueDate === dayStr);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={dayStr}
                  onClick={() => openCreateTaskModal({ dueDate: dayStr })}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    !isCurrentMonth
                      ? 'bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isCurrentDay
                          ? 'bg-indigo-600 text-white font-black shadow-xs'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateTaskModal({ dueDate: dayStr });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-indigo-600 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-20">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isCompleted = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditTaskModal(task);
                          }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate border transition-transform hover:scale-[1.02] ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 line-through'
                              : task.priority === 'urgent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
                              : task.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-2.5 h-2.5 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <span className="block text-[9px] font-semibold text-zinc-400 pl-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>
      ) : (
        /* Week View Grid */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayTasks = activeTasks.filter((t) => t.dueDate === dayStr);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dayStr}
                className={`rounded-2xl border p-3 flex flex-col min-h-[380px] bg-white dark:bg-zinc-900/90 ${
                  isCurrentDay
                    ? 'border-indigo-500/80 shadow-md shadow-indigo-500/10'
                    : 'border-zinc-200/80 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        isCurrentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {format(day, 'MMM d')}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateTaskModal({ dueDate: dayStr })}
                    className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openEditTaskModal(task)}
                      className="p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all"
                    >
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400 font-mono">
                        {task.dueTime ? <span>{task.dueTime}</span> : <span />}
                        <span className="uppercase text-[9px] font-bold text-indigo-500">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}

                  {dayTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      No commitments
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

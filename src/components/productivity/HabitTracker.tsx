'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import {
  Flame,
  Plus,
  Check,
  Trash2,
  Calendar,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

export const HabitTracker: React.FC = () => {
  const { habits, addHabit, toggleHabitDate, deleteHabit, categories } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Health');
  const [newTargetDays, setNewTargetDays] = useState(7);
  const [newColor, setNewColor] = useState('#6366f1');

  // Days for the 7-day visual grid
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      category: newCategory,
      frequency: 'daily',
      targetDaysPerWeek: Number(newTargetDays) || 7,
      color: newColor,
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Habits
            </span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">
            {habits.length}
          </div>
          <span className="text-xs text-zinc-400">Consistent daily rituals</span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Top Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {highestStreak} days
          </div>
          <span className="text-xs text-zinc-400">Current active momentum</span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Weekly Goal
            </span>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 text-xs gap-1.5 self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Habit</span>
          </Button>
        </div>
      </div>

      {/* Habits 7-Day Grid Cards */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            {/* Table / Grid Header */}
            <div className="grid grid-cols-12 items-center p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-4">Habit & Category</div>
              <div className="col-span-5 sm:col-span-6 grid grid-cols-7 text-center">
                {weekDays.map((d) => (
                  <div key={d.toISOString()} className="flex flex-col items-center">
                    <span>{format(d, 'EEE')[0]}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{format(d, 'd')}</span>
                  </div>
                ))}
              </div>
              <div className="col-span-2 text-right">Streak</div>
            </div>

            {/* Habit Rows */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {habits.map((habit) => {
                const thisWeekDoneCount = weekDays.filter((d) =>
                  habit.completedDates.includes(format(d, 'yyyy-MM-dd'))
                ).length;

                return (
                  <div
                    key={habit.id}
                    className="grid grid-cols-12 items-center p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Left: Title, category, delete */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {habit.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400">
                          {thisWeekDoneCount}/{habit.targetDaysPerWeek}d this week • {habit.category}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1 text-zinc-300 hover:text-rose-500 transition-colors ml-auto shrink-0"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: 7 Day Toggle Checkboxes */}
                    <div className="col-span-5 sm:col-span-6 grid grid-cols-7 gap-1">
                      {weekDays.map((d) => {
                        const dateStr = format(d, 'yyyy-MM-dd');
                        const isDone = habit.completedDates.includes(dateStr);
                        return (
                          <button
                            key={dateStr}
                            onClick={() => toggleHabitDate(habit.id, dateStr)}
                            className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                              isDone
                                ? 'text-white shadow-xs'
                                : 'border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                            }`}
                            style={{
                              backgroundColor: isDone ? habit.color || '#6366f1' : undefined,
                            }}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right: Streak badge */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <div className="py-12 text-center text-xs text-zinc-400">
                  No habits created yet. Click &apos;Add New Habit&apos; to build daily rituals!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Habit Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Daily Ritual"
        description="Choose a habit to track and stay accountable every day"
        maxWidth="md"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Habit Title *
            </label>
            <Input
              autoFocus
              placeholder="e.g. Read 20 pages of non-fiction"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                Target Days / Week
              </label>
              <select
                value={newTargetDays}
                onChange={(e) => setNewTargetDays(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value={7}>7 days (Every day)</option>
                <option value={5}>5 days (Weekdays)</option>
                <option value={4}>4 days</option>
                <option value={3}>3 days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newColor === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!newTitle.trim()}>
              Create Habit
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

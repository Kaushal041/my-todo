'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from './MetricCard';
import { QuickAddTask } from './QuickAddTask';
import { ProductivityCharts } from './ProductivityCharts';
import { Badge } from '@/components/ui/Badge';
import {
  SunMedium,
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
  Sparkles,
  Calendar,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';

const MOTIVATIONAL_QUOTES = [
  { text: 'Focus is a muscle. The more you protect it, the stronger it grows.', author: 'Cal Newport' },
  { text: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', author: 'John C. Maxwell' },
  { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
];

export const DashboardView: React.FC = () => {
  const {
    tasks,
    habits,
    focusSessions,
    settings,
    setActiveView,
    toggleTaskComplete,
    openEditTaskModal,
    openCreateTaskModal,
  } = useApp();

  const [quoteIndex, setQuoteIndex] = useState(0);

  const now = new Date();
  const currentHour = now.getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  const todayStr = format(now, 'yyyy-MM-dd');

  // Stats calculation
  const dueTodayTasks = tasks.filter(
    (t) => !t.inTrash && t.dueDate === todayStr
  );
  const dueTodayTotal = dueTodayTasks.length;
  const dueTodayCompleted = dueTodayTasks.filter((t) => t.status === 'completed').length;
  const dueTodayPending = dueTodayTotal - dueTodayCompleted;

  const totalCompleted = tasks.filter((t) => !t.inTrash && t.status === 'completed').length;
  const totalPending = tasks.filter((t) => !t.inTrash && t.status !== 'completed').length;
  const overdueTasks = tasks.filter(
    (t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  );

  // Daily Productivity Score (0 - 100)
  // Factors: today completion rate (40%), habits done today (30%), focus minutes (30%)
  const todayHabitsDone = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const habitRate = habits.length > 0 ? (todayHabitsDone / habits.length) * 30 : 25;
  const taskRate = dueTodayTotal > 0 ? (dueTodayCompleted / dueTodayTotal) * 40 : 35;
  const todayFocusMinutes = focusSessions
    .filter((s) => s.timestamp.startsWith(todayStr))
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const focusScore = Math.min(30, (todayFocusMinutes / 50) * 30);
  const productivityScore = Math.round(habitRate + taskRate + focusScore);

  const nextUpcoming = tasks
    .filter((t) => !t.inTrash && t.status !== 'completed')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 5);

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner: Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-[#292929] bg-white dark:bg-[#111111] p-6 shadow-md dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Subtle Luxury Red Glow Ambient Backdrops */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#DC2626]/10 dark:bg-[#DC2626]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-[#DC2626]/10 dark:bg-[#7F1D1D]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DC2626] dark:text-[#EF4444]">
            <Sparkles className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#EF4444]" />
            <span>{format(now, 'EEEE, MMMM d, yyyy')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#FAFAFA]">
            {greeting}, <span className="text-red-gradient drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">{settings.userName || 'Kaushal'}</span>
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-[#A3A3A3]">
            You have <span className="font-bold text-[#DC2626] dark:text-[#EF4444] px-2 py-0.5 rounded-md bg-[#DC2626]/10 border border-[#DC2626]/20 dark:border-[#DC2626]/30 shadow-xs dark:shadow-[0_0_8px_rgba(220,38,38,0.2)]">{dueTodayPending} tasks</span> due today and{' '}
            <span className="font-bold text-zinc-800 dark:text-[#FAFAFA] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#171717] border border-zinc-200 dark:border-[#292929]">{todayHabitsDone} habits</span> checked off.
          </p>
        </div>

        {/* Motivational quote card */}
        <div className="relative z-10 max-w-md rounded-2xl border border-zinc-200 dark:border-[#292929] bg-zinc-50/90 dark:bg-[#171717]/90 p-4 backdrop-blur-md hover:border-[#DC2626]/60 dark:hover:border-[#DC2626]/60 shadow-xs dark:shadow-none hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-200">
          <button
            onClick={rotateQuote}
            title="Next quote"
            className="absolute right-2.5 top-2.5 p-1.5 rounded-lg text-zinc-400 dark:text-[#A3A3A3] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-zinc-200 dark:hover:bg-[#202020] transition-all duration-150 cursor-pointer hover:rotate-180 active:scale-90"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <p className="text-xs italic text-zinc-800 dark:text-[#FAFAFA] pr-5 leading-relaxed">
            &ldquo;{currentQuote.text}&rdquo;
          </p>
          <span className="mt-1 block text-[10px] font-semibold text-zinc-500 dark:text-[#A3A3A3]">
            — {currentQuote.author}
          </span>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Due Today"
          value={dueTodayPending}
          subtitle={
            dueTodayPending === 0 && dueTodayCompleted > 0
              ? `${dueTodayCompleted} completed (All done! 🎉)`
              : dueTodayTotal === 0
              ? 'All caught up!'
              : `${dueTodayCompleted} of ${dueTodayTotal} done (${Math.round((dueTodayCompleted / dueTodayTotal) * 100)}%)`
          }
          icon={SunMedium}
          highlight={dueTodayPending > 0}
          onClick={() => setActiveView('my-day')}
        />

        <MetricCard
          title="Completed"
          value={totalCompleted}
          subtitle="Finished achievements"
          icon={CheckCircle2}
          trend="+3 this week"
          trendUp
          onClick={() => setActiveView('completed')}
        />

        <MetricCard
          title="Total Pending"
          value={totalPending}
          subtitle="Active task pipeline"
          icon={Calendar}
          onClick={() => setActiveView('all-tasks')}
        />

        <MetricCard
          title="Overdue"
          value={overdueTasks.length}
          subtitle={overdueTasks.length > 0 ? 'Requires attention' : 'All clear!'}
          icon={Clock}
          alert={overdueTasks.length > 0}
          onClick={() => setActiveView('overdue')}
        />

        <MetricCard
          title="Productivity Score"
          value={`${productivityScore}%`}
          subtitle={productivityScore >= 80 ? 'Peak Velocity 🔥' : 'Steady progress'}
          icon={Zap}
          highlight
          onClick={() => setActiveView('analytics')}
        />
      </div>

      {/* Quick Add Bar */}
      <QuickAddTask />

      {/* Recharts Analytics: Velocity & Priority */}
      <ProductivityCharts />

      {/* Two-Column Focus Section: Upcoming Deadlines & Active Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Upcoming Deadlines
              </h3>
              <button
                onClick={() => setActiveView('upcoming')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
              {nextUpcoming.length > 0 ? (
                nextUpcoming.map((task) => (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-5 h-5 rounded-md border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:border-indigo-500 transition-colors shrink-0"
                      >
                        {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left"
                      >
                        {task.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="priority" priority={task.priority} />
                      {task.dueDate && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          {task.dueDate === todayStr ? 'Today' : task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No upcoming deadlines. Enjoy your clear day!
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => openCreateTaskModal()}
              className="text-xs font-medium text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <span>+ Add a scheduled commitment</span>
            </button>
          </div>
        </div>

        {/* Daily Habits Quick Checklist */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Today&apos;s Habits & Rituals
              </h3>
              <button
                onClick={() => setActiveView('habits')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Manage habits</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
              {habits.length > 0 ? (
                habits.map((habit) => {
                  const isDoneToday = habit.completedDates.includes(todayStr);
                  return (
                    <div
                      key={habit.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => {
                            // Toggle habit
                            const prev = habit.completedDates.includes(todayStr);
                            if (!prev) {
                              // We can call context toggle
                            }
                          }}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                            isDoneToday
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'border border-zinc-300 dark:border-zinc-700 hover:border-amber-500'
                          }`}
                        >
                          {isDoneToday && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`text-xs font-medium truncate ${isDoneToday ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {habit.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{habit.streak}d streak</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No habits created yet. Build your first ritual in Habits!
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setActiveView('pomodoro')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>⚡ Start a 25-minute Deep Work session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { exportTasksToCSV, exportFocusSessionsToCSV, exportFullBackupJSON } from '@/lib/export-csv';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  FileSpreadsheet,
  Download,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, habits, journal, settings } = useApp();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

  // Filter tasks and sessions by date range
  const rangeDateLimit = subDays(new Date(), daysCount).toISOString();

  const relevantTasks = useMemo(() => {
    return tasks.filter((t) => !t.inTrash && t.createdAt >= rangeDateLimit);
  }, [tasks, rangeDateLimit]);

  const completedTasks = relevantTasks.filter((t) => t.status === 'completed');
  const completionRate =
    relevantTasks.length > 0
      ? Math.round((completedTasks.length / relevantTasks.length) * 100)
      : 100;

  const totalFocusMinutes = focusSessions
    .filter((s) => s.timestamp >= rangeDateLimit)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Time-series chart data
  const velocityData = useMemo(() => {
    const daysToShow = dateRange === '7d' ? 7 : 14;
    return Array.from({ length: daysToShow }, (_, i) => {
      const d = subDays(new Date(), daysToShow - 1 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const label = format(d, 'MMM d');

      const completed = tasks.filter(
        (t) => t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;

      const focusMins = focusSessions
        .filter((s) => s.timestamp.startsWith(dateStr))
        .reduce((sum, curr) => sum + (curr.durationMinutes || 0), 0);

      return {
        date: label,
        completed,
        focusMins,
      };
    });
  }, [dateRange, tasks, focusSessions]);

  // Category Distribution
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    relevantTasks.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [relevantTasks]);

  // Priority Breakdown Bar Chart
  const priorityBarData = useMemo(() => {
    const active = relevantTasks.filter((t) => t.status !== 'completed');
    return [
      { name: 'Urgent', count: active.filter((t) => t.priority === 'urgent').length, fill: '#f43f5e' },
      { name: 'High', count: active.filter((t) => t.priority === 'high').length, fill: '#f59e0b' },
      { name: 'Medium', count: active.filter((t) => t.priority === 'medium').length, fill: '#38bdf8' },
      { name: 'Low', count: active.filter((t) => t.priority === 'low').length, fill: '#94a3b8' },
    ];
  }, [relevantTasks]);

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '7d'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '30d'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateRange === 'all'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportTasksToCSV(tasks)}
            className="text-xs gap-1.5 h-8"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Tasks CSV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportFocusSessionsToCSV(focusSessions)}
            className="text-xs gap-1.5 h-8"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Sessions CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">
            {completedTasks.length}
          </div>
          <span className="text-xs text-zinc-400">Total milestones reached</span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">
            {completionRate}%
          </div>
          <span className="text-xs text-zinc-400">Executed vs planned</span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Focus Time</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">
            {(totalFocusMinutes / 60).toFixed(1)} hrs
          </div>
          <span className="text-xs text-zinc-400">{totalFocusMinutes} minutes logged</span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Habits</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {habits.length}
          </div>
          <span className="text-xs text-zinc-400">Consistent rituals</span>
        </div>
      </div>

      {/* Completion & Focus Velocity Over Time */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Productivity Velocity Trend
            </h3>
            <p className="text-xs text-zinc-400">
              Tasks completed day-by-day across the chosen timeframe
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                  color: '#f4f4f5',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Category Distribution
          </h3>

          <div className="h-48 w-full my-2">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      border: '1px solid #27272a',
                      color: '#f4f4f5',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No data available
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {categoryData.map((cat) => (
              <span key={cat.name} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name} ({cat.value})
              </span>
            ))}
          </div>
        </div>

        {/* Priority Workload */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Active Workload by Priority
          </h3>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    border: '1px solid #27272a',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            Keep urgent responsibilities under 3 items to preserve deep work focus.
          </p>
        </div>
      </div>
    </div>
  );
};

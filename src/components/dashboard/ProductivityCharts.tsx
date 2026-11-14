'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

export const ProductivityCharts: React.FC = () => {
  const { tasks, focusSessions } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 animate-pulse" />
        <div className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 animate-pulse" />
      </div>
    );
  }

  // 1. Calculate 7-Day Completion Velocity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayName = format(d, 'EEE');

    const completedCount = tasks.filter(
      (t) => t.completedAt && t.completedAt.startsWith(dateStr)
    ).length;

    const focusMinutes = focusSessions
      .filter((s) => s.timestamp.startsWith(dateStr))
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    return {
      day: dayName,
      date: dateStr,
      completed: completedCount,
      focusHours: Number((focusMinutes / 60).toFixed(1)),
    };
  });

  // 2. Calculate Active Task Priority Breakdown
  const activeTasks = tasks.filter((t) => !t.inTrash && t.status !== 'completed');
  const urgentCount = activeTasks.filter((t) => t.priority === 'urgent').length;
  const highCount = activeTasks.filter((t) => t.priority === 'high').length;
  const mediumCount = activeTasks.filter((t) => t.priority === 'medium').length;
  const lowCount = activeTasks.filter((t) => t.priority === 'low').length;

  const priorityData = [
    { name: 'Urgent', value: urgentCount, color: '#f43f5e' },
    { name: 'High', value: highCount, color: '#f59e0b' },
    { name: 'Medium', value: mediumCount, color: '#38bdf8' },
    { name: 'Low', value: lowCount, color: '#94a3b8' },
  ].filter((p) => p.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 7-Day Velocity Chart */}
      <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Weekly Completion Velocity
            </h3>
            <p className="text-xs text-zinc-400">
              Tasks completed over the past 7 days
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Completed Tasks
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                  color: '#f4f4f5',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val ?? 0} tasks`, 'Completed']}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#velocityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Distribution Donut */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Priority Breakdown
          </h3>
          <p className="text-xs text-zinc-400">
            Active task workload balance
          </p>
        </div>

        <div className="h-44 w-full my-2 flex items-center justify-center">
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
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
            <div className="text-center text-xs text-zinc-400">
              No active tasks to display
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Urgent: {urgentCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-zinc-600 dark:text-zinc-400">High: {highCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Medium: {mediumCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Low: {lowCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

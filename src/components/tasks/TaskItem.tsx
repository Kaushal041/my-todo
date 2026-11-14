'use client';

import React from 'react';
import { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { getRemainingTrashDays } from '@/lib/utils';
import {
  Check,
  Calendar,
  Clock,
  ListTodo,
  Timer,
  Copy,
  Trash2,
  RotateCcw,
  Tag,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCategory?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onToggleSelect,
  showCategory = true,
}) => {
  const {
    toggleTaskComplete,
    openEditTaskModal,
    duplicateTask,
    deleteTask,
    restoreTask,
    setActiveView,
  } = useApp();

  const isCompleted = task.status === 'completed';
  const subtasksCount = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  // Due date styling logic
  let dueDateText = '';
  let isOverdue = false;
  if (task.dueDate) {
    const due = new Date(task.dueDate + 'T23:59:59');
    if (isToday(due)) {
      dueDateText = 'Today';
    } else if (isPast(due) && !isCompleted) {
      isOverdue = true;
      dueDateText = task.dueDate;
    } else {
      dueDateText = format(new Date(task.dueDate + 'T00:00:00'), 'MMM d');
    }
  }

  // Recycle bin 10-day retention calculation
  const trashInfo = task.inTrash ? getRemainingTrashDays(task.trashedAt) : null;

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 rounded-xl border transition-all select-none ${
        isCompleted
          ? 'bg-zinc-50/60 border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/50 opacity-80'
          : task.inTrash
          ? 'bg-rose-50/20 border-rose-200/60 dark:bg-rose-950/10 dark:border-rose-900/40'
          : isSelected
          ? 'bg-indigo-50/50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-800'
          : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
      }`}
    >
      {/* Left section: Checkbox, Selection, Title & Badges */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Bulk select checkbox */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-indigo-600 focus:ring-indigo-500/30 border-zinc-300 dark:border-zinc-700 cursor-pointer shrink-0"
            title="Select for bulk action"
          />
        )}

        {/* Complete task button */}
        {!task.inTrash ? (
          <button
            onClick={() => toggleTaskComplete(task.id)}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:border-indigo-500'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        ) : (
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-rose-500/10 text-rose-500 shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Title & metadata */}
        <div
          onClick={() => !task.inTrash && openEditTaskModal(task)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium tracking-tight break-words ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'
              }`}
            >
              {task.title}
            </span>

            {task.recurring !== 'none' && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                ↻ {task.recurring}
              </span>
            )}

            {/* Trash retention badge when in Recycle Bin */}
            {task.inTrash && trashInfo && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Clock className="w-2.5 h-2.5" />
                <span>{trashInfo.daysLeft} days left in Recycle Bin</span>
              </span>
            )}
          </div>

          {/* Subtitle row with dates, subtasks, tags */}
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {/* Due date */}
            {task.dueDate && !task.inTrash && (
              <span
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : dueDateText === 'Today'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <Calendar className="w-3 h-3" />}
                <span>{dueDateText}</span>
                {task.dueTime && <span>at {task.dueTime}</span>}
              </span>
            )}

            {/* Subtasks counter */}
            {subtasksCount > 0 && !task.inTrash && (
              <span className="flex items-center gap-1 text-[11px]">
                <ListTodo className="w-3 h-3" />
                <span>
                  {completedSubtasks}/{subtasksCount}
                </span>
              </span>
            )}

            {/* Estimated vs Actual minutes */}
            {(task.estimatedMinutes || task.actualMinutes) && !task.inTrash && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {task.actualMinutes || 0}/{task.estimatedMinutes || 0}m
                </span>
              </span>
            )}

            {/* Category */}
            {showCategory && task.category && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                #{task.category}
              </span>
            )}

            {/* Tags */}
            {task.tags.slice(0, 3).map((tg) => (
              <span key={tg} className="text-[11px] text-zinc-400 flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {tg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Priority Badge & Explicit Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
        {!task.inTrash && <Badge variant="priority" priority={task.priority} />}

        {/* Action Buttons: Always accessible */}
        <div className="flex items-center gap-1">
          {!task.inTrash ? (
            <>
              {/* Pomodoro trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('pomodoro');
                }}
                title="Focus on this task with Pomodoro"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Timer className="w-3.5 h-3.5" />
              </button>

              {/* Duplicate */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTask(task.id);
                }}
                title="Duplicate task"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* ALWAYS VISIBLE DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id, false);
                }}
                title="Move to Recycle Bin (10-day retention)"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 bg-zinc-100/70 hover:bg-rose-50 dark:bg-zinc-800/60 dark:hover:bg-rose-950/40 dark:text-zinc-400 dark:hover:text-rose-400 border border-zinc-200/50 dark:border-zinc-700/50 hover:border-rose-300 dark:hover:border-rose-900 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Delete</span>
              </button>
            </>
          ) : (
            <>
              {/* Restore from Recycle Bin */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restoreTask(task.id);
                }}
                title="Restore task to active list"
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>

              {/* Delete permanently right now */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Permanently delete "${task.title}" now? This cannot be undone.`)) {
                    deleteTask(task.id, true);
                  }
                }}
                title="Delete permanently right now"
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/60 font-medium transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

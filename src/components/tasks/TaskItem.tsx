'use client';

import React from 'react';
import { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
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
  MoreVertical,
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

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all select-none ${
        isCompleted
          ? 'bg-zinc-50/50 border-zinc-200/50 dark:bg-zinc-900/30 dark:border-zinc-800/40 opacity-75'
          : task.inTrash
          ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800'
          : isSelected
          ? 'bg-indigo-50/40 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800'
          : 'bg-white border-zinc-200/80 hover:border-zinc-300 dark:bg-zinc-900/90 dark:border-zinc-800/80 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Left section: Checkbox, Selection, Title & Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Bulk select checkbox */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500/30 border-zinc-300 dark:border-zinc-700 cursor-pointer hidden group-hover:block"
            title="Select for bulk action"
          />
        )}

        {/* Complete task button */}
        {!task.inTrash ? (
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:border-indigo-500'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        ) : (
          <Trash2 className="w-4 h-4 text-zinc-400 shrink-0" />
        )}

        {/* Title & metadata */}
        <div
          onClick={() => !task.inTrash && openEditTaskModal(task)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium tracking-tight truncate ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'
              }`}
            >
              {task.title}
            </span>

            {task.recurring !== 'none' && (
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                ↻ {task.recurring}
              </span>
            )}
          </div>

          {/* Subtitle row with dates, subtasks, tags */}
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {/* Due date */}
            {task.dueDate && (
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
            {subtasksCount > 0 && (
              <span className="flex items-center gap-1 text-[11px]">
                <ListTodo className="w-3 h-3" />
                <span>
                  {completedSubtasks}/{subtasksCount}
                </span>
              </span>
            )}

            {/* Estimated vs Actual minutes */}
            {(task.estimatedMinutes || task.actualMinutes) && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {task.actualMinutes || 0}/{task.estimatedMinutes || 0}m
                </span>
              </span>
            )}

            {/* Category */}
            {showCategory && task.category && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                #{task.category}
              </span>
            )}

            {/* Tags */}
            {task.tags.slice(0, 2).map((tg) => (
              <span key={tg} className="text-[11px] text-zinc-400 flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {tg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Priority Badge & Hover Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!task.inTrash && <Badge variant="priority" priority={task.priority} />}

        {/* Hover Quick Actions */}
        <div className="hidden group-hover:flex items-center gap-1 pl-1 transition-opacity">
          {!task.inTrash ? (
            <>
              {/* Start Pomodoro with this task */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('pomodoro');
                }}
                title="Start Pomodoro on this task"
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

              {/* Delete to trash */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id, false);
                }}
                title="Move to trash"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Restore from trash */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restoreTask(task.id);
                }}
                title="Restore task"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>

              {/* Permanent delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id, true);
                }}
                title="Permanently delete"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, Priority, TaskStatus } from '@/types';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Filter,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Search,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskListViewProps {
  viewType: 'my-day' | 'upcoming' | 'inbox' | 'all-tasks' | 'important' | 'overdue' | 'completed' | 'trash';
}

export const TaskListView: React.FC<TaskListViewProps> = ({ viewType }) => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    openCreateTaskModal,
    bulkUpdateTasks,
    bulkDeleteTasks,
    emptyTrash,
    categories,
  } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // 1. Filter tasks according to viewType
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Trash isolation
      if (viewType === 'trash') {
        return task.inTrash;
      }
      if (task.inTrash) return false;

      // View-specific rules
      if (viewType === 'my-day') {
        return task.dueDate === todayStr;
      }
      if (viewType === 'upcoming') {
        return task.dueDate && task.dueDate > todayStr && task.status !== 'completed';
      }
      if (viewType === 'inbox') {
        return (!task.dueDate || task.category === 'Inbox') && task.status !== 'completed';
      }
      if (viewType === 'important') {
        return (task.priority === 'urgent' || task.priority === 'high') && task.status !== 'completed';
      }
      if (viewType === 'overdue') {
        return task.dueDate && task.dueDate < todayStr && task.status !== 'completed';
      }
      if (viewType === 'completed') {
        return task.status === 'completed';
      }
      if (viewType === 'all-tasks') {
        return true;
      }
      return true;
    });
  }, [tasks, viewType, todayStr]);

  // 2. Apply search and user filters
  const displayedTasks = useMemo(() => {
    return filteredTasks
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description?.toLowerCase().includes(q);
          const matchesCat = task.category.toLowerCase().includes(q);
          const matchesTags = task.tags.some((tg) => tg.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTags) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && task.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        }
        if (sortBy === 'priority') {
          const pOrder: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return pOrder[a.priority] - pOrder[b.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'createdAt') {
          return b.createdAt.localeCompare(a.createdAt);
        }
        return 0;
      });
  }, [filteredTasks, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === displayedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(displayedTasks.map((t) => t.id));
    }
  };

  // Bulk actions
  const handleBulkComplete = () => {
    bulkUpdateTasks(selectedTaskIds, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    setSelectedTaskIds([]);
  };

  const handleBulkSetPriority = (priority: Priority) => {
    bulkUpdateTasks(selectedTaskIds, { priority });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    bulkDeleteTasks(selectedTaskIds, viewType === 'trash');
    setSelectedTaskIds([]);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Recycle Bin 10-Day Policy Alert Banner */}
      {viewType === 'trash' && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <span className="font-bold block">Recycle Bin • 10-Day Retention Policy</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              Tasks moved to the Recycle Bin are safely stored for 10 days before automatic permanent deletion. You can restore any task to your active workspace or delete it immediately.
            </span>
          </div>
        </div>
      )}

      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-medium text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-medium text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter (if not completed view) */}
          {viewType !== 'completed' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-medium text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-8 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-medium text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="createdAt">Sort by Created</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {viewType === 'trash' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Permanently purge all items in the Recycle Bin?')) {
                  emptyTrash();
                }
              }}
              disabled={displayedTasks.length === 0}
              className="text-xs gap-1.5 h-8"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Recycle Bin</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                openCreateTaskModal({
                  dueDate: viewType === 'my-day' ? todayStr : undefined,
                  priority: viewType === 'important' ? 'urgent' : undefined,
                })
              }
              className="text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-950/90 text-white shadow-xl border border-indigo-800 backdrop-blur-md animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium text-indigo-300 hover:text-white underline cursor-pointer"
            >
              {selectedTaskIds.length === displayedTasks.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs font-bold text-white">
              {selectedTaskIds.length} tasks selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {viewType !== 'trash' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkComplete}
                  className="h-7 text-xs bg-indigo-900 border-indigo-700 text-white hover:bg-indigo-800 gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Mark Done</span>
                </Button>

                <select
                  onChange={(e) => e.target.value && handleBulkSetPriority(e.target.value as Priority)}
                  defaultValue=""
                  className="h-7 rounded-lg border border-indigo-700 bg-indigo-900 px-2 text-xs text-white focus:outline-none"
                >
                  <option value="" disabled>
                    Set Priority...
                  </option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </>
            )}

            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkDelete}
              className="h-7 text-xs gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{viewType === 'trash' ? 'Permanent Delete' : 'Trash'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskIds.includes(task.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))
        ) : (
          <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            {viewType === 'my-day' ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
            ) : viewType === 'overdue' ? (
              <AlertCircle className="w-10 h-10 text-rose-500/60 mx-auto mb-3" />
            ) : (
              <Inbox className="w-10 h-10 text-zinc-400/60 mx-auto mb-3" />
            )}
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No tasks found in {viewType.replace('-', ' ')}
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'Try adjusting your search query or filters to find what you need.'
                : 'Your slate is clean. Plan your next milestone or enjoy your day.'}
            </p>
            {viewType !== 'trash' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreateTaskModal()}
                className="mt-4 text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Task</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, TaskStatus, Priority } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Calendar,
  ListTodo,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    updateTask,
    openCreateTaskModal,
    openEditTaskModal,
    toggleTaskComplete,
  } = useApp();

  const [groupBy, setGroupBy] = useState<'status' | 'priority'>('status');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const activeTasks = tasks.filter((t) => !t.inTrash);

  // Status Columns
  const statusColumns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'not_started', title: 'To Do', color: 'border-zinc-400' },
    { id: 'in_progress', title: 'In Progress', color: 'border-indigo-500' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-500' },
  ];

  // Priority Columns
  const priorityColumns: { id: Priority; title: string; color: string }[] = [
    { id: 'urgent', title: 'Urgent', color: 'border-rose-500' },
    { id: 'high', title: 'High Priority', color: 'border-amber-500' },
    { id: 'medium', title: 'Medium Priority', color: 'border-sky-500' },
    { id: 'low', title: 'Low Priority', color: 'border-zinc-400' },
  ];

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnStatus = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    updateTask(taskId, {
      status: targetStatus,
      completedAt: targetStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    setDraggedTaskId(null);
  };

  const handleDropOnPriority = (e: React.DragEvent, targetPriority: Priority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    updateTask(taskId, { priority: targetPriority });
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Group Columns by:
          </span>
          <button
            onClick={() => setGroupBy('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              groupBy === 'status'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setGroupBy('priority')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              groupBy === 'priority'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Priority
          </button>
        </div>

        <button
          onClick={() => openCreateTaskModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div
        className={`grid gap-4 overflow-x-auto pb-4 ${
          groupBy === 'status' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {groupBy === 'status'
          ? statusColumns.map((col) => {
              const colTasks = activeTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStatus(e, col.id)}
                  className="flex flex-col min-h-[500px] rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full border-2 ${col.color}`} />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        {col.title}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => openCreateTaskModal({ status: col.id })}
                      className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title={`Add task to ${col.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-2.5 flex-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => openEditTaskModal(task)}
                        className="group p-3 rounded-xl border border-zinc-200/80 bg-white shadow-2xs hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {task.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                              task.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500'
                            }`}
                          >
                            {task.status === 'completed' && <Check className="w-2.5 h-2.5" />}
                          </button>
                        </div>

                        {task.description && (
                          <p className="mt-1.5 text-[11px] text-zinc-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="priority" priority={task.priority} />
                            {task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <ListTodo className="w-3 h-3" />
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                              </span>
                            )}
                          </div>

                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] font-mono">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate.slice(5)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="h-28 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          : priorityColumns.map((col) => {
              const colTasks = activeTasks.filter((t) => t.priority === col.id && t.status !== 'completed');
              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnPriority(e, col.id)}
                  className="flex flex-col min-h-[500px] rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                >
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full border-2 ${col.color}`} />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        {col.title}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => openCreateTaskModal({ priority: col.id })}
                      className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title={`Add ${col.title} task`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => openEditTaskModal(task)}
                        className="group p-3 rounded-xl border border-zinc-200/80 bg-white shadow-2xs hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {task.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 hover:border-indigo-500 transition-colors"
                          >
                            {task.status === 'completed' && <Check className="w-2.5 h-2.5 text-indigo-600" />}
                          </button>
                        </div>

                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            #{task.category}
                          </span>

                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] font-mono">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate.slice(5)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="h-28 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

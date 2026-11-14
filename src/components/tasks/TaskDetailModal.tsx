'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Priority, TaskStatus, RecurrenceType, Subtask } from '@/types';
import { generateId } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Tag,
  ListTodo,
  FileText,
  Repeat,
  Trash2,
  Copy,
  Plus,
  X,
  Check,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    isTaskModalOpen,
    closeTaskModal,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    categories,
    settings,
  } = useApp();

  const isEditing = Boolean(selectedTask && selectedTask.id);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [category, setCategory] = useState('Work');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [recurring, setRecurring] = useState<RecurrenceType>('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);
  const [actualMinutes, setActualMinutes] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Sync state when selectedTask changes
  useEffect(() => {
    if (selectedTask && selectedTask.id) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setDueDate(selectedTask.dueDate || '');
      setDueTime(selectedTask.dueTime || '');
      setPriority(selectedTask.priority || 'medium');
      setStatus(selectedTask.status || 'not_started');
      setCategory(selectedTask.category || 'Work');
      setTags(selectedTask.tags || []);
      setSubtasks(selectedTask.subtasks || []);
      setRecurring(selectedTask.recurring || 'none');
      setEstimatedMinutes(selectedTask.estimatedMinutes || 0);
      setActualMinutes(selectedTask.actualMinutes || 0);
      setNotes(selectedTask.notes || '');
    } else {
      // Defaults for brand new task
      setTitle(selectedTask?.title || '');
      setDescription('');
      setDueDate(selectedTask?.dueDate || '');
      setDueTime('');
      setPriority(selectedTask?.priority || settings.defaultPriority || 'medium');
      setStatus('not_started');
      setCategory(selectedTask?.category || 'Work');
      setTags([]);
      setSubtasks([]);
      setRecurring('none');
      setEstimatedMinutes(30);
      setActualMinutes(0);
      setNotes('');
    }
  }, [selectedTask, settings.defaultPriority, isTaskModalOpen]);

  // Subtask handlers
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/^@/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Submit
  const handleSave = () => {
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      status,
      category,
      tags,
      subtasks,
      recurring,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      actualMinutes: Number(actualMinutes) || 0,
      notes,
    };

    if (isEditing && selectedTask) {
      updateTask(selectedTask.id, payload);
    } else {
      addTask(payload);
    }
    closeTaskModal();
  };

  return (
    <Dialog
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description="Manage task details, subtasks, deadlines, and time estimates"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
            Task Title *
          </label>
          <Input
            autoFocus
            placeholder="e.g. Prepare system architectural documentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-medium h-11"
          />
        </div>

        {/* Priority & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : p === 'high'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : p === 'medium'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-zinc-700 text-white shadow-xs'
                      : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Status
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { key: 'not_started', label: 'To Do' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'completed', label: 'Done' },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all select-none ${
                    status === s.key
                      ? s.key === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : s.key === 'in_progress'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 text-white dark:bg-zinc-700'
                      : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category & Recurrence Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5" />
              Recurrence
            </label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as RecurrenceType)}
              className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Time Tracking Estimates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Estimated Time (Minutes)
            </label>
            <Input
              type="number"
              min={0}
              step={5}
              placeholder="e.g. 45"
              value={estimatedMinutes || ''}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Actual Time Spent (Minutes)
            </label>
            <Input
              type="number"
              min={0}
              step={5}
              placeholder="e.g. 30"
              value={actualMinutes || ''}
              onChange={(e) => setActualMinutes(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        {/* Subtasks / Checklist */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <ListTodo className="w-3.5 h-3.5 text-zinc-400" />
              Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
          </div>

          {/* Subtask list */}
          <div className="space-y-1.5 mb-2.5">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      sub.completed
                        ? 'bg-emerald-600 text-white'
                        : 'border border-zinc-300 dark:border-zinc-600 hover:border-indigo-500'
                    }`}
                  >
                    {sub.completed && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>
                  <span
                    className={`text-xs truncate ${
                      sub.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(sub.id)}
                  className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add subtask field */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add subtask item..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              className="text-xs h-8"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddSubtask}
              className="h-8 shrink-0 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Description & Detailed Notes */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            Description & Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add context, specifications, links, or implementation notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {tags.map((tg) => (
              <span
                key={tg}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium"
              >
                #{tg}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tg)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Type tag & press enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none min-w-28 py-0.5"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {isEditing && selectedTask && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    duplicateTask(selectedTask.id);
                    closeTaskModal();
                  }}
                  className="gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    deleteTask(selectedTask.id);
                    closeTaskModal();
                  }}
                  className="gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Move to Recycle Bin (10-day retention)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete (Recycle Bin)</span>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!title.trim()}
              onClick={handleSave}
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

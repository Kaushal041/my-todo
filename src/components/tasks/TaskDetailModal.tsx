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
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitMerge,
  GitPullRequest,
  Layers,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

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
    platforms,
    addPlatform,
    settings,
  } = useApp();

  const isEditing = Boolean(selectedTask && selectedTask.id);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('Cognos');
  const [codeMerged, setCodeMerged] = useState(false);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [newPlatformInput, setNewPlatformInput] = useState('');
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const nextWeekStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  // Sync state when selectedTask changes
  useEffect(() => {
    if (selectedTask && selectedTask.id) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setPlatform(selectedTask.platform || '');
      setCodeMerged(Boolean(selectedTask.codeMerged));
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
      setShowAdvanced(true); // Always show details when editing
    } else {
      // Fast defaults for brand new task: Default to Cognos/first platform, Work, Today, Normal priority
      const initialPlatform = selectedTask?.platform || (platforms.length > 0 ? platforms[0] : 'Cognos');
      setTitle(selectedTask?.title || '');
      setDescription('');
      setPlatform(initialPlatform);
      setCodeMerged(Boolean(selectedTask?.codeMerged || false));
      setDueDate(selectedTask?.dueDate || todayStr);
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
      setShowAdvanced(false); // Clean and minimal by default
    }
  }, [selectedTask, settings.defaultPriority, isTaskModalOpen, todayStr, platforms]);

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

  const handleCreateNewPlatform = () => {
    const trimmed = newPlatformInput.trim();
    if (trimmed) {
      addPlatform(trimmed);
      setPlatform(trimmed);
    }
    setIsAddingPlatform(false);
    setNewPlatformInput('');
  };

  // Submit
  const handleSave = () => {
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description,
      platform: platform || undefined,
      codeMerged,
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

  const handleKeyDownTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={isEditing ? 'Edit Task' : 'New Task'}
      description={isEditing ? 'Update task details' : 'Type your work task and press Enter'}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* 1. Fast Task Title Input */}
        <div>
          <Input
            autoFocus
            placeholder="What do you need to do? (Press Enter to create)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDownTitle}
            className="text-base font-semibold h-11 placeholder:text-zinc-400 placeholder:font-normal"
          />
        </div>

        {/* 2. Short Optional Note */}
        <div>
          <input
            type="text"
            placeholder="Add quick notes or details (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 3. Quick 1-Click Pills: Date, Priority, Category */}
        <div className="space-y-2.5 pt-1">
          {/* Due Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 w-16 shrink-0">When:</span>
            <button
              type="button"
              onClick={() => setDueDate(todayStr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                dueDate === todayStr
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDueDate(tomorrowStr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                dueDate === tomorrowStr
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setDueDate(nextWeekStr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                dueDate === nextWeekStr
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => setDueDate('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                dueDate === ''
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              No Date
            </button>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-7 px-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 focus:outline-none"
            />
          </div>

          {/* Priority Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 w-16 shrink-0">Priority:</span>
            {(
              [
                { p: 'medium', label: 'Normal' },
                { p: 'high', label: 'High' },
                { p: 'urgent', label: 'Urgent' },
              ] as const
            ).map(({ p, label }) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  priority === p
                    ? p === 'urgent'
                      ? 'bg-rose-500 text-white font-semibold shadow-xs'
                      : p === 'high'
                      ? 'bg-amber-500 text-white font-semibold shadow-xs'
                      : 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Field / Tool (Cognos, MicroStrategy, Tableau, etc.) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 w-16 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              <span>Field:</span>
            </span>

            {/* Platform pills */}
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(platform === p ? '' : p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  platform === p
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPlatform('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                !platform
                  ? 'bg-zinc-600 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              None
            </button>

            {/* Inline Add Field Icon Button */}
            {!isAddingPlatform ? (
              <button
                type="button"
                onClick={() => setIsAddingPlatform(true)}
                title="Add manual field/tool (e.g. Power BI, dbt, etc.) so you don't have to change code"
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Power BI..."
                  value={newPlatformInput}
                  onChange={(e) => setNewPlatformInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewPlatform();
                    } else if (e.key === 'Escape') {
                      setIsAddingPlatform(false);
                      setNewPlatformInput('');
                    }
                  }}
                  className="h-7 w-28 px-2 rounded-lg border border-indigo-400 bg-white text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewPlatform}
                  className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPlatform(false);
                    setNewPlatformInput('');
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Code Merged or Not */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 w-16 shrink-0 flex items-center gap-1">
              <GitMerge className="w-3 h-3 text-emerald-500" />
              <span>Code:</span>
            </span>

            <button
              type="button"
              onClick={() => setCodeMerged(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                !codeMerged
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <GitPullRequest className="w-3 h-3" />
              <span>Not Merged</span>
            </button>

            <button
              type="button"
              onClick={() => setCodeMerged(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                codeMerged
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <GitMerge className="w-3 h-3" />
              <span>✓ Code Merged</span>
            </button>
          </div>

          {/* Category Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 w-16 shrink-0">Category:</span>
            {['Work', 'Personal', 'Projects'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Optional Advanced Options (Collapsed by default so it never slows you down) */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showAdvanced ? 'Hide advanced options' : '+ More options (subtasks, time, tags)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 pt-1 animate-in fade-in duration-150">
              {/* Due Time & Estimated Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Estimated Minutes
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={5}
                    placeholder="30"
                    value={estimatedMinutes || ''}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Subtasks Checklist
                </label>
                <div className="space-y-1.5 mb-2">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(sub.id)}
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                            sub.completed ? 'bg-emerald-600 text-white' : 'border border-zinc-300 dark:border-zinc-600'
                          }`}
                        >
                          {sub.completed && <Check className="w-2.5 h-2.5" />}
                        </button>
                        <span className={`truncate ${sub.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {sub.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="text-zinc-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
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
                    className="text-xs h-7"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtask} className="h-7 text-xs">
                    Add
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Tags</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  {tags.map((tg) => (
                    <span
                      key={tg}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium"
                    >
                      #{tg}
                      <button type="button" onClick={() => handleRemoveTag(tg)} className="hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none min-w-20 py-0.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            {isEditing && selectedTask && (
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
                <span>Delete</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeTaskModal} className="text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!title.trim()}
              onClick={handleSave}
              className="text-xs px-4 font-semibold"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { parseNaturalLanguageTask } from '@/lib/natural-language';
import { Plus, Sparkles, Calendar, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const QuickAddTask: React.FC = () => {
  const { addTask } = useApp();
  const [inputVal, setInputVal] = useState('');

  // Live parsed preview
  const parsed = inputVal.trim() ? parseNaturalLanguageTask(inputVal) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const data = parseNaturalLanguageTask(inputVal);
    addTask({
      title: data.title,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority,
      category: data.category || 'Work',
      tags: data.tags,
    });

    setInputVal('');
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/90 transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="text-zinc-400 pl-1">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
        </div>
        <input
          type="text"
          placeholder="Quick add task... (e.g. 'Submit report tomorrow at 3pm !urgent #work')"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Quick Work Helpers (when not yet typed or detected) */}
      {!parsed || (!parsed.dueDate && !parsed.priority && !parsed.category && parsed.tags.length === 0) ? (
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-[11px] text-zinc-400 mr-0.5">Quick append:</span>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} today` : 'today '))}
            className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
          >
            + today
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} tomorrow` : 'tomorrow '))}
            className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
          >
            + tomorrow
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} !urgent` : '!urgent '))}
            className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-[11px] font-medium transition-colors"
          >
            ! urgent
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} #work` : '#work '))}
            className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium transition-colors"
          >
            # work
          </button>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mr-1">
            Detected:
          </span>

          {parsed.dueDate && (
            <Badge variant="outline" className="gap-1 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50">
              <Calendar className="w-3 h-3" />
              <span>{parsed.dueDate}</span>
              {parsed.dueTime && (
                <span className="flex items-center gap-0.5 opacity-80">
                  <Clock className="w-2.5 h-2.5 ml-1" />
                  {parsed.dueTime}
                </span>
              )}
            </Badge>
          )}

          {parsed.priority && (
            <Badge variant="priority" priority={parsed.priority} />
          )}

          {parsed.category && (
            <Badge variant="default" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              #{parsed.category}
            </Badge>
          )}

          {parsed.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-zinc-500">
              <Tag className="w-2.5 h-2.5" />
              @{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

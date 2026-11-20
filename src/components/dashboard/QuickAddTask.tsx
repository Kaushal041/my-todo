'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { parseNaturalLanguageTask } from '@/lib/natural-language';
import { Plus, Sparkles, Calendar, Clock, Tag, Layers, GitMerge } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const QuickAddTask: React.FC = () => {
  const { addTask, platforms } = useApp();
  const [inputVal, setInputVal] = useState('');

  // Live parsed preview
  const parsed = inputVal.trim() ? parseNaturalLanguageTask(inputVal) : null;
  const matchedPlatform = platforms.find((p) => inputVal.toLowerCase().includes(p.toLowerCase()));
  const isCodeMerged = /\b(merged|code merged)\b/i.test(inputVal);

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
      platform: matchedPlatform || (platforms.length > 0 ? platforms[0] : 'Cognos'),
      codeMerged: isCodeMerged,
      tags: data.tags,
    });

    setInputVal('');
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#292929] bg-white dark:bg-[#171717] p-3.5 shadow-2xs dark:shadow-none transition-all focus-within:border-[#DC2626] focus-within:shadow-md dark:focus-within:shadow-[0_0_20px_rgba(220,38,38,0.25)]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="text-[#DC2626] dark:text-[#EF4444] pl-1">
          <Sparkles className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444] animate-pulse" />
        </div>
        <input
          type="text"
          placeholder="Quick add task... (e.g. 'Submit report tomorrow at 3pm !urgent #work')"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 dark:placeholder:text-[#A3A3A3] focus:outline-none text-zinc-900 dark:text-[#FAFAFA]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="rounded-xl bg-[#DC2626] hover:bg-[#EF4444] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-[#DC2626]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Quick Work Helpers (when not yet typed or detected) */}
      {!parsed || (!parsed.dueDate && !parsed.priority && !parsed.category && parsed.tags.length === 0 && !matchedPlatform && !isCodeMerged) ? (
        <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-[#292929] flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-[#A3A3A3]">
          <span className="text-[11px] text-zinc-400 dark:text-[#A3A3A3] mr-0.5">Quick append:</span>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} today` : 'today '))}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-[#111111] dark:hover:bg-[#202020] dark:text-[#FAFAFA] border border-zinc-200 dark:border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            + today
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} tomorrow` : 'tomorrow '))}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-[#111111] dark:hover:bg-[#202020] dark:text-[#FAFAFA] border border-zinc-200 dark:border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            + tomorrow
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} !urgent` : '!urgent '))}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#DC2626] dark:bg-[#DC2626]/15 dark:hover:bg-[#DC2626]/25 dark:text-[#EF4444] border border-rose-200 dark:border-[#DC2626]/40 hover:border-[#DC2626] text-[11px] font-semibold transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 shadow-2xs dark:shadow-[0_0_10px_rgba(220,38,38,0.25)]"
          >
            ! urgent
          </button>

          {/* Quick Platform Chips */}
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} ${p}` : `${p} `))}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-[#111111] dark:hover:bg-[#1f1f1f] dark:text-[#FAFAFA] border border-zinc-200 dark:border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} merged` : 'merged '))}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            ✓ merged
          </button>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-[#292929] flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-[#A3A3A3] mr-1">
            Detected:
          </span>

          {matchedPlatform && (
            <Badge variant="outline" className="gap-1 bg-zinc-100 dark:bg-[#171717] text-zinc-800 dark:text-[#FAFAFA] border-zinc-200 dark:border-[#292929]">
              <Layers className="w-2.5 h-2.5 text-blue-500" />
              <span>{matchedPlatform}</span>
            </Badge>
          )}

          {isCodeMerged && (
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
              <GitMerge className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>Merged</span>
            </Badge>
          )}

          {parsed.dueDate && (
            <Badge variant="outline" className="gap-1 bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#DC2626]/15 dark:text-[#EF4444] dark:border-[#DC2626]/40">
              <Calendar className="w-3 h-3 text-[#DC2626] dark:text-[#EF4444]" />
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
            <Badge variant="default" className="bg-zinc-100 dark:bg-[#171717] text-zinc-800 dark:text-[#FAFAFA] border border-zinc-200 dark:border-[#292929]">
              #{parsed.category}
            </Badge>
          )}

          {parsed.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-zinc-500 dark:text-[#A3A3A3] border-zinc-200 dark:border-[#292929]">
              <Tag className="w-2.5 h-2.5" />
              @{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

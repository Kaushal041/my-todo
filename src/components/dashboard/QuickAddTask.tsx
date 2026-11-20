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
    <div className="rounded-2xl border border-[#292929] bg-[#171717] p-3.5 shadow-sm transition-all focus-within:border-[#DC2626] focus-within:shadow-[0_0_20px_rgba(220,38,38,0.25)]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="text-[#EF4444] pl-1">
          <Sparkles className="w-4 h-4 text-[#EF4444] animate-pulse" />
        </div>
        <input
          type="text"
          placeholder="Quick add task... (e.g. 'Submit report tomorrow at 3pm !urgent #work')"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-sm placeholder:text-[#A3A3A3] focus:outline-none text-[#FAFAFA]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="rounded-xl bg-[#DC2626] hover:bg-[#EF4444] px-3.5 py-1.5 text-xs font-bold text-[#FAFAFA] shadow-sm shadow-[#DC2626]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Quick Work Helpers (when not yet typed or detected) */}
      {!parsed || (!parsed.dueDate && !parsed.priority && !parsed.category && parsed.tags.length === 0 && !matchedPlatform && !isCodeMerged) ? (
        <div className="mt-2.5 pt-2 border-t border-[#292929] flex flex-wrap items-center gap-1.5 text-xs text-[#A3A3A3]">
          <span className="text-[11px] text-[#A3A3A3] mr-0.5">Quick append:</span>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} today` : 'today '))}
            className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-[#202020] text-[#FAFAFA] border border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            + today
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} tomorrow` : 'tomorrow '))}
            className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-[#202020] text-[#FAFAFA] border border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            + tomorrow
          </button>
          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} !urgent` : '!urgent '))}
            className="px-2.5 py-1 rounded-lg bg-[#DC2626]/15 hover:bg-[#DC2626]/25 text-[#EF4444] border border-[#DC2626]/40 hover:border-[#EF4444] text-[11px] font-semibold transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(220,38,38,0.25)]"
          >
            ! urgent
          </button>

          {/* Quick Platform Chips */}
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} ${p}` : `${p} `))}
              className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-[#1f1f1f] text-[#FAFAFA] border border-[#292929] hover:border-[#DC2626] text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setInputVal((prev) => (prev ? `${prev.trim()} merged` : 'merged '))}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
          >
            ✓ merged
          </button>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-[#292929] flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3] mr-1">
            Detected:
          </span>

          {matchedPlatform && (
            <Badge variant="outline" className="gap-1 bg-[#171717] text-[#FAFAFA] border-[#292929]">
              <Layers className="w-2.5 h-2.5" />
              <span>{matchedPlatform}</span>
            </Badge>
          )}

          {isCodeMerged && (
            <Badge variant="outline" className="gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <GitMerge className="w-2.5 h-2.5" />
              <span>Merged</span>
            </Badge>
          )}

          {parsed.dueDate && (
            <Badge variant="outline" className="gap-1 bg-[#DC2626]/15 text-[#EF4444] border-[#DC2626]/40">
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
            <Badge variant="default" className="bg-[#171717] text-[#FAFAFA] border border-[#292929]">
              #{parsed.category}
            </Badge>
          )}

          {parsed.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-[#A3A3A3] border-[#292929]">
              <Tag className="w-2.5 h-2.5" />
              @{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

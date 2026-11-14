'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  BookOpen,
  Sparkles,
  Smile,
  Plus,
  Trash2,
  Calendar,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

export const JournalNotes: React.FC = () => {
  const { journal, addJournalEntry } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = journal.find((j) => j.date === todayStr);

  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'low' | 'tough'>(
    todayEntry?.mood || 'great'
  );
  const [content, setContent] = useState(todayEntry?.content || '');
  const [highlights, setHighlights] = useState<string[]>(todayEntry?.highlights || []);
  const [newHighlight, setNewHighlight] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    if (todayEntry) {
      setMood(todayEntry.mood);
      setContent(todayEntry.content);
      setHighlights(todayEntry.highlights);
    }
  }, [todayEntry]);

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlight.trim()) return;
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleSaveEntry = () => {
    addJournalEntry({
      date: todayStr,
      mood,
      content,
      highlights,
    });
  };

  const moods = [
    { key: 'great', emoji: '😄', label: 'Great' },
    { key: 'good', emoji: '🙂', label: 'Good' },
    { key: 'neutral', emoji: '😐', label: 'Neutral' },
    { key: 'low', emoji: '😔', label: 'Low' },
    { key: 'tough', emoji: '🌧️', label: 'Tough' },
  ] as const;

  const pastEntries = journal
    .filter((j) => j.date !== todayStr)
    .filter(
      (j) =>
        !historySearch ||
        j.content.toLowerCase().includes(historySearch.toLowerCase()) ||
        j.date.includes(historySearch)
    );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Today's Reflection Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Daily Reflection
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>

          {/* Mood Selector Buttons */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl self-start">
            {moods.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(m.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                  mood === m.key
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlights & Wins */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Today&apos;s Wins & Highlights
          </label>
          <div className="space-y-1.5">
            {highlights.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{h}</span>
                </div>
                <button
                  onClick={() => handleRemoveHighlight(idx)}
                  className="text-zinc-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddHighlight} className="flex gap-2">
            <Input
              placeholder="Add a win or proud moment... (press Enter)"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              className="text-xs h-8"
            />
            <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs shrink-0 gap-1">
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </Button>
          </form>
        </div>

        {/* Reflection Notes */}
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            Reflection & Thoughts
          </label>
          <textarea
            rows={5}
            placeholder="Write your thoughts, lessons learned, or mental clarity log..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSaveEntry} className="text-xs">
            Save Journal Entry
          </Button>
        </div>
      </div>

      {/* Past Journal Entries */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Previous Reflections
          </h4>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search past logs..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
          {pastEntries.map((entry) => (
            <div key={entry.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{entry.date}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                  {moods.find((m) => m.key === entry.mood)?.emoji} {entry.mood}
                </span>
              </div>

              {entry.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))}

          {pastEntries.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-400">
              No previous reflections recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

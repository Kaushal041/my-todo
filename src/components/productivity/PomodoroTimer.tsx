'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { soundFx } from '@/lib/audio';
import { fireBigCelebration } from '@/lib/confetti';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Timer,
  Coffee,
  Sparkles,
  History,
} from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const { tasks, focusSessions, addFocusSession, settings } = useApp();

  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Durations in minutes
  const workDuration = settings.pomodoro.workDuration || 25;
  const shortBreakDuration = settings.pomodoro.shortBreakDuration || 5;
  const longBreakDuration = settings.pomodoro.longBreakDuration || 15;

  const currentDurationMinutes =
    mode === 'work' ? workDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;

  const [timeLeft, setTimeLeft] = useState<number>(currentDurationMinutes * 60);

  // Sync timeLeft when mode changes or settings change (if not actively running)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(currentDurationMinutes * 60);
    }
  }, [mode, currentDurationMinutes, isActive]);

  // Timer interval countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed session!
      soundFx.playPomodoroChime();
      fireBigCelebration();
      setIsActive(false);

      const targetTask = tasks.find((t) => t.id === selectedTaskId);
      addFocusSession({
        type: mode,
        durationMinutes: currentDurationMinutes,
        completed: true,
        taskId: selectedTaskId || undefined,
        taskTitle: targetTask?.title || undefined,
        timestamp: new Date().toISOString(),
        notes: sessionNotes || undefined,
      });

      // Switch to break or work
      if (mode === 'work') {
        setMode('short_break');
      } else {
        setMode('work');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, currentDurationMinutes, selectedTaskId, tasks, sessionNotes, addFocusSession]);

  const toggleTimer = () => {
    soundFx.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    soundFx.playClick();
    setIsActive(false);
    setTimeLeft(currentDurationMinutes * 60);
  };

  const skipTimer = () => {
    soundFx.playClick();
    setIsActive(false);
    if (mode === 'work') {
      setMode('short_break');
    } else {
      setMode('work');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = currentDurationMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  const activeTaskOptions = tasks.filter((t) => !t.inTrash && t.status !== 'completed');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Timer Container Card */}
      <div className="max-w-2xl mx-auto rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/90 text-center flex flex-col items-center">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-6 sm:mb-8">
          <button
            onClick={() => {
              setMode('work');
              setIsActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 ${
              mode === 'work'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Focus ({workDuration}m)</span>
          </button>

          <button
            onClick={() => {
              setMode('short_break');
              setIsActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 ${
              mode === 'short_break'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-zinc-900 dark:text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break ({shortBreakDuration}m)</span>
          </button>

          <button
            onClick={() => {
              setMode('long_break');
              setIsActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 ${
              mode === 'long_break'
                ? 'bg-white text-sky-600 shadow-xs dark:bg-zinc-900 dark:text-sky-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Long Break ({longBreakDuration}m)</span>
          </button>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="5"
              className="text-zinc-100 dark:text-zinc-800"
            />
            {/* Animated progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                mode === 'work'
                  ? 'text-indigo-600 dark:text-indigo-500'
                  : mode === 'short_break'
                  ? 'text-emerald-500'
                  : 'text-sky-500'
              }`}
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white font-mono">
              {formattedTime}
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 mt-1">
              {isActive ? 'In Session' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Task Connection Dropdown */}
        <div className="w-full max-w-sm mt-6 mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
            Link to Active Task (Optional)
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">No task linked (Independent Focus)</option>
            {activeTaskOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="w-12 h-12 p-0 rounded-2xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            title="Reset session"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="primary"
            onClick={toggleTimer}
            className="px-8 h-12 rounded-2xl text-base font-bold shadow-md shadow-indigo-600/30 gap-2 min-w-36"
          >
            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={skipTimer}
            className="w-12 h-12 p-0 rounded-2xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            title="Skip to next session"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Focus History Log */}
      <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            Recent Focus Sessions
          </h4>
          <span className="text-xs text-zinc-400">
            Total logged: {focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} mins
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {focusSessions.slice(0, 6).map((session) => (
            <div key={session.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {session.taskTitle || (session.type === 'work' ? 'Deep Work' : 'Break')}
                  </span>
                  <span className="text-zinc-400 text-[10px] ml-2">
                    {session.durationMinutes} minutes
                  </span>
                </div>
              </div>
              <span className="text-zinc-400 font-mono text-[11px]">
                {session.timestamp.slice(0, 10)}
              </span>
            </div>
          ))}

          {focusSessions.length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-400">
              No focus sessions logged yet. Complete your first block above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

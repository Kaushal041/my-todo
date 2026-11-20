'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { exportFullBackupJSON } from '@/lib/export-csv';
import { testSupabaseConnection } from '@/lib/supabase';
import {
  User,
  Palette,
  Clock,
  Volume2,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    tasks,
    habits,
    focusSessions,
    journal,
    platforms,
    addPlatform,
    removePlatform,
    loadSampleData,
    resetAllData,
    showToast,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName || 'Kaushal');
  const [workDuration, setWorkDuration] = useState(settings.pomodoro.workDuration || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.pomodoro.shortBreakDuration || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.pomodoro.longBreakDuration || 15);
  const [newSettingPlatform, setNewSettingPlatform] = useState('');

  const handleAddSettingPlatform = () => {
    if (!newSettingPlatform.trim()) return;
    addPlatform(newSettingPlatform.trim());
    setNewSettingPlatform('');
  };

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseSync?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseSync?.anonKey || '');
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSaveProfile = () => {
    updateSettings({
      userName: userName.trim() || 'Kaushal',
      pomodoro: {
        ...settings.pomodoro,
        workDuration: Number(workDuration) || 25,
        shortBreakDuration: Number(shortBreakDuration) || 5,
        longBreakDuration: Number(longBreakDuration) || 15,
      },
    });
  };

  const handleExportBackup = () => {
    exportFullBackupJSON({
      tasks,
      habits,
      focusSessions,
      journal,
      settings,
      platforms,
    });
    showToast('Exported complete JSON backup');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && Array.isArray(json.tasks)) {
          // Save to localStorage and notify
          window.localStorage.setItem('zenith_tasks_v1', JSON.stringify(json.tasks));
          if (json.habits) window.localStorage.setItem('zenith_habits_v1', JSON.stringify(json.habits));
          if (json.focusSessions) window.localStorage.setItem('zenith_focus_v1', JSON.stringify(json.focusSessions));
          if (json.journal) window.localStorage.setItem('zenith_journal_v1', JSON.stringify(json.journal));
          if (json.platforms) window.localStorage.setItem('zenith_platforms_v1', JSON.stringify(json.platforms));
          if (json.settings) window.localStorage.setItem('zenith_settings_v1', JSON.stringify(json.settings));
          window.location.reload();
        } else {
          showToast('Invalid backup file format');
        }
      } catch {
        showToast('Error parsing JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSupabaseTestStatus({
        success: false,
        message: 'Please provide both URL and Anon Key.',
      });
      return;
    }
    setSupabaseTesting(true);
    setSupabaseTestStatus(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setSupabaseTesting(false);
    setSupabaseTestStatus(res);

    if (res.success) {
      updateSettings({
        supabaseSync: {
          enabled: true,
          url: supabaseUrl,
          anonKey: supabaseKey,
          lastSyncedAt: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Profile & Identity */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <User className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
          Profile & Personalization
        </h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Display Name
            </label>
            <div className="flex gap-2">
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Kaushal"
                className="max-w-xs text-xs h-9"
              />
              <Button size="sm" variant="primary" onClick={handleSaveProfile} className="h-9 text-xs">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Theme & Appearance */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Palette className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
          Theme & Display
        </h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    settings.theme === t
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Sound Effects
              </label>
              <button
                onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
                className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    settings.soundEffects ? 'bg-[#DC2626]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.soundEffects ? 'translate-x-4' : ''
                    }`}
                  />
                </div>
                <span>{settings.soundEffects ? 'Audio Enabled' : 'Muted'}</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Time Format
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}
                className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="12h">12-hour (e.g. 2:30 PM)</option>
                <option value="24h">24-hour (e.g. 14:30)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Work Fields & Tools (Cognos, MicroStrategy, Tableau, etc.) */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
            <span>Work Fields & BI Tools</span>
          </h3>
          <span className="text-xs text-zinc-400 font-normal">Customizable directly from UI</span>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-500">
            These fields appear when adding tasks and filtering reports (e.g. Cognos, MicroStrategy, Tableau). Add any custom tool or remove unwanted ones without modifying code:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {platforms.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/50"
              >
                <Layers className="w-3 h-3 text-blue-500" />
                <span>{p}</span>
                <button
                  type="button"
                  onClick={() => removePlatform(p)}
                  title={`Remove ${p}`}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {platforms.length === 0 && (
              <span className="text-xs text-zinc-400 italic">No fields configured. Add one below.</span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 max-w-sm">
            <Input
              placeholder="e.g. Power BI, dbt, Snowflake..."
              value={newSettingPlatform}
              onChange={(e) => setNewSettingPlatform(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSettingPlatform();
                }
              }}
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddSettingPlatform}
              disabled={!newSettingPlatform.trim()}
              className="text-xs shrink-0 h-8"
            >
              Add Field
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Pomodoro Durations */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Clock className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
          Focus & Pomodoro Durations (Minutes)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Focus Block</label>
            <Input
              type="number"
              min={5}
              max={120}
              value={workDuration}
              onChange={(e) => setWorkDuration(Number(e.target.value))}
              className="text-xs h-8"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Short Break</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={shortBreakDuration}
              onChange={(e) => setShortBreakDuration(Number(e.target.value))}
              className="text-xs h-8"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Long Break</label>
            <Input
              type="number"
              min={5}
              max={60}
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(Number(e.target.value))}
              className="text-xs h-8"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="secondary" onClick={handleSaveProfile} className="text-xs">
            Update Durations
          </Button>
        </div>
      </div>

      {/* 4. Data Backup, Restore & Reset */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Download className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
          Data Management & Local Persistence
        </h3>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            All your tasks, habits, and journals are stored securely in your browser&apos;s local
            storage. Export a snapshot to keep a permanent offline backup or transfer between
            machines.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportBackup}
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </Button>

            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from JSON</span>
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <Button
              size="sm"
              variant="outline"
              onClick={loadSampleData}
              className="text-xs gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-[#DC2626]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Sample Data</span>
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to wipe all local application data?')) {
                  resetAllData();
                }
              }}
              className="text-xs gap-1.5 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Supabase Cloud Sync (Optional) */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
            Supabase Cloud Database Sync (Optional)
          </h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
            Optional
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Want multi-device sync with your own free Supabase PostgreSQL database? Run the schema in{' '}
            <code className="text-[#DC2626] dark:text-[#EF4444] font-mono text-[11px]">
              supabase/schema.sql
            </code>{' '}
            and enter your project endpoint and anon key below.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Supabase Project URL</label>
              <Input
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Supabase Anon Public Key</label>
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                size="sm"
                variant="primary"
                onClick={handleTestSupabase}
                disabled={supabaseTesting}
                className="text-xs gap-1.5 h-8"
              >
                {supabaseTesting ? 'Testing Connection...' : 'Test & Save Connection'}
              </Button>

              {supabaseTestStatus && (
                <div
                  className={`text-xs flex items-center gap-1.5 font-medium ${
                    supabaseTestStatus.success ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {supabaseTestStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{supabaseTestStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

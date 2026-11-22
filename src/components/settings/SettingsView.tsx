'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { exportFullBackupJSON } from '@/lib/export-csv';
import { storage, type AppDataSnapshot } from '@/lib/storage';
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
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    cloudEnabled,
    cloudSyncStatus,
    syncCloudNow,
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
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && Array.isArray(json.tasks)) {
          const previous = storage.getSnapshot();
          const imported: AppDataSnapshot = {
            ...previous,
            tasks: json.tasks,
            habits: Array.isArray(json.habits) ? json.habits : previous.habits,
            focusSessions: Array.isArray(json.focusSessions) ? json.focusSessions : previous.focusSessions,
            journal: Array.isArray(json.journal) ? json.journal : previous.journal,
            platforms: Array.isArray(json.platforms) ? json.platforms : previous.platforms,
            settings: json.settings && typeof json.settings === 'object' ? json.settings : previous.settings,
            categories: Array.isArray(json.categories) ? json.categories : previous.categories,
            activityLogs: Array.isArray(json.activityLogs) ? json.activityLogs : previous.activityLogs,
          };
          storage.replaceSnapshot(imported);
          if (cloudEnabled && !(await syncCloudNow())) {
            storage.replaceSnapshot(previous);
            showToast('Cloud save failed; your previous data was restored');
            return;
          }
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
            {cloudEnabled
              ? 'Your data is synced to your private MongoDB workspace and cached in this browser. Export a JSON snapshot as an additional backup.'
              : 'Your tasks, habits, and journals are stored in this browser. Export a JSON snapshot to keep an offline backup or transfer between machines.'}
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

      {/* 5. MongoDB Cloud Sync */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
            MongoDB Cloud Sync
          </h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
            {cloudEnabled ? 'Enabled' : 'Local only'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {cloudEnabled
                ? 'Your browser data is backed up to your private MongoDB database and syncs across signed-in devices.'
                : 'Cloud sync activates after MongoDB, app password, and session secret variables are configured on the server.'}
            </p>
            {cloudEnabled && (
              <p className={`mt-2 text-xs font-medium ${cloudSyncStatus === 'error' ? 'text-rose-500' : 'text-zinc-500'}`}>
                {cloudSyncStatus === 'syncing' && 'Syncing changes…'}
                {cloudSyncStatus === 'synced' && 'Cloud data is up to date'}
                {cloudSyncStatus === 'error' && 'Cloud sync failed. Check your connection and retry.'}
                {cloudSyncStatus === 'local' && 'Waiting for sign in'}
              </p>
            )}
          </div>
          {cloudEnabled && (
            <Button size="sm" variant="outline" onClick={() => void syncCloudNow()} disabled={cloudSyncStatus === 'syncing'}>
              {cloudSyncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

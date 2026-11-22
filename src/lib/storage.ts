import { Task, Habit, FocusSession, JournalEntry, UserSettings, ActivityLog, Category } from '@/types';
import { sampleTasks, sampleHabits, sampleFocusSessions, sampleJournalEntries, defaultSettings, defaultCategories, defaultPlatforms } from './sample-data';

const STORAGE_KEYS = {
  TASKS: 'zenith_tasks_v1',
  HABITS: 'zenith_habits_v1',
  FOCUS_SESSIONS: 'zenith_focus_v1',
  JOURNAL: 'zenith_journal_v1',
  SETTINGS: 'zenith_settings_v1',
  CATEGORIES: 'zenith_categories_v1',
  PLATFORMS: 'zenith_platforms_v1',
  ACTIVITY: 'zenith_activity_v1',
};

export interface AppDataSnapshot {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  journal: JournalEntry[];
  settings: UserSettings;
  categories: Category[];
  platforms: string[];
  activityLogs: ActivityLog[];
}

let cloudSyncEnabled = false;
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let syncInFlight = false;
let syncRequestedAgain = false;
let lastLocalChangeAt = 0;

function reportSyncStatus(status: 'syncing' | 'synced' | 'error') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zenith:cloud-sync-status', { detail: status }));
  }
}

function scheduleCloudSync() {
  if (!cloudSyncEnabled || typeof window === 'undefined') return;
  lastLocalChangeAt = Date.now();
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = undefined;
    void storage.syncNow();
  }, 700);
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    scheduleCloudSync();
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

export const storage = {
  getSnapshot: (): AppDataSnapshot => ({
    tasks: safeGetItem<Task[]>(STORAGE_KEYS.TASKS, []),
    habits: safeGetItem<Habit[]>(STORAGE_KEYS.HABITS, []),
    focusSessions: safeGetItem<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, []),
    journal: safeGetItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []),
    settings: safeGetItem<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings),
    categories: safeGetItem<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories),
    platforms: safeGetItem<string[]>(STORAGE_KEYS.PLATFORMS, defaultPlatforms),
    activityLogs: safeGetItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, []),
  }),

  replaceSnapshot: (snapshot: AppDataSnapshot): void => {
    if (typeof window === 'undefined') return;
    const values: Record<string, unknown> = {
      [STORAGE_KEYS.TASKS]: snapshot.tasks,
      [STORAGE_KEYS.HABITS]: snapshot.habits,
      [STORAGE_KEYS.FOCUS_SESSIONS]: snapshot.focusSessions,
      [STORAGE_KEYS.JOURNAL]: snapshot.journal,
      [STORAGE_KEYS.SETTINGS]: snapshot.settings,
      [STORAGE_KEYS.CATEGORIES]: snapshot.categories,
      [STORAGE_KEYS.PLATFORMS]: snapshot.platforms,
      [STORAGE_KEYS.ACTIVITY]: snapshot.activityLogs,
    };
    Object.entries(values).forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to restore ${key} from cloud storage`, error);
      }
    });
    lastLocalChangeAt = 0;
  },

  setCloudSyncEnabled: (enabled: boolean): void => {
    cloudSyncEnabled = enabled;
  },

  getLastLocalChangeAt: (): number => lastLocalChangeAt,

  syncNow: async (): Promise<boolean> => {
    if (!cloudSyncEnabled || typeof window === 'undefined') return false;
    if (syncInFlight) {
      syncRequestedAgain = true;
      return false;
    }
    syncInFlight = true;
    const changeAtRequestStart = lastLocalChangeAt;
    reportSyncStatus('syncing');
    let succeeded = false;
    try {
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ data: storage.getSnapshot() }),
      });
      if (!response.ok) throw new Error(`Cloud sync failed (${response.status}).`);
      succeeded = true;
      if (lastLocalChangeAt === changeAtRequestStart) lastLocalChangeAt = 0;
      reportSyncStatus('synced');
    } catch (error) {
      console.error('Cloud sync failed:', error);
      reportSyncStatus('error');
    } finally {
      syncInFlight = false;
      if (syncRequestedAgain) {
        syncRequestedAgain = false;
        scheduleCloudSync();
      }
    }
    return succeeded;
  },

  getTasks: (): Task[] => {
    const raw = safeGetItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    // Filter out tasks older than 10 days in the Recycle Bin
    const valid = raw.filter((t) => {
      if (t.inTrash && t.trashedAt) {
        const elapsed = now - new Date(t.trashedAt).getTime();
        return elapsed <= TEN_DAYS_MS;
      }
      return true;
    });
    if (valid.length !== raw.length) {
      safeSetItem(STORAGE_KEYS.TASKS, valid);
    }
    return valid;
  },
  saveTasks: (tasks: Task[]): void => safeSetItem(STORAGE_KEYS.TASKS, tasks),

  getHabits: (): Habit[] => safeGetItem<Habit[]>(STORAGE_KEYS.HABITS, []),
  saveHabits: (habits: Habit[]): void => safeSetItem(STORAGE_KEYS.HABITS, habits),

  getFocusSessions: (): FocusSession[] => safeGetItem<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, []),
  saveFocusSessions: (sessions: FocusSession[]): void => safeSetItem(STORAGE_KEYS.FOCUS_SESSIONS, sessions),

  getJournal: (): JournalEntry[] => safeGetItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []),
  saveJournal: (journal: JournalEntry[]): void => safeSetItem(STORAGE_KEYS.JOURNAL, journal),

  getCategories: (): Category[] => safeGetItem<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories),
  saveCategories: (categories: Category[]): void => safeSetItem(STORAGE_KEYS.CATEGORIES, categories),

  getPlatforms: (): string[] => safeGetItem<string[]>(STORAGE_KEYS.PLATFORMS, defaultPlatforms),
  savePlatforms: (platforms: string[]): void => safeSetItem(STORAGE_KEYS.PLATFORMS, platforms),

  getSettings: (): UserSettings => {
    const s = safeGetItem<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    if (!s.userName || s.userName === 'Alex') {
      s.userName = 'Kaushal';
      safeSetItem(STORAGE_KEYS.SETTINGS, s);
    }
    return s;
  },
  saveSettings: (settings: UserSettings): void => safeSetItem(STORAGE_KEYS.SETTINGS, settings),

  getActivityLogs: (): ActivityLog[] => safeGetItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, []),
  saveActivityLogs: (logs: ActivityLog[]): void => safeSetItem(STORAGE_KEYS.ACTIVITY, logs),

  resetAllData: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    scheduleCloudSync();
  },

  loadFreshSampleData: (): {
    tasks: Task[];
    habits: Habit[];
    focusSessions: FocusSession[];
    journal: JournalEntry[];
    settings: UserSettings;
    categories: Category[];
  } => {
    safeSetItem(STORAGE_KEYS.TASKS, sampleTasks);
    safeSetItem(STORAGE_KEYS.HABITS, sampleHabits);
    safeSetItem(STORAGE_KEYS.FOCUS_SESSIONS, sampleFocusSessions);
    safeSetItem(STORAGE_KEYS.JOURNAL, sampleJournalEntries);
    safeSetItem(STORAGE_KEYS.SETTINGS, defaultSettings);
    safeSetItem(STORAGE_KEYS.CATEGORIES, defaultCategories);
    return {
      tasks: sampleTasks,
      habits: sampleHabits,
      focusSessions: sampleFocusSessions,
      journal: sampleJournalEntries,
      settings: defaultSettings,
      categories: defaultCategories,
    };
  },
};

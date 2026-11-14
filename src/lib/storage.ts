import { Task, Habit, FocusSession, JournalEntry, UserSettings, ActivityLog, Category } from '@/types';
import { sampleTasks, sampleHabits, sampleFocusSessions, sampleJournalEntries, defaultSettings, defaultCategories } from './sample-data';

const STORAGE_KEYS = {
  TASKS: 'zenith_tasks_v1',
  HABITS: 'zenith_habits_v1',
  FOCUS_SESSIONS: 'zenith_focus_v1',
  JOURNAL: 'zenith_journal_v1',
  SETTINGS: 'zenith_settings_v1',
  CATEGORIES: 'zenith_categories_v1',
  ACTIVITY: 'zenith_activity_v1',
};

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
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

export const storage = {
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

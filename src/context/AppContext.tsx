'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Task,
  Habit,
  FocusSession,
  JournalEntry,
  UserSettings,
  ActivityLog,
  Category,
  ActiveView,
} from '@/types';
import { storage, type AppDataSnapshot } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { soundFx } from '@/lib/audio';
import { fireTaskConfetti } from '@/lib/confetti';
import { format } from 'date-fns';

export interface ToastItem {
  id: string;
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AppContextType {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  journal: JournalEntry[];
  categories: Category[];
  platforms: string[];
  settings: UserSettings;
  activityLogs: ActivityLog[];
  activeView: ActiveView;
  searchQuery: string;
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsOpen: boolean;
  isAiModalOpen: boolean;
  toast: ToastItem | null;
  isLoading: boolean;
  cloudEnabled: boolean;
  cloudSyncStatus: 'local' | 'syncing' | 'synced' | 'error';
  syncCloudNow: () => Promise<boolean>;

  // View & UI controls
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (q: string) => void;
  openCreateTaskModal: (defaults?: Partial<Task>) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsAiModalOpen: (open: boolean) => void;
  showToast: (text: string, action?: { label: string; onClick: () => void }) => void;
  dismissToast: () => void;

  // Platform & Field controls
  addPlatform: (name: string) => void;
  removePlatform: (name: string) => void;

  // Task actions
  addTask: (data: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string, permanent?: boolean) => void;
  restoreTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleCodeMerged: (taskId: string) => void;
  duplicateTask: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => void;
  bulkDeleteTasks: (ids: string[], permanent?: boolean) => void;
  emptyTrash: () => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => void;
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (habitId: string) => void;

  // Focus actions
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;

  // Journal actions
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;

  // Settings & System
  updateSettings: (updates: Partial<UserSettings>) => void;
  loadSampleData: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function applyTheme(theme: 'dark' | 'light' | 'system') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [activeView, setActiveViewState] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [cloudAuthenticated, setCloudAuthenticated] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'local' | 'syncing' | 'synced' | 'error'>('local');
  const lastCloudUpdatedAt = useRef('');

  // Set active view with browser URL history push
  const setActiveView = useCallback((view: ActiveView, pushToHistory = true) => {
    setActiveViewState(view);
    if (typeof window !== 'undefined' && pushToHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({ view }, '', url.toString());
    }
  }, []);

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Read initial view from URL if present
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view') as ActiveView | null;
    const validViews: ActiveView[] = [
      'dashboard', 'my-day', 'upcoming', 'inbox', 'all-tasks',
      'kanban', 'calendar', 'important', 'overdue', 'completed',
      'trash', 'pomodoro', 'habits', 'journal', 'analytics', 'settings'
    ];

    if (initialView && validViews.includes(initialView)) {
      // Read URL state after hydration to avoid a server/client render mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveViewState(initialView);
    } else {
      // Set initial history state
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'dashboard');
      window.history.replaceState({ view: 'dashboard' }, '', url.toString());
    }

    const handlePopState = (event: PopStateEvent) => {
      // If modal or palette is open, close them first
      if (isTaskModalOpen) {
        setIsTaskModalOpen(false);
        return;
      }
      if (isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
        return;
      }
      if (isAiModalOpen) {
        setIsAiModalOpen(false);
        return;
      }
      if (isShortcutsOpen) {
        setIsShortcutsOpen(false);
        return;
      }

      if (event.state?.view && validViews.includes(event.state.view)) {
        setActiveViewState(event.state.view);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const viewFromUrl = urlParams.get('view') as ActiveView | null;
        if (viewFromUrl && validViews.includes(viewFromUrl)) {
          setActiveViewState(viewFromUrl);
        } else {
          setActiveViewState('dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isTaskModalOpen, isCommandPaletteOpen, isAiModalOpen, isShortcutsOpen]);

  // Initialize from storage on mount
  useEffect(() => {
    let cancelled = false;
    const applySnapshot = (snapshot: AppDataSnapshot) => {
      storage.replaceSnapshot(snapshot);
      setTasks(snapshot.tasks);
      setHabits(snapshot.habits);
      setFocusSessions(snapshot.focusSessions);
      setJournal(snapshot.journal);
      setCategories(snapshot.categories);
      setPlatforms(snapshot.platforms);
      setSettings(snapshot.settings);
      setActivityLogs(snapshot.activityLogs);
      soundFx.setSoundEnabled(snapshot.settings.soundEffects);
      applyTheme(snapshot.settings.theme);
    };

    const initialize = async () => {
      try {
        // Mark migration completion without deleting existing browser data.
        if (typeof window !== 'undefined' && !window.localStorage.getItem('zenith_kaushal_clean_v1')) {
          window.localStorage.setItem('zenith_kaushal_clean_v1', 'true');
          const currentSettings = storage.getSettings();
          if (!currentSettings.userName || currentSettings.userName === 'Alex') {
            currentSettings.userName = 'Kaushal';
            storage.saveSettings(currentSettings);
          }
        }

        const storedTasks = storage.getTasks();
        const storedHabits = storage.getHabits();
        const storedFocus = storage.getFocusSessions();
        const storedJournal = storage.getJournal();
        const storedCategories = storage.getCategories();
        const storedPlatforms = storage.getPlatforms();
        const storedSettings = storage.getSettings();
        const storedActivity = storage.getActivityLogs();

        setTasks(storedTasks);
        setHabits(storedHabits);
        setFocusSessions(storedFocus);
        setJournal(storedJournal);
        setCategories(storedCategories);
        setPlatforms(storedPlatforms);
        setSettings(storedSettings);
        setActivityLogs(storedActivity);
        soundFx.setSoundEnabled(storedSettings.soundEffects);

        // Apply initial theme
        applyTheme(storedSettings.theme);

        const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
        if (sessionResponse.ok) {
          const session = await sessionResponse.json() as { cloudEnabled?: boolean; authenticated?: boolean };
          if (session.cloudEnabled) {
            setCloudEnabled(true);
            if (session.authenticated) {
              storage.setCloudSyncEnabled(true);
              const dataResponse = await fetch('/api/data', { cache: 'no-store', credentials: 'same-origin' });
              if (dataResponse.ok) {
                const cloud = await dataResponse.json() as { data: AppDataSnapshot | null; updatedAt: string | null };
                let cloudSaved = true;
                if (cloud.data) {
                  applySnapshot(cloud.data);
                  lastCloudUpdatedAt.current = cloud.updatedAt || '';
                } else {
                  cloudSaved = await storage.syncNow();
                }
                setCloudAuthenticated(true);
                setCloudSyncStatus(cloudSaved ? 'synced' : 'error');
              } else {
                setCloudSyncStatus('error');
              }
            }
          }
        }

        // Register Service Worker for PWA if supported
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
              console.log('SW registration failed:', err);
            });
          });
        }
      } catch (e) {
        console.error('Initialization error', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!cloudEnabled || !cloudAuthenticated) return;

    const handleSyncStatus = (event: Event) => {
      const status = (event as CustomEvent<'syncing' | 'synced' | 'error'>).detail;
      setCloudSyncStatus(status);
    };
    window.addEventListener('zenith:cloud-sync-status', handleSyncStatus);

    const refreshFromCloud = async () => {
      try {
        const response = await fetch('/api/data', { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error(`Cloud refresh failed (${response.status}).`);
        const cloud = await response.json() as { data: AppDataSnapshot | null; updatedAt: string | null };
        if (!cloud.data || !cloud.updatedAt || cloud.updatedAt === lastCloudUpdatedAt.current) return;
        if (storage.getLastLocalChangeAt() > 0) return;

        storage.replaceSnapshot(cloud.data);
        setTasks(cloud.data.tasks);
        setHabits(cloud.data.habits);
        setFocusSessions(cloud.data.focusSessions);
        setJournal(cloud.data.journal);
        setCategories(cloud.data.categories);
        setPlatforms(cloud.data.platforms);
        setSettings(cloud.data.settings);
        setActivityLogs(cloud.data.activityLogs);
        soundFx.setSoundEnabled(cloud.data.settings.soundEffects);
        applyTheme(cloud.data.settings.theme);
        lastCloudUpdatedAt.current = cloud.updatedAt;
        setCloudSyncStatus('synced');
      } catch {
        setCloudSyncStatus('error');
      }
    };
    const timer = window.setInterval(() => { void refreshFromCloud(); }, 15_000);
    return () => {
      window.removeEventListener('zenith:cloud-sync-status', handleSyncStatus);
      window.clearInterval(timer);
    };
  }, [cloudEnabled, cloudAuthenticated]);

  const finishCloudLogin = useCallback(async (password: string): Promise<string | null> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { error?: string };
      return result.error || 'Could not sign in.';
    }

    storage.setCloudSyncEnabled(true);
    const dataResponse = await fetch('/api/data', { cache: 'no-store', credentials: 'same-origin' });
    if (!dataResponse.ok) {
      storage.setCloudSyncEnabled(false);
      return 'Signed in, but MongoDB could not be reached. Check the server configuration.';
    }
    const cloud = await dataResponse.json() as { data: AppDataSnapshot | null; updatedAt: string | null };
    if (cloud.data) {
      storage.replaceSnapshot(cloud.data);
      setTasks(cloud.data.tasks);
      setHabits(cloud.data.habits);
      setFocusSessions(cloud.data.focusSessions);
      setJournal(cloud.data.journal);
      setCategories(cloud.data.categories);
      setPlatforms(cloud.data.platforms);
      setSettings(cloud.data.settings);
      setActivityLogs(cloud.data.activityLogs);
      soundFx.setSoundEnabled(cloud.data.settings.soundEffects);
      applyTheme(cloud.data.settings.theme);
      lastCloudUpdatedAt.current = cloud.updatedAt || '';
    } else {
      // First sign-in migrates this browser's existing Local Storage data.
      const saved = await storage.syncNow();
      if (!saved) {
        storage.setCloudSyncEnabled(false);
        return 'Could not copy this browser\'s data to MongoDB. Please try again.';
      }
    }

    setCloudAuthenticated(true);
    setCloudSyncStatus('synced');
    return null;
  }, []);

  const syncCloudNow = useCallback(async (): Promise<boolean> => {
    const saved = await storage.syncNow();
    setCloudSyncStatus(saved ? 'synced' : 'error');
    return saved;
  }, []);

  const showToast = useCallback((text: string, action?: { label: string; onClick: () => void }) => {
    const id = generateId();
    setToast({ id, text, action });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const logActivity = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 99)];
      storage.saveActivityLogs(updated);
      return updated;
    });
  }, []);

  // Task Handlers
  const addTask = useCallback(
    (data: Partial<Task> & { title: string }): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId(),
        title: data.title.trim(),
        description: data.description || '',
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        startDate: data.startDate,
        priority: data.priority || settings.defaultPriority || 'medium',
        status: data.status || 'not_started',
        category: data.category || 'Work',
        tags: data.tags || [],
        subtasks: data.subtasks || [],
        notes: data.notes || '',
        attachments: data.attachments || [],
        recurring: data.recurring || 'none',
        reminderTime: data.reminderTime,
        estimatedMinutes: data.estimatedMinutes || 0,
        actualMinutes: data.actualMinutes || 0,
        dependencies: data.dependencies || [],
        color: data.color,
        platform: data.platform || undefined,
        codeMerged: data.codeMerged ?? false,
        archived: false,
        inTrash: false,
        order: tasks.length + 1,
        createdAt: now,
        updatedAt: now,
      };

      setTasks((prev) => {
        const updated = [newTask, ...prev];
        storage.saveTasks(updated);
        return updated;
      });

      soundFx.playClick();
      logActivity({
        action: 'create',
        entity: 'task',
        entityId: newTask.id,
        entityTitle: newTask.title,
      });

      showToast(`Created task "${newTask.title.slice(0, 30)}"`);
      return newTask;
    },
    [tasks.length, settings.defaultPriority, logActivity, showToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      const now = new Date().toISOString();
      let updatedTaskTitle = '';

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === id) {
            updatedTaskTitle = updates.title || t.title;
            return {
              ...t,
              ...updates,
              updatedAt: now,
            };
          }
          return t;
        });
        storage.saveTasks(updated);
        return updated;
      });

      logActivity({
        action: 'update',
        entity: 'task',
        entityId: id,
        entityTitle: updatedTaskTitle || 'Task',
      });
    },
    [logActivity]
  );

  const deleteTask = useCallback(
    (id: string, permanent: boolean = false) => {
      const taskToDelete = tasks.find((t) => t.id === id);
      if (!taskToDelete) return;

      if (permanent) {
        setTasks((prev) => {
          const updated = prev.filter((t) => t.id !== id);
          storage.saveTasks(updated);
          return updated;
        });
        showToast(`Permanently deleted "${taskToDelete.title.slice(0, 25)}"`);
      } else {
        // Soft delete into Trash
        const now = new Date().toISOString();
        setTasks((prev) => {
          const updated = prev.map((t) => (t.id === id ? { ...t, inTrash: true, trashedAt: now } : t));
          storage.saveTasks(updated);
          return updated;
        });

        showToast(`Moved to Recycle Bin (Kept for 10 days): "${taskToDelete.title.slice(0, 25)}"`, {
          label: 'Undo',
          onClick: () => {
            setTasks((prev) => {
              const restored = prev.map((t) => (t.id === id ? { ...t, inTrash: false, trashedAt: undefined } : t));
              storage.saveTasks(restored);
              return restored;
            });
          },
        });
      }

      logActivity({
        action: 'delete',
        entity: 'task',
        entityId: id,
        entityTitle: taskToDelete.title,
      });
    },
    [tasks, logActivity, showToast]
  );

  const restoreTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, inTrash: false, trashedAt: undefined } : t));
        storage.saveTasks(updated);
        return updated;
      });

      logActivity({
        action: 'restore',
        entity: 'task',
        entityId: id,
        entityTitle: target.title,
      });

      showToast(`Restored "${target.title.slice(0, 25)}"`);
    },
    [tasks, logActivity, showToast]
  );

  const toggleTaskComplete = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      const isBecomingCompleted = target.status !== 'completed';
      const now = new Date().toISOString();

      if (isBecomingCompleted) {
        soundFx.playTaskComplete();
        fireTaskConfetti();
      }

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              status: isBecomingCompleted ? ('completed' as const) : ('not_started' as const),
              completedAt: isBecomingCompleted ? now : undefined,
              updatedAt: now,
            };
          }
          return t;
        });
        storage.saveTasks(updated);
        return updated;
      });

      logActivity({
        action: isBecomingCompleted ? 'complete' : 'uncomplete',
        entity: 'task',
        entityId: id,
        entityTitle: target.title,
      });

      showToast(
        isBecomingCompleted ? `Completed "${target.title.slice(0, 25)}"` : `Marked incomplete`,
        {
          label: 'Undo',
          onClick: () => {
            setTasks((prev) => {
              const reverted = prev.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      status: target.status,
                      completedAt: target.completedAt,
                    }
                  : t
              );
              storage.saveTasks(reverted);
              return reverted;
            });
          },
        }
      );
    },
    [tasks, logActivity, showToast]
  );

  const toggleCodeMerged = useCallback(
    (taskId: string) => {
      let nextStatus = false;
      let taskTitle = '';

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === taskId) {
            nextStatus = !t.codeMerged;
            taskTitle = t.title;
            return {
              ...t,
              codeMerged: nextStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });
        storage.saveTasks(updated);
        return updated;
      });

      soundFx.playClick();
      showToast(
        nextStatus
          ? `✓ Code marked as Merged: "${taskTitle.slice(0, 25)}"`
          : `Code marked as Not Merged: "${taskTitle.slice(0, 25)}"`
      );
    },
    [showToast]
  );

  const addPlatform = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setPlatforms((prev) => {
        if (prev.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return prev;
        const updated = [...prev, trimmed];
        storage.savePlatforms(updated);
        return updated;
      });
      showToast(`Added field "${trimmed}"`);
    },
    [showToast]
  );

  const removePlatform = useCallback(
    (name: string) => {
      setPlatforms((prev) => {
        const updated = prev.filter((p) => p !== name);
        storage.savePlatforms(updated);
        return updated;
      });
      showToast(`Removed field "${name}"`);
    },
    [showToast]
  );

  const duplicateTask = useCallback(
    (id: string) => {
      const original = tasks.find((t) => t.id === id);
      if (!original) return;

      const now = new Date().toISOString();
      const duplicated: Task = {
        ...original,
        id: generateId(),
        title: `${original.title} (Copy)`,
        status: 'not_started',
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
        order: tasks.length + 1,
      };

      setTasks((prev) => {
        const updated = [duplicated, ...prev];
        storage.saveTasks(updated);
        return updated;
      });

      showToast(`Duplicated "${original.title.slice(0, 20)}"`);
    },
    [tasks, showToast]
  );

  const reorderTasks = useCallback((reordered: Task[]) => {
    setTasks(reordered);
    storage.saveTasks(reordered);
  }, []);

  const bulkUpdateTasks = useCallback(
    (ids: string[], updates: Partial<Task>) => {
      const now = new Date().toISOString();
      setTasks((prev) => {
        const updated = prev.map((t) => (ids.includes(t.id) ? { ...t, ...updates, updatedAt: now } : t));
        storage.saveTasks(updated);
        return updated;
      });
      showToast(`Updated ${ids.length} tasks`);
    },
    [showToast]
  );

  const bulkDeleteTasks = useCallback(
    (ids: string[], permanent: boolean = false) => {
      if (permanent) {
        setTasks((prev) => {
          const updated = prev.filter((t) => !ids.includes(t.id));
          storage.saveTasks(updated);
          return updated;
        });
        showToast(`Permanently deleted ${ids.length} tasks`);
      } else {
        const now = new Date().toISOString();
        setTasks((prev) => {
          const updated = prev.map((t) => (ids.includes(t.id) ? { ...t, inTrash: true, trashedAt: now } : t));
          storage.saveTasks(updated);
          return updated;
        });
        showToast(`Moved ${ids.length} tasks to trash`);
      }
    },
    [showToast]
  );

  const emptyTrash = useCallback(() => {
    setTasks((prev) => {
      const updated = prev.filter((t) => !t.inTrash);
      storage.saveTasks(updated);
      return updated;
    });
    showToast('Trash emptied permanently');
  }, [showToast]);

  // Habit Handlers
  const addHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: generateId(),
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => {
        const updated = [...prev, newHabit];
        storage.saveHabits(updated);
        return updated;
      });
      showToast(`Added habit "${newHabit.title}"`);
    },
    [showToast]
  );

  const toggleHabitDate = useCallback(
    (habitId: string, dateStr: string) => {
      setHabits((prev) => {
        const updated = prev.map((h) => {
          if (h.id === habitId) {
            const hasCompleted = h.completedDates.includes(dateStr);
            const nextCompleted = hasCompleted
              ? h.completedDates.filter((d) => d !== dateStr)
              : [...h.completedDates, dateStr];

            // Calculate consecutive streak up to today
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            let currentStreak = 0;
            const checkDate = new Date();

            // If today is completed or yesterday was completed
            while (true) {
              const dStr = format(checkDate, 'yyyy-MM-dd');
              if (nextCompleted.includes(dStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else if (dStr === todayStr) {
                // If today is not completed yet, check if yesterday was
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }

            if (!hasCompleted) {
              soundFx.playTaskComplete();
              if (currentStreak >= 3) {
                fireTaskConfetti();
              }
            }

            return {
              ...h,
              completedDates: nextCompleted,
              streak: currentStreak,
              bestStreak: Math.max(h.bestStreak, currentStreak),
            };
          }
          return h;
        });
        storage.saveHabits(updated);
        return updated;
      });
    },
    []
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      setHabits((prev) => {
        const updated = prev.filter((h) => h.id !== habitId);
        storage.saveHabits(updated);
        return updated;
      });
      showToast('Habit removed');
    },
    [showToast]
  );

  // Focus Handlers
  const addFocusSession = useCallback(
    (sessionData: Omit<FocusSession, 'id'>) => {
      const newSession: FocusSession = {
        ...sessionData,
        id: generateId(),
      };
      setFocusSessions((prev) => {
        const updated = [newSession, ...prev];
        storage.saveFocusSessions(updated);
        return updated;
      });

      // Also update task actual minutes if attached to a task
      if (sessionData.taskId && sessionData.durationMinutes) {
        setTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.id === sessionData.taskId) {
              return {
                ...t,
                actualMinutes: (t.actualMinutes || 0) + sessionData.durationMinutes,
              };
            }
            return t;
          });
          storage.saveTasks(updated);
          return updated;
        });
      }

      logActivity({
        action: 'create',
        entity: 'focus',
        entityId: newSession.id,
        entityTitle: `${sessionData.type} (${sessionData.durationMinutes}m)`,
      });
    },
    [logActivity]
  );

  // Journal Handlers
  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        ...entry,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setJournal((prev) => {
        const updated = [newEntry, ...prev.filter((j) => j.date !== entry.date)];
        storage.saveJournal(updated);
        return updated;
      });
      showToast('Journal entry saved');
    },
    [showToast]
  );

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    const now = new Date().toISOString();
    setJournal((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, ...updates, updatedAt: now } : j));
      storage.saveJournal(updated);
      return updated;
    });
  }, []);

  // Settings Handlers
  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...updates };
        storage.saveSettings(updated);
        if (updates.theme) {
          applyTheme(updates.theme);
        }
        if (typeof updates.soundEffects === 'boolean') {
          soundFx.setSoundEnabled(updates.soundEffects);
        }
        return updated;
      });
      showToast('Settings saved');
    },
    [showToast]
  );

  const loadSampleData = useCallback(() => {
    const data = storage.loadFreshSampleData();
    setTasks(data.tasks);
    setHabits(data.habits);
    setFocusSessions(data.focusSessions);
    setJournal(data.journal);
    setSettings(data.settings);
    setCategories(data.categories);
    applyTheme(data.settings.theme);
    showToast('Loaded sample productivity data');
  }, [showToast]);

  const resetAllData = useCallback(() => {
    storage.resetAllData();
    setTasks([]);
    setHabits([]);
    setFocusSessions([]);
    setJournal([]);
    setActivityLogs([]);
    showToast('All local data has been reset');
  }, [showToast]);

  // Modal helpers
  const openCreateTaskModal = useCallback((defaults?: Partial<Task>) => {
    setSelectedTask(defaults ? ({ ...defaults, id: '' } as Task) : null);
    setIsTaskModalOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        habits,
        focusSessions,
        journal,
        categories,
        platforms,
        settings,
        activityLogs,
        activeView,
        searchQuery,
        selectedTask,
        isTaskModalOpen,
        isCommandPaletteOpen,
        isShortcutsOpen,
        isAiModalOpen,
        toast,
        isLoading,
        cloudEnabled,
        cloudSyncStatus,
        syncCloudNow,

        setActiveView,
        setSearchQuery,
        openCreateTaskModal,
        openEditTaskModal,
        closeTaskModal,
        setIsCommandPaletteOpen,
        setIsShortcutsOpen,
        setIsAiModalOpen,
        showToast,
        dismissToast,

        addPlatform,
        removePlatform,

        addTask,
        updateTask,
        deleteTask,
        restoreTask,
        toggleTaskComplete,
        toggleCodeMerged,
        duplicateTask,
        reorderTasks,
        bulkUpdateTasks,
        bulkDeleteTasks,
        emptyTrash,

        addHabit,
        toggleHabitDate,
        deleteHabit,

        addFocusSession,

        addJournalEntry,
        updateJournalEntry,

        updateSettings,
        loadSampleData,
        resetAllData,
      }}
    >
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-[#080808] text-sm text-zinc-400">
          Loading your workspace…
        </div>
      ) : cloudEnabled && !cloudAuthenticated ? (
        <CloudLoginScreen onLogin={finishCloudLogin} />
      ) : children}
    </AppContext.Provider>
  );
}

function CloudLoginScreen({ onLogin }: { onLogin: (password: string) => Promise<string | null> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const message = await onLogin(password);
      if (message) setError(message);
    } catch {
      setError('Could not connect to the cloud service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Kaushal OS</p>
        <h1 className="mt-3 text-xl font-bold">Sign in to your private workspace</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Enter the app password configured by the owner to access synced data.</p>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="App password"
          className="mt-5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none focus:border-red-500"
        />
        {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 h-10 w-full rounded-lg bg-red-600 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

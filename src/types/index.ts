export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startDate?: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  attachments?: Attachment[];
  recurring: RecurrenceType;
  reminderTime?: string; // e.g. "10:00" or ISO
  estimatedMinutes?: number;
  actualMinutes?: number;
  dependencies?: string[]; // IDs of tasks that must be done first
  color?: string;
  platform?: string; // e.g. "Cognos", "MicroStrategy", "Tableau" or custom field
  codeMerged?: boolean; // true = Code merged, false = Not merged / pending
  completedAt?: string;
  archived: boolean;
  inTrash: boolean;
  trashedAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  completedDates: string[]; // ['2026-11-14', ...]
  streak: number;
  bestStreak: number;
  color: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  type: 'work' | 'short_break' | 'long_break';
  durationMinutes: number;
  completed: boolean;
  taskId?: string;
  taskTitle?: string;
  timestamp: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 'great' | 'good' | 'neutral' | 'low' | 'tough';
  content: string;
  highlights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'complete' | 'uncomplete' | 'restore';
  entity: 'task' | 'habit' | 'focus' | 'journal';
  entityId: string;
  entityTitle: string;
  timestamp: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'violet' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface UserSettings {
  userName: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  defaultPriority: Priority;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  timeFormat: '12h' | '24h';
  startOfWeek: 0 | 1; // 0: Sunday, 1: Monday
  soundEffects: boolean;
  browserNotifications: boolean;
  pomodoro: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
  };
  supabaseSync?: {
    enabled: boolean;
    url?: string;
    anonKey?: string;
    lastSyncedAt?: string;
  };
}

export type ActiveView = 
  | 'dashboard'
  | 'my-day'
  | 'upcoming'
  | 'inbox'
  | 'all-tasks'
  | 'kanban'
  | 'calendar'
  | 'important'
  | 'overdue'
  | 'completed'
  | 'trash'
  | 'pomodoro'
  | 'habits'
  | 'journal'
  | 'analytics'
  | 'settings';

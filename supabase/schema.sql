-- Zenith Productivity - Supabase Schema with Row Level Security (RLS)

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  start_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  category TEXT NOT NULL DEFAULT 'Work',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  subtasks JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::JSONB,
  recurring TEXT DEFAULT 'none',
  reminder_time TEXT,
  estimated_minutes INT DEFAULT 0,
  actual_minutes INT DEFAULT 0,
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  color TEXT,
  platform TEXT,
  code_merged BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  in_trash BOOLEAN DEFAULT FALSE,
  trashed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  frequency TEXT NOT NULL DEFAULT 'daily',
  target_days_per_week INT DEFAULT 7,
  completed_dates DATE[] DEFAULT ARRAY[]::DATE[],
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- 3. Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('work', 'short_break', 'long_break')),
  duration_minutes INT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  task_id UUID,
  task_title TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own focus sessions" ON public.focus_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 4. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'neutral', 'low', 'tough')),
  content TEXT NOT NULL,
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journal" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- 5. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Alex',
  theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT 'indigo',
  default_priority TEXT DEFAULT 'medium',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  time_format TEXT DEFAULT '12h',
  start_of_week INT DEFAULT 1,
  sound_effects BOOLEAN DEFAULT TRUE,
  browser_notifications BOOLEAN DEFAULT FALSE,
  pomodoro_settings JSONB DEFAULT '{"workDuration":25,"shortBreakDuration":5,"longBreakDuration":15,"autoStartBreaks":false}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

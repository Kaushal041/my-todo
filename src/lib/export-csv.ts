import { Task, FocusSession, Habit, JournalEntry, UserSettings } from '@/types';

export function exportTasksToCSV(tasks: Task[]) {
  const headers = [
    'ID',
    'Title',
    'Field/Platform',
    'Code Merged',
    'Status',
    'Priority',
    'Category',
    'Due Date',
    'Due Time',
    'Estimated (min)',
    'Actual (min)',
    'Tags',
    'Subtasks Total',
    'Subtasks Done',
    'Created At',
    'Completed At',
  ];

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.platform || 'None'}"`,
    t.codeMerged ? 'Yes' : 'No',
    `"${t.status}"`,
    `"${t.priority}"`,
    `"${t.category}"`,
    `"${t.dueDate || ''}"`,
    `"${t.dueTime || ''}"`,
    t.estimatedMinutes || 0,
    t.actualMinutes || 0,
    `"${(t.tags || []).join(';')}"`,
    t.subtasks.length,
    t.subtasks.filter((s) => s.completed).length,
    `"${t.createdAt}"`,
    `"${t.completedAt || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  downloadBlob(csvContent, `zenith_tasks_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportFocusSessionsToCSV(sessions: FocusSession[]) {
  const headers = ['ID', 'Type', 'Duration (min)', 'Completed', 'Task Title', 'Timestamp', 'Notes'];
  const rows = sessions.map((s) => [
    `"${s.id}"`,
    `"${s.type}"`,
    s.durationMinutes,
    s.completed ? 'Yes' : 'No',
    `"${(s.taskTitle || '').replace(/"/g, '""')}"`,
    `"${s.timestamp}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  downloadBlob(csvContent, `zenith_focus_sessions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportFullBackupJSON(data: {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  journal: JournalEntry[];
  settings: UserSettings;
  platforms?: string[];
}) {
  const jsonContent = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...data,
    },
    null,
    2
  );
  downloadBlob(jsonContent, `zenith_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

function downloadBlob(content: string, filename: string, contentType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

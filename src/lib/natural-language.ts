import { Priority } from '@/types';
import { format, addDays, nextMonday, nextFriday } from 'date-fns';

export interface ParsedTaskInput {
  title: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority?: Priority;
  category?: string;
  tags: string[];
}

export function parseNaturalLanguageTask(input: string): ParsedTaskInput {
  let text = input.trim();
  const tags: string[] = [];
  let priority: Priority | undefined;
  let category: string | undefined;
  let dueDate: string | undefined;
  let dueTime: string | undefined;

  // 1. Extract Priority (e.g. !urgent, !high, !med, !low or priority:high)
  const priorityRegex = /(?:^|\s)(?:!|priority:)(urgent|p1|high|p2|medium|med|p3|low|p4)(?=\s|$)/i;
  const pMatch = text.match(priorityRegex);
  if (pMatch) {
    const pStr = pMatch[1].toLowerCase();
    if (pStr === 'urgent' || pStr === 'p1') priority = 'urgent';
    else if (pStr === 'high' || pStr === 'p2') priority = 'high';
    else if (pStr === 'medium' || pStr === 'med' || pStr === 'p3') priority = 'medium';
    else if (pStr === 'low' || pStr === 'p4') priority = 'low';
    text = text.replace(pMatch[0], ' ');
  }

  // 2. Extract Category (e.g. #work, #personal, #learning)
  const categoryRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)(?=\s|$)/;
  const catMatch = text.match(categoryRegex);
  if (catMatch) {
    category = catMatch[1].charAt(0).toUpperCase() + catMatch[1].slice(1);
    text = text.replace(catMatch[0], ' ');
  }

  // 3. Extract Tags (e.g. @dev, @frontend)
  const tagRegex = /(?:^|\s)@([a-zA-Z0-9_-]+)(?=\s|$)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1].toLowerCase());
  }
  text = text.replace(tagRegex, ' ');

  // 4. Extract Time (e.g. at 3pm, at 14:00, 10:30am)
  const timeRegex = /(?:^|\s)(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s|$)/i;
  const tMatch = text.match(timeRegex);
  if (tMatch) {
    let hours = parseInt(tMatch[1], 10);
    const minutes = tMatch[2] ? parseInt(tMatch[2], 10) : 0;
    const modifier = tMatch[3].toLowerCase();

    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;

    dueTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    text = text.replace(tMatch[0], ' ');
  } else {
    // 24-hour match (e.g. at 17:30)
    const time24Regex = /(?:^|\s)at\s+(\d{1,2}):(\d{2})(?=\s|$)/i;
    const t24Match = text.match(time24Regex);
    if (t24Match) {
      dueTime = `${t24Match[1].padStart(2, '0')}:${t24Match[2]}`;
      text = text.replace(t24Match[0], ' ');
    }
  }

  // 5. Extract Due Date keywords
  const today = new Date();
  const lower = text.toLowerCase();

  if (/\b(today|tonight)\b/i.test(lower)) {
    dueDate = format(today, 'yyyy-MM-dd');
    text = text.replace(/\b(today|tonight)\b/i, ' ');
  } else if (/\btomorrow\b/i.test(lower)) {
    dueDate = format(addDays(today, 1), 'yyyy-MM-dd');
    text = text.replace(/\btomorrow\b/i, ' ');
  } else if (/\bnext week\b/i.test(lower)) {
    dueDate = format(nextMonday(today), 'yyyy-MM-dd');
    text = text.replace(/\bnext week\b/i, ' ');
  } else if (/\bthis weekend\b/i.test(lower) || /\bfriday\b/i.test(lower)) {
    dueDate = format(nextFriday(today), 'yyyy-MM-dd');
    text = text.replace(/\b(this weekend|friday)\b/i, ' ');
  }

  // Clean extra spaces from title
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || input.trim(),
    dueDate,
    dueTime,
    priority,
    category,
    tags,
  };
}

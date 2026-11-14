# Zenith — Personal Productivity OS

A personal productivity and task management web application inspired by the design quality and interaction models of Linear, Notion, Todoist, and Motion.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, **Lucide Icons**, and **Web Audio API**.

---

## ✨ Key Features

### 1. Modern Linear & Notion-Inspired Dashboard
- Dynamic greeting based on the time of day, live clock, and current date.
- Real-time productivity metrics: **Due Today**, **Completed**, **Total Pending**, **Overdue**, and a **Daily Productivity Score** calculated from task completion, habit streaks, and focus blocks.
- Interactive charts powered by **Recharts**: 7-Day Completion Velocity and Active Task Priority Breakdown.
- Daily motivational quote widget with quick shuffle.
- **Smart Natural Language Quick-Add Bar**: Type tasks like `Submit tax returns tomorrow at 3pm !urgent #finance @review` with real-time detection of dates, times, priorities, categories, and tags.

### 2. Multi-View Task Architecture
1. **My Day**: Focus solely on commitments scheduled for today.
2. **Upcoming**: Timeline of upcoming tasks (tomorrow, this week, later).
3. **Inbox**: Capture and triage unorganized thoughts and backlog items.
4. **All Tasks**: Filterable, searchable, and sortable master view.
5. **Kanban Board**: Drag-and-drop columns grouped by **Status** (*To Do*, *In Progress*, *Completed*) or by **Priority** (*Urgent*, *High*, *Medium*, *Low*).
6. **Interactive Calendar**: Monthly and weekly grid views displaying tasks directly on scheduled dates with 1-click date scheduling.
7. **Important**: Filtered for high and urgent priority items.
8. **Overdue**: Dedicated missed deadline triage.
9. **Completed**: Archive of accomplishments with 1-click un-complete.
10. **Trash**: Soft-delete safety net with 1-click restore or permanent wipe.

### 3. Deep Task Attributes & Checklists
- Title, rich description, and notes.
- Priority levels: *Low*, *Medium*, *High*, *Urgent* (with pulsating badges for urgent items).
- Status workflow: *Not Started*, *In Progress*, *Completed*.
- Subtasks & checklists with completion tracking and progress bars.
- Recurrence: *Daily*, *Weekly*, *Monthly*.
- Estimated minutes vs. actual minutes logged.
- Bulk operations: select multiple tasks to batch complete, change priority, or delete.
- Celebration confetti animations and Web Audio sound effects on task completion with instant **Undo**.

### 4. Focus & Growth Suite
- **Pomodoro Focus Timer**: Circular countdown timer with presets for Focus (25m), Short Break (5m), and Long Break (15m). Link active sessions directly to tasks to log actual minutes automatically. Features harmonized Tibetan bell chimes synthesized locally via Web Audio API.
- **Habit Tracker**: Visual 7-day consistency grid tracking weekly rituals, current streaks, best streaks, and completion rates.
- **Notes & Daily Journal**: Track moods, record daily wins, and keep reflections.

### 5. Analytics & CSV Export
- Velocity trendline tracking completed milestones over 7-day, 30-day, and all-time windows.
- Category workload breakdown and priority balance visualization.
- **Export to CSV**: Download real CSV reports for both tasks and focus session history.
- **Full JSON Backup & Restore**: Download complete offline database backups and restore anytime.

### 6. Command Palette & Keyboard Shortcuts
- **`Ctrl + K` / `Cmd + K`**: Global command palette to search all tasks, jump between views, toggle dark/light theme, or trigger quick actions.
- **`N`**: Quick create new task modal.
- **`?`**: Keyboard shortcuts cheat sheet.
- **`1` - `5`**: Rapid view navigation.

### 7. AI-Ready Architecture
- Built-in heuristic intelligence engine: provides daily planning strategy and instant task decomposition (e.g. breaks down complex projects into 5 actionable subtasks).
- Optional direct integration with Google Gemini API by entering your API key.

### 8. Progressive Web App (PWA) & Offline Reliability
- Installable on Desktop, iOS, and Android home screens.
- Web app manifest and service worker caching for offline access.
- 100% functional locally out of the box with zero required external database configuration.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with custom Linear/Notion dark and light theme tokens)
- **Data Visualizations**: Recharts
- **Icons**: Lucide Icons
- **Audio Engine**: Web Audio API (zero external sound file dependencies)
- **Celebrations**: Canvas-Confetti
- **Date Utilities**: Date-fns
- **Persistence**: LocalStorage abstraction + Optional Supabase PostgreSQL Sync

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested with Node 20 & 26)
- npm or pnpm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zenith-productivity.git
   cd zenith-productivity
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Optional Supabase Cloud Sync

Zenith works out of the box locally without any external accounts. If you want multi-device cloud synchronization:

1. Create a free project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and run the queries in `supabase/schema.sql`.
3. In Zenith, navigate to **Settings** -> **Supabase Cloud Database Sync**, enter your project URL and Anon key, and click **Test & Save Connection**.

---

## 🚢 Deploying to Vercel

The easiest way to deploy Zenith is using the [Vercel Platform](https://vercel.com):

1. Push your repository to GitHub.
2. Import the repository into Vercel.
3. (Optional) Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
4. Click **Deploy**. Zenith will build and deploy instantly with Turbopack!

---

## 📄 License

MIT License. Designed and built for personal everyday productivity.

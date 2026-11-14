'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  ListPlus,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Key,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    tasks,
    habits,
    addTask,
    updateTask,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'plan' | 'breakdown' | 'audit'>('plan');
  const [taskToBreakdownTitle, setTaskToBreakdownTitle] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Intelligent Heuristic Analysis of Current Slate
  const overdueTasks = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
  const urgentTasks = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.priority === 'urgent');
  const dueTodayTasks = tasks.filter((t) => !t.inTrash && t.status !== 'completed' && t.dueDate === todayStr);

  // Smart Heuristic Task Breakdown
  const handleBreakdown = async () => {
    if (!taskToBreakdownTitle.trim()) return;
    setIsGenerating(true);

    try {
      if (apiKey.trim()) {
        // External Gemini API call if key supplied
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert productivity architect. Break down this task into 4-6 specific, actionable, concrete subtasks: "${taskToBreakdownTitle}". Return ONLY a JSON array of strings, like ["Step 1", "Step 2"].`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const jsonMatch = rawText?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setGeneratedSubtasks(parsed);
          setIsGenerating(false);
          return;
        }
      }

      // Built-in intelligent deterministic breakdown engine
      const query = taskToBreakdownTitle.toLowerCase();
      let steps: string[] = [];

      if (query.includes('tax') || query.includes('finance') || query.includes('budget')) {
        steps = [
          'Gather all monthly bank statements and receipts',
          'Audit recurring subscription and infrastructure costs',
          'Calculate gross deductions and tax brackets',
          'Complete filing declaration or spreadsheet export',
          'Review final balance with accountant or archive record',
        ];
      } else if (query.includes('launch') || query.includes('deploy') || query.includes('release')) {
        steps = [
          'Run complete automated test suite and typechecks',
          'Audit production environment variables and secrets',
          'Deploy staging canary build and verify response codes',
          'Perform smoke test across core user flows',
          'Promote to production and monitor latency/errors',
        ];
      } else if (query.includes('redesign') || query.includes('ui') || query.includes('frontend')) {
        steps = [
          'Audit existing UI gaps and user friction points',
          'Draft high-fidelity layout wireframes and color tokens',
          'Implement core responsive component primitives',
          'Add subtle hover states, transitions, and loading skeletons',
          'Cross-browser test on Mobile, Tablet, and Desktop',
        ];
      } else {
        steps = [
          `Define explicit scope and acceptance criteria for "${taskToBreakdownTitle}"`,
          'Identify dependencies and necessary resources or credentials',
          'Execute the primary core deliverable / initial draft',
          'Review, refine, and verify output against expectations',
          'Finalize and archive or share with stakeholders',
        ];
      }

      setTimeout(() => {
        setGeneratedSubtasks(steps);
        setIsGenerating(false);
      }, 350);
    } catch {
      setIsGenerating(false);
      showToast('Error generating breakdown. Using heuristic fallback.');
    }
  };

  const handleCreateTaskWithSubtasks = () => {
    if (!taskToBreakdownTitle.trim()) return;

    addTask({
      title: taskToBreakdownTitle.trim(),
      dueDate: todayStr,
      priority: 'high',
      category: 'Work',
      subtasks: generatedSubtasks.map((title) => ({
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      })),
    });

    setGeneratedSubtasks([]);
    setTaskToBreakdownTitle('');
    setIsAiModalOpen(false);
    showToast('Created task with generated subtasks!');
  };

  return (
    <Dialog
      isOpen={isAiModalOpen}
      onClose={() => setIsAiModalOpen(false)}
      title="Zenith AI Productivity Architect"
      description="Smart planning heuristics, task breakdown, and workload audits"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'plan'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Daily Strategy</span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Task Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Workload Audit</span>
          </button>
        </div>

        {/* Tab 1: Daily Strategy */}
        {activeTab === 'plan' && (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl border border-indigo-200/60 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-xs">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Recommended Focus Protocol for Today
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {overdueTasks.length > 0
                  ? `You have ${overdueTasks.length} overdue task(s). We advise clearing or rescheduling these first before taking on new work.`
                  : urgentTasks.length > 0
                  ? `You have ${urgentTasks.length} urgent responsibility. Allocate your first morning Pomodoro block strictly to this item.`
                  : 'Your schedule is well-balanced. Focus on deep continuous execution of your primary milestone.'}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Action Items for Today
              </h5>
              {dueTodayTasks.length > 0 ? (
                dueTodayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-500 uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 shrink-0">
                      {t.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">No tasks due today yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Task Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">
                Enter a large, complex task to deconstruct:
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Prepare annual financial taxes or Launch MVP"
                  value={taskToBreakdownTitle}
                  onChange={(e) => setTaskToBreakdownTitle(e.target.value)}
                  className="text-xs h-9"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleBreakdown}
                  disabled={!taskToBreakdownTitle.trim() || isGenerating}
                  className="h-9 text-xs shrink-0 gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Analyzing...' : 'Break Down'}</span>
                </Button>
              </div>
            </div>

            {/* Generated Subtasks Preview */}
            {generatedSubtasks.length > 0 && (
              <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Generated Subtasks ({generatedSubtasks.length})
                </h5>
                <div className="space-y-1.5">
                  {generatedSubtasks.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleCreateTaskWithSubtasks}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task With These Subtasks</span>
                  </Button>
                </div>
              </div>
            )}

            {/* API Key configuration hint */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-400">
              <Key className="w-3 h-3 text-zinc-400" />
              <span>Optional: Enter Gemini API Key for live LLM completions:</span>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-[10px] w-36 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Workload Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <span className="text-zinc-400 block text-[11px]">Overdue Bottlenecks</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {overdueTasks.length} items
                </span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <span className="text-zinc-400 block text-[11px]">Urgent Pressure</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {urgentTasks.length} items
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <h5 className="font-semibold text-zinc-900 dark:text-white">Audit Insights</h5>
              <p className="text-zinc-500 leading-relaxed">
                {overdueTasks.length === 0 && urgentTasks.length <= 2
                  ? 'Your workload health is excellent. You have no overdue debt and low urgent pressure.'
                  : 'Consider batching your low-priority tasks into a single weekly review hour, and reserving your mornings for the highest priority responsibilities.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

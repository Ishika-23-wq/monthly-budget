import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Bell,
  BellRing,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { TaskItem, PriorityLevel, Category } from '../types';
import { formatINR, formatDateReadable, getDaysUntil, getTodayDateString } from '../utils/formatters';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
  notifyTaskDue
} from '../utils/notifications';

interface Props {
  tasks: TaskItem[];
  categories: Category[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickLogExpenseFromTask: (task: TaskItem) => void;
}

const QUICK_CATEGORIES = [
  'Grading & Evaluation',
  'Question Paper Prep',
  'Meetings',
  'PhD Research',
  'Teaching & Sheets',
  'Finance / Fees',
  'Administrative',
  'Personal'
];

export const TasksSection: React.FC<Props> = ({
  tasks,
  categories,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onQuickLogExpenseFromTask
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'dueSoon'>('pending');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Quick Add State
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(getTodayDateString());
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [categoryName, setCategoryName] = useState(QUICK_CATEGORIES[0]);
  const [amountLinked, setAmountLinked] = useState('');
  const [notes, setNotes] = useState('');

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => getNotificationPermission());

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleSendTestNotification = () => {
    const sent = sendNotification('🔔 FinTrack Academic & Work Alert', {
      body: 'Notifications are working! You will get alerts 2–3 days before meetings, grading sheets & question paper deadlines.',
    });
    if (!sent && notifPermission !== 'granted') {
      handleEnableNotifications();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      deadline,
      priority,
      category: categoryName,
      amountLinked: amountLinked ? parseFloat(amountLinked) : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
      completed: false
    });

    setTitle('');
    setAmountLinked('');
    setNotes('');
    setShowQuickAdd(false);
  };

  // Find tasks due within 2 to 3 days (or today/tomorrow)
  const dueSoonTasks = tasks.filter(t => {
    if (t.completed) return false;
    const d = getDaysUntil(t.deadline);
    return d >= 0 && d <= 3;
  });

  const filteredTasks = tasks.filter(t => {
    if (filter === 'dueSoon') {
      const d = getDaysUntil(t.deadline);
      return !t.completed && d >= 0 && d <= 3;
    }
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 bg-white text-black">
      {/* Header Banner - Palette: #6d6875, #b5838d, #e5989b, #ffb4a2, #ffcdb2 */}
      <div className="rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-sm text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-[#6d6875] px-2.5 py-0.5 text-xs font-bold text-white">
                <CheckSquare className="h-3.5 w-3.5" />
                Work, Academic & Daily Tasks
              </span>
              <span className="rounded bg-[#ffb4a2] border border-[#b5838d] px-2 py-0.5 text-xs font-black text-black">
                {pendingCount} Pending • {completedCount} Done
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-black text-black">
              Task Management & Deadline Alerts
            </h2>
            <p className="text-xs text-black mt-0.5 font-semibold">
              Meetings, question papers, checking students' sheets, PhD milestones & bill deadlines with 2–3 day early notifications.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {notifPermission === 'granted' ? (
              <button
                onClick={handleSendTestNotification}
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#6d6875] bg-white px-3 py-2 text-xs font-black text-black hover:bg-[#ffcdb2]/20 transition"
                title="Send test alert to this phone/laptop"
              >
                <BellRing className="h-4 w-4 text-[#b5838d]" />
                <span>Test 2-3 Day Alert</span>
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 rounded-xl bg-[#6d6875] hover:bg-[#5b5762] px-3.5 py-2 text-xs font-bold text-white shadow transition"
              >
                <Bell className="h-4 w-4 text-[#ffcdb2]" />
                <span>Enable Phone & Laptop Alerts</span>
              </button>
            )}

            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 rounded-xl bg-[#b5838d] hover:bg-[#a0717b] px-4 py-2 text-xs font-bold text-white shadow transition"
            >
              <Plus className="h-4 w-4" />
              <span>{showQuickAdd ? 'Close' : 'Quick Add Any Task'}</span>
            </button>
          </div>
        </div>

        {/* 2-3 Day Proactive Alert Banner */}
        {dueSoonTasks.length > 0 && (
          <div className="mt-4 rounded-xl border-2 border-[#b5838d] bg-white p-3.5 shadow-sm text-black">
            <div className="flex items-center gap-2 font-black text-black text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4 text-[#b5838d]" />
              <span>⏰ 2–3 Day Deadline Alert: {dueSoonTasks.length} task{dueSoonTasks.length !== 1 ? 's' : ''} require immediate action!</span>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dueSoonTasks.map(t => {
                const days = getDaysUntil(t.deadline);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-white border border-[#b5838d] p-2 text-xs text-black"
                  >
                    <span className="font-bold truncate pr-2">{t.title}</span>
                    <span className="shrink-0 rounded bg-[#e5989b] px-2 py-0.5 text-[10px] font-black text-black">
                      {days === 0 ? 'Due Today!' : days === 1 ? 'Due Tomorrow!' : `Due in ${days} days`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Any Task Form */}
      {showQuickAdd && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-md animate-fadeIn space-y-4 text-black"
        >
          <div className="flex items-center justify-between border-b-2 border-[#b5838d]/30 pb-3">
            <div>
              <h3 className="text-sm font-black text-black">Add Any Work, Academic or Daily Task</h3>
              <p className="text-[11px] text-black font-semibold">e.g. check students sheet, question paper, department meeting</p>
            </div>
            <span className="rounded bg-[#ffcdb2] border border-[#b5838d] px-2 py-0.5 text-[10px] font-bold text-black">
              2-3 Day Notification Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-black mb-1">
                Task Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Check CS-101 Students Answer Sheets, Create Mid-Term Question Paper, 2 PM HOD Meeting"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2.5 text-sm text-black placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Deadline Date *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2 text-xs text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Category / Type
              </label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2 text-xs text-black focus:outline-none"
              >
                {QUICK_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2 text-xs text-black focus:outline-none"
              >
                <option value="high">High Priority (Urgent)</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Linked Amount (₹ Optional, e.g. for fee/bills)
              </label>
              <input
                type="number"
                placeholder="0"
                value={amountLinked}
                onChange={e => setAmountLinked(e.target.value)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2 text-xs text-black focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-black mb-1">
                Notes & Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Total 45 papers, include MCQ section, Room 204"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white p-2 text-xs text-black placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="rounded-xl border-2 border-[#6d6875] px-4 py-2 text-xs font-black text-black hover:bg-[#ffcdb2]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6d6875] hover:bg-[#5b5762] px-5 py-2 text-xs font-bold text-white shadow"
            >
              Save Task to Database
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs using the 5 colors */}
      <div className="flex items-center justify-between border-b-2 border-[#6d6875]/20 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('dueSoon')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'dueSoon'
                ? 'bg-[#e5989b] text-black shadow-sm'
                : 'text-black hover:bg-[#ffcdb2]/30'
            }`}
          >
            ⚠️ Due in 2–3 Days ({dueSoonTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'pending'
                ? 'bg-[#6d6875] text-white shadow-sm'
                : 'text-black hover:bg-[#ffcdb2]/30'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'completed'
                ? 'bg-[#b5838d] text-white shadow-sm'
                : 'text-black hover:bg-[#ffcdb2]/30'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'all'
                ? 'bg-[#6d6875] text-white shadow-sm'
                : 'text-black hover:bg-[#ffcdb2]/30'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-1 text-xs font-black text-[#6d6875] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#6d6875] bg-white py-10 text-center text-xs text-black font-bold">
            No {filter === 'dueSoon' ? 'tasks due in 2–3 days' : filter} right now.{' '}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="text-[#6d6875] font-black underline ml-1"
            >
              Add a task here
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const daysLeft = getDaysUntil(task.deadline);
            const isOverdue = daysLeft < 0 && !task.completed;
            const isDueSoon = daysLeft >= 0 && daysLeft <= 3 && !task.completed;

            return (
              <div
                key={task.id}
                className={`group rounded-2xl border-2 p-4 transition bg-white shadow-sm hover:shadow text-black ${
                  task.completed
                    ? 'border-slate-300 opacity-60'
                    : isOverdue
                    ? 'border-[#e5989b]'
                    : isDueSoon
                    ? 'border-[#b5838d] ring-2 ring-[#ffb4a2]/50'
                    : 'border-[#6d6875]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[#6d6875] hover:scale-110 transition shrink-0"
                      title={task.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#b5838d]" />
                      ) : (
                        <Square className="h-5 w-5 text-black hover:text-[#6d6875]" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-black ${
                            task.completed
                              ? 'line-through text-slate-500'
                              : 'text-black'
                          }`}
                        >
                          {task.title}
                        </h4>

                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                          task.priority === 'high' ? 'bg-[#b5838d] text-white' : 'bg-[#ffcdb2] text-black'
                        }`}>
                          {task.priority}
                        </span>

                        {task.category && (
                          <span className="rounded bg-white border border-[#6d6875] px-1.5 py-0.2 text-[10px] font-bold text-black">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-black mt-1 font-semibold">{task.notes}</p>
                      )}

                      {/* Deadline & 2-3 Day Notification Countdown */}
                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                        <span className="flex items-center gap-1 text-black font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-[#6d6875]" />
                          {formatDateReadable(task.deadline)}
                        </span>

                        {!task.completed && (
                          <span
                            className={`flex items-center gap-1 font-black ${
                              isOverdue
                                ? 'text-[#b5838d]'
                                : isDueSoon
                                ? 'text-black bg-[#ffb4a2] border border-[#b5838d] px-2 py-0.5 rounded-full'
                                : 'text-black'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {daysLeft === 0
                              ? 'DUE TODAY!'
                              : daysLeft < 0
                              ? `Overdue by ${Math.abs(daysLeft)} days`
                              : daysLeft <= 3
                              ? `Due in ${daysLeft} days (2-3 Day Alert Active)`
                              : `${daysLeft} days left`}
                          </span>
                        )}

                        {task.amountLinked ? (
                          <span className="font-black text-black">
                            Target: {formatINR(task.amountLinked)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.amountLinked && !task.completed && (
                      <button
                        onClick={() => onQuickLogExpenseFromTask(task)}
                        className="hidden sm:flex items-center gap-1 rounded-xl bg-[#6d6875] hover:bg-[#5b5762] px-2.5 py-1 text-xs font-bold text-white transition shadow-sm"
                        title="Log this payment into expenses"
                      >
                        Log Pay
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-black hover:text-[#b5838d] p-1 transition"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

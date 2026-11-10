import React, { useState } from 'react';
import { TaskItem, PriorityLevel, Category } from '../types';
import { formatINR, formatDateReadable, getDaysUntil, getTodayDateString } from '../utils/formatters';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification
} from '../utils/notifications';

interface Props {
  tasks: TaskItem[];
  categories?: Category[];
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
    <div className="space-y-6 text-[#54414e]">
      {/* Header Banner in Palette */}
      <div className="rounded-3xl border border-[#a790a5]/35 bg-white p-5 sm:p-6 shadow-xs text-[#54414e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#875c74]/20 border border-[#875c74] px-3 py-0.5 text-xs font-black text-[#54414e]">
                <i className="fa-solid fa-list-check text-xs"></i>
                Work, Academic & Daily Tasks
              </span>
              <span className="rounded-full bg-[#c5ebc3]/20 border border-[#a790a5]/30 px-2.5 py-0.5 text-xs font-black text-[#54414e]">
                {pendingCount} Pending • {completedCount} Done
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#54414e]">
              Task Management & Deadline Alerts
            </h2>
            <p className="text-xs text-[#a790a5] mt-0.5 font-semibold">
              Meetings, question papers, checking students' sheets, PhD milestones & bill deadlines with 2–3 day early notifications.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {notifPermission === 'granted' ? (
              <button
                onClick={handleSendTestNotification}
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#a790a5]/40 bg-white px-3 py-2 text-xs font-black text-[#54414e] hover:bg-[#875c74]/15 transition shadow-xs"
                title="Send test alert to this phone/laptop"
              >
                <i className="fa-solid fa-bell text-xs text-[#875c74]"></i>
                <span>Test 2-3 Day Alert</span>
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-3.5 py-2 text-xs font-bold text-[#c5ebc3] shadow-xs transition"
              >
                <i className="fa-solid fa-bell text-xs text-[#c5ebc3]"></i>
                <span>Enable Phone & Laptop Alerts</span>
              </button>
            )}

            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-4 py-2 text-xs font-black text-[#c5ebc3] shadow-xs transition"
            >
              <i className={`fa-solid ${showQuickAdd ? 'fa-xmark' : 'fa-plus'} text-xs`}></i>
              <span>{showQuickAdd ? 'Close' : 'Quick Add Any Task'}</span>
            </button>
          </div>
        </div>

        {/* 2-3 Day Proactive Alert Banner */}
        {dueSoonTasks.length > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-[#875c74] bg-gradient-to-r from-white via-white to-[#875c74]/10 p-4 shadow-xs text-[#54414e]">
            <div className="flex items-center gap-2 font-black text-[#54414e] text-xs sm:text-sm">
              <i className="fa-solid fa-triangle-exclamation text-sm text-[#875c74]"></i>
              <span>⏰ 2–3 Day Deadline Alert: {dueSoonTasks.length} task{dueSoonTasks.length !== 1 ? 's' : ''} require immediate action!</span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dueSoonTasks.map(t => {
                const days = getDaysUntil(t.deadline);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-white border border-[#875c74] p-2.5 text-xs text-[#54414e] shadow-2xs"
                  >
                    <span className="font-bold truncate pr-2">{t.title}</span>
                    <span className="shrink-0 rounded-full bg-[#875c74] px-2.5 py-0.5 text-[10px] font-black text-white">
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
          className="rounded-3xl border-2 border-[#a790a5]/40 bg-white p-5 sm:p-6 shadow-md animate-fadeIn space-y-4 text-[#54414e]"
        >
          <div className="flex items-center justify-between border-b border-[#a790a5]/25 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#54414e]">Add Any Work, Academic or Daily Task</h3>
              <p className="text-[11px] text-[#a790a5] font-semibold">e.g. check students sheet, question paper, department meeting</p>
            </div>
            <span className="rounded-full bg-[#c5ebc3]/30 border border-[#875c74]/40 px-2.5 py-0.5 text-[10px] font-black text-[#54414e]">
              2-3 Day Notification Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Task Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Check CS-101 Students Answer Sheets, Create Mid-Term Question Paper, 2 PM HOD Meeting"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2.5 text-sm text-[#54414e] placeholder-slate-400 focus:border-[#875c74] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Deadline Date *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2 text-xs text-[#54414e] focus:border-[#875c74] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Category / Type
              </label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2 text-xs text-[#54414e] focus:border-[#875c74] focus:outline-none"
              >
                {QUICK_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2 text-xs text-[#54414e] focus:border-[#875c74] focus:outline-none"
              >
                <option value="high">High Priority (Urgent)</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Linked Amount (₹ Optional, e.g. for fee/bills)
              </label>
              <input
                type="number"
                placeholder="0"
                value={amountLinked}
                onChange={e => setAmountLinked(e.target.value)}
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2 text-xs text-[#54414e] focus:border-[#875c74] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-[#54414e] mb-1">
                Notes & Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Total 45 papers, include MCQ section, Room 204"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border-2 border-[#a790a5]/35 bg-white p-2 text-xs text-[#54414e] placeholder-slate-400 focus:border-[#875c74] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="rounded-xl border-2 border-[#a790a5]/35 px-4 py-2 text-xs font-black text-[#54414e] hover:bg-[#875c74]/15 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#54414e] hover:bg-[#875c74] px-5 py-2 text-xs font-black text-[#c5ebc3] shadow-xs transition"
            >
              Save Task to Database
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs in Palette */}
      <div className="flex items-center justify-between border-b border-[#a790a5]/25 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('dueSoon')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'dueSoon'
                ? 'bg-[#875c74] text-white shadow-xs'
                : 'text-[#a790a5] hover:text-[#54414e] hover:bg-[#875c74]/15'
            }`}
          >
            ⚠️ Due in 2–3 Days ({dueSoonTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'pending'
                ? 'bg-[#54414e] text-[#c5ebc3] shadow-xs'
                : 'text-[#a790a5] hover:text-[#54414e] hover:bg-[#875c74]/15'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'completed'
                ? 'bg-[#a790a5] text-white shadow-xs'
                : 'text-[#a790a5] hover:text-[#54414e] hover:bg-[#875c74]/15'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              filter === 'all'
                ? 'bg-[#54414e] text-white shadow-xs'
                : 'text-[#a790a5] hover:text-[#54414e] hover:bg-[#875c74]/15'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-1 text-xs font-black text-[#54414e] hover:text-[#875c74] transition"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>New Task</span>
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#a790a5]/40 bg-white py-12 text-center text-xs text-[#a790a5] font-bold">
            No {filter === 'dueSoon' ? 'tasks due in 2–3 days' : filter} right now.{' '}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="text-[#54414e] font-black underline ml-1 hover:text-[#875c74]"
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
                className={`group rounded-2xl border p-4 transition bg-white shadow-xs hover:shadow-sm text-[#54414e] ${
                  task.completed
                    ? 'border-slate-200 opacity-60'
                    : isOverdue
                    ? 'border-rose-400 bg-rose-50/30'
                    : isDueSoon
                    ? 'border-2 border-[#875c74] ring-2 ring-[#875c74]/25 bg-gradient-to-r from-white via-white to-[#875c74]/10'
                    : 'border-[#a790a5]/30 hover:border-[#875c74]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[#54414e] hover:scale-110 transition shrink-0"
                      title={task.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <i className="fa-solid fa-circle-check text-xl text-[#54414e]"></i>
                      ) : (
                        <i className="fa-regular fa-square text-xl text-[#a790a5] hover:text-[#54414e]"></i>
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-black ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-[#54414e]'
                          }`}
                        >
                          {task.title}
                        </h4>

                        <span className={`rounded-full px-2 py-0.2 text-[9px] font-black uppercase ${
                          task.priority === 'high' ? 'bg-[#54414e] text-white' : 'bg-[#875c74]/30 text-[#54414e] border border-[#875c74]'
                        }`}>
                          {task.priority}
                        </span>

                        {task.category && (
                          <span className="rounded-full bg-[#c5ebc3]/20 border border-[#a790a5]/35 px-2 py-0.2 text-[9px] font-bold text-[#54414e]">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-[#a790a5] mt-1 font-semibold">{task.notes}</p>
                      )}

                      {/* Deadline & 2-3 Day Notification Countdown */}
                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                        <span className="flex items-center gap-1.5 text-[#54414e] font-semibold">
                          <i className="fa-solid fa-calendar-days text-[#875c74] text-xs"></i>
                          {formatDateReadable(task.deadline)}
                        </span>

                        {!task.completed && (
                          <span
                            className={`flex items-center gap-1.5 font-black ${
                              isOverdue
                                ? 'text-rose-600'
                                : isDueSoon
                                ? 'text-white bg-[#875c74] border border-[#54414e]/20 px-2.5 py-0.5 rounded-full'
                                : 'text-[#a790a5]'
                            }`}
                          >
                            <i className="fa-solid fa-clock text-xs"></i>
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
                          <span className="font-black text-[#54414e]">
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
                        className="hidden sm:flex items-center gap-1 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-3 py-1 text-xs font-black text-[#c5ebc3] transition shadow-xs"
                        title="Log this payment into expenses"
                      >
                        Log Pay
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-[#a790a5] hover:text-rose-600 p-1.5 transition rounded-lg hover:bg-rose-50"
                      title="Delete task"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
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

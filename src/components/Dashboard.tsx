import React from 'react';
import { MonthlyBudget, TaskItem } from '../types';
import {
  formatINR,
  formatDateReadable,
  calculateBudgetSummary,
  getCategorySpent,
  getDaysUntil
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { SisterFeeEmergencyBanner } from './SisterFeeEmergencyBanner';

interface Props {
  budget: MonthlyBudget;
  onOpenAddPayment: (categoryId?: string) => void;
  onOpenGuide: () => void;
  onSwitchTab: (tab: 'dashboard' | 'planner' | 'tasks' | 'sheet' | 'history') => void;
  onDeleteExpense: (id: string) => void;
  onApplyCrunchMode: () => void;
  onApplyBalancedMode: () => void;
  isCrunchModeActive: boolean;
  tasks?: TaskItem[];
}

export const Dashboard: React.FC<Props> = ({
  budget,
  onOpenAddPayment,
  onSwitchTab,
  onDeleteExpense,
  onApplyCrunchMode,
  onApplyBalancedMode,
  isCrunchModeActive,
  tasks = []
}) => {
  const summary = calculateBudgetSummary(budget);
  const sisterCategory = budget.categories.find(c => c.id === 'sister_fees');
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="space-y-6 text-[#25171a]">
      {/* Month Banner in Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white border border-[#6969b3]/30 px-4 py-3 text-xs text-[#25171a] shadow-xs">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-calendar-days text-[#533a7b] text-sm"></i>
          <span>
            <strong className="text-[#25171a]">Month:</strong> November 2026 (10 Nov – 6 Dec 2026) &nbsp;|&nbsp; <strong className="text-[#25171a]">Next Salary:</strong> 7 Dec 2026 &nbsp;|&nbsp; <strong className="text-[#25171a]">Today:</strong> 10 Nov 2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/Monthly_Budget_Tracker.xlsx"
            download="Monthly_Budget_Tracker.xlsx"
            className="flex items-center gap-1.5 text-[11px] font-black text-[#25171a] hover:text-[#533a7b] transition"
          >
            <i className="fa-solid fa-file-arrow-down text-xs text-[#533a7b]"></i>
            Download Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* Top Sister's Fee Emergency Advisory Banner */}
      <SisterFeeEmergencyBanner
        currentCashLeft={summary.cashLeft}
        salary={budget.salary}
        sisterCategory={sisterCategory}
        onApplyCrunchMode={onApplyCrunchMode}
        onApplyBalancedMode={onApplyBalancedMode}
        isCrunchModeActive={isCrunchModeActive}
      />

      {/* PhD Fees Advisory Notice */}
      <div className="rounded-3xl border border-[#6969b3]/35 bg-white p-4 sm:p-5 shadow-xs text-[#25171a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#533a7b] border border-[#6969b3]/30 ring-2 ring-[#533a7b]/30 shadow-xs">
              <i className="fa-solid fa-wand-magic-sparkles text-base text-[#533a7b]"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-[#98c1d9]/30 border border-[#533a7b]/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#25171a]">
                  Starts January 2027
                </span>
                <span className="text-xs text-[#25171a] font-black">
                  Own PhD Fees: ₹30,000 / semester
                </span>
              </div>
              <p className="text-xs text-[#25171a] mt-0.5 font-semibold">
                Monthly auto-reserve: <strong className="text-[#25171a] underline decoration-[#533a7b]">₹5,000 / month</strong> (₹30,000 ÷ 6 months). Combined education commitment starting Jan: <strong className="text-[#25171a] font-black">₹21,667 / mo</strong> (Sister's ₹16,667 + PhD ₹5,000).
              </p>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('planner')}
            className="shrink-0 rounded-xl border-2 border-[#6969b3]/40 bg-white hover:bg-[#533a7b]/15 px-4 py-1.5 text-xs font-bold text-[#25171a] transition self-start sm:self-center shadow-xs"
          >
            View Plan
          </button>
        </div>
      </div>

      {/* Upcoming Tasks & Deadlines Widget */}
      {pendingTasks.length > 0 && (
        <div className="rounded-3xl border border-[#6969b3]/35 bg-white p-4 sm:p-5 shadow-xs text-[#25171a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#533a7b]/20 text-[#25171a]">
                <i className="fa-solid fa-list-check text-xs"></i>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#25171a]">
                Upcoming Academic & Work Deadlines ({pendingTasks.length})
              </h4>
            </div>
            <button
              onClick={() => onSwitchTab('tasks')}
              className="text-xs font-black text-[#25171a] hover:text-[#533a7b] flex items-center gap-1 transition"
            >
              Open Tasks Page <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {pendingTasks.slice(0, 3).map(task => {
              const days = getDaysUntil(task.deadline);
              const isUrgent = days >= 0 && days <= 3;
              return (
                <div
                  key={task.id}
                  onClick={() => onSwitchTab('tasks')}
                  className={`cursor-pointer rounded-2xl p-3 border transition ${
                    isUrgent
                      ? 'border-[#533a7b] bg-[#533a7b]/10 hover:border-[#25171a]'
                      : 'border-[#6969b3]/30 bg-white hover:border-[#533a7b]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-[#25171a] line-clamp-1">{task.title}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.2 text-[9px] font-black ${
                      isUrgent ? 'bg-[#533a7b] text-white border border-[#533a7b]/20' : 'bg-white border border-[#6969b3]/40 text-[#25171a]'
                    }`}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d left`}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6969b3] font-semibold">
                    <span>{task.category}</span>
                    <span className="text-[#25171a] font-bold">{formatDateReadable(task.deadline)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard 6-Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Cash at month start */}
        <div className="rounded-2xl border border-[#6969b3]/30 bg-white p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#6969b3]">Cash at Start</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            {formatINR(budget.startingBalance)}
          </div>
          <div className="mt-0.5 text-[10px] text-[#6969b3] font-semibold">Starting in hand</div>
        </div>

        {/* Spent this month */}
        <div className="rounded-2xl border border-[#6969b3]/30 bg-white p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#6969b3]">Spent This Month</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            {formatINR(summary.totalSpent)}
          </div>
          <div className="mt-0.5 text-[10px] text-[#6969b3] font-semibold">{budget.expenses.length} payments</div>
        </div>

        {/* Cash Left - Highlight with subtle Powder Blue tint */}
        <div className="rounded-2xl border-2 border-[#98c1d9] bg-gradient-to-b from-white to-[#98c1d9]/25 p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-black text-[#25171a]">Cash Left</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            {formatINR(summary.cashLeft)}
          </div>
          <div className="mt-0.5 text-[10px] text-[#25171a] font-bold">Available right now</div>
        </div>

        {/* Days to salary */}
        <div className="rounded-2xl border border-[#6969b3]/30 bg-white p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#6969b3]">Days to Salary</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            {summary.daysLeft} days
          </div>
          <div className="mt-0.5 text-[10px] text-[#6969b3] font-semibold">Next payday: 7 Dec</div>
        </div>

        {/* Safe to spend / day - Highlight with subtle Indigo tint */}
        <div className="rounded-2xl border-2 border-[#533a7b] bg-gradient-to-b from-white to-[#533a7b]/10 p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-black text-[#25171a]">Safe to Spend / Day</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            ₹{summary.safeToSpendPerDay.toFixed(0)} <span className="text-xs font-normal">/ day</span>
          </div>
          <div className="mt-0.5 text-[10px] text-[#25171a] font-bold">Cash left ÷ Days left</div>
        </div>

        {/* Spent today */}
        <div className="rounded-2xl border border-[#6969b3]/30 bg-white p-3.5 sm:p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#6969b3]">Spent Today</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-[#25171a]">
            {formatINR(summary.spentToday)}
          </div>
          <div className="mt-0.5 text-[10px] text-[#6969b3] font-semibold">10 Nov 2026</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onOpenAddPayment()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-[#98c1d9]/20 border-2 border-[#533a7b] p-3.5 text-xs sm:text-sm font-black text-[#25171a] shadow-xs transition active:scale-95"
        >
          <i className="fa-solid fa-plus text-xs text-[#533a7b]"></i>
          <span>Log Payment Today</span>
        </button>

        <button
          onClick={() => onSwitchTab('tasks')}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#6969b3]/35 bg-white hover:bg-[#533a7b]/15 p-3.5 text-xs sm:text-sm font-bold text-[#25171a] transition active:scale-95 shadow-xs"
        >
          <i className="fa-solid fa-list-check text-xs text-[#533a7b]"></i>
          <span>Tasks & Deadlines</span>
        </button>

        <button
          onClick={() => onSwitchTab('sheet')}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#6969b3]/35 bg-white hover:bg-[#533a7b]/15 p-3.5 text-xs sm:text-sm font-bold text-[#25171a] transition active:scale-95 shadow-xs"
        >
          <i className="fa-solid fa-table-list text-xs text-[#25171a]"></i>
          <span>Single Sheet View</span>
        </button>

        <button
          onClick={() => onSwitchTab('planner')}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#6969b3]/35 bg-white hover:bg-[#533a7b]/15 p-3.5 text-xs sm:text-sm font-bold text-[#25171a] transition active:scale-95 shadow-xs"
        >
          <i className="fa-solid fa-sliders text-xs text-[#533a7b]"></i>
          <span>Adjust Goals</span>
        </button>
      </div>

      {/* Category Budget for This Month */}
      <div className="rounded-3xl border border-[#6969b3]/35 bg-white p-5 sm:p-6 shadow-xs text-[#25171a]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-[#25171a]">Category Budget for This Month</h3>
            <p className="text-xs text-[#6969b3] font-semibold">
              Allocated out of ₹30,000 cash in hand for 27 days until salary arrives
            </p>
          </div>
          <button
            onClick={() => onSwitchTab('planner')}
            className="text-xs font-black text-[#25171a] hover:text-[#533a7b] transition underline"
          >
            Adjust Limits
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {budget.categories.map(cat => {
            const spent = getCategorySpent(budget.expenses, cat.id);
            const remaining = cat.plannedLimit - spent;
            const percent = cat.plannedLimit > 0 ? Math.round((spent / cat.plannedLimit) * 100) : 0;
            const isOver = remaining < 0;
            const dailySafe = summary.daysLeft > 0 ? Math.max(0, remaining) / summary.daysLeft : 0;

            return (
              <div
                key={cat.id}
                onClick={() => onOpenAddPayment(cat.id)}
                className="group cursor-pointer rounded-2xl border border-[#6969b3]/30 bg-[#98c1d9]/10 p-3.5 hover:border-[#533a7b] hover:bg-white transition shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#25171a] border border-[#6969b3]/30 shadow-2xs group-hover:border-[#533a7b] transition">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-[#25171a]">
                          {cat.name}
                        </span>
                        <span className="rounded-full bg-[#533a7b]/20 border border-[#533a7b]/40 px-2 py-0.2 text-[9px] font-black text-[#25171a]">
                          {cat.categoryType}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6969b3] font-semibold">
                        Limit: <strong className="text-[#25171a]">{formatINR(cat.plannedLimit)}</strong> • Normal: {formatINR(cat.normalPlan)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-[#25171a]">
                      {isOver ? `-${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
                    </div>
                    {cat.plannedLimit > 0 && (
                      <div className="text-[10px] font-bold text-[#6969b3]">
                        ₹{dailySafe.toFixed(0)}/day safe
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar with modern gradient */}
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white border border-[#6969b3]/25">
                  <div
                    className="h-full bg-gradient-to-r from-[#533a7b] to-[#98c1d9] transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Payments Feed */}
      <div className="rounded-3xl border border-[#6969b3]/35 bg-white p-5 sm:p-6 shadow-xs text-[#25171a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#533a7b]/20 text-[#25171a]">
              <i className="fa-solid fa-clock text-xs"></i>
            </div>
            <h3 className="text-base font-black text-[#25171a]">Recent Payments</h3>
          </div>
          <button
            onClick={() => onSwitchTab('sheet')}
            className="text-xs font-black text-[#25171a] hover:text-[#533a7b] transition underline"
          >
            View Full Sheet
          </button>
        </div>

        {budget.expenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6969b3] font-bold">
            No payments logged yet this month. Tap <strong>"+ Log Payment Today"</strong> to log an expense!
          </div>
        ) : (
          <div className="space-y-2.5">
            {budget.expenses.slice(-5).reverse().map(exp => {
              const cat = budget.categories.find(c => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-2xl bg-white border border-[#6969b3]/25 p-3.5 hover:border-[#533a7b] transition shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#98c1d9]/20 border border-[#6969b3]/30 text-[#25171a]">
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#25171a]">{exp.title}</div>
                      <div className="text-[11px] text-[#6969b3] font-semibold">
                        {cat?.name} • {formatDateReadable(exp.date)} • {exp.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-black text-[#25171a]">
                      -{formatINR(exp.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-[#6969b3] hover:text-[#533a7b] text-xs p-1 transition"
                      title="Delete transaction"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

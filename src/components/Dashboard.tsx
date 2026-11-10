import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  ShieldAlert,
  CheckSquare,
  Database
} from 'lucide-react';
import { MonthlyBudget, Category, TaskItem } from '../types';
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
  onOpenGuide,
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
    <div className="space-y-6 bg-white text-black">
      {/* Cycle Banner in Coolors Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white border-2 border-[#6d6875] px-4 py-2.5 text-xs text-black shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#b5838d]" />
          <span>
            <strong className="text-black">Cycle 1:</strong> 10 Nov 2026 to 6 Dec 2026 &nbsp;|&nbsp; <strong className="text-black">Next Salary:</strong> 7 Dec 2026 &nbsp;|&nbsp; <strong className="text-black">Today:</strong> 10 Nov 2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/Monthly_Budget_Tracker.xlsx"
            download="Monthly_Budget_Tracker.xlsx"
            className="flex items-center gap-1 text-[11px] font-black text-[#6d6875] hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
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

      {/* PhD Fees Advisory Notice in Coolors Palette */}
      <div className="rounded-2xl border-2 border-[#b5838d] bg-white p-4 shadow-sm text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6d6875] text-[#ffcdb2]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#6d6875] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Starts January 2027
                </span>
                <span className="text-xs text-black font-black">
                  Own PhD Fees: ₹30,000 / semester
                </span>
              </div>
              <p className="text-xs text-black mt-0.5 font-semibold">
                Monthly auto-reserve: <strong className="text-[#b5838d]">₹5,000 / month</strong> (₹30,000 ÷ 6 months). Combined education commitment starting Jan: <strong className="text-black font-black">₹21,667 / mo</strong> (Sister's ₹16,667 + PhD ₹5,000).
              </p>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('planner')}
            className="shrink-0 rounded-xl border-2 border-[#6d6875] bg-white hover:bg-[#ffcdb2]/20 px-3.5 py-1.5 text-xs font-bold text-black transition self-start sm:self-center"
          >
            View Plan
          </button>
        </div>
      </div>

      {/* Pending Tasks & Deadlines Mini Widget */}
      {pendingTasks.length > 0 && (
        <div className="rounded-2xl border-2 border-[#6d6875] bg-white p-4 shadow-sm text-black">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#b5838d]" />
              <h4 className="text-xs sm:text-sm font-black text-black">
                Upcoming Academic & Work Deadlines ({pendingTasks.length})
              </h4>
            </div>
            <button
              onClick={() => onSwitchTab('tasks')}
              className="text-xs font-black text-[#6d6875] hover:underline"
            >
              Open Tasks Tab →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingTasks.slice(0, 4).map(t => {
              const daysLeft = getDaysUntil(t.deadline);
              const isDueSoon = daysLeft <= 3 && daysLeft >= 0;
              return (
                <div
                  key={t.id}
                  onClick={() => onSwitchTab('tasks')}
                  className={`cursor-pointer flex items-center justify-between rounded-xl bg-white border-2 p-2.5 transition ${
                    isDueSoon ? 'border-[#b5838d] ring-1 ring-[#ffb4a2]' : 'border-[#6d6875]/30 hover:border-[#6d6875]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-black text-black truncate">{t.title}</div>
                    <div className="text-[10px] text-black font-semibold">{t.category} • {formatDateReadable(t.deadline)}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isDueSoon ? 'bg-[#ffb4a2] text-black border border-[#b5838d]' : 'bg-[#6d6875] text-white'
                  }`}>
                    {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Excel Dashboard Top Metric Row in Coolors Palette */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Cash at cycle start */}
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-black">Cash at Start</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            {formatINR(budget.startingBalance)}
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">Starting in hand</div>
        </div>

        {/* Spent this cycle */}
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-black">Spent This Cycle</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            {formatINR(summary.totalSpent)}
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">{budget.expenses.length} payments</div>
        </div>

        {/* Cash Left */}
        <div className="rounded-xl border-2 border-[#b5838d] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-[#b5838d]">Cash Left</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            {formatINR(summary.cashLeft)}
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">Available right now</div>
        </div>

        {/* Days to salary */}
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-black">Days to Salary</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            {summary.daysLeft} days
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">Next payday: 7 Dec</div>
        </div>

        {/* Safe to spend / day */}
        <div className="rounded-xl border-2 border-[#b5838d] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-[#b5838d]">Safe to Spend / Day</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            ₹{summary.safeToSpendPerDay.toFixed(0)} <span className="text-xs font-normal">/ day</span>
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">Cash left ÷ Days left</div>
        </div>

        {/* Spent today */}
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-[11px] font-bold text-black">Spent Today</div>
          <div className="mt-1 text-lg sm:text-xl font-black text-black">
            {formatINR(summary.spentToday)}
          </div>
          <div className="mt-0.5 text-[10px] text-black font-semibold">10 Nov 2026</div>
        </div>
      </div>

      {/* Quick Action Shortcuts in Coolors Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onOpenAddPayment()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#6d6875] hover:bg-[#5b5762] p-3 text-xs sm:text-sm font-bold text-white shadow transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Log Payment Today</span>
        </button>

        <button
          onClick={() => onSwitchTab('tasks')}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#b5838d] bg-white hover:bg-[#ffcdb2]/20 p-3 text-xs sm:text-sm font-bold text-black transition active:scale-95"
        >
          <CheckSquare className="h-4 w-4 text-[#b5838d]" />
          <span>Tasks & Deadlines</span>
        </button>

        <button
          onClick={() => onSwitchTab('sheet')}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#6d6875] bg-white hover:bg-[#ffcdb2]/20 p-3 text-xs sm:text-sm font-bold text-black transition active:scale-95"
        >
          <FileSpreadsheet className="h-4 w-4 text-[#6d6875]" />
          <span>Single Sheet View</span>
        </button>

        <button
          onClick={() => onSwitchTab('planner')}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#6d6875] bg-white hover:bg-[#ffcdb2]/20 p-3 text-xs sm:text-sm font-bold text-black transition active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-[#b5838d]" />
          <span>Adjust Goals</span>
        </button>
      </div>

      {/* Category Budget for This Cycle */}
      <div className="rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-sm text-black">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-black">Category Budget for This Cycle</h3>
            <p className="text-xs text-black font-semibold">
              Allocated out of ₹30,000 cash in hand for 27 days until salary arrives
            </p>
          </div>
          <button
            onClick={() => onSwitchTab('planner')}
            className="text-xs font-black text-[#6d6875] hover:underline"
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
                className="group cursor-pointer rounded-xl border-2 border-[#6d6875]/30 bg-white p-3.5 hover:border-[#6d6875] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6d6875] border-2 border-[#6d6875]">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-black">
                          {cat.name}
                        </span>
                        <span className="rounded bg-[#b5838d] px-1 py-0.2 text-[9px] font-bold text-white">
                          {cat.categoryType}
                        </span>
                      </div>
                      <div className="text-[11px] text-black font-semibold">
                        Limit: <strong className="text-black">{formatINR(cat.plannedLimit)}</strong> • Normal: {formatINR(cat.normalPlan)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-black">
                      {isOver ? `-${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
                    </div>
                    {cat.plannedLimit > 0 && (
                      <div className="text-[10px] font-bold text-[#b5838d]">
                        ₹{dailySafe.toFixed(0)}/day safe
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar in Coolors Palette */}
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white border border-[#6d6875]">
                  <div
                    className="h-full bg-[#6d6875] transition-all duration-300"
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Payments Feed */}
      <div className="rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-sm text-black">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#b5838d]" />
            <h3 className="text-base font-black text-black">Recent Payments</h3>
          </div>
          <button
            onClick={() => onSwitchTab('sheet')}
            className="text-xs font-black text-[#6d6875] hover:underline"
          >
            View Full Sheet
          </button>
        </div>

        {budget.expenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-black font-bold">
            No payments logged yet this cycle. Tap <strong>"+ Log Payment Today"</strong> to log an expense!
          </div>
        ) : (
          <div className="space-y-2">
            {budget.expenses.slice(-5).reverse().map(exp => {
              const cat = budget.categories.find(c => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-xl bg-white border border-[#6d6875]/30 p-3 hover:border-[#6d6875] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#6d6875] text-[#6d6875]">
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-black">{exp.title}</div>
                      <div className="text-[11px] text-black font-semibold">
                        {cat?.name} • {formatDateReadable(exp.date)} • {exp.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-black text-black">
                      -{formatINR(exp.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-black hover:text-[#b5838d] text-xs p-1"
                      title="Delete transaction"
                    >
                      ✕
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

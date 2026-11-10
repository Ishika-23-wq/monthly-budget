import React from 'react';
import { MonthlyBudget } from '../types';
import { formatINR } from '../utils/formatters';

interface Props {
  allBudgets: Record<string, MonthlyBudget>;
  activeMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  onCreateNextMonth: (nextMonthKey: string) => void;
}

export const PastMonthsHistory: React.FC<Props> = ({
  allBudgets,
  activeMonthKey,
  onSelectMonth,
  onCreateNextMonth
}) => {
  const budgetList = Object.values(allBudgets).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  const latestMonthKey = budgetList[0]?.monthKey || 'cycle-1';
  const suggestedNextKey = latestMonthKey === 'cycle-1' ? 'cycle-2' : latestMonthKey === 'cycle-2' ? 'cycle-3' : `cycle-${Date.now()}`;
  const suggestedNextName = suggestedNextKey === 'cycle-2' ? 'December 2026' : 'January 2027';

  return (
    <div className="space-y-6 text-[#08090a]">
      {/* Top Banner in Modern Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#8789c0]/35 bg-white p-5 sm:p-6 shadow-xs text-[#08090a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#7cc6fe]/20 border border-[#7cc6fe] px-3 py-0.5 text-xs font-black text-[#08090a]">
              <i className="fa-solid fa-clock-rotate-left text-xs"></i>
              Month-to-Month Rollover & History
            </span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#08090a]">
            Historical Balance & Rollover Tracking
          </h2>
          <p className="text-xs text-[#8789c0] mt-0.5 font-semibold">
            Every rupee left after each month automatically carries forward into the next opening balance.
          </p>
        </div>

        <button
          onClick={() => onCreateNextMonth(suggestedNextKey)}
          className="flex items-center gap-2 rounded-xl bg-[#08090a] hover:bg-[#1a1e24] px-4 py-2.5 text-xs font-black text-[#5dfdcb] shadow-xs transition self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-xs"></i> Start {suggestedNextName}
        </button>
      </div>

      {/* Answer Box in Sky & Ice styling */}
      <div className="rounded-2xl border-2 border-[#7cc6fe] bg-[#7cc6fe]/10 p-4 text-xs text-[#08090a] space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-black text-[#08090a] text-sm">
          <i className="fa-solid fa-circle-check text-[#5dfdcb] text-base"></i>
          Leftover Balance is Fully Maintained & Carried Forward!
        </div>
        <p className="leading-relaxed font-semibold">
          The app tracks the exact opening balance of each month, adds your ₹45,000 salary on the 7th, subtracts what you actually spent across all categories, and transfers whatever remains as the <strong>Opening Balance</strong> for the following month.
        </p>
      </div>

      {/* Month cards list */}
      <div className="space-y-4">
        {budgetList.map(b => {
          const isActive = b.monthKey === activeMonthKey;
          const totalSpent = b.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          const totalLiquid = (b.startingBalance || 0) + (b.salary || 0);
          const closingBalance = totalLiquid - totalSpent;

          return (
            <div
              key={b.monthKey}
              className={`rounded-3xl border p-5 sm:p-6 transition bg-white shadow-xs text-[#08090a] ${
                isActive
                  ? 'border-2 border-[#7cc6fe] ring-2 ring-[#7cc6fe]/20'
                  : 'border-[#8789c0]/35 hover:border-[#7cc6fe]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#08090a] text-[#5dfdcb] ring-2 ring-[#7cc6fe]/20">
                    <i className="fa-solid fa-calendar-days text-base"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#08090a]">{b.monthName}</h3>
                      {isActive && (
                        <span className="rounded-full bg-[#5dfdcb]/25 border border-[#5dfdcb] px-2.5 py-0.5 text-[10px] font-black text-[#08090a]">
                          Active Month
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8789c0] font-semibold mt-0.5">
                      Payday: {b.payday}th • {b.expenses.length} payments recorded
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isActive && (
                    <button
                      onClick={() => onSelectMonth(b.monthKey)}
                      className="flex items-center gap-1.5 rounded-xl border-2 border-[#8789c0]/35 bg-white hover:bg-[#7cc6fe]/15 px-3.5 py-1.5 text-xs font-black text-[#08090a] transition shadow-xs"
                    >
                      View This Month <i className="fa-solid fa-chevron-right text-xs text-[#7cc6fe]"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Financial flow breakdown */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#8789c0]/20">
                <div className="rounded-2xl bg-[#f4faff] p-3.5 border border-[#8789c0]/30">
                  <div className="text-[11px] font-bold text-[#8789c0]">Opening Balance</div>
                  <div className="text-sm sm:text-base font-black text-[#08090a] mt-0.5">
                    {formatINR(b.startingBalance)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f4faff] p-3.5 border border-[#8789c0]/30">
                  <div className="text-[11px] font-bold text-[#8789c0]">+ Salary (7th)</div>
                  <div className="text-sm sm:text-base font-black text-[#08090a] mt-0.5">
                    +{formatINR(b.salary)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f4faff] p-3.5 border border-[#8789c0]/30">
                  <div className="text-[11px] font-bold text-[#8789c0]">- Total Spent</div>
                  <div className="text-sm sm:text-base font-black text-[#08090a] mt-0.5">
                    -{formatINR(totalSpent)}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-[#5dfdcb]/15 p-3.5 border-2 border-[#5dfdcb]">
                  <div className="text-[11px] text-[#08090a] font-black">
                    = Leftover Carried Forward
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#08090a] mt-0.5">
                    {formatINR(closingBalance)}
                  </div>
                </div>
              </div>

              {b.notes && (
                <div className="mt-3 text-xs text-[#8789c0] font-semibold italic bg-[#f4faff] rounded-xl p-2.5 border border-[#8789c0]/25">
                  "{b.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

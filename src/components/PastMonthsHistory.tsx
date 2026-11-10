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
    <div className="space-y-6 text-[#54414e]">
      {/* Top Banner in Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#a790a5]/35 bg-white p-5 sm:p-6 shadow-xs text-[#54414e]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#875c74]/20 border border-[#875c74] px-3 py-0.5 text-xs font-black text-[#54414e]">
              <i className="fa-solid fa-clock-rotate-left text-xs"></i>
              Month-to-Month Rollover & History
            </span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#54414e]">
            Historical Balance & Rollover Tracking
          </h2>
          <p className="text-xs text-[#a790a5] mt-0.5 font-semibold">
            Every rupee left after each month automatically carries forward into the next opening balance.
          </p>
        </div>

        <button
          onClick={() => onCreateNextMonth(suggestedNextKey)}
          className="flex items-center gap-2 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-4 py-2.5 text-xs font-black text-[#c5ebc3] shadow-xs transition self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-xs"></i> Start {suggestedNextName}
        </button>
      </div>

      {/* Answer Box in Palette styling */}
      <div className="rounded-2xl border-2 border-[#875c74] bg-[#875c74]/10 p-4 text-xs text-[#54414e] space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-black text-[#54414e] text-sm">
          <i className="fa-solid fa-circle-check text-[#54414e] text-base"></i>
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
              className={`rounded-3xl border p-5 sm:p-6 transition bg-white shadow-xs text-[#54414e] ${
                isActive
                  ? 'border-2 border-[#875c74] ring-2 ring-[#875c74]/20'
                  : 'border-[#a790a5]/35 hover:border-[#875c74]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#54414e] text-[#c5ebc3] ring-2 ring-[#875c74]/20">
                    <i className="fa-solid fa-calendar-days text-base text-[#c5ebc3]"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#54414e]">{b.monthName}</h3>
                      {isActive && (
                        <span className="rounded-full bg-[#c5ebc3]/30 border border-[#875c74]/40 px-2.5 py-0.5 text-[10px] font-black text-[#54414e]">
                          Active Month
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a790a5] font-semibold mt-0.5">
                      Payday: {b.payday}th • {b.expenses.length} payments recorded
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isActive && (
                    <button
                      onClick={() => onSelectMonth(b.monthKey)}
                      className="flex items-center gap-1.5 rounded-xl border-2 border-[#a790a5]/35 bg-white hover:bg-[#875c74]/15 px-3.5 py-1.5 text-xs font-black text-[#54414e] transition shadow-xs"
                    >
                      View This Month <i className="fa-solid fa-chevron-right text-xs text-[#875c74]"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Financial flow breakdown */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#a790a5]/20">
                <div className="rounded-2xl bg-[#c5ebc3]/15 p-3.5 border border-[#a790a5]/30">
                  <div className="text-[11px] font-bold text-[#a790a5]">Opening Balance</div>
                  <div className="text-sm sm:text-base font-black text-[#54414e] mt-0.5">
                    {formatINR(b.startingBalance)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#c5ebc3]/15 p-3.5 border border-[#a790a5]/30">
                  <div className="text-[11px] font-bold text-[#a790a5]">+ Salary (7th)</div>
                  <div className="text-sm sm:text-base font-black text-[#54414e] mt-0.5">
                    +{formatINR(b.salary)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#c5ebc3]/15 p-3.5 border border-[#a790a5]/30">
                  <div className="text-[11px] font-bold text-[#a790a5]">- Total Spent</div>
                  <div className="text-sm sm:text-base font-black text-[#54414e] mt-0.5">
                    -{formatINR(totalSpent)}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-[#c5ebc3]/25 p-3.5 border-2 border-[#c5ebc3]">
                  <div className="text-[11px] text-[#54414e] font-black">
                    = Leftover Carried Forward
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#54414e] mt-0.5">
                    {formatINR(closingBalance)}
                  </div>
                </div>
              </div>

              {b.notes && (
                <div className="mt-3 text-xs text-[#a790a5] font-semibold italic bg-[#c5ebc3]/15 rounded-xl p-2.5 border border-[#a790a5]/25">
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

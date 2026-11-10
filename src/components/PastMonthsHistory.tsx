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
  const suggestedNextName = suggestedNextKey === 'cycle-2' ? 'Dec 2026' : 'Jan 2027';

  return (
    <div className="space-y-6 text-[#25171a]">
      {/* Top Banner in Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#6969b3]/30 bg-white p-5 sm:p-6 shadow-xs text-[#25171a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#533a7b]/15 border border-[#533a7b] px-3 py-0.5 text-xs font-black text-[#25171a]">
              <i className="fa-solid fa-clock-rotate-left text-xs"></i>
              Month-to-Month Rollover & History
            </span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#25171a]">
            Historical Balance & Rollover Tracking
          </h2>
          <p className="text-xs text-[#6969b3] mt-0.5 font-semibold">
            Every rupee left after each month automatically carries forward into the next opening balance.
          </p>
        </div>

        <button
          onClick={() => onCreateNextMonth(suggestedNextKey)}
          className="flex items-center gap-2 rounded-xl bg-white hover:bg-[#98c1d9]/20 border-2 border-[#533a7b] px-4 py-2.5 text-xs font-black text-[#25171a] shadow-xs transition self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-xs text-[#533a7b]"></i> Start {suggestedNextName}
        </button>
      </div>

      {/* Answer Box in Palette styling */}
      <div className="rounded-2xl border-2 border-[#533a7b] bg-[#533a7b]/10 p-4 text-xs text-[#25171a] space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-black text-[#25171a] text-sm">
          <i className="fa-solid fa-circle-check text-[#25171a] text-base"></i>
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
              className={`rounded-3xl border p-5 sm:p-6 transition bg-white shadow-xs text-[#25171a] ${
                isActive
                  ? 'border-2 border-[#533a7b] ring-2 ring-[#533a7b]/20'
                  : 'border-[#6969b3]/30 hover:border-[#533a7b]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#533a7b] border border-[#6969b3]/30 ring-2 ring-[#533a7b]/20">
                    <i className="fa-solid fa-calendar-days text-base text-[#533a7b]"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#25171a]">{b.monthName}</h3>
                      {isActive && (
                        <span className="rounded-full bg-[#98c1d9]/30 border border-[#533a7b]/40 px-2.5 py-0.5 text-[10px] font-black text-[#25171a]">
                          Active Month
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6969b3] font-semibold mt-0.5">
                      Payday: {b.payday}th • {b.expenses.length} payments recorded
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isActive && (
                    <button
                      onClick={() => onSelectMonth(b.monthKey)}
                      className="flex items-center gap-1.5 rounded-xl border-2 border-[#6969b3]/30 bg-white hover:bg-[#98c1d9]/20 px-3.5 py-1.5 text-xs font-black text-[#25171a] transition shadow-xs"
                    >
                      View This Month <i className="fa-solid fa-chevron-right text-xs text-[#533a7b]"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Financial flow breakdown */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#6969b3]/20">
                <div className="rounded-2xl bg-[#98c1d9]/15 p-3.5 border border-[#6969b3]/30">
                  <div className="text-[11px] font-bold text-[#6969b3]">Opening Balance</div>
                  <div className="text-sm sm:text-base font-black text-[#25171a] mt-0.5">
                    {formatINR(b.startingBalance)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#98c1d9]/15 p-3.5 border border-[#6969b3]/30">
                  <div className="text-[11px] font-bold text-[#6969b3]">+ Salary (7th)</div>
                  <div className="text-sm sm:text-base font-black text-[#25171a] mt-0.5">
                    +{formatINR(b.salary)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#98c1d9]/15 p-3.5 border border-[#6969b3]/30">
                  <div className="text-[11px] font-bold text-[#6969b3]">- Total Spent</div>
                  <div className="text-sm sm:text-base font-black text-[#25171a] mt-0.5">
                    -{formatINR(totalSpent)}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-[#98c1d9]/25 p-3.5 border-2 border-[#98c1d9]">
                  <div className="text-[11px] text-[#25171a] font-black">
                    = Leftover Carried Forward
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#25171a] mt-0.5">
                    {formatINR(closingBalance)}
                  </div>
                </div>
              </div>

              {b.notes && (
                <div className="mt-3 text-xs text-[#6969b3] font-semibold italic bg-[#98c1d9]/15 rounded-xl p-2.5 border border-[#6969b3]/25">
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

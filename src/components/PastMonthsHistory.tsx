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
    <div className="space-y-6 bg-white text-black">
      {/* Top Banner: Pure White Background, Black Text, #6d6875 Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-sm text-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-[#6d6875] px-2.5 py-0.5 text-xs font-bold text-white">
              <i className="fa-solid fa-clock-rotate-left text-xs"></i>
              Month-to-Month Rollover & History
            </span>
          </div>
          <h2 className="mt-1 text-xl font-black text-black">
            Historical Balance & Rollover Tracking
          </h2>
          <p className="text-xs text-black mt-0.5 font-semibold">
            Every rupee left after each month automatically carries forward into the next opening balance.
          </p>
        </div>

        <button
          onClick={() => onCreateNextMonth(suggestedNextKey)}
          className="flex items-center gap-2 rounded-xl bg-[#6d6875] hover:bg-[#595460] px-4 py-2.5 text-xs font-bold text-white shadow transition self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-xs"></i> Start {suggestedNextName}
        </button>
      </div>

      {/* Answer Box in White & Black */}
      <div className="rounded-xl border-2 border-[#6d6875] bg-white p-4 text-xs text-black space-y-1.5">
        <div className="flex items-center gap-2 font-black text-black text-sm">
          <i className="fa-solid fa-circle-check text-[#6d6875] text-base"></i>
          Leftover Balance is Fully Maintained & Carried Forward!
        </div>
        <p className="leading-relaxed font-semibold">
          The app tracks the exact opening balance of each month, adds your ₹45,000 salary on the 7th, subtracts what you actually spent across all categories, and transfers whatever remains as the <strong>Opening Balance</strong> for the following month.
        </p>
      </div>

      {/* Month cards list in Pure White & Black */}
      <div className="space-y-4">
        {budgetList.map(b => {
          const isActive = b.monthKey === activeMonthKey;
          const totalSpent = b.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          const totalLiquid = (b.startingBalance || 0) + (b.salary || 0);
          const closingBalance = totalLiquid - totalSpent;

          return (
            <div
              key={b.monthKey}
              className={`rounded-2xl border-2 p-5 transition bg-white shadow-sm text-black ${
                isActive
                  ? 'border-[#6d6875] ring-2 ring-[#6d6875]/20'
                  : 'border-[#6d6875]/30 hover:border-[#6d6875]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6d6875] text-white">
                    <i className="fa-solid fa-calendar-days text-lg"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-black">{b.monthName}</h3>
                      {isActive && (
                        <span className="rounded-full bg-[#6d6875] px-2 py-0.5 text-[10px] font-bold text-white">
                          Active Month
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-black font-semibold mt-0.5">
                      Payday: {b.payday}th • {b.expenses.length} payments recorded
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isActive && (
                    <button
                      onClick={() => onSelectMonth(b.monthKey)}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-[#6d6875] bg-white hover:bg-[#6d6875]/10 px-3 py-1.5 text-xs font-black text-black transition"
                    >
                      View This Month <i className="fa-solid fa-chevron-right text-xs text-[#6d6875]"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Financial flow breakdown in Pure White & Black */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t-2 border-[#6d6875]/20">
                <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]/40">
                  <div className="text-[11px] font-bold text-black">Opening Balance</div>
                  <div className="text-sm font-black text-black mt-0.5">
                    {formatINR(b.startingBalance)}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]/40">
                  <div className="text-[11px] font-bold text-black">+ Salary (7th)</div>
                  <div className="text-sm font-black text-black mt-0.5">
                    +{formatINR(b.salary)}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]/40">
                  <div className="text-[11px] font-bold text-black">- Total Spent</div>
                  <div className="text-sm font-black text-black mt-0.5">
                    -{formatINR(totalSpent)}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]">
                  <div className="text-[11px] text-[#6d6875] font-black">
                    = Leftover Carried Forward
                  </div>
                  <div className="text-sm font-black text-[#6d6875] mt-0.5">
                    {formatINR(closingBalance)}
                  </div>
                </div>
              </div>

              {b.notes && (
                <div className="mt-3 text-xs text-black font-semibold italic bg-white rounded-lg p-2 border border-[#6d6875]">
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

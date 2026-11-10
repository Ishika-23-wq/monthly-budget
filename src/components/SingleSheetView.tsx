import React, { useState } from 'react';
import { Expense, MonthlyBudget } from '../types';
import { formatINR, formatDateReadable } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  budget: MonthlyBudget;
  onDeleteExpense: (expenseId: string) => void;
  onQuickAddPayment: (categoryId: string) => void;
}

export const SingleSheetView: React.FC<Props> = ({
  budget,
  onDeleteExpense,
  onQuickAddPayment
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const totalPlanned = budget.categories.reduce((s, c) => s + (c.plannedLimit || 0), 0);
  const totalSpent = budget.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalRemaining = totalPlanned - totalSpent;

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `FINTRACK MONTHLY BUDGET & EXPENSE SHEET - ${budget.monthName}\n`;
    csvContent += `Monthly Salary,₹${budget.salary}\n`;
    csvContent += `Starting Cash Balance,₹${budget.startingBalance}\n`;
    csvContent += `Total Planned Budget,₹${totalPlanned}\n`;
    csvContent += `Total Actual Spent,₹${totalSpent}\n`;
    csvContent += `Remaining Buffer,₹${totalRemaining}\n\n`;

    budget.categories.forEach(cat => {
      const catExpenses = budget.expenses.filter(e => e.categoryId === cat.id);
      const catSpent = catExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      csvContent += `SECTION: ${cat.name.toUpperCase()} (${cat.categoryType})\n`;
      csvContent += `Limit,₹${cat.plannedLimit},Spent,₹${catSpent},Remaining,₹${cat.plannedLimit - catSpent}\n`;
      csvContent += `Date,Description,Payment Method,Amount (₹),Notes\n`;

      if (catExpenses.length === 0) {
        csvContent += `No expenses logged yet,,,,\n`;
      } else {
        catExpenses.forEach(exp => {
          csvContent += `"${exp.date}","${exp.title.replace(/"/g, '""')}","${exp.paymentMethod}","${exp.amount}","${(exp.notes || '').replace(/"/g, '""')}"\n`;
        });
      }
      csvContent += `\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_Sheet_${budget.monthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-[#54414e]">
      {/* Top Banner in Palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#a790a5]/35 bg-white p-5 sm:p-6 shadow-xs text-[#54414e]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#875c74]/20 border border-[#875c74] px-3 py-0.5 text-xs font-black text-[#54414e]">
              <i className="fa-solid fa-table-list text-xs"></i>
              Categorized Ledger Sheet
            </span>
            <span className="text-xs font-black text-[#a790a5]">{budget.monthName}</span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#54414e]">
            Single Sheet Expense Manager
          </h2>
          <p className="text-xs text-[#a790a5] mt-0.5 font-semibold">
            Every category has its own dedicated section with planned limit, spent amount, and payment log.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-4 py-2.5 text-xs font-black text-[#c5ebc3] shadow-xs transition self-start sm:self-center"
        >
          <i className="fa-solid fa-file-arrow-down text-xs"></i>
          Export to CSV / Excel
        </button>
      </div>

      {/* Spreadsheet Master Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#a790a5]/30 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-[#a790a5]">Total Planned Limit</div>
          <div className="text-lg sm:text-xl font-black text-[#54414e] mt-0.5">{formatINR(totalPlanned)}</div>
        </div>
        <div className="rounded-2xl border border-[#a790a5]/30 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-[#a790a5]">Total Actual Spent</div>
          <div className="text-lg sm:text-xl font-black text-[#54414e] mt-0.5">{formatINR(totalSpent)}</div>
        </div>
        <div className="rounded-2xl border-2 border-[#c5ebc3] bg-gradient-to-b from-white to-[#c5ebc3]/20 p-4 shadow-xs">
          <div className="text-xs font-black text-[#54414e]">Remaining Buffer</div>
          <div className={`text-lg sm:text-xl font-black mt-0.5 ${totalRemaining < 0 ? 'text-rose-600' : 'text-[#54414e]'}`}>
            {formatINR(totalRemaining)}
          </div>
        </div>
        <div className="rounded-2xl border border-[#a790a5]/30 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-[#a790a5]">Starting Cash (Nov 10)</div>
          <div className="text-lg sm:text-xl font-black text-[#54414e] mt-0.5">{formatINR(budget.startingBalance)}</div>
        </div>
      </div>

      {/* Category Sections in Single Sheet */}
      <div className="space-y-4">
        {budget.categories.map(category => {
          const catExpenses = budget.expenses.filter(e => e.categoryId === category.id);
          const spent = catExpenses.reduce((s, e) => s + (e.amount || 0), 0);
          const remaining = category.plannedLimit - spent;
          const isOver = remaining < 0;
          const percentUsed = category.plannedLimit > 0 ? Math.round((spent / category.plannedLimit) * 100) : 0;
          const isCollapsed = collapsedCategories[category.id] ?? false;

          return (
            <div
              key={category.id}
              className="rounded-3xl border border-[#a790a5]/30 bg-white transition overflow-hidden shadow-xs hover:border-[#875c74] text-[#54414e]"
            >
              {/* Category Header Bar */}
              <div
                onClick={() => toggleCategory(category.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer select-none bg-white hover:bg-[#875c74]/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#54414e] text-[#c5ebc3] ring-2 ring-[#875c74]/25 shadow-xs">
                    <CategoryIcon name={category.icon} className="w-5 h-5 text-[#c5ebc3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-[#54414e]">{category.name}</h3>
                      <span className="rounded-full bg-[#875c74]/20 border border-[#875c74]/50 px-2 py-0.2 text-[9px] font-black text-[#54414e] uppercase">
                        {category.categoryType}
                      </span>
                    </div>
                    <div className="text-xs text-[#a790a5] font-semibold mt-0.5">
                      {catExpenses.length} transaction{catExpenses.length !== 1 ? 's' : ''} logged
                    </div>
                  </div>
                </div>

                {/* Right Side Stats & Add button */}
                <div className="flex items-center justify-between sm:justify-end gap-4" onClick={e => e.stopPropagation()}>
                  <div className="text-right">
                    <div className="text-xs text-[#a790a5] font-semibold">
                      Limit: <span className="font-black text-[#54414e]">{formatINR(category.plannedLimit)}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#a790a5]">
                      Spent: <span className="font-black text-[#54414e]">{formatINR(spent)}</span> •{' '}
                      <span className={isOver ? 'text-rose-600 font-black' : 'text-[#54414e] font-black'}>
                        {isOver ? `Over by ${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickAddPayment(category.id)}
                    className="flex items-center gap-1 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-3 py-1.5 text-xs font-black text-[#c5ebc3] shadow-xs transition"
                    title="Add payment to this category"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span className="hidden sm:inline">Add</span>
                  </button>

                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1.5 text-[#a790a5] hover:text-[#54414e] transition"
                  >
                    <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-sm`}></i>
                  </button>
                </div>
              </div>

              {/* Progress Bar with vibrant gradient */}
              <div className="h-1.5 w-full bg-[#c5ebc3]/20 border-y border-[#a790a5]/20">
                <div
                  className="h-full bg-gradient-to-r from-[#875c74] to-[#c5ebc3] transition-all duration-300"
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>

              {/* Transactions Table Section */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 bg-white">
                  {catExpenses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#a790a5] font-bold">
                      No payments logged in {category.name} yet.{' '}
                      <button
                        onClick={() => onQuickAddPayment(category.id)}
                        className="text-[#54414e] hover:text-[#875c74] font-black underline ml-1"
                      >
                        + Add one now
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#54414e]">
                        <thead>
                          <tr className="border-b border-[#a790a5]/25 text-[#a790a5] font-bold">
                            <th className="pb-2.5">Date</th>
                            <th className="pb-2.5">Description / What was paid</th>
                            <th className="pb-2.5">Method</th>
                            <th className="pb-2.5 text-right">Amount</th>
                            <th className="pb-2.5 text-center w-12">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {catExpenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-[#875c74]/10 transition text-[#54414e]">
                              <td className="py-3 font-semibold whitespace-nowrap text-[#a790a5]">
                                {formatDateReadable(exp.date)}
                              </td>
                              <td className="py-3 font-bold text-[#54414e]">
                                {exp.title}
                                {exp.notes && (
                                  <span className="block text-[11px] text-[#a790a5] font-normal">
                                    {exp.notes}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 whitespace-nowrap">
                                <span className="rounded-full bg-[#c5ebc3]/20 border border-[#a790a5]/30 px-2 py-0.5 text-[10px] font-bold text-[#54414e]">
                                  {exp.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3 text-right font-black text-[#54414e] whitespace-nowrap">
                                {formatINR(exp.amount)}
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => onDeleteExpense(exp.id)}
                                  className="text-[#a790a5] hover:text-rose-600 p-1 transition"
                                  title="Delete transaction"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-[#a790a5]/30 font-black text-[#54414e]">
                            <td colSpan={3} className="py-3 text-right font-black">
                              Total Spent in {category.name}:
                            </td>
                            <td className="py-3 text-right font-black">
                              {formatINR(spent)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

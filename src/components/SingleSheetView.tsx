import React, { useState } from 'react';
import { Category, Expense, MonthlyBudget } from '../types';
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
    <div className="space-y-6 bg-white text-black">
      {/* Top Banner: Pure White Background, Black Text, #6d6875 Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-[#6d6875] bg-white p-5 shadow-sm text-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-[#6d6875] px-2.5 py-0.5 text-xs font-bold text-white">
              <i className="fa-solid fa-table-list text-xs"></i>
              Categorized Ledger Sheet
            </span>
            <span className="text-xs font-black text-black">{budget.monthName}</span>
          </div>
          <h2 className="mt-1 text-xl font-black text-black">
            Single Sheet Expense Manager
          </h2>
          <p className="text-xs text-black mt-0.5 font-semibold">
            Every category has its own dedicated section with planned limit, spent amount, and payment log.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl bg-[#6d6875] hover:bg-[#595460] px-4 py-2.5 text-xs font-bold text-white shadow transition self-start sm:self-center"
        >
          <i className="fa-solid fa-file-arrow-down text-xs"></i>
          Export to CSV / Excel
        </button>
      </div>

      {/* Spreadsheet Master Summary Row in Pure White & Black */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-xs font-bold text-black">Total Planned Limit</div>
          <div className="text-lg font-black text-black mt-0.5">{formatINR(totalPlanned)}</div>
        </div>
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-xs font-bold text-black">Total Actual Spent</div>
          <div className="text-lg font-black text-black mt-0.5">{formatINR(totalSpent)}</div>
        </div>
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-xs font-bold text-black">Remaining Buffer</div>
          <div className={`text-lg font-black mt-0.5 ${totalRemaining < 0 ? 'text-rose-600' : 'text-[#6d6875]'}`}>
            {formatINR(totalRemaining)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-[#6d6875] bg-white p-3.5 shadow-sm text-black">
          <div className="text-xs font-bold text-black">Starting Cash (Nov 10)</div>
          <div className="text-lg font-black text-black mt-0.5">{formatINR(budget.startingBalance)}</div>
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
              className="rounded-2xl border-2 border-[#6d6875] bg-white transition overflow-hidden shadow-sm text-black"
            >
              {/* Category Header Bar in White & Black */}
              <div
                onClick={() => toggleCategory(category.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer select-none bg-white hover:bg-[#6d6875]/5 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6d6875] text-white">
                    <CategoryIcon name={category.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-black">{category.name}</h3>
                      <span className="rounded bg-[#6d6875] px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                        {category.categoryType}
                      </span>
                    </div>
                    <div className="text-xs text-black font-semibold mt-0.5">
                      {catExpenses.length} transaction{catExpenses.length !== 1 ? 's' : ''} logged
                    </div>
                  </div>
                </div>

                {/* Right Side Stats & Add button */}
                <div className="flex items-center justify-between sm:justify-end gap-4" onClick={e => e.stopPropagation()}>
                  <div className="text-right">
                    <div className="text-xs text-black font-semibold">
                      Limit: <span className="font-black text-black">{formatINR(category.plannedLimit)}</span>
                    </div>
                    <div className="text-xs">
                      Spent: <span className="font-black text-black">{formatINR(spent)}</span> •{' '}
                      <span className={isOver ? 'text-rose-600 font-black' : 'text-[#6d6875] font-black'}>
                        {isOver ? `Over by ${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickAddPayment(category.id)}
                    className="flex items-center gap-1 rounded-lg bg-[#6d6875] hover:bg-[#595460] px-2.5 py-1.5 text-xs font-bold text-white shadow transition"
                    title="Add payment to this category"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span className="hidden sm:inline">Add</span>
                  </button>

                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 text-black hover:text-[#6d6875]"
                  >
                    <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-sm`}></i>
                  </button>
                </div>
              </div>

              {/* Progress Bar in #6d6875 */}
              <div className="h-2 w-full bg-white border-y border-[#6d6875]">
                <div
                  className="h-full bg-[#6d6875] transition-all duration-300"
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>

              {/* Transactions Table Section in Pure White & Black */}
              {!isCollapsed && (
                <div className="p-4 bg-white">
                  {catExpenses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-black font-bold">
                      No payments logged in {category.name} yet.{' '}
                      <button
                        onClick={() => onQuickAddPayment(category.id)}
                        className="text-[#6d6875] font-black underline ml-1"
                      >
                        + Add one now
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-black">
                        <thead>
                          <tr className="border-b-2 border-[#6d6875] text-black font-black">
                            <th className="pb-2 font-black">Date</th>
                            <th className="pb-2 font-black">Description / What was paid</th>
                            <th className="pb-2 font-black">Method</th>
                            <th className="pb-2 text-right font-black">Amount</th>
                            <th className="pb-2 text-center font-black w-12">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {catExpenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-[#6d6875]/5 transition text-black">
                              <td className="py-2.5 text-black font-semibold whitespace-nowrap">
                                {formatDateReadable(exp.date)}
                              </td>
                              <td className="py-2.5 font-bold text-black">
                                {exp.title}
                                {exp.notes && (
                                  <span className="block text-[11px] text-black font-normal">
                                    {exp.notes}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-black whitespace-nowrap">
                                <span className="rounded bg-white border border-[#6d6875] px-2 py-0.5 text-[10px] font-bold text-black">
                                  {exp.paymentMethod}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-black text-black whitespace-nowrap">
                                {formatINR(exp.amount)}
                              </td>
                              <td className="py-2.5 text-center">
                                <button
                                  onClick={() => onDeleteExpense(exp.id)}
                                  className="text-black hover:text-rose-600 p-1 transition"
                                  title="Delete transaction"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-[#6d6875] font-black text-black">
                            <td colSpan={3} className="py-2.5 text-right font-black text-black">
                              Total Spent in {category.name}:
                            </td>
                            <td className="py-2.5 text-right font-black text-black">
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

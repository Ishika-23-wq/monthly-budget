import React, { useState, useEffect } from 'react';
import { Category, Expense } from '../types';
import { formatINR, getTodayDateString, getCategorySpent } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_GUIDE_DATABASE } from '../constants/defaultData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onOpenGuide: () => void;
  preselectedCategoryId?: string;
}

export const DailyPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  expenses,
  onAddExpense,
  onOpenGuide,
  preselectedCategoryId
}) => {
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('UPI');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [detectedSuggestion, setDetectedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedCategoryId) {
      setCategoryId(preselectedCategoryId);
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [preselectedCategoryId, categories]);

  // Smart auto-detection based on user typing
  useEffect(() => {
    if (!title) {
      setDetectedSuggestion(null);
      return;
    }
    const lower = title.toLowerCase();

    for (const guide of CATEGORY_GUIDE_DATABASE) {
      const match = guide.exampleKeywords.some(kw => lower.includes(kw));
      if (match) {
        const foundCategory = categories.find(c =>
          c.name.toLowerCase().includes(guide.recommendedCategory.toLowerCase()) ||
          guide.recommendedCategory.toLowerCase().includes(c.name.toLowerCase())
        );
        if (foundCategory) {
          setDetectedSuggestion(
            `Smart Match: "${foundCategory.name}" recommended for this payment`
          );
          setCategoryId(foundCategory.id);
          return;
        }
      }
    }
    setDetectedSuggestion(null);
  }, [title, categories]);

  if (!isOpen) return null;

  const currentCategory = categories.find(c => c.id === categoryId);
  const spentInCategory = currentCategory ? getCategorySpent(expenses, currentCategory.id) : 0;
  const numAmount = parseFloat(amount) || 0;
  const willExceed = currentCategory && (spentInCategory + numAmount > currentCategory.plannedLimit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) return;
    if (!title.trim()) return;

    onAddExpense({
      date,
      amount: numAmount,
      categoryId,
      title: title.trim(),
      paymentMethod,
      notes: notes.trim() ? notes.trim() : undefined
    });

    setAmount('');
    setTitle('');
    setNotes('');
    onClose();
  };

  const handleQuickAdd = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn text-black">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border-2 border-[#6d6875] bg-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-[#6d6875]/20 px-5 py-4 bg-white">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5838d]">
              Today's Payment
            </span>
            <h2 className="text-lg font-black text-black">Log Daily Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-black hover:bg-slate-100 transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-black">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Amount Spent (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[#6d6875]">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="w-full rounded-2xl border-2 border-[#6d6875] bg-white py-3.5 pl-10 pr-4 text-2xl font-black text-black placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[50, 100, 200, 500, 1000, 2000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className="rounded-lg border-2 border-[#6d6875] bg-white px-2.5 py-1 text-xs font-black text-black hover:bg-[#ffcdb2]/20 active:scale-95 transition"
                >
                  +{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="rounded-lg border border-[#e5989b] bg-white px-2.5 py-1 text-xs font-black text-[#b5838d] transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Title with smart detection */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              What did you pay for? (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Zara shopping, dinner with friends, metro card, Blinkit milk"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border-2 border-[#6d6875] bg-white py-2.5 px-3.5 text-sm text-black placeholder-slate-400 focus:outline-none"
            />
            {detectedSuggestion && (
              <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-white border-2 border-[#b5838d] px-3 py-1.5 text-xs text-[#6d6875] font-bold animate-fadeIn">
                <i className="fa-solid fa-wand-magic-sparkles text-xs text-[#b5838d] shrink-0"></i>
                <span>{detectedSuggestion}</span>
              </div>
            )}
          </div>

          {/* Category selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-black">
                Expense Category *
              </label>
              <button
                type="button"
                onClick={onOpenGuide}
                className="flex items-center gap-1 text-[11px] font-black text-[#b5838d] hover:underline"
              >
                <i className="fa-solid fa-circle-question text-xs"></i>
                Which category? (Guide)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {categories.map(cat => {
                const isSelected = cat.id === categoryId;
                const spent = getCategorySpent(expenses, cat.id);
                const left = cat.plannedLimit - spent;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left border-2 transition ${
                      isSelected
                        ? 'border-[#6d6875] bg-[#6d6875] text-white'
                        : 'border-[#6d6875]/30 bg-white text-black hover:border-[#6d6875]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white border border-[#6d6875] text-[#6d6875]'}`}>
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black truncate">{cat.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-white' : 'text-black'}`}>
                        Left: {formatINR(left)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Over-budget warning */}
            {willExceed && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white border-2 border-[#b5838d] p-2.5 text-xs text-black">
                <i className="fa-solid fa-triangle-exclamation text-sm text-[#b5838d] shrink-0"></i>
                <div>
                  <strong>Budget Alert:</strong> This expense exceeds the planned limit for{' '}
                  <span className="font-black underline">{currentCategory?.name}</span>.
                </div>
              </div>
            )}
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Date of Payment
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white py-2 px-3 text-xs text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as Expense['paymentMethod'])}
                className="w-full rounded-xl border-2 border-[#6d6875] bg-white py-2 px-3 text-xs text-black focus:outline-none"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split with friend, receipt in email"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl border-2 border-[#6d6875] bg-white py-2 px-3 text-xs text-black placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6d6875] hover:bg-[#5b5762] py-3 text-sm font-bold text-white shadow-lg transition active:scale-[0.99]"
            >
              <i className="fa-solid fa-plus text-xs"></i> Save Payment (₹{amount || '0'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

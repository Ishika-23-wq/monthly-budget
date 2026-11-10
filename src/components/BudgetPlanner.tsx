import React, { useState } from 'react';
import { Category, PriorityLevel, CategoryGroupType } from '../types';
import { formatINR } from '../utils/formatters';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';

interface Props {
  categories: Category[];
  salary: number;
  payday: number;
  onUpdateCategoryLimit: (categoryId: string, newLimit: number) => void;
  onAddCustomCategory: (cat: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onApplyCrunchMode: () => void;
  onApplyBalancedMode: () => void;
  isCrunchModeActive: boolean;
}

export const BudgetPlanner: React.FC<Props> = ({
  categories,
  salary,
  onUpdateCategoryLimit,
  onAddCustomCategory,
  onDeleteCategory
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');
  const [newCatNormal, setNewCatNormal] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryGroupType>('Flexible');
  const [newCatPriority, setNewCatPriority] = useState<PriorityLevel>('medium');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatIsSinking, setNewCatIsSinking] = useState(false);

  const totalMonthLimit = categories.reduce((sum, c) => sum + (c.plannedLimit || 0), 0);
  const totalNormalPlan = categories.reduce((sum, c) => sum + (c.normalPlan || 0), 0);
  const cashInHand = 30000;
  const monthBuffer = cashInHand - totalMonthLimit;
  const normalBuffer = salary - totalNormalPlan;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const limit = parseFloat(newCatLimit) || 0;
    const normal = parseFloat(newCatNormal) || limit;

    onAddCustomCategory({
      id: `custom_${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon,
      color: 'slate',
      categoryType: newCatType,
      normalPlan: normal,
      plannedLimit: limit,
      priority: newCatPriority,
      isSinkingFund: newCatIsSinking,
      isCustom: true
    });

    setNewCatName('');
    setNewCatLimit('');
    setNewCatNormal('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-[#25171a]">
      {/* Header card in Palette */}
      <div className="rounded-3xl border border-[#6969b3]/35 bg-white p-5 sm:p-6 shadow-xs text-[#25171a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#533a7b]/20 border border-[#533a7b] px-3 py-0.5 text-xs font-black text-[#25171a]">
                Categories & Dual Limits
              </span>
              <span className="text-xs font-black text-[#6969b3]">
                Nov 2026 (10 Nov – 6 Dec 2026)
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#25171a]">
              Target Goals & Budget Planner
            </h2>
            <p className="text-xs text-[#6969b3] mt-0.5 font-semibold">
              Compare <strong>This Month Limit</strong> (out of ₹30K cash) vs <strong>Normal Monthly Plan</strong> (out of ₹45K salary).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/Monthly_Budget_Tracker.xlsx"
              download="Monthly_Budget_Tracker.xlsx"
              className="flex items-center gap-1.5 rounded-xl border-2 border-[#6969b3]/35 bg-white hover:bg-[#533a7b]/15 px-3.5 py-2 text-xs font-bold text-[#25171a] transition shadow-xs"
            >
              <i className="fa-solid fa-file-arrow-down text-xs text-[#533a7b]"></i>
              Download Excel
            </a>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-[#98c1d9]/20 border-2 border-[#533a7b] px-4 py-2 text-xs font-black text-[#25171a] transition shadow-xs"
            >
              <i className="fa-solid fa-plus text-xs text-[#533a7b]"></i> Add Category
            </button>
          </div>
        </div>

        {/* Dual Comparison Status Bars */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-2xl bg-gradient-to-b from-white to-[#98c1d9]/25 p-4 sm:p-5 border-2 border-[#98c1d9] text-[#25171a] shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#25171a] font-black uppercase text-[11px] tracking-wider">This Month (10 Nov – 6 Dec)</span>
              <span className="text-[#6969b3]">Cash in hand: ₹30,000</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-[#25171a]">
                Allocated: {formatINR(totalMonthLimit)}
              </div>
              <div className={`text-xs font-black ${monthBuffer < 0 ? 'text-rose-600' : 'text-[#25171a]'}`}>
                {monthBuffer === 0 ? 'Exact Match (₹30K)' : `${formatINR(monthBuffer)} buffer`}
              </div>
            </div>
            <div className="text-[11px] text-[#6969b3] mt-1.5 font-semibold">
              ₹15K to Sister fees + ₹15K for groceries, travel, bills & iPhone EMI
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-white to-[#533a7b]/10 p-4 sm:p-5 border-2 border-[#533a7b] text-[#25171a] shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#25171a] font-black uppercase text-[11px] tracking-wider">Normal Monthly Plan (Post-Dec 7)</span>
              <span className="text-[#6969b3]">Salary: ₹45,000</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-[#25171a]">
                Allocated: {formatINR(totalNormalPlan)}
              </div>
              <div className={`text-xs font-black ${normalBuffer < 0 ? 'text-rose-600' : 'text-[#25171a]'}`}>
                {normalBuffer === 0 ? 'Exact Match (₹45K)' : `${formatINR(normalBuffer)} buffer`}
              </div>
            </div>
            <div className="text-[11px] text-[#6969b3] mt-1.5 font-semibold">
              ₹16,667 Sister fees + ₹5K PhD + ₹5K travel + ₹8K rent + ₹3.5K grocery
            </div>
          </div>
        </div>
      </div>

      {/* Category List with Dual Limits */}
      <div className="space-y-3">
        <h3 className="font-black text-[#25171a] text-base">
          All 11 Categories & Allocations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories.map(cat => (
            <CategoryPlanCard
              key={cat.id}
              category={cat}
              onUpdate={onUpdateCategoryLimit}
              onDelete={cat.isCustom ? () => onDeleteCategory(cat.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Modal for adding custom category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn text-[#25171a]">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#6969b3]/35 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-[#25171a]">Add New Expense Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6969b3] hover:text-[#25171a]"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#25171a] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical / Doctor, Books"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#6969b3]/35 bg-white p-2.5 text-sm text-[#25171a] focus:border-[#533a7b] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#25171a] mb-1">
                    This Month Limit (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000"
                    value={newCatLimit}
                    onChange={e => setNewCatLimit(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#6969b3]/35 bg-white p-2 text-xs text-[#25171a] focus:border-[#533a7b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25171a] mb-1">
                    Normal Monthly Plan (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={newCatNormal}
                    onChange={e => setNewCatNormal(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#6969b3]/35 bg-white p-2 text-xs text-[#25171a] focus:border-[#533a7b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#25171a] mb-1">
                    Type
                  </label>
                  <select
                    value={newCatType}
                    onChange={e => setNewCatType(e.target.value as CategoryGroupType)}
                    className="w-full rounded-xl border-2 border-[#6969b3]/35 bg-white p-2 text-xs text-[#25171a] focus:border-[#533a7b] focus:outline-none"
                  >
                    <option value="Essential">Essential</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Priority">Priority</option>
                    <option value="Remainder">Remainder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#25171a] mb-1">
                    Icon
                  </label>
                  <select
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#6969b3]/35 bg-white p-2 text-xs text-[#25171a] focus:border-[#533a7b] focus:outline-none"
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border-2 border-[#6969b3]/35 px-4 py-2 text-xs font-black text-[#25171a] hover:bg-[#533a7b]/15 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-white hover:bg-[#98c1d9]/20 border-2 border-[#533a7b] px-5 py-2 text-xs font-black text-[#25171a] shadow-xs transition"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoryPlanCardProps {
  category: Category;
  onUpdate: (id: string, val: number) => void;
  onDelete?: () => void;
}

const CategoryPlanCard: React.FC<CategoryPlanCardProps> = ({ category, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(category.plannedLimit));

  const handleSave = () => {
    const num = parseFloat(val) || 0;
    onUpdate(category.id, num);
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-[#6969b3]/30 bg-white p-4 hover:border-[#533a7b] transition shadow-xs text-[#25171a]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#98c1d9]/20 border border-[#6969b3]/30 text-[#25171a]">
            <CategoryIcon name={category.icon} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-[#25171a]">{category.name}</h4>
              <span className="rounded-full bg-[#533a7b]/20 border border-[#533a7b]/50 px-2 py-0.2 text-[9px] font-black text-[#25171a]">
                {category.categoryType}
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-[#6969b3] mt-0.5 font-semibold line-clamp-1">{category.description}</p>
            )}
          </div>
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-[#6969b3] hover:text-rose-600 p-1.5 transition rounded-lg hover:bg-rose-50"
            title="Delete custom category"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#6969b3]/20 pt-3">
        <div>
          <div className="text-[11px] font-bold text-[#6969b3]">This Month Limit</div>
          {editing ? (
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-20 rounded-lg border-2 border-[#533a7b] bg-white px-2 py-0.5 text-xs text-[#25171a] focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="rounded-lg bg-white hover:bg-[#98c1d9]/20 border border-[#533a7b] px-2 py-0.5 text-[11px] font-black text-[#25171a]"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setVal(String(category.plannedLimit));
                setEditing(true);
              }}
              className="text-xs font-black text-[#25171a] hover:text-[#533a7b] underline decoration-2 transition"
            >
              {formatINR(category.plannedLimit)} (edit)
            </button>
          )}
        </div>

        <div className="text-right">
          <div className="text-[11px] font-bold text-[#6969b3]">Normal Monthly Plan</div>
          <div className="text-xs font-black text-[#25171a] mt-0.5">
            {formatINR(category.normalPlan)}
          </div>
        </div>
      </div>
    </div>
  );
};

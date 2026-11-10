import React, { useState } from 'react';
import { CATEGORY_GUIDE_DATABASE } from '../constants/defaultData';
import { Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategoryForPayment?: (categoryId: string) => void;
}

export const CategoryGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  onSelectCategoryForPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredGuides = CATEGORY_GUIDE_DATABASE.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.query.toLowerCase().includes(q) ||
      item.recommendedCategory.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.exampleKeywords.some(kw => kw.toLowerCase().includes(q))
    );
  });

  const getMatchedCategoryId = (recommendedCategoryName: string) => {
    const cat = categories.find(c => c.name.toLowerCase().includes(recommendedCategoryName.toLowerCase()) || recommendedCategoryName.toLowerCase().includes(c.name.toLowerCase()));
    return cat ? cat.id : categories[0]?.id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn text-black">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border-2 border-[#6d6875] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#6d6875]/20 px-6 py-4 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d6875] text-[#ffcdb2]">
              <i className="fa-solid fa-circle-question text-base"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-black">Expense Category Guide</h2>
              <p className="text-xs text-black font-semibold">Which category does your payment go into?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-black hover:bg-slate-100 transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 sm:p-6 pb-2 bg-white">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#b5838d]"></i>
            <input
              type="text"
              placeholder="Search: e.g. shopping, restaurant, zomato, metro, phd, clothes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-[#6d6875] bg-white py-2.5 pl-10 pr-4 text-sm text-black placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Quick FAQ Pills */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-black font-black flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb text-xs text-[#b5838d]"></i> Popular:
            </span>
            {['Shopping', 'Restaurant', 'PhD', 'Metro & Travel', 'Groceries', 'Sister Fee'].map(tag => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="rounded-full border border-[#6d6875] bg-white px-2.5 py-1 font-bold text-black hover:bg-[#ffcdb2]/20 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* List of rules */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-3 bg-white">
          {filteredGuides.map((guide, idx) => {
            const catId = getMatchedCategoryId(guide.recommendedCategory);
            return (
              <div
                key={idx}
                className="rounded-xl border-2 border-[#6d6875]/30 bg-white p-4 hover:border-[#6d6875] transition text-black"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Payment Type:
                      </span>
                      <span className="text-sm font-black text-black capitalize">{guide.query}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-black font-semibold">Assign To:</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#6d6875] px-2.5 py-1 text-xs font-bold text-white">
                        <i className="fa-solid fa-circle-check text-xs text-[#ffcdb2]"></i>
                        {guide.recommendedCategory}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-black leading-relaxed font-semibold">
                      {guide.explanation}
                    </p>

                    <div className="mt-2 rounded-lg bg-white border border-[#b5838d] p-2 text-[11px] text-black">
                      <strong className="text-[#b5838d]">Budget Tip:</strong> {guide.priorityTip}
                    </div>
                  </div>

                  {onSelectCategoryForPayment && (
                    <button
                      onClick={() => {
                        onSelectCategoryForPayment(catId);
                        onClose();
                      }}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#6d6875] hover:bg-[#5b5762] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      Log <i className="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#6d6875]/20 p-4 text-center bg-white">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-[#6d6875] px-6 py-2 text-xs font-bold text-white hover:bg-[#5b5762] transition"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

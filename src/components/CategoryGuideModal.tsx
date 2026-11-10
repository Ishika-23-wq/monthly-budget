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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn text-[#54414e]">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border-2 border-[#a790a5]/35 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#a790a5]/25 px-6 py-4 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#54414e] text-[#c5ebc3] ring-2 ring-[#875c74]/25">
              <i className="fa-solid fa-circle-question text-base text-[#c5ebc3]"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#54414e]">Expense Category Guide</h2>
              <p className="text-xs text-[#a790a5] font-semibold">Which category does your payment go into?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#a790a5] hover:text-[#54414e] hover:bg-[#c5ebc3]/20 transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 sm:p-6 pb-2 bg-white">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#a790a5]"></i>
            <input
              type="text"
              placeholder="Search: e.g. shopping, restaurant, zomato, metro, phd, clothes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#a790a5]/35 bg-[#c5ebc3]/15 py-3 pl-11 pr-4 text-sm text-[#54414e] placeholder-slate-400 focus:border-[#875c74] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Quick FAQ Pills */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-[#54414e] font-black flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb text-xs text-[#875c74]"></i> Popular:
            </span>
            {['Shopping', 'Restaurant', 'PhD', 'Metro & Travel', 'Groceries', 'Sister Fee'].map(tag => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="rounded-full border border-[#a790a5]/30 bg-white px-3 py-1 font-bold text-[#54414e] hover:bg-[#875c74]/20 hover:border-[#875c74] transition"
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
                className="rounded-2xl border border-[#a790a5]/30 bg-white p-4 hover:border-[#875c74] transition text-[#54414e] shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#a790a5]">
                        Payment Type:
                      </span>
                      <span className="text-sm font-black text-[#54414e] capitalize">{guide.query}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-[#a790a5] font-semibold">Assign To:</span>
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#54414e] px-3 py-1 text-xs font-black text-[#c5ebc3]">
                        <i className="fa-solid fa-circle-check text-xs text-[#c5ebc3]"></i>
                        {guide.recommendedCategory}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#54414e] leading-relaxed font-semibold">
                      {guide.explanation}
                    </p>

                    <div className="mt-2.5 rounded-xl bg-[#c5ebc3]/15 border border-[#875c74] p-2.5 text-[11px] text-[#54414e]">
                      <strong className="text-[#54414e] font-black">Budget Tip:</strong> {guide.priorityTip}
                    </div>
                  </div>

                  {onSelectCategoryForPayment && (
                    <button
                      onClick={() => {
                        onSelectCategoryForPayment(catId);
                        onClose();
                      }}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#54414e] hover:bg-[#875c74] px-3.5 py-1.5 text-xs font-black text-[#c5ebc3] shadow-xs transition"
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
        <div className="border-t border-[#a790a5]/25 p-4 text-center bg-white">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-[#54414e] hover:bg-[#875c74] px-6 py-2.5 text-xs font-black text-[#c5ebc3] transition shadow-xs"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

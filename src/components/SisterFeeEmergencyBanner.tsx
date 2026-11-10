import React, { useState } from 'react';
import { formatINR, getDaysUntil } from '../utils/formatters';
import { Category } from '../types';

interface Props {
  currentCashLeft: number;
  salary: number;
  sisterCategory?: Category;
  onApplyCrunchMode: () => void;
  onApplyBalancedMode: () => void;
  isCrunchModeActive: boolean;
}

export const SisterFeeEmergencyBanner: React.FC<Props> = ({
  currentCashLeft,
  salary,
  sisterCategory
}) => {
  const [expanded, setExpanded] = useState(false);
  const targetDate = sisterCategory?.targetDueDate || '2026-12-07';
  const daysLeft = getDaysUntil(targetDate);
  const targetTotal = sisterCategory?.targetGoalTotal || 100000;

  // Exact calculations from your Excel Tracker:
  const bestCaseSpendNothing = currentCashLeft + salary; // ₹30,000 + ₹45,000 = ₹75,000
  const gapBestCase = targetTotal - bestCaseSpendNothing; // ₹25,000
  
  // If following this month limits (₹15,000 saved from cash + ₹45,000 salary = ₹60,000)
  const sisterMonthLimit = sisterCategory?.plannedLimit || 15000;
  const followingLimitsTotal = sisterMonthLimit + salary; // ₹60,000
  const shortfallFollowingLimits = targetTotal - followingLimitsTotal; // ₹40,000

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-[#6969b3]/40 bg-white p-4 sm:p-5 shadow-sm text-[#25171a]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25171a] text-[#98c1d9] ring-2 ring-[#533a7b]/30 shadow-xs">
            <i className="fa-solid fa-triangle-exclamation text-lg text-[#98c1d9]"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[#98c1d9] border border-[#6969b3]/40 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#25171a]">
                Sister's Fees Goal
              </span>
              <span className="text-xs font-bold text-[#25171a] flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-days text-[#533a7b] text-xs"></i> Due: 7 Dec 2026 ({daysLeft} days left)
              </span>
            </div>
            <h3 className="mt-1 text-base sm:text-lg font-black text-[#25171a]">
              Target: {formatINR(targetTotal)}
            </h3>
            <p className="text-xs sm:text-sm text-[#25171a]">
              Cash in hand: <span className="font-black text-[#25171a] underline decoration-[#533a7b] decoration-2">{formatINR(currentCashLeft)}</span> • Next Salary (7 Dec): <span className="font-black text-[#533a7b]">+{formatINR(salary)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#6969b3]/40 bg-white hover:bg-[#98c1d9]/20 px-3 py-2 text-xs font-bold text-[#25171a] transition shadow-xs"
          >
            {expanded ? 'Hide Details' : 'View Fee Shortfall Math'}
            <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-[#533a7b]`}></i>
          </button>
        </div>
      </div>

      {/* Progress Bar towards ₹1 Lakh in Palette: #533a7b to #98c1d9 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-[#25171a] mb-1 font-bold">
          <span>Best Case (Spend Nothing): <strong className="text-[#25171a]">{formatINR(bestCaseSpendNothing)}</strong> / {formatINR(targetTotal)}</span>
          <span className="font-black text-[#533a7b]">{Math.round((bestCaseSpendNothing / targetTotal) * 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#6969b3]/20 border border-[#6969b3]/30">
          <div
            className="h-full bg-gradient-to-r from-[#533a7b] to-[#98c1d9] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.round((bestCaseSpendNothing / targetTotal) * 100))}%` }}
          />
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-3 rounded-2xl bg-[#98c1d9]/25 border border-[#533a7b] p-3.5 text-xs text-[#25171a] leading-relaxed">
        <strong className="text-[#25171a] font-black">⚠️ CRITICAL EXCEL WARNING:</strong> Even after cutting this month's expenses to the limits, you are short by <strong className="underline text-[#25171a] font-black">{formatINR(shortfallFollowingLimits)}</strong> (and short by <strong className="underline text-[#25171a] font-black">{formatINR(gapBestCase)}</strong> even if you spend zero on groceries and travel). <strong>Ask the college for a 2-part instalment (₹50k on Dec 7 + ₹50k in Jan) or arrange the balance before Dec 7.</strong>
      </div>

      {/* Expanded Breakdown */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#6969b3]/30 text-xs sm:text-sm text-[#25171a] space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-2xl bg-white p-3 border border-[#6969b3]/40 shadow-xs">
              <div className="text-[#533a7b] text-[11px] font-bold">Best Case (Spend ₹0)</div>
              <div className="text-base font-black text-[#25171a] mt-0.5">{formatINR(bestCaseSpendNothing)}</div>
              <div className="text-[10px] text-[#6969b3] mt-1 font-semibold">Cash ₹30K + Salary ₹45K</div>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-[#533a7b] shadow-xs">
              <div className="text-[#533a7b] text-[11px] font-bold">Gap in Best Case</div>
              <div className="text-base font-black text-[#533a7b] mt-0.5">-{formatINR(gapBestCase)}</div>
              <div className="text-[10px] text-[#6969b3] mt-1 font-semibold">Shortfall if spend ₹0</div>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-[#6969b3]/40 shadow-xs">
              <div className="text-[#533a7b] text-[11px] font-bold">Following Month Limits</div>
              <div className="text-base font-black text-[#25171a] mt-0.5">{formatINR(followingLimitsTotal)}</div>
              <div className="text-[10px] text-[#6969b3] mt-1 font-semibold">₹15K saved + ₹45K salary</div>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-[#533a7b] shadow-xs">
              <div className="text-[#533a7b] text-[11px] font-bold">Shortfall (Following Limits)</div>
              <div className="text-base font-black text-[#533a7b] mt-0.5">-{formatINR(shortfallFollowingLimits)}</div>
              <div className="text-[10px] text-[#6969b3] mt-1 font-semibold">Must arrange separately</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#6969b3]/35 p-3.5 space-y-2 shadow-xs">
            <h4 className="font-black text-[#25171a] flex items-center gap-1.5 text-xs sm:text-sm">
              <i className="fa-solid fa-shield-halved text-[#533a7b]"></i>
              Strategic Plan for Ishika:
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#25171a] font-semibold">
              <li>
                <strong className="text-[#25171a]">Request College Instalment:</strong> Pay <strong className="text-[#25171a] underline decoration-[#533a7b]">₹50,000 on 7 Dec</strong> and the remaining <strong className="text-[#25171a] underline decoration-[#533a7b]">₹50,000 in January 2027</strong>.
              </li>
              <li>
                <strong className="text-[#25171a]">This Month Limit (₹30,000 in hand):</strong> ₹15,000 is reserved for fees. Remaining ₹15,000 covers 27 days of living essentials.
              </li>
              <li>
                <strong className="text-[#25171a]">Post-December Rule:</strong> Auto-save <strong className="text-[#25171a] font-black">₹16,667 / month</strong> on the 7th for future semesters.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

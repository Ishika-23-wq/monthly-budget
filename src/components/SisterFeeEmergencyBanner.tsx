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
  sisterCategory,
  onApplyCrunchMode,
  onApplyBalancedMode,
  isCrunchModeActive
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
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#b5838d] bg-white p-4 sm:p-5 shadow-sm text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6d6875] text-[#ffcdb2]">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-[#b5838d] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                Sister's Fees Goal
              </span>
              <span className="text-xs font-bold text-black flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-days text-[#b5838d] text-xs"></i> Due: 7 Dec 2026 ({daysLeft} days left)
              </span>
            </div>
            <h3 className="mt-1 text-base sm:text-lg font-black text-black">
              Target: {formatINR(targetTotal)}
            </h3>
            <p className="text-xs sm:text-sm text-black">
              Cash in hand: <span className="font-black text-[#b5838d]">{formatINR(currentCashLeft)}</span> • Next Salary (7 Dec): <span className="font-black text-[#6d6875]">+{formatINR(salary)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#6d6875] bg-white hover:bg-[#ffcdb2]/20 px-3 py-2 text-xs font-bold text-black transition"
          >
            {expanded ? 'Hide Details' : 'View Fee Shortfall Math'}
            <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-[#b5838d]`}></i>
          </button>
        </div>
      </div>

      {/* Progress Bar towards ₹1 Lakh in Coolors Palette */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-black mb-1">
          <span>Best Case (Spend Nothing): <strong className="text-black">{formatINR(bestCaseSpendNothing)}</strong> / {formatINR(targetTotal)}</span>
          <span className="font-black text-[#b5838d]">{Math.round((bestCaseSpendNothing / targetTotal) * 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white border-2 border-[#b5838d]">
          <div
            className="h-full bg-gradient-to-r from-[#ffb4a2] via-[#e5989b] to-[#b5838d] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((bestCaseSpendNothing / targetTotal) * 100))}%` }}
          />
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-3 rounded-xl bg-white border-2 border-[#e5989b] p-3 text-xs text-black">
        <strong className="text-[#b5838d]">⚠️ CRITICAL EXCEL WARNING:</strong> Even after cutting this month's expenses to the limits, you are short by <strong className="underline text-black font-black">{formatINR(shortfallFollowingLimits)}</strong> (and short by <strong className="underline text-black font-black">{formatINR(gapBestCase)}</strong> even if you spend zero on groceries and travel). <strong>Ask the college for a 2-part instalment (₹50k on Dec 7 + ₹50k in Jan) or arrange the balance before Dec 7.</strong>
      </div>

      {/* Expanded Breakdown in Coolors Palette */}
      {expanded && (
        <div className="mt-4 pt-4 border-t-2 border-[#b5838d]/30 text-xs sm:text-sm text-black space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]">
              <div className="text-black text-[11px] font-bold">Best Case (Spend ₹0)</div>
              <div className="text-base font-black text-black mt-0.5">{formatINR(bestCaseSpendNothing)}</div>
              <div className="text-[10px] text-black mt-1">Cash ₹30K + Salary ₹45K</div>
            </div>

            <div className="rounded-xl bg-white p-3 border-2 border-[#e5989b]">
              <div className="text-black text-[11px] font-bold">Gap in Best Case</div>
              <div className="text-base font-black text-[#b5838d] mt-0.5">-{formatINR(gapBestCase)}</div>
              <div className="text-[10px] text-black mt-1">Shortfall if spend ₹0</div>
            </div>

            <div className="rounded-xl bg-white p-3 border-2 border-[#6d6875]">
              <div className="text-black text-[11px] font-bold">Following Month Limits</div>
              <div className="text-base font-black text-black mt-0.5">{formatINR(followingLimitsTotal)}</div>
              <div className="text-[10px] text-black mt-1">₹15K saved + ₹45K salary</div>
            </div>

            <div className="rounded-xl bg-white p-3 border-2 border-[#e5989b]">
              <div className="text-black text-[11px] font-bold">Shortfall (Following Limits)</div>
              <div className="text-base font-black text-[#b5838d] mt-0.5">-{formatINR(shortfallFollowingLimits)}</div>
              <div className="text-[10px] text-black mt-1">Must arrange separately</div>
            </div>
          </div>

          <div className="rounded-xl bg-white border-2 border-[#6d6875] p-3.5 space-y-2">
            <h4 className="font-black text-black flex items-center gap-1.5 text-xs sm:text-sm">
              <i className="fa-solid fa-shield-halved text-[#b5838d]"></i>
              Strategic Plan for Ishika:
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-black">
              <li>
                <strong className="text-black">Request College Instalment:</strong> Pay <strong className="text-[#b5838d]">₹50,000 on 7 Dec</strong> and the remaining <strong className="text-[#b5838d]">₹50,000 in January 2027</strong>.
              </li>
              <li>
                <strong className="text-black">This Month Limit (₹30,000 in hand):</strong> ₹15,000 is reserved for fees. Remaining ₹15,000 covers 27 days of living essentials.
              </li>
              <li>
                <strong className="text-black">Post-December Rule:</strong> Auto-save <strong className="text-[#6d6875]">₹16,667 / month</strong> on the 7th for future semesters.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

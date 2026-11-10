import React, { useState } from 'react';
import { MonthlyBudget } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification
} from '../utils/notifications';

interface Props {
  currentBudget: MonthlyBudget;
  allBudgets: Record<string, MonthlyBudget>;
  onSelectMonth: (monthKey: string) => void;
  onOpenGuide: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentBudget,
  allBudgets,
  onSelectMonth,
  onOpenGuide
}) => {
  const budgetList = Object.values(allBudgets).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  const [notifState, setNotifState] = useState<NotificationPermission>(() => getNotificationPermission());

  const handleToggleNotif = async () => {
    if (notifState === 'granted') {
      sendNotification('FinTrack Active', {
        body: 'Alerts are active for your phone & laptop.'
      });
    } else {
      const ok = await requestNotificationPermission();
      setNotifState(ok ? 'granted' : 'denied');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#a790a5]/30 bg-white/95 backdrop-blur-md text-[#54414e] shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand in Coolors Palette: #c5ebc3, #b7c8b5, #a790a5, #875c74, #54414e */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#54414e] text-[#c5ebc3] shadow-sm ring-2 ring-[#875c74]/30">
            <span className="text-xl font-black">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#54414e]">
                FinTrack
              </h1>
              <span className="rounded-full bg-[#c5ebc3] border border-[#b7c8b5] px-2 py-0.2 text-[9px] font-black text-[#54414e]">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#875c74] hidden sm:block">
              Budget, Expenses, Tasks & SQLite DB
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button */}
          <button
            onClick={handleToggleNotif}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs ${
              notifState === 'granted'
                ? 'border-[#875c74] bg-[#c5ebc3]/30 text-[#54414e]'
                : 'border-[#54414e] bg-[#54414e] text-[#c5ebc3] hover:bg-[#44343f]'
            }`}
            title="Enable/Test phone & laptop notifications"
          >
            <i className={`fa-solid fa-bell text-xs ${notifState === 'granted' ? 'text-[#875c74]' : 'text-[#c5ebc3]'}`}></i>
            <span className="hidden sm:inline">
              {notifState === 'granted' ? 'Alerts ON' : 'Turn On Alerts'}
            </span>
          </button>

          {/* Month selector dropdown: White background, Mauve Shadow text, Lilac Ash border */}
          <div className="relative">
            <select
              value={currentBudget.monthKey}
              onChange={e => onSelectMonth(e.target.value)}
              className="appearance-none rounded-xl border-2 border-[#a790a5]/40 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-[#54414e] hover:border-[#875c74] focus:border-[#875c74] focus:outline-none shadow-xs cursor-pointer transition"
            >
              {budgetList.map(b => (
                <option key={b.monthKey} value={b.monthKey} className="bg-white text-[#54414e]">
                  {b.monthName}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#875c74]"></i>
          </div>

          {/* Category Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#a790a5]/40 bg-white hover:bg-[#c5ebc3]/25 hover:border-[#875c74] px-3 py-1.5 text-xs font-bold text-[#54414e] transition shadow-xs"
            title="Category Guide (Shopping, Restaurant, etc.)"
          >
            <i className="fa-solid fa-circle-question text-sm text-[#875c74]"></i>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};

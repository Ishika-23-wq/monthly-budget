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
    <header className="sticky top-0 z-40 border-b-2 border-[#6d6875] bg-white text-black shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand in Coolors Palette */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6d6875] text-[#ffcdb2] shadow-sm">
            <span className="text-xl font-black">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-black">
                FinTrack
              </h1>
              <span className="rounded bg-[#b5838d] px-1.5 py-0.2 text-[10px] font-bold text-white">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-bold text-black hidden sm:block">
              Budget, Expenses, Tasks & SQLite DB
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button with Font Awesome */}
          <button
            onClick={handleToggleNotif}
            className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition ${
              notifState === 'granted'
                ? 'border-[#6d6875] bg-[#ffcdb2]/20 text-black'
                : 'border-[#6d6875] bg-[#6d6875] text-white'
            }`}
            title="Enable/Test phone & laptop notifications"
          >
            <i className={`fa-solid fa-bell text-xs ${notifState === 'granted' ? 'text-[#b5838d]' : 'text-[#ffcdb2]'}`}></i>
            <span className="hidden sm:inline">
              {notifState === 'granted' ? 'Alerts ON' : 'Turn On Alerts'}
            </span>
          </button>

          {/* Month selector dropdown: White background, Black text */}
          <div className="relative">
            <select
              value={currentBudget.monthKey}
              onChange={e => onSelectMonth(e.target.value)}
              className="appearance-none rounded-xl border-2 border-[#6d6875] bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-black focus:outline-none shadow-sm cursor-pointer"
            >
              {budgetList.map(b => (
                <option key={b.monthKey} value={b.monthKey} className="bg-white text-black">
                  {b.monthName}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-black"></i>
          </div>

          {/* Category Guide Button with Font Awesome */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#6d6875] bg-white hover:bg-[#ffcdb2]/20 px-3 py-1.5 text-xs font-bold text-black transition"
            title="Category Guide (Shopping, Restaurant, etc.)"
          >
            <i className="fa-solid fa-circle-question text-sm text-[#b5838d]"></i>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};

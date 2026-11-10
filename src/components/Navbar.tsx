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
  isDbSynced?: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentBudget,
  allBudgets,
  onSelectMonth,
  onOpenGuide,
  isDbSynced = true,
  isSyncing = false,
  onManualSync
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
    <header className="sticky top-0 z-40 border-b border-[#6969b3]/30 bg-white/95 backdrop-blur-md text-[#25171a] shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand in Coolors Palette: #98c1d9, #6969b3, #533a7b, #4b244a, #25171a */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#25171a] shadow-sm border border-[#6969b3]/30 ring-2 ring-[#533a7b]/30">
            <span className="text-xl font-black">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#25171a]">
                FinTrack
              </h1>
              {/* <span className="inline-flex items-center gap-1 rounded-full bg-[#98c1d9]/30 border border-[#533a7b]/30 px-2 py-0.2 text-[9px] font-black text-[#533a7b]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                LIVE
              </span> */}
            </div>
            <p className="text-[11px] font-semibold text-[#533a7b] hidden sm:block">
              Budget, Expenses, Tasks & SQLite DB
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Sync Button */}
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                isDbSynced
                  ? 'border-[#6969b3]/40 bg-white hover:bg-[#98c1d9]/20 text-[#25171a]'
                  : 'border-amber-300 bg-amber-50 text-amber-800'
              }`}
              title="Click to sync latest data with SQLite DB"
            >
              <i className={`fa-solid fa-arrows-rotate text-xs text-[#533a7b] ${isSyncing ? 'animate-spin' : ''}`}></i>
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : 'Live Sync'}
              </span>
            </button>
          )}

          {/* Notification Button */}
          <button
            onClick={handleToggleNotif}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs ${
              notifState === 'granted'
                ? 'border-[#533a7b] bg-[#98c1d9]/30 text-[#25171a]'
                : 'border-[#6969b3]/40 bg-white text-[#25171a] hover:bg-[#98c1d9]/20 hover:border-[#533a7b]'
            }`}
            title="Enable/Test phone & laptop notifications"
          >
            <i className={`fa-solid fa-bell text-xs ${notifState === 'granted' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
            <span className="hidden sm:inline">
              {notifState === 'granted' ? 'Alerts ON' : 'Turn On Alerts'}
            </span>
          </button>

          {/* Month selector dropdown */}
          <div className="relative">
            <select
              value={currentBudget.monthKey}
              onChange={e => onSelectMonth(e.target.value)}
              className="appearance-none rounded-xl border-2 border-[#6969b3]/40 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-[#25171a] hover:border-[#533a7b] focus:border-[#533a7b] focus:outline-none shadow-xs cursor-pointer transition"
            >
              {budgetList.map(b => (
                <option key={b.monthKey} value={b.monthKey} className="bg-white text-[#25171a]">
                  {b.monthName}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#533a7b]"></i>
          </div>

          {/* Category Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#6969b3]/40 bg-white hover:bg-[#98c1d9]/25 hover:border-[#533a7b] px-3 py-1.5 text-xs font-bold text-[#25171a] transition shadow-xs"
            title="Category Guide (Shopping, Restaurant, etc.)"
          >
            <i className="fa-solid fa-circle-question text-sm text-[#533a7b]"></i>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};

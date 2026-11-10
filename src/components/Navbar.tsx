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
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-b border-[#6969b3]/30 bg-white/95 backdrop-blur-md text-[#25171a] shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        {/* Brand in Coolors Palette */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <img
            src="/favicon.png"
            alt="FinTrack"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl object-cover shadow-sm border border-[#6969b3]/30 ring-2 ring-[#533a7b]/30 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-[#25171a] leading-tight truncate">
              FinTrack
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[#533a7b] hidden md:block">
              Budget, Expenses, Tasks & SQLite DB
            </p>
          </div>
        </div>

        {/* Right side controls - compact and perfectly fitted on mobile screen */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live Sync Button */}
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 rounded-xl border sm:px-3 sm:py-1.5 text-xs font-bold transition shadow-xs shrink-0 ${
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
            className={`flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 rounded-xl border sm:px-3 sm:py-1.5 text-xs font-bold transition shadow-xs shrink-0 ${
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

          {/* Month selector dropdown - compact width on mobile, full width on desktop */}
          <div className="relative max-w-[105px] xs:max-w-[130px] sm:max-w-[210px] shrink-0">
            <select
              value={currentBudget.monthKey}
              onChange={e => onSelectMonth(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-[#6969b3]/40 bg-white py-1 pl-2 pr-5 sm:py-1.5 sm:pl-3 sm:pr-8 text-[11px] sm:text-xs font-bold text-[#25171a] hover:border-[#533a7b] focus:border-[#533a7b] focus:outline-none shadow-xs cursor-pointer transition truncate"
            >
              {budgetList.map(b => {
                const shortName = b.monthKey === 'cycle-1' ? 'Nov 2026' : b.monthKey === 'cycle-2' ? 'Dec 2026' : b.monthKey === 'cycle-3' ? 'Jan 2027' : b.monthName;
                return (
                  <option key={b.monthKey} value={b.monthKey} className="bg-white text-[#25171a]">
                    {shortName}
                  </option>
                );
              })}
            </select>
            <i className="fa-solid fa-chevron-down pointer-events-none absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] text-[#533a7b]"></i>
          </div>

          {/* Category Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 rounded-xl border-2 border-[#6969b3]/40 bg-white hover:bg-[#98c1d9]/25 hover:border-[#533a7b] sm:px-3 sm:py-1.5 text-xs font-bold text-[#25171a] transition shadow-xs shrink-0"
            title="Category Guide (Shopping, Restaurant, etc.)"
          >
            <i className="fa-solid fa-circle-question text-xs sm:text-sm text-[#533a7b]"></i>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};

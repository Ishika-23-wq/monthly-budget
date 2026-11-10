import React from 'react';
import {
  LayoutDashboard,
  Plus,
  Sliders,
  FileSpreadsheet,
  History,
  CheckSquare
} from 'lucide-react';

export type TabType = 'dashboard' | 'planner' | 'tasks' | 'sheet' | 'history';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddPaymentModal: () => void;
  pendingTasksCount?: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenAddPaymentModal,
  pendingTasksCount = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#6d6875] bg-white pb-safe shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'dashboard'
              ? 'text-[#6d6875] font-black'
              : 'text-black font-bold hover:text-[#6d6875]'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Target Goals Planner */}
        <button
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'planner'
              ? 'text-[#6d6875] font-black'
              : 'text-black font-bold hover:text-[#6d6875]'
          }`}
        >
          <Sliders className="h-5 w-5" />
          <span className="text-[10px]">Goals</span>
        </button>

        {/* Center Big Add Payment Button in #6d6875 */}
        <button
          onClick={onOpenAddPaymentModal}
          className="relative -top-3 flex h-13 w-13 items-center justify-center rounded-full bg-[#6d6875] text-white shadow-xl hover:bg-[#5b5762] active:scale-95 transition"
          title="Log Payment Today"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>

        {/* Tasks & Deadlines */}
        <button
          onClick={() => onSelectTab('tasks')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'tasks'
              ? 'text-[#6d6875] font-black'
              : 'text-black font-bold hover:text-[#6d6875]'
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="text-[10px]">Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b5838d] text-[9px] font-bold text-white">
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Single Sheet View */}
        <button
          onClick={() => onSelectTab('sheet')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'sheet'
              ? 'text-[#6d6875] font-black'
              : 'text-black font-bold hover:text-[#6d6875]'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span className="text-[10px]">Sheet</span>
        </button>
      </div>
    </nav>
  );
};

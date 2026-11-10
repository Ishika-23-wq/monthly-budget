import React from 'react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#8789c0]/25 bg-white/95 backdrop-blur-md pb-safe shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'dashboard'
              ? 'bg-[#08090a] text-[#5dfdcb] font-black shadow-xs'
              : 'text-[#8789c0] hover:text-[#08090a] font-bold'
          }`}
        >
          <i className="fa-solid fa-table-columns text-sm"></i>
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Target Goals Planner */}
        <button
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'planner'
              ? 'bg-[#08090a] text-[#5dfdcb] font-black shadow-xs'
              : 'text-[#8789c0] hover:text-[#08090a] font-bold'
          }`}
        >
          <i className="fa-solid fa-sliders text-sm"></i>
          <span className="text-[10px]">Goals</span>
        </button>

        {/* Center Big Add Payment Button with vibrant Mint & Sky gradient */}
        <button
          onClick={onOpenAddPaymentModal}
          className="relative -top-3 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-[#5dfdcb] to-[#7cc6fe] text-[#08090a] shadow-xl shadow-[#5dfdcb]/40 ring-4 ring-white active:scale-95 transition"
          title="Log Payment Today"
        >
          <i className="fa-solid fa-plus text-xl font-black"></i>
        </button>

        {/* Tasks & Deadlines */}
        <button
          onClick={() => onSelectTab('tasks')}
          className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'tasks'
              ? 'bg-[#08090a] text-[#5dfdcb] font-black shadow-xs'
              : 'text-[#8789c0] hover:text-[#08090a] font-bold'
          }`}
        >
          <i className="fa-solid fa-list-check text-sm"></i>
          <span className="text-[10px]">Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7cc6fe] text-[9px] font-black text-[#08090a] border border-white">
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Single Sheet View */}
        <button
          onClick={() => onSelectTab('sheet')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'sheet'
              ? 'bg-[#08090a] text-[#5dfdcb] font-black shadow-xs'
              : 'text-[#8789c0] hover:text-[#08090a] font-bold'
          }`}
        >
          <i className="fa-solid fa-table-list text-sm"></i>
          <span className="text-[10px]">Sheet</span>
        </button>
      </div>
    </nav>
  );
};

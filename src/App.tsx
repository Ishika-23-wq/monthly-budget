import React, { useState, useEffect, useRef } from 'react';
import { MonthlyBudget, Category, Expense, TaskItem } from './types';
import {
  loadAllBudgets,
  saveAllBudgets,
  getSavedActiveMonth,
  setSavedActiveMonth,
  createMonthWithRollover
} from './utils/storage';
import {
  fetchBudgetsFromDB,
  fetchDBVersion,
  saveBudgetToDB,
  saveExpenseToDB,
  updateExpenseInDB,
  deleteExpenseFromDB,
  saveTaskToDB,
  toggleTaskInDB,
  deleteTaskFromDB,
  subscribeToSyncEvents
} from './utils/api';
import { INITIAL_CATEGORIES, INITIAL_TASKS } from './constants/defaultData';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { BudgetPlanner } from './components/BudgetPlanner';
import { SingleSheetView } from './components/SingleSheetView';
import { PastMonthsHistory } from './components/PastMonthsHistory';
import { TasksSection } from './components/TasksSection';
import { DailyPaymentModal } from './components/DailyPaymentModal';
import { CategoryGuideModal } from './components/CategoryGuideModal';
import {
  notifyExpenseLogged,
  notifyTaskDue,
  notifySisterFeeAlert
} from './utils/notifications';
import { getDaysUntil } from './utils/formatters';

export function App() {
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>(() => loadAllBudgets());
  const [activeMonthKey, setActiveMonthKey] = useState<string>(() => getSavedActiveMonth());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modals & Edit state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [preselectedCatId, setPreselectedCatId] = useState<string | undefined>(undefined);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastRevisionRef = useRef<number>(0);
  const budgetsRef = useRef<Record<string, MonthlyBudget>>(budgets);
  budgetsRef.current = budgets;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Core Sync Function: Fetches from SQLite DB and updates React state
  const performSync = async (isSilent = true) => {
    setIsSyncing(true);
    try {
      const dbBudgets = await fetchBudgetsFromDB();
      if (dbBudgets && Object.keys(dbBudgets).length > 0) {
        setBudgets(prev => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(dbBudgets);
          if (prevStr !== newStr) {
            saveAllBudgets(dbBudgets);
            if (!isSilent) {
              showToast('🔄 Live Sync: Updated latest amounts from phone/database!');
            }
            return dbBudgets;
          }
          return prev;
        });
        setIsDbSynced(true);
      } else {
        // If DB is empty, seed it from defaults
        const local = loadAllBudgets();
        for (const b of Object.values(local)) {
          await saveBudgetToDB(b);
        }
        setIsDbSynced(true);
      }
    } catch (err) {
      console.warn('[Sync Engine] Sync failed:', err);
      setIsDbSynced(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-time Multi-Device Synchronization (SSE + Polling + Window Focus)
  useEffect(() => {
    // 1. Initial sync immediately
    performSync(true);

    // 2. Real-time broadcast listener via Server-Sent Events (SSE)
    const unsubscribeSSE = subscribeToSyncEvents((event) => {
      console.log('[Real-time Sync] Event received:', event);
      if (event.type !== 'connected') {
        performSync(false);
      }
    });

    // 3. Fast Polling (every 2.5s) to guarantee updates if SSE is blocked/reconnecting
    const pollInterval = setInterval(async () => {
      const ver = await fetchDBVersion();
      if (ver && ver.revision && ver.revision !== lastRevisionRef.current) {
        lastRevisionRef.current = ver.revision;
        performSync(false);
      }
    }, 2500);

    // 4. Tab Visibility & Window Focus: sync instantly when user switches back to website
    const handleFocus = () => {
      performSync(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        performSync(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribeSSE();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Save to localStorage as secondary backup
  useEffect(() => {
    saveAllBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    setSavedActiveMonth(activeMonthKey);
  }, [activeMonthKey]);

  // Ensure current budget exists
  let currentBudget = budgets[activeMonthKey];
  if (!currentBudget) {
    currentBudget = createMonthWithRollover(activeMonthKey, budgets);
    budgets[activeMonthKey] = currentBudget;
  }

  // Ensure tasks array exists on current budget
  const currentTasks = currentBudget.tasks || INITIAL_TASKS;

  // On mount: check if any task is due in 2-3 days and trigger alert
  useEffect(() => {
    const sisterDays = getDaysUntil('2026-12-07');
    if (sisterDays <= 30 && sisterDays > 0) {
      notifySisterFeeAlert(sisterDays);
    }

    currentTasks.forEach(task => {
      if (!task.completed) {
        const days = getDaysUntil(task.deadline);
        if (days <= 3 && days >= 0) {
          notifyTaskDue(task, days);
        }
      }
    });
  }, []);

  const isCrunchModeActive = currentBudget.categories.some(
    c => (c.id === 'iphone' || c.id === 'trips' || c.id === 'car') && c.plannedLimit === 0
  );

  // Handle adding an expense -> Save to SQLite DB & broadcast
  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`
    };

    setBudgets(prev => {
      const b = prev[activeMonthKey] || currentBudget;
      const updated = {
        ...b,
        expenses: [...b.expenses, newExpense]
      };
      // Async persist to SQLite
      saveExpenseToDB({ ...newExpense, monthKey: activeMonthKey });
      return { ...prev, [activeMonthKey]: updated };
    });

    const categoryObj = currentBudget.categories.find(c => c.id === expenseData.categoryId);
    const catName = categoryObj ? categoryObj.name : 'Expense';
    
    // Trigger Phone & Laptop notification
    notifyExpenseLogged(expenseData.amount, catName, expenseData.title);
    showToast(`Payment of ₹${expenseData.amount.toLocaleString('en-IN')} logged & synced!`);
  };

  // Handle updating an existing expense -> Save to SQLite DB & broadcast
  const handleUpdateExpense = (updatedExpense: Expense) => {
    setBudgets(prev => {
      const b = prev[activeMonthKey] || currentBudget;
      const updated = {
        ...b,
        expenses: b.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
      };
      updateExpenseInDB(updatedExpense);
      return { ...prev, [activeMonthKey]: updated };
    });
    setExpenseToEdit(null);
    showToast(`Payment updated: ₹${updatedExpense.amount.toLocaleString('en-IN')} synced!`);
  };

  // Handle opening edit modal
  const handleOpenEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsPaymentModalOpen(true);
  };

  // Handle deleting an expense -> Delete from SQLite DB & broadcast
  const handleDeleteExpense = (expenseId: string) => {
    deleteExpenseFromDB(expenseId);
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      return {
        ...prev,
        [activeMonthKey]: {
          ...b,
          expenses: b.expenses.filter(e => e.id !== expenseId)
        }
      };
    });
    showToast('Transaction removed & synced');
  };

  // Task management handlers -> Save to SQLite DB & broadcast
  const handleAddTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setBudgets(prev => {
      const b = prev[activeMonthKey] || currentBudget;
      const existing = b.tasks || [];
      const updatedTasks = [newTask, ...existing];
      saveTaskToDB({ ...newTask, monthKey: activeMonthKey });
      return {
        ...prev,
        [activeMonthKey]: {
          ...b,
          tasks: updatedTasks
        }
      };
    });

    const days = getDaysUntil(newTask.deadline);
    if (days <= 3) {
      notifyTaskDue(newTask, days);
    }
    showToast(`Task saved to SQLite! 2–3 day alerts active.`);
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskInDB(taskId);
    setBudgets(prev => {
      const b = prev[activeMonthKey] || currentBudget;
      const existing = b.tasks || [];
      const updated = existing.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        [activeMonthKey]: {
          ...b,
          tasks: updated
        }
      };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskFromDB(taskId);
    setBudgets(prev => {
      const b = prev[activeMonthKey] || currentBudget;
      const existing = b.tasks || [];
      return {
        ...prev,
        [activeMonthKey]: {
          ...b,
          tasks: existing.filter(t => t.id !== taskId)
        }
      };
    });
    showToast('Task removed from SQLite');
  };

  const handleQuickLogExpenseFromTask = (task: TaskItem) => {
    const matchedCategory = currentBudget.categories.find(c =>
      c.name.toLowerCase().includes(task.category?.toLowerCase() || '')
    );
    setPreselectedCatId(matchedCategory?.id || currentBudget.categories[0]?.id);
    setIsPaymentModalOpen(true);
  };

  // Handle updating planned limit -> Save to SQLite DB & broadcast
  const handleUpdateCategoryLimit = (categoryId: string, newLimit: number) => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updated = {
        ...b,
        categories: b.categories.map(c =>
          c.id === categoryId ? { ...c, plannedLimit: newLimit } : c
        )
      };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Target limit updated & synced to SQLite');
  };

  // Handle adding custom category
  const handleAddCustomCategory = (newCat: Category) => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updated = {
        ...b,
        categories: [...b.categories, newCat]
      };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast(`Added custom category "${newCat.name}"`);
  };

  // Handle deleting category
  const handleDeleteCategory = (categoryId: string) => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updated = {
        ...b,
        categories: b.categories.filter(c => c.id !== categoryId)
      };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Category removed');
  };

  // Crunch Mode (Zero out iPhone, Trips, Car)
  const handleApplyCrunchMode = () => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updated = {
        ...b,
        categories: b.categories.map(c => {
          if (c.id === 'iphone' || c.id === 'trips' || c.id === 'car') {
            return { ...c, plannedLimit: 0 };
          }
          if (c.id === 'personal') {
            return { ...c, plannedLimit: 500 };
          }
          return c;
        })
      };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Crunch Mode applied! Saved ₹5,500 towards Sister fees.');
  };

  // Balanced Mode (Normal limits)
  const handleApplyBalancedMode = () => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updated = {
        ...b,
        categories: b.categories.map(c => ({
          ...c,
          plannedLimit: c.normalPlan
        }))
      };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Balanced plan restored.');
  };

  // Switching months
  const handleSelectMonth = (monthKey: string) => {
    if (!budgets[monthKey]) {
      const newMonth = createMonthWithRollover(monthKey, budgets);
      setBudgets(prev => ({ ...prev, [monthKey]: newMonth }));
      saveBudgetToDB(newMonth);
    }
    setActiveMonthKey(monthKey);
    setSavedActiveMonth(monthKey);
  };

  // Start Next Month
  const handleCreateNextMonth = (newMonthKey: string) => {
    const newMonth = createMonthWithRollover(newMonthKey, budgets);
    setBudgets(prev => ({
      ...prev,
      [newMonthKey]: newMonth
    }));
    setActiveMonthKey(newMonthKey);
    saveBudgetToDB(newMonth);
    showToast(`Created ${newMonth.monthName} with rollover balance!`);
  };

  const handleOpenAddPayment = (catId?: string) => {
    setPreselectedCatId(catId);
    setExpenseToEdit(null);
    setIsPaymentModalOpen(true);
  };

  const pendingTasksCount = currentTasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#98c1d9]/15 text-[#25171a] flex flex-col pb-24 md:pb-12">
      {/* Toast Notification in Palette */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-white border-2 border-[#533a7b] px-4 py-2.5 text-xs font-black text-[#25171a] shadow-2xl animate-fadeIn">
          <i className="fa-solid fa-circle-check text-sm text-[#533a7b]"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with Real-time Sync */}
      <Navbar
        currentBudget={currentBudget}
        allBudgets={budgets}
        onSelectMonth={handleSelectMonth}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onResetData={() => {}}
        isDbSynced={isDbSynced}
        isSyncing={isSyncing}
        onManualSync={() => performSync(false)}
      />

      {/* Desktop Tab Bar in Palette */}
      <div className="hidden md:block border-b border-[#6969b3]/25 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#25171a] font-black border border-[#6969b3]/30 shadow-xs'
                  : 'text-[#6969b3] hover:text-[#25171a] hover:bg-white/60'
              }`}
            >
              <i className={`fa-solid fa-table-columns ${activeTab === 'dashboard' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'planner'
                  ? 'bg-white text-[#25171a] font-black border border-[#6969b3]/30 shadow-xs'
                  : 'text-[#6969b3] hover:text-[#25171a] hover:bg-white/60'
              }`}
            >
              <i className={`fa-solid fa-sliders ${activeTab === 'planner' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
              Target Goals
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#25171a] font-black border border-[#6969b3]/30 shadow-xs'
                  : 'text-[#6969b3] hover:text-[#25171a] hover:bg-white/60'
              }`}
            >
              <i className={`fa-solid fa-list-check ${activeTab === 'tasks' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
              Tasks & Deadlines
              {pendingTasksCount > 0 && (
                <span className="ml-1 rounded-full bg-[#533a7b] px-1.5 py-0.2 text-[10px] font-black text-white">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'sheet'
                  ? 'bg-white text-[#25171a] font-black border border-[#6969b3]/30 shadow-xs'
                  : 'text-[#6969b3] hover:text-[#25171a] hover:bg-white/60'
              }`}
            >
              <i className={`fa-solid fa-table-list ${activeTab === 'sheet' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
              Single Sheet View
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-white text-[#25171a] font-black border border-[#6969b3]/30 shadow-xs'
                  : 'text-[#6969b3] hover:text-[#25171a] hover:bg-white/60'
              }`}
            >
              <i className={`fa-solid fa-clock-rotate-left ${activeTab === 'history' ? 'text-[#533a7b]' : 'text-[#6969b3]'}`}></i>
              History & Rollover
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Clickable SQLite Status Indicator with Live Sync */}
            <button
              onClick={() => performSync(false)}
              className="flex items-center gap-1.5 rounded-full border border-[#533a7b]/40 bg-[#98c1d9]/20 hover:bg-[#98c1d9]/40 px-2.5 py-1 text-[11px] font-bold text-[#25171a] transition cursor-pointer"
              title="Click to refresh SQLite data from phone/server"
            >
              <i className={`fa-solid fa-arrows-rotate text-xs text-[#533a7b] ${isSyncing ? 'animate-spin' : ''}`}></i>
              <span>SQLite DB {isDbSynced ? 'Active' : 'Local'}</span>
            </button>

            <button
              onClick={() => handleOpenAddPayment()}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-[#98c1d9]/20 border-2 border-[#533a7b] px-4 py-2 text-xs font-black text-[#25171a] shadow-xs transition active:scale-95"
            >
              <i className="fa-solid fa-plus text-xs text-[#533a7b]"></i> Log Payment Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6 text-[#25171a]">
        {activeTab === 'dashboard' && (
          <Dashboard
            budget={currentBudget}
            tasks={currentTasks}
            onOpenAddPayment={handleOpenAddPayment}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            onSwitchTab={tab => setActiveTab(tab)}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleOpenEditExpense}
            onApplyCrunchMode={handleApplyCrunchMode}
            onApplyBalancedMode={handleApplyBalancedMode}
            isCrunchModeActive={isCrunchModeActive}
          />
        )}

        {activeTab === 'planner' && (
          <BudgetPlanner
            categories={currentBudget.categories}
            salary={currentBudget.salary}
            payday={currentBudget.payday}
            onUpdateCategoryLimit={handleUpdateCategoryLimit}
            onAddCustomCategory={handleAddCustomCategory}
            onDeleteCategory={handleDeleteCategory}
            onApplyCrunchMode={handleApplyCrunchMode}
            onApplyBalancedMode={handleApplyBalancedMode}
            isCrunchModeActive={isCrunchModeActive}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksSection
            tasks={currentTasks}
            categories={currentBudget.categories}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onQuickLogExpenseFromTask={handleQuickLogExpenseFromTask}
          />
        )}

        {activeTab === 'sheet' && (
          <SingleSheetView
            budget={currentBudget}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleOpenEditExpense}
            onQuickAddPayment={catId => handleOpenAddPayment(catId)}
          />
        )}

        {activeTab === 'history' && (
          <PastMonthsHistory
            allBudgets={budgets}
            activeMonthKey={activeMonthKey}
            onSelectMonth={handleSelectMonth}
            onCreateNextMonth={handleCreateNextMonth}
          />
        )}
      </main>

      {/* Modals */}
      <DailyPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setExpenseToEdit(null);
          setPreselectedCatId(undefined);
        }}
        categories={currentBudget.categories}
        expenses={currentBudget.expenses}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        expenseToEdit={expenseToEdit}
        onOpenGuide={() => {
          setIsPaymentModalOpen(false);
          setIsGuideModalOpen(true);
        }}
        preselectedCategoryId={preselectedCatId}
      />

      <CategoryGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        categories={currentBudget.categories}
        onSelectCategoryForPayment={catId => {
          handleOpenAddPayment(catId);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden">
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddPaymentModal={() => handleOpenAddPayment()}
          pendingTasksCount={pendingTasksCount}
        />
      </div>
    </div>
  );
}

export default App;

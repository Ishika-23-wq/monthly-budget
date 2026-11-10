import React, { useState, useEffect } from 'react';
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
  saveBudgetToDB,
  saveExpenseToDB,
  deleteExpenseFromDB,
  saveTaskToDB,
  toggleTaskInDB,
  deleteTaskFromDB
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
  
  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedCatId, setPreselectedCatId] = useState<string | undefined>(undefined);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with SQLite Database on Mount
  useEffect(() => {
    fetchBudgetsFromDB().then(dbBudgets => {
      if (dbBudgets && Object.keys(dbBudgets).length > 0) {
        setBudgets(dbBudgets);
        saveAllBudgets(dbBudgets);
        setIsDbSynced(true);
      } else {
        // Seed SQLite DB from current defaults
        const local = loadAllBudgets();
        Object.values(local).forEach(b => saveBudgetToDB(b));
        setIsDbSynced(true);
      }
    }).catch(() => {
      setIsDbSynced(false);
    });
  }, []);

  // Sync to localStorage as backup
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
        // Alert 2–3 days prior (or today/tomorrow)
        if (days <= 3 && days >= 0) {
          notifyTaskDue(task, days);
        }
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isCrunchModeActive = currentBudget.categories.some(
    c => (c.id === 'iphone' || c.id === 'trips' || c.id === 'car') && c.plannedLimit === 0
  );

  // Handle adding an expense -> Save to SQLite DB
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
    showToast(`Payment of ₹${expenseData.amount.toLocaleString('en-IN')} logged to SQLite DB!`);
  };

  // Handle deleting an expense -> Delete from SQLite DB
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
    showToast('Transaction removed from SQLite');
  };

  // Task management handlers -> Save to SQLite DB
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
      // Async persist to SQLite
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

  // Handle updating planned limit
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
    showToast('Target limit updated in SQLite DB');
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
    showToast(`Category "${newCat.name}" added to SQLite!`);
  };

  // Handle deleting custom category
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
    showToast('Category deleted');
  };

  // Crunch mode
  const handleApplyCrunchMode = () => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updatedCategories = b.categories.map(c => {
        if (c.id === 'iphone' || c.id === 'trips' || c.id === 'car') {
          return { ...c, plannedLimit: 0 };
        }
        if (c.id === 'gym') {
          return { ...c, plannedLimit: 0 };
        }
        if (c.id === 'personal') {
          return { ...c, plannedLimit: 1000 };
        }
        return c;
      });
      const updated = { ...b, categories: updatedCategories };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Fee Crunch Mode Activated in SQLite!');
  };

  // Restore balanced
  const handleApplyBalancedMode = () => {
    setBudgets(prev => {
      const b = prev[activeMonthKey];
      if (!b) return prev;
      const updatedCategories = b.categories.map(c => {
        const defaultCat = INITIAL_CATEGORIES.find(ic => ic.id === c.id);
        if (defaultCat) {
          return { ...c, plannedLimit: defaultCat.plannedLimit };
        }
        return c;
      });
      const updated = { ...b, categories: updatedCategories };
      saveBudgetToDB(updated);
      return {
        ...prev,
        [activeMonthKey]: updated
      };
    });
    showToast('Restored month limits in SQLite');
  };

  // Create next month with rollover
  const handleCreateNextMonth = (nextKey: string) => {
    const newMonth = createMonthWithRollover(nextKey, budgets);
    saveBudgetToDB(newMonth);
    setBudgets(prev => ({
      ...prev,
      [nextKey]: newMonth
    }));
    setActiveMonthKey(nextKey);
    setActiveTab('dashboard');
    showToast(`Created ${newMonth.monthName} in SQLite DB!`);
  };

  const handleSelectMonth = (monthKey: string) => {
    setActiveMonthKey(monthKey);
  };

  const handleOpenAddPayment = (categoryId?: string) => {
    setPreselectedCatId(categoryId);
    setIsPaymentModalOpen(true);
  };

  const pendingTasksCount = currentTasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pb-24 md:pb-12">
      {/* Toast Notification in Coolors Palette */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-[#6d6875] border-2 border-[#b5838d] px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-fadeIn">
          <i className="fa-solid fa-circle-check text-[#ffcdb2]"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentBudget={currentBudget}
        allBudgets={budgets}
        onSelectMonth={handleSelectMonth}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onResetData={() => {}}
      />

      {/* Desktop Tab Bar: Strict White Background, Black Text, Coolors Palette */}
      <div className="hidden md:block border-b-2 border-[#6d6875]/20 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#6d6875] text-white shadow-sm'
                  : 'text-black hover:bg-[#ffcdb2]/20 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-table-columns text-[#ffcdb2]"></i>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'planner'
                  ? 'bg-[#6d6875] text-white shadow-sm'
                  : 'text-black hover:bg-[#ffcdb2]/20 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-sliders text-[#ffcdb2]"></i>
              Target Goals
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'tasks'
                  ? 'bg-[#6d6875] text-white shadow-sm'
                  : 'text-black hover:bg-[#ffcdb2]/20 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-list-check text-[#ffcdb2]"></i>
              Tasks & Deadlines
              {pendingTasksCount > 0 && (
                <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === 'tasks' ? 'bg-[#ffcdb2] text-black' : 'bg-[#b5838d] text-white'
                }`}>
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'sheet'
                  ? 'bg-[#6d6875] text-white shadow-sm'
                  : 'text-black hover:bg-[#ffcdb2]/20 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-table-list text-[#ffcdb2]"></i>
              Single Sheet View
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-[#6d6875] text-white shadow-sm'
                  : 'text-black hover:bg-[#ffcdb2]/20 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left text-[#ffcdb2]"></i>
              History & Rollover
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* SQLite Status Indicator */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#b5838d] bg-white px-2.5 py-1 text-[11px] font-bold text-black" title="SQLite Database Connected">
              <i className="fa-solid fa-database text-xs text-[#b5838d]"></i>
              <span>SQLite DB {isDbSynced ? 'Active' : 'Local'}</span>
            </div>

            <button
              onClick={() => handleOpenAddPayment()}
              className="flex items-center gap-1.5 rounded-xl bg-[#6d6875] hover:bg-[#5b5762] px-4 py-2 text-xs font-bold text-white shadow transition active:scale-95"
            >
              <i className="fa-solid fa-plus text-xs"></i> Log Payment Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6 bg-white text-black">
        {activeTab === 'dashboard' && (
          <Dashboard
            budget={currentBudget}
            tasks={currentTasks}
            onOpenAddPayment={handleOpenAddPayment}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            onSwitchTab={tab => setActiveTab(tab)}
            onDeleteExpense={handleDeleteExpense}
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
          setPreselectedCatId(undefined);
        }}
        categories={currentBudget.categories}
        expenses={currentBudget.expenses}
        onAddExpense={handleAddExpense}
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

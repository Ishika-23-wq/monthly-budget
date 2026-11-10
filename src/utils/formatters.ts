import { Expense, MonthlyBudget, Category } from '../types';

export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(absVal);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatINRAmountOnly(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateReadable(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = new Date(getTodayDateString()).getTime();
  const diffTime = target - now;
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function getCategorySpent(expenses: Expense[], categoryId: string): number {
  return expenses
    .filter(e => e.categoryId === categoryId)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function getSpentToday(expenses: Expense[]): number {
  const today = getTodayDateString();
  return expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function calculateBudgetSummary(budget: MonthlyBudget) {
  const today = getTodayDateString();
  const daysLeft = budget.cycleEndDate ? getDaysUntil(budget.cycleEndDate) + 1 : 27;
  
  const totalPlannedThisCycle = budget.categories.reduce((acc, cat) => acc + (cat.plannedLimit || 0), 0);
  const totalNormalMonthlyPlan = budget.categories.reduce((acc, cat) => acc + (cat.normalPlan || 0), 0);
  
  const totalSpent = budget.expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
  const spentToday = getSpentToday(budget.expenses);
  
  // Cash in hand right now = Starting Cash - Total Spent
  const cashLeft = Math.max(0, (budget.startingBalance || 30000) - totalSpent);
  
  // Safe to spend per day = Cash left / Days left
  const safeToSpendPerDay = daysLeft > 0 ? cashLeft / daysLeft : 0;

  // Sister's fees goal analysis (Direct from Excel Dashboard)
  const sisterFeeTotal = 100000;
  const bestCaseSpendNothing = (budget.startingBalance || 30000) + budget.salary; // 30,000 + 45,000 = 75,000
  const gapBestCase = sisterFeeTotal - bestCaseSpendNothing; // 25,000
  
  // Sister's fees limit set aside this cycle (15,000) + salary (45,000) = 60,000
  const sisterCat = budget.categories.find(c => c.id === 'sister_fees');
  const sisterSavedThisCycle = sisterCat?.plannedLimit || 15000;
  const followingCycleFunds = sisterSavedThisCycle + budget.salary; // 60,000
  const shortfallFollowingLimits = sisterFeeTotal - followingCycleFunds; // 40,000

  return {
    salary: budget.salary,
    startingBalance: budget.startingBalance,
    cashLeft,
    totalSpent,
    spentToday,
    daysLeft,
    safeToSpendPerDay,
    totalPlannedThisCycle,
    totalNormalMonthlyPlan,
    unallocatedThisCycle: budget.startingBalance - totalPlannedThisCycle,
    sisterFeesAnalysis: {
      feeTotal: sisterFeeTotal,
      dueDate: '2026-12-07',
      daysLeftToPay: getDaysUntil('2026-12-07'),
      moneyStillYours: cashLeft,
      salaryArriving: budget.salary,
      bestCaseSpendNothing,
      gapBestCase,
      followingCycleFunds,
      shortfallFollowingLimits
    }
  };
}

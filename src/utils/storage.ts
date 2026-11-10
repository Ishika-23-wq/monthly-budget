import { MonthlyBudget } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MONTHLY_DATA, PAST_MONTHS_SAMPLE } from '../constants/defaultData';

const STORAGE_KEY_BUDGETS = 'fintrack_monthly_budgets_v4';
const STORAGE_KEY_CURRENT_MONTH = 'fintrack_current_month_key_v4';

export function loadAllBudgets(): Record<string, MonthlyBudget> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!raw) {
      const initialMap: Record<string, MonthlyBudget> = {};
      
      // Add current cycle (Cycle 1)
      initialMap[INITIAL_MONTHLY_DATA.monthKey] = INITIAL_MONTHLY_DATA;

      // Add upcoming cycles
      PAST_MONTHS_SAMPLE.forEach(b => {
        initialMap[b.monthKey] = b;
      });
      
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(initialMap));
      return initialMap;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading budgets from storage:', err);
    return { [INITIAL_MONTHLY_DATA.monthKey]: INITIAL_MONTHLY_DATA };
  }
}

export function saveAllBudgets(budgets: Record<string, MonthlyBudget>): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  } catch (err) {
    console.error('Error saving budgets to storage:', err);
  }
}

export function getSavedActiveMonth(): string {
  return localStorage.getItem(STORAGE_KEY_CURRENT_MONTH) || 'cycle-1';
}

export function setSavedActiveMonth(monthKey: string): void {
  localStorage.setItem(STORAGE_KEY_CURRENT_MONTH, monthKey);
}

/**
 * Creates or initialises a budget for a given cycle
 * with automatic rollover from previous cycle if available!
 */
export function createMonthWithRollover(
  monthKey: string,
  existingBudgets: Record<string, MonthlyBudget>
): MonthlyBudget {
  const prevBudget = existingBudgets['cycle-1'] || Object.values(existingBudgets)[0];

  let startingBalance = 30000;
  let copiedCategories = INITIAL_CATEGORIES.map(c => ({
    ...c,
    plannedLimit: c.id === 'phd_fees' && monthKey !== 'cycle-1' ? 5000 : c.normalPlan
  }));

  if (prevBudget) {
    const prevSpent = prevBudget.expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const prevNetRemaining = (prevBudget.startingBalance || 0) + (prevBudget.salary || 0) - prevSpent;
    startingBalance = Math.max(0, prevNetRemaining);
  }

  return {
    monthKey,
    monthName: monthKey === 'cycle-2' ? 'Cycle 2 (7 Dec 2026 – 6 Jan 2027)' : monthKey === 'cycle-3' ? 'Cycle 3 (7 Jan 2027 – 6 Feb 2027)' : `Cycle (${monthKey})`,
    cycleStartDate: '2026-12-07',
    cycleEndDate: '2027-01-06',
    salary: 45000,
    payday: 7,
    startingBalance,
    categories: copiedCategories,
    expenses: [],
    notes: `Rollover from previous cycle: Opening cash balance set to ₹${startingBalance.toLocaleString('en-IN')}`
  };
}

export type PriorityLevel = 'high' | 'medium' | 'low';
export type CategoryGroupType = 'Priority' | 'Essential' | 'Fixed' | 'Fixed (EMI)' | 'Flexible' | 'Remainder';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  categoryType: CategoryGroupType;
  normalPlan: number; // Normal monthly plan (out of ₹45,000 salary)
  plannedLimit: number; // This cycle limit (e.g., out of ₹30,000 cash)
  priority: PriorityLevel;
  isSinkingFund?: boolean;
  targetGoalTotal?: number;
  targetDueDate?: string;
  accumulatedSavings?: number;
  description?: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  categoryId: string;
  title: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  priority: PriorityLevel;
  category?: string;
  completed: boolean;
  createdAt: string;
  amountLinked?: number;
  notes?: string;
}

export interface MonthlyBudget {
  monthKey: string; // "cycle-1"
  monthName: string; // "Cycle 1 (10 Nov – 6 Dec 2026)"
  cycleStartDate: string; // "2026-11-10"
  cycleEndDate: string; // "2026-12-06"
  salary: number; // 45000
  payday: number; // 7
  startingBalance: number; // 30000
  categories: Category[];
  expenses: Expense[];
  tasks?: TaskItem[];
  notes?: string;
}

export interface CategoryGuideItem {
  query: string;
  recommendedCategory: string;
  explanation: string;
  exampleKeywords: string[];
  priorityTip: string;
}

import { MonthlyBudget, Expense, TaskItem } from '../types';

const API_BASE = '/api';

export async function fetchBudgetsFromDB(): Promise<Record<string, MonthlyBudget> | null> {
  try {
    const res = await fetch(`${API_BASE}/budgets`);
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    return Object.keys(data).length > 0 ? data : null;
  } catch (err) {
    console.warn('[API] Could not fetch from SQLite DB, using local cache:', err);
    return null;
  }
}

export async function saveBudgetToDB(budget: MonthlyBudget): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not save budget to SQLite DB:', err);
    return false;
  }
}

export async function saveExpenseToDB(expense: Expense & { monthKey: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not save expense to SQLite DB:', err);
    return false;
  }
}

export async function deleteExpenseFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not delete expense from SQLite DB:', err);
    return false;
  }
}

export async function saveTaskToDB(task: TaskItem & { monthKey: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not save task to SQLite DB:', err);
    return false;
  }
}

export async function toggleTaskInDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PUT'
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not toggle task in SQLite DB:', err);
    return false;
  }
}

export async function deleteTaskFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not delete task from SQLite DB:', err);
    return false;
  }
}

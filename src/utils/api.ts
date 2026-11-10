import { MonthlyBudget, Expense, TaskItem } from '../types';

const API_BASE = '/api';

export async function fetchBudgetsFromDB(): Promise<Record<string, MonthlyBudget> | null> {
  try {
    const res = await fetch(`${API_BASE}/budgets?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    return Object.keys(data).length > 0 ? data : null;
  } catch (err) {
    console.warn('[API] Could not fetch from SQLite DB, using local cache:', err);
    return null;
  }
}

export async function fetchDBVersion(): Promise<{ revision: number; activeDevices: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/version?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
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

export async function updateCategoryLimitInDB(categoryId: string, monthKey: string, plannedLimit: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthKey, plannedLimit })
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not update category in SQLite DB:', err);
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

export async function updateExpenseInDB(expense: Expense): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/expenses/${expense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Could not update expense in SQLite DB:', err);
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

/**
 * Real-time Server-Sent Events (SSE) listener
 * Automatically triggers callback whenever any change is made on phone, website, or backend!
 */
export function subscribeToSyncEvents(onEvent: (event: { type: string; revision: number }) => void): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    try {
      eventSource = new EventSource(`${API_BASE}/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
        } catch {
          // heartbeat or unparseable
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Try reconnecting in 3 seconds
        if (!isClosed) {
          setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.warn('[Sync] Could not establish EventSource, fallback to polling:', err);
      if (!isClosed) {
        setTimeout(connect, 5000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

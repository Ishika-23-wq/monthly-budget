import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logger for phone and web debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/events' && req.originalUrl !== '/api/health') {
      console.log(`[HTTP] ${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Initialize SQLite Database in the project root
const dbPath = path.join(__dirname, 'fintrack.db');
const db = new DatabaseSync(dbPath);
console.log(`[SQLite] Database opened at ${dbPath}`);

// Initialize tables for multi-year persistence
db.exec(`
  CREATE TABLE IF NOT EXISTS budgets (
    monthKey TEXT PRIMARY KEY,
    monthName TEXT,
    cycleStartDate TEXT,
    cycleEndDate TEXT,
    salary REAL,
    payday INTEGER,
    startingBalance REAL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT,
    monthKey TEXT,
    name TEXT,
    icon TEXT,
    color TEXT,
    categoryType TEXT,
    normalPlan REAL,
    plannedLimit REAL,
    priority TEXT,
    isSinkingFund INTEGER,
    targetGoalTotal REAL,
    targetDueDate TEXT,
    accumulatedSavings REAL,
    description TEXT,
    isCustom INTEGER,
    PRIMARY KEY(id, monthKey)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    monthKey TEXT,
    date TEXT,
    amount REAL,
    categoryId TEXT,
    title TEXT,
    paymentMethod TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    monthKey TEXT,
    title TEXT,
    deadline TEXT,
    priority TEXT,
    category TEXT,
    completed INTEGER,
    createdAt TEXT,
    amountLinked REAL,
    notes TEXT
  );
`);

// Ensure complete seed data for November 2026, December 2026, January 2027
function ensureSeedData() {
  const c1 = db.prepare('SELECT * FROM budgets WHERE monthKey = ?').get('cycle-1');
  if (!c1 || !c1.monthName || c1.monthName.trim() === '') {
    console.log('[SQLite] 📦 Ensuring complete November 2026 data in database...');
    db.prepare(`
      INSERT OR REPLACE INTO budgets (monthKey, monthName, cycleStartDate, cycleEndDate, salary, payday, startingBalance, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'cycle-1',
      'November 2026 (10 Nov – 6 Dec 2026)',
      '2026-11-10',
      '2026-12-06',
      45000,
      7,
      30000,
      'November 2026: 10 Nov to 6 Dec 2026. Next salary on 7 Dec 2026. Prioritizing Sister fees (₹15,000 cash set aside). PhD fees start in January.'
    );

    const defaultCats = [
      { id: 'sister_fees', name: "Sister's Fees", icon: 'GraduationCap', color: 'rose', categoryType: 'Priority', normalPlan: 16667, plannedLimit: 15000, priority: 'high', isSinkingFund: 1, targetGoalTotal: 100000, targetDueDate: '2026-12-07', accumulatedSavings: 30000, description: "Semester fees, exam fee, books, uniform for your sister. (Due 7 Dec 2026; ₹1 Lakh every 6 months)." },
      { id: 'phd_fees', name: 'PhD Fees (Own)', icon: 'BookOpen', color: 'violet', categoryType: 'Priority', normalPlan: 5000, plannedLimit: 0, priority: 'high', isSinkingFund: 1, targetGoalTotal: 30000, targetDueDate: '2027-01-15', accumulatedSavings: 0, description: "Your PhD semester fees: ₹30,000 per semester (every 6 months = ₹5,000/mo). Starts in January 2027!" },
      { id: 'rent_bills', name: 'Rent & Bills', icon: 'Home', color: 'indigo', categoryType: 'Fixed', normalPlan: 8000, plannedLimit: 1500, priority: 'high', isSinkingFund: 0, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Room/house rent, electricity, water, gas cylinder, WiFi, mobile recharge. (Assumed: November rent already paid.)" },
      { id: 'groceries', name: 'Grocery', icon: 'ShoppingCart', color: 'emerald', categoryType: 'Essential', normalPlan: 3500, plannedLimit: 3500, priority: 'high', isSinkingFund: 0, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Vegetables, fruits, milk, atta/rice, kitchen and household items, Blinkit/Zepto/BigBasket." },
      { id: 'travelling', name: 'Travelling', icon: 'Bus', color: 'blue', categoryType: 'Fixed', normalPlan: 5000, plannedLimit: 4500, priority: 'high', isSinkingFund: 0, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Daily bus, metro, auto, Ola/Uber for work or college." },
      { id: 'car', name: 'Car', icon: 'Car', color: 'amber', categoryType: 'Fixed', normalPlan: 1500, plannedLimit: 1500, priority: 'low', isSinkingFund: 1, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Petrol/diesel/CNG, car wash, service, insurance, parking, tolls." },
      { id: 'iphone', name: 'iPhone', icon: 'Smartphone', color: 'pink', categoryType: 'Fixed (EMI)', normalPlan: 3000, plannedLimit: 3000, priority: 'medium', isSinkingFund: 1, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "iPhone EMI, AppleCare, cover, charger, screen guard. (Set to 0 if no EMI falls before salary day.)" },
      { id: 'personal', name: 'Personal', icon: 'ShoppingBag', color: 'purple', categoryType: 'Flexible', normalPlan: 1200, plannedLimit: 1000, priority: 'medium', isSinkingFund: 0, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Shopping for yourself (clothes, shoes, gadgets), restaurants and cafes, Swiggy/Zomato, movies, salon, medicine, gifts." },
      { id: 'gym', name: 'Gym', icon: 'Dumbbell', color: 'orange', categoryType: 'Flexible', normalPlan: 600, plannedLimit: 0, priority: 'low', isSinkingFund: 0, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Gym fees, protein, supplements. (0 this month to protect the fees.)" },
      { id: 'trips', name: 'Trips', icon: 'Plane', color: 'sky', categoryType: 'Flexible', normalPlan: 533, plannedLimit: 0, priority: 'low', isSinkingFund: 1, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Trip tickets, hotel, food and shopping during a trip. (0 this month to protect the fees.)" },
      { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: 'teal', categoryType: 'Remainder', normalPlan: 0, plannedLimit: 0, priority: 'medium', isSinkingFund: 1, targetGoalTotal: 0, targetDueDate: '', accumulatedSavings: 0, description: "Money moved to savings account, RD/FD/SIP, emergency fund. Normal plan balance." }
    ];

    const insertCat = db.prepare(`
      INSERT OR REPLACE INTO categories (id, monthKey, name, icon, color, categoryType, normalPlan, plannedLimit, priority, isSinkingFund, targetGoalTotal, targetDueDate, accumulatedSavings, description, isCustom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of defaultCats) {
      insertCat.run(c.id, 'cycle-1', c.name, c.icon, c.color, c.categoryType, c.normalPlan, c.plannedLimit, c.priority, c.isSinkingFund, c.targetGoalTotal, c.targetDueDate, c.accumulatedSavings, c.description, 0);
    }
  }
}
ensureSeedData();

// -------------------------------------------------------------
// Real-Time Multi-Device Sync Engine (SSE)
// -------------------------------------------------------------
const sseClients = new Set();
let dbRevision = Date.now();

function broadcastChange(type, detail = {}) {
  dbRevision = Date.now();
  console.log(`[Sync Engine] ⚡ Broadcasting '${type}' (rev: ${dbRevision}) to ${sseClients.size} active device(s)`);
  const payload = JSON.stringify({
    type,
    detail,
    revision: dbRevision,
    timestamp: new Date().toISOString()
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15 seconds to prevent phone sleep disconnects
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(`: heartbeat\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// SSE stream endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  sseClients.add(res);
  console.log(`[Sync Engine] 📱 Device connected. Total connected: ${sseClients.size}`);

  // Send current revision immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'connected', revision: dbRevision })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
    console.log(`[Sync Engine] 📴 Device disconnected. Total connected: ${sseClients.size}`);
  });
});

// Quick DB revision check
app.get('/api/version', (req, res) => {
  res.json({
    revision: dbRevision,
    activeDevices: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Budgets API
// -------------------------------------------------------------

// API: Get all budgets with categories, expenses, tasks
app.get('/api/budgets', (req, res) => {
  try {
    const budgetRows = db.prepare('SELECT * FROM budgets ORDER BY cycleStartDate ASC').all();
    const result = {};

    for (const b of budgetRows) {
      const categories = db.prepare('SELECT * FROM categories WHERE monthKey = ?').all(b.monthKey).map(c => ({
        ...c,
        isSinkingFund: Boolean(c.isSinkingFund),
        isCustom: Boolean(c.isCustom)
      }));

      const expenses = db.prepare('SELECT * FROM expenses WHERE monthKey = ? ORDER BY date DESC').all(b.monthKey);

      const tasks = db.prepare('SELECT * FROM tasks WHERE monthKey = ? ORDER BY deadline ASC').all(b.monthKey).map(t => ({
        ...t,
        completed: Boolean(t.completed)
      }));

      result[b.monthKey] = {
        ...b,
        categories,
        expenses,
        tasks
      };
    }

    res.json(result);
  } catch (err) {
    console.error('[SQLite] Error fetching budgets:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Save or update an entire budget structure
app.post('/api/budgets', (req, res) => {
  try {
    const b = req.body;
    if (!b || !b.monthKey) {
      return res.status(400).json({ error: 'Missing monthKey' });
    }

    const existing = db.prepare('SELECT * FROM budgets WHERE monthKey = ?').get(b.monthKey);

    const monthName = (b.monthName && b.monthName.trim() !== '')
      ? b.monthName
      : (existing?.monthName || (b.monthKey === 'cycle-1' ? 'November 2026 (10 Nov – 6 Dec 2026)' : b.monthKey === 'cycle-2' ? 'December 2026 (7 Dec 2026 – 6 Jan 2027)' : 'January 2027 (7 Jan 2027 – 6 Feb 2027)'));

    const cycleStartDate = (b.cycleStartDate && b.cycleStartDate.trim() !== '')
      ? b.cycleStartDate
      : (existing?.cycleStartDate || (b.monthKey === 'cycle-1' ? '2026-11-10' : b.monthKey === 'cycle-2' ? '2026-12-07' : '2027-01-07'));

    const cycleEndDate = (b.cycleEndDate && b.cycleEndDate.trim() !== '')
      ? b.cycleEndDate
      : (existing?.cycleEndDate || (b.monthKey === 'cycle-1' ? '2026-12-06' : b.monthKey === 'cycle-2' ? '2027-01-06' : '2027-02-06'));

    const salary = b.salary !== undefined ? Number(b.salary) : (existing?.salary || 45000);
    const payday = b.payday !== undefined ? Number(b.payday) : (existing?.payday || 7);
    const startingBalance = b.startingBalance !== undefined && b.startingBalance !== 0
      ? Number(b.startingBalance)
      : (existing?.startingBalance ?? (b.monthKey === 'cycle-1' ? 30000 : 30000));
    const notes = (b.notes && b.notes.trim() !== '')
      ? b.notes
      : (existing?.notes || (b.monthKey === 'cycle-1' ? 'November 2026: 10 Nov to 6 Dec 2026. Next salary on 7 Dec 2026. Prioritizing Sister fees (₹15,000 cash set aside). PhD fees start in January.' : ''));

    // Insert or replace budget
    const insertBudget = db.prepare(`
      INSERT OR REPLACE INTO budgets (monthKey, monthName, cycleStartDate, cycleEndDate, salary, payday, startingBalance, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBudget.run(
      b.monthKey,
      monthName,
      cycleStartDate,
      cycleEndDate,
      salary,
      payday,
      startingBalance,
      notes
    );

    // Save categories
    if (Array.isArray(b.categories)) {
      const insertCat = db.prepare(`
        INSERT OR REPLACE INTO categories (id, monthKey, name, icon, color, categoryType, normalPlan, plannedLimit, priority, isSinkingFund, targetGoalTotal, targetDueDate, accumulatedSavings, description, isCustom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of b.categories) {
        insertCat.run(
          c.id,
          b.monthKey,
          c.name,
          c.icon,
          c.color || 'slate',
          c.categoryType || 'Flexible',
          c.normalPlan || 0,
          c.plannedLimit || 0,
          c.priority || 'medium',
          c.isSinkingFund ? 1 : 0,
          c.targetGoalTotal || 0,
          c.targetDueDate || '',
          c.accumulatedSavings || 0,
          c.description || '',
          c.isCustom ? 1 : 0
        );
      }
    }

    // Save expenses
    if (Array.isArray(b.expenses)) {
      const insertExp = db.prepare(`
        INSERT OR REPLACE INTO expenses (id, monthKey, date, amount, categoryId, title, paymentMethod, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const e of b.expenses) {
        insertExp.run(
          e.id,
          b.monthKey,
          e.date,
          e.amount,
          e.categoryId,
          e.title,
          e.paymentMethod || 'UPI',
          e.notes || ''
        );
      }
    }

    // Save tasks
    if (Array.isArray(b.tasks)) {
      const insertTask = db.prepare(`
        INSERT OR REPLACE INTO tasks (id, monthKey, title, deadline, priority, category, completed, createdAt, amountLinked, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of b.tasks) {
        insertTask.run(
          t.id,
          b.monthKey,
          t.title,
          t.deadline,
          t.priority || 'medium',
          t.category || 'General',
          t.completed ? 1 : 0,
          t.createdAt || new Date().toISOString(),
          t.amountLinked || 0,
          t.notes || ''
        );
      }
    }

    broadcastChange('budget_updated', { monthKey: b.monthKey });
    res.json({ success: true, monthKey: b.monthKey });
  } catch (err) {
    console.error('[SQLite] Error saving budget:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Direct category limit update
app.put('/api/categories/:id', (req, res) => {
  try {
    const { monthKey, plannedLimit } = req.body;
    db.prepare('UPDATE categories SET plannedLimit = ? WHERE id = ? AND monthKey = ?')
      .run(plannedLimit, req.params.id, monthKey);

    broadcastChange('category_updated', { id: req.params.id, monthKey, plannedLimit });
    res.json({ success: true, id: req.params.id, plannedLimit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Expenses API
// -------------------------------------------------------------

// API: Add or update single expense
app.post('/api/expenses', (req, res) => {
  try {
    const e = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO expenses (id, monthKey, date, amount, categoryId, title, paymentMethod, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      e.id,
      e.monthKey,
      e.date,
      e.amount,
      e.categoryId,
      e.title,
      e.paymentMethod || 'UPI',
      e.notes || ''
    );

    broadcastChange('expense_added', { id: e.id, monthKey: e.monthKey, amount: e.amount });
    res.json({ success: true, id: e.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update an existing expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const e = req.body;
    const stmt = db.prepare(`
      UPDATE expenses SET date = ?, amount = ?, categoryId = ?, title = ?, paymentMethod = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run(
      e.date,
      e.amount,
      e.categoryId,
      e.title,
      e.paymentMethod || 'UPI',
      e.notes || '',
      req.params.id
    );

    broadcastChange('expense_updated', { id: req.params.id, amount: e.amount });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    broadcastChange('expense_deleted', { id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Tasks API
// -------------------------------------------------------------

// API: Get all tasks (optionally filtered by monthKey)
app.get('/api/tasks', (req, res) => {
  try {
    const { monthKey } = req.query;
    let query = 'SELECT * FROM tasks ORDER BY deadline ASC';
    let params = [];
    if (monthKey) {
      query = 'SELECT * FROM tasks WHERE monthKey = ? ORDER BY deadline ASC';
      params = [monthKey];
    }
    const tasks = db.prepare(query).all(...params).map(t => ({
      ...t,
      completed: Boolean(t.completed)
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add or update task
app.post('/api/tasks', (req, res) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO tasks (id, monthKey, title, deadline, priority, category, completed, createdAt, amountLinked, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      t.id,
      t.monthKey,
      t.title,
      t.deadline,
      t.priority || 'medium',
      t.category || 'General',
      t.completed ? 1 : 0,
      t.createdAt || new Date().toISOString(),
      t.amountLinked || 0,
      t.notes || ''
    );

    broadcastChange('task_added', { id: t.id });
    res.json({ success: true, id: t.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Toggle task
app.put('/api/tasks/:id/toggle', (req, res) => {
  try {
    const current = db.prepare('SELECT completed FROM tasks WHERE id = ?').get(req.params.id);
    if (current) {
      const nextVal = current.completed ? 0 : 1;
      db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(nextVal, req.params.id);
      broadcastChange('task_toggled', { id: req.params.id, completed: Boolean(nextVal) });
      res.json({ success: true, completed: Boolean(nextVal) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    broadcastChange('task_deleted', { id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    db: 'sqlite',
    path: dbPath,
    activeDevices: sseClients.size,
    revision: dbRevision,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] SQLite API server with Real-time Sync running on http://0.0.0.0:${PORT}`);
});

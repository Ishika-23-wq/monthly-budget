import { Category, CategoryGuideItem, MonthlyBudget } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'sister_fees',
    name: "Sister's Fees",
    icon: 'GraduationCap',
    color: 'rose',
    categoryType: 'Priority',
    normalPlan: 16667, // Normal monthly plan (₹1 Lakh / 6 mo)
    plannedLimit: 15000, // This month limit (out of ₹30,000 cash)
    priority: 'high',
    isSinkingFund: true,
    targetGoalTotal: 100000,
    targetDueDate: '2026-12-07',
    accumulatedSavings: 30000,
    description: "Semester fees, exam fee, books, uniform for your sister. (Due 7 Dec 2026; ₹1 Lakh every 6 months)."
  },
  {
    id: 'phd_fees',
    name: 'PhD Fees (Own)',
    icon: 'BookOpen',
    color: 'violet',
    categoryType: 'Priority',
    normalPlan: 5000, // ₹30,000 / 6 months = ₹5,000 per month
    plannedLimit: 0, // 0 in November as it starts in January
    priority: 'high',
    isSinkingFund: true,
    targetGoalTotal: 30000,
    targetDueDate: '2027-01-15',
    accumulatedSavings: 0,
    description: "Your PhD semester fees: ₹30,000 per semester (every 6 months = ₹5,000/mo). Starts in January 2027!"
  },
  {
    id: 'rent_bills',
    name: 'Rent & Bills',
    icon: 'Home',
    color: 'indigo',
    categoryType: 'Fixed',
    normalPlan: 8000, // Adjusted to accommodate PhD fees
    plannedLimit: 1500, // Assumed November rent already paid; ₹1,500 for WiFi & utility bills
    priority: 'high',
    description: "Room/house rent, electricity, water, gas cylinder, WiFi, mobile recharge. (Assumed: November rent already paid.)"
  },
  {
    id: 'groceries',
    name: 'Grocery',
    icon: 'ShoppingCart',
    color: 'emerald',
    categoryType: 'Essential',
    normalPlan: 3500,
    plannedLimit: 3500,
    priority: 'high',
    description: "Vegetables, fruits, milk, atta/rice, kitchen and household items, Blinkit/Zepto/BigBasket."
  },
  {
    id: 'travelling',
    name: 'Travelling',
    icon: 'Bus',
    color: 'blue',
    categoryType: 'Fixed',
    normalPlan: 5000,
    plannedLimit: 4500, // Pro-rated for 27 days
    priority: 'high',
    description: "Daily bus, metro, auto, Ola/Uber for work or college."
  },
  {
    id: 'car',
    name: 'Car',
    icon: 'Car',
    color: 'amber',
    categoryType: 'Fixed',
    normalPlan: 1500,
    plannedLimit: 1500,
    priority: 'low',
    isSinkingFund: true,
    description: "Petrol/diesel/CNG, car wash, service, insurance, parking, tolls."
  },
  {
    id: 'iphone',
    name: 'iPhone',
    icon: 'Smartphone',
    color: 'pink',
    categoryType: 'Fixed (EMI)',
    normalPlan: 3000,
    plannedLimit: 3000,
    priority: 'medium',
    isSinkingFund: true,
    description: "iPhone EMI, AppleCare, cover, charger, screen guard. (Set to 0 if no EMI falls before salary day.)"
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'ShoppingBag',
    color: 'purple',
    categoryType: 'Flexible',
    normalPlan: 1200,
    plannedLimit: 1000,
    priority: 'medium',
    description: "Shopping for yourself (clothes, shoes, gadgets), restaurants and cafes, Swiggy/Zomato, movies, salon, medicine, gifts."
  },
  {
    id: 'gym',
    name: 'Gym',
    icon: 'Dumbbell',
    color: 'orange',
    categoryType: 'Flexible',
    normalPlan: 600,
    plannedLimit: 0, // 0 this month to protect fees
    priority: 'low',
    description: "Gym fees, protein, supplements. (0 this month to protect the fees.)"
  },
  {
    id: 'trips',
    name: 'Trips',
    icon: 'Plane',
    color: 'sky',
    categoryType: 'Flexible',
    normalPlan: 533,
    plannedLimit: 0, // 0 this month to protect fees
    priority: 'low',
    isSinkingFund: true,
    description: "Trip tickets, hotel, food and shopping during a trip. (0 this month to protect the fees.)"
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: 'PiggyBank',
    color: 'teal',
    categoryType: 'Remainder',
    normalPlan: 0,
    plannedLimit: 0, // 0 this month to protect fees
    priority: 'medium',
    isSinkingFund: true,
    description: "Money moved to savings account, RD/FD/SIP, emergency fund. Normal plan balance."
  }
];

export const CATEGORY_GUIDE_DATABASE: CategoryGuideItem[] = [
  {
    query: 'phd fee',
    recommendedCategory: 'PhD Fees (Own)',
    explanation: 'PhD semester fees, university registration, research guide fee, thesis submission, journal publication costs.',
    exampleKeywords: ['phd', 'ph.d', 'doctorate', 'research', 'thesis', 'phd fee', 'synopsis', 'guide fee'],
    priorityTip: 'HIGH PRIORITY: ₹30,000 due per semester starting January (Save ₹5,000/month from salary).'
  },
  {
    query: 'sister fee',
    recommendedCategory: "Sister's Fees",
    explanation: 'Semester tuition fees, exam fees, college forms, books, uniform for your sister.',
    exampleKeywords: ['fees', 'fee', 'semester', 'college', 'tuition', 'sister', 'tashe', 'exam fee', 'books', 'uniform'],
    priorityTip: 'Priority #1! ₹15,000 set aside this month. Total ₹1 Lakh due 7 Dec 2026.'
  },
  {
    query: 'shopping',
    recommendedCategory: 'Personal',
    explanation: 'Shopping for yourself (clothes, shoes, cosmetics, gadgets, Zara, Myntra, Amazon). Note: Household items bought during shopping go to Grocery.',
    exampleKeywords: ['shopping', 'clothes', 'shoes', 'dress', 'zara', 'h&m', 'myntra', 'makeup', 'amazon'],
    priorityTip: 'Eating into personal limit. Cap strictly to ₹1,000 this month.'
  },
  {
    query: 'restaurant',
    recommendedCategory: 'Personal',
    explanation: 'Restaurant dining, cafes, Starbucks, Swiggy, Zomato, chai with friends. Eating out is a want, so it eats the Personal limit. (If on a trip, it goes under Trips).',
    exampleKeywords: ['restaurant', 'cafe', 'coffee', 'chai', 'swiggy', 'zomato', 'dinner', 'starbucks', 'dominos', 'mcdonalds'],
    priorityTip: 'Outside food is a want, not grocery. Keep it under ₹1,000 for the month.'
  },
  {
    query: 'grocery',
    recommendedCategory: 'Grocery',
    explanation: 'Vegetables, fruits, milk, curd, paneer, atta/rice, kitchen staples, Blinkit, Zepto, BigBasket, DMart.',
    exampleKeywords: ['grocery', 'vegetable', 'fruit', 'milk', 'curd', 'paneer', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'ration'],
    priorityTip: 'Daily safe limit: ₹129.63 / day.'
  },
  {
    query: 'travel',
    recommendedCategory: 'Travelling',
    explanation: 'Daily bus, metro smartcard, auto / e-rickshaw, Uber, Ola, Rapido, local train, bus pass.',
    exampleKeywords: ['travel', 'metro', 'rickshaw', 'auto', 'uber', 'ola', 'bus fare', 'bus pass', 'taxi', 'rapido'],
    priorityTip: 'Daily safe limit: ₹166.67 / day out of your ₹4,500 month allowance.'
  },
  {
    query: 'rent',
    recommendedCategory: 'Rent & Bills',
    explanation: 'Room/house rent, electricity bill, water bill, WiFi/broadband, mobile recharge, gas cylinder.',
    exampleKeywords: ['rent', 'electricity', 'wifi', 'broadband', 'cylinder', 'recharge', 'water bill', 'bills', 'landlord'],
    priorityTip: 'November flat rent assumed paid. ₹1,500 allocated for upcoming bills.'
  },
  {
    query: 'car',
    recommendedCategory: 'Car',
    explanation: 'Petrol, diesel, CNG, car wash, mechanic, servicing, parking, Fastag tolls, insurance.',
    exampleKeywords: ['car', 'petrol', 'diesel', 'cng', 'car wash', 'service', 'mechanic', 'parking', 'toll', 'fastag'],
    priorityTip: 'Month limit set to ₹1,500.'
  },
  {
    query: 'iphone',
    recommendedCategory: 'iPhone',
    explanation: 'iPhone EMI, AppleCare, phone case/cover, charger, screen guard.',
    exampleKeywords: ['iphone', 'apple', 'emi', 'applecare', 'charger', 'screen guard', 'phone cover'],
    priorityTip: '₹3,000 fixed EMI per month.'
  },
  {
    query: 'gym',
    recommendedCategory: 'Gym',
    explanation: 'Gym membership fees, protein powders, creatine, workout supplements.',
    exampleKeywords: ['gym', 'fitness', 'protein', 'creatine', 'supplements', 'workout'],
    priorityTip: 'Temporarily set to ₹0 this month to protect Sister fees.'
  },
  {
    query: 'trip',
    recommendedCategory: 'Trips',
    explanation: 'Trip tickets, hotel, outstation transport, food and shopping during a vacation.',
    exampleKeywords: ['trip', 'vacation', 'hotel', 'flight', 'resort', 'holiday', 'airbnb'],
    priorityTip: 'Temporarily set to ₹0 this month to protect Sister fees.'
  },
  {
    query: 'savings',
    recommendedCategory: 'Savings',
    explanation: 'Money moved to savings account, RD/FD/SIP, emergency fund.',
    exampleKeywords: ['savings', 'fd', 'rd', 'sip', 'emergency fund', 'invest'],
    priorityTip: 'Emergency buffer pool.'
  }
];

export const INITIAL_TASKS = [
  {
    id: 't-1',
    title: "Check students' assignment answer sheets (Batch A & B)",
    deadline: '2026-11-12', // Due in 2 days!
    priority: 'high' as const,
    category: 'Grading & Evaluation',
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Grade CS-101 assignments and record practical marks.'
  },
  {
    id: 't-2',
    title: 'Create Mid-Semester Examination Question Paper',
    deadline: '2026-11-13', // Due in 3 days!
    priority: 'high' as const,
    category: 'Question Paper Prep',
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Prepare 3 sections (MCQs, short answers, numerical problems) + answer key.'
  },
  {
    id: 't-3',
    title: 'Department Faculty Meeting with HOD (Room 204)',
    deadline: '2026-11-13', // Due in 3 days!
    priority: 'high' as const,
    category: 'Meetings',
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Agenda: Winter semester syllabus completion and lab schedules.'
  },
  {
    id: 't-4',
    title: 'PhD Synopsis & Literature Review with Research Guide',
    deadline: '2026-11-18',
    priority: 'high' as const,
    category: 'PhD Research',
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Present draft chapter 2 and experimental methodology results.'
  },
  {
    id: 't-5',
    title: "Submit Students' Attendance & Internal Marks to Portal",
    deadline: '2026-11-22',
    priority: 'medium' as const,
    category: 'Teaching & Sheets',
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Finalize portal entries before the cutoff date.'
  },
  {
    id: 't-6',
    title: "Pay Sister's Semester Fees (Part 1)",
    deadline: '2026-12-07',
    priority: 'high' as const,
    category: 'Finance / Fees',
    amountLinked: 50000,
    completed: false,
    createdAt: '2026-11-10',
    notes: 'Priority #1 financial deadline. Request 2-part college installment.'
  }
];

export const INITIAL_MONTHLY_DATA: MonthlyBudget = {
  monthKey: 'cycle-1',
  monthName: 'Nov 2026 (10 Nov – 6 Dec 2026)',
  cycleStartDate: '2026-11-10',
  cycleEndDate: '2026-12-06',
  salary: 45000,
  payday: 7,
  startingBalance: 30000, // Exact cash in hand as per Excel
  categories: INITIAL_CATEGORIES,
  expenses: [],
  tasks: INITIAL_TASKS,
  notes: 'November 2026: 10 Nov to 6 Dec 2026. Next salary on 7 Dec 2026. Prioritizing Sister fees (₹15,000 cash set aside). PhD fees start in January.'
};

export const PAST_MONTHS_SAMPLE: MonthlyBudget[] = [
  {
    monthKey: 'cycle-2',
    monthName: 'Dec 2026 (7 Dec 2026 – 6 Jan 2027)',
    cycleStartDate: '2026-12-07',
    cycleEndDate: '2027-01-06',
    salary: 45000,
    payday: 7,
    startingBalance: 30000,
    categories: INITIAL_CATEGORIES.map(c => ({
      ...c,
      plannedLimit: c.normalPlan
    })),
    expenses: [],
    notes: 'December 2026: Sister fee due date on 7 Dec. Pre-planning PhD fees starting January.'
  },
  {
    monthKey: 'cycle-3',
    monthName: 'Jan 2027 (7 Jan 2027 – 6 Feb 2027)',
    cycleStartDate: '2027-01-07',
    cycleEndDate: '2027-02-06',
    salary: 45000,
    payday: 7,
    startingBalance: 25000,
    categories: INITIAL_CATEGORIES.map(c => ({
      ...c,
      plannedLimit: c.id === 'phd_fees' ? 5000 : c.normalPlan
    })),
    expenses: [],
    notes: 'January 2027: January PhD Semester fees active! ₹5,000/mo auto-allocated.'
  }
];

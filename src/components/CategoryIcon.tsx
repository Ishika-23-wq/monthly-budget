import React from 'react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

// Maps icon name identifiers to Font Awesome icon classes
const FONT_AWESOME_MAP: Record<string, string> = {
  GraduationCap: 'fa-solid fa-graduation-cap',
  BookOpen: 'fa-solid fa-book-open',
  Award: 'fa-solid fa-award',
  Bus: 'fa-solid fa-bus',
  Home: 'fa-solid fa-house',
  ShoppingCart: 'fa-solid fa-cart-shopping',
  PiggyBank: 'fa-solid fa-piggy-bank',
  ShoppingBag: 'fa-solid fa-bag-shopping',
  Dumbbell: 'fa-solid fa-dumbbell',
  Plane: 'fa-solid fa-plane-departure',
  Car: 'fa-solid fa-car-side',
  Smartphone: 'fa-solid fa-mobile-screen-button',
  Utensils: 'fa-solid fa-utensils',
  CreditCard: 'fa-solid fa-credit-card',
  Coffee: 'fa-solid fa-mug-hot',
  Heart: 'fa-solid fa-heart',
  Gift: 'fa-solid fa-gift',
  Zap: 'fa-solid fa-bolt',
  Music: 'fa-solid fa-music',
  FolderPlus: 'fa-solid fa-folder-plus',
  Tag: 'fa-solid fa-tag',
  FileCheck: 'fa-solid fa-file-circle-check',
  ClipboardList: 'fa-solid fa-clipboard-list',
  Users: 'fa-solid fa-users',
  Bell: 'fa-solid fa-bell',
  Calendar: 'fa-solid fa-calendar-days',
  ChartPie: 'fa-solid fa-chart-pie',
  MoneyBill: 'fa-solid fa-money-bill-wave'
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const iconClass = FONT_AWESOME_MAP[name] || 'fa-solid fa-tag';
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <i className={iconClass}></i>
    </span>
  );
};

export const AVAILABLE_ICONS = [
  'GraduationCap',
  'BookOpen',
  'Award',
  'Bus',
  'Home',
  'ShoppingCart',
  'PiggyBank',
  'ShoppingBag',
  'Dumbbell',
  'Plane',
  'Car',
  'Smartphone',
  'Utensils',
  'Coffee',
  'Zap',
  'Heart',
  'Gift',
  'Music'
];

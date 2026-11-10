import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Bus,
  Home,
  ShoppingCart,
  PiggyBank,
  ShoppingBag,
  Dumbbell,
  Plane,
  Car,
  Smartphone,
  Utensils,
  CreditCard,
  Tag,
  Coffee,
  Heart,
  Gift,
  Zap,
  Music,
  FolderPlus
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const iconMap: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className={className} />,
    BookOpen: <BookOpen className={className} />,
    Award: <Award className={className} />,
    Bus: <Bus className={className} />,
    Home: <Home className={className} />,
    ShoppingCart: <ShoppingCart className={className} />,
    PiggyBank: <PiggyBank className={className} />,
    ShoppingBag: <ShoppingBag className={className} />,
    Dumbbell: <Dumbbell className={className} />,
    Plane: <Plane className={className} />,
    Car: <Car className={className} />,
    Smartphone: <Smartphone className={className} />,
    Utensils: <Utensils className={className} />,
    CreditCard: <CreditCard className={className} />,
    Coffee: <Coffee className={className} />,
    Heart: <Heart className={className} />,
    Gift: <Gift className={className} />,
    Zap: <Zap className={className} />,
    Music: <Music className={className} />,
    FolderPlus: <FolderPlus className={className} />
  };

  return iconMap[name] || <Tag className={className} />;
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

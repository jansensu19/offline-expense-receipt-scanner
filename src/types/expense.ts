import { Utensils, Laptop, Plane, ShoppingBag} from 'lucide-react-native';

export type ExpenseCategory = 'Food' | 'Tech' | 'Travel' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Tech',
  'Travel',
  'Other',
];

export const CATEGORY_CONFIG = {
  Food: { icon: Utensils, color: '#F97316' },
  Tech: { icon: Laptop, color: '#3B82F6' },
  Travel: { icon: Plane, color: '#10B981' },
  Other: { icon: ShoppingBag, color: '#A855F7' },
} satisfies Record<
  ExpenseCategory,
  { icon: typeof Utensils; color: string }
>;

export interface Expense {
  id: string;
  merchant: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  receiptUri?: string;
}

export type Currency = 'IDR' | 'USD' | 'EUR';

export const CURRENCY: Currency = 'IDR';
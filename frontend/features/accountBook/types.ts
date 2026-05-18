export type TransactionType = 'expense' | 'income';

export type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface RepeatRule {
  id: number;
  frequency: RepeatFrequency;
  interval: number;
  startDate: string;
  endDate?: string | null;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  title: string;
  memo?: string;
  date: string;
  categoryId: number;
  paymentMethodId?: number | null;
  repeatRuleId?: number | null;
}

export interface TransactionWithMeta extends Transaction {
  category: Category;
  paymentMethod?: PaymentMethod | null;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: TransactionWithMeta[];
}

export interface MonthlyCategoryAnalysis {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percent: number;
}

export interface MonthlyAnalysis {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  categoryAnalysis: MonthlyCategoryAnalysis[];
}

export interface BalanceSummary {
  currentBalance: number;
  diffFromYesterday: number;
}

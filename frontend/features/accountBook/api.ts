import { deleteJson, getJson, patchJson, postJson } from '@/lib/api-client';

import type {
  BalanceSummary,
  Category,
  DailySummary,
  MonthlyAnalysis,
  MonthlyCategoryAnalysis,
  PaymentMethod,
  RepeatFrequency,
  RepeatRule,
  Transaction,
  TransactionType,
  TransactionWithMeta,
} from './types';

type BackendTransactionType = 'EXPENSE' | 'INCOME';
type BackendRepeatCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

type BalanceResponse = {
  currentBalance: number;
  differenceFromYesterday: number;
};

type TransactionResponse = {
  amount: number;
  categoryColor: string | null;
  categoryId: number | null;
  categoryName: string | null;
  id: number;
  memo: string | null;
  paymentMethodId: number | null;
  paymentMethodName: string | null;
  repeatRuleId: number | null;
  transactionDate: string;
  type: BackendTransactionType;
};

type DailyTransactionResponse = {
  date: string;
  transactions: TransactionResponse[];
};

type MonthlyTransactionResponse = {
  month: number;
  transactions: TransactionResponse[];
  year: number;
};

type CategoryResponse = {
  color: string;
  id: number;
  isDefault: boolean;
  name: string;
};

type PaymentMethodResponse = {
  id: number;
  isDefault: boolean;
  name: string;
};

type RepeatRuleResponse = {
  cycle: BackendRepeatCycle;
  id: number;
  name: string;
};

const frontendTypeByBackendType: Record<BackendTransactionType, TransactionType> = {
  EXPENSE: 'expense',
  INCOME: 'income',
};

const backendTypeByFrontendType: Record<TransactionType, BackendTransactionType> = {
  expense: 'EXPENSE',
  income: 'INCOME',
};

const backendCycleByFrequency: Record<RepeatFrequency, BackendRepeatCycle> = {
  daily: 'DAILY',
  monthly: 'MONTHLY',
  weekly: 'WEEKLY',
  yearly: 'YEARLY',
};

const frequencyByBackendCycle: Record<BackendRepeatCycle, RepeatFrequency> = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  YEARLY: 'yearly',
};

function toDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getMonthDateStrings(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) =>
    toDateString(new Date(year, month - 1, index + 1))
  );
}

function toTransaction(response: TransactionResponse): TransactionWithMeta {
  const category: Category = {
    color: response.categoryColor ?? '#D9DADB',
    id: response.categoryId ?? 0,
    isDefault: false,
    name: response.categoryName ?? '기타',
  };
  const paymentMethod = response.paymentMethodId
    ? {
        id: response.paymentMethodId,
        name: response.paymentMethodName ?? '결제수단',
      }
    : null;

  return {
    amount: response.amount,
    category,
    categoryId: category.id,
    date: response.transactionDate,
    id: response.id,
    memo: response.memo ?? undefined,
    paymentMethod,
    paymentMethodId: response.paymentMethodId,
    repeatRuleId: response.repeatRuleId,
    title: response.memo?.split('\n')[0] || category.name,
    type: frontendTypeByBackendType[response.type],
  };
}

function toCategory(response: CategoryResponse): Category {
  return {
    color: response.color,
    id: response.id,
    isDefault: response.isDefault,
    name: response.name,
  };
}

function toPaymentMethod(response: PaymentMethodResponse): PaymentMethod {
  return {
    id: response.id,
    name: response.name,
  };
}

function toRepeatRule(response: RepeatRuleResponse): RepeatRule {
  return {
    frequency: frequencyByBackendCycle[response.cycle],
    id: response.id,
    interval: 1,
    startDate: toDateString(new Date()),
  };
}

function summarizeTransactions(transactions: TransactionWithMeta[], date: string): DailySummary {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    balance: income - expense,
    date,
    expense,
    income,
    transactions,
  };
}

function buildMonthlyAnalysis(year: number, month: number, transactions: TransactionWithMeta[]): MonthlyAnalysis {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const categoryMap = new Map<number, MonthlyCategoryAnalysis>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const current = categoryMap.get(transaction.categoryId) ?? {
        amount: 0,
        categoryId: transaction.categoryId,
        categoryName: transaction.category.name,
        color: transaction.category.color,
        percent: 0,
      };

      categoryMap.set(transaction.categoryId, {
        ...current,
        amount: current.amount + transaction.amount,
      });
    });

  const categoryAnalysis = Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      percent: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0,
    }))
    .sort((first, second) => second.amount - first.amount);

  return {
    categoryAnalysis,
    month,
    totalExpense,
    totalIncome,
    year,
  };
}

async function getMonthlyTransactions(year: number, month: number) {
  const response = await getJson<MonthlyTransactionResponse>(
    `/api/account-books/transactions/monthly?year=${year}&month=${month}`
  );

  return response.transactions.map(toTransaction);
}

export async function getMonthlyCalendar(year: number, month: number): Promise<DailySummary[]> {
  const transactions = await getMonthlyTransactions(year, month);
  const transactionsByDate = transactions.reduce<Record<string, TransactionWithMeta[]>>((grouped, transaction) => {
    grouped[transaction.date] = [...(grouped[transaction.date] ?? []), transaction];
    return grouped;
  }, {});

  return getMonthDateStrings(year, month).map((date) => summarizeTransactions(transactionsByDate[date] ?? [], date));
}

export async function getTransactionsByDate(date: string): Promise<TransactionWithMeta[]> {
  const response = await getJson<DailyTransactionResponse>(
    `/api/account-books/transactions?date=${encodeURIComponent(date)}`
  );

  return response.transactions.map(toTransaction);
}

export async function getMonthlyAnalysis(year: number, month: number): Promise<MonthlyAnalysis> {
  return buildMonthlyAnalysis(year, month, await getMonthlyTransactions(year, month));
}

export async function getBalanceSummary(): Promise<BalanceSummary> {
  const response = await getJson<BalanceResponse>('/api/account-books/balance');

  return {
    currentBalance: response.currentBalance,
    diffFromYesterday: response.differenceFromYesterday,
  };
}

export async function createTransaction(payload: Omit<Transaction, 'id'>): Promise<Transaction> {
  const response = await postJson<TransactionResponse>('/api/account-books/transactions', {
    amount: payload.amount,
    categoryId: payload.categoryId,
    memo: [payload.title, payload.memo].filter(Boolean).join('\n'),
    paymentMethodId: payload.paymentMethodId,
    repeatRuleId: payload.repeatRuleId,
    transactionDate: payload.date,
    type: backendTypeByFrontendType[payload.type],
  });

  return toTransaction(response);
}

export async function updateTransaction(transactionId: number, payload: Omit<Transaction, 'id'>): Promise<Transaction> {
  const response = await patchJson<TransactionResponse>(`/api/account-books/transactions/${transactionId}`, {
    amount: payload.amount,
    categoryId: payload.categoryId,
    memo: [payload.title, payload.memo].filter(Boolean).join('\n'),
    paymentMethodId: payload.paymentMethodId,
    repeatRuleId: payload.repeatRuleId,
    transactionDate: payload.date,
    type: backendTypeByFrontendType[payload.type],
  });

  return toTransaction(response);
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  await deleteJson<void>(`/api/account-books/transactions/${transactionId}`);
}

export async function createRepeatRule(payload: {
  frequency: RepeatFrequency;
  interval: number;
  startDate: string;
  endDate?: string | null;
}) {
  const response = await postJson<RepeatRuleResponse>('/api/account-books/repeat-rules', {
    cycle: backendCycleByFrequency[payload.frequency],
    name: payload.frequency,
  });

  return toRepeatRule(response);
}

export async function getCategories(): Promise<Category[]> {
  return (await getJson<CategoryResponse[]>('/api/account-books/categories')).map(toCategory);
}

export async function createCategory(payload: Omit<Category, 'id' | 'isDefault'>): Promise<Category> {
  const response = await postJson<CategoryResponse>('/api/account-books/categories', {
    color: payload.color,
    name: payload.name,
    type: 'EXPENSE',
  });

  return toCategory(response);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return (await getJson<PaymentMethodResponse[]>('/api/account-books/payment-methods')).map(toPaymentMethod);
}

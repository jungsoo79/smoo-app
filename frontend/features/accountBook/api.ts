import {
  INITIAL_ASSET,
  accountBookCategories,
  accountBookPaymentMethods,
  accountBookRepeatRules,
  accountBookTransactions,
} from './mock';
import type {
  BalanceSummary,
  Category,
  DailySummary,
  MonthlyAnalysis,
  MonthlyCategoryAnalysis,
  PaymentMethod,
  RepeatFrequency,
  Transaction,
  TransactionWithMeta,
} from './types';

let categories = [...accountBookCategories];
let paymentMethods = [...accountBookPaymentMethods];
let repeatRules = [...accountBookRepeatRules];
let transactions = [...accountBookTransactions];

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

function attachMeta(transaction: Transaction): TransactionWithMeta {
  const category = categories.find((item) => item.id === transaction.categoryId) ?? categories[0];
  const paymentMethod = paymentMethods.find((item) => item.id === transaction.paymentMethodId) ?? null;

  return {
    ...transaction,
    category,
    paymentMethod,
  };
}

function sortTransactions(first: Transaction, second: Transaction) {
  if (first.date !== second.date) {
    return first.date.localeCompare(second.date);
  }

  return first.id - second.id;
}

function getTransactionsThrough(dateString: string) {
  return transactions.filter((transaction) => transaction.date <= dateString);
}

function getBalanceAt(dateString: string) {
  return getTransactionsThrough(dateString).reduce((balance, transaction) => {
    return transaction.type === 'income' ? balance + transaction.amount : balance - transaction.amount;
  }, INITIAL_ASSET);
}

function getTodayForMock() {
  return '2026-05-18';
}

export async function getMonthlyCalendar(year: number, month: number): Promise<DailySummary[]> {
  return getMonthDateStrings(year, month).map((date) => {
    const dayTransactions = transactions
      .filter((transaction) => transaction.date === date)
      .sort(sortTransactions)
      .map(attachMeta);
    const income = dayTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = dayTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      date,
      income,
      expense,
      balance: getBalanceAt(date),
      transactions: dayTransactions,
    };
  });
}

export async function getTransactionsByDate(date: string): Promise<TransactionWithMeta[]> {
  return transactions
    .filter((transaction) => transaction.date === date)
    .sort(sortTransactions)
    .map(attachMeta);
}

export async function getMonthlyAnalysis(year: number, month: number): Promise<MonthlyAnalysis> {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(monthPrefix));
  const totalIncome = monthTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = monthTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const categoryAnalysis: MonthlyCategoryAnalysis[] = categories
    .map((category) => {
      const amount = monthTransactions
        .filter((transaction) => transaction.type === 'expense' && transaction.categoryId === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        amount,
        percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((first, second) => second.amount - first.amount);

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    categoryAnalysis,
  };
}

export async function getBalanceSummary(): Promise<BalanceSummary> {
  const today = getTodayForMock();
  const yesterdayDate = new Date(`${today}T00:00:00`);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const currentBalance = getBalanceAt(today);

  return {
    currentBalance,
    diffFromYesterday: currentBalance - getBalanceAt(toDateString(yesterdayDate)),
  };
}

export async function createTransaction(payload: Omit<Transaction, 'id'>): Promise<Transaction> {
  let repeatRuleId = payload.repeatRuleId ?? null;

  if (repeatRuleId && !repeatRules.some((rule) => rule.id === repeatRuleId)) {
    repeatRuleId = null;
  }

  const transaction: Transaction = {
    ...payload,
    id: Math.max(0, ...transactions.map((item) => item.id)) + 1,
    repeatRuleId,
  };

  transactions = [...transactions, transaction].sort(sortTransactions);

  return transaction;
}

export async function createRepeatRule(payload: {
  frequency: RepeatFrequency;
  interval: number;
  startDate: string;
  endDate?: string | null;
}) {
  const repeatRule = {
    ...payload,
    id: Math.max(0, ...repeatRules.map((item) => item.id)) + 1,
  };

  repeatRules = [...repeatRules, repeatRule];

  return repeatRule;
}

export async function getCategories(): Promise<Category[]> {
  return [...categories];
}

export async function createCategory(payload: Omit<Category, 'id' | 'isDefault'>): Promise<Category> {
  const category: Category = {
    ...payload,
    id: Math.max(0, ...categories.map((item) => item.id)) + 1,
    isDefault: false,
  };

  categories = [...categories, category];

  return category;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return [...paymentMethods];
}

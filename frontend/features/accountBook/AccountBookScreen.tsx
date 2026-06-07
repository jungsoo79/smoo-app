import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
import {
  getBalanceSummary,
  getMonthlyAnalysis,
  getMonthlyCalendar,
  getTransactionsByDate,
} from '@/features/accountBook/api';
import { BalanceCard } from '@/features/accountBook/components/BalanceCard';
import { CalendarMonth } from '@/features/accountBook/components/CalendarMonth';
import { MonthlyAnalysis } from '@/features/accountBook/components/MonthlyAnalysis';
import { TransactionAddSheet } from '@/features/accountBook/components/TransactionAddSheet';
import { TransactionList } from '@/features/accountBook/components/TransactionList';
import type {
  BalanceSummary,
  DailySummary,
  MonthlyAnalysis as MonthlyAnalysisType,
  TransactionWithMeta,
} from '@/features/accountBook/types';

function toLocalDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const initialDate = toLocalDateString(new Date());

function getYearMonth(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function addMonths(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + count);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())).padStart(2, '0'),
  ].join('-');
}

export default function LedgerScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>();
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysisType>();
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionWithMeta[]>([]);
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithMeta | null>(null);
  const { month, year } = useMemo(() => getYearMonth(currentDate), [currentDate]);

  const loadMonth = useCallback(async (dateString: string) => {
    const nextMonth = getYearMonth(dateString);
    const [nextBalanceSummary, nextDailySummaries, nextMonthlyAnalysis] = await Promise.all([
      getBalanceSummary(),
      getMonthlyCalendar(nextMonth.year, nextMonth.month),
      getMonthlyAnalysis(nextMonth.year, nextMonth.month),
    ]);

    setBalanceSummary(nextBalanceSummary);
    setDailySummaries(nextDailySummaries);
    setMonthlyAnalysis(nextMonthlyAnalysis);
  }, []);

  const loadSelectedDate = useCallback(async (dateString: string) => {
    setSelectedTransactions(await getTransactionsByDate(dateString));
  }, []);

  useEffect(() => {
    void loadMonth(currentDate);
  }, [currentDate, loadMonth]);

  useEffect(() => {
    void loadSelectedDate(selectedDate);
  }, [loadSelectedDate, selectedDate]);

  const moveMonth = useCallback(
    (offset: number) => {
      const nextDate = addMonths(currentDate, offset);

      setCurrentDate(nextDate);
      setSelectedDate(nextDate);
    },
    [currentDate]
  );

  const scrollToTransactions = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const selectDate = useCallback((dateString: string) => {
    setSelectedDate(dateString);
    setCurrentDate(dateString);
    scrollToTransactions();
  }, [scrollToTransactions]);

  const refreshAfterSave = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      setCurrentDate(dateString);
      setEditingTransaction(null);
      void loadMonth(dateString);
      void loadSelectedDate(dateString);
    },
    [loadMonth, loadSelectedDate]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.safeArea}>
        <AppTopBar title="가계부" />

        <ScrollView
          ref={scrollRef}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <BalanceCard summary={balanceSummary} />
          <CalendarMonth
            currentDate={currentDate}
            dailySummaries={dailySummaries}
            month={month}
            onMonthChange={moveMonth}
            onSelectDate={selectDate}
            selectedDate={selectedDate}
            todayDate={initialDate}
            year={year}
          />
          <MonthlyAnalysis analysis={monthlyAnalysis} />
          <TransactionList
            date={selectedDate}
            transactions={selectedTransactions}
            onSelectTransaction={(transaction) => {
              setEditingTransaction(transaction);
              setAddSheetVisible(true);
            }}
          />
        </ScrollView>
      </View>

      <AppFloatingActionButton label="가계부 항목 추가" onPress={() => setAddSheetVisible(true)} />

      <TransactionAddSheet
        initialTransaction={editingTransaction}
        initialDate={selectedDate}
        visible={isAddSheetVisible}
        onClose={() => {
          setAddSheetVisible(false);
          setEditingTransaction(null);
        }}
        onSaved={refreshAfterSave}
      />

      <AppBottomNav active="ledger" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 164,
    gap: 40,
  },
});

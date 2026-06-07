import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { HomeWidgetData } from '../types/homeWidget';

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : 0;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function AccountBookWidget({ data }: { data?: HomeWidgetData }) {
  const currentBalance = getNumber(data?.currentBalance);
  const monthlyIncome = getNumber(data?.monthlyIncome);
  const monthlyExpense = getNumber(data?.monthlyExpense);
  const totalMonthlyAmount = monthlyIncome + monthlyExpense;
  const expensePercent = totalMonthlyAmount > 0 ? Math.min(100, Math.round((monthlyExpense / totalMonthlyAmount) * 100)) : 0;

  return (
    <View style={styles.content}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>현재 잔액</Text>
          <Text style={styles.balance}>{formatCurrency(currentBalance)}</Text>
        </View>
        <Text style={styles.percent}>{expensePercent}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${expensePercent}%` }]} />
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>수입 {formatCurrency(monthlyIncome)}</Text>
        <Text style={styles.summaryText}>지출 {formatCurrency(monthlyExpense)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...AppTypography.caption,
    color: AppColors.textMuted,
    fontWeight: '700',
  },
  balance: {
    ...AppTypography.sectionTitle,
    fontWeight: '700',
  },
  percent: {
    ...AppTypography.bodyStrong,
    fontWeight: '800',
  },
  progressTrack: {
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 5,
    backgroundColor: AppColors.surface,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4A90E2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryText: {
    ...AppTypography.caption,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
});

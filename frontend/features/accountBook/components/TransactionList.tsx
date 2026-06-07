import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { TransactionWithMeta } from '../types';
import { formatSelectedDateTitle, formatSignedWon } from './formatters';

export function TransactionList({
  date,
  onSelectTransaction,
  transactions,
}: {
  date: string;
  onSelectTransaction?: (transaction: TransactionWithMeta) => void;
  transactions: TransactionWithMeta[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatSelectedDateTitle(date)}</Text>
        <Text style={styles.count}>거래 {transactions.length}개</Text>
      </View>

      <View style={styles.list}>
        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 거래가 없습니다.</Text>
          </View>
        ) : null}

        {transactions.map((transaction) => (
          <TouchableOpacity
            activeOpacity={0.78}
            key={transaction.id}
            onPress={() => onSelectTransaction?.(transaction)}
            style={styles.item}>
            <View style={styles.itemTextGroup}>
              <Text style={styles.title}>{transaction.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.dot, { backgroundColor: transaction.category.color }]} />
                <Text style={styles.metaText}>{transaction.category.name}</Text>
                {transaction.paymentMethod ? (
                  <Text style={styles.metaText}>· {transaction.paymentMethod.name}</Text>
                ) : null}
              </View>
              {transaction.memo ? <Text style={styles.memo}>{transaction.memo}</Text> : null}
            </View>

            <Text
              style={[
                styles.amount,
                transaction.type === 'expense' ? styles.expenseAmount : styles.incomeAmount,
              ]}>
              {formatSignedWon(transaction.amount, transaction.type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  date: {
    ...AppTypography.sectionTitle,
  },
  count: {
    ...AppTypography.caption,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  emptyCard: {
    minHeight: 72,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  emptyText: {
    color: '#737373',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  item: {
    minHeight: 76,
    padding: 16,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  itemTextGroup: {
    flex: 1,
  },
  title: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  metaText: {
    color: '#474747',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
  },
  memo: {
    marginTop: 4,
    color: '#737373',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  amount: {
    minWidth: 96,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  expenseAmount: {
    color: '#BA1A1A',
  },
  incomeAmount: {
    color: '#15803D',
  },
});

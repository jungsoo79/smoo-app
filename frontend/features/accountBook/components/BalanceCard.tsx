import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import type { BalanceSummary } from '../types';
import { formatWon } from './formatters';

export function BalanceCard({ summary }: { summary?: BalanceSummary }) {
  const diff = summary?.diffFromYesterday ?? 0;
  const isPositive = diff >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <Text style={styles.label}>현재 잔액</Text>
      <Text style={styles.amount}>{formatWon(summary?.currentBalance ?? 0)}</Text>
      <View style={styles.pill}>
        <MaterialIcons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={13}
          color="#FFFFFF"
        />
        <Text style={styles.pillCaption}>전날 대비</Text>
        <Text style={styles.pillText}>
          {isPositive ? '+' : '-'}
          {formatWon(Math.abs(diff))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 153,
    padding: 32,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  glow: {
    position: 'absolute',
    right: -32,
    bottom: -32,
    width: 192,
    height: 192,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 218, 219, 0.2)',
    shadowColor: '#D9DADB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
  },
  label: {
    color: '#474747',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  amount: {
    marginTop: 4,
    color: '#191C1D',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  pillCaption: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
});

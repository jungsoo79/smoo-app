import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';

type LedgerDay = {
  day: string;
  muted?: boolean;
  active?: boolean;
  expense?: string;
  income?: string;
};

const ledgerDays: LedgerDay[] = [
  { day: '1', expense: '-$45', income: '+120' },
  { day: '2', expense: '-$12' },
  { day: '3', active: true, expense: '-$0' },
  { day: '4', expense: '-$128' },
  { day: '5' },
  { day: '6' },
  { day: '7' },
  { day: '8' },
  { day: '9' },
  { day: '10' },
  { day: '11' },
  { day: '12' },
  { day: '13' },
  { day: '14' },
  { day: '15' },
  { day: '16' },
  { day: '17' },
  { day: '18' },
  { day: '19' },
  { day: '20' },
  { day: '21' },
  { day: '22' },
  { day: '23' },
  { day: '24' },
  { day: '25' },
  { day: '26' },
  { day: '27' },
  { day: '28' },
  { day: '29' },
  { day: '30' },
  { day: '31' },
  { day: '1', muted: true },
  { day: '2', muted: true },
  { day: '3', muted: true },
  { day: '4', muted: true },
];

const transactions = [
  { title: '대박삼겹살', category: '식비', amount: '-₩42,850', color: '#55D521' },
  { title: '이모가 용돈 줌', category: '용돈', amount: '+₩50,000', color: '#651BFF' },
  { title: '지브라운', category: '카페', amount: '-₩1,400', color: '#8B5A2B' },
];

export default function LedgerScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.safeArea}>
        <AppTopBar title="가계부" />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <BalanceCard />
          <LedgerCalendar />
          <InsightCard />
          <TransactionList />
        </ScrollView>
      </View>

      <AppFloatingActionButton label="가계부 항목 추가" />

      <AppBottomNav active="ledger" />
    </View>
  );
}

function BalanceCard() {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceGlow} />
      <Text style={styles.balanceLabel}>잔액</Text>
      <Text style={styles.balanceAmount}>₩42,850</Text>
      <View style={styles.balancePill}>
        <MaterialIcons name="trending-up" size={13} color="#FFFFFF" />
        <Text style={styles.balancePillText}>₩1,240</Text>
      </View>
    </View>
  );
}

function LedgerCalendar() {
  return (
    <View style={styles.calendarCard}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>2026년 3월</Text>
        <View style={styles.monthButtons}>
          <TouchableOpacity accessibilityLabel="이전 달" style={styles.monthButton}>
            <MaterialIcons name="chevron-left" size={20} color="#474747" />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="다음 달" style={styles.monthButton}>
            <MaterialIcons name="chevron-right" size={20} color="#474747" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekRow}>
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.ledgerGrid}>
        {ledgerDays.map((date, index) => (
          <View
            key={`${date.day}-${index}`}
            style={[styles.ledgerCell, date.active && styles.ledgerCellActive, date.muted && styles.ledgerCellMuted]}>
            <Text style={[styles.ledgerDay, date.active && styles.ledgerDayActive]}>{date.day}</Text>
            {date.expense ? (
              <Text style={[styles.cellExpense, date.active && styles.cellExpenseActive]}>{date.expense}</Text>
            ) : null}
            {date.income ? <Text style={styles.cellIncome}>{date.income}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function InsightCard() {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightTitle}>2026년 3월 분석</Text>

      <View style={styles.insightBody}>
        <View style={styles.donut}>
          <View style={styles.donutHole} />
        </View>

        <View style={styles.legend}>
          <LegendItem color="#000000" label="월세 (45%)" />
          <LegendItem color="#3B3B3B" label="식비 (20%)" />
        </View>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function TransactionList() {
  return (
    <View style={styles.transactionsSection}>
      <Text style={styles.transactionDate}>10월 3일 화요일</Text>

      <View style={styles.transactionList}>
        {transactions.map((transaction) => (
          <View key={transaction.title} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionTitle}>{transaction.title}</Text>
              <View style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: transaction.color }]} />
                <Text style={styles.categoryText}>{transaction.category}</Text>
              </View>
            </View>

            <Text style={styles.transactionAmount}>{transaction.amount}</Text>
          </View>
        ))}
      </View>
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
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 164,
    gap: 48,
  },
  balanceCard: {
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
  balanceGlow: {
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
  balanceLabel: {
    color: '#474747',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  balanceAmount: {
    marginTop: 4,
    color: '#191C1D',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  balancePill: {
    width: 98,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
  },
  balancePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  calendarCard: {
    padding: 24,
    borderRadius: 48,
    gap: 24,
    backgroundColor: '#F3F4F5',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    color: '#000000',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  monthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E3E4',
  },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
  },
  weekday: {
    flex: 1,
    paddingBottom: 8,
    color: '#A3A3A3',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  ledgerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: 'rgba(198, 198, 198, 0.1)',
  },
  ledgerCell: {
    width: `${100 / 7}%`,
    minHeight: 60,
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  ledgerCellActive: {
    backgroundColor: '#000000',
  },
  ledgerCellMuted: {
    opacity: 0.3,
    backgroundColor: '#F3F4F5',
  },
  ledgerDay: {
    color: '#191C1D',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },
  ledgerDayActive: {
    color: '#FFFFFF',
  },
  cellExpense: {
    marginTop: 5,
    color: '#BA1A1A',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '600',
  },
  cellExpenseActive: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cellIncome: {
    color: '#191C1D',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '600',
  },
  insightCard: {
    height: 291,
    padding: 24,
    borderRadius: 48,
    backgroundColor: '#F3F4F5',
  },
  insightTitle: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  insightBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  donut: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 14,
    borderColor: '#3B3B3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F5',
  },
  legend: {
    width: 105,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    color: '#191C1D',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
  },
  transactionsSection: {
    gap: 16,
  },
  transactionDate: {
    color: 'rgba(71, 71, 71, 0.6)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  transactionList: {
    gap: 8,
  },
  transactionItem: {
    minHeight: 72,
    padding: 16,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  transactionTitle: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  categoryRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  categoryText: {
    color: '#474747',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
  },
  transactionAmount: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
});

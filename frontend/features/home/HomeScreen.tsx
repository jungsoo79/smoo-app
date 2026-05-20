import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppBottomNav, AppTopBar } from '@/components/app-chrome';

import { memos } from '@/features/memo/mock';

const scheduleItems = [
  { time: '09:00', title: '모닝 싱크', description: '디자인 리뷰' },
  { time: '11:30', title: '클라이언트 콜', description: '스무 프로젝트', muted: true },
  { time: '14:00', title: '집중 업무', description: 'UI 개선' },
];

const todoItems = [
  { title: '디자인 토큰 검토', checked: false },
  { title: 'SVG 아이콘 내보내기', checked: false },
  { title: '랜딩 에셋 업데이트', checked: true },
];

const memoItems = memos.slice(0, 2).map((memo) => ({
  title: memo.title,
  body: memo.body.join(' '),
}));

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlur} />

      <View style={styles.safeArea}>
        <AppTopBar />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.hero}>
            <Text style={styles.logo}>Zerly</Text>
            <Text style={styles.subtitle}>오늘 당신을 위해 큐레이팅된 공간입니다.</Text>
          </View>

          <View style={styles.cardStack}>
            <TodoWidget />
            <ScheduleWidget />
            <MemoWidget />
            <ExpenseWidget />
            <AddWidgetButton />
          </View>
        </ScrollView>
      </View>

      <AppBottomNav active="home" />
    </View>
  );
}

function TodoWidget() {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => router.push('/(tabs)/checklist')}
      style={[styles.card, styles.todoCard]}>
      <WidgetTitle icon="check-circle-outline" title="투두" />

      <View style={styles.todoList}>
        {todoItems.map((item) => (
          <View key={item.title} style={styles.todoRow}>
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked ? <MaterialIcons name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            <Text style={[styles.todoText, item.checked && styles.todoTextDone]}>{item.title}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function ScheduleWidget() {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => router.push('/(tabs)/calendar')}
      style={[styles.card, styles.scheduleCard]}>
      <WidgetTitle icon="calendar-today" title="일정" />

      <View style={styles.scheduleList}>
        {scheduleItems.map((item) => (
          <View key={item.time} style={[styles.scheduleRow, item.muted && styles.muted]}>
            <Text style={styles.scheduleTime}>{item.time}</Text>
            <View>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function MemoWidget() {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => router.push('/(tabs)/memo')}
      style={[styles.card, styles.memoCard]}>
      <WidgetTitle icon="article" title="메모" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.memoList}>
        {memoItems.map((memo) => (
          <View key={memo.title} style={styles.memoNote}>
            <Text style={styles.memoTitle}>{memo.title}</Text>
            <Text numberOfLines={5} style={styles.memoBody}>
              {memo.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

function ExpenseWidget() {
  const bars = [48, 72, 96, 64, 32, 77, 48];

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => router.push('/(tabs)/ledger')}
      style={[styles.card, styles.expenseCard]}>
      <View style={styles.expenseHeader}>
        <View>
          <WidgetTitle icon="credit-card" title="가계부" compact />
          <Text style={styles.period}>지난 7일</Text>
        </View>
        <View style={styles.amountGroup}>
          <Text style={styles.amount}>$1,240</Text>
          <Text style={styles.change}>-12.4%</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {bars.map((height, index) => (
          <View
            key={`${height}-${index}`}
            style={[styles.bar, { height }, index === 2 && styles.activeBar]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}

function AddWidgetButton() {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.addWidget}>
      <MaterialIcons name="add-circle-outline" size={24} color="rgba(71, 71, 71, 0.45)" />
      <Text style={styles.addWidgetText}>위젯 추가</Text>
    </TouchableOpacity>
  );
}

function WidgetTitle({
  icon,
  title,
  compact,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.widgetTitle, compact && styles.widgetTitleCompact]}>
      <MaterialIcons name={icon} size={compact ? 17 : 19} color="#191C1D" />
      <Text style={styles.widgetTitleText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundBlur: {
    position: 'absolute',
    right: -44,
    bottom: -44,
    width: 156,
    height: 624,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 218, 219, 0.3)',
    shadowColor: '#D9DADB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 60,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 128,
  },
  hero: {
    gap: 8,
    marginBottom: 48,
  },
  logo: {
    color: '#000000',
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(71, 71, 71, 0.7)',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  cardStack: {
    gap: 24,
  },
  card: {
    width: '100%',
    borderRadius: 48,
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  widgetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  widgetTitleCompact: {
    marginBottom: 0,
  },
  widgetTitleText: {
    color: '#191C1D',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
  },
  todoCard: {
    gap: 24,
  },
  todoList: {
    gap: 16,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C6C6C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  todoText: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  todoTextDone: {
    color: 'rgba(71, 71, 71, 0.4)',
    textDecorationLine: 'line-through',
  },
  scheduleCard: {
    gap: 24,
  },
  scheduleList: {
    gap: 24,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  muted: {
    opacity: 0.4,
  },
  scheduleTime: {
    width: 38,
    paddingTop: 4,
    color: '#000000',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  scheduleTitle: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  scheduleDescription: {
    color: 'rgba(71, 71, 71, 0.6)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  memoCard: {
    gap: 12,
    overflow: 'hidden',
  },
  memoList: {
    gap: 16,
    paddingRight: 16,
  },
  memoNote: {
    width: 158,
    height: 158,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderRadius: 32,
    backgroundColor: '#F3F4F5',
    overflow: 'hidden',
  },
  memoTitle: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  memoBody: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
  },
  expenseCard: {
    gap: 24,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  period: {
    marginTop: 2,
    color: 'rgba(71, 71, 71, 0.5)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  amountGroup: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#191C1D',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  change: {
    color: '#16A34A',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
  chart: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 1,
  },
  bar: {
    flex: 1,
    minWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(231, 232, 233, 0.3)',
  },
  activeBar: {
    backgroundColor: '#000000',
  },
  addWidget: {
    height: 128,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(198, 198, 198, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addWidgetText: {
    color: 'rgba(71, 71, 71, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

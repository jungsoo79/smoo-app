import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

const scheduleItems = [
  { time: '09:00', title: '모닝 싱크', description: '디자인 리뷰' },
  { time: '14:00', title: '집중 업무', description: 'UI 개선', muted: true },
];

export function CalendarWidget() {
  return (
    <View style={styles.content}>
      {scheduleItems.map((item) => (
        <View key={item.time} style={styles.row}>
          <View style={[styles.bar, item.muted && styles.barMuted]} />
          <View>
            <Text style={styles.title}>
              {item.time} {item.title}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  row: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bar: {
    width: 4,
    height: 42,
    borderRadius: 999,
    backgroundColor: AppColors.textPrimary,
  },
  barMuted: {
    backgroundColor: AppColors.border,
  },
  title: {
    ...AppTypography.bodyStrong,
    fontWeight: '700',
  },
  description: {
    ...AppTypography.bodySecondary,
    fontWeight: '500',
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

export function AccountBookWidget() {
  return (
    <View style={styles.content}>
      <View style={styles.row}>
        <Text style={styles.month}>5월 현황</Text>
        <Text style={styles.percent}>70%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: {
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
    width: '70%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4A90E2',
  },
});

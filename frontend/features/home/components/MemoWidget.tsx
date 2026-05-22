import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';
import { memos } from '@/features/memo/mock';

const memoItems = memos.slice(0, 2);

export function MemoWidget() {
  return (
    <View style={styles.content}>
      {memoItems.map((memo) => (
        <View key={`${memo.title}-${memo.date}`} style={styles.note}>
          <Text numberOfLines={1} style={styles.noteTitle}>
            {memo.title}
          </Text>
          <View style={styles.lineLong} />
          <View style={styles.lineMedium} />
          <View style={styles.lineShort} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  note: {
    flex: 1,
    minHeight: 136,
    borderRadius: 32,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: AppColors.surfaceMuted,
  },
  noteTitle: {
    ...AppTypography.bodySecondary,
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  lineLong: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#D9DADB',
  },
  lineMedium: {
    width: '82%',
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D9DADB',
  },
  lineShort: {
    width: '56%',
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D9DADB',
  },
});

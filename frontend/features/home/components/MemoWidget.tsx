import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';
import type { HomeWidgetData } from '../types/homeWidget';

type MemoPreviewItem = {
  id?: number;
  preview?: string;
  title?: string;
};

function getMemoItems(data?: HomeWidgetData): MemoPreviewItem[] {
  return Array.isArray(data?.items) ? (data.items as MemoPreviewItem[]).slice(0, 2) : [];
}

export function MemoWidget({ data }: { data?: HomeWidgetData }) {
  const memoItems = getMemoItems(data);

  return (
    <View style={styles.content}>
      {memoItems.length === 0 ? (
        <View style={styles.emptyNote}>
          <Text style={styles.emptyText}>최근 메모가 없습니다.</Text>
        </View>
      ) : null}

      {memoItems.map((memo, index) => (
        <View key={`${memo.id ?? memo.title ?? index}`} style={styles.note}>
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
  emptyNote: {
    flex: 1,
    minHeight: 96,
    borderRadius: 28,
    padding: 18,
    justifyContent: 'center',
    backgroundColor: AppColors.surfaceMuted,
  },
  emptyText: {
    ...AppTypography.bodySecondary,
    color: AppColors.textMuted,
    fontWeight: '600',
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

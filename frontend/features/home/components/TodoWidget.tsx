import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { HomeWidgetData } from '../types/homeWidget';

type TodoPreviewItem = {
  id?: number;
  status?: string;
  title?: string;
};

function getTodoItems(data?: HomeWidgetData): TodoPreviewItem[] {
  return Array.isArray(data?.items) ? (data.items as TodoPreviewItem[]).slice(0, 3) : [];
}

export function TodoWidget({ data }: { data?: HomeWidgetData }) {
  const todoItems = getTodoItems(data);

  return (
    <View style={styles.content}>
      {todoItems.length === 0 ? <Text style={styles.emptyText}>오늘 할 일이 없습니다.</Text> : null}

      {todoItems.map((item, index) => {
        const checked = item.status === 'completed';

        return (
          <View key={`${item.id ?? item.title ?? index}`} style={styles.row}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked ? <MaterialIcons name="check" size={14} color={AppColors.textInverse} /> : null}
            </View>
            <Text style={[styles.title, !checked && styles.titleMuted]}>{item.title}</Text>
          </View>
        );
      })}
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
    gap: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E3E4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: AppColors.textPrimary,
    backgroundColor: AppColors.textPrimary,
  },
  title: {
    ...AppTypography.body,
    fontWeight: '600',
  },
  titleMuted: {
    color: AppColors.textMuted,
  },
  emptyText: {
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { HomeWidgetData } from '../types/homeWidget';

type SchedulePreviewItem = {
  description?: string;
  id?: number;
  time?: string;
  title?: string;
};

type CalendarDayPreview = {
  date?: string;
  scheduleCount?: number;
};

function getScheduleItems(data?: HomeWidgetData): SchedulePreviewItem[] {
  return Array.isArray(data?.items) ? (data.items as SchedulePreviewItem[]).slice(0, 3) : [];
}

function getCalendarDays(data?: HomeWidgetData): CalendarDayPreview[] {
  return Array.isArray(data?.days) ? (data.days as CalendarDayPreview[]).slice(0, 3) : [];
}

function formatDayLabel(date?: string) {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  return `${parsedDate.getMonth() + 1}/${parsedDate.getDate()}`;
}

export function CalendarWidget({ data }: { data?: HomeWidgetData }) {
  const scheduleItems = getScheduleItems(data);
  const calendarDays = getCalendarDays(data);

  return (
    <View style={styles.content}>
      {scheduleItems.length === 0 && calendarDays.length === 0 ? (
        <Text style={styles.emptyText}>표시할 일정이 없습니다.</Text>
      ) : null}

      {scheduleItems.map((item, index) => (
        <View key={`${item.id ?? item.time ?? item.title ?? index}`} style={styles.row}>
          <View style={styles.bar} />
          <View style={styles.textGroup}>
            <Text numberOfLines={1} style={styles.title}>
              {item.time ? `${item.time} ` : ''}
              {item.title}
            </Text>
            {item.description ? (
              <Text numberOfLines={1} style={styles.description}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      {scheduleItems.length === 0
        ? calendarDays.map((day, index) => (
            <View key={`${day.date ?? index}`} style={styles.row}>
              <View style={styles.bar} />
              <View style={styles.textGroup}>
                <Text numberOfLines={1} style={styles.title}>
                  {formatDayLabel(day.date)}
                </Text>
                <Text numberOfLines={1} style={styles.description}>
                  일정 {day.scheduleCount ?? 0}개
                </Text>
              </View>
            </View>
          ))
        : null}
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
  textGroup: {
    flex: 1,
  },
  title: {
    ...AppTypography.bodyStrong,
    fontWeight: '700',
  },
  description: {
    ...AppTypography.bodySecondary,
    fontWeight: '500',
  },
  emptyText: {
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
});

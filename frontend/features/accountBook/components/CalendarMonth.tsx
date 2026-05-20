import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import type { DailySummary } from '../types';
import { formatMonthTitle, formatSignedWon } from './formatters';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

function toDateString(date?: DateData) {
  return date?.dateString ?? '';
}

function getChipColor(type: 'expense' | 'income') {
  return type === 'income' ? '#DCFCE7' : '#FEE2E2';
}

function getChipTextColor(type: 'expense' | 'income') {
  return type === 'income' ? '#15803D' : '#BA1A1A';
}

export function CalendarMonth({
  currentDate,
  dailySummaries,
  month,
  onMonthChange,
  onSelectDate,
  selectedDate,
  todayDate,
  year,
}: {
  currentDate: string;
  dailySummaries: DailySummary[];
  month: number;
  onMonthChange: (offset: number) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  todayDate: string;
  year: number;
}) {
  const summariesByDate = useMemo(
    () => Object.fromEntries(dailySummaries.map((summary) => [summary.date, summary])),
    [dailySummaries]
  );

  return (
    <View style={styles.section}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>{formatMonthTitle(year, month)}</Text>
        <View style={styles.monthButtons}>
          <TouchableOpacity
            accessibilityLabel="이전 달"
            activeOpacity={0.75}
            onPress={() => onMonthChange(-1)}
            style={styles.roundButton}>
            <MaterialIcons name="chevron-left" size={22} color="#171717" />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="다음 달"
            activeOpacity={0.75}
            onPress={() => onMonthChange(1)}
            style={styles.roundButton}>
            <MaterialIcons name="chevron-right" size={22} color="#171717" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.weekRow}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={[styles.weekday, weekday === '일' && styles.sundayText]}>
              {weekday}
            </Text>
          ))}
        </View>

        <Calendar
          key={currentDate}
          current={currentDate}
          firstDay={1}
          hideArrows
          hideDayNames
          hideExtraDays={false}
          headerStyle={styles.hiddenCalendarHeader}
          markingType="custom"
          onDayPress={(date) => onSelectDate(date.dateString)}
          onMonthChange={(date) => onSelectDate(date.dateString)}
          renderHeader={() => null}
          dayComponent={({ date, state }) => (
            <CalendarDay
              date={date}
              isSelected={toDateString(date) === selectedDate}
              isToday={toDateString(date) === todayDate}
              onPress={() => date && onSelectDate(date.dateString)}
              state={state}
              summary={summariesByDate[toDateString(date)]}
            />
          )}
          style={styles.calendar}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
          }}
        />
      </View>
    </View>
  );
}

function CalendarDay({
  date,
  isSelected,
  isToday,
  onPress,
  state,
  summary,
}: {
  date?: DateData;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  state?: string;
  summary?: DailySummary;
}) {
  const isDisabled = state === 'disabled';
  const isSunday = date ? new Date(`${date.dateString}T00:00:00`).getDay() === 0 : false;
  const previews = summary?.transactions.slice(0, 3) ?? [];

  return (
    <TouchableOpacity
      activeOpacity={0.76}
      onPress={onPress}
      style={[styles.dayCell, isSelected && !isToday && styles.selectedCell]}>
      <View style={isToday ? styles.todayBadge : undefined}>
        <Text
          style={[
            styles.dayNumber,
            isDisabled && styles.outsideDay,
            isSunday && !isDisabled && !isToday && styles.sundayText,
            isToday && styles.todayText,
          ]}>
          {date?.day}
        </Text>
      </View>

      <View style={styles.previewStack}>
        {previews.map((transaction) => (
          <Text
            key={transaction.id}
            numberOfLines={1}
            style={[
              styles.previewChip,
              {
                backgroundColor: getChipColor(transaction.type),
                color: getChipTextColor(transaction.type),
              },
            ]}>
            {formatSignedWon(transaction.amount, transaction.type)}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 20,
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
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F5',
  },
  card: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  calendar: {
    marginHorizontal: -8,
    padding: 0,
  },
  hiddenCalendarHeader: {
    height: 0,
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  weekRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  weekday: {
    flex: 1,
    paddingVertical: 8,
    color: '#A3A3A3',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  dayCell: {
    width: '100%',
    minHeight: 82,
    alignItems: 'center',
    paddingTop: 9,
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
  },
  dayNumber: {
    color: '#191C1D',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  outsideDay: {
    color: '#D4D4D4',
  },
  sundayText: {
    color: '#EF4444',
  },
  selectedCell: {
    borderRadius: 14,
    backgroundColor: '#F3F4F5',
  },
  todayBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    marginBottom: 4,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 11,
  },
  previewStack: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  previewChip: {
    width: '92%',
    maxWidth: 48,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 2,
    overflow: 'hidden',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});

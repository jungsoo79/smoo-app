import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
import { AppColors, AppTypography } from '@/constants/appStyles';
import { AddSheet } from '@/features/calendar/components/AddSheet';

type ChipTone = 'light' | 'medium' | 'darkGray' | 'black' | 'red';
type CalendarChip = { color?: string; label: string; tone: ChipTone };

function toLocalDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const initialDate = toLocalDateString(new Date());

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const koreanWeekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

type CalendarEvent = {
  id: string;
  category: string;
  categoryColor?: string;
  date: string;
  detail: string;
  endDate: string;
  endTime: { hour: number; meridiem: 'AM' | 'PM'; minute: number };
  isAllDay: boolean;
  startTime: { hour: number; meridiem: 'AM' | 'PM'; minute: number };
  title: string;
};

type EventsByDate = Record<string, CalendarEvent[]>;

function addMonths(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + count);
  return toLocalDateString(date);
}

function formatMonthTitle(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatSelectedTitle(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${koreanWeekdays[date.getDay()]}`;
}

function toDateString(date?: DateData) {
  return date?.dateString ?? '';
}

function formatEventTime(time: CalendarEvent['startTime']) {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

function getTimeOrder(time: CalendarEvent['startTime']) {
  const hour = time.hour % 12;
  const meridiemOffset = time.meridiem === 'PM' ? 12 : 0;

  return (hour + meridiemOffset) * 60 + time.minute;
}

function sortCalendarEvents(first: CalendarEvent, second: CalendarEvent) {
  if (first.isAllDay !== second.isAllDay) {
    return first.isAllDay ? -1 : 1;
  }

  return getTimeOrder(first.startTime) - getTimeOrder(second.startTime);
}

function getChipTone(index: number): ChipTone {
  if (index === 0) {
    return 'light';
  }

  if (index === 1) {
    return 'medium';
  }

  return 'darkGray';
}

function getCalendarChips(events: CalendarEvent[]): CalendarChip[] {
  if (events.length > 3) {
    return [
      ...events.slice(0, 2).map((event, index) => ({
        color: event.categoryColor,
        label: event.title,
        tone: getChipTone(index),
      })),
      {
        label: `+ ${events.length - 2}개`,
        tone: 'medium' as ChipTone,
      },
    ];
  }

  return events.slice(0, 3).map((event, index) => ({
    color: event.categoryColor,
    label: event.title,
    tone: getChipTone(index),
  }));
}

function getContrastTextColor(hexColor?: string) {
  if (!hexColor) {
    return '#171717';
  }

  const cleanHex = hexColor.replace('#', '');
  const red = parseInt(cleanHex.slice(0, 2), 16);
  const green = parseInt(cleanHex.slice(2, 4), 16);
  const blue = parseInt(cleanHex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? '#171717' : '#FFFFFF';
}

function getMutedContrastTextColor(hexColor?: string) {
  if (!hexColor) {
    return '#737373';
  }

  return getContrastTextColor(hexColor) === '#FFFFFF' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(23, 23, 23, 0.62)';
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const selectedEvents = eventsByDate[selectedDate] ?? [];
  const calendarChips = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(eventsByDate).map(([date, events]) => [
          date,
          getCalendarChips(events),
        ])
      ),
    [eventsByDate]
  );

  const markedDates = useMemo(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: '#000000',
      },
    }),
    [selectedDate]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.safeArea}>
        <AppTopBar title="캘린더" backgroundColor="rgba(255, 255, 255, 0.5)" />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{formatMonthTitle(currentDate)}</Text>
            <View style={styles.monthButtons}>
              <TouchableOpacity
                accessibilityLabel="이전 달"
                activeOpacity={0.75}
                onPress={() => setCurrentDate((date) => addMonths(date, -1))}
                style={styles.roundButton}>
                <MaterialIcons name="chevron-left" size={22} color="#171717" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="다음 달"
                activeOpacity={0.75}
                onPress={() => setCurrentDate((date) => addMonths(date, 1))}
                style={styles.roundButton}>
                <MaterialIcons name="chevron-right" size={22} color="#171717" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarCard}>
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
              markedDates={markedDates}
              markingType="custom"
              onDayPress={(date) => setSelectedDate(date.dateString)}
              onMonthChange={(date) => setCurrentDate(date.dateString)}
              renderHeader={() => null}
              dayComponent={({ date, state, marking }) => (
                <CalendarDay
                  chips={calendarChips[toDateString(date)]}
                  date={date}
                  isSelected={Boolean(marking?.selected)}
                  onPress={() => date && setSelectedDate(date.dateString)}
                  state={state}
                />
              )}
              style={styles.calendar}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
              }}
            />
          </View>

          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleTitle}>{formatSelectedTitle(selectedDate)}</Text>
              <Text style={styles.scheduleCount}>일정 {selectedEvents.length}개</Text>
            </View>

            <View style={styles.eventList}>
              {selectedEvents.length === 0 ? (
                <View style={styles.emptySchedule}>
                  <Text style={styles.emptyScheduleText}>등록된 일정이 없습니다.</Text>
                </View>
              ) : null}

              {selectedEvents.map((event) => (
                <CalendarEventRow event={event} key={event.id} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton label="일정 추가" onPress={() => setAddSheetVisible(true)} />

      <AddSheet
        initialDate={selectedDate}
        visible={isAddSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onSave={(event) => {
          const nextEvent: CalendarEvent = {
            ...event,
            id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          };

          setEventsByDate((events) => ({
            ...events,
            [event.date]: [...(events[event.date] ?? []), nextEvent].sort(sortCalendarEvents),
          }));
          setSelectedDate(event.date);
          setCurrentDate(event.date);
        }}
      />

      <AppBottomNav active="calendar" />
    </View>
  );
}

function CalendarEventRow({ event }: { event: CalendarEvent }) {
  const titleColor = getContrastTextColor(event.categoryColor);
  const detailColor = getMutedContrastTextColor(event.categoryColor);

  return (
    <View style={[styles.eventRow, event.isAllDay && styles.allDayEventRow]}>
      {event.isAllDay ? null : (
        <View style={styles.eventTime}>
          <Text style={styles.eventHour}>{formatEventTime(event.startTime)}</Text>
          <Text style={styles.eventMeridiem}>{event.startTime.meridiem}</Text>
        </View>
      )}
      <View
        style={[
          styles.eventCard,
          event.categoryColor ? { backgroundColor: event.categoryColor } : null,
          event.isAllDay && styles.allDayEventCard,
        ]}>
        <Text style={[styles.eventTitle, { color: titleColor }]}>{event.title}</Text>
        {event.detail ? <Text style={[styles.eventDetail, { color: detailColor }]}>{event.detail}</Text> : null}
      </View>
    </View>
  );
}

function CalendarDay({
  chips,
  date,
  isSelected,
  onPress,
  state,
}: {
  chips?: CalendarChip[];
  date?: DateData;
  isSelected: boolean;
  onPress: () => void;
  state?: string;
}) {
  const isDisabled = state === 'disabled';
  const isSunday = date ? new Date(`${date.dateString}T00:00:00`).getDay() === 0 : false;

  return (
    <TouchableOpacity activeOpacity={0.76} onPress={onPress} style={styles.dayCell}>
      <View style={isSelected ? styles.todayBadge : undefined}>
        <Text
          style={[
            styles.dayNumber,
            isDisabled && styles.outsideDay,
            isSunday && !isDisabled && !isSelected && styles.sundayText,
            isSelected && styles.todayText,
          ]}>
          {date?.day}
        </Text>
      </View>

      <View style={styles.chipStack}>
        {chips?.map((chip) => (
          <Text
            key={`${date?.dateString}-${chip.label}`}
            numberOfLines={1}
            style={[
              styles.calendarChip,
              chipStyles[chip.tone],
              chip.color
                ? {
                    backgroundColor: chip.color,
                    color: getContrastTextColor(chip.color),
                  }
                : null,
            ]}>
            {chip.label}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  light: {
    color: '#525252',
    backgroundColor: '#E7E8E9',
  },
  medium: {
    color: '#404040',
    backgroundColor: '#E5E5E5',
  },
  darkGray: {
    color: '#262626',
    backgroundColor: '#D4D4D4',
  },
  black: {
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  red: {
    color: '#F87171',
    backgroundColor: '#FEF2F2',
  },
});

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
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 160,
    gap: 40,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    ...AppTypography.pageTitle,
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
  calendarCard: {
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
    minHeight: 80,
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
  chipStack: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  calendarChip: {
    width: '86%',
    maxWidth: 40,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 2,
    overflow: 'hidden',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  scheduleSection: {
    gap: 32,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scheduleTitle: {
    ...AppTypography.sectionTitle,
  },
  scheduleCount: {
    ...AppTypography.caption,
    color: AppColors.textPlaceholder,
    fontWeight: '500',
  },
  eventList: {
    gap: 16,
  },
  emptySchedule: {
    minHeight: 88,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  emptyScheduleText: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  eventRow: {
    flexDirection: 'row',
    gap: 24,
  },
  allDayEventRow: {
    paddingLeft: 4,
  },
  eventTime: {
    width: 64,
    paddingTop: 4,
  },
  eventHour: {
    color: '#A3A3A3',
    fontSize: 11,
    lineHeight: 11,
    fontWeight: '600',
  },
  eventMeridiem: {
    color: '#A3A3A3',
    fontSize: 10,
    lineHeight: 10,
    fontWeight: '400',
  },
  eventCard: {
    flex: 1,
    minHeight: 68,
    padding: 20,
    borderRadius: 48,
    gap: 4,
    backgroundColor: '#F3F4F5',
  },
  allDayEventCard: {
    minHeight: 84,
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 42,
  },
  eventCardFeatured: {
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 25,
    elevation: 12,
  },
  eventTitle: {
    color: '#171717',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  eventTitleFeatured: {
    color: '#FFFFFF',
  },
  eventDetail: {
    color: '#737373',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  eventDetailFeatured: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

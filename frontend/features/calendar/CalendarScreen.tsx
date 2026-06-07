import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
import { AppColors, AppTypography } from '@/constants/appStyles';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventsByDateMap,
  updateCalendarEvent,
} from '@/features/calendar/api';
import { AddSheet } from '@/features/calendar/components/AddSheet';
import type { CalendarEvent, CalendarEventOccurrence, CalendarEventsByDate } from '@/features/calendar/types';

type ChipTone = 'light' | 'medium' | 'darkGray' | 'black' | 'red';
type CalendarChipSegment = 'single' | 'start' | 'middle' | 'end';
type CalendarChip = { color?: string; id?: string; label: string; segment: CalendarChipSegment; tone: ChipTone };

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

function addMonths(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + count);

  return toLocalDateString(date);
}

function addDays(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + count);

  return toLocalDateString(date);
}

function getDatesBetween(startDate: string, endDate: string) {
  const dates: string[] = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

function getWeekStartDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + mondayOffset);

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

function getEventOccurrence(event: CalendarEvent, dateString: string): CalendarEventOccurrence {
  const isStartDate = dateString === event.date;
  const isEndDate = dateString === event.endDate;
  const isMiddleDate = dateString > event.date && dateString < event.endDate;
  const displayIsAllDay = event.isAllDay || isMiddleDate;
  const displayTime = !event.isAllDay && isEndDate && !isStartDate ? event.endTime : event.startTime;

  return {
    ...event,
    displayIsAllDay,
    displayTime,
  };
}

function sortCalendarEvents(first: CalendarEventOccurrence, second: CalendarEventOccurrence) {
  if (first.displayIsAllDay !== second.displayIsAllDay) {
    return first.displayIsAllDay ? -1 : 1;
  }

  return getTimeOrder(first.displayTime) - getTimeOrder(second.displayTime);
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

function getCalendarChipSegment(event: CalendarEvent, dateString: string): CalendarChipSegment {
  if (event.date === event.endDate) {
    return 'single';
  }

  if (dateString === event.date) {
    return 'start';
  }

  if (dateString === event.endDate) {
    return 'end';
  }

  return 'middle';
}

function getRangeLength(event: CalendarEvent) {
  return getDatesBetween(event.date, event.endDate).length;
}

function getCalendarChip(event: CalendarEvent, dateString: string, index: number): CalendarChip {
  const segment = getCalendarChipSegment(event, dateString);

  return {
    color: event.categoryColor,
    id: event.id,
    label: segment === 'single' || segment === 'start' ? event.title : ' ',
    segment,
    tone: getChipTone(index),
  };
}

function getCalendarChipsByDate(eventsByDate: CalendarEventsByDate): Record<string, Array<CalendarChip | null>> {
  const uniqueEvents = Array.from(
    new Map(Object.values(eventsByDate).flat().map((event) => [event.id, event])).values()
  );
  const rangeEvents = uniqueEvents.filter((event) => event.date !== event.endDate).sort((first, second) => {
    if (first.date !== second.date) {
      return first.date.localeCompare(second.date);
    }

    if (getRangeLength(first) !== getRangeLength(second)) {
      return getRangeLength(second) - getRangeLength(first);
    }

    return getTimeOrder(first.startTime) - getTimeOrder(second.startTime);
  });
  const singleEvents = uniqueEvents.filter((event) => event.date === event.endDate).sort((first, second) => {
    if (first.date !== second.date) {
      return first.date.localeCompare(second.date);
    }

    return getTimeOrder(first.startTime) - getTimeOrder(second.startTime);
  });
  const lanesByDate: Record<string, Array<CalendarChip | null>> = {};
  const rangeLanesByWeek: Record<string, Set<number>> = {};
  const totalsByDate = Object.fromEntries(
    Object.entries(eventsByDate).map(([date, events]) => [date, events.length])
  ) as Record<string, number>;

  rangeEvents.forEach((event) => {
    const dates = getDatesBetween(event.date, event.endDate);
    const availableLane = [0, 1, 2].find((lane) => dates.every((date) => !lanesByDate[date]?.[lane]));

    if (availableLane === undefined) {
      return;
    }

    dates.forEach((date) => {
      lanesByDate[date] = lanesByDate[date] ?? [];
      lanesByDate[date][availableLane] = getCalendarChip(event, date, availableLane);
    });

    Array.from(new Set(dates.map(getWeekStartDate))).forEach((weekStartDate) => {
      rangeLanesByWeek[weekStartDate] = rangeLanesByWeek[weekStartDate] ?? new Set<number>();
      rangeLanesByWeek[weekStartDate].add(availableLane);
    });
  });

  singleEvents.forEach((event) => {
    const reservedRangeLanes = rangeLanesByWeek[getWeekStartDate(event.date)] ?? new Set<number>();
    const availableLane = [0, 1, 2].find((lane) => !reservedRangeLanes.has(lane) && !lanesByDate[event.date]?.[lane]);

    if (availableLane === undefined) {
      return;
    }

    lanesByDate[event.date] = lanesByDate[event.date] ?? [];
    lanesByDate[event.date][availableLane] = getCalendarChip(event, event.date, availableLane);
  });

  return Object.fromEntries(
    Object.entries(eventsByDate).map(([date]) => {
      const chips = lanesByDate[date] ?? [];
      const total = totalsByDate[date] ?? 0;

      if (total > 3) {
        return [
          date,
          [
            chips[0] ?? null,
            chips[1] ?? null,
            {
              label: `+ ${total - 2}개`,
              segment: 'single' as CalendarChipSegment,
              tone: 'medium' as ChipTone,
            },
          ],
        ];
      }

      return [date, Array.from({ length: Math.min(3, chips.length) }, (_, index) => chips[index] ?? null)];
    })
  );
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

function removeEventById(eventsByDate: CalendarEventsByDate, eventId: string) {
  return Object.fromEntries(
    Object.entries(eventsByDate)
      .map(([date, events]) => [date, events.filter((event) => event.id !== eventId)] as const)
      .filter(([, events]) => events.length > 0)
  ) as CalendarEventsByDate;
}

function addEventToDates(eventsByDate: CalendarEventsByDate, event: CalendarEvent) {
  return {
    ...eventsByDate,
    ...Object.fromEntries(
      getDatesBetween(event.date, event.endDate).map((date) => [
        date,
        [...(eventsByDate[date] ?? []), event].sort((first, second) =>
          sortCalendarEvents(getEventOccurrence(first, date), getEventOccurrence(second, date))
        ),
      ])
    ),
  } as CalendarEventsByDate;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [eventsByDate, setEventsByDate] = useState<CalendarEventsByDate>({});
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const selectedEvents = useMemo(
    () => (eventsByDate[selectedDate] ?? []).map((event) => getEventOccurrence(event, selectedDate)).sort(sortCalendarEvents),
    [eventsByDate, selectedDate]
  );
  const calendarChips = useMemo(() => getCalendarChipsByDate(eventsByDate), [eventsByDate]);

  const markedDates = useMemo(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: '#000000',
      },
    }),
    [selectedDate]
  );

  useEffect(() => {
    void getCalendarEventsByDateMap().then(setEventsByDate);
  }, []);

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
                <CalendarEventRow
                  event={event}
                  key={event.id}
                  onPress={() => {
                    setEditingEvent(event);
                    setAddSheetVisible(true);
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton
        label="일정 추가"
        onPress={() => {
          setEditingEvent(null);
          setAddSheetVisible(true);
        }}
      />

      <AddSheet
        initialEvent={editingEvent}
        initialDate={selectedDate}
        visible={isAddSheetVisible}
        onClose={() => {
          setAddSheetVisible(false);
          setEditingEvent(null);
        }}
        onDelete={(eventId) => {
          void deleteCalendarEvent(eventId).then(() => {
            setEventsByDate((events) => removeEventById(events, eventId));
          });
          setEditingEvent(null);
        }}
        onSave={(event) => {
          void createCalendarEvent(event).then((nextEvent) => {
          setEventsByDate((events) => addEventToDates(events, nextEvent));
          setSelectedDate(event.date);
          setCurrentDate(event.date);
          });
        }}
        onUpdate={(eventId, event) => {
          void updateCalendarEvent(eventId, event).then((nextEvent) => {
          setEventsByDate((events) => addEventToDates(removeEventById(events, eventId), nextEvent));
          setSelectedDate(event.date);
          setCurrentDate(event.date);
          setEditingEvent(null);
          });
        }}
      />

      <AppBottomNav active="calendar" />
    </View>
  );
}

function CalendarEventRow({ event, onPress }: { event: CalendarEventOccurrence; onPress: () => void }) {
  const titleColor = getContrastTextColor(event.categoryColor);
  const detailColor = getMutedContrastTextColor(event.categoryColor);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.eventRow, event.displayIsAllDay && styles.allDayEventRow]}>
      {event.displayIsAllDay ? null : (
        <View style={styles.eventTime}>
          <Text style={styles.eventHour}>{formatEventTime(event.displayTime)}</Text>
          <Text style={styles.eventMeridiem}>{event.displayTime.meridiem}</Text>
        </View>
      )}
      <View
        style={[
          styles.eventCard,
          event.categoryColor ? { backgroundColor: event.categoryColor } : null,
          event.displayIsAllDay && styles.allDayEventCard,
        ]}>
        <Text style={[styles.eventTitle, { color: titleColor }]}>{event.title}</Text>
        {event.detail ? <Text style={[styles.eventDetail, { color: detailColor }]}>{event.detail}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function CalendarDay({
  chips,
  date,
  isSelected,
  onPress,
  state,
}: {
  chips?: Array<CalendarChip | null>;
  date?: DateData;
  isSelected: boolean;
  onPress: () => void;
  state?: string;
}) {
  const isDisabled = state === 'disabled';
  const isSunday = date ? new Date(`${date.dateString}T00:00:00`).getDay() === 0 : false;

  return (
    <TouchableOpacity activeOpacity={0.76} onPress={onPress} style={styles.dayCell}>
      <View style={[styles.dayNumberSlot, isSelected && styles.todayBadge]}>
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
        {chips?.map((chip, index) =>
          chip ? (
            <View
              key={`${date?.dateString}-${chip.id ?? chip.label}-${index}`}
              style={[
                styles.calendarChip,
                chipStyles[chip.tone],
                chip.segment !== 'single' && styles.calendarRangeChip,
                chip.segment === 'start' && styles.calendarRangeChipStart,
                chip.segment === 'middle' && styles.calendarRangeChipMiddle,
                chip.segment === 'end' && styles.calendarRangeChipEnd,
                chip.color
                  ? {
                      backgroundColor: chip.color,
                    }
                  : null,
              ]}>
              {chip.label.trim() ? (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.calendarChipText,
                    {
                      color: chip.color ? getContrastTextColor(chip.color) : chipStyles[chip.tone].color,
                    },
                  ]}>
                  {chip.label}
                </Text>
              ) : null}
            </View>
          ) : (
            <View key={`${date?.dateString}-spacer-${index}`} style={styles.calendarChipSpacer} />
          )
        )}
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
  dayNumberSlot: {
    width: 24,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  outsideDay: {
    color: '#D4D4D4',
  },
  sundayText: {
    color: '#EF4444',
  },
  todayBadge: {
    backgroundColor: '#000000',
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
    height: 16,
    borderRadius: 2,
    paddingHorizontal: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarChipText: {
    width: '100%',
    backgroundColor: 'transparent',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  calendarChipSpacer: {
    width: '100%',
    height: 16,
  },
  calendarRangeChip: {
    width: '100%',
    maxWidth: '100%',
  },
  calendarRangeChipStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  calendarRangeChipMiddle: {
    borderRadius: 0,
  },
  calendarRangeChipEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
    alignItems: 'center',
    gap: 24,
  },
  allDayEventRow: {
    paddingLeft: 4,
  },
  eventTime: {
    width: 64,
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
    minHeight: 58,
    paddingHorizontal: 28,
    paddingVertical: 14,
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

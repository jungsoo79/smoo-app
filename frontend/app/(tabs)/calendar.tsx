import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

type ChipTone = 'light' | 'medium' | 'darkGray' | 'black' | 'red';

type CalendarDay = {
  day: string;
  outside?: boolean;
  sunday?: boolean;
  today?: boolean;
  chips?: { label: string; tone: ChipTone }[];
};

const calendarDays: CalendarDay[] = [
  { day: '23', outside: true },
  { day: '24', outside: true },
  { day: '25', outside: true },
  { day: '26', outside: true },
  { day: '27', outside: true },
  { day: '28', outside: true },
  { day: '1' },
  { day: '2' },
  { day: '3', chips: [{ label: '리서치 ...', tone: 'light' }] },
  { day: '4' },
  { day: '5', chips: [{ label: '운동', tone: 'medium' }] },
  { day: '6' },
  { day: '7' },
  { day: '8' },
  { day: '9' },
  {
    day: '10',
    today: true,
    chips: [
      { label: '팀 회의', tone: 'light' },
      { label: '사라와 ...', tone: 'darkGray' },
      { label: '집중 업무', tone: 'black' },
    ],
  },
  { day: '11' },
  { day: '12' },
  { day: '13' },
  { day: '14' },
  { day: '15', sunday: true, chips: [{ label: '가족 식사', tone: 'red' }] },
  { day: '16' },
  { day: '17' },
  { day: '18' },
  { day: '19' },
  { day: '20' },
  { day: '21' },
  { day: '22' },
];

const events = [
  { time: '09:00', meridiem: 'AM', title: '팀 회의', detail: '디자인 팀과의 주간 싱크' },
  { time: '01:30', meridiem: 'PM', title: '사라와 커피', detail: '블루보틀, 민트 플라자' },
  { time: '04:00', meridiem: 'PM', title: '집중 업무', detail: '아카이브 시스템에 집중', featured: true },
];

export default function CalendarScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.safeArea}>
        <AppTopBar title="캘린더" backgroundColor="rgba(255, 255, 255, 0.5)" />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>2026년 3월</Text>
            <View style={styles.monthButtons}>
              <TouchableOpacity accessibilityLabel="이전 달" style={styles.roundButton}>
                <MaterialIcons name="chevron-left" size={22} color="#171717" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityLabel="다음 달" style={styles.roundButton}>
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

            <View style={styles.grid}>
              {calendarDays.map((date, index) => (
                <View key={`${date.day}-${index}`} style={styles.dayCell}>
                  <View style={date.today ? styles.todayBadge : undefined}>
                    <Text
                      style={[
                        styles.dayNumber,
                        date.outside && styles.outsideDay,
                        (date.sunday || index % 7 === 6) && !date.today && styles.sundayText,
                        date.today && styles.todayText,
                      ]}>
                      {date.day}
                    </Text>
                  </View>

                  <View style={styles.chipStack}>
                    {date.chips?.map((chip) => (
                      <Text
                        key={`${date.day}-${chip.label}`}
                        numberOfLines={1}
                        style={[styles.calendarChip, chipStyles[chip.tone]]}>
                        {chip.label}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleTitle}>3월 10일 화요일</Text>
              <Text style={styles.scheduleCount}>일정 3개</Text>
            </View>

            <View style={styles.eventList}>
              {events.map((event) => (
                <View key={event.title} style={styles.eventRow}>
                  <View style={styles.eventTime}>
                    <Text style={styles.eventHour}>{event.time}</Text>
                    <Text style={styles.eventMeridiem}>{event.meridiem}</Text>
                  </View>
                  <View style={[styles.eventCard, event.featured && styles.eventCardFeatured]}>
                    <Text style={[styles.eventTitle, event.featured && styles.eventTitleFeatured]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventDetail, event.featured && styles.eventDetailFeatured]}>
                      {event.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton label="일정 추가" />

      <AppBottomNav active="calendar" />
    </View>
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
  calendarCard: {
    padding: 17,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  weekRow: {
    flexDirection: 'row',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 80,
    alignItems: 'center',
    paddingTop: 9,
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
  },
  dayNumber: {
    color: '#191C1D',
    fontSize: 11,
    lineHeight: 17,
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
    color: '#000000',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  scheduleCount: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  eventList: {
    gap: 16,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 24,
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

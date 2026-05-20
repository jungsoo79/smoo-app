import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const pickerWeekdays = ['일', '월', '화', '수', '목', '금', '토'];

type DatePickerPopupProps = {
  onClose: () => void;
  onSelect: (dateString: string) => void;
  selectedDate: string;
  today?: string;
  visible: boolean;
};

function toDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getTodayString() {
  return toDateString(new Date());
}

function addMonths(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + count);
  return toDateString(date);
}

function getMonthTitle(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getCalendarDays(monthDateString: string) {
  const monthDate = new Date(`${monthDateString}T00:00:00`);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const startDate = new Date(firstDate);

  startDate.setDate(firstDate.getDate() - firstDate.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      day: date.getDate(),
      dateString: toDateString(date),
      isOutsideMonth: date.getMonth() !== month,
    };
  });
}

export function DatePickerPopup({
  onClose,
  onSelect,
  selectedDate,
  today = getTodayString(),
  visible,
}: DatePickerPopupProps) {
  const [tempDate, setTempDate] = useState(selectedDate);
  const [calendarMonth, setCalendarMonth] = useState(selectedDate);
  const days = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
      setCalendarMonth(selectedDate);
    }
  }, [selectedDate, visible]);

  const monthSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 48) {
            setCalendarMonth((month) => addMonths(month, -1));
            return;
          }

          if (gesture.dx < -48) {
            setCalendarMonth((month) => addMonths(month, 1));
          }
        },
      }),
    []
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.layer}>
        <Pressable accessibilityLabel="날짜 선택 닫기" onPress={onClose} style={styles.backdrop} />

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{getMonthTitle(calendarMonth)}</Text>
            <TouchableOpacity
              accessibilityLabel="날짜 선택 완료"
              activeOpacity={0.78}
              onPress={() => onSelect(tempDate)}
              style={styles.doneButton}>
              <Text style={styles.doneText}>완료</Text>
            </TouchableOpacity>
          </View>

          <View {...monthSwipeResponder.panHandlers}>
            <View style={styles.weekRow}>
              {pickerWeekdays.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((day) => {
                const isSelected = day.dateString === tempDate;
                const isToday = day.dateString === today;

                return (
                  <TouchableOpacity
                    key={day.dateString}
                    activeOpacity={0.72}
                    onPress={() => setTempDate(day.dateString)}
                    style={styles.dayCell}>
                    <View
                      style={[
                        styles.dayBadge,
                        isToday && !isSelected && styles.todayBadge,
                        isSelected && styles.selectedBadge,
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          day.isOutsideMonth && styles.outsideDayText,
                          isToday && !isSelected && styles.todayText,
                          isSelected && styles.selectedDayText,
                        ]}>
                        {day.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  card: {
    width: '100%',
    maxWidth: 326,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
    elevation: 18,
  },
  header: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#191C1D',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
  },
  doneButton: {
    minWidth: 50,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    color: '#7B7F82',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadge: {
    backgroundColor: '#EEF0F1',
  },
  selectedBadge: {
    backgroundColor: '#000000',
  },
  dayText: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  outsideDayText: {
    color: '#C6C9CB',
  },
  todayText: {
    color: '#191C1D',
    fontWeight: '800',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

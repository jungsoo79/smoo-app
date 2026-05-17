import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type LayoutRectangle,
} from 'react-native';

import { CategoryAddModal } from '@/components/category-add-modal';
import { DatePickerPopup } from '@/components/date-picker-popup';

type AddSheetProps = {
  initialDate?: string;
  visible: boolean;
  onClose: () => void;
  onSave?: (event: {
    category: string;
    categoryColor?: string;
    date: string;
    detail: string;
    endDate: string;
    endTime: TimeValue;
    isAllDay: boolean;
    startTime: TimeValue;
    title: string;
  }) => void;
};

type DateTarget = 'start' | 'end';
type TimeTarget = 'start' | 'end';
type Meridiem = 'AM' | 'PM';
type OptionMenu = 'repeat' | 'category' | 'alert';
type TimeValue = {
  meridiem: Meridiem;
  hour: number;
  minute: number;
};
type PickerOption = {
  color?: string;
  label: string;
  onPress?: () => void;
};

const meridiemOptions: Meridiem[] = ['AM', 'PM'];
const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const minuteOptions = [0, 10, 20, 30, 40, 50];
const repeatOptions = ['없음', '매일', '매주', '격주', '매월', '매년'];
const alertOptions = ['없음', '5분 전', '10분 전', '20분 전', '30분 전', '1시간 전', '3시간 전', '1일 전', '3일 전', '1주 전'];
const defaultCategoryOptions = [
  { color: '#9C4545', label: '업무' },
  { color: '#6B8BDD', label: '약속' },
  { color: '#1B9720', label: '운동' },
];
const wheelItemHeight = 38;
const wheelVisibleItems = 5;
const wheelPadding = wheelItemHeight * Math.floor(wheelVisibleItems / 2);
const screenWidth = Dimensions.get('window').width;

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

function formatDatePill(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatTimePill(time: TimeValue) {
  return `${time.meridiem} ${time.hour}:${String(time.minute).padStart(2, '0')}`;
}

function getInitialTime(): TimeValue {
  const now = new Date();
  const hours = now.getHours();
  const minute = Math.round(now.getMinutes() / 10) * 10;

  return {
    meridiem: hours >= 12 ? 'PM' : 'AM',
    hour: hours % 12 || 12,
    minute: minute === 60 ? 0 : minute,
  };
}

export function AddSheet({ initialDate, visible, onClose, onSave }: AddSheetProps) {
  const translateY = useRef(new Animated.Value(640)).current;
  const today = useMemo(getTodayString, []);
  const initialEventDate = initialDate ?? today;
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [isAllDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(initialEventDate);
  const [endDate, setEndDate] = useState(initialEventDate);
  const [startTime, setStartTime] = useState(getInitialTime);
  const [endTime, setEndTime] = useState(getInitialTime);
  const [pickerTarget, setPickerTarget] = useState<DateTarget | null>(null);
  const [timePickerTarget, setTimePickerTarget] = useState<TimeTarget | null>(null);
  const [openOptionMenu, setOpenOptionMenu] = useState<OptionMenu | null>(null);
  const [isCategoryAddVisible, setCategoryAddVisible] = useState(false);
  const [repeat, setRepeat] = useState('없음');
  const [category, setCategory] = useState('없음');
  const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions);
  const [alert, setAlert] = useState('없음');
  const repeatRowRef = useRef<View>(null);
  const categoryRowRef = useRef<View>(null);
  const alertRowRef = useRef<View>(null);
  const [optionAnchor, setOptionAnchor] = useState<LayoutRectangle | null>(null);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 640,
      damping: 28,
      stiffness: 220,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  useEffect(() => {
    if (visible) {
      const nextDate = initialDate ?? today;
      setTitle('');
      setDetail('');
      setAllDay(false);
      setStartDate(nextDate);
      setEndDate(nextDate);
      setStartTime(getInitialTime());
      setEndTime(getInitialTime());
      setRepeat('없음');
      setCategory('없음');
      setAlert('없음');
    }
  }, [initialDate, today, visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 640,
      duration: 190,
      useNativeDriver: true,
    }).start(onClose);
  }, [onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dy) > 2,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 120 || gesture.vy > 1.15) {
            closeWithAnimation();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        },
      }),
    [closeWithAnimation, translateY]
  );

  const selectedPickerDate = pickerTarget === 'end' ? endDate : startDate;
  const selectedPickerTime = timePickerTarget === 'end' ? endTime : startTime;
  const optionPickerConfig = useMemo(() => {
    if (openOptionMenu === 'repeat') {
      return {
        options: repeatOptions.map((option) => ({ label: option })),
        selectedValue: repeat,
        title: '반복',
      };
    }

    if (openOptionMenu === 'category') {
      return {
        options: [
          { label: '없음' },
          ...categoryOptions,
          {
            label: '추가',
            onPress: () => {
              setOpenOptionMenu(null);
              setCategoryAddVisible(true);
            },
          },
        ],
        selectedValue: category,
        title: '카테고리',
      };
    }

    if (openOptionMenu === 'alert') {
      return {
        options: alertOptions.map((option) => ({ label: option })),
        selectedValue: alert,
        title: '알림',
      };
    }

    return null;
  }, [alert, category, categoryOptions, openOptionMenu, repeat]);

  const openOptionPicker = useCallback((menu: OptionMenu, ref: React.RefObject<View | null>) => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setOptionAnchor({ height, width, x, y });
      setOpenOptionMenu(menu);
    });
  }, []);

  const selectDate = useCallback(
    (dateString: string) => {
      if (pickerTarget === 'end') {
        setEndDate(dateString);
      } else {
        setStartDate(dateString);
      }

      setPickerTarget(null);
    },
    [pickerTarget]
  );

  const selectTime = useCallback(
    (time: TimeValue) => {
      if (timePickerTarget === 'end') {
        setEndTime(time);
      } else {
        setStartTime(time);
      }
    },
    [timePickerTarget]
  );

  const openTimePicker = useCallback((target: TimeTarget) => {
    const currentTime = getInitialTime();

    if (target === 'end') {
      setEndTime(currentTime);
    } else {
      setStartTime(currentTime);
    }

    setTimePickerTarget(target);
  }, []);

  const submitEvent = useCallback(() => {
    const nextTitle = title.trim();

    if (!nextTitle) {
      return;
    }

    onSave?.({
      category,
      categoryColor: categoryOptions.find((option) => option.label === category)?.color,
      date: startDate,
      detail: detail.trim(),
      endDate,
      endTime,
      isAllDay,
      startTime,
      title: nextTitle,
    });
    closeWithAnimation();
  }, [
    category,
    categoryOptions,
    closeWithAnimation,
    detail,
    endDate,
    endTime,
    isAllDay,
    onSave,
    startDate,
    startTime,
    title,
  ]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={closeWithAnimation}>
      <View style={styles.sheetLayer}>
        <Pressable accessibilityLabel="일정 추가 닫기" onPress={closeWithAnimation} style={styles.sheetBackdrop} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <TextInput
              placeholder="제목"
              placeholderTextColor="#6F6F6F"
              value={title}
              onChangeText={setTitle}
              style={styles.sheetTitleInput}
            />

            <TextInput
              multiline
              placeholder="세부 내용"
              placeholderTextColor="#6F6F6F"
              value={detail}
              onChangeText={setDetail}
              style={styles.sheetDetailInput}
            />

            <View style={styles.allDayRow}>
              <Text style={styles.allDayText}>하루종일</Text>
              <TouchableOpacity
                accessibilityLabel="하루종일 설정"
                activeOpacity={0.8}
                onPress={() => setAllDay((value) => !value)}
                style={[styles.toggleTrack, isAllDay && styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, isAllDay && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            <TimeBlock
              date={startDate}
              isTimeDisabled={isAllDay}
              onDatePress={() => setPickerTarget('start')}
              onTimePress={() => openTimePicker('start')}
              time={startTime}
              title="시작"
            />
            <TimeBlock
              date={endDate}
              isTimeDisabled={isAllDay}
              onDatePress={() => setPickerTarget('end')}
              onTimePress={() => openTimePicker('end')}
              time={endTime}
              title="종료"
            />

            <OptionRow
              rowRef={repeatRowRef}
              onPress={() => openOptionPicker('repeat', repeatRowRef)}
              title="반복"
              value={repeat}
            />

            <OptionRow
              rowRef={categoryRowRef}
              onPress={() => openOptionPicker('category', categoryRowRef)}
              title="카테고리"
              value={category}
            />

            <OptionRow
              rowRef={alertRowRef}
              onPress={() => openOptionPicker('alert', alertRowRef)}
              title="알림"
              value={alert}
            />

            <TouchableOpacity activeOpacity={0.84} onPress={submitEvent} style={styles.sheetSubmitButton}>
              <Text style={styles.sheetSubmitText}>추가하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <DatePickerPopup
          onClose={() => setPickerTarget(null)}
          onSelect={selectDate}
          selectedDate={selectedPickerDate}
          today={today}
          visible={pickerTarget !== null}
        />

        <TimePickerPopup
          onClose={() => setTimePickerTarget(null)}
          onSelect={selectTime}
          selectedTime={selectedPickerTime}
          visible={timePickerTarget !== null}
        />

        <CategoryAddModal
          visible={isCategoryAddVisible}
          onClose={() => setCategoryAddVisible(false)}
          onAdd={(nextCategory) => {
            setCategoryOptions((options) => {
              if (options.some((option) => option.label === nextCategory.label)) {
                return options;
              }

              return [...options, nextCategory];
            });
            setCategory(nextCategory.label);
          }}
        />

        <OptionPickerModal
          onClose={() => setOpenOptionMenu(null)}
          onSelect={(value) => {
            if (openOptionMenu === 'repeat') {
              setRepeat(value);
            } else if (openOptionMenu === 'category') {
              setCategory(value);
            } else if (openOptionMenu === 'alert') {
              setAlert(value);
            }

            setOpenOptionMenu(null);
          }}
          options={optionPickerConfig?.options ?? []}
          anchor={optionAnchor}
          selectedValue={optionPickerConfig?.selectedValue ?? ''}
          title={optionPickerConfig?.title ?? ''}
          visible={optionPickerConfig !== null}
        />
      </View>
    </Modal>
  );
}

function TimeBlock({
  date,
  isTimeDisabled = false,
  onDatePress,
  onTimePress,
  time,
  title,
}: {
  date: string;
  isTimeDisabled?: boolean;
  onDatePress: () => void;
  onTimePress: () => void;
  time: TimeValue;
  title: string;
}) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeBlockTitle}>{title}</Text>
      <View style={styles.timePillRow}>
        <TouchableOpacity activeOpacity={0.75} onPress={onDatePress} style={styles.timePill}>
          <Text style={styles.timePillText}>{formatDatePill(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={isTimeDisabled ? 1 : 0.75}
          disabled={isTimeDisabled}
          onPress={onTimePress}
          style={[styles.timePill, isTimeDisabled && styles.timePillDisabled]}>
          <Text style={[styles.timePillText, isTimeDisabled && styles.timePillTextDisabled]}>
            {formatTimePill(time)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TimePickerPopup({
  onClose,
  onSelect,
  selectedTime,
  visible,
}: {
  onClose: () => void;
  onSelect: (time: TimeValue) => void;
  selectedTime: TimeValue;
  visible: boolean;
}) {
  const updateTime = (partial: Partial<TimeValue>) => {
    onSelect({
      ...selectedTime,
      ...partial,
    });
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.timePickerLayer}>
        <Pressable accessibilityLabel="시간 선택 닫기" onPress={onClose} style={styles.timePickerBackdrop} />

        <View style={styles.timePickerCard}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>시간 선택</Text>
            <TouchableOpacity accessibilityLabel="시간 선택 완료" onPress={onClose} style={styles.timePickerDoneButton}>
              <Text style={styles.timePickerDoneText}>완료</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerBody}>
            <View style={styles.timePickerHighlight} />
            <WheelColumn
              onChange={(meridiem) => updateTime({ meridiem })}
              options={meridiemOptions}
              renderLabel={(meridiem) => (meridiem === 'AM' ? '오전' : '오후')}
              selectedValue={selectedTime.meridiem}
            />
            <WheelColumn
              onChange={(hour) => updateTime({ hour })}
              options={hourOptions}
              renderLabel={(hour) => String(hour).padStart(2, '0')}
              selectedValue={selectedTime.hour}
            />
            <WheelColumn
              onChange={(minute) => updateTime({ minute })}
              options={minuteOptions}
              renderLabel={(minute) => String(minute).padStart(2, '0')}
              selectedValue={selectedTime.minute}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WheelColumn<T>({
  onChange,
  options,
  renderLabel,
  selectedValue,
}: {
  onChange: (value: T) => void;
  options: T[];
  renderLabel: (value: T) => string;
  selectedValue: T;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option === selectedValue)
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ animated: false, y: selectedIndex * wheelItemHeight });
    });
  }, [selectedIndex]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.max(
      0,
      Math.min(options.length - 1, Math.round(event.nativeEvent.contentOffset.y / wheelItemHeight))
    );
    const nextValue = options[nextIndex];

    if (nextValue !== selectedValue) {
      onChange(nextValue);
    }

    scrollRef.current?.scrollTo({ animated: true, y: nextIndex * wheelItemHeight });
  };

  return (
    <ScrollView
      ref={scrollRef}
      bounces={false}
      decelerationRate="fast"
      disableIntervalMomentum
      nestedScrollEnabled
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={wheelItemHeight}
      style={styles.wheelColumn}
      contentContainerStyle={styles.wheelColumnContent}>
      {options.map((option) => {
        const isSelected = option === selectedValue;

        return (
          <View key={renderLabel(option)} style={styles.wheelOption}>
            <Text style={[styles.wheelOptionText, isSelected && styles.wheelOptionActive]}>
              {renderLabel(option)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function OptionRow({
  onPress,
  rowRef,
  title,
  value,
}: {
  onPress: () => void;
  rowRef: React.RefObject<View | null>;
  title: string;
  value: string;
}) {
  return (
    <TouchableOpacity ref={rowRef} activeOpacity={0.78} onPress={onPress} style={styles.optionRow}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionValueGroup}>
        <Text style={styles.optionValue}>{value}</Text>
        <MaterialIcons name="chevron-right" size={18} color="#C6C6C6" />
      </View>
    </TouchableOpacity>
  );
}

function OptionPickerModal({
  anchor,
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
  visible,
}: {
  anchor: LayoutRectangle | null;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: PickerOption[];
  selectedValue: string;
  title: string;
  visible: boolean;
}) {
  const pickerWidth = 132;
  const pickerTop = anchor ? anchor.y + anchor.height - 10 : 0;
  const pickerRight = anchor ? Math.max(16, screenWidth - anchor.x - anchor.width) : 32;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.optionPickerLayer}>
        <Pressable accessibilityLabel={`${title} 선택 닫기`} onPress={onClose} style={styles.optionPickerBackdrop} />

        <View
          style={[
            styles.optionPickerCard,
            {
              right: pickerRight,
              top: pickerTop,
              width: pickerWidth,
            },
          ]}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.optionPickerList}
            contentContainerStyle={styles.optionPickerContent}>
            {options.map((option) => (
              <PickerOptionRow
                color={option.color}
                isSelected={selectedValue === option.label}
                key={option.label}
                label={option.label}
                onPress={() => {
                  if (option.onPress) {
                    option.onPress();
                    return;
                  }

                  onSelect(option.label);
                }}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PickerOptionRow({
  color,
  isSelected = false,
  label,
  onPress,
}: {
  color?: string;
  isSelected?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.72} onPress={onPress} style={styles.optionPickerItem}>
      {color ? <View style={[styles.categoryDot, { backgroundColor: color }]} /> : null}
      <Text style={[styles.optionPickerItemText, isSelected && styles.optionPickerItemSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sheetLayer: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.14,
    shadowRadius: 48,
    elevation: 18,
  },
  sheetHandleArea: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 17,
    backgroundColor: '#FFFFFF',
  },
  sheetHandle: { width: 47, height: 6, borderRadius: 999, backgroundColor: '#D9D9D9' },
  sheetContent: { paddingHorizontal: 32, paddingBottom: 34, gap: 16 },
  sheetTitleInput: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F3F4F5',
  },
  sheetDetailInput: {
    minHeight: 96,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 22,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F3F4F5',
    textAlignVertical: 'top',
  },
  allDayRow: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allDayText: { color: '#191C1D', fontSize: 18, lineHeight: 26, fontWeight: '700' },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
    backgroundColor: '#D9D9D9',
  },
  toggleTrackOn: { backgroundColor: '#578CFF' },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  timeBlock: {
    minHeight: 96,
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#F3F4F5',
  },
  timeBlockTitle: { color: '#191C1D', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  timePillRow: { flexDirection: 'row', gap: 16 },
  timePill: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  timePillDisabled: {
    opacity: 0.36,
  },
  timePillText: { color: '#474747', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  timePillTextDisabled: {
    color: '#A3A3A3',
  },
  timePickerLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  timePickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.18)' },
  timePickerCard: {
    width: '100%',
    maxWidth: 328,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 36,
    elevation: 18,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timePickerTitle: { color: '#191C1D', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  timePickerDoneButton: {
    minWidth: 58,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  timePickerDoneText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  timePickerBody: {
    height: wheelItemHeight * wheelVisibleItems,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
  },
  timePickerHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: wheelPadding,
    height: wheelItemHeight,
    backgroundColor: 'rgba(87, 140, 255, 0.42)',
  },
  wheelColumn: { flex: 1, borderLeftWidth: 1, borderColor: 'rgba(198, 198, 198, 0.35)' },
  wheelColumnContent: { paddingVertical: wheelPadding },
  wheelOption: { height: wheelItemHeight, alignItems: 'center', justifyContent: 'center' },
  wheelOptionText: { color: '#A3A3A3', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  wheelOptionActive: { color: '#191C1D', fontSize: 18, fontWeight: '800' },
  optionRow: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F5',
  },
  optionTitle: { color: '#191C1D', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  optionValueGroup: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  optionValue: { color: '#474747', fontSize: 16, lineHeight: 22, fontWeight: '500' },
  optionPickerLayer: {
    flex: 1,
    zIndex: 999,
    elevation: 999,
  },
  optionPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  optionPickerCard: {
    position: 'absolute',
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 24,
    zIndex: 1000,
  },
  optionPickerList: {
    maxHeight: 142,
  },
  optionPickerContent: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionPickerItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  optionPickerItemText: {
    color: '#474747',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'right',
  },
  optionPickerItemSelected: { color: '#000000', fontWeight: '800' },
  categoryDot: { width: 10, height: 10, borderRadius: 999 },
  sheetSubmitButton: {
    height: 64,
    marginTop: 70,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  sheetSubmitText: { color: '#FFFFFF', fontSize: 18, lineHeight: 26, fontWeight: '700' },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
import { AppColors, AppTypography } from '@/constants/appStyles';
import { AddTodoSheet } from '@/features/checklist/components/AddTodoSheet';

const koreanWeekdays = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getMonthLabel(dateString: string) {
  const [year, month] = dateString.split('-');

  return `${year}년 ${Number(month)}월`;
}

function getDateOptions(startOffset: number, endOffset: number) {
  const today = new Date();
  const optionCount = endOffset - startOffset + 1;

  return Array.from({ length: optionCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + startOffset + index);

    return {
      dateString: toLocalDateString(date),
      day: String(date.getDate()),
      weekday: koreanWeekdays[date.getDay()],
    };
  });
}

const todayString = toLocalDateString(new Date());
const datePillSlotWidth = 80;
const dateRangeChunk = 180;
const initialDateRange = {
  startOffset: -365,
  endOffset: 365,
};

type Task = {
  id: string;
  title: string;
  detail?: string;
  badge?: string;
  done?: boolean;
};

type TaskSection = {
  title: string;
  tasks: Task[];
};

type TaskSectionsByDate = Record<string, TaskSection[]>;

const initialTaskSectionsByDate: TaskSectionsByDate = {};

export default function ChecklistScreen() {
  const datePickerRef = useRef<ScrollView>(null);
  const didInitialDateScroll = useRef(false);
  const monthLabelOpacity = useRef(new Animated.Value(0)).current;
  const monthLabelHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [taskSectionsByDate, setTaskSectionsByDate] = useState(initialTaskSectionsByDate);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [scrollMonthLabel, setScrollMonthLabel] = useState(getMonthLabel(todayString));
  const dateOptions = useMemo(
    () => getDateOptions(dateRange.startOffset, dateRange.endOffset),
    [dateRange.endOffset, dateRange.startOffset]
  );
  const todayOptionIndex = -dateRange.startOffset;
  const taskSections = taskSectionsByDate[selectedDate] ?? [];

  useEffect(() => {
    if (didInitialDateScroll.current) {
      return;
    }

    didInitialDateScroll.current = true;
    requestAnimationFrame(() => {
      datePickerRef.current?.scrollTo({
        animated: false,
        x: Math.max(0, todayOptionIndex * datePillSlotWidth - datePillSlotWidth * 2),
      });
    });
  }, [todayOptionIndex]);

  useEffect(() => {
    return () => {
      if (monthLabelHideTimer.current) {
        clearTimeout(monthLabelHideTimer.current);
      }
    };
  }, []);

  const showMonthLabel = useCallback(() => {
    if (monthLabelHideTimer.current) {
      clearTimeout(monthLabelHideTimer.current);
    }

    Animated.timing(monthLabelOpacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [monthLabelOpacity]);

  const hideMonthLabelSoon = useCallback(() => {
    if (monthLabelHideTimer.current) {
      clearTimeout(monthLabelHideTimer.current);
    }

    monthLabelHideTimer.current = setTimeout(() => {
      Animated.timing(monthLabelOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, 260);
  }, [monthLabelOpacity]);

  const handleDateScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const centerDateIndex = Math.round(event.nativeEvent.contentOffset.x / datePillSlotWidth) + 2;
      const centerDate = dateOptions[centerDateIndex];

      if (!centerDate) {
        return;
      }

      showMonthLabel();
      hideMonthLabelSoon();
      setScrollMonthLabel((currentMonth) => {
        const nextMonth = getMonthLabel(centerDate.dateString);

        return currentMonth === nextMonth ? currentMonth : nextMonth;
      });
    },
    [dateOptions, hideMonthLabelSoon, showMonthLabel]
  );

  const handleDateScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const leftThreshold = datePillSlotWidth * 4;
    const rightThreshold = datePillSlotWidth * 4;

    if (contentOffset.x < leftThreshold) {
      hideMonthLabelSoon();
      setDateRange((range) => ({
        ...range,
        startOffset: range.startOffset - dateRangeChunk,
      }));
      requestAnimationFrame(() => {
        datePickerRef.current?.scrollTo({
          animated: false,
          x: contentOffset.x + dateRangeChunk * datePillSlotWidth,
        });
      });
      return;
    }

    if (contentSize.width - layoutMeasurement.width - contentOffset.x < rightThreshold) {
      setDateRange((range) => ({
        ...range,
        endOffset: range.endOffset + dateRangeChunk,
      }));
    }

    hideMonthLabelSoon();
  }, [hideMonthLabelSoon]);

  const toggleTaskDone = useCallback((sectionTitle: string, taskId: string) => {
    setTaskSectionsByDate((sectionsByDate) => {
      const currentSections = sectionsByDate[selectedDate] ?? [];

      return {
        ...sectionsByDate,
        [selectedDate]: currentSections.map((section) => {
          if (section.title !== sectionTitle) {
            return section;
          }

          return {
            ...section,
            tasks: section.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    done: !task.done,
                  }
                : task
            ),
          };
        }),
      };
    });
  }, [selectedDate]);

  const updateSectionTasks = useCallback((sectionTitle: string, tasks: Task[]) => {
    setTaskSectionsByDate((sectionsByDate) => {
      const currentSections = sectionsByDate[selectedDate] ?? [];

      return {
        ...sectionsByDate,
        [selectedDate]: currentSections.map((section) =>
          section.title === sectionTitle
            ? {
                ...section,
                tasks,
              }
            : section
        ),
      };
    });
  }, [selectedDate]);

  const saveTodo = useCallback(
    ({
      category,
      date,
      memo,
      title,
    }: {
      category: string;
      date: string;
      memo?: string;
      title: string;
    }) => {
      const sectionTitle = category === '없음' ? '일상' : category;
      const nextTask: Task = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        detail: memo,
      };

      setTaskSectionsByDate((sectionsByDate) => {
        const currentSections = sectionsByDate[date] ?? [];
        const sectionExists = currentSections.some((section) => section.title === sectionTitle);

        return {
          ...sectionsByDate,
          [date]: sectionExists
            ? currentSections.map((section) =>
                section.title === sectionTitle
                  ? {
                      ...section,
                      tasks: [...section.tasks, nextTask],
                    }
                  : section
              )
            : [
                ...currentSections,
                {
                  title: sectionTitle,
                  tasks: [nextTask],
                },
              ],
        };
      });
      setSelectedDate(date);
    },
    []
  );

  return (
    <View style={styles.screen}>
      <View style={styles.blurTop} />
      <View style={styles.blurBottom} />

      <View style={styles.safeArea}>
        <AppTopBar title="할 일" />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.dateStrip}>
            <Animated.Text
              pointerEvents="none"
              style={[styles.scrollMonthGhost, { opacity: monthLabelOpacity }]}>
              {scrollMonthLabel}
            </Animated.Text>

            <ScrollView
              ref={datePickerRef}
              horizontal
              bounces={false}
              decelerationRate="fast"
              onMomentumScrollEnd={handleDateScrollEnd}
              onScroll={handleDateScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToInterval={datePillSlotWidth}
              snapToAlignment="start"
              contentContainerStyle={styles.datePicker}>
              {dateOptions.map((date) => {
                const isActive = date.dateString === selectedDate;

                return (
                  <View key={date.dateString} style={styles.datePillSlot}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedDate(date.dateString)}
                      style={[styles.datePill, isActive && styles.datePillActive]}>
                      <Text style={[styles.dateWeekday, isActive && styles.dateWeekdayActive]}>
                        {date.weekday}
                      </Text>
                      <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>
                        {date.day}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.taskGroups}>
            {taskSections.length === 0 ? (
              <View style={styles.emptyTasks}>
                <Text style={styles.emptyTasksText}>등록된 할 일이 없습니다.</Text>
              </View>
            ) : null}

            {taskSections.map((section) => (
              <View key={section.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{section.title}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </View>

                <DraggableFlatList
                  activationDistance={8}
                  containerStyle={styles.taskList}
                  data={section.tasks}
                  ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
                  keyExtractor={(item) => item.id}
                  onDragEnd={({ data }) => updateSectionTasks(section.title, data)}
                  renderItem={(params) => (
                    <TaskCard
                      {...params}
                      onToggle={() => toggleTaskDone(section.title, params.item.id)}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton label="할 일 추가" onPress={() => setAddSheetVisible(true)} />

      <AddTodoSheet
        initialDate={selectedDate}
        visible={isAddSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onSave={saveTodo}
      />

      <AppBottomNav active="checklist" />
    </View>
  );
}

function TaskCard({
  drag,
  isActive,
  item: task,
  onToggle,
}: RenderItemParams<Task> & {
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={isActive}
      onPress={onToggle}
      style={[styles.taskCard, isActive && styles.taskCardActive]}>
      <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
        {task.done ? <MaterialIcons name="check" size={15} color="#FFFFFF" /> : null}
      </View>

      <View style={[styles.taskTextGroup, task.done && styles.taskDoneTextGroup]}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
        {task.badge ? (
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{task.badge}</Text>
          </View>
        ) : null}
        {task.detail ? <Text style={[styles.taskMemo, task.done && styles.taskMemoDone]}>{task.detail}</Text> : null}
      </View>

      <TouchableOpacity
        accessibilityLabel={`${task.title} 순서 변경`}
        activeOpacity={0.7}
        delayLongPress={80}
        onLongPress={drag}
        style={styles.dragHandle}>
        <MaterialIcons name="drag-indicator" size={18} color="rgba(71, 71, 71, 0.36)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  blurTop: {
    position: 'absolute',
    top: -104,
    right: -39,
    width: 195,
    height: 519,
    borderRadius: 999,
    backgroundColor: 'rgba(231, 232, 233, 0.4)',
    shadowColor: '#E7E8E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 60,
  },
  blurBottom: {
    position: 'absolute',
    left: -20,
    bottom: -52,
    width: 156,
    height: 415,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 218, 219, 0.3)',
    shadowColor: '#D9DADB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 50,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 176,
    gap: 48,
  },
  dateStrip: {
    position: 'relative',
    height: 98,
  },
  scrollMonthGhost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    elevation: 1,
    color: 'rgba(25, 28, 29, 0.28)',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(25, 28, 29, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  datePicker: {
    height: 98,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  datePillSlot: {
    width: datePillSlotWidth,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePill: {
    width: 64,
    height: 67,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7E8E9',
  },
  datePillActive: {
    width: 74,
    height: 75,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  dateWeekday: {
    color: '#474747',
    opacity: 0.6,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
  },
  dateWeekdayActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  dateDay: {
    color: '#474747',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
  },
  dateDayActive: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  taskGroups: {
    gap: 40,
  },
  emptyTasks: {
    minHeight: 88,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  emptyTasksText: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E1E3E4',
  },
  sectionBadgeText: {
    color: '#5E5E5E',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: 2.2,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(225, 227, 228, 0.5)',
  },
  taskList: {
    gap: 0,
  },
  taskSeparator: {
    height: 12,
  },
  taskCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
    elevation: 3,
  },
  taskCardActive: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
    transform: [{ scale: 1.01 }],
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#C6C6C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  taskTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  taskDoneTextGroup: {
    opacity: 0.4,
  },
  taskTitle: {
    ...AppTypography.body,
    fontWeight: '500',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskMemo: {
    ...AppTypography.caption,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  taskMemoDone: {
    textDecorationLine: 'line-through',
  },
  dragHandle: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    backgroundColor: '#FFDAD6',
  },
  priorityText: {
    color: '#410002',
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '500',
  },
});

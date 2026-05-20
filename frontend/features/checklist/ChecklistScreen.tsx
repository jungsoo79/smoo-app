import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
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

function getVisibleDateCount(viewportWidth: number) {
  if (viewportWidth < 340) {
    return 3;
  }

  if (viewportWidth < 500) {
    return 5;
  }

  const count = Math.max(5, Math.floor(viewportWidth / 92));

  return count % 2 === 0 ? count - 1 : count;
}

const todayString = toLocalDateString(new Date());
const dateRangeStartOffset = -730;
const dateRangeEndOffset = 730;

type DateOption = {
  dateString: string;
  day: string;
  weekday: string;
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
  const { width: viewportWidth } = useWindowDimensions();
  const datePickerRef = useRef<FlatList<DateOption>>(null);
  const monthLabelOpacity = useRef(new Animated.Value(0)).current;
  const monthLabelHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [taskSectionsByDate, setTaskSectionsByDate] = useState(initialTaskSectionsByDate);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [scrollMonthLabel, setScrollMonthLabel] = useState(getMonthLabel(todayString));
  const dateOptions = useMemo(() => getDateOptions(dateRangeStartOffset, dateRangeEndOffset), []);
  const taskSections = taskSectionsByDate[selectedDate] ?? [];
  const safeViewportWidth = Math.max(viewportWidth, 320);
  const visibleDateCount = getVisibleDateCount(safeViewportWidth);
  const sideDateCount = Math.floor(visibleDateCount / 2);
  const datePillSlotWidth = Math.max(1, safeViewportWidth / visibleDateCount);

  const scrollToSelectedDate = useCallback(
    (dateString: string, animated: boolean) => {
      const selectedIndex = dateOptions.findIndex((date) => date.dateString === dateString);

      if (selectedIndex < 0) {
        return;
      }

      datePickerRef.current?.scrollToOffset({
        animated,
        offset: Math.max(0, (selectedIndex - sideDateCount) * datePillSlotWidth),
      });
    },
    [dateOptions, datePillSlotWidth, sideDateCount]
  );

  const getDateItemLayout = useCallback(
    (_: ArrayLike<DateOption> | null | undefined, index: number) => ({
      index,
      length: datePillSlotWidth,
      offset: datePillSlotWidth * index,
    }),
    [datePillSlotWidth]
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToSelectedDate(selectedDate, false);
    });
  }, [scrollToSelectedDate, selectedDate]);

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

  const selectDate = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      setScrollMonthLabel(getMonthLabel(dateString));
      scrollToSelectedDate(dateString, true);
      showMonthLabel();
      hideMonthLabelSoon();
    },
    [hideMonthLabelSoon, scrollToSelectedDate, showMonthLabel]
  );

  const getCenteredDateFromScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const centerIndex = Math.round(event.nativeEvent.contentOffset.x / datePillSlotWidth) + sideDateCount;

      return dateOptions[Math.max(0, Math.min(dateOptions.length - 1, centerIndex))];
    },
    [dateOptions, datePillSlotWidth, sideDateCount]
  );

  const handleDateScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const centerDate = getCenteredDateFromScroll(event);

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
    [getCenteredDateFromScroll, hideMonthLabelSoon, showMonthLabel]
  );

  const handleDateScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const centerDate = getCenteredDateFromScroll(event);

      if (centerDate) {
        setSelectedDate(centerDate.dateString);
        setScrollMonthLabel(getMonthLabel(centerDate.dateString));
        scrollToSelectedDate(centerDate.dateString, true);
      }

      hideMonthLabelSoon();
    },
    [getCenteredDateFromScroll, hideMonthLabelSoon, scrollToSelectedDate]
  );

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

  const updateTaskSections = useCallback((sections: TaskSection[]) => {
    setTaskSectionsByDate((sectionsByDate) => ({
      ...sectionsByDate,
      [selectedDate]: sections,
    }));
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
      selectDate(date);
    },
    [selectDate]
  );

  return (
    <View style={styles.screen}>
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

            <FlatList
              ref={datePickerRef}
              data={dateOptions}
              horizontal
              bounces={false}
              contentContainerStyle={styles.datePicker}
              decelerationRate="fast"
              getItemLayout={getDateItemLayout}
              initialNumToRender={visibleDateCount + 4}
              keyExtractor={(date) => date.dateString}
              maxToRenderPerBatch={visibleDateCount + 4}
              onMomentumScrollEnd={handleDateScrollEnd}
              onScroll={handleDateScroll}
              renderItem={({ item: date }) => {
                const isActive = date.dateString === selectedDate;

                return (
                  <View style={[styles.datePillSlot, { width: datePillSlotWidth }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => selectDate(date.dateString)}
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
              }}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToInterval={datePillSlotWidth}
              snapToAlignment="start"
              windowSize={5}
            />
          </View>

          <View style={styles.taskGroups}>
            {taskSections.length === 0 ? (
              <View style={styles.emptyTasks}>
                <Text style={styles.emptyTasksText}>등록된 할 일이 없습니다.</Text>
              </View>
            ) : null}

            <DraggableFlatList
              activationDistance={8}
              containerStyle={styles.sectionList}
              data={taskSections}
              ItemSeparatorComponent={() => <View style={styles.sectionSeparator} />}
              keyExtractor={(item) => item.title}
              onDragEnd={({ data }) => updateTaskSections(data)}
              renderItem={(params) => (
                <TaskSectionBlock
                  {...params}
                  onToggleTask={toggleTaskDone}
                  onUpdateTasks={updateSectionTasks}
                />
              )}
              scrollEnabled={false}
            />
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

function TaskSectionBlock({
  drag,
  isActive,
  item: section,
  onToggleTask,
  onUpdateTasks,
}: RenderItemParams<TaskSection> & {
  onToggleTask: (sectionTitle: string, taskId: string) => void;
  onUpdateTasks: (sectionTitle: string, tasks: Task[]) => void;
}) {
  return (
    <View style={[styles.section, isActive && styles.sectionActive]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{section.title}</Text>
        </View>
        <View style={styles.sectionDivider} />
        <TouchableOpacity
          accessibilityLabel={`${section.title} 카테고리 순서 변경`}
          activeOpacity={0.7}
          delayLongPress={80}
          onLongPress={drag}
          style={styles.sectionDragHandle}>
          <MaterialIcons name="drag-indicator" size={18} color="rgba(71, 71, 71, 0.32)" />
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        activationDistance={8}
        containerStyle={styles.taskList}
        data={section.tasks}
        ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => onUpdateTasks(section.title, data)}
        renderItem={(params) => (
          <TaskCard
            {...params}
            onToggle={() => onToggleTask(section.title, params.item.id)}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

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
    paddingTop: 28,
    paddingHorizontal: 0,
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
    paddingHorizontal: 24,
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
  sectionActive: {
    opacity: 0.96,
    transform: [{ scale: 1.01 }],
  },
  sectionList: {
    gap: 0,
  },
  sectionSeparator: {
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
    paddingRight: 0,
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
  sectionDragHandle: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#191C1D',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskMemo: {
    color: '#474747',
    fontSize: 13,
    lineHeight: 18,
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

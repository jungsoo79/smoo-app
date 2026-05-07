import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';

const dates = [
  { weekday: '월', day: '12' },
  { weekday: '화', day: '13' },
  { weekday: '수', day: '14', active: true },
  { weekday: '목', day: '15' },
  { weekday: '금', day: '16' },
];

const taskSections = [
  {
    title: '일상',
    tasks: [
      {
        title: '왜 나는 아직도 학교인 것인가..',
        detail: '미디엄 로스트, 에티오피아 예가체프',
      },
      {
        title: '식물 물 주기',
        detail: '모닝 루틴',
        done: true,
      },
    ],
  },
  {
    title: '업무',
    tasks: [
      {
        title: '이메일 답장',
        badge: '우선순위',
      },
      {
        title: '3분기 발표 자료 초안',
        detail: '수익 차트 포함',
      },
    ],
  },
  {
    title: '건강',
    tasks: [
      {
        title: '30분 운동',
        detail: '고강도 인터벌 트레이닝',
      },
    ],
  },
];

export default function ChecklistScreen() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);

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
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePicker}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date.day}
                activeOpacity={0.8}
                style={[styles.datePill, date.active && styles.datePillActive]}>
                <Text style={[styles.dateWeekday, date.active && styles.dateWeekdayActive]}>
                  {date.weekday}
                </Text>
                <Text style={[styles.dateDay, date.active && styles.dateDayActive]}>{date.day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.taskGroups}>
            {taskSections.map((section) => (
              <View key={section.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{section.title}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </View>

                <View style={styles.taskList}>
                  {section.tasks.map((task) => (
                    <TaskCard key={task.title} task={task} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton label="할 일 추가" onPress={() => setAddSheetVisible(true)} />

      <AddTodoSheet visible={isAddSheetVisible} onClose={() => setAddSheetVisible(false)} />

      <AppBottomNav active="checklist" />
    </View>
  );
}

function AddTodoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const translateY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 420,
      damping: 26,
      stiffness: 220,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 420,
      duration: 180,
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
          if (gesture.dy > 110 || gesture.vy > 1.2) {
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

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={closeWithAnimation}>
      <View style={styles.sheetLayer}>
        <Pressable accessibilityLabel="할 일 추가 닫기" style={styles.sheetBackdrop} onPress={closeWithAnimation} />

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
              style={styles.sheetTitleInput}
            />

            <TextInput
              multiline
              placeholder="세부 내용"
              placeholderTextColor="#6F6F6F"
              style={styles.sheetDetailInput}
            />

            <View style={styles.allDayRow}>
              <Text style={styles.allDayText}>하루종일</Text>
              <TouchableOpacity accessibilityLabel="하루종일 설정" activeOpacity={0.8} style={styles.toggleTrack}>
                <View style={styles.toggleThumb} />
              </TouchableOpacity>
            </View>

            <TimeBlock title="시작" />
            <TimeBlock title="종료" />

            <OptionRow title="반복" value="없음" />
            <OptionRow title="카테고리" value="없음" />
            <OptionRow title="알림" value="없음" />

            <TouchableOpacity activeOpacity={0.84} style={styles.sheetSubmitButton}>
              <Text style={styles.sheetSubmitText}>추가하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function TimeBlock({ title }: { title: string }) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeBlockTitle}>{title}</Text>
      <View style={styles.timePillRow}>
        <View style={styles.timePill}>
          <Text style={styles.timePillText}>2026.4.2</Text>
        </View>
        <View style={styles.timePill}>
          <Text style={styles.timePillText}>AM 9:00</Text>
        </View>
      </View>
    </View>
  );
}

function OptionRow({ title, value }: { title: string; value: string }) {
  return (
    <TouchableOpacity activeOpacity={0.78} style={styles.optionRow}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionValueGroup}>
        <Text style={styles.optionValue}>{value}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#C6C6C6" />
      </View>
    </TouchableOpacity>
  );
}

function TaskCard({
  task,
}: {
  task: {
    title: string;
    detail?: string;
    badge?: string;
    done?: boolean;
  };
}) {
  return (
    <TouchableOpacity activeOpacity={0.78} style={styles.taskCard}>
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
        {task.detail ? <Text style={styles.taskDetail}>{task.detail}</Text> : null}
      </View>

      <MaterialIcons name="drag-indicator" size={18} color="rgba(71, 71, 71, 0.28)" />
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
  datePicker: {
    height: 107,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 2,
  },
  datePill: {
    minWidth: 56,
    height: 67,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#E7E8E9',
  },
  datePillActive: {
    width: 64,
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
    gap: 12,
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
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskDetail: {
    color: '#474747',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
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
  sheetLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.14,
    shadowRadius: 48,
    elevation: 18,
  },
  sheetHandleArea: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 18,
    backgroundColor: '#FFFFFF',
  },
  sheetHandle: {
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#D9DADB',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    gap: 16,
  },
  sheetTitleInput: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    backgroundColor: '#F2F3F4',
  },
  sheetDetailInput: {
    minHeight: 96,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 18,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F2F3F4',
    textAlignVertical: 'top',
  },
  allDayRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allDayText: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
    backgroundColor: '#D9DADB',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  timeBlock: {
    minHeight: 92,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: '#F2F3F4',
  },
  timeBlockTitle: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  timePillRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timePill: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  timePillText: {
    color: '#474747',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  optionRow: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F3F4',
  },
  optionTitle: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  optionValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    color: '#3F3F3F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  sheetSubmitButton: {
    height: 56,
    marginTop: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  sheetSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});

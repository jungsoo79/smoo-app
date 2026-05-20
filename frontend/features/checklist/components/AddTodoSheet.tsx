import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  type LayoutRectangle,
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

import { CategoryAddModal } from '@/components/shared/CategoryAddModal';
import { DatePickerPopup } from '@/components/shared/DatePickerPopup';

type AddTodoSheetProps = {
  initialDate: string;
  visible: boolean;
  onClose: () => void;
  onSave: (todo: { category: string; date: string; memo?: string; title: string }) => void;
};

type PickerOption = {
  color?: string;
  label: string;
  onPress?: () => void;
};

const defaultCategoryOptions = [
  { color: '#9C4545', label: '업무' },
  { color: '#6B8BDD', label: '약속' },
  { color: '#1B9720', label: '운동' },
];

const screenWidth = Dimensions.get('window').width;

function formatDatePill(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function AddTodoSheet({ initialDate, visible, onClose, onSave }: AddTodoSheetProps) {
  const translateY = useRef(new Animated.Value(420)).current;
  const categoryRowRef = useRef<View>(null);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [category, setCategory] = useState('없음');
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isCategoryAddVisible, setCategoryAddVisible] = useState(false);
  const [optionAnchor, setOptionAnchor] = useState<LayoutRectangle | null>(null);

  const categoryPickerOptions = useMemo<PickerOption[]>(
    () => [
      { label: '없음' },
      ...categoryOptions,
      {
        label: '추가',
        onPress: () => {
          setCategoryPickerVisible(false);
          setCategoryAddVisible(true);
        },
      },
    ],
    [categoryOptions]
  );

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 420,
      damping: 26,
      stiffness: 220,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate);
      setTitle('');
      setMemo('');
      setCategory('없음');
    }
  }, [initialDate, visible]);

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

  const openCategoryPicker = useCallback(() => {
    categoryRowRef.current?.measureInWindow((x, y, width, height) => {
      setOptionAnchor({ height, width, x, y });
      setCategoryPickerVisible(true);
    });
  }, []);

  const handleSave = useCallback(() => {
    const nextTitle = title.trim();

    if (!nextTitle) {
      return;
    }

    onSave({
      category,
      date: selectedDate,
      memo: memo.trim() || undefined,
      title: nextTitle,
    });
    closeWithAnimation();
  }, [category, closeWithAnimation, memo, onSave, selectedDate, title]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={closeWithAnimation}>
      <View style={styles.sheetLayer}>
        <Pressable
          accessibilityLabel="할 일 추가 닫기"
          style={styles.sheetBackdrop}
          onPress={closeWithAnimation}
        />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={styles.todoInputCard}>
              <TextInput
                placeholder="할 일을 작성해 주세요."
                placeholderTextColor="#A6AAAC"
                value={title}
                onChangeText={setTitle}
                style={styles.todoTitleInput}
              />
              <View style={styles.todoInputDivider} />
              <TextInput
                multiline
                placeholder="메모."
                placeholderTextColor="#A6AAAC"
                value={memo}
                onChangeText={setMemo}
                style={styles.todoMemoInput}
              />
            </View>

            <View style={styles.todoOptionGroup}>
              <TodoOptionRow
                icon="calendar-today"
                onPress={() => setDatePickerVisible(true)}
                title="Date"
                value={formatDatePill(selectedDate)}
              />
              <View style={styles.todoOptionDivider} />
              <TodoOptionRow
                rowRef={categoryRowRef}
                icon="tag-faces"
                onPress={openCategoryPicker}
                title="카테고리"
                value={category === '없음' ? undefined : category}
              />
            </View>

            <TouchableOpacity activeOpacity={0.84} onPress={handleSave} style={styles.todoSaveButton}>
              <Text style={styles.todoSaveText}>추가하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <DatePickerPopup
          onClose={() => setDatePickerVisible(false)}
          onSelect={(dateString) => {
            setSelectedDate(dateString);
            setDatePickerVisible(false);
          }}
          selectedDate={selectedDate}
          visible={isDatePickerVisible}
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
          anchor={optionAnchor}
          onClose={() => setCategoryPickerVisible(false)}
          onSelect={(value) => {
            setCategory(value);
            setCategoryPickerVisible(false);
          }}
          options={categoryPickerOptions}
          selectedValue={category}
          title="카테고리"
          visible={isCategoryPickerVisible}
        />
      </View>
    </Modal>
  );
}

function TodoOptionRow({
  icon,
  onPress,
  rowRef,
  title,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  rowRef?: RefObject<View | null>;
  title: string;
  value?: string;
}) {
  return (
    <TouchableOpacity ref={rowRef} activeOpacity={0.78} onPress={onPress} style={styles.todoOptionRow}>
      <View style={styles.todoOptionTitleGroup}>
        <MaterialIcons name={icon} size={18} color="#9BA0A3" />
        <Text style={styles.todoOptionTitle}>{title}</Text>
      </View>
      <View style={styles.todoOptionValueGroup}>
        {value ? <Text style={styles.todoOptionValue}>{value}</Text> : null}
        <MaterialIcons name="chevron-right" size={19} color="#D2D5D6" />
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
  const pickerMaxHeight = 142;
  const pickerRight = Math.max(16, screenWidth - ((anchor?.x ?? screenWidth) + (anchor?.width ?? 0)));
  const pickerTop = Math.max(24, (anchor?.y ?? 0) - pickerMaxHeight + 10);

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
  isSelected,
  label,
  onPress,
}: {
  color?: string;
  isSelected: boolean;
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
  sheetLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sheet: {
    width: '100%',
    maxWidth: 448,
    maxHeight: '76%',
    alignSelf: 'center',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    backgroundColor: '#F7F8F9',
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
    backgroundColor: '#F7F8F9',
  },
  sheetHandle: {
    width: 34,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D9DADB',
  },
  sheetContent: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    gap: 18,
  },
  todoInputCard: {
    minHeight: 106,
    borderRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  todoTitleInput: {
    height: 30,
    color: '#191C1D',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    padding: 0,
  },
  todoInputDivider: {
    height: 1,
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: 'rgba(225, 227, 228, 0.72)',
  },
  todoMemoInput: {
    minHeight: 38,
    color: '#474747',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    padding: 0,
    textAlignVertical: 'top',
  },
  todoOptionGroup: {
    borderRadius: 30,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  todoOptionRow: {
    height: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoOptionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todoOptionTitle: {
    color: '#191C1D',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  todoOptionValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todoOptionValue: {
    color: '#9BA0A3',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  todoOptionDivider: {
    height: 1,
    marginHorizontal: 18,
    backgroundColor: 'rgba(225, 227, 228, 0.72)',
  },
  todoSaveButton: {
    height: 56,
    marginTop: 12,
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
  todoSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
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
  optionPickerItemSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});

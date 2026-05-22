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
import { checklistCategories } from '@/features/checklist/mock';
import type { TodoPayload } from '@/features/checklist/types';

type AddTodoSheetProps = {
  initialDate: string;
  initialTodo?: {
    category: string;
    date: string;
    id: string;
    memo?: string;
    title: string;
  } | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (todoId: string) => void;
  onSave: (todo: TodoPayload) => void;
  onUpdate?: (todoId: string, todo: TodoPayload) => void;
};

type PickerOption = {
  color?: string;
  label: string;
  onPress?: () => void;
};

const defaultCategoryOptions = checklistCategories.map((category) => ({
  color: category.color,
  label: category.name,
}));

const screenWidth = Dimensions.get('window').width;

function formatDatePill(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function AddTodoSheet({
  initialDate,
  initialTodo,
  visible,
  onClose,
  onDelete,
  onSave,
  onUpdate,
}: AddTodoSheetProps) {
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
  const [validationMessage, setValidationMessage] = useState('');
  const isEditMode = Boolean(initialTodo);

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
      setSelectedDate(initialTodo?.date ?? initialDate);
      setTitle(initialTodo?.title ?? '');
      setMemo(initialTodo?.memo ?? '');
      setCategory(initialTodo?.category ?? '없음');
      setValidationMessage('');
    }
  }, [initialDate, initialTodo, visible]);

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
    const isCategorySelected = category !== '없음';
    const isDateSelected = Boolean(selectedDate);

    if (!nextTitle || !isDateSelected || !isCategorySelected) {
      const missingFields = [
        !nextTitle ? '할 일' : null,
        !isDateSelected ? '날짜' : null,
        !isCategorySelected ? '카테고리' : null,
      ].filter(Boolean);

      setValidationMessage(`${missingFields.join(', ')}을(를) 입력해야 추가할 수 있습니다.`);
      return;
    }

    const nextTodo = {
      category,
      date: selectedDate,
      memo: memo.trim() || undefined,
      title: nextTitle,
    };

    if (initialTodo) {
      onUpdate?.(initialTodo.id, nextTodo);
    } else {
      onSave(nextTodo);
    }
    closeWithAnimation();
  }, [category, closeWithAnimation, initialTodo, memo, onSave, onUpdate, selectedDate, title]);

  const handleDelete = useCallback(() => {
    if (!initialTodo) {
      return;
    }

    onDelete?.(initialTodo.id);
    closeWithAnimation();
  }, [closeWithAnimation, initialTodo, onDelete]);

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

            {isEditMode ? (
              <View style={styles.todoActionRow}>
                <TouchableOpacity activeOpacity={0.84} onPress={handleSave} style={styles.todoEditButton}>
                  <Text style={styles.todoSaveText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.84} onPress={handleDelete} style={styles.todoDeleteButton}>
                  <Text style={styles.todoSaveText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity activeOpacity={0.84} onPress={handleSave} style={styles.todoSaveButton}>
                <Text style={styles.todoSaveText}>추가하기</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>

        <DatePickerPopup
          onClose={() => setDatePickerVisible(false)}
          onSelect={(dateString) => {
            setSelectedDate(dateString);
            setValidationMessage('');
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
            setValidationMessage('');
          }}
        />

        <OptionPickerModal
          anchor={optionAnchor}
          onClose={() => setCategoryPickerVisible(false)}
          onRemoveOption={(value) => {
            setCategoryOptions((options) => options.filter((option) => option.label !== value));

            if (category === value) {
              setCategory('없음');
            }
          }}
          onSelect={(value) => {
            setCategory(value);
            setValidationMessage('');
            setCategoryPickerVisible(false);
          }}
          options={categoryPickerOptions}
          selectedValue={category}
          title="카테고리"
          visible={isCategoryPickerVisible}
        />

        <ValidationDialog message={validationMessage} onClose={() => setValidationMessage('')} />
      </View>
    </Modal>
  );
}

function ValidationDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={Boolean(message)} onRequestClose={onClose}>
      <View style={styles.validationLayer}>
        <Pressable accessibilityLabel="입력 안내 닫기" onPress={onClose} style={styles.validationBackdrop} />
        <View style={styles.validationCard}>
          <Text style={styles.validationTitle}>입력이 필요합니다</Text>
          <Text style={styles.validationMessage}>{message}</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.validationButton}>
            <Text style={styles.validationButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
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
    <TouchableOpacity
      ref={rowRef}
      activeOpacity={0.78}
      onPress={onPress}
      style={styles.todoOptionRow}>
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
  onRemoveOption,
  onSelect,
  options,
  selectedValue,
  title,
  visible,
}: {
  anchor: LayoutRectangle | null;
  onClose: () => void;
  onRemoveOption?: (value: string) => void;
  onSelect: (value: string) => void;
  options: PickerOption[];
  selectedValue: string;
  title: string;
  visible: boolean;
}) {
  const isPopup = title === '카테고리';
  const pickerWidth = 132;
  const pickerMaxHeight = 142;
  const pickerRight = Math.max(16, screenWidth - ((anchor?.x ?? screenWidth) + (anchor?.width ?? 0)));
  const pickerTop = Math.max(24, (anchor?.y ?? 0) - pickerMaxHeight + 10);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.optionPickerLayer, isPopup && styles.optionPickerPopupLayer]}>
        <Pressable
          accessibilityLabel={`${title} 선택 닫기`}
          onPress={onClose}
          style={[styles.optionPickerBackdrop, isPopup && styles.optionPickerPopupBackdrop]}
        />

        <View
          style={
            isPopup
              ? [styles.optionPickerCard, styles.optionPickerPopupCard]
              : [
                  styles.optionPickerCard,
                  {
                    right: pickerRight,
                    top: pickerTop,
                    width: pickerWidth,
                  },
                ]
          }>
          {isPopup ? <Text style={styles.optionPickerTitle}>{title}</Text> : null}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={[styles.optionPickerList, isPopup && styles.optionPickerPopupList]}
            contentContainerStyle={styles.optionPickerContent}>
            {options.map((option, index) => (
              <PickerOptionRow
                color={option.color}
                isSelected={selectedValue === option.label}
                isLast={index === options.length - 1}
                key={option.label}
                label={option.label}
                onRemove={option.color ? onRemoveOption : undefined}
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
  isLast,
  label,
  onRemove,
  onPress,
}: {
  color?: string;
  isSelected: boolean;
  isLast: boolean;
  label: string;
  onRemove?: (value: string) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.optionPickerItem, !isLast && styles.optionPickerItemBorder]}>
      {color ? (
        <TouchableOpacity
          accessibilityLabel={`${label} 카테고리 삭제`}
          activeOpacity={0.68}
          onPress={(event) => {
            event.stopPropagation();
            onRemove?.(label);
          }}
          style={styles.categoryRemoveButton}>
          <MaterialIcons name="close" size={12} color="#B6B6B6" style={styles.categoryRemoveIcon} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.optionPickerLabelGroup}>
        <Text style={[styles.optionPickerItemText, isSelected && styles.optionPickerItemSelected]}>{label}</Text>
        {color ? <View style={[styles.categoryDot, { backgroundColor: color }]} /> : null}
      </View>
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
    maxHeight: '92%',
    alignSelf: 'center',
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
  sheetHandle: {
    width: 47,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  sheetContent: {
    paddingHorizontal: 32,
    paddingBottom: 34,
    gap: 16,
  },
  todoInputCard: {
    minHeight: 106,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'transparent',
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
    borderRadius: 24,
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
  todoActionRow: {
    height: 56,
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  todoEditButton: {
    flex: 1,
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
  todoDeleteButton: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A94A4A',
    shadowColor: '#A94A4A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
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
  optionPickerPopupLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  optionPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  optionPickerPopupBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
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
  optionPickerPopupCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 320,
    borderRadius: 34,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  optionPickerTitle: {
    color: '#191C1D',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  optionPickerList: {
    maxHeight: 142,
  },
  optionPickerPopupList: {
    maxHeight: 360,
  },
  optionPickerContent: {
    paddingTop: 20,
    paddingBottom: 2,
    paddingHorizontal: 0,
  },
  optionPickerItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionPickerItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 227, 228, 0.72)',
  },
  optionPickerItemText: {
    color: '#474747',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'right',
  },
  optionPickerItemSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  optionPickerLabelGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  categoryRemoveButton: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRemoveIcon: {
    width: 12,
    height: 12,
  },
  categoryRemoveBadge: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  validationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  validationCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 34,
    elevation: 20,
  },
  validationTitle: {
    color: '#191C1D',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
  validationMessage: {
    marginTop: 8,
    color: '#6F6F6F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  validationButton: {
    height: 44,
    minWidth: 108,
    marginTop: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  validationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});

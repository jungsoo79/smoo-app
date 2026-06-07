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

import { CategoryAddModal } from '@/components/shared/CategoryAddModal';
import { DatePickerPopup } from '@/components/shared/DatePickerPopup';

import {
  createCategory,
  createRepeatRule,
  createTransaction,
  deleteTransaction,
  getCategories,
  getPaymentMethods,
  updateTransaction,
} from '../api';
import type { Category, PaymentMethod, RepeatFrequency, TransactionType, TransactionWithMeta } from '../types';
import { CategorySelector } from './CategorySelector';
import { formatDatePill } from './formatters';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { RepeatSelector } from './RepeatSelector';

type OptionMenu = 'category' | 'paymentMethod' | 'repeat';
type PickerOption = {
  color?: string;
  label: string;
  onPress?: () => void;
  value: string;
};
type RepeatOption = {
  frequency: RepeatFrequency | null;
  interval: number;
  label: string;
  value: string;
};

const repeatOptions: RepeatOption[] = [
  { frequency: null, interval: 0, label: '없음', value: 'none' },
  { frequency: 'daily', interval: 1, label: '매일', value: 'daily' },
  { frequency: 'weekly', interval: 1, label: '매주', value: 'weekly' },
  { frequency: 'monthly', interval: 1, label: '매월', value: 'monthly' },
  { frequency: 'yearly', interval: 1, label: '매년', value: 'yearly' },
];

function toLocalDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function TransactionAddSheet({
  initialTransaction,
  initialDate,
  onClose,
  onSaved,
  visible,
}: {
  initialTransaction?: TransactionWithMeta | null;
  initialDate: string;
  onClose: () => void;
  onSaved: (date: string) => void;
  visible: boolean;
}) {
  const translateY = useRef(new Animated.Value(720)).current;
  const categoryRowRef = useRef<View>(null);
  const paymentMethodRowRef = useRef<View>(null);
  const repeatRowRef = useRef<View>(null);
  const today = useMemo(() => toLocalDateString(new Date()), []);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(initialDate);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedRepeatValue, setSelectedRepeatValue] = useState('none');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isCategoryAddVisible, setCategoryAddVisible] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [openOptionMenu, setOpenOptionMenu] = useState<OptionMenu | null>(null);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 720,
      damping: 28,
      stiffness: 220,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setType(initialTransaction?.type ?? 'expense');
    setAmount(initialTransaction ? String(initialTransaction.amount) : '');
    setTitle(initialTransaction?.title ?? '');
    setMemo(initialTransaction?.memo ?? '');
    setDate(initialTransaction?.date ?? initialDate);
    setSelectedCategoryId(null);
    setSelectedPaymentMethodId(null);
    setSelectedRepeatValue(initialTransaction?.repeatRuleId ? 'monthly' : 'none');
    setSaving(false);
    setFormError('');
    setOpenOptionMenu(null);
    setDatePickerVisible(false);

    void Promise.all([getCategories(), getPaymentMethods()]).then(([nextCategories, nextPaymentMethods]) => {
      setCategories(nextCategories);
      setPaymentMethods(nextPaymentMethods);
      setSelectedCategoryId(initialTransaction?.categoryId ?? nextCategories[0]?.id ?? null);
      setSelectedPaymentMethodId(initialTransaction?.paymentMethodId ?? nextPaymentMethods[0]?.id ?? null);
    });
  }, [initialDate, initialTransaction, visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 720,
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

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPaymentMethodId);
  const selectedRepeat = repeatOptions.find((option) => option.value === selectedRepeatValue) ?? repeatOptions[0];
  const isEditMode = Boolean(initialTransaction);

  const optionPickerConfig = useMemo(() => {
    if (openOptionMenu === 'category') {
      return {
        options: [
          { label: '없음', value: 'none' },
          ...categories.map((category) => ({
            color: category.color,
            label: category.name,
            value: String(category.id),
          })),
          {
            label: '추가',
            onPress: () => {
              setOpenOptionMenu(null);
              setCategoryAddVisible(true);
            },
            value: 'add',
          },
        ],
        selectedValue: selectedCategoryId ? String(selectedCategoryId) : 'none',
        title: '카테고리',
      };
    }

    if (openOptionMenu === 'paymentMethod') {
      return {
        options: [
          { label: '없음', value: 'none' },
          ...paymentMethods.map((method) => ({ label: method.name, value: String(method.id) })),
        ],
        selectedValue: selectedPaymentMethodId ? String(selectedPaymentMethodId) : 'none',
        title: '결제수단',
      };
    }

    if (openOptionMenu === 'repeat') {
      return {
        options: repeatOptions,
        selectedValue: selectedRepeatValue,
        title: '반복 지출',
      };
    }

    return null;
  }, [categories, openOptionMenu, paymentMethods, selectedCategoryId, selectedPaymentMethodId, selectedRepeatValue]);

  const openOptionPicker = useCallback((menu: OptionMenu) => {
    setOpenOptionMenu(menu);
  }, []);

  const submitTransaction = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const parsedAmount = Number(amount.replace(/,/g, ''));
    const nextTitle = title.trim() || selectedCategory?.name || (type === 'expense' ? '지출' : '수입');

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('금액을 입력해 주세요.');
      return;
    }

    if (!selectedCategoryId) {
      setFormError('카테고리를 선택해 주세요.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const repeatRule = selectedRepeat.frequency
      ? await createRepeatRule({
          frequency: selectedRepeat.frequency,
          interval: selectedRepeat.interval,
          startDate: date,
          endDate: null,
        })
      : null;

      const payload = {
        amount: parsedAmount,
        categoryId: selectedCategoryId,
        date,
        memo: memo.trim() || undefined,
        paymentMethodId: selectedPaymentMethodId,
        repeatRuleId: repeatRule?.id ?? initialTransaction?.repeatRuleId ?? null,
        title: nextTitle,
        type,
      };

      if (initialTransaction) {
        await updateTransaction(initialTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }

      onSaved(date);
      closeWithAnimation();
    } catch {
      setFormError('내용을 저장하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }, [
    amount,
    closeWithAnimation,
    date,
    initialTransaction,
    isSaving,
    memo,
    onSaved,
    selectedCategory?.name,
    selectedCategoryId,
    selectedPaymentMethodId,
    selectedRepeat.frequency,
    selectedRepeat.interval,
    title,
    type,
  ]);

  const handleDeleteTransaction = useCallback(async () => {
    if (!initialTransaction || isSaving) {
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      await deleteTransaction(initialTransaction.id);
      onSaved(date);
      closeWithAnimation();
    } catch {
      setFormError('거래를 삭제하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }, [closeWithAnimation, date, initialTransaction, isSaving, onSaved]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={closeWithAnimation}>
      <View style={styles.sheetLayer}>
        <Pressable accessibilityLabel="가계부 항목 추가 닫기" onPress={closeWithAnimation} style={styles.sheetBackdrop} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <View style={styles.typeSegment}>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setType('expense')}
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}>
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>지출</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setType('income')}
                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}>
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>수입</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => setAmount(value.replace(/[^0-9]/g, ''))}
              placeholder="금액"
              placeholderTextColor="#6F6F6F"
              style={styles.amountInput}
              value={amount}
            />

            <TouchableOpacity activeOpacity={0.78} onPress={() => setDatePickerVisible(true)} style={styles.dateRow}>
              <Text style={styles.rowTitle}>날짜</Text>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{formatDatePill(date)}</Text>
              </View>
            </TouchableOpacity>

            <CategorySelector
              rowRef={categoryRowRef}
              onPress={() => openOptionPicker('category')}
              value={selectedCategory?.name ?? '없음'}
            />

            <TextInput
              multiline
              onChangeText={(value) => {
                const [firstLine, ...rest] = value.split('\n');
                setTitle(firstLine);
                setMemo(rest.join('\n'));
              }}
              placeholder="세부 내용"
              placeholderTextColor="#6F6F6F"
              style={styles.detailInput}
              textAlignVertical="top"
              value={[title, memo].filter(Boolean).join('\n')}
            />

            <PaymentMethodSelector
              rowRef={paymentMethodRowRef}
              onPress={() => openOptionPicker('paymentMethod')}
              value={selectedPaymentMethod?.name ?? '없음'}
            />

            <RepeatSelector
              rowRef={repeatRowRef}
              onPress={() => openOptionPicker('repeat')}
              value={selectedRepeat.label}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            {isEditMode ? (
              <View style={styles.editActionRow}>
                <TouchableOpacity
                  activeOpacity={0.84}
                  disabled={isSaving}
                  onPress={submitTransaction}
                  style={[styles.editSaveButton, isSaving && styles.submitButtonDisabled]}>
                  <Text style={styles.submitText}>수정하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.84}
                  disabled={isSaving}
                  onPress={handleDeleteTransaction}
                  style={[styles.deleteButton, isSaving && styles.submitButtonDisabled]}>
                  <Text style={styles.submitText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.84}
                disabled={isSaving}
                onPress={submitTransaction}
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}>
                <Text style={styles.submitText}>추가하기</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>

        <DatePickerPopup
          onClose={() => setDatePickerVisible(false)}
          onSelect={(nextDate) => {
            setDate(nextDate);
            setDatePickerVisible(false);
          }}
          selectedDate={date}
          today={today}
          visible={isDatePickerVisible}
        />

        <CategoryAddModal
          visible={isCategoryAddVisible}
          onClose={() => setCategoryAddVisible(false)}
          onAdd={(nextCategory) => {
            void createCategory({
              color: nextCategory.color,
              name: nextCategory.label,
            }).then((createdCategory) => {
              setCategories((items) => [...items, createdCategory]);
              setSelectedCategoryId(createdCategory.id);
            });
          }}
        />

        <OptionPickerModal
          onClose={() => setOpenOptionMenu(null)}
          onSelect={(value) => {
            if (openOptionMenu === 'category') {
              setSelectedCategoryId(value === 'none' ? null : Number(value));
            } else if (openOptionMenu === 'paymentMethod') {
              setSelectedPaymentMethodId(value === 'none' ? null : Number(value));
            } else if (openOptionMenu === 'repeat') {
              setSelectedRepeatValue(value);
            }

            setOpenOptionMenu(null);
          }}
          options={optionPickerConfig?.options ?? []}
          selectedValue={optionPickerConfig?.selectedValue ?? ''}
          title={optionPickerConfig?.title ?? ''}
          visible={optionPickerConfig !== null}
        />
      </View>
    </Modal>
  );
}

function OptionPickerModal({
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
  visible,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  options: PickerOption[];
  selectedValue: string;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.optionPickerLayer}>
        <Pressable accessibilityLabel={`${title} 선택 닫기`} onPress={onClose} style={styles.optionPickerBackdrop} />

        <View style={styles.optionPickerCard}>
          <Text style={styles.optionPickerTitle}>{title}</Text>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.optionPickerList}
            contentContainerStyle={styles.optionPickerContent}>
            {options.map((option) => (
              <TouchableOpacity
                activeOpacity={0.72}
                key={option.value}
                onPress={() => {
                  if (option.onPress) {
                    option.onPress();
                    return;
                  }

                  onSelect(option.value);
                }}
                style={styles.optionPickerItem}>
                {option.color ? <View style={[styles.optionDot, { backgroundColor: option.color }]} /> : null}
                <Text style={[styles.optionPickerItemText, selectedValue === option.value && styles.optionSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  sheetContent: {
    paddingHorizontal: 32,
    paddingBottom: 34,
    gap: 16,
  },
  typeSegment: {
    height: 56,
    flexDirection: 'row',
    gap: 16,
  },
  typeButton: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F5',
  },
  typeButtonActive: {
    backgroundColor: '#000000',
  },
  typeText: {
    color: '#777777',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  amountInput: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F3F4F5',
  },
  dateRow: {
    height: 56,
    marginTop: 28,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F5',
  },
  rowTitle: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  datePill: {
    minWidth: 118,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  datePillText: {
    color: '#474747',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  detailInput: {
    minHeight: 96,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 22,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F3F4F5',
  },
  submitButton: {
    height: 64,
    marginTop: 34,
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
  editActionRow: {
    minHeight: 64,
    marginTop: 34,
    flexDirection: 'row',
    gap: 12,
  },
  editSaveButton: {
    flex: 1,
    height: 64,
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
  deleteButton: {
    width: 104,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BA1A1A',
    shadowColor: '#BA1A1A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    backgroundColor: '#777777',
    shadowOpacity: 0,
    elevation: 0,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionPickerLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 999,
    elevation: 999,
  },
  optionPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  optionPickerCard: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '72%',
    borderRadius: 34,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 24,
    zIndex: 1000,
  },
  optionPickerTitle: {
    color: '#191C1D',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  optionPickerList: {
    maxHeight: 360,
  },
  optionPickerContent: {
    paddingTop: 20,
    paddingBottom: 2,
  },
  optionPickerItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  optionPickerItemText: {
    color: '#474747',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'right',
  },
  optionSelected: {
    color: '#000000',
    fontWeight: '800',
  },
});

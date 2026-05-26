import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { HomeWidget } from '../types/homeWidget';
import { AccountBookWidget } from './AccountBookWidget';
import { CalendarWidget } from './CalendarWidget';
import { MemoWidget } from './MemoWidget';
import { TodoWidget } from './TodoWidget';

type WidgetCardProps = {
  widget: HomeWidget;
  isActive: boolean;
  isEditMode: boolean;
  onDelete: () => void;
  onLongPress: () => void;
};

const widgetRoutes = {
  calendar: '/(tabs)/calendar',
  todo: '/(tabs)/checklist',
  memo: '/(tabs)/memo',
  accountBook: '/(tabs)/ledger',
} as const;

export function WidgetCard({
  widget,
  isActive,
  isEditMode,
  onDelete,
  onLongPress,
}: WidgetCardProps) {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isEditMode) {
      wobble.stopAnimation();
      wobble.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 90,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [isEditMode, wobble]);

  const rotate = wobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-0.8deg', '0.8deg'],
  });

  return (
    <Animated.View
      style={[
        styles.animatedWrap,
        isActive && styles.activeWrap,
        isEditMode && {
          transform: [{ rotate }],
        },
      ]}>
      <Pressable
        onLongPress={onLongPress}
        onPress={() => {
          if (!isEditMode) {
            router.push(widgetRoutes[widget.type]);
          }
        }}
        style={styles.card}>
        {isEditMode ? (
          <TouchableOpacity
            accessibilityLabel={`${widget.title} 위젯 삭제`}
            activeOpacity={0.8}
            onPress={onDelete}
            style={styles.deleteButton}>
            <Text style={styles.deleteText}>-</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.title}>{widget.title}</Text>

        {widget.type === 'calendar' ? <CalendarWidget /> : null}
        {widget.type === 'todo' ? <TodoWidget /> : null}
        {widget.type === 'memo' ? <MemoWidget /> : null}
        {widget.type === 'accountBook' ? <AccountBookWidget /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrap: {
    marginBottom: 24,
  },
  activeWrap: {
    opacity: 0.9,
    transform: [{ scale: 1.02 }],
  },
  card: {
    minHeight: 184,
    borderRadius: 40,
    padding: 28,
    gap: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.05,
    shadowRadius: 48,
    elevation: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    left: -10,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.textPrimary,
    shadowColor: AppColors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  deleteText: {
    color: AppColors.textInverse,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  title: {
    ...AppTypography.cardTitle,
  },
});

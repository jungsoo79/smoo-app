import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type Href, router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, type GestureResponderEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, AppTypography } from '@/constants/appStyles';

type AppTabKey = 'memo' | 'checklist' | 'home' | 'calendar' | 'ledger';

const NAV_ITEMS: {
  key: AppTabKey;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  href: Href;
  label: string;
}[] = [
  { key: 'memo', icon: 'description', href: '/(tabs)/memo', label: '메모' },
  { key: 'checklist', icon: 'check-circle-outline', href: '/(tabs)/checklist', label: '할 일 목록' },
  { key: 'home', icon: 'home', href: '/(tabs)', label: '홈' },
  { key: 'calendar', icon: 'calendar-today', href: '/(tabs)/calendar', label: '캘린더' },
  { key: 'ledger', icon: 'credit-card', href: '/(tabs)/ledger', label: '가계부' },
];

type AppTopBarProps = {
  title?: string;
  backgroundColor?: string;
  height?: number;
};

export function AppTopBar({
  title,
  backgroundColor = 'rgba(255, 255, 255, 0.45)',
  height = 52,
}: AppTopBarProps) {
  return (
    <SafeAreaView style={[styles.topBarSafe, { backgroundColor }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor, height }]}>
        <TouchableOpacity accessibilityLabel="메뉴" style={styles.iconButton}>
          <MaterialIcons name="menu" size={20} color={AppColors.textBody} />
        </TouchableOpacity>
        {title ? <Text style={styles.topTitle}>{title}</Text> : null}
        <TouchableOpacity accessibilityLabel="알림" style={styles.iconButton}>
          <MaterialIcons name="notifications-none" size={19} color={AppColors.textBody} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function AppBottomNav({ active }: { active: AppTabKey }) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityLabel={item.label}
            activeOpacity={0.75}
            onPress={() => router.push(item.href)}
            style={[styles.navButton, isActive && styles.navButtonActive]}>
            <MaterialIcons
              name={item.icon}
              size={isActive ? 24 : 19}
              color={isActive ? AppColors.textInverse : '#9CA1A3'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AppFloatingActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}) {
  return (
    <TouchableOpacity accessibilityLabel={label} activeOpacity={0.8} onPress={onPress} style={styles.fab}>
      <MaterialIcons name="add" size={30} color={AppColors.textInverse} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topBarSafe: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...AppTypography.cardTitle,
    color: AppColors.textPrimary,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    left: '50%',
    bottom: 26,
    width: 351,
    maxWidth: '90%',
    height: 72,
    marginLeft: -175.5,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 48,
    elevation: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonActive: {
    width: 48,
    height: 48,
    backgroundColor: AppColors.textBody,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 126,
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.textPrimary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 14,
  },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppTypography } from '@/constants/appStyles';

const todoItems = [
  { title: '디자인 토큰 검토', checked: true },
  { title: 'SVG 아이콘 내보내기', checked: false },
  { title: '랜딩 에셋 업데이트', checked: false },
];

export function TodoWidget() {
  return (
    <View style={styles.content}>
      {todoItems.map((item) => (
        <View key={item.title} style={styles.row}>
          <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
            {item.checked ? <MaterialIcons name="check" size={14} color={AppColors.textInverse} /> : null}
          </View>
          <Text style={[styles.title, !item.checked && styles.titleMuted]}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E3E4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: AppColors.textPrimary,
    backgroundColor: AppColors.textPrimary,
  },
  title: {
    ...AppTypography.body,
    fontWeight: '600',
  },
  titleMuted: {
    color: AppColors.textMuted,
  },
});

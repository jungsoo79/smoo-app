import type { ReactElement } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import { AppColors, AppTypography } from '@/constants/appStyles';

import type { HomeWidget } from '../types/homeWidget';
import { WidgetCard } from './WidgetCard';

type HomeWidgetListProps = {
  isEditMode: boolean;
  ListHeaderComponent: ReactElement;
  widgets: HomeWidget[];
  onDeleteWidget: (widgetId: number) => void;
  onEnterEditMode: () => void;
  onDragBegin: (widget: HomeWidget) => void;
  onOpenAddSheet: () => void;
  onReorderWidgets: (widgets: HomeWidget[]) => void;
};

export function HomeWidgetList({
  isEditMode,
  ListHeaderComponent,
  widgets,
  onDeleteWidget,
  onEnterEditMode,
  onDragBegin,
  onOpenAddSheet,
  onReorderWidgets,
}: HomeWidgetListProps) {
  return (
    <DraggableFlatList
      activationDistance={8}
      bounces={false}
      contentContainerStyle={styles.content}
      data={widgets}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isEditMode ? null : (
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.78} onPress={onOpenAddSheet} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color={AppColors.textMuted} />
              <Text style={styles.addButtonText}>위젯 추가</Text>
            </TouchableOpacity>
          </View>
        )
      }
      onDragBegin={(index) => {
        const widget = widgets[index];

        if (widget) {
          onDragBegin(widget);
        }
      }}
      onDragEnd={({ data }) => onReorderWidgets(data)}
      renderItem={({ drag, isActive, item }: RenderItemParams<HomeWidget>) => (
        <WidgetCard
          isActive={isActive}
          isEditMode={isEditMode}
          widget={item}
          onDelete={() => onDeleteWidget(item.id)}
          onLongPress={() => {
            if (!isEditMode) {
              onEnterEditMode();
              return;
            }

            drag();
          }}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 160,
  },
  footer: {
    paddingTop: 0,
  },
  addButton: {
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  addButtonText: {
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: '700',
  },
});

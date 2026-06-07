import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppColors, AppTypography } from "@/constants/appStyles";

import type { AvailableWidget, HomeWidgetType } from "../types/homeWidget";
import { AccountBookWidget } from "./AccountBookWidget";
import { CalendarWidget } from "./CalendarWidget";
import { MemoWidget } from "./MemoWidget";
import { TodoWidget } from "./TodoWidget";

type WidgetAddBottomSheetProps = {
  addingWidgetType?: HomeWidgetType | null;
  availableWidgets: AvailableWidget[];
  visible: boolean;
  onAdd: (type: HomeWidgetType) => void;
  onClose: () => void;
};

export function WidgetAddBottomSheet({
  addingWidgetType,
  availableWidgets,
  visible,
  onAdd,
  onClose,
}: WidgetAddBottomSheetProps) {
  const translateY = useRef(new Animated.Value(640)).current;
  const addableWidgets = useMemo(
    () => availableWidgets.filter((widget) => !widget.isAdded),
    [availableWidgets],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.spring(translateY, {
      toValue: 0,
      damping: 28,
      stiffness: 220,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 640,
      duration: 190,
      useNativeDriver: true,
    }).start(onClose);
  }, [onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dy) > 2,
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
    [closeWithAnimation, translateY],
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.layer}>
        <Pressable
          accessibilityLabel="위젯 추가 닫기"
          onPress={closeWithAnimation}
          style={styles.backdrop}
        />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.handleHitArea}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {addableWidgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  추가할 수 있는 위젯이 없어요.
                </Text>
              </View>
            ) : null}

            {addableWidgets.map((widget) => (
              <TouchableOpacity
                key={widget.type}
                activeOpacity={0.82}
                disabled={addingWidgetType !== null && addingWidgetType !== undefined}
                onPress={() => onAdd(widget.type)}
                style={[
                  styles.optionCard,
                  addingWidgetType && widget.type !== addingWidgetType ? styles.optionCardDisabled : null,
                ]}
              >
                <View style={styles.optionHeader}>
                  <View>
                    <Text style={styles.optionName}>{widget.name}</Text>
                    {/*<Text style={styles.optionDescription}>{widget.description}</Text>*/}
                  </View>
                </View>

                {widget.type === "calendar" ? <CalendarWidget /> : null}
                {widget.type === "todo" ? <TodoWidget /> : null}
                {widget.type === "memo" ? <MemoWidget /> : null}
                {widget.type === "accountBook" ? <AccountBookWidget /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  sheet: {
    width: "100%",
    maxWidth: 448,
    maxHeight: "92%",
    alignSelf: "center",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.14,
    shadowRadius: 48,
    elevation: 18,
  },
  handleHitArea: {
    height: 68,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 17,
    backgroundColor: AppColors.surface,
  },
  handle: {
    width: 47,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D9D9D9",
  },
  list: {
    paddingHorizontal: 32,
    gap: 32,
    paddingBottom: 48,
  },
  optionCard: {
    borderRadius: 36,
    padding: 26,
    gap: 22,
    backgroundColor: AppColors.surface,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.04,
    shadowRadius: 48,
    elevation: 6,
  },
  optionCardDisabled: {
    opacity: 0.45,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  optionName: {
    ...AppTypography.cardTitle,
  },
  optionDescription: {
    marginTop: 4,
    ...AppTypography.caption,
    color: AppColors.textPlaceholder,
    fontWeight: "500",
  },
  emptyState: {
    minHeight: 180,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.surface,
  },
  emptyText: {
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: "700",
  },
});

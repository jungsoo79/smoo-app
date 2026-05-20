import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppBottomNav, AppTopBar } from "@/components/app-chrome";
import { AppColors, AppTypography } from "@/constants/appStyles";

import { EmptyHomeState } from "./components/EmptyHomeState";
import { HomeWidgetList } from "./components/HomeWidgetList";
import { WidgetAddBottomSheet } from "./components/WidgetAddBottomSheet";
import {
  addHomeWidget,
  getAvailableWidgets,
  getHomeWidgets,
  removeHomeWidget,
  updateHomeWidgetOrder,
} from "./services/homeWidgetApi";
import type {
  AvailableWidget,
  HomeWidget,
  HomeWidgetType,
} from "./types/homeWidget";

function formatTodayTitle() {
  const today = new Date();
  const weekdays = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  return `오늘은 ${today.getMonth() + 1}월 ${today.getDate()}일 ${weekdays[today.getDay()]}입니다.`;
}

export default function HomeScreen() {
  const [widgets, setWidgets] = useState<HomeWidget[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<AvailableWidget[]>(
    [],
  );
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const todayTitle = useMemo(formatTodayTitle, []);

  const refreshWidgets = useCallback(async () => {
    const [nextWidgets, nextAvailableWidgets] = await Promise.all([
      getHomeWidgets(),
      getAvailableWidgets(),
    ]);

    setWidgets(nextWidgets);
    setAvailableWidgets(nextAvailableWidgets);
  }, []);

  useEffect(() => {
    refreshWidgets();
  }, [refreshWidgets]);

  const handleAddWidget = async (type: HomeWidgetType) => {
    await addHomeWidget(type);
    setAddSheetVisible(false);
    setEditMode(false);
    await refreshWidgets();
  };

  const handleDeleteWidget = async (widgetId: number) => {
    await removeHomeWidget(widgetId);
    if (widgets.length <= 1) {
      setEditMode(false);
    }
    await refreshWidgets();
  };

  const renderHeader = () => (
    <View style={styles.hero}>
      <Text style={styles.logo}>Zerly</Text>
      <Text style={styles.subtitle}>{todayTitle}</Text>
    </View>
  );

  const handleReorderWidgets = async (nextWidgets: HomeWidget[]) => {
    const reorderedWidgets = nextWidgets.map((widget, index) => ({
      ...widget,
      order: index + 1,
    }));

    setWidgets(reorderedWidgets);
    await updateHomeWidgetOrder(reorderedWidgets);
    await refreshWidgets();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlur} />

      <View style={styles.safeArea}>
        <AppTopBar />

        <Pressable
          disabled={!isEditMode}
          onPress={() => setEditMode(false)}
          style={styles.body}
        >
          {widgets.length === 0 ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {renderHeader()}
              <EmptyHomeState onAddWidget={() => setAddSheetVisible(true)} />
              {/*<View style={styles.curatorSection}>
                <View style={styles.curatorBadge}>
                  <Text style={styles.curatorBadgeText}>큐레이터 팁</Text>
                </View>
                <Text style={styles.curatorText}>
                  "디지털 공간은 신성합니다. 당신의 하루에 명료함을 주는 것만 추가하세요."
                </Text>
              </View>*/}
            </ScrollView>
          ) : (
            <HomeWidgetList
              ListHeaderComponent={renderHeader()}
              isEditMode={isEditMode}
              widgets={widgets}
              onDeleteWidget={handleDeleteWidget}
              onDragBegin={(widget) => {
                setEditMode(true);
              }}
              onEnterEditMode={() => setEditMode(true)}
              onOpenAddSheet={() => setAddSheetVisible(true)}
              onReorderWidgets={handleReorderWidgets}
            />
          )}
        </Pressable>
      </View>

      <WidgetAddBottomSheet
        availableWidgets={availableWidgets}
        visible={isAddSheetVisible}
        onAdd={handleAddWidget}
        onClose={() => setAddSheetVisible(false)}
      />

      <AppBottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  backgroundBlur: {
    position: "absolute",
    right: -44,
    bottom: -44,
    width: 156,
    height: 624,
    borderRadius: 999,
    backgroundColor: "rgba(217, 218, 219, 0.3)",
    shadowColor: "#D9DADB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 60,
  },
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 128,
  },
  hero: {
    gap: 10,
    marginBottom: 64,
  },
  logo: {
    ...AppTypography.brandTitle,
  },
  subtitle: {
    ...AppTypography.sectionTitle,
    color: AppColors.textMuted,
    fontWeight: "600",
  },
  curatorSection: {
    alignItems: "center",
    marginTop: 104,
    gap: 24,
  },
  curatorBadge: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#E9EAEB",
  },
  curatorBadgeText: {
    ...AppTypography.caption,
    fontWeight: "700",
  },
  curatorText: {
    maxWidth: 320,
    textAlign: "center",
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: "600",
  },
});

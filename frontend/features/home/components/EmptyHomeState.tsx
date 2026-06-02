import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AppColors, AppTypography } from "@/constants/appStyles";

type EmptyHomeStateProps = {
  onAddWidget: () => void;
};

export function EmptyHomeState({ onAddWidget }: EmptyHomeStateProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onAddWidget}
      style={styles.card}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name="add" size={24} color={AppColors.textMuted} />
      </View>
      <Text style={styles.title}>위젯 추가</Text>
      <Text style={styles.description}>대시보드를 개인화하세요</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 200,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.04,
    shadowRadius: 48,
    elevation: 6,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F1",
  },
  title: {
    ...AppTypography.sectionTitle,
    fontWeight: "700",
  },
  description: {
    ...AppTypography.body,
    color: AppColors.textMuted,
    fontWeight: "500",
  },
});

import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";

import type { MonthlyAnalysis as MonthlyAnalysisType } from "../types";
import { formatWon } from "./formatters";

export function MonthlyAnalysis({
  analysis,
}: {
  analysis?: MonthlyAnalysisType;
}) {
  const topCategories = analysis?.categoryAnalysis.slice(0, 4) ?? [];
  const chartStyle = getPieChartStyle(topCategories);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {analysis ? `${analysis.year}년 ${analysis.month}월 분석` : "월 분석"}
        </Text>
        <View style={styles.totalGroup}>
          <Text style={styles.income}>
            +{formatWon(analysis?.totalIncome ?? 0)}
          </Text>
          <Text style={styles.expense}>
            -{formatWon(analysis?.totalExpense ?? 0)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.pieChart, chartStyle]}>
          {/*<View style={styles.pieCenter}>
            <Text style={styles.pieText}>{formatWon(analysis?.totalExpense ?? 0)}</Text>
          </View>*/}
        </View>

        <View style={styles.legend}>
          {topCategories.length === 0 ? (
            <Text style={styles.emptyText}>지출 데이터가 없습니다.</Text>
          ) : null}
          {topCategories.map((category) => (
            <View key={category.categoryId} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: category.color }]}
              />
              <View style={styles.legendTextGroup}>
                <Text style={styles.legendText}>{category.categoryName}</Text>
                <Text style={styles.legendSubText}>{category.percent}%</Text>
              </View>
              <Text style={styles.legendAmount}>
                {formatWon(category.amount)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function getPieChartStyle(
  categories: MonthlyAnalysisType["categoryAnalysis"],
): ViewStyle {
  if (categories.length === 0) {
    return { backgroundColor: "#D4D4D4" };
  }

  if (Platform.OS !== "web") {
    return { backgroundColor: categories[0].color };
  }

  let cursor = 0;
  const stops = categories.map((category, index) => {
    const start = cursor;
    const end =
      index === categories.length - 1
        ? 100
        : Math.min(100, cursor + category.percent);

    cursor = end;

    return `${category.color} ${start}% ${end}%`;
  });

  return {
    backgroundImage: `conic-gradient(${stops.join(", ")})`,
  } as ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    minHeight: 291,
    padding: 24,
    borderRadius: 48,
    gap: 24,
    backgroundColor: "#F3F4F5",
  },
  header: {
    gap: 8,
  },
  title: {
    color: "#191C1D",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  totalGroup: {
    flexDirection: "row",
    gap: 12,
  },
  income: {
    color: "#15803D",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  expense: {
    color: "#BA1A1A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 26,
  },
  pieChart: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4D4D4",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  pieCenter: {
    maxWidth: 96,
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.86)",
  },
  pieText: {
    color: "#191C1D",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendTextGroup: {
    flex: 1,
  },
  legendText: {
    color: "#191C1D",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  legendSubText: {
    color: "#737373",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "600",
  },
  legendAmount: {
    color: "#191C1D",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  emptyText: {
    color: "#737373",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
});

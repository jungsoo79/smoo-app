import { StyleSheet } from "react-native";

export const AppColors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F4F5",
  textPrimary: "#000000",
  textBody: "#191C1D",
  textSecondary: "#474747",
  textMuted: "#777777",
  textPlaceholder: "#A3A3A3",
  textInverse: "#FFFFFF",
  border: "#D9DADB",
  danger: "#BA1A1A",
  success: "#15803D",
};

export const AppTypography = StyleSheet.create({
  brandTitle: {
    color: AppColors.textPrimary,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "800",
  },
  authBrandTitle: {
    color: AppColors.textPrimary,
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "800",
  },
  pageTitle: {
    color: AppColors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  cardTitle: {
    color: AppColors.textMuted,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
  },
  body: {
    color: AppColors.textBody,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  bodyStrong: {
    color: AppColors.textBody,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  bodySecondary: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  caption: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  micro: {
    color: AppColors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  buttonLabel: {
    color: AppColors.textInverse,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
  },
});

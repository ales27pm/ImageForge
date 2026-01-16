import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#F5F5F7",
    textSecondary: "#9CA3AF",
    buttonText: "#0A0A0F",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#CD7F32",
    link: "#CD7F32",
    primary: "#CD7F32",
    accent: "#00D4FF",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    backgroundRoot: "#0A0A0F",
    backgroundDefault: "#1C1C24",
    backgroundSecondary: "#2A2A34",
    backgroundTertiary: "#3A3A44",
  },
  dark: {
    text: "#F5F5F7",
    textSecondary: "#9CA3AF",
    buttonText: "#0A0A0F",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#CD7F32",
    link: "#CD7F32",
    primary: "#CD7F32",
    accent: "#00D4FF",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    backgroundRoot: "#0A0A0F",
    backgroundDefault: "#1C1C24",
    backgroundSecondary: "#2A2A34",
    backgroundTertiary: "#3A3A44",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  headline: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

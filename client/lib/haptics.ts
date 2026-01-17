import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export const impactAsync = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== "web") {
    return Haptics.impactAsync(style);
  }
};

export const notificationAsync = (type: Haptics.NotificationFeedbackType) => {
  if (Platform.OS !== "web") {
    return Haptics.notificationAsync(type);
  }
};

export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

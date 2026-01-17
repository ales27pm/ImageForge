import React from "react";
import {
  Platform,
  UIManager,
  type ViewProps,
} from "react-native";
import { codegenNativeComponent } from "react-native";

export type MetalImageViewProps = ViewProps & {
  imageUri?: string;
  tintColor?: [number, number, number];
  tintIntensity?: number;
};

const VIEW_NAME = "AIFMetalImageView";
const hasViewManager =
  Platform.OS === "ios" &&
  typeof UIManager.getViewManagerConfig === "function" &&
  UIManager.getViewManagerConfig(VIEW_NAME);

const NativeMetalImageView = hasViewManager
  ? codegenNativeComponent<MetalImageViewProps>(VIEW_NAME)
  : null;

export const MetalImageView = (props: MetalImageViewProps) => {
  if (!NativeMetalImageView) {
    return null;
  }

  return <NativeMetalImageView {...props} />;
};

export const isMetalImageViewAvailable = Boolean(NativeMetalImageView);

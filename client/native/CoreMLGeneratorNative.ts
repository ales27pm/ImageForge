// Event name string literal union
export type CoreMLGeneratorEventName = "onGenerationProgress";

// Event payload interface for progress
export interface CoreMLGenerationProgressEvent {
  step: number;
  totalSteps: number;
}
import type { TurboModule } from "react-native";
import {
  NativeEventEmitter,
  NativeModules,
  TurboModuleRegistry,
} from "react-native";

export type GenerateOptions = {
  stepCount?: number;
  seed?: number;
  guidanceScale?: number;
  width?: number;
  height?: number;
};

export type GenerateResult = {
  fileUri: string;
  seed: number;
  stepCount: number;
  guidanceScale: number;
  width: number;
  height: number;
};

export interface Spec extends TurboModule {
  loadModel(modelDir: string): Promise<string>;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const CoreMLGenerator = TurboModuleRegistry.get<Spec>("AIFCoreMLGenerator");
const eventEmitterModule =
  NativeModules.AIFCoreMLGeneratorEventEmitter ??
  NativeModules.AIFCoreMLGenerator ??
  null;
const coreMLGeneratorEventEmitter = eventEmitterModule
  ? new NativeEventEmitter(eventEmitterModule)
  : null;

export function getCoreMLGenerator(): Spec | null {
  return CoreMLGenerator ?? null;
}

export function getCoreMLGeneratorEventEmitter(): NativeEventEmitter | null {
  return coreMLGeneratorEventEmitter;
}

export function isCoreMLGeneratorAvailable(): boolean {
  return !!CoreMLGenerator;
}

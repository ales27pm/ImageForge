#import "AIFCoreMLGeneratorEventEmitter.h"
#import "AIFMetalImageViewManager.h"

// ...existing code...

- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge {
  NSMutableArray<id<RCTBridgeModule>> *modules = [NSMutableArray new];

  // Register CoreML TurboModule
  [modules addObject:[AIFCoreMLGeneratorEventEmitter new]];

  // Register Metal Image View Manager
  [modules addObject:[AIFMetalImageViewManager new]];

  return modules;
}
#import "AIFCoreMLGeneratorEventEmitter.h"

@implementation AIFCoreMLGeneratorEventEmitter

RCT_EXPORT_MODULE(AIFCoreMLGeneratorEventEmitter)

+ (instancetype)shared {
  static AIFCoreMLGeneratorEventEmitter *sEmitter = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sEmitter = [AIFCoreMLGeneratorEventEmitter new];
  });
  return sEmitter;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onGenerationProgress"];
}

- (void)startObserving {}
- (void)stopObserving {}

- (void)emitProgressStep:(NSInteger)step total:(NSInteger)total {
  [self sendEventWithName:@"onGenerationProgress"
                     body:@{@"step": @(step), @"totalSteps": @(total)}];
}

@end
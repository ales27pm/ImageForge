#import <React/RCTEventEmitter.h>

@interface AIFCoreMLGeneratorEventEmitter : RCTEventEmitter

- (void)sendProgressEvent:(float)progress;

@end
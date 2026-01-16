#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN
@interface AIFCoreMLGeneratorEventEmitter : RCTEventEmitter <RCTBridgeModule>
+ (instancetype)shared;
- (void)emitProgressStep:(NSInteger)step total:(NSInteger)total;
@end
NS_ASSUME_NONNULL_END
#import "AIFCoreMLGeneratorEventEmitter.h"
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

@implementation AIFCoreMLGeneratorEventEmitter

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onCoreMLGenerationStart", @"onCoreMLGenerationProgress", @"onCoreMLGenerationComplete"];
}

- (void)sendCoreMLGenerationStart {
    [self sendEventWithName:@"onCoreMLGenerationStart" body:nil];
}

- (void)sendCoreMLGenerationProgress:(NSNumber *)progress {
    [self sendEventWithName:@"onCoreMLGenerationProgress" body:@{ @"progress": progress }];
}

- (void)sendCoreMLGenerationComplete:(NSDictionary *)result {
    [self sendEventWithName:@"onCoreMLGenerationComplete" body:result];
}

@end
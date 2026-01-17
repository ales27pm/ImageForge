#import "AIFCoreMLGeneratorEventEmitter.h"

@implementation AIFCoreMLGeneratorEventEmitter

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onGenerationProgress"];
}

- (void)sendProgressEvent:(float)progress {
    [self sendEventWithName:@"onGenerationProgress" body:@{ @"progress": @(progress) }];
}

@end
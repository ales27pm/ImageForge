#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "AIFCoreMLGeneratorEventEmitter.h"

@interface RCT_EXTERN_MODULE(AIFCoreMLGeneratorModule, NSObject)

RCT_EXTERN_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(generateImage:(NSString *)prompt
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

@end
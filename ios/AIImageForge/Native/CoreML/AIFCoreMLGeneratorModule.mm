#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <React/RCTTurboModule.h>

#import "AIFCoreMLGeneratorEventEmitter.h"
#import "NativeAIFCoreMLGeneratorSpec.h"

@interface AIFCoreMLGeneratorModule : NSObject <NativeAIFCoreMLGeneratorSpec>
@end

@implementation AIFCoreMLGeneratorModule

RCT_EXPORT_MODULE(AIFCoreMLGenerator)

- (void)loadModel:(NSString *)modelDir
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  @try {
    Class engineClass = NSClassFromString(@"AIFStableDiffusionEngine");
    id engine = [engineClass valueForKey:@"shared"];
    if (!engine) {
      reject(@"NO_ENGINE", @"Swift engine not found", nil);
      return;
    }

    SEL sel = NSSelectorFromString(@"loadModelWithModelDir:");
    if (![engine respondsToSelector:sel]) {
      reject(@"NO_METHOD", @"Swift loadModel method not found", nil);
      return;
    }

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    [engine performSelector:sel withObject:modelDir];
#pragma clang diagnostic pop

    resolve(@"ok");
  } @catch (NSException *ex) {
    reject(@"LOAD_ERROR", ex.reason ?: @"Load error", nil);
  }
}

- (void)generate:(NSString *)prompt
         options:(NSDictionary *)options
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  NSString *p = [prompt stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
  if (p.length == 0) {
    reject(@"BAD_PROMPT", @"Prompt is empty", nil);
    return;
  }

  NSInteger stepCount = options[@"stepCount"] ? [RCTConvert NSInteger:options[@"stepCount"]] : 25;
  NSNumber *seedNum = options[@"seed"];
  uint32_t seed = seedNum ? (uint32_t)seedNum.unsignedIntValue : arc4random();
  float guidanceScale = options[@"guidanceScale"] ? [RCTConvert float:options[@"guidanceScale"]] : 7.5f;

  Class engineClass = NSClassFromString(@"AIFStableDiffusionEngine");
  id engine = [engineClass valueForKey:@"shared"];
  if (!engine) {
    reject(@"NO_ENGINE", @"Swift engine not available", nil);
    return;
  }

  void (^progressBlock)(NSNumber *, NSNumber *) = ^(NSNumber *step, NSNumber *total) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [[AIFCoreMLGeneratorEventEmitter shared] emitProgressStep:step.integerValue total:total.integerValue];
    });
  };

  void (^completionBlock)(NSURL * _Nullable, NSError * _Nullable) = ^(NSURL * _Nullable url, NSError * _Nullable err) {
    if (err || !url) {
      reject(@"GEN_ERROR", err.localizedDescription ?: @"Generation failed", err);
      return;
    }

    resolve(@{
      @"fileUri": url.absoluteString,
      @"seed": @(seed),
      @"stepCount": @(stepCount),
      @"guidanceScale": @(guidanceScale),
      @"width": @(512),
      @"height": @(512),
    });
  };

  SEL sel = NSSelectorFromString(@"generateWithPrompt:stepCount:seed:guidanceScale:progress:completion:");
  if (![engine respondsToSelector:sel]) {
    reject(@"NO_METHOD", @"Swift generate shim not found", nil);
    return;
  }

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
  [engine performSelector:sel
               withObject:p
               withObject:@(stepCount)
               withObject:@(seed)
               withObject:@(guidanceScale)
               withObject:progressBlock
               withObject:completionBlock];
#pragma clang diagnostic pop
}

// RN requires these for EventEmitter-compatible modules
- (void)addListener:(NSString *)eventName {}
- (void)removeListeners:(double)count {}

@end
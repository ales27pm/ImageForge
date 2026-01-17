#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#import "AIFCoreMLGeneratorEventEmitter.h"
#import "NativeAIFCoreMLGeneratorSpec.h"

// This header is generated automatically by Xcode for Swift → ObjC.
// Make sure "Defines Module" = YES for the app target and Swift is enabled.
#import "AIImageForge-Swift.h"

@interface AIFCoreMLGeneratorModule : NSObject <NativeAIFCoreMLGeneratorSpec>
@end

@implementation AIFCoreMLGeneratorModule

RCT_EXPORT_MODULE(AIFCoreMLGenerator)

- (void)loadModel:(NSString *)modelDir
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  if (modelDir.length == 0) {
    reject(@"LOAD_ERROR", @"modelDir is empty", nil);
    return;
  }

  NSError *err = nil;

  // Swift: func loadModel(modelDir: String) throws
  // ObjC bridge becomes: - (BOOL)loadModelWithModelDir:(NSString *)modelDir error:(NSError **)error;
  BOOL ok = [[AIFStableDiffusionEngine shared] loadModelWithModelDir:modelDir error:&err];

  if (!ok || err) {
    reject(@"LOAD_ERROR", err.localizedDescription ?: @"Failed to load model", err);
    return;
  }

  resolve(@"ok");
}

- (void)generate:(NSString *)prompt
         options:(NSDictionary *)options
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  NSString *p = [[prompt ?: @""] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
  if (p.length == 0) {
    reject(@"BAD_PROMPT", @"Prompt is empty", nil);
    return;
  }

  NSInteger stepCount = options[@"stepCount"] ? [RCTConvert NSInteger:options[@"stepCount"]] : 25;
  if (stepCount < 1) stepCount = 1;

  NSNumber *seedNum = options[@"seed"];
  uint32_t seed = seedNum ? (uint32_t)seedNum.unsignedIntValue : arc4random();

  float guidanceScale = options[@"guidanceScale"] ? [RCTConvert float:options[@"guidanceScale"]] : 7.5f;

  // Optional width/height from JS (you currently return 512/512 anyway)
  NSInteger width = options[@"width"] ? [RCTConvert NSInteger:options[@"width"]] : 512;
  NSInteger height = options[@"height"] ? [RCTConvert NSInteger:options[@"height"]] : 512;

  __weak typeof(self) weakSelf = self;
  (void)weakSelf;

  void (^progressBlock)(NSNumber * _Nonnull, NSNumber * _Nonnull) =
    ^(NSNumber * _Nonnull step, NSNumber * _Nonnull total) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [[AIFCoreMLGeneratorEventEmitter shared] emitProgressStep:step.integerValue total:total.integerValue];
      });
    };

  void (^completionBlock)(NSURL * _Nullable, NSError * _Nullable) =
    ^(NSURL * _Nullable url, NSError * _Nullable err) {
      if (err || !url) {
        reject(@"GEN_ERROR", err.localizedDescription ?: @"Generation failed", err);
        return;
      }

      resolve(@{
        @"fileUri": url.absoluteString,
        @"seed": @(seed),
        @"stepCount": @(stepCount),
        @"guidanceScale": @(guidanceScale),
        @"width": @(width),
        @"height": @(height),
      });
    };

  // Swift shim:
  // generate(withPrompt:stepCount:seed:guidanceScale:progress:completion:)
  [[AIFStableDiffusionEngine shared] generateWithPrompt:p
                                             stepCount:@(stepCount)
                                                  seed:@(seed)
                                         guidanceScale:@(guidanceScale)
                                              progress:progressBlock
                                            completion:completionBlock];
}

// Required by RN for EventEmitter-style modules (even if you use a separate emitter)
- (void)addListener:(NSString *)eventName {}
- (void)removeListeners:(double)count {}

@end
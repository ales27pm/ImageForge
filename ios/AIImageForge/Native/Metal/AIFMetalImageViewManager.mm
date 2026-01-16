#import <React/RCTViewManager.h>
#import "AIFMetalImageView.h"

@interface AIFMetalImageViewManager : RCTViewManager
@end

@implementation AIFMetalImageViewManager
RCT_EXPORT_MODULE(AIFMetalImageView)

- (UIView *)view {
  AIFMetalImageView *v = [AIFMetalImageView new];
  v.tintIntensity = 0.25f;
  return v;
}

RCT_EXPORT_VIEW_PROPERTY(imageUri, NSString)
RCT_EXPORT_VIEW_PROPERTY(tintColor, NSArray)
RCT_EXPORT_VIEW_PROPERTY(tintIntensity, float)

@end
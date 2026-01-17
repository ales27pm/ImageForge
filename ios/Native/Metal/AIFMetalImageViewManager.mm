#import <React/RCTViewManager.h>
#import "AIFMetalImageView.h"

@interface AIFMetalImageViewManager : RCTViewManager
@end

@implementation AIFMetalImageViewManager

RCT_EXPORT_MODULE(AIFMetalImageView)

RCT_EXPORT_VIEW_PROPERTY(imageUri, NSString)
RCT_EXPORT_VIEW_PROPERTY(tintIntensity, float)
RCT_EXPORT_VIEW_PROPERTY(tintColor, NSArray<NSNumber *>)

- (UIView *)view {
    return [[AIFMetalImageView alloc] initWithFrame:CGRectZero device:MTLCreateSystemDefaultDevice()];
}

@end
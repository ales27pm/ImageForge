#import <React/RCTViewManager.h>
#import "AIFMetalImageView.h"

@interface AIFMetalImageViewManager : RCTViewManager
@end

@implementation AIFMetalImageViewManager

RCT_EXPORT_MODULE(AIFMetalImageView)

- (UIView *)view {
    return [[AIFMetalImageView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(texture, id<MTLTexture>)

@end
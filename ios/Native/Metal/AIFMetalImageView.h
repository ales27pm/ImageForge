#import <UIKit/UIKit.h>
#import <MetalKit/MetalKit.h>

@interface AIFMetalImageView : MTKView

@property (nonatomic, strong) NSString *imageUri;
@property (nonatomic, assign) float tintIntensity;
@property (nonatomic, strong) NSArray<NSNumber *> *tintColor;

- (void)updateImage;

@end
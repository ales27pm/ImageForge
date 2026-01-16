#import <MetalKit/MetalKit.h>

@interface AIFMetalImageView : MTKView

- (void)displayTexture:(id<MTLTexture>)texture;

@end
#import "AIFMetalImageView.h"
#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>

@implementation AIFMetalImageView {
    id<MTLDevice> _device;
    id<MTLCommandQueue> _commandQueue;
    id<MTLTexture> _texture;
}

- (instancetype)initWithFrame:(CGRect)frame device:(id<MTLDevice>)device {
    self = [super initWithFrame:frame device:device];
    if (self) {
        _device = device;
        _commandQueue = [_device newCommandQueue];
        self.enableSetNeedsDisplay = YES;
    }
    return self;
}

- (void)updateImage {
    if (self.imageUri) {
        NSURL *imageURL = [NSURL URLWithString:self.imageUri];
        NSData *imageData = [NSData dataWithContentsOfURL:imageURL];
        UIImage *image = [UIImage imageWithData:imageData];
        _texture = [self textureFromImage:image];
        [self setNeedsDisplay];
    }
}

- (id<MTLTexture>)textureFromImage:(UIImage *)image {
    // Convert UIImage to MTLTexture (implementation omitted for brevity)
    return nil;
}

- (void)drawRect:(CGRect)rect {
    if (!_texture) return;

    id<MTLCommandBuffer> commandBuffer = [_commandQueue commandBuffer];
    id<MTLRenderCommandEncoder> renderEncoder = [commandBuffer renderCommandEncoderWithDescriptor:self.currentRenderPassDescriptor];

    // Apply tint and draw texture (implementation omitted for brevity)

    [renderEncoder endEncoding];
    [commandBuffer presentDrawable:self.currentDrawable];
    [commandBuffer commit];
}

@end
#import "AIFMetalImageView.h"

@implementation AIFMetalImageView

- (void)displayTexture:(id<MTLTexture>)texture {
    if (!texture) {
        NSLog(@"[AIFMetalImageView] No texture to display.");
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        self.drawableSize = CGSizeMake(texture.width, texture.height);
        id<CAMetalDrawable> drawable = [self.currentDrawable retain];
        if (drawable) {
            id<MTLCommandBuffer> commandBuffer = [self.device newCommandQueue].commandBuffer;
            id<MTLRenderPassDescriptor> passDescriptor = self.currentRenderPassDescriptor;
            passDescriptor.colorAttachments[0].texture = drawable.texture;
            passDescriptor.colorAttachments[0].loadAction = MTLLoadActionClear;
            passDescriptor.colorAttachments[0].clearColor = MTLClearColorMake(0, 0, 0, 1);
            passDescriptor.colorAttachments[0].storeAction = MTLStoreActionStore;

            id<MTLRenderCommandEncoder> encoder = [commandBuffer renderCommandEncoderWithDescriptor:passDescriptor];
            [encoder endEncoding];
            [commandBuffer presentDrawable:drawable];
            [commandBuffer commit];
        }
    });
}

@end
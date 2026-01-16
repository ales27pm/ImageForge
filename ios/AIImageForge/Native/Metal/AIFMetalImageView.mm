#import "AIFMetalImageView.h"
#import <MetalKit/MetalKit.h>

static inline float clamp01(float v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

@interface AIFMetalImageView () <MTKViewDelegate>
@end

@implementation AIFMetalImageView {
  MTKView *_mtk;
  id<MTLDevice> _device;
  id<MTLCommandQueue> _queue;
  id<MTLRenderPipelineState> _pso;
  id<MTLTexture> _texture;
  float _tint[3];
  float _tintIntensity;
  NSString *_lastLoadedPath;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if ((self = [super initWithFrame:frame])) {
    _device = MTLCreateSystemDefaultDevice();
    _mtk = [[MTKView alloc] initWithFrame:self.bounds device:_device];
    _mtk.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _mtk.delegate = self;
    _mtk.enableSetNeedsDisplay = YES;
    _mtk.paused = YES;
    _mtk.clearColor = MTLClearColorMake(0.05, 0.05, 0.06, 1.0);
    [self addSubview:_mtk];

    _queue = [_device newCommandQueue];
    _tint[0] = 1.0f; _tint[1] = 0.5f; _tint[2] = 0.2f;
    _tintIntensity = 0.25f;

    [self buildPipeline];
  }
  return self;
}

- (void)buildPipeline {
  NSError *err = nil;
  id<MTLLibrary> lib = [_device newDefaultLibrary];
  if (!lib) { NSLog(@"AIFMetalImageView: default library missing"); return; }

  id<MTLFunction> vs = [lib newFunctionWithName:@"aif_vertex"];
  id<MTLFunction> fs = [lib newFunctionWithName:@"aif_frag"];
  if (!vs || !fs) { NSLog(@"AIFMetalImageView: shader functions missing"); return; }

  MTLRenderPipelineDescriptor *desc = [MTLRenderPipelineDescriptor new];
  desc.vertexFunction = vs;
  desc.fragmentFunction = fs;
  desc.colorAttachments[0].pixelFormat = _mtk.colorPixelFormat;

  _pso = [_device newRenderPipelineStateWithDescriptor:desc error:&err];
  if (err) NSLog(@"AIFMetalImageView: pipeline error %@", err);
}

- (void)setImageUri:(NSString *)imageUri {
  _imageUri = [imageUri copy];
  [self loadTextureIfNeeded];
}

- (void)setTintColor:(NSArray<NSNumber *> *)tintColor {
  _tintColor = [tintColor copy];
  if (_tintColor.count >= 3) {
    _tint[0] = clamp01(_tintColor[0].floatValue);
    _tint[1] = clamp01(_tintColor[1].floatValue);
    _tint[2] = clamp01(_tintColor[2].floatValue);
  }
  [_mtk setNeedsDisplay];
}

- (void)setTintIntensity:(float)tintIntensity {
  _tintIntensity = clamp01(tintIntensity);
  [_mtk setNeedsDisplay];
}

- (float)tintIntensity { return _tintIntensity; }

- (NSString *)normalizedFilePathFromUri:(NSString *)uri {
  if (uri.length == 0) return @"";
  if ([uri hasPrefix:@"file://"]) {
    NSURL *u = [NSURL URLWithString:uri];
    return u.path ?: @"";
  }
  return uri;
}

- (void)loadTextureIfNeeded {
  NSString *path = [self normalizedFilePathFromUri:_imageUri ?: @""];
  if (path.length == 0) return;
  if (_lastLoadedPath && [_lastLoadedPath isEqualToString:path]) {
    [_mtk setNeedsDisplay];
    return;
  }

  NSURL *url = [NSURL fileURLWithPath:path];
  MTKTextureLoader *loader = [[MTKTextureLoader alloc] initWithDevice:_device];
  NSError *err = nil;
  NSDictionary *opts = @{
    MTKTextureLoaderOptionSRGB: @NO,
    MTKTextureLoaderOptionOrigin: MTKTextureLoaderOriginTopLeft
  };

  id<MTLTexture> tex = [loader newTextureWithContentsOfURL:url options:opts error:&err];
  if (err || !tex) {
    NSLog(@"AIFMetalImageView: texture load failed %@ (%@)", path, err);
    return;
  }

  _texture = tex;
  _lastLoadedPath = [path copy];
  [_mtk setNeedsDisplay];
}

#pragma mark - MTKViewDelegate

- (void)drawInMTKView:(MTKView *)view {
  if (!_pso || !_texture) return;
  id<CAMetalDrawable> drawable = view.currentDrawable;
  MTLRenderPassDescriptor *rpd = view.currentRenderPassDescriptor;
  if (!drawable || !rpd) return;

  id<MTLCommandBuffer> cb = [_queue commandBuffer];
  id<MTLRenderCommandEncoder> enc = [cb renderCommandEncoderWithDescriptor:rpd];

  [enc setRenderPipelineState:_pso];
  [enc setFragmentTexture:_texture atIndex:0];

  [enc setFragmentBytes:_tint length:sizeof(_tint) atIndex:0];
  float ti = _tintIntensity;
  [enc setFragmentBytes:&ti length:sizeof(float) atIndex:1];

  [enc drawPrimitives:MTLPrimitiveTypeTriangleStrip vertexStart:0 vertexCount:4];
  [enc endEncoding];

  [cb presentDrawable:drawable];
  [cb commit];
}

- (void)mtkView:(MTKView *)view drawableSizeWillChange:(CGSize)size {}

@end
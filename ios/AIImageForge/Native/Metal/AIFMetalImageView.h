#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN
@interface AIFMetalImageView : UIView
@property (nonatomic, copy, nullable) NSString *imageUri;
@property (nonatomic, copy, nullable) NSArray<NSNumber *> *tintColor; // [r,g,b] 0..1
@property (nonatomic, assign) float tintIntensity; // 0..1
@end
NS_ASSUME_NONNULL_END
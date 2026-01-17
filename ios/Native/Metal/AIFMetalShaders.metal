#include <metal_stdlib>
using namespace metal;

fragment float4 tintFragment(
    float4 in [[stage_in]],
    texture2d<float> texture [[texture(0)]],
    constant float3 &tintColor [[buffer(0)]],
    constant float &tintIntensity [[buffer(1)]]
) {
    constexpr sampler textureSampler(mag_filter::linear, min_filter::linear);
    float4 color = texture.sample(textureSampler, in.xy);
    color.rgb = mix(color.rgb, tintColor, tintIntensity);
    return color;
}
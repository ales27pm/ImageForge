#include <metal_stdlib>
using namespace metal;

struct VertexOut {
  float4 position [[position]];
  float2 texCoord;
};

vertex VertexOut aif_vertex(uint vid [[vertex_id]]) {
  float2 positions[4] = { {-1, -1}, { 1, -1}, {-1,  1}, { 1,  1} };
  float2 uvs[4]       = { { 0,  1}, { 1,  1}, { 0,  0}, { 1,  0} };

  VertexOut out;
  out.position = float4(positions[vid], 0.0, 1.0);
  out.texCoord = uvs[vid];
  return out;
}

fragment float4 aif_frag(
  VertexOut in [[stage_in]],
  texture2d<float> tex [[texture(0)]],
  constant float3 &tintColor [[buffer(0)]],
  constant float &tintIntensity [[buffer(1)]]
) {
  constexpr sampler s(mag_filter::linear, min_filter::linear);
  float4 c = tex.sample(s, in.texCoord);
  float3 mixed = mix(c.rgb, tintColor, clamp(tintIntensity, 0.0, 1.0));
  return float4(mixed, c.a);
}
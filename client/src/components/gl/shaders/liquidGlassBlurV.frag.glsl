precision highp float;

varying vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_canvasSize;
uniform vec2 u_directionPx;
uniform int u_radius;

#define MAX_RADIUS 64
uniform float u_kernel[MAX_RADIUS];

vec3 sampleTex(vec2 uv) {
  return texture2D(u_tex, clamp(uv, 0.0, 1.0)).rgb;
}

void main() {
  vec2 uv = v_uv;

  vec2 dirUv = u_directionPx / u_canvasSize;

  vec3 res = sampleTex(uv) * u_kernel[0];
  vec2 l = uv - dirUv;
  vec2 r = uv + dirUv;

  for (int i = 1; i < MAX_RADIUS; i++) {
    if (i < u_radius) {
      float w = u_kernel[i];
      res += sampleTex(l) * w;
      res += sampleTex(r) * w;
    }
    l -= dirUv;
    r += dirUv;
  }

  gl_FragColor = vec4(res, 1.0);
}
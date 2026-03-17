precision highp float;

varying vec2 v_uv;

uniform sampler2D u_image;
uniform vec2 u_canvasSize;
uniform vec2 u_capsuleTopLeft;
uniform vec2 u_imageOffset;     // px in container space (object-fit: cover draw top-left)
uniform vec2 u_imageDrawSize;   // px in container space (object-fit: cover draw size)
uniform vec2 u_directionPx;
uniform int u_radius;

#define MAX_RADIUS 64
uniform float u_kernel[MAX_RADIUS];

vec3 sampleImage(vec2 uv) {
  return texture2D(u_image, clamp(uv, 0.0, 1.0)).rgb;
}

void main() {
  // Convert v_uv (bottom-left) -> (top-left)
  vec2 domUv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 localPx = domUv * u_canvasSize;

  // Object-fit: cover aligned sampling (containerPx -> imageUv)
  vec2 containerPx = u_capsuleTopLeft + localPx;
  vec2 uv = (containerPx - u_imageOffset) / u_imageDrawSize;

  vec2 dirUv = u_directionPx / u_imageDrawSize;

  vec3 res = sampleImage(uv) * u_kernel[0];
  vec2 l = uv - dirUv;
  vec2 r = uv + dirUv;

  // Constant-bounded loop.
  for (int i = 1; i < MAX_RADIUS; i++) {
    if (i < u_radius) {
      float w = u_kernel[i];
      res += sampleImage(l) * w;
      res += sampleImage(r) * w;
    }
    l -= dirUv;
    r += dirUv;
  }

  vec3 color = res;

  gl_FragColor = vec4(color, 1.0);
}
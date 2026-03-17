precision highp float;

varying vec2 v_uv;

uniform sampler2D u_blurTex;
uniform vec2 u_canvasSize;
uniform float u_edgeMapStartPx;
uniform float u_edgeMapMaxPx;     // px cap for mapping distance (<=0 means unlimited)
uniform float u_borderRadiusPx;

// Signed distance to a rounded rectangle centered at origin.
float sdRoundBox(vec2 p, vec2 halfSize, float r) {
  r = clamp(r, 0.0, min(halfSize.x, halfSize.y));
  vec2 q = abs(p) - (halfSize - vec2(r));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 roundBoxOutwardNormal(vec2 p, vec2 halfSize, float r) {
  // Finite-difference gradient for a stable normal near corners.
  float e = 1.0;
  float dx = sdRoundBox(p + vec2(e, 0.0), halfSize, r) - sdRoundBox(p - vec2(e, 0.0), halfSize, r);
  float dy = sdRoundBox(p + vec2(0.0, e), halfSize, r) - sdRoundBox(p - vec2(0.0, e), halfSize, r);
  vec2 g = vec2(dx, dy);
  float lg = length(g);
  if (lg < 1e-4) return vec2(0.0, 1.0);
  return g / lg;
}

// Distance along inward normal (-n) from p to the opposite boundary of the same rounded box.
// Uses constant-step sphere tracing + bisection; WebGL1-safe (constant loop bounds).
float roundBoxOppositeDistance(vec2 p, vec2 halfSize, float r, vec2 n) {
  const int STEPS = 16;
  const int REFINE = 6;

  float d0 = sdRoundBox(p, halfSize, r);
  if (d0 >= 0.0) return 0.0;

  float t = 1.0;
  float lo = 0.0;
  float hi = 0.0;
  bool foundHi = false;

  // Find a bracket [lo, hi] where sdf crosses 0 along the ray p - n*t.
  for (int i = 0; i < STEPS; i++) {
    float d = sdRoundBox(p - n * t, halfSize, r);
    if (!foundHi) {
      if (d > 0.0) {
        hi = t;
        foundHi = true;
      } else {
        lo = t;
        // Sphere tracing step. Clamp to avoid too many tiny steps.
        t += max(1.0, abs(d));
      }
    }
  }

  if (!foundHi) {
    // Fallback upper bound (should be rare).
    hi = max(lo + 1.0, length(halfSize) * 4.0);
  }

  for (int j = 0; j < REFINE; j++) {
    float mid = 0.5 * (lo + hi);
    float d = sdRoundBox(p - n * mid, halfSize, r);
    if (d < 0.0) lo = mid;
    else hi = mid;
  }

  return hi;
}

void main() {
  // v_uv is GL (origin bottom-left). We'll compute in DOM-like for pixel math.
  vec2 domUv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 localPx = domUv * u_canvasSize;

  vec2 p = localPx - 0.5 * u_canvasSize;
  vec2 halfSize = 0.5 * u_canvasSize;
  float r = u_borderRadiusPx;
  float sdf = sdRoundBox(p, halfSize, r);

  // dist to edge (inside capsule)
  float distIn = max(0.0, -sdf);
  float startPx = max(0.001, u_edgeMapStartPx);

  // u=0 at mapping start (distIn==startPx), u=1 at the very edge (distIn==0).
  float u = clamp((startPx - distIn) / startPx, 0.0, 1.0);
  float t = 1.0 - pow(1.0 - u, 0.3333333333);
  float q = t * t; // mapping strength (distance curve)

  vec2 n = roundBoxOutwardNormal(p, halfSize, r);
  float maxDelta = roundBoxOppositeDistance(p, halfSize, r, n);
  float cappedMaxDelta = (u_edgeMapMaxPx > 0.0) ? min(maxDelta, u_edgeMapMaxPx) : maxDelta;
  vec2 mappedP = p - n * (cappedMaxDelta * q);

  vec2 mappedLocalPx = mappedP + 0.5 * u_canvasSize;
  vec2 mappedDomUv = mappedLocalPx / u_canvasSize;
  vec2 mappedGlUv = vec2(mappedDomUv.x, 1.0 - mappedDomUv.y);

  vec3 color = texture2D(u_blurTex, mappedGlUv).rgb;

  gl_FragColor = vec4(color, 1.0);
}
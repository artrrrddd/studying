import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import {
  compileShader,
  createProgram,
  createTexture,
  createMaskCanvas,
  resizeCanvas,
} from "./utils/webgl.js";

const GlassContext = createContext(null);

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uTextureMatrix;

out vec2 vTextureCoord;

void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;
uniform vec2 uMousePos;
uniform vec2 uTMousePos;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform float uRadius;
uniform float uDistort;
uniform float uDispersion;
uniform float uRotSpeed;
uniform float uShadowIntensity;
uniform float uShadowOffsetX;
uniform float uShadowOffsetY;
uniform float uShadowBlur;
uniform float uHighlightIntensity;
uniform float uHighlightSize;
uniform float uHighlightOffsetX;
uniform float uHighlightOffsetY;
uniform vec2 uChipPos;
uniform vec2 uChipSize;

out vec4 fragColor;

const float PI = 3.14159265359;

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float getMinSize() {
  return min(uChipSize.x, uChipSize.y);
}

float getChipDist(vec2 uv) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float padding = mix(0.004, 0.014, clamp(uRadius, 0.0, 1.0));
  vec2 local = uv - uChipPos;
  local.x *= aspect;

  vec2 halfSize = max(uChipSize * 0.5 - vec2(padding * 0.75, padding), vec2(0.001));
  halfSize.x *= aspect;
  float cornerRadius = min(halfSize.x, halfSize.y) * 0.28;

  return sdRoundedBox(local, halfSize, cornerRadius);
}

float getDist(vec2 uv) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float sd = getChipDist(uv);
  vec2 delta = uv - uTMousePos;
  delta.x *= aspect;

  float mouseFalloff = 1.0 - smoothstep(0.0, max(uChipSize.x, uChipSize.y) * 2.8, length(delta));
  mouseFalloff = max(mouseFalloff, 0.18);

  float interior = smoothstep(getMinSize() * 0.08, -getMinSize() * 0.22, sd);
  float tweak = interior * (0.0025 + uDistort * 0.008) / mouseFalloff;
  return sd - tweak;
}

float getShadow(vec2 uv) {
  float minSize = getMinSize();
  vec2 shadowUV = uv + vec2(uShadowOffsetX * uChipSize.x, -uShadowOffsetY * uChipSize.y);
  float shadowDist = getChipDist(shadowUV);
  float shadow = 1.0 - smoothstep(-uShadowBlur * minSize, uShadowBlur * minSize, shadowDist);
  float attenuation = smoothstep(minSize * 0.18, -minSize * 0.25, getChipDist(uv));
  return shadow * uShadowIntensity * attenuation;
}

float getHighlight(vec2 uv) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 lightBase = uChipPos + vec2(-uChipSize.x * 0.18, uChipSize.y * 0.18);
  vec2 lightPos = mix(lightBase, uMousePos, 0.28);
  vec2 highlightPos = uv - lightPos + vec2(uHighlightOffsetX * uChipSize.x, uHighlightOffsetY * uChipSize.y);
  highlightPos.x *= aspect;

  vec2 halfSize = vec2(uChipSize.x * 0.16, uChipSize.y * 0.11) * uHighlightSize;
  halfSize.x *= aspect;
  float cornerRadius = min(halfSize.x, halfSize.y) * 0.95;

  float highlightDist = sdRoundedBox(highlightPos, halfSize, cornerRadius);
  float highlight = 1.0 - smoothstep(-getMinSize() * 0.08, getMinSize() * 0.12, highlightDist);
  float centerFalloff = 1.0 - smoothstep(0.0, getMinSize() * 0.65, length(highlightPos));

  return highlight * centerFalloff * uHighlightIntensity;
}

vec4 refrakt(float sd, vec2 st, vec4 bg, vec2 originalUV) {
  float safeSd = max(abs(sd), getMinSize() * 0.2);
  vec2 dir = length(st) > 0.0001 ? normalize(st) : vec2(0.0);
  vec2 offset = dir * (0.001 + smoothstep(getMinSize() * 0.12, -getMinSize() * 0.28, sd) * uDistort * 0.006) / safeSd;
  float disp = uDispersion * 0.01;

  vec2 redUV = clamp(originalUV + offset * disp * 1.2, vec2(0.0), vec2(1.0));
  vec2 greenUV = clamp(originalUV + offset * disp, vec2(0.0), vec2(1.0));
  vec2 blueUV = clamp(originalUV + offset * disp * 0.8, vec2(0.0), vec2(1.0));

  vec4 refractedColor = vec4(
    texture(uTexture, redUV).r,
    texture(uTexture, greenUV).g,
    texture(uTexture, blueUV).b,
    1.0
  );

  refractedColor.rgb = mix(refractedColor.rgb, vec3(0.0), getShadow(originalUV) * 0.18);

  float opacity = smoothstep(getMinSize() * 0.04, -getMinSize() * 0.04, sd);
  return mix(bg, refractedColor, opacity);
}

vec4 getEffect(vec2 st, vec4 bg, vec2 originalUV) {
  float eps = getMinSize() * 0.02;
  vec4 sum = vec4(0.0);
  sum += refrakt(getDist(originalUV), originalUV - uChipPos, bg, originalUV);
  sum += refrakt(getDist(originalUV + vec2(eps, 0.0)), st, bg, originalUV + vec2(eps, 0.0));
  sum += refrakt(getDist(originalUV - vec2(eps, 0.0)), st, bg, originalUV - vec2(eps, 0.0));
  sum += refrakt(getDist(originalUV + vec2(0.0, eps)), st, bg, originalUV + vec2(0.0, eps));
  sum += refrakt(getDist(originalUV - vec2(0.0, eps)), st, bg, originalUV - vec2(0.0, eps));
  return sum * 0.2;
}

void main() {
  vec2 uv = vTextureCoord;
  float chipDist = getChipDist(uv);
  float minSize = getMinSize();

  if (chipDist > minSize * 0.28) {
    discard;
  }

  vec4 bg = texture(uTexture, clamp(uv, vec2(0.0), vec2(1.0)));
  bg.rgb = mix(bg.rgb, vec3(0.0), getShadow(uv) * 0.12);

  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 st = uv - mix(uChipPos, uMousePos, 0.12);
  st *= vec2(aspect, 1.0);
  st *= 1.0 / (0.4920 + 0.2);
  st = rot(-uRotSpeed * 2.0 * PI) * st;

  vec4 color = getEffect(st, bg, uv);
  float highlight = getHighlight(uv);
  vec3 exposedColor = 1.0 - exp(-color.rgb * (1.0 + highlight * 2.6));
  vec3 brightenedColor = color.rgb * (1.0 + highlight * 1.7);
  color.rgb = mix(exposedColor, brightenedColor, 0.28);
  color.rgb *= mix(vec3(1.0), vec3(1.02, 1.01, 0.98), highlight * 0.32);

  float edgeAlpha = 1.0 - smoothstep(0.0, minSize * 0.08, chipDist);
  vec4 mask = texture(uMaskTexture, vec2(0.5));
  fragColor = vec4(color.rgb, edgeAlpha * mask.a);
}`;

const glassParams = {
  radius: 0.3,
  distort: 2.1,
  dispersion: 0.75,
  rotSpeed: 1.0,
  shadowIntensity: 0.08,
  shadowOffsetX: 0.14,
  shadowOffsetY: 0.12,
  shadowBlur: 0.32,
  highlightIntensity: 0.42,
  highlightSize: 1.0,
  highlightOffsetX: 0.08,
  highlightOffsetY: 0.04,
};

export function useGlassRef() {
  return useContext(GlassContext);
}

function resolveSnapshotBackground() {
  const htmlBackground = window.getComputedStyle(document.documentElement).backgroundColor;
  const bodyBackground = window.getComputedStyle(document.body).backgroundColor;

  if (htmlBackground && htmlBackground !== "rgba(0, 0, 0, 0)" && htmlBackground !== "transparent") {
    return htmlBackground;
  }

  if (bodyBackground && bodyBackground !== "rgba(0, 0, 0, 0)" && bodyBackground !== "transparent") {
    return bodyBackground;
  }

  return "#242424";
}

function createFallbackCanvas(backgroundColor = "#242424") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 4;
  const context = canvas.getContext("2d");
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function setupGeometry(gl, program) {
  const quad = new Float32Array([
    -1, -1, 0, 0, 0,
     1, -1, 0, 1, 0,
    -1,  1, 0, 0, 1,
     1,  1, 0, 1, 1,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aVertexPosition");
  const textureLocation = gl.getAttribLocation(program, "aTextureCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 5 * 4, 0);

  gl.enableVertexAttribArray(textureLocation);
  gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

  return { vao, vbo };
}

export default function GlassCanvas({ children, snapshotKey }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const uniformsRef = useRef({});
  const chipRefsRef = useRef(new Set());
  const snapshotTextureRef = useRef(null);
  const maskTextureRef = useRef(null);
  const vaoRef = useRef(null);
  const vboRef = useRef(null);
  const programRef = useRef(null);
  const animationFrameRef = useRef(0);
  const captureTimeoutRef = useRef(0);
  const captureInFlightRef = useRef(false);
  const pendingCaptureRef = useRef(false);
  const disposedRef = useRef(false);
  const textureResolutionRef = useRef({ width: 4, height: 4 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  const captureSnapshot = useCallback(async () => {
    if (disposedRef.current || !glRef.current) {
      return;
    }

    if (captureInFlightRef.current) {
      pendingCaptureRef.current = true;
      return;
    }

    captureInFlightRef.current = true;

    try {
      const backgroundColor = resolveSnapshotBackground();
      const snapshot = await html2canvas(document.documentElement, {
        backgroundColor,
        logging: false,
        useCORS: true,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        onclone: (clonedDocument) => {
          clonedDocument
            .querySelectorAll('[data-glass-chip="true"]')
            .forEach((element) => {
              if (!(element instanceof HTMLElement)) {
                return;
              }

              element.style.visibility = "hidden";
              element.style.boxShadow = "none";
              element.style.background = "transparent";
              element.style.borderColor = "transparent";
              element.style.textShadow = "none";
            });
        },
        ignoreElements: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return element.dataset.glassIgnore === "true";
        },
      });

      if (disposedRef.current || !glRef.current) {
        return;
      }

      const gl = glRef.current;
      if (snapshotTextureRef.current) {
        gl.deleteTexture(snapshotTextureRef.current);
      }

      snapshotTextureRef.current = createTexture(gl, 0, snapshot);
      textureResolutionRef.current = {
        width: snapshot.width || window.innerWidth,
        height: snapshot.height || window.innerHeight,
      };
    } catch (error) {
      console.error("Glass snapshot capture failed:", error);
    } finally {
      captureInFlightRef.current = false;

      if (pendingCaptureRef.current) {
        pendingCaptureRef.current = false;
        queueMicrotask(() => {
          void captureSnapshot();
        });
      }
    }
  }, []);

  const scheduleSnapshot = useCallback(
    (delay = 80) => {
      window.clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = window.setTimeout(() => {
        void captureSnapshot();
      }, delay);
    },
    [captureSnapshot]
  );

  const registerChip = useCallback(
    (element) => {
      if (!element) {
        return () => {};
      }

      chipRefsRef.current.add(element);
      scheduleSnapshot();

      return () => {
        chipRefsRef.current.delete(element);
        scheduleSnapshot();
      };
    },
    [scheduleSnapshot]
  );

  useEffect(() => {
    scheduleSnapshot(120);
  }, [scheduleSnapshot, snapshotKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      return undefined;
    }

    glRef.current = gl;
    disposedRef.current = false;

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      return undefined;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return undefined;
    }

    programRef.current = program;
    gl.useProgram(program);

    [
      "uMVMatrix",
      "uPMatrix",
      "uTextureMatrix",
      "uTexture",
      "uMaskTexture",
      "uMousePos",
      "uTMousePos",
      "uResolution",
      "uTextureResolution",
      "uRadius",
      "uDistort",
      "uDispersion",
      "uRotSpeed",
      "uShadowIntensity",
      "uShadowOffsetX",
      "uShadowOffsetY",
      "uShadowBlur",
      "uHighlightIntensity",
      "uHighlightSize",
      "uHighlightOffsetX",
      "uHighlightOffsetY",
      "uChipPos",
      "uChipSize",
    ].forEach((name) => {
      uniformsRef.current[name] = gl.getUniformLocation(program, name);
    });

    const identityMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    gl.uniformMatrix4fv(uniformsRef.current.uMVMatrix, false, identityMatrix);
    gl.uniformMatrix4fv(uniformsRef.current.uPMatrix, false, identityMatrix);
    gl.uniformMatrix4fv(uniformsRef.current.uTextureMatrix, false, identityMatrix);
    gl.uniform1i(uniformsRef.current.uTexture, 0);
    gl.uniform1i(uniformsRef.current.uMaskTexture, 1);

    const { vao, vbo } = setupGeometry(gl, program);
    vaoRef.current = vao;
    vboRef.current = vbo;

    snapshotTextureRef.current = createTexture(gl, 0, createFallbackCanvas(resolveSnapshotBackground()));
    maskTextureRef.current = createTexture(gl, 1, createMaskCanvas());

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const applyGlassUniforms = () => {
      gl.uniform1f(uniformsRef.current.uRadius, glassParams.radius);
      gl.uniform1f(uniformsRef.current.uDistort, glassParams.distort);
      gl.uniform1f(uniformsRef.current.uDispersion, glassParams.dispersion);
      gl.uniform1f(uniformsRef.current.uRotSpeed, glassParams.rotSpeed);
      gl.uniform1f(uniformsRef.current.uShadowIntensity, glassParams.shadowIntensity);
      gl.uniform1f(uniformsRef.current.uShadowOffsetX, glassParams.shadowOffsetX);
      gl.uniform1f(uniformsRef.current.uShadowOffsetY, glassParams.shadowOffsetY);
      gl.uniform1f(uniformsRef.current.uShadowBlur, glassParams.shadowBlur);
      gl.uniform1f(uniformsRef.current.uHighlightIntensity, glassParams.highlightIntensity);
      gl.uniform1f(uniformsRef.current.uHighlightSize, glassParams.highlightSize);
      gl.uniform1f(uniformsRef.current.uHighlightOffsetX, glassParams.highlightOffsetX);
      gl.uniform1f(uniformsRef.current.uHighlightOffsetY, glassParams.highlightOffsetY);
    };

    const handleResize = () => {
      resizeCanvas(canvas, gl);
      scheduleSnapshot(120);
    };

    const updatePointer = (clientX, clientY) => {
      targetMouseRef.current.x = clientX / window.innerWidth;
      targetMouseRef.current.y = 1 - clientY / window.innerHeight;
    };

    const handleMouseMove = (event) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      if (!event.touches.length) {
        return;
      }

      const touch = event.touches[0];
      updatePointer(touch.clientX, touch.clientY);
    };

    const render = () => {
      if (disposedRef.current) {
        return;
      }

      const mouse = mouseRef.current;
      const target = targetMouseRef.current;
      mouse.x += (target.x - mouse.x) * 0.08;
      mouse.y += (target.y - mouse.y) * 0.08;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2fv(uniformsRef.current.uResolution, [canvas.width, canvas.height]);
      gl.uniform2fv(uniformsRef.current.uTextureResolution, [
        textureResolutionRef.current.width,
        textureResolutionRef.current.height,
      ]);
      gl.uniform2fv(uniformsRef.current.uMousePos, [mouse.x, mouse.y]);
      gl.uniform2fv(uniformsRef.current.uTMousePos, [target.x, target.y]);
      applyGlassUniforms();

      chipRefsRef.current.forEach((element) => {
        if (!element?.isConnected) {
          chipRefsRef.current.delete(element);
          return;
        }

        const computedStyle = window.getComputedStyle(element);
        if (
          element.dataset.dragging === "true" ||
          computedStyle.display === "none" ||
          computedStyle.visibility === "hidden" ||
          computedStyle.opacity === "0"
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }

        gl.uniform2fv(uniformsRef.current.uChipPos, [
          (rect.left + rect.width * 0.5) / window.innerWidth,
          1 - (rect.top + rect.height * 0.5) / window.innerHeight,
        ]);
        gl.uniform2fv(uniformsRef.current.uChipSize, [
          rect.width / window.innerWidth,
          rect.height / window.innerHeight,
        ]);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    handleResize();
    render();
    scheduleSnapshot(180);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      disposedRef.current = true;
      window.clearTimeout(captureTimeoutRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);

      if (snapshotTextureRef.current) {
        gl.deleteTexture(snapshotTextureRef.current);
      }
      if (maskTextureRef.current) {
        gl.deleteTexture(maskTextureRef.current);
      }
      if (vboRef.current) {
        gl.deleteBuffer(vboRef.current);
      }
      if (vaoRef.current) {
        gl.deleteVertexArray(vaoRef.current);
      }

      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [scheduleSnapshot]);

  return (
    <GlassContext.Provider value={registerChip}>
      <canvas
        ref={canvasRef}
        data-glass-ignore="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 11,
        }}
      />
      {children}
    </GlassContext.Provider>
  );
}

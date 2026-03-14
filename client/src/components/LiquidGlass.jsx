import React, { useRef, useState, useEffect, useCallback } from 'react'

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
  vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0, 1)).xy;
}`

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
uniform float uCornerRadius; // радиус скругления углов

out vec4 fragColor;

const float PI = 3.14159265359;

mat2 rot(float a) { 
  float c = cos(a), s = sin(a); 
  return mat2(c, -s, s, c); 
}

// Transform UV coordinates to maintain aspect ratio - contain mode (show complete image)
vec2 getAspectCorrectedUV(vec2 uv, out bool isOutOfBounds) {
  float textureAspect = uTextureResolution.x / uTextureResolution.y;
  float screenAspect = uResolution.x / uResolution.y;
  vec2 scale = vec2(1.0);

  if (textureAspect > screenAspect) {
    scale.y = textureAspect / screenAspect;
  } else {
    scale.x = screenAspect / textureAspect;
  }

  vec2 correctedUV = (uv - 0.5) * scale + 0.5;
  isOutOfBounds = correctedUV.x < 0.0 || correctedUV.x > 1.0 || correctedUV.y < 0.0 || correctedUV.y > 1.0;

  return correctedUV;
}

// SDF для квадрата с опциональным скруглением углов
float sdBox(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) - r + min(max(d.x, d.y), 0.0);
}

float getDist(vec2 uv) {
  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 mp = uTMousePos * asp;
  float md = length(vTextureCoord * asp - mp);
  float fall = smoothstep(0.0, 0.8, md);
  
  float sd = sdBox(uv, vec2(uRadius), uCornerRadius);
  
  float tweak = mix(0.02 / fall, 0.1 / fall, uDistort * sd);
  tweak = min(-tweak, 0.0);
  return sd - tweak;
}

// Shadow
float getShadow(vec2 uv, vec2 lightPos) {
  vec2 shadowOffset = vec2(uShadowOffsetX, uShadowOffsetY);
  vec2 shadowPos = uv - lightPos + shadowOffset;
  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 st = shadowPos * asp;
  st *= 1.0 / (0.4920 + 0.2);
  st = rot(-uRotSpeed * 2.0 * PI) * st;

  float shadowDist = getDist(st);
  float shadow = 1.0 - smoothstep(-uShadowBlur, uShadowBlur, shadowDist);
  float distanceFromLight = length(uv - lightPos);
  float attenuation = 1.0 - smoothstep(0.0, 1.0, distanceFromLight);

  return shadow * uShadowIntensity * attenuation;
}

// Highlight
float getHighlight(vec2 uv, vec2 lightPos) {
  vec2 highlightOffset = vec2(uHighlightOffsetX, uHighlightOffsetY);
  vec2 highlightPos = uv - lightPos + highlightOffset;
  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 st = highlightPos * asp;
  st *= 1.0 / (0.4920 + 0.2);
  st = rot(-uRotSpeed * 2.0 * PI) * st;

  float highlightRadius = uRadius * uHighlightSize;
  float highlightDist = sdBox(st, vec2(highlightRadius), uCornerRadius);
  float highlight = 1.0 - smoothstep(-0.02, 0.02, highlightDist);

  float centerDist = length(st);
  float centerFalloff = 1.0 - smoothstep(0.0, highlightRadius * 0.8, centerDist);
  highlight *= centerFalloff;

  float distanceFromLight = length(uv - lightPos);
  float attenuation = 1.0 - smoothstep(0.0, 1.0, distanceFromLight);

  return highlight * uHighlightIntensity * attenuation;
}

// Refraction + chromatic aberration
vec4 refrakt(float sd, vec2 st, vec4 bg, vec2 originalUV) {
  vec2 offset = mix(vec2(0), normalize(st) / sd, length(st));
  float disp = uDispersion * 0.01;

  vec2 redOffset = offset * disp * 1.2;
  vec2 greenOffset = offset * disp * 1.0;
  vec2 blueOffset = offset * disp * 0.8;

  bool isOutOfBoundsR, isOutOfBoundsG, isOutOfBoundsB;

  vec2 redUV = originalUV + redOffset;
  vec2 greenUV = originalUV + greenOffset;
  vec2 blueUV = originalUV + blueOffset;

  vec2 aspectCorrectedRedUV = getAspectCorrectedUV(redUV, isOutOfBoundsR);
  vec2 aspectCorrectedGreenUV = getAspectCorrectedUV(greenUV, isOutOfBoundsG);
  vec2 aspectCorrectedBlueUV = getAspectCorrectedUV(blueUV, isOutOfBoundsB);

  float r = isOutOfBoundsR ? 0.8 : texture(uTexture, aspectCorrectedRedUV).r;
  float g = isOutOfBoundsG ? 0.8 : texture(uTexture, aspectCorrectedGreenUV).g;
  float b = isOutOfBoundsB ? 0.8 : texture(uTexture, aspectCorrectedBlueUV).b;

  vec2 avgUV = originalUV + offset * disp;
  float shadow = getShadow(avgUV, uMousePos);

  vec4 refractedColor = vec4(r, g, b, 1.0);
  refractedColor.rgb = mix(refractedColor.rgb, vec3(0.0), shadow);

  float op = smoothstep(0.0, 0.0025, -sd);
  return mix(bg, refractedColor, op);
}

// Anti-aliased effect
vec4 getEffect(vec2 st, vec4 bg, vec2 originalUV) {
  float eps = 0.0005;
  vec4 sum = vec4(0.0);
  sum += refrakt(getDist(st), st, bg, originalUV);
  sum += refrakt(getDist(st + vec2(eps, 0)), st + vec2(eps, 0), bg, originalUV);
  sum += refrakt(getDist(st - vec2(eps, 0)), st - vec2(eps, 0), bg, originalUV);
  sum += refrakt(getDist(st + vec2(0, eps)), st + vec2(0, eps), bg, originalUV);
  sum += refrakt(getDist(st - vec2(0, eps)), st - vec2(0, eps), bg, originalUV);
  return sum * 0.2;
}

void main() {
  vec2 uv = vTextureCoord;
  bool isOutOfBounds;
  vec2 aspectCorrectedUV = getAspectCorrectedUV(uv, isOutOfBounds);

  vec4 bg = isOutOfBounds ? vec4(0.8, 0.8, 0.8, 1.0) : texture(uTexture, aspectCorrectedUV);

  float shadow = getShadow(uv, uMousePos);
  bg.rgb = mix(bg.rgb, vec3(0.0), shadow);

  vec2 st = uv - uMousePos;
  st *= vec2(uResolution.x / uResolution.y, 1.0);
  st *= 1.0 / (0.4920 + 0.2);
  st = rot(-uRotSpeed * 2.0 * PI) * st;

  vec4 color = getEffect(st, bg, uv);

  float highlight = getHighlight(uv, uMousePos);
  float exposure = 1.0 + highlight * 2.5;
  vec3 exposedColor = 1.0 - exp(-color.rgb * exposure);
  vec3 brightenedColor = color.rgb * (1.0 + highlight * 1.8);
  color.rgb = mix(exposedColor, brightenedColor, 0.3);

  vec3 warmTint = vec3(1.02, 1.01, 0.98);
  color.rgb *= mix(vec3(1.0), warmTint, highlight * 0.3);

  vec4 m = texture(uMaskTexture, uv);
  fragColor = color * (m.a * m.a);
}`
import {
  compileShader,
  createProgram,
  createTexture,
  createGradientCanvas,
  createMaskCanvas,
  resizeCanvas,
  loadDefaultBackgroundImage
} from './utils/webgl.js'

export default function LiquidGlass() {
  const canvasRef = useRef(null)

  // WebGL refs (не реактивные — не влияют на рендер)
  const glRef = useRef(null)
  const programRef = useRef(null)
  const uniformsRef = useRef({})
  const vaoRef = useRef(null)
  const animationIdRef = useRef(null)
  const textureResolutionRef = useRef({ width: 512, height: 512 })

  // Smooth mouse position
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  // Actual mouse position
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })
  const smoothing = 0.05

  const [params, setParams] = useState({
    radius: 0.3,
    distort: 2.3,
    dispersion: 0.7,
    rotSpeed: 1.0,
    shadowIntensity: 0.3,
    shadowOffsetX: 0.01,
    shadowOffsetY: 0.08,
    shadowBlur: 0.4,
    highlightIntensity: 0.4,
    highlightSize: 1.25,
    highlightOffsetX: 0.01,
    highlightOffsetY: 0.03
  })

  // Keep params accessible in render loop without re-creating it
  const paramsRef = useRef(params)
  useEffect(() => {
    paramsRef.current = params
  }, [params])

  function setupGeometry(gl, program) {
    const quad = new Float32Array([
      -1, -1, 0, 0, 0,
       1, -1, 0, 1, 0,
      -1,  1, 0, 0, 1,
       1,  1, 0, 1, 1
    ])

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'aVertexPosition')
    const uvLoc = gl.getAttribLocation(program, 'aTextureCoord')

    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 5 * 4, 0)

    gl.enableVertexAttribArray(uvLoc)
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 5 * 4, 3 * 4)

    return vao
  }

  async function setupTextures(gl) {
    try {
      const bgImage = await loadDefaultBackgroundImage()
      createTexture(gl, 0, bgImage)
      textureResolutionRef.current.width = bgImage.width || 512
      textureResolutionRef.current.height = bgImage.height || 512
    } catch (error) {
      console.error('Error loading default background:', error)
      const bgCanvas = createGradientCanvas()
      createTexture(gl, 0, bgCanvas)
    }

    const maskCanvas = createMaskCanvas()
    createTexture(gl, 1, maskCanvas)
  }

  const handleResize = useCallback(() => {
    if (!glRef.current || !canvasRef.current) return
    resizeCanvas(canvasRef.current, glRef.current)
  }, [])

  const handleMouseMove = useCallback((event) => {
    targetMouseRef.current.x = event.clientX / window.innerWidth
    targetMouseRef.current.y = 1 - event.clientY / window.innerHeight
  }, [])

  function handleBackgroundUpload(file) {
    if (!file) return
    const img = new Image()
    img.onload = () => {
      textureResolutionRef.current.width = img.width
      textureResolutionRef.current.height = img.height
      createTexture(glRef.current, 0, img)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  function updateUniforms(gl, uniforms, p) {
    if (!gl || !programRef.current) return
    gl.uniform1f(uniforms.uRadius, p.radius)
    gl.uniform1f(uniforms.uDistort, p.distort)
    gl.uniform1f(uniforms.uDispersion, p.dispersion)
    gl.uniform1f(uniforms.uRotSpeed, p.rotSpeed)
    gl.uniform1f(uniforms.uShadowIntensity, p.shadowIntensity)
    gl.uniform1f(uniforms.uShadowOffsetX, p.shadowOffsetX)
    gl.uniform1f(uniforms.uShadowOffsetY, p.shadowOffsetY)
    gl.uniform1f(uniforms.uShadowBlur, p.shadowBlur)
    gl.uniform1f(uniforms.uHighlightIntensity, p.highlightIntensity)
    gl.uniform1f(uniforms.uHighlightSize, p.highlightSize)
    gl.uniform1f(uniforms.uHighlightOffsetX, p.highlightOffsetX)
    gl.uniform1f(uniforms.uHighlightOffsetY, p.highlightOffsetY)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }
    glRef.current = gl

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) {
      console.error('Shader compilation failed')
      return
    }

    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) {
      console.error('Program linking failed')
      return
    }
    programRef.current = program
    gl.useProgram(program)

    const uniformNames = [
      'uMVMatrix', 'uPMatrix', 'uTextureMatrix', 'uTexture', 'uMaskTexture',
      'uMousePos', 'uTMousePos', 'uResolution', 'uTextureResolution', 'uRadius', 'uDistort',
      'uDispersion', 'uRotSpeed', 'uShadowIntensity', 'uShadowOffsetX',
      'uShadowOffsetY', 'uShadowBlur', 'uHighlightIntensity', 'uHighlightSize',
      'uHighlightOffsetX', 'uHighlightOffsetY'
    ]
    const uniforms = {}
    uniformNames.forEach(name => {
      uniforms[name] = gl.getUniformLocation(program, name)
    })
    uniformsRef.current = uniforms

    const identityMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    gl.uniformMatrix4fv(uniforms.uMVMatrix, false, identityMatrix)
    gl.uniformMatrix4fv(uniforms.uPMatrix, false, identityMatrix)
    gl.uniformMatrix4fv(uniforms.uTextureMatrix, false, identityMatrix)
    gl.uniform1i(uniforms.uTexture, 0)
    gl.uniform1i(uniforms.uMaskTexture, 1)

    vaoRef.current = setupGeometry(gl, program)
    setupTextures(gl)
    resizeCanvas(canvas, gl)

    function render() {
      if (!glRef.current || !programRef.current) return

      const mouse = mouseRef.current
      const target = targetMouseRef.current
      mouse.x += (target.x - mouse.x) * smoothing
      mouse.y += (target.y - mouse.y) * smoothing

      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform2fv(uniformsRef.current.uResolution, [canvas.width, canvas.height])
      gl.uniform2fv(uniformsRef.current.uTextureResolution, [
        textureResolutionRef.current.width,
        textureResolutionRef.current.height
      ])
      gl.uniform2fv(uniformsRef.current.uMousePos, [mouse.x, mouse.y])
      gl.uniform2fv(uniformsRef.current.uTMousePos, [target.x, target.y])

      updateUniforms(gl, uniformsRef.current, paramsRef.current)

      gl.bindVertexArray(vaoRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationIdRef.current = requestAnimationFrame(render)
    }

    render()

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleResize, handleMouseMove])

  function handleParamUpdate(key, value) {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: 'none', width: '100%', height: '100%' }}
      />

    </div>
  )
}

const styles = {
  githubLink: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 1000,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    padding: 12,
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
type Vec2 = { x: number; y: number }

type RenderParams = {
  containerSizePx: Vec2
  capsuleTopLeftPx: Vec2
  capsuleSizePx: Vec2
  dpr: number
  blurRadiusPx?: number
  edgeMapStartPx?: number
  edgeMapMaxPx?: number
  borderRadiusPx?: number
}

import VERT from './shaders/liquidGlass.vert.glsl?raw'
import BLUR_H_FRAG from './shaders/liquidGlassBlur.frag.glsl?raw'
import BLUR_V_FRAG from './shaders/liquidGlassBlurV.frag.glsl?raw'
import COMPOSE_FRAG from './shaders/liquidGlassCompose.frag.glsl?raw'

export type LiquidGlassRenderer = {
  setImage: (img: CanvasImageSource) => void
  resize: (widthCssPx: number, heightCssPx: number, dpr: number) => void
  render: (params: RenderParams) => void
  dispose: () => void
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'Unknown shader compile error'
    gl.deleteShader(shader)
    throw new Error(log)
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)

  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create program')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'a_pos')
  gl.linkProgram(program)

  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || 'Unknown program link error'
    gl.deleteProgram(program)
    throw new Error(log)
  }
  return program
}

const KERNEL_MAX_RADIUS = 64

function buildGaussianKernel(radiusPx: number) {
  const r = Math.max(0, radiusPx)
  const radius = Math.min(KERNEL_MAX_RADIUS, Math.max(1, Math.floor(r) + 1))
  const sigma = Math.max(r * 0.5, 0.001)

  const kernel = new Float32Array(KERNEL_MAX_RADIUS)
  let sum = 0

  for (let i = 0; i < radius; i++) {
    const x = i
    const w = Math.exp(-(x * x) / (2 * sigma * sigma))
    kernel[i] = w
    sum += i === 0 ? w : 2 * w
  }

  if (sum > 0) {
    for (let i = 0; i < radius; i++) kernel[i] /= sum
  }

  return { radius, kernel }
}

export function createLiquidGlassRenderer(canvas: HTMLCanvasElement): LiquidGlassRenderer {
  const glMaybe = canvas.getContext('webgl', {
    alpha: false,
    premultipliedAlpha: false,
    antialias: true,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  })
  if (!glMaybe) throw new Error('WebGL not supported')
  const gl = glMaybe

  const blurProgramH = createProgram(gl, VERT, BLUR_H_FRAG)
  const blurProgramV = createProgram(gl, VERT, BLUR_V_FRAG)
  const composeProgram = createProgram(gl, VERT, COMPOSE_FRAG)

  const aPos = 0

  const uImage = gl.getUniformLocation(blurProgramH, 'u_image')
  const uBlurCanvasSize = gl.getUniformLocation(blurProgramH, 'u_canvasSize')
  const uBlurCapsuleTopLeft = gl.getUniformLocation(blurProgramH, 'u_capsuleTopLeft')
  const uBlurImageOffset = gl.getUniformLocation(blurProgramH, 'u_imageOffset')
  const uBlurImageDrawSize = gl.getUniformLocation(blurProgramH, 'u_imageDrawSize')
  const uBlurDirPxH = gl.getUniformLocation(blurProgramH, 'u_directionPx')
  const uBlurRadiusH = gl.getUniformLocation(blurProgramH, 'u_radius')
  const uBlurKernelH = gl.getUniformLocation(blurProgramH, 'u_kernel[0]')

  if (
    !uImage ||
    !uBlurCanvasSize ||
    !uBlurCapsuleTopLeft ||
    !uBlurImageOffset ||
    !uBlurImageDrawSize ||
    !uBlurDirPxH ||
    !uBlurRadiusH ||
    !uBlurKernelH
  ) {
    throw new Error('Failed to locate blur (H) uniforms')
  }

  const uTempTex = gl.getUniformLocation(blurProgramV, 'u_tex')
  const uBlurCanvasSizeV = gl.getUniformLocation(blurProgramV, 'u_canvasSize')
  const uBlurDirPxV = gl.getUniformLocation(blurProgramV, 'u_directionPx')
  const uBlurRadiusV = gl.getUniformLocation(blurProgramV, 'u_radius')
  const uBlurKernelV = gl.getUniformLocation(blurProgramV, 'u_kernel[0]')

  if (!uTempTex || !uBlurCanvasSizeV || !uBlurDirPxV || !uBlurRadiusV || !uBlurKernelV) {
    throw new Error('Failed to locate blur (V) uniforms')
  }

  const uBlurTex = gl.getUniformLocation(composeProgram, 'u_blurTex')
  const uComposeCanvasSize = gl.getUniformLocation(composeProgram, 'u_canvasSize')
  const uEdgeMapStartPx = gl.getUniformLocation(composeProgram, 'u_edgeMapStartPx')
  const uEdgeMapMaxPx = gl.getUniformLocation(composeProgram, 'u_edgeMapMaxPx')
  const uBorderRadiusPx = gl.getUniformLocation(composeProgram, 'u_borderRadiusPx')

  if (!uBlurTex || !uComposeCanvasSize || !uEdgeMapStartPx || !uEdgeMapMaxPx || !uBorderRadiusPx) {
    throw new Error('Failed to locate compose uniforms')
  }

  const vbo = gl.createBuffer()
  if (!vbo) throw new Error('Failed to create buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]),
    gl.STATIC_DRAW,
  )

  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const imageTex = gl.createTexture()
  if (!imageTex) throw new Error('Failed to create texture')

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, imageTex)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  )

  const tempTex = gl.createTexture()
  if (!tempTex) throw new Error('Failed to create temp texture')
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, tempTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

  const tempFbo = gl.createFramebuffer()
  if (!tempFbo) throw new Error('Failed to create temp framebuffer')
  gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempTex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  const blurTex = gl.createTexture()
  if (!blurTex) throw new Error('Failed to create blur texture')
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, blurTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  )

  const fbo = gl.createFramebuffer()
  if (!fbo) throw new Error('Failed to create framebuffer')
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, blurTex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  gl.useProgram(blurProgramH)
  gl.uniform1i(uImage, 0)
  gl.useProgram(blurProgramV)
  gl.uniform1i(uTempTex, 2)
  gl.useProgram(composeProgram)
  gl.uniform1i(uBlurTex, 1)

  let lastCanvasW = 0
  let lastCanvasH = 0
  let blurW = 1
  let blurH = 1
  const BLUR_DOWNSCALE = 1.0
  let imageNaturalW = 0
  let imageNaturalH = 0

  function setImage(img: CanvasImageSource) {
    imageNaturalW =
      'naturalWidth' in img ? img.naturalWidth : 'videoWidth' in img ? img.videoWidth : img.width
    imageNaturalH =
      'naturalHeight' in img ? img.naturalHeight : 'videoHeight' in img ? img.videoHeight : img.height

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, imageTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  }

  function resize(widthCssPx: number, heightCssPx: number, dpr: number) {
    const w = Math.max(1, Math.round(widthCssPx * dpr))
    const h = Math.max(1, Math.round(heightCssPx * dpr))
    if (w === lastCanvasW && h === lastCanvasH) return

    lastCanvasW = w
    lastCanvasH = h
    canvas.width = w
    canvas.height = h

    blurW = Math.max(1, Math.round(w * BLUR_DOWNSCALE))
    blurH = Math.max(1, Math.round(h * BLUR_DOWNSCALE))

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, tempTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, blurW, blurH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, blurTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, blurW, blurH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.viewport(0, 0, w, h)
  }

  function render(params: RenderParams) {
    const blurRadiusPx = params.blurRadiusPx ?? 12
    const edgeMapStartPx = params.edgeMapStartPx ?? 24
    const edgeMapMaxPx = params.edgeMapMaxPx ?? 0
    const borderRadiusPx = params.borderRadiusPx ?? 0

    // Match <img style="object-fit: cover"> mapping
    const containerW = params.containerSizePx.x
    const containerH = params.containerSizePx.y

    let drawW = containerW
    let drawH = containerH
    let offsetX = 0
    let offsetY = 0

    if (imageNaturalW > 0 && imageNaturalH > 0 && containerW > 0 && containerH > 0) {
      const scale = Math.max(containerW / imageNaturalW, containerH / imageNaturalH)
      drawW = imageNaturalW * scale
      drawH = imageNaturalH * scale
      offsetX = (containerW - drawW) * 0.5
      offsetY = (containerH - drawH) * 0.5
    }

    const { radius: kernelRadius, kernel } = buildGaussianKernel(blurRadiusPx * params.dpr)

    gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo)
    gl.viewport(0, 0, blurW, blurH)
    gl.disable(gl.BLEND)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(blurProgramH)
    gl.uniform2f(uBlurCanvasSize, canvas.width, canvas.height)
    gl.uniform2f(uBlurCapsuleTopLeft, params.capsuleTopLeftPx.x * params.dpr, params.capsuleTopLeftPx.y * params.dpr)
    gl.uniform2f(uBlurImageOffset, offsetX * params.dpr, offsetY * params.dpr)
    gl.uniform2f(uBlurImageDrawSize, drawW * params.dpr, drawH * params.dpr)
    gl.uniform2f(uBlurDirPxH, 1, 0)
    gl.uniform1i(uBlurRadiusH, kernelRadius)
    gl.uniform1fv(uBlurKernelH, kernel)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, blurW, blurH)
    gl.disable(gl.BLEND)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(blurProgramV)
    gl.uniform2f(uBlurCanvasSizeV, canvas.width, canvas.height)
    gl.uniform2f(uBlurDirPxV, 0, 1)
    gl.uniform1i(uBlurRadiusV, kernelRadius)
    gl.uniform1fv(uBlurKernelV, kernel)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.BLEND)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(composeProgram)
    gl.uniform2f(uComposeCanvasSize, canvas.width, canvas.height)
    gl.uniform1f(uEdgeMapStartPx, edgeMapStartPx * params.dpr)
    gl.uniform1f(uEdgeMapMaxPx, edgeMapMaxPx * params.dpr)
    gl.uniform1f(uBorderRadiusPx, Math.max(0, borderRadiusPx) * params.dpr)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  function dispose() {
    gl.deleteTexture(imageTex)
    gl.deleteTexture(tempTex)
    gl.deleteTexture(blurTex)
    gl.deleteFramebuffer(tempFbo)
    gl.deleteFramebuffer(fbo)
    gl.deleteBuffer(vbo)
    gl.deleteProgram(blurProgramH)
    gl.deleteProgram(blurProgramV)
    gl.deleteProgram(composeProgram)
  }

  return { setImage, resize, render, dispose }
}

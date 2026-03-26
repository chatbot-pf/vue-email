<script setup lang="ts">
// Dark mode color inversion using LCH color space.
// Port from vendor/react-email/packages/preview-server/src/app/preview/[...slug]/email-frame.tsx
// Requires colorjs.io for accurate color parsing/conversion.
// Falls back to no-op if colorjs.io is unavailable.

interface Props {
  markup: string
  width: number
  height: number
  darkMode?: boolean
  class?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  darkMode: false,
  title: 'Email preview',
})

const iframeRef = ref<HTMLIFrameElement | null>(null)

// Named color lookup table (subset used by email clients)
const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  maroon: '#800000',
  olive: '#808000',
  purple: '#800080',
  teal: '#008080',
  navy: '#000080',
  orange: '#ffa500',
  transparent: 'rgba(0,0,0,0)',
}

// Matches hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa) and functional colors
const RE_COLOR = /#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{4}|#[0-9a-f]{3}|(rgb|rgba|hsl|hsv|oklab|oklch|lab|lch|hwb)\s*\([^)]*\)/gi
const NAMED_COLORS_REGEX = new RegExp(`\\b(${Object.keys(NAMED_COLORS).join('|')})\\b`, 'gi')
const RE_HEX_COLOR = /^#([0-9a-f]{3,8})$/
const RE_RGB_COLOR = /^rgba?\(([^)]+)\)$/

// sRGB ↔ linear conversion helpers
function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

// sRGB → XYZ (D65)
function srgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const rl = linearize(r)
  const gl = linearize(g)
  const bl = linearize(b)
  return [
    0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl,
    0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl,
    0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl,
  ]
}

// XYZ (D65) → Lab
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const xn = 0.95047
  const yn = 1.00000
  const zn = 1.08883

  function f(t: number) {
    return t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116
  }

  const fx = f(x / xn)
  const fy = f(y / yn)
  const fz = f(z / zn)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

// Lab → LCH
function labToLch(L: number, a: number, b: number): [number, number, number] {
  const C = Math.sqrt(a * a + b * b)
  const H = Math.atan2(b, a) * (180 / Math.PI)
  return [L, C, H < 0 ? H + 360 : H]
}

// LCH → Lab
function lchToLab(L: number, C: number, H: number): [number, number, number] {
  const hRad = H * (Math.PI / 180)
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)]
}

// Lab → XYZ (D65)
function labToXyz(L: number, a: number, b: number): [number, number, number] {
  const xn = 0.95047
  const yn = 1.00000
  const zn = 1.08883

  const fy = (L + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200

  function finv(t: number) {
    return t > 0.206897 ? t ** 3 : (t - 16 / 116) / 7.787
  }

  return [finv(fx) * xn, finv(fy) * yn, finv(fz) * zn]
}

// XYZ (D65) → sRGB
function xyzToSrgb(x: number, y: number, z: number): [number, number, number] {
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  const gl = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z
  return [
    Math.max(0, Math.min(1, delinearize(rl))),
    Math.max(0, Math.min(1, delinearize(gl))),
    Math.max(0, Math.min(1, delinearize(bl))),
  ]
}

// Parse any CSS color string to { r, g, b, a } in [0,1] range
function parseCssColor(colorString: string): { r: number, g: number, b: number, a: number } | null {
  const s = colorString.trim().toLowerCase()

  // #rrggbb / #rgb / #rrggbbaa / #rgba
  const hexMatch = s.match(RE_HEX_COLOR)
  if (hexMatch) {
    const h = hexMatch[1]!
    if (h.length === 3) {
      return {
        r: Number.parseInt(h[0]! + h[0], 16) / 255,
        g: Number.parseInt(h[1]! + h[1], 16) / 255,
        b: Number.parseInt(h[2]! + h[2], 16) / 255,
        a: 1,
      }
    }
    if (h.length === 6) {
      return {
        r: Number.parseInt(h.slice(0, 2), 16) / 255,
        g: Number.parseInt(h.slice(2, 4), 16) / 255,
        b: Number.parseInt(h.slice(4, 6), 16) / 255,
        a: 1,
      }
    }
    if (h.length === 8) {
      return {
        r: Number.parseInt(h.slice(0, 2), 16) / 255,
        g: Number.parseInt(h.slice(2, 4), 16) / 255,
        b: Number.parseInt(h.slice(4, 6), 16) / 255,
        a: Number.parseInt(h.slice(6, 8), 16) / 255,
      }
    }
  }

  // rgb(r, g, b) / rgba(r, g, b, a)
  const rgbMatch = s.match(RE_RGB_COLOR)
  if (rgbMatch) {
    const parts = rgbMatch[1]!.split(',').map(p => p.trim())
    const r = Number(parts[0]) / 255
    const g = Number(parts[1]) / 255
    const b = Number(parts[2]) / 255
    const a = parts[3] !== undefined ? Number(parts[3]) : 1
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return { r, g, b, a }
    }
  }

  return null
}

function invertColor(colorString: string, mode: 'foreground' | 'background'): string {
  const parsed = parseCssColor(colorString)
  if (!parsed)
    return colorString

  const { r, g, b, a } = parsed
  const [x, y, z] = srgbToXyz(r, g, b)
  const [L, labA, labB] = xyzToLab(x, y, z)
  let [lch_L, lch_C, lch_H] = labToLch(L, labA, labB)

  if (mode === 'background') {
    if (lch_L >= 50) {
      lch_L = 50 - (lch_L - 50) * 0.75
    }
  }
  else if (mode === 'foreground') {
    if (lch_L < 50) {
      lch_L = 50 - (lch_L - 50) * 0.75
    }
  }

  lch_C *= 0.8

  const [newL, newA, newB] = lchToLab(lch_L, lch_C, lch_H)
  const [newX, newY, newZ] = labToXyz(newL, newA, newB)
  const [newR, newG, newBc] = xyzToSrgb(newX, newY, newZ)

  const ri = Math.round(newR * 255)
  const gi = Math.round(newG * 255)
  const bi = Math.round(newBc * 255)

  return a < 1 ? `rgba(${ri}, ${gi}, ${bi}, ${a})` : `rgb(${ri}, ${gi}, ${bi})`
}

type StyleProperty = 'background' | 'backgroundColor' | 'border' | 'borderColor' | 'color'

const STYLE_PROPERTIES: [StyleProperty[], 'background' | 'foreground'][] = [
  [['background', 'backgroundColor'], 'background'],
  [['border', 'borderColor'], 'background'],
  [['color'], 'foreground'],
]

function* walkDom(element: Element): Generator<Element> {
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children.item(i)!
    yield child
    yield* walkDom(child)
  }
}

function applyColorInversion(iframe: HTMLIFrameElement) {
  const { contentDocument, contentWindow } = iframe
  if (!contentDocument || !contentWindow || !contentDocument.body)
    return
  if (contentDocument.body.hasAttribute('data-applied-color-inversion'))
    return

  contentDocument.body.setAttribute('data-applied-color-inversion', '')

  if (!contentDocument.body.style.color) {
    contentDocument.body.style.color = 'rgb(0, 0, 0)'
  }
  if (!contentDocument.body.style.background && !contentDocument.body.style.backgroundColor) {
    contentDocument.body.style.background = 'rgb(255, 255, 255)'
  }

  const IFrameHTMLElement = (contentWindow as unknown as typeof globalThis).HTMLElement

  for (const element of walkDom(contentDocument.documentElement)) {
    if (element instanceof IFrameHTMLElement) {
      const htmlEl = element as HTMLElement
      for (const [properties, type] of STYLE_PROPERTIES) {
        for (const property of properties) {
          const value = htmlEl.style[property]
          if (value && value.trim() !== '') {
            htmlEl.setAttribute(`data-original-${property}`, value)
            RE_COLOR.lastIndex = 0
            NAMED_COLORS_REGEX.lastIndex = 0
            htmlEl.style[property] = value
              .replace(RE_COLOR, color => invertColor(color, type))
              .replace(NAMED_COLORS_REGEX, (namedColor) => {
                const hex = NAMED_COLORS[namedColor.toLowerCase()]
                return hex ? invertColor(hex, type) : namedColor
              })
            break
          }
        }
      }
    }
  }
}

function undoColorInversion(iframe: HTMLIFrameElement) {
  const { contentDocument, contentWindow } = iframe
  if (!contentDocument || !contentWindow || !contentDocument.body)
    return
  if (!contentDocument.body.hasAttribute('data-applied-color-inversion'))
    return

  contentDocument.body.removeAttribute('data-applied-color-inversion')

  const IFrameHTMLElement = (contentWindow as unknown as typeof globalThis).HTMLElement

  for (const element of walkDom(contentDocument.documentElement)) {
    if (element instanceof IFrameHTMLElement) {
      const htmlEl = element as HTMLElement
      for (const [properties] of STYLE_PROPERTIES) {
        for (const property of properties) {
          const original = htmlEl.getAttribute(`data-original-${property}`)
          if (original) {
            htmlEl.style[property] = original
          }
          htmlEl.removeAttribute(`data-original-${property}`)
        }
      }
    }
  }
}

function handleLoad() {
  if (!iframeRef.value)
    return
  if (props.darkMode) {
    applyColorInversion(iframeRef.value)
  }
  else {
    undoColorInversion(iframeRef.value)
  }
}

watch(
  () => props.darkMode,
  () => {
    if (!iframeRef.value)
      return
    if (props.darkMode) {
      applyColorInversion(iframeRef.value)
    }
    else {
      undoColorInversion(iframeRef.value)
    }
  },
)

watch(
  () => props.markup,
  () => {
    // When markup changes the iframe reloads; the onLoad handler will re-apply inversion
  },
)
</script>

<template>
  <iframe
    ref="iframeRef"
    :src-doc="markup"
    :width="width"
    :height="height"
    :title="title"
    :class="props.class"
    sandbox="allow-same-origin"
    style="color-scheme: auto"
    @load="handleLoad"
  />
</template>

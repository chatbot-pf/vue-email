import type { CssNode, StyleSheet } from 'css-tree'
import type { TailwindConfig } from './presets'
import { generate, List } from 'css-tree'
import { sanitizeClassName } from './compatibility/sanitize-class-name'
import { extractRulesPerClass } from './css/extract-rules-per-class'
import { getCustomProperties } from './css/get-custom-properties'
import { makeInlineStylesFor } from './css/make-inline-styles-for'
import { sanitizeNonInlinableRules } from './css/sanitize-non-inlinable-rules'
import { sanitizeStyleSheet } from './sanitize-stylesheet'
import { setupTailwind } from './tailwindcss/setup-tailwind'

const CLASS_ATTR_REGEX = /class="([^"]*)"/g
const CAMEL_CASE_REGEX = /[A-Z]/g
const TRAILING_SEMICOLON_REGEX = /;$/
const WHITESPACE_SPLIT_REGEX = /\s+/
const CLASS_ATTR_IN_TAG_REGEX = /\sclass="[^"]*"/
const STYLE_ATTR_IN_TAG_REGEX = /\sstyle="([^"]*)"/
const HEAD_CLOSE_REGEX = /<\/head>/i
const TAG_NAME_BOUNDARY_REGEX = /[\s>]/

/**
 * Convert a camelCase CSS property to kebab-case for use in HTML style attributes.
 */
function toKebabCase(prop: string): string {
  // CSS custom properties (--foo-bar) stay as-is
  if (prop.startsWith('--')) {
    return prop
  }
  return prop.replace(CAMEL_CASE_REGEX, m => `-${m.toLowerCase()}`)
}

/**
 * Convert an inline styles object to a CSS string suitable for the style attribute.
 * Merges new Tailwind styles BEFORE existing styles so existing styles take precedence.
 */
function mergeStyles(newStyles: Record<string, string>, existingStyle: string): string {
  const parts: string[] = []

  for (const [prop, value] of Object.entries(newStyles)) {
    parts.push(`${toKebabCase(prop)}: ${value}`)
  }

  if (existingStyle) {
    // normalize: remove trailing semicolon from existing styles
    const normalized = existingStyle.trim().replace(TRAILING_SEMICOLON_REGEX, '')
    if (normalized) {
      parts.push(normalized)
    }
  }

  return parts.join('; ')
}

/**
 * Given the full HTML string and a position of a class="..." match,
 * find the start of the enclosing opening tag (i.e., the '<' before the tag name).
 */
function findTagStart(html: string, classAttrPos: number): number {
  for (let i = classAttrPos - 1; i >= 0; i--) {
    if (html[i] === '<') {
      return i
    }
    if (html[i] === '>') {
      break
    }
  }
  return -1
}

/**
 * Find the end of an opening tag (the closing '>') starting from tagStart.
 * Handles quoted attribute values to avoid confusion with '>' inside attributes.
 */
function findTagEnd(html: string, tagStart: number): number {
  let inQuote = false
  let quoteChar = ''
  for (let i = tagStart + 1; i < html.length; i++) {
    const ch = html[i]
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false
      }
    }
    else if (ch === '"' || ch === '\'') {
      inQuote = true
      quoteChar = ch
    }
    else if (ch === '>') {
      return i
    }
  }
  return -1
}

/**
 * Process a single opening tag's attributes string to inline Tailwind styles.
 * Returns the updated tag string.
 */
function processTag(
  tagName: string,
  attrs: string,
  classValue: string,
  inlinableRules: Map<string, ReturnType<typeof inlinableRules.get> extends infer T ? NonNullable<T> : never>,
  nonInlinableRules: Map<string, unknown>,
  customProperties: ReturnType<typeof getCustomProperties>,
): string {
  const classes = classValue.trim().split(WHITESPACE_SPLIT_REGEX).filter(Boolean)

  const rules = classes
    .map(cls => inlinableRules.get(cls))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)

  const inlineStyles = makeInlineStylesFor(rules, customProperties)

  // Compute residual classes (non-inlined)
  const residualClasses: string[] = []
  for (const cls of classes) {
    if (nonInlinableRules.has(cls)) {
      // Keep it as sanitized class name for the injected style block
      residualClasses.push(sanitizeClassName(cls))
    }
    else if (!inlinableRules.has(cls)) {
      // Not processed at all — keep original class name
      residualClasses.push(cls)
    }
  }

  // Remove class attribute from attrs
  let newAttrs = attrs.replace(CLASS_ATTR_IN_TAG_REGEX, '')

  // Handle existing style attribute
  const existingStyleMatch = newAttrs.match(STYLE_ATTR_IN_TAG_REGEX)
  const existingStyle = existingStyleMatch ? existingStyleMatch[1] : ''
  if (existingStyleMatch) {
    newAttrs = newAttrs.replace(STYLE_ATTR_IN_TAG_REGEX, '')
  }

  const mergedStyle = mergeStyles(inlineStyles, existingStyle)

  let newTag = `<${tagName}`
  if (mergedStyle) {
    newTag += ` style="${mergedStyle}"`
  }
  if (residualClasses.length > 0) {
    newTag += ` class="${residualClasses.join(' ')}"`
  }
  newTag += `${newAttrs}>`

  return newTag
}

/**
 * Main HTML post-processing function that replaces Tailwind utility classes
 * with inline styles and injects non-inlinable rules as a <style> block in <head>.
 */
export async function inlineTailwind(
  html: string,
  config: TailwindConfig = {},
): Promise<string> {
  // Step 1: Extract all unique class names from the HTML
  const allClasses = new Set<string>()
  const classMatches = [...html.matchAll(CLASS_ATTR_REGEX)]

  if (classMatches.length === 0) {
    return html
  }

  for (const match of classMatches) {
    const classes = match[1].trim().split(WHITESPACE_SPLIT_REGEX)
    for (const cls of classes) {
      if (cls) {
        allClasses.add(cls)
      }
    }
  }

  const classesUsed = Array.from(allClasses)

  // Step 2: Setup Tailwind and build CSS for used classes
  const tailwindSetup = await setupTailwind(config)
  tailwindSetup.addUtilities(classesUsed)

  // Step 3: Get and sanitize the stylesheet
  const styleSheet = tailwindSetup.getStyleSheet()
  sanitizeStyleSheet(styleSheet)

  // Step 4: Extract rules per class
  const { inlinable: inlinableRules, nonInlinable: nonInlinableRules } = extractRulesPerClass(
    styleSheet,
    classesUsed,
  )

  // Step 5: Get custom properties for variable resolution
  const customProperties = getCustomProperties(styleSheet)

  // Step 6: Prepare non-inlinable styles for injection
  const hasNonInlineStylesToApply = nonInlinableRules.size > 0
  let nonInlineStylesCss = ''

  if (hasNonInlineStylesToApply) {
    const nonInlineStyles: StyleSheet = {
      type: 'StyleSheet',
      children: new List<CssNode>().fromArray(Array.from(nonInlinableRules.values())),
    }
    sanitizeNonInlinableRules(nonInlineStyles)
    nonInlineStylesCss = generate(nonInlineStyles)
  }

  // Step 7: Replace class attributes with inline styles
  // Process by finding each class="..." occurrence, then locating its enclosing tag
  // Build result by concatenating unmodified segments and processed tags
  const segments: string[] = []
  let lastEnd = 0

  // Reset regex to start from beginning
  CLASS_ATTR_REGEX.lastIndex = 0

  const allClassMatches = [...html.matchAll(CLASS_ATTR_REGEX)]

  for (const match of allClassMatches) {
    const classAttrStart = match.index
    const classValue = match[1]

    // Find the enclosing opening tag boundaries
    const tagStart = findTagStart(html, classAttrStart)
    if (tagStart === -1) {
      continue
    }
    const tagEnd = findTagEnd(html, tagStart)
    if (tagEnd === -1) {
      continue
    }

    // If this tag was already processed (tagStart < lastEnd), skip
    if (tagStart < lastEnd) {
      continue
    }

    // Extract the full tag string
    const fullTag = html.slice(tagStart, tagEnd + 1)
    // Extract tag name and attrs (everything between tagname and >)
    const tagNameEnd = fullTag.search(TAG_NAME_BOUNDARY_REGEX)
    if (tagNameEnd === -1) {
      continue
    }
    const tagName = fullTag.slice(1, tagNameEnd)
    const attrs = fullTag.slice(tagNameEnd, -1)

    // Append the HTML before this tag
    segments.push(html.slice(lastEnd, tagStart))

    // Process and append the transformed tag
    segments.push(
      processTag(tagName, attrs, classValue, inlinableRules, nonInlinableRules, customProperties),
    )

    lastEnd = tagEnd + 1
  }

  // Append the remaining HTML after the last processed tag
  segments.push(html.slice(lastEnd))
  let result = segments.join('')

  // Step 8: Inject non-inlinable styles into <head>
  if (hasNonInlineStylesToApply) {
    if (!HEAD_CLOSE_REGEX.test(result)) {
      throw new Error(
        `You are trying to use Tailwind classes that cannot be inlined: ${Array.from(nonInlinableRules.keys()).join(' ')}.
For the media queries to work properly on rendering, they need to be added into a <style> tag inside of a <head> tag,
but no <head> element was found.

Make sure that you have a <head> element in your HTML.`,
      )
    }

    const styleBlock = `<style>${nonInlineStylesCss}</style>`
    result = result.replace(HEAD_CLOSE_REGEX, `${styleBlock}</head>`)
  }

  return result
}

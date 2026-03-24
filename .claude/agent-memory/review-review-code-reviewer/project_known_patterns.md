---
name: vue-email known code patterns and issues
description: Recurring patterns, known logic issues, and architectural decisions found in the initial PR review
type: project
---

## Shorthand-before-explicit CSS property ordering bug

Both `parsePadding` (e-button/utils.ts) and `computeMargins` (e-text/e-text.tsx) use `for...of Object.entries()` to iterate combined shorthand + explicit CSS properties. When a shorthand key (e.g., `padding`, `margin`) appears AFTER explicit keys (e.g., `paddingRight`, `marginTop`) in the object, the shorthand destructuring overwrites the explicit values. This is a property-insertion-order-dependent bug.

Fix pattern: two-pass approach — first read shorthand, then read explicit overrides.

**Why flagged:** The test suite locks in the "correct order" (shorthand first) but real caller code may produce the opposite order.

## CSSProperties casting pattern

All components use `type: Object as unknown as () => CSSProperties` for Vue prop type declarations when the native Vue `PropType` doesn't map cleanly to complex TypeScript types. This is the established pattern — do not flag as unusual.

## EFont CSS interpolation

`fontFamily`, `fallbackFontFamily`, `fontStyle`, `fontWeight` are interpolated directly into a `<style innerHTML>` string. No sanitization. Low risk in email generation context but the vector exists.

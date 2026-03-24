# Vendor Port Phase 3 — Tailwind CSS Integration

> Track: vendor-port-tailwind-20260324

## Overview

Port React Email's Tailwind CSS integration to Vue 3. Converts Tailwind utility classes used in email components into inline styles (and non-inlinable styles into `<style>` tags in `<head>`) for cross-client email compatibility.

Unlike React Email's VNode tree traversal approach (`mapReactTree` + `cloneElement`), this implementation uses **post-render HTML processing** — parsing the rendered HTML string, collecting classes, running the Tailwind CSS compiler, and inlining/injecting the resulting styles. This integrates naturally with the existing `render()` utility.

## Requirements

### Functional Requirements

- [ ] FR-1: `inlineTailwind(html, config?)` standalone function — accepts an HTML string and optional Tailwind config, returns HTML with Tailwind classes resolved to inline styles
- [ ] FR-2: `render(component, { tailwind: { config } })` option — integrates Tailwind processing into the existing render pipeline
- [ ] FR-3: Inlinable utilities (colors, spacing, typography, borders, etc.) are converted to inline `style` attributes on matching elements
- [ ] FR-4: Non-inlinable rules (media queries, pseudo-classes, dark mode) are injected as a `<style>` block inside `<head>`
- [ ] FR-5: If non-inlinable rules exist but no `<head>` element is found, throw a descriptive error (matching React Email behavior)
- [ ] FR-6: `pixelBasedPreset` config exported — converts rem-based Tailwind defaults to px values for email client compatibility
- [ ] FR-7: Custom Tailwind config support via `TailwindConfig` type (omits `content` from standard Config)
- [ ] FR-8: CSS variable resolution — resolves `var()` references in generated CSS before inlining
- [ ] FR-9: `calc()` expression resolution — evaluates calc expressions to static values
- [ ] FR-10: Class name sanitization — handles escaped/special characters in Tailwind class names

### Non-functional Requirements

- [ ] NFR-1: `tailwindcss` and `css-tree` are external dependencies (not bundled)
- [ ] NFR-2: TypeScript strict mode — no type errors
- [ ] NFR-3: >80% code coverage
- [ ] NFR-4: ESLint passes with @antfu/eslint-config

## Acceptance Criteria

- [ ] AC-1: `inlineTailwind('<div class="bg-blue-500 text-white p-4">Hello</div>')` returns HTML with correct inline styles
- [ ] AC-2: `render(EmailComponent, { tailwind: { config } })` produces HTML with Tailwind classes resolved
- [ ] AC-3: Responsive utilities (e.g., `md:text-lg`) produce `<style>` block with media queries in `<head>`
- [ ] AC-4: Dark mode classes (e.g., `dark:bg-gray-800`) produce appropriate media query styles
- [ ] AC-5: `pixelBasedPreset` converts rem spacing/font-sizes to px values
- [ ] AC-6: Snapshot tests pass for all Tailwind transformation scenarios
- [ ] AC-7: Error thrown when non-inlinable rules exist without a `<head>` element

## Out of Scope

- `<ETailwind>` wrapper component (VNode traversal approach) — may be added in a future track
- Tailwind CSS plugins (only core utilities and config)
- JIT/AOT compilation modes — uses Tailwind's `compile()` API directly
- Preview server / dev tooling integration

## Assumptions

- HTML input to `inlineTailwind()` is well-formed (output of `render()` or equivalent)
- `tailwindcss` v4+ API (`compile()`) is used, matching React Email's current implementation
- CSS utility functions from React Email (css-tree based) are framework-agnostic and can be ported with minimal changes
- `class` attributes in HTML are the source of Tailwind utility classes (no `className` — this is rendered HTML, not JSX)

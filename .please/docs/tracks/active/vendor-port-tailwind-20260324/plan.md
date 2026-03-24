# Plan: Vendor Port Phase 3 — Tailwind CSS Integration

> Track: vendor-port-tailwind-20260324
> Spec: [spec.md](./spec.md)

## Overview

- **Source**: /please:plan
- **Issue**: TBD
- **Created**: 2026-03-24
- **Approach**: Direct port of framework-agnostic CSS utilities + new HTML post-processing layer

## Purpose

After this change, developers will be able to use Tailwind CSS utility classes in their Vue email components and have them automatically converted to inline styles during rendering. They can verify it works by calling `render(component, { tailwind: { config } })` and seeing that `class="bg-blue-500"` becomes `style="background-color: ..."` in the HTML output.

## Context

React Email provides a `<Tailwind>` wrapper component that traverses the React VDOM tree to collect classes, runs the Tailwind CSS compiler, and inlines/injects the resulting styles. This approach is tightly coupled to React's element model (`React.Children.map`, `cloneElement`, `isValidElement`).

For Vue, we use a **post-render HTML processing** approach instead: after `renderToString()` produces HTML, we parse it, extract `class` attributes, run the Tailwind CSS v4 `compile()` API, split rules into inlinable (converted to inline `style` attributes) and non-inlinable (injected as `<style>` block in `<head>`), then return the transformed HTML.

The React Email codebase contains ~29 source files (~3,400 lines) in the Tailwind package. Of these, ~15 CSS utility files are fully framework-agnostic (pure `css-tree` AST manipulation) and can be ported with minimal changes. The React-specific tree traversal code (`mapReactTree`, `cloneElementWithInlinedStyles`, `useSuspensedPromise`) is replaced entirely by a new HTML string processing layer.

Non-goals: `<ETailwind>` wrapper component, Tailwind CSS plugins, JIT/AOT compilation modes, preview server integration.

## Architecture Decision

Post-render HTML processing was chosen over VNode tree traversal because:

1. Vue VNodes are immutable and lack React's rich tree manipulation APIs
2. HTML string processing integrates naturally with the existing `render()` pipeline
3. The CSS utility layer (90% of the code) is framework-agnostic and ports directly
4. Simpler implementation with fewer edge cases around Vue component lifecycle

The Tailwind compiler is initialized via `tailwindcss` v4's `compile()` API with bundled stylesheet templates (theme, utilities, preflight) matching React Email's approach. CSS processing uses `css-tree` for AST parsing, variable resolution, calc evaluation, and declaration sanitization for email client compatibility.

For HTML manipulation, we use regex-based class extraction and string manipulation rather than a full DOM parser to keep dependencies minimal.

## Tasks

### Phase 1: Dependencies & Build Configuration

- [ ] T001 Add tailwindcss and css-tree dependencies (file: packages/vue-email/package.json)
- [ ] T002 Update build config to externalize new dependencies (file: packages/vue-email/tsdown.config.ts) (depends on T001)

### Phase 2: CSS Utility Layer (Framework-Agnostic Port)

- [ ] T003 [P] Port CSS rule extraction utilities (file: packages/vue-email/src/tailwind/css/extract-rules-per-class.ts)
- [ ] T004 [P] Port CSS inlinability checks (file: packages/vue-email/src/tailwind/css/is-rule-inlinable.ts)
- [ ] T005 [P] Port CSS variable resolution (file: packages/vue-email/src/tailwind/css/resolve-all-css-variables.ts)
- [ ] T006 [P] Port calc expression resolution (file: packages/vue-email/src/tailwind/css/resolve-calc-expressions.ts)
- [ ] T007 [P] Port CSS declaration sanitization (file: packages/vue-email/src/tailwind/css/sanitize-declarations.ts)
- [ ] T008 [P] Port inline style generation (file: packages/vue-email/src/tailwind/css/make-inline-styles-for.ts)
- [ ] T009 [P] Port non-inlinable rule sanitization (file: packages/vue-email/src/tailwind/css/sanitize-non-inlinable-rules.ts)
- [ ] T010 [P] Port compatibility utilities (file: packages/vue-email/src/tailwind/compatibility/index.ts)

### Phase 3: Tailwind Compiler Setup

- [ ] T011 Port Tailwind stylesheet templates (file: packages/vue-email/src/tailwind/tailwindcss/tailwind-stylesheets/index.ts) (depends on T001)
- [ ] T012 Port setupTailwind and sanitizeStyleSheet (file: packages/vue-email/src/tailwind/tailwindcss/setup-tailwind.ts) (depends on T005, T006, T007, T011)

### Phase 4: HTML Processing Layer (New Code)

- [ ] T013 Implement inlineTailwind HTML processor (file: packages/vue-email/src/tailwind/inline-tailwind.ts) (depends on T003, T004, T008, T009, T010, T012)
- [ ] T014 Export pixelBasedPreset and TailwindConfig types (file: packages/vue-email/src/tailwind/presets.ts) (depends on T001)

### Phase 5: Render Integration

- [ ] T015 Integrate tailwind option into render function (file: packages/vue-email/src/utils/render.ts) (depends on T013, T014)
- [ ] T016 Update barrel exports (file: packages/vue-email/src/index.ts) (depends on T013, T014, T015)

### Phase 6: Verification

- [ ] T017 Coverage and final validation (depends on T016)

## Key Files

### Create

- `packages/vue-email/src/tailwind/` — New tailwind module directory
- `packages/vue-email/src/tailwind/css/extract-rules-per-class.ts` — CSS rule categorization
- `packages/vue-email/src/tailwind/css/is-rule-inlinable.ts` — Inlinability checks (+ is-part-inlinable, split-mixed-rule, unwrap-value)
- `packages/vue-email/src/tailwind/css/resolve-all-css-variables.ts` — CSS var() resolution
- `packages/vue-email/src/tailwind/css/resolve-calc-expressions.ts` — calc() evaluation
- `packages/vue-email/src/tailwind/css/sanitize-declarations.ts` — Email client CSS compat (oklch→rgb, logical→physical props)
- `packages/vue-email/src/tailwind/css/make-inline-styles-for.ts` — CSS rules → inline style object
- `packages/vue-email/src/tailwind/css/sanitize-non-inlinable-rules.ts` — Non-inlinable rule preparation
- `packages/vue-email/src/tailwind/css/get-custom-properties.ts` — @property extraction
- `packages/vue-email/src/tailwind/compatibility/` — Class name escape/unescape/sanitize, camelCase conversion
- `packages/vue-email/src/tailwind/tailwindcss/setup-tailwind.ts` — Tailwind compiler init
- `packages/vue-email/src/tailwind/tailwindcss/tailwind-stylesheets/` — Bundled CSS templates (theme, utilities, preflight, index)
- `packages/vue-email/src/tailwind/sanitize-stylesheet.ts` — Stylesheet sanitization pipeline
- `packages/vue-email/src/tailwind/inline-tailwind.ts` — Main HTML processing function
- `packages/vue-email/src/tailwind/presets.ts` — pixelBasedPreset + TailwindConfig type

### Modify

- `packages/vue-email/package.json` — Add tailwindcss, css-tree, @types/css-tree deps
- `packages/vue-email/tsdown.config.ts` — Add tailwindcss, css-tree to neverBundle
- `packages/vue-email/src/utils/render.ts` — Add tailwind option to RenderOptions and processing pipeline
- `packages/vue-email/src/index.ts` — Add tailwind exports

### Reference

- `vendor/react-email/packages/tailwind/src/` — Original React Email Tailwind implementation
- `vendor/react-email/packages/tailwind/src/utils/css/` — CSS utility reference (direct port source)
- `vendor/react-email/packages/tailwind/src/utils/compatibility/` — Compatibility utility reference
- `vendor/react-email/packages/tailwind/src/utils/tailwindcss/` — Tailwind setup reference

## Verification

### Automated Tests

- [ ] `inlineTailwind()` converts basic utilities (bg-blue-500, text-white, p-4) to inline styles
- [ ] `inlineTailwind()` handles responsive utilities (md:text-lg) via `<style>` in `<head>`
- [ ] `inlineTailwind()` handles dark mode classes via media query in `<head>`
- [ ] `inlineTailwind()` throws error when non-inlinable rules exist without `<head>`
- [ ] `render()` with tailwind option produces correct output
- [ ] pixelBasedPreset converts rem to px values
- [ ] CSS variable resolution works correctly
- [ ] calc() expressions are evaluated to static values
- [ ] Class name sanitization handles special characters
- [ ] Snapshot tests for all transformation scenarios

### Observable Outcomes

- Running `bunx vitest run` shows all tailwind tests passing
- Running `bunx tsc --noEmit` shows no type errors
- Running `bun run lint` shows no lint errors
- Running `bunx vitest run --coverage` shows >80% coverage

## Progress

| Phase                       | Status  |
| --------------------------- | ------- |
| Phase 1: Dependencies       | pending |
| Phase 2: CSS Utilities      | pending |
| Phase 3: Tailwind Compiler  | pending |
| Phase 4: HTML Processing    | pending |
| Phase 5: Render Integration | pending |
| Phase 6: Verification       | pending |

## Decision Log

| Date       | Decision                                         | Rationale                                                                                                                                |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-24 | Post-render HTML processing over VNode traversal | Vue VNodes are immutable; HTML string processing integrates with existing render() pipeline; 90% of CSS utilities are framework-agnostic |
| 2026-03-24 | Regex-based HTML manipulation over DOM parser    | Keeps dependencies minimal; rendered HTML from renderToString is well-formed; only need class extraction and style injection             |
| 2026-03-24 | Tailwind CSS v4 compile() API                    | Matches React Email's approach; v4 provides stable programmatic API                                                                      |

## Surprises & Discoveries

- React Email's CSS utils are 90% framework-agnostic — only `getReactProperty()` has React-specific camelCase conversion, but Vue uses the same convention
- `sanitizeDeclarations` includes a full OKLCH → RGB color conversion matrix for email client compatibility
- Tailwind stylesheet templates (theme.ts, utilities.ts, preflight.ts) total ~870 lines of embedded CSS
- React Email's `mapReactTree` directly calls component functions, bypassing React lifecycle — confirms post-render approach is safer for Vue

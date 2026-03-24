# Plan: Vendor Port Phase 2 — Render & Advanced Components

> Track: vendor-port-render-advanced-20260324
> Spec: [spec.md](./spec.md)

## Overview

- **Source**: /please:plan
- **Track**: vendor-port-render-advanced-20260324
- **Created**: 2026-03-24
- **Approach**: Vue SSR (renderToString) for render; defineComponent + TSX for components

## Purpose

Port the `render` utility and 3 advanced components (code-block, code-inline, markdown) from React Email to Vue 3. The render utility is the critical missing piece that allows users to convert Vue email components into HTML strings.

## Architecture Decision

- **render**: Single universal implementation using `@vue/server-renderer` `renderToString()` — no need for React's 3-environment split (node/edge/browser). Vue SSR is universal.
- **Component style**: TSX with `defineComponent` (same as Phase 1)
- **Dependencies**: `html-to-text` + `prettier` (render), `prismjs` (code-block), `marked` (markdown)
- **Build**: tsdown with `neverBundle` for vue + new external deps (prismjs, marked, html-to-text, prettier)

## Directory Structure

```
packages/vue-email/src/
  utils/
    render.ts              # render(component, options?) → HTML string
    render.spec.ts
    to-plain-text.ts       # HTML → plain text via html-to-text
    to-plain-text.spec.ts
    pretty.ts              # HTML formatting via prettier
    pretty.spec.ts
  components/
    e-code-inline/
      e-code-inline.tsx
      e-code-inline.spec.ts
    e-code-block/
      e-code-block.tsx
      e-code-block.spec.ts
      themes.ts
      languages.ts
    e-markdown/
      e-markdown.tsx
      e-markdown.spec.ts
      styles.ts
      parse-css-in-js-to-inline-css.ts
      parse-css-in-js-to-inline-css.spec.ts
  index.ts                 # updated barrel export
```

## Tasks

### Phase 1: Dependencies & Infrastructure

| ID  | Task             | Description                                                                                                                                                | Deps |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| T-1 | Add dependencies | Add `@vue/server-renderer`, `html-to-text`, `prettier`, `prismjs`, `@types/prismjs`, `marked` as dependencies. Update tsdown.config.ts to externalize them | -    |

### Phase 2: Render Utility

| ID  | Task                          | Description                                                                                                                                           | Deps     |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| T-2 | Implement toPlainText utility | Port `toPlainText()` — wraps html-to-text `convert()` with email-specific selectors (skip images, link formatting)                                    | T-1      |
| T-3 | Implement pretty utility      | Port `pretty()` — wraps Prettier with HTML parser, MSO conditional comment preservation                                                               | T-1      |
| T-4 | Implement render function     | Port `render(vnode, options?)` — uses `renderToString` from `@vue/server-renderer`, prepends XHTML DOCTYPE, supports `plainText` and `pretty` options | T-2, T-3 |

### Phase 3: Simple Component — CodeInline

| ID  | Task                            | Description                                                                                                          | Deps |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---- |
| T-5 | Implement ECodeInline component | Port CodeInline — dual `<code>` + `<span>` render with Orange.fr CSS hack (`.cino`/`.cio` classes). No external deps | T-1  |

### Phase 4: Complex Components

| ID  | Task                                      | Description                                                                                                                                                                       | Deps |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| T-6 | Implement ECodeBlock component            | Port CodeBlock — Prism.js tokenization, recursive token rendering, theme-based styling, line numbers, email-safe space handling. Includes themes.ts and languages.ts type exports | T-1  |
| T-7 | Implement parseCssInJsToInlineCss utility | Port CSS-in-JS → inline CSS converter — camelCase→kebab-case, numeric px auto-append, quote escaping. Shared by EMarkdown                                                         | T-1  |
| T-8 | Implement EMarkdown component             | Port Markdown — custom marked Renderer with per-element inline styles, `dangerouslySetInnerHTML` equivalent (`v-html`), default styles, StylesType interface                      | T-7  |

### Phase 5: Integration & Verification

| ID   | Task                                       | Description                                                                                                 | Deps               |
| ---- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| T-9  | Update barrel exports & build verification | Add render, ECodeInline, ECodeBlock, EMarkdown to index.ts. Verify tsdown build. Run lint                   | T-4, T-5, T-6, T-8 |
| T-10 | Coverage & final validation                | Ensure >80% coverage. Run full test suite. Verify tsc --noEmit passes. Test render with existing components | T-9                |

## Key Files

- `vendor/react-email/packages/render/src/` — Render reference implementation
- `vendor/react-email/packages/code-block/src/` — CodeBlock reference
- `vendor/react-email/packages/code-inline/src/` — CodeInline reference
- `vendor/react-email/packages/markdown/src/` — Markdown reference
- `packages/vue-email/src/index.ts` — Barrel export
- `packages/vue-email/tsdown.config.ts` — Build configuration

## Verification

- [ ] `render()` produces DOCTYPE + HTML string from Vue components
- [ ] `render(comp, { plainText: true })` returns plain text
- [ ] `render(comp, { pretty: true })` returns formatted HTML
- [ ] ECodeInline renders dual elements with Orange.fr hack
- [ ] ECodeBlock renders syntax-highlighted code
- [ ] EMarkdown converts markdown to styled HTML
- [ ] Snapshot tests pass for all components
- [ ] TypeScript strict — no errors
- [ ] > 80% code coverage
- [ ] ESLint passes
- [ ] Build succeeds

## Progress

| Phase                       | Status    |
| --------------------------- | --------- |
| Phase 1: Dependencies       | completed |
| Phase 2: Render Utility     | completed |
| Phase 3: CodeInline         | completed |
| Phase 4: Complex Components | completed |
| Phase 5: Integration        | completed |

## Decision Log

| Date       | Decision                                    | Rationale                                                                                                            |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 2026-03-24 | Single render implementation (no env split) | Vue SSR via `renderToString` is universal — works in Node, Edge, and browser. No need for React's 3-variant approach |
| 2026-03-24 | Dependencies as peer/optional               | `prismjs`, `marked`, `html-to-text`, `prettier` externalized to keep bundle small                                    |
| 2026-03-24 | v-html for Markdown output                  | Vue equivalent of React's dangerouslySetInnerHTML — necessary for marked HTML output                                 |

## Surprises & Discoveries

- Vue's `renderToString` is much simpler than React's stream-based approach — entire render collapses to ~30 lines
- CodeBlock's space handling uses non-breaking space + zero-width markers to prevent email client collapse
- Markdown uses a complete custom marked Renderer (20+ methods) with inline CSS injection
- parseCssInJsToInlineCss handles 58 numeric CSS properties for auto-px conversion

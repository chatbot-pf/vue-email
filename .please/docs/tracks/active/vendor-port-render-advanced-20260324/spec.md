# Vendor Port Phase 2 — Render & Advanced Components

> Track: vendor-port-render-advanced-20260324

## Overview

Port the `render` utility and 3 advanced components (code-block, code-inline, markdown) from React Email to Vue 3. The `render` utility converts Vue email components to HTML strings using `@vue/server-renderer`. Advanced components add code highlighting (Prism.js) and markdown-to-HTML conversion (marked) capabilities.

Continuation of `vendor-package-port-20260324` which completed the 15 core components.

## Requirements

### Functional Requirements

- [ ] FR-1: Port `render` utility — `render(component, options?)` converts a Vue component VNode to an HTML string
- [ ] FR-2: `render` supports `plainText` option (HTML → plain text via `html-to-text`)
- [ ] FR-3: `render` supports `pretty` option (formatted HTML via `prettier`)
- [ ] FR-4: `render` prepends XHTML 1.0 Transitional DOCTYPE
- [ ] FR-5: Port `ECodeInline` component — inline code with Orange.fr compatibility hack
- [ ] FR-6: Port `ECodeBlock` component — syntax-highlighted code block using Prism.js
- [ ] FR-7: Port `EMarkdown` component — renders Markdown to HTML via `marked`, with customizable styles per element
- [ ] FR-8: All new components exported from `@mail-please/vue-email` barrel and sub-path exports

### Non-functional Requirements

- [ ] NFR-1: TypeScript strict mode — full type definitions
- [ ] NFR-2: Dependencies: `html-to-text`, `prettier` (render); `prismjs` (code-block); `marked` (markdown)
- [ ] NFR-3: >80% code coverage via Vitest
- [ ] NFR-4: ESM-only output

## Acceptance Criteria

- [ ] AC-1: `render(<EHtml><EBody>Hello</EBody></EHtml>)` produces valid DOCTYPE + HTML string
- [ ] AC-2: `render(component, { plainText: true })` returns plain text
- [ ] AC-3: `render(component, { pretty: true })` returns formatted HTML
- [ ] AC-4: ECodeInline renders `<code>` + `<span>` with Orange.fr style hack
- [ ] AC-5: ECodeBlock renders syntax-highlighted code with Prism.js themes
- [ ] AC-6: EMarkdown converts markdown string to styled HTML elements
- [ ] AC-7: HTML snapshot tests pass for all new components
- [ ] AC-8: TypeScript compiles with `--strict` and no errors
- [ ] AC-9: `bun run lint` passes with zero errors

## Out of Scope

- `tailwind` component (Tailwind CSS integration — separate track)
- Email preview server / dev tools
- npm publishing and CI/CD pipeline
- Sub-path exports configuration (separate track)
- Individual scoped packages (`@mail-please/render`, etc.)

## Assumptions

- Vue's `@vue/server-renderer` (`renderToString`) replaces React's `renderToReadableStream`
- `render` is SSR-only (no browser/edge variants needed — Vue SSR is universal)
- React Email source in `vendor/react-email/` is the reference implementation
- Existing 15 components from Phase 1 are stable and tested

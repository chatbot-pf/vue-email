# Vendor Package Port — Core Email Components

> Track: vendor-package-port-20260324

## Overview

Port the 15 core React Email component packages from `vendor/react-email/packages/` to Vue 3 equivalents. Each component will be published both as part of the barrel package (`@mail-please/vue-email`) with sub-path exports and as individual scoped packages (`@mail-please/<component>`).

## Requirements

### Functional Requirements

- [ ] FR-1: Port all 15 core components: Body, Button, Column, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text
- [ ] FR-2: Each Vue component produces **identical HTML output** to its React Email equivalent
- [ ] FR-3: Each Vue component exposes the **same props/API surface** as React Email, adapted to Vue 3 Composition API idioms (slots instead of children, `v-bind` for attributes)
- [ ] FR-4: Components use `E` prefix naming convention (EButton, EContainer, etc.)
- [ ] FR-5: All components are unstyled — styling controlled via `style` prop and `$attrs` passthrough
- [ ] FR-6: Barrel package exports all components via `@mail-please/vue-email`
- [ ] FR-7: Sub-path exports enable tree shaking (`@mail-please/vue-email/button`)
- [ ] FR-8: Individual scoped packages published as `@mail-please/<component>`

### Non-functional Requirements

- [ ] NFR-1: TypeScript strict mode — full type definitions for all component props
- [ ] NFR-2: Zero runtime dependencies beyond Vue 3
- [ ] NFR-3: >80% code coverage via Vitest
- [ ] NFR-4: ESM-only output (`"type": "module"`)

## Acceptance Criteria

- [ ] AC-1: HTML snapshot tests pass for every component, matching React Email's output structure
- [ ] AC-2: TypeScript compiles with `--strict` and no errors
- [ ] AC-3: All 15 components are importable from both barrel and sub-path exports
- [ ] AC-4: `bun run lint` passes with zero errors
- [ ] AC-5: Package builds successfully with no warnings

## Out of Scope

- `render` package (server-side HTML rendering utility — separate track)
- `code-block`, `code-inline` (Prism.js dependency — separate track)
- `markdown` (markdown-to-HTML conversion — separate track)
- `tailwind` (Tailwind CSS integration — separate track)
- Email preview server / dev tools
- npm publishing and CI/CD pipeline

## Assumptions

- React Email source in `vendor/react-email/` is the reference implementation
- Vue 3.x is the minimum supported Vue version
- Components will be implemented using `defineComponent` with TypeScript

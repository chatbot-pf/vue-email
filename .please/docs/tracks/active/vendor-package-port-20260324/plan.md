# Plan: Vendor Package Port — Core Email Components

> Track: vendor-package-port-20260324
> Spec: [spec.md](./spec.md)

## Overview
- **Source**: /please:plan
- **Track**: vendor-package-port-20260324
- **Created**: 2026-03-24
- **Approach**: TSX + defineComponent, co-located utils, phased by complexity

## Purpose
Port 15 core React Email components to Vue 3 using TSX with defineComponent. Produce identical HTML output with Vue-idiomatic API.

## Architecture Decision
- **Component style**: TSX with `defineComponent` (closest to React source)
- **Utilities**: Co-located per component (e.g., `button/utils.ts`)
- **Build**: unbuild (generates ESM + CJS + .d.ts)
- **Testing**: Vitest with HTML snapshot tests
- **Structure**: `src/components/<name>/` per component

## Directory Structure
```
src/
  components/
    e-html/
      e-html.tsx
      e-html.spec.ts
    e-head/
      e-head.tsx
      e-head.spec.ts
    e-body/
      e-body.tsx
      e-body.spec.ts
    e-button/
      e-button.tsx
      e-button.spec.ts
      utils.ts
    ... (15 components total)
  index.ts          # barrel export
```

## Tasks

### Phase 1: Project Scaffolding

| ID | Task | Description | Deps |
|----|------|-------------|------|
| T-1 | Set up build infrastructure | Add vue, vitest, unbuild, @vitejs/plugin-vue-jsx as devDependencies. Create tsconfig.json, vitest.config.ts, build.config.ts. Create src/ directory structure | - |
| T-2 | Configure package exports | Set up package.json exports map with sub-path exports for each component. Configure barrel index.ts | T-1 |

### Phase 2: Simple Components (no logic, just HTML + defaults)

| ID | Task | Description | Deps |
|----|------|-------------|------|
| T-3 | Implement EHtml component | Port Html — renders `<html>` with default lang="en", dir="ltr" | T-2 |
| T-4 | Implement EHead component | Port Head — renders `<head>` with charset + Apple meta tags | T-2 |
| T-5 | Implement EHr component | Port Hr — renders `<hr>` with default 1px solid #eaeaea border | T-2 |
| T-6 | Implement EImg component | Port Img — renders `<img>` with block display, no border/outline | T-2 |
| T-7 | Implement ELink component | Port Link — renders `<a>` with default target="_blank", blue color | T-2 |
| T-8 | Implement EColumn component | Port Column — renders `<td>` with data-id attribute | T-2 |

### Phase 3: Medium Components (some logic/structure)

| ID | Task | Description | Deps |
|----|------|-------------|------|
| T-9 | Implement EContainer component | Port Container — table wrapper with max-width 600px, role=presentation | T-2 |
| T-10 | Implement ESection component | Port Section — table wrapper with single td cell | T-2 |
| T-11 | Implement ERow component | Port Row — table wrapper with tbody/tr structure | T-2 |
| T-12 | Implement EBody component | Port Body — table wrapper inside body, margin/padding reset logic, bg handling | T-2 |
| T-13 | Implement EText component | Port Text — p tag with margin parsing (computeMargins utility) | T-2 |
| T-14 | Implement EHeading component | Port Heading — polymorphic h1-h6 with margin utility props (m/mx/my/mt/mr/mb/ml) | T-2 |
| T-15 | Implement EFont component | Port Font — generates @font-face CSS with mso-font-alt fallback | T-2 |
| T-16 | Implement EPreview component | Port Preview — hidden div with 150 char limit + whitespace padding | T-2 |

### Phase 4: Complex Components

| ID | Task | Description | Deps |
|----|------|-------------|------|
| T-17 | Implement EButton component | Port Button — a tag with MSO padding computation, font-width scaling, conditional comments. Includes parsePadding, convertToPx, pxToPt utils | T-2 |

### Phase 5: Integration & Verification

| ID | Task | Description | Deps |
|----|------|-------------|------|
| T-18 | Build verification & exports | Verify unbuild produces correct output. Test sub-path imports. Verify barrel export. Run lint | T-3..T-17 |
| T-19 | Coverage & final validation | Ensure >80% coverage. Run full test suite. Verify tsc --noEmit passes | T-18 |

## Key Files
- `vendor/react-email/packages/*/src/*.tsx` — Reference implementations
- `src/components/*/` — Vue component implementations
- `src/index.ts` — Barrel export
- `build.config.ts` — unbuild configuration
- `vitest.config.ts` — Test configuration

## Verification
- [ ] All 15 components render valid HTML matching React Email output
- [ ] Snapshot tests pass for every component
- [ ] TypeScript strict — no errors
- [ ] >80% code coverage
- [ ] ESLint passes
- [ ] Build succeeds without warnings

## Progress

| Phase | Status |
|-------|--------|
| Phase 1: Scaffolding | pending |
| Phase 2: Simple Components | pending |
| Phase 3: Medium Components | pending |
| Phase 4: Complex Components | pending |
| Phase 5: Integration | pending |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | TSX + defineComponent | Closest to React source, handles complex render logic (MSO conditionals) |
| 2026-03-24 | Co-located utils per component | Each component owns its helpers, no cross-component coupling |
| 2026-03-24 | unbuild for build | Generates ESM + CJS + .d.ts with minimal config |

## Surprises & Discoveries

- Button component is significantly more complex than others due to MSO/Outlook padding computation
- Body wraps children in table structure because Yahoo/AOL convert body to div
- Text component has sophisticated margin shorthand parsing
- Preview pads content with invisible Unicode characters to prevent email client truncation

## Outcomes & Retrospective

### What Was Shipped
- 15 core Vue 3 email components ported from React Email
- Monorepo structure with `packages/vue-email/` as publishable `@mail-please/vue-email`
- tsdown build producing ESM + .d.ts (18.71 kB)
- 192 tests across 15 test files, all passing

### What Went Well
- Parallel agent implementation significantly sped up component porting
- TSX + defineComponent approach enabled near 1:1 porting from React source
- TDD workflow caught issues early (happy-dom style serialization quirks)
- Code review identified real insertion-order bugs in parsePadding/computeMargins

### What Could Improve
- Initial project structure (flat → monorepo) required mid-implementation restructure
- Build tool changed mid-stream (unbuild → tsdown) — should finalize tooling before implementation
- Some agent-written code had minor issues requiring manual fixes

### Tech Debt Created
- No `render` utility yet — users can't convert Vue email components to HTML strings
- Sub-path exports not yet configured (e.g., `@mail-please/vue-email/button`)
- Individual scoped packages not yet published (`@mail-please/body`, etc.)
- Coverage thresholds not enforced in CI

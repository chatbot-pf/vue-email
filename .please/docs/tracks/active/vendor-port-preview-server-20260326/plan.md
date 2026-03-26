# Plan: Preview Dev Server — Full Port

> Track: vendor-port-preview-server-20260326
> Spec: [spec.md](./spec.md)

## Overview

- **Source**: [spec.md](./spec.md)
- **Issue**: #5
- **Created**: 2026-03-26
- **Approach**: Pragmatic — port React Email's architecture with Vue/Nuxt equivalents, reusing framework-agnostic pieces (Socket.io, chokidar, dependency graph) and replacing React-specific parts (Next.js → Nuxt 4, React Context → Vue composables, VM sandboxing → Vite SSR)

## Purpose

After this change, Vue developers will be able to run `npx @mail-please/cli dev ./emails` to start a local preview server that renders their Vue email templates with hot reload. They can verify it works by editing a `.vue` or `.tsx` email template and seeing the preview update in the browser within 500ms.

## Context

React Email provides a complete development experience through its CLI and preview server. The CLI watches email template files, bundles them with esbuild, and renders them via a Next.js-based preview UI with Socket.io hot reload. The preview server offers HTML preview, source code view, plain text output, test email sending via Resend, and validation tools (linting, spam check, compatibility analysis).

Our vue-email project has ported all 18 React Email components and the `render()` utility (which uses `@vue/server-renderer`), but has no development tooling. This track introduces `@mail-please/cli` — a new package providing CLI commands and an embedded Nuxt 4 preview server.

Key architectural decisions for the Vue port:

- **Vite-based bundling** instead of esbuild+VM: Vite natively handles `.vue` SFC compilation and has built-in SSR support, eliminating the need for custom VM sandboxing
- **Single process**: CLI launches Nuxt programmatically via `createNuxt()`/`listen()`, with Socket.io attached to the same HTTP server
- **Nuxt 4 + Nuxt UI 4**: Modern Vue meta-framework with accessible UI components out of the box
- **Reuse `render()` from `@mail-please/vue-email`**: The existing SSR render utility is the foundation for template rendering

Constraints: TypeScript strict mode, Bun runtime, conventional commits. Non-goals: Nuxt module for application integration, documentation site, create-email scaffolding tool.

## Architecture Decision

We chose a Vite-based approach over porting React Email's esbuild+VM sandboxing for template bundling. React Email uses esbuild to bundle each template, then executes the bundle in a Node.js VM (SourceTextModule) with a custom JSX runtime. This is necessary because React components are functions that need a runtime to produce output.

Vue's architecture is different: `.vue` SFCs need a compiler step (handled natively by Vite), and Vue's SSR renderer (`renderToString`) works directly with component definitions. Vite's SSR mode can import `.vue` files, compile them on the fly, and return component objects ready for rendering — no VM needed. For `.tsx` templates, Vite uses `@vitejs/plugin-vue-jsx` (already a project dependency).

This approach is simpler (no VM sandboxing), faster (Vite's HMR is optimized), and more maintainable (standard Vue tooling). The tradeoff is less isolation between templates, but this is acceptable for a development tool.

## Tasks

### Phase A: Package Scaffold

- [x] T001 [P] Create CLI package scaffold with package.json, tsconfig, and bin entry (file: packages/cli/package.json)
- [x] T002 [P] Create Nuxt 4 preview server app scaffold with nuxt.config and app.vue (file: packages/cli/preview-server/nuxt.config.ts)

### Phase B: Core Infrastructure

- [x] T003 Build template discovery utility — recursively scan directory for .vue and .tsx email files with validation (file: packages/cli/src/utils/discovery.ts) (depends on T001)
- [x] T004 Build Vite-based template bundler — create Vite SSR server for compiling and importing .vue/.tsx templates (file: packages/cli/src/utils/bundling.ts) (depends on T001)
- [x] T005 Build dependency graph and file watcher — chokidar watching with Babel-based import tracking and recursive dependent resolution (file: packages/cli/src/utils/hot-reloading/dependency-graph.ts) (depends on T001)
- [x] T006 Build Socket.io hot reload server — attach to HTTP server, broadcast file changes with 150ms debounce (file: packages/cli/src/utils/hot-reloading/setup-hot-reloading.ts) (depends on T005)

### Phase C: CLI Commands

- [x] T007 Implement dev command — launch Nuxt programmatically with hot reload and template watching (file: packages/cli/src/commands/dev.ts) (depends on T003, T004, T006, T002)
- [x] T008 Implement build command — pre-compile Nuxt preview server for production (file: packages/cli/src/commands/build.ts) (depends on T007)
- [x] T009 Implement start command — serve pre-built preview server (file: packages/cli/src/commands/start.ts) (depends on T008)
- [x] T010 Implement export command — render all templates to static HTML/text files (file: packages/cli/src/commands/export.ts) (depends on T004, T003)
- [x] T011 Implement resend setup/reset commands — manage Resend API key with encrypted config storage (file: packages/cli/src/commands/resend.ts) (depends on T001)

### Phase D: Preview UI — Layout & Navigation

- [x] T012 Build Nuxt app shell — root layout with Nuxt UI 4, sidebar toggle, responsive structure (file: packages/cli/preview-server/app/app.vue) (depends on T002)
- [x] T013 Build sidebar with file tree — directory tree component using template discovery data (file: packages/cli/preview-server/app/components/Sidebar.vue) (depends on T012, T003)

### Phase E: Preview UI — Rendering & Display

- [x] T014 Build email rendering server route — Vite SSR import + render() for on-demand template rendering (file: packages/cli/preview-server/server/api/render.ts) (depends on T004, T002)
- [x] T015 Build HTML preview pane — iframe-based email display with dark mode color inversion (file: packages/cli/preview-server/app/components/EmailFrame.vue) (depends on T014)
- [x] T016 Build code view and plain text tabs — source code display with Shiki highlighting and plain text output (file: packages/cli/preview-server/app/components/CodeView.vue) (depends on T014)
- [x] T017 Build responsive preview controls — width/height presets, mobile/desktop modes, resizable wrapper (file: packages/cli/preview-server/app/components/PreviewControls.vue) (depends on T015)
- [x] T018 Build error overlay — compilation/render error display with source file mapping (file: packages/cli/preview-server/app/components/ErrorOverlay.vue) (depends on T014)

### Phase F: Preview UI — Hot Reload Integration

- [x] T019 Build useHotReload composable — Socket.io client connection, reload event listener, template re-rendering (file: packages/cli/preview-server/app/composables/useHotReload.ts) (depends on T006, T014)
- [x] T020 Build preview page with hot reload integration — catch-all route combining all preview components with live updates (file: packages/cli/preview-server/app/pages/preview/[...slug].vue) (depends on T013, T015, T016, T017, T018, T019)

### Phase G: Toolbar & Validation

- [x] T021 Build send test email feature — Resend SDK integration in toolbar panel (file: packages/cli/preview-server/app/components/toolbar/SendEmail.vue) (depends on T011, T014)
- [x] T022 Build email linter — HTML structure validation with issue reporting (file: packages/cli/preview-server/app/components/toolbar/Linter.vue) (depends on T014)
- [x] T023 Build spam check integration — spam scoring API integration with cached results (file: packages/cli/preview-server/app/components/toolbar/SpamCheck.vue) (depends on T014)
- [x] T024 Build compatibility analyzer — email client compatibility checking with Can I Email data (file: packages/cli/preview-server/app/components/toolbar/Compatibility.vue) (depends on T014)
- [x] T025 Build toolbar container — tabbed panel integrating linter, spam, compatibility, and send features (file: packages/cli/preview-server/app/components/Toolbar.vue) (depends on T021, T022, T023, T024)

### Phase H: CLI Entry Point & Integration

- [x] T026 Build CLI entry point — Commander.js setup registering all commands with options (file: packages/cli/src/index.ts) (depends on T007, T008, T009, T010, T011)
- [x] T027 E2E integration test — verify dev server startup, template rendering, and hot reload cycle (file: packages/cli/src/**tests**/e2e.spec.ts) (depends on T026, T020, T025)

## Key Files

### Create

- `packages/cli/package.json` — @mail-please/cli package definition with bin entry
- `packages/cli/tsconfig.json` — TypeScript config extending root
- `packages/cli/tsdown.config.ts` — Build config for CLI source
- `packages/cli/src/index.ts` — CLI entry point (Commander.js)
- `packages/cli/src/commands/dev.ts` — Dev server command
- `packages/cli/src/commands/build.ts` — Build command
- `packages/cli/src/commands/start.ts` — Start command
- `packages/cli/src/commands/export.ts` — Export command
- `packages/cli/src/commands/resend.ts` — Resend API key management
- `packages/cli/src/utils/discovery.ts` — Template file discovery
- `packages/cli/src/utils/bundling.ts` — Vite SSR template bundler
- `packages/cli/src/utils/hot-reloading/dependency-graph.ts` — Import dependency tracking
- `packages/cli/src/utils/hot-reloading/setup-hot-reloading.ts` — Socket.io + chokidar
- `packages/cli/preview-server/nuxt.config.ts` — Nuxt 4 config
- `packages/cli/preview-server/app/app.vue` — Root layout
- `packages/cli/preview-server/app/pages/index.vue` — Welcome page
- `packages/cli/preview-server/app/pages/preview/[...slug].vue` — Preview page
- `packages/cli/preview-server/app/components/Sidebar.vue` — Template navigator
- `packages/cli/preview-server/app/components/EmailFrame.vue` — iframe preview
- `packages/cli/preview-server/app/components/CodeView.vue` — Source code viewer
- `packages/cli/preview-server/app/components/PreviewControls.vue` — Responsive controls
- `packages/cli/preview-server/app/components/ErrorOverlay.vue` — Error display
- `packages/cli/preview-server/app/components/Toolbar.vue` — Validation toolbar
- `packages/cli/preview-server/app/composables/useHotReload.ts` — Hot reload composable
- `packages/cli/preview-server/server/api/render.ts` — Email rendering API

### Reuse

- `packages/vue-email/src/utils/render.ts` — `render()` function for Vue SSR email rendering
- `packages/vue-email/src/tailwind/inline-tailwind.ts` — Tailwind CSS inlining
- `packages/vue-email/src/utils/pretty.ts` — HTML pretty printing
- `packages/vue-email/src/utils/to-plain-text.ts` — HTML to plain text conversion

### Reference (vendor)

- `vendor/react-email/packages/react-email/src/` — CLI command implementations
- `vendor/react-email/packages/preview-server/src/` — Preview server UI and rendering

## Verification

### Automated Tests

- [ ] Template discovery finds .vue and .tsx files, ignores \_ prefixed dirs and static/
- [ ] Vite bundler compiles .vue SFC and .tsx templates successfully
- [ ] Dependency graph tracks imports and resolves transitive dependents
- [ ] Socket.io hot reload broadcasts changes within 150ms debounce window
- [ ] Export command generates correct HTML output for all template formats
- [ ] Email rendering server route returns HTML, plain text, and source code
- [ ] E2E: dev server starts, renders template, hot reload updates browser

### Observable Outcomes

- Running `npx @mail-please/cli dev ./emails` opens browser with template list in sidebar
- Editing a .vue template file shows updated preview in < 500ms
- Clicking a template in sidebar navigates to its preview
- Switching between HTML preview, code view, and plain text tabs works correctly
- Error overlay appears when a template has compilation errors

### Manual Testing

- [ ] Test with 5+ email templates in nested directory structure
- [ ] Test responsive preview modes (mobile 375px, desktop 1024px)
- [ ] Test dark mode color inversion in preview
- [ ] Test send test email via Resend (requires API key)
- [ ] Test build + start workflow for production deployment

### Acceptance Criteria Check

- [ ] AC-1: `npx @mail-please/cli dev ./emails` starts preview server and renders .vue and .tsx templates
- [ ] AC-2: Editing a template file triggers automatic browser refresh within 500ms
- [ ] AC-3: Preview UI shows template list, HTML preview, code view, and plain text output
- [ ] AC-4: Test emails can be sent via Resend from the preview UI
- [ ] AC-5: `export` command generates static HTML files for all templates
- [ ] AC-6: Error overlay displays compilation errors with source file references
- [ ] AC-7: Responsive preview modes (mobile/desktop) work correctly
- [ ] AC-8: Dependency graph correctly tracks cross-file imports for hot reload

## Decision Log

- Decision: Use Vite SSR instead of esbuild+VM for template bundling
  Rationale: Vite natively handles .vue SFC compilation and has built-in SSR support. Eliminates custom VM sandboxing complexity. Standard Vue tooling is more maintainable.
  Date/Author: 2026-03-26 / Claude

- Decision: CLI launches Nuxt programmatically (single process)
  Rationale: Simpler architecture, matches React Email's actual approach (loads Next.js in same process via jiti). Nuxt has solid programmatic API.
  Date/Author: 2026-03-26 / Claude

- Decision: Nuxt 4 + Nuxt UI 4 for preview server UI
  Rationale: User preference. Nuxt 4 is the latest Vue meta-framework. Nuxt UI 4 provides accessible components with minimal configuration.
  Date/Author: 2026-03-26 / Minsu Lee

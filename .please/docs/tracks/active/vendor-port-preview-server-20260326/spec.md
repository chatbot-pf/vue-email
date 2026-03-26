# Preview Dev Server — Full Port

> Track: vendor-port-preview-server-20260326

## Overview

Port React Email's complete preview development server to the Vue ecosystem. This introduces a new `@mail-please/cli` package providing a CLI tool and Nuxt 4-based preview web UI for authoring, previewing, and testing Vue email templates with hot reload.

## Requirements

### Functional Requirements

#### CLI (`@mail-please/cli`)

- [ ] FR-1: `dev` command — Start local dev server with hot reload for email templates
- [ ] FR-2: `build` command — Pre-compile preview server for production deployment
- [ ] FR-3: `start` command — Serve pre-built preview server
- [ ] FR-4: `export` command — Export email templates to static HTML files
- [ ] FR-5: `resend setup` / `resend reset` — Manage Resend API key for test email sending
- [ ] FR-6: Template discovery — Recursively scan directory for `.vue` and `.tsx` email template files
- [ ] FR-7: File watching — Detect template changes via chokidar with dependency graph tracking
- [ ] FR-8: Socket.io hot reload — Real-time browser refresh on template file changes
- [ ] FR-9: esbuild bundling — Bundle each template in isolation for rendering

#### Preview UI (Nuxt 4 + Nuxt UI 4)

- [ ] FR-10: Template sidebar — Directory tree of discovered email templates with navigation
- [ ] FR-11: HTML preview — iframe-based isolated email rendering with responsive preview modes (mobile/desktop)
- [ ] FR-12: Code view — Source code display with syntax highlighting
- [ ] FR-13: Plain text view — Rendered plain text output tab
- [ ] FR-14: Send test email — Resend integration for sending test emails from UI
- [ ] FR-15: Validation — HTML/email structure linting and error overlays with source mapping
- [ ] FR-16: Spam check — Integration with spam scoring API
- [ ] FR-17: Compatibility analysis — Email client compatibility checking
- [ ] FR-18: Error overlay — Formatted error display with source file location mapping

#### Template Support

- [ ] FR-19: Support `.vue` SFC templates (`<script setup>` + `<template>`)
- [ ] FR-20: Support `.tsx` templates (defineComponent style)
- [ ] FR-21: Auto-detect template format and apply appropriate bundling strategy
- [ ] FR-22: Template validation — Heuristic checks for valid email template exports

### Non-functional Requirements

- [ ] NFR-1: Dev server startup < 3 seconds for typical template directory
- [ ] NFR-2: Hot reload latency < 500ms from file save to browser update
- [ ] NFR-3: Minimize runtime dependencies — prefer Vue ecosystem equivalents
- [ ] NFR-4: TypeScript strict mode throughout

## Architecture

### Package Structure

```
packages/
  vue-email/          # Existing component library
  cli/                # NEW: @mail-please/cli
    src/
      commands/       # dev, build, start, export, resend
      utils/
        preview/      # Dev server setup, hot reload
        bundling/     # esbuild template bundling
        discovery/    # Template file scanning
    preview-server/   # Embedded Nuxt 4 app
      app/            # Nuxt pages, layouts
      components/     # Sidebar, toolbar, preview panes
      composables/    # useHotReload, useEmailRendering
      server/         # API routes for rendering, validation
```

### Technology Stack

| Layer             | Technology   | Notes                              |
| ----------------- | ------------ | ---------------------------------- |
| CLI framework     | Commander.js | CLI argument parsing               |
| Preview UI        | Nuxt 4       | Vue meta-framework                 |
| UI Components     | Nuxt UI 4    | Accessible component library       |
| Hot reload        | Socket.io    | Real-time file change broadcasting |
| File watching     | chokidar     | File system monitoring             |
| Template bundling | esbuild      | Fast template compilation          |
| Code highlighting | Shiki        | Syntax highlighting                |
| Email sending     | Resend SDK   | Test email delivery                |

## Acceptance Criteria

- [ ] AC-1: `npx @mail-please/cli dev ./emails` starts preview server and renders `.vue` and `.tsx` templates
- [ ] AC-2: Editing a template file triggers automatic browser refresh within 500ms
- [ ] AC-3: Preview UI shows template list, HTML preview, code view, and plain text output
- [ ] AC-4: Test emails can be sent via Resend from the preview UI
- [ ] AC-5: `export` command generates static HTML files for all templates
- [ ] AC-6: Error overlay displays compilation errors with source file references
- [ ] AC-7: Responsive preview modes (mobile/desktop) work correctly
- [ ] AC-8: Dependency graph correctly tracks cross-file imports for hot reload

## Out of Scope

- Nuxt module for application integration (separate track)
- Documentation site / public docs
- Template marketplace or sharing features
- Email analytics or tracking
- create-email scaffolding CLI (separate track)

## Assumptions

- esbuild can bundle `.vue` SFC files with appropriate plugin (esbuild-plugin-vue or unplugin-vue)
- Nuxt 4 is stable enough for production use by track completion
- Resend API is used as the sole email sending provider (matching React Email)
- Vue SSR rendering via `@vue/server-renderer` (already implemented in render utility) is used for template rendering

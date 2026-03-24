# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue port of [React Email](https://react.email). Unstyled Vue 3 components for building responsive emails with dark mode support across Gmail, Outlook, and other email clients. Published under the `@mail-please` npm org.

## Commands

```bash
# Setup (requires mise: https://mise.jdx.dev)
mise trust && mise install && mise run setup

# Install dependencies
bun install

# Lint
bun run lint
bun run lint:fix

# Test
vitest              # watch mode
vitest run          # single run
vitest run --coverage

# Type check
tsc --noEmit
```

## Architecture

This is an early-stage monorepo. No component source code exists yet — only infrastructure and planning docs.

- **vendor/react-email/** — Git submodule of the original React Email source, used as reference for component API and implementation
- **.please/** — Structured planning workspace (specs, plans, tracks, decisions). See `.please/INDEX.md` for navigation

### Component Design Conventions

- **Prefix**: `E` — `EButton`, `EContainer`, `EHeading`
- **File naming**: kebab-case (`e-button.tsx`, `e-container.tsx`)
- **Unstyled**: No default styles; users control styling via `style` prop
- **Slots**: Default slot for content (Vue pattern replacing React children)
- **Attrs passthrough**: Standard HTML attributes pass through via `$attrs`
- **API alignment**: Match React Email component names and props as closely as possible

### Testing Strategy

- HTML snapshot testing for component render output via Vitest
- TDD workflow: RED (failing test) → GREEN (minimal implementation) → REFACTOR → COMMIT
- Coverage target: >80%

## Stack

| Layer | Tool |
|-------|------|
| Runtime | Bun 1.3.10 |
| Framework | Vue 3 (Composition API only) |
| Language | TypeScript (strict) |
| Build | unbuild / vite (library mode) |
| Test | Vitest |
| Lint | ESLint with @antfu/eslint-config |
| Commits | Conventional Commits (commitlint enforced) |
| Git hooks | husky (pre-commit: lint-staged) + mise (commit-msg: commitlint) |
| Releases | release-please |
| Version manager | mise |

## Commit Conventions

Conventional Commits enforced by commitlint. Subject case rule is relaxed. Each task gets its own commit.

## Branch Strategy

- `main` — stable release branch
- `feat/<track-slug>` — feature branches
- `fix/<track-slug>` — bugfix branches

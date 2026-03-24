---
name: vue-email project conventions
description: Key conventions for vue-email Vue 3 port of React Email — naming, component structure, typing patterns
type: project
---

Component naming: E prefix (EButton, EContainer, etc.), kebab-case filenames.

All components use `defineComponent` with TSX. TypeScript strict mode enforced in tsconfig.json.

Components are unstyled (FR-5): styling via style prop and $attrs passthrough. Some components (EHr, ELink, EImg) apply minimal defaults that user style overrides.

`inheritAttrs: false` on all components — attrs spread manually in render/setup.

HTML output must match React Email exactly (FR-2) — including `data-id="__react-email-column"` artifacts.

**Why:** This is a direct port; identical HTML output is a hard requirement for email client compatibility.
**How to apply:** Do not flag data-id or HTML structure as violations if they mirror React Email source.

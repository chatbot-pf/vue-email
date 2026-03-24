---
name: project_test_framework
description: Test framework and tooling configuration for vue-email project
type: project
---

**Why:** vue-email is a Vue 3 port of react-email, using Vitest + happy-dom + @vue/test-utils for testing TSX components.

Key facts:

- Package manager: bun (bun.lock present)
- Test runner: vitest (scripts.test = "vitest run")
- Test command: `bunx vitest run --reporter=dot`
- Coverage: `bunx vitest run --coverage`
- Type check: `bunx tsc --noEmit`
- Environment: happy-dom
- JSX: Vue JSX via @vitejs/plugin-vue-jsx, jsxImportSource = "vue"
- Component pattern: `defineComponent` with TSX render functions, `inheritAttrs: false` for HTML passthrough
- Tests use `@vue/test-utils` mount()

**How to apply:** Use `bunx` prefix for all tool commands. Components use TSX render functions, not `<template>`.

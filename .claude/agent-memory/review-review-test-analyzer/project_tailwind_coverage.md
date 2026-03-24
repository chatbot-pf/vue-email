---
name: tailwind_coverage_analysis_2026_03_24
description: Test coverage analysis of Tailwind CSS integration — gaps, quality issues, and positive observations identified on 2026-03-24
type: project
---

Analyzed tailwind integration test coverage across 20 spec files (391 tests passing, 90.67% stmt / 81.15% branch coverage).

Key gaps found (confidence >= 80):

1. `sanitize-stylesheet.spec.ts` — 3 tests only check "no throw"; no assertions on the actual output state after the pipeline runs (all three passes: resolveAllCssVariables + resolveCalcExpressions + sanitizeDeclarations).
2. `setup-tailwind.spec.ts` — `getStyleSheet()` called before `addUtilities()` is never tested; also the "unsupported stylesheet import throws" branch in `loadStylesheet` is untested.
3. `inline-tailwind.spec.ts` — non-inlinable class names that survive as residual classes (sanitized) on the element are never verified in the output HTML.
4. `sanitize-class-name.spec.ts` — only a single happy-path test; leading-digit replacement and `!`, `>`, `<`, `=` substitutions have no dedicated coverage.
5. `make-inline-styles-for.spec.ts` — `customProperties` parameter (the `@property` initial-value fallback path) is never exercised; always called without the second argument.
6. `render.spec.ts` — render error path (renderToString throws) is not tested; the wrapped error message format is unverified.

**Why:** These are behavioral contracts that could silently break during future refactors; particularly important given the TDD discipline in this project.
**How to apply:** Flag these gaps in PR reviews for this package; suggest targeted tests before merging changes to any of these files.

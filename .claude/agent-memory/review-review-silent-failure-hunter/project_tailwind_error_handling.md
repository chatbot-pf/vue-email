---
name: tailwind_pipeline_silent_failures
description: Known silent failure and inadequate error handling locations in the Tailwind CSS inlining pipeline (reviewed 2026-03-24)
type: project
---

Four confirmed issues found in the Tailwind inline-styles pipeline during review on 2026-03-24.

**Issue 1 — CRITICAL (confidence 95):**
`packages/vue-email/src/tailwind/tailwindcss/setup-tailwind.ts` line 77.
`compiler.build(candidates)` has no error handling. If it returns empty string, `css` silently becomes empty, downstream `parse("")` returns an empty stylesheet, and HTML is returned with all styles stripped and zero warnings.

**Why:** Silent empty-string return from Tailwind compiler is a valid but undetected degradation path.
**How to apply:** When touching setup-tailwind.ts, ensure `compiler.build()` result is validated for non-empty before assigning to `css`.

---

**Issue 2 — CRITICAL (confidence 92):**
`packages/vue-email/src/tailwind/tailwindcss/setup-tailwind.ts` lines 29–31.
`loadModule` throws `"NO-OP: should we implement support for ${resourceHint}?"` — placeholder developer text, not a user-facing error. Surfaces raw to callers using @plugin or @source in their Tailwind config.

**Why:** Placeholder left in production code.
**How to apply:** Replace with a user-facing error naming what is unsupported and what the user should do instead.

---

**Issue 3 — IMPORTANT (confidence 85):**
`packages/vue-email/src/tailwind/css/resolve-all-css-variables.ts` lines 192–198.
When `!hasReplaced && !use.fallback`, unresolved `var(--foo)` is silently left in CSS output. Email clients (Outlook, Gmail) that don't support CSS custom properties will silently drop the style.

**Why:** No warning path for truly unresolvable variables.
**How to apply:** Add a `console.warn` (not throw) for unresolved variables with no fallback.

---

**Issue 4 — IMPORTANT (confidence 82):**
`packages/vue-email/src/tailwind/css/sanitize-declarations.ts` lines 306–353 (Hash visitor).
Unexpected hex lengths (not 3/4/6/8 chars) fall through to the else branch producing `NaN` color values. Also the `length === 5` branch has a copy-paste bug (doubles charAt(2) for both r and g components).

**Why:** No guard against non-standard hex lengths; copy-paste bug in 5-char branch.
**How to apply:** Add a guard at the top of the Hash visitor returning early with a warning for any hex length not in [3, 4, 6, 8]; remove the 5 and 7 char branches.

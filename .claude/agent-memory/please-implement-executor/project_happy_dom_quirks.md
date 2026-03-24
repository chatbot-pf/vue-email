---
name: project_happy_dom_quirks
description: happy-dom CSS behavior quirks that affect testing style properties in vue-email
type: project
---

**Why:** happy-dom has bidirectional CSS shorthand/longhand normalization behavior that differs from real browsers.

Specific behavior observed:
- `border: none` shorthand is expanded to `border-style: solid none none; border-color: #eaeaea none none; border-image: initial; border-top-width: 1px; ...` (when combined with borderTop)
- `style.border` returns empty string `''` for shorthand values
- `getAttribute('style')` returns the expanded longhand string
- When four equal `margin-*` longhand properties are set (e.g., `marginTop/Right/Bottom/Left` all `10px`), happy-dom COLLAPSES them back to `margin: 10px` shorthand in `wrapper.attributes('style')`
- Non-standard CSS vendor properties like `mso-padding-alt` and `mso-text-raise` are STRIPPED from the serialized style attribute string (`wrapper.attributes('style')`), but ARE accessible via the DOM property `element.style.msoPaddingAlt`

Workaround pattern:
- Do NOT assert `style.border === 'none'` — it will be `''`
- Instead check `style.borderStyle` contains `'none'`
- Or check `wrapper.attributes('style')` contains the expected longhand values
- For user overrides with `border: 1px solid red`: check style attribute contains `'red'`
- For margin shorthand tests: use `wrapper.element.style.marginTop` (DOM property) instead of `wrapper.attributes('style')` to check individual expanded values
- `\xa0` (non-breaking space) is HTML-encoded as `&nbsp;` in `wrapper.html()` output
- For MSO/vendor CSS properties (msoPaddingAlt, msoTextRaise): use `(el as HTMLElement).style.msoPaddingAlt` DOM property, not `wrapper.attributes('style')`

**How to apply:** When writing tests that check CSS border/padding/margin shorthands in happy-dom:
- Border: check longhand properties or use `.toContain()` on the style attribute string
- Margin: if setting individual longhand props that collapse to equal values, check `element.style.marginTop` directly rather than the serialized style string
- Unicode characters: check `wrapper.html()` for HTML-encoded versions (`&nbsp;` not `\xa0`)
- MSO/vendor CSS: check DOM property `element.style.msoPaddingAlt` directly, not style attribute string

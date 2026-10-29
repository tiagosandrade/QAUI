# Surface Testing Quality Checklist (Gold Standard)

Every surface test run by QAUI evaluates **both** visible functional steps and silent runtime health signals.

## 1. Critical Failures (`FAIL`)
A page or flow step MUST be marked `FAIL` if any of the following occur:
- **Navigation / Crash:** Main document returns HTTP `>= 400`, blank white screen, or infinite redirect loop.
- **Uncaught Runtime Exceptions:** Unhandled JS `error` or `unhandledrejection` triggered during page load or user interaction.
- **Server Errors on XHR/Fetch:** Critical API calls returning HTTP `>= 500`.
- **Blocked User Journey:** Target form control, primary CTA button, or link is unclickable (covered by broken overlay/modal, disabled unexpectedly, or missing from DOM).
- **Broken Core Visuals:** Primary visible `<img>` elements loaded with `naturalWidth === 0`.

## 2. Quality Warnings (`WARN`)
Flag as `WARN` (non-blocking, reported in findings):
- **Client Resource Errors (`4xx`):** Missing non-critical assets, favicons, sourcemaps, or third-party scripts returning `400–499`.
- **Horizontal Layout Overflow:** `documentElement.scrollWidth > window.innerWidth + 6` (indicates broken responsive CSS).
- **Accessibility / Semantic Selector Gaps:** Visible `<button>`, `<a>`, or `<input>` lacking any accessible name (`aria-label`, `<label>`, `placeholder`, or visible text).
- **Dead Links:** Visible `<a>` tags with empty `href` or `href="#"` and no `role="button"`.
- **Slow Assets / Paint:** `FCP > 3000ms` or individual critical resources taking `> 3000ms`.

## 3. Resilient Selector Hierarchy
Always prefer semantic selectors in this exact order (both during live exploration and when exporting `.spec.ts` files):
1. `role` + accessible name (`getByRole('button', { name: /pesquisar|search/i })`)
2. `label` / `placeholder` (`getByLabel(...)`, `getByPlaceholder(...)`)
3. Explicit test ID (`data-testid`)
4. Visible text (`getByText(...)`)
5. CSS/XPath fallback (last resort — report as a maintainability note if required)

# Surface Test Report Template

Use this structure when presenting the final report to the user (adapt language to match the user's prompt language, e.g., Portuguese or English):

```markdown
# Surface Test Report — <Target Name / URL>

- **Target URL:** `<url>`
- **Execution Mode:** `<Slow Demo | Normal | Fast Smoke>`
- **Overall Status:** `<✅ PASS | ⚠️ WARN | ❌ FAIL>`
- **Timestamp:** `<ISO-8601>`

## 1. Executed User Journey

| # | Step / Action | Target / URL | Status | Notes |
| :- | :------------ | :----------- | :----- | :---- |
| 1 | Open landing page | `https://...` | ✅ PASS | FCP: `420ms` |
| 2 | Fill & submit search | `input[name="q"]` | ✅ PASS | Navigated cleanly |

## 2. Silent Surface Health Telemetry

- **Uncaught JS Exceptions:** `<0 | list>`
- **Console Errors / Warnings:** `<0 | summary>`
- **Network Failures (`4xx` / `5xx`):** `<0 | list>`
- **Broken Images (`naturalWidth === 0`):** `<0 | list>`
- **Responsive Overflow Check:** `<OK | Overflow detected: scrollWidth px>`
- **Unlabeled Interactive Controls (A11y):** `<0 | count & examples>`

## 3. Actionable Recommendations
- <Bullet list of concrete fixes if any FAIL or WARN items were detected, or confirmation that surface health is clean.>
```

---
name: surface-testing
description: >-
  Runs project-agnostic visual surface tests, smoke tests, and interactive browser simulations
  with a visible animated mouse pointer, configurable speed (slow, normal, fast), passive
  console/network/layout/accessibility health audits, and optional Playwright spec export.
  Use whenever the user asks for surface testing ("teste de superfície"), UI smoke testing,
  QA UI validation, or watching live step-by-step browser interactions on any URL or project.
---

# QAUI — Project-Agnostic Surface Testing

Execute visual UI surface tests and live browser simulations across **any** tech stack or external URL without adding dependencies to the target project.

## 1. Choose Browser Engine (Zero-Friction Order)

1. **Primary (Bundled Isolated MCP):** Prefer the `surface-testing-playwright` MCP tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_evaluate`, `browser_console_messages`, `browser_network_requests`, `browser_close`). It automatically launches a **clean, isolated, visible Chrome window** outside the terminal sandbox — no manual `chrome://inspect` setup required.
2. **Fallback:** If `surface-testing-playwright` tools are not yet loaded (e.g., before restarting after plugin installation), use `chrome-devtools` MCP tools or recommend `/browser`. Never spawn headed browsers inside a sandboxed `run_command` expecting the user to see the window on Windows.

## 2. Target Discovery (When No URL Is Provided)

If the user asks to test "this project" without specifying a URL:
1. Check workspace `AGENTS.md` / `.agents/` for project-specific test URLs or credentials.
2. Run the zero-dependency discovery helper from this skill folder:
   ```bash
   node "<path-to-this-skill>/scripts/discover-local-target.mjs"
   ```
3. Use `recommendedTargetUrl` if a local server is active; otherwise offer to start the detected `dev`/`start` script first.

## 3. Speed & Visual Cursor Overlay

Read [cursor-overlay.js](./resources/cursor-overlay.js) once and evaluate its contents on each visited page via `browser_evaluate` (or `evaluate_script`):

- **Speed selection** via `window.__QAUI.setSpeed(mode)`:
  - `'slow'`: step-by-step demos/presentations (`~1.35s` cursor glide, deliberate pauses, character-by-character typing).
  - `'normal'`: default balanced visual inspection (`~520ms` glide).
  - `'fast'`: rapid visual smoke runs (`~220ms` glide, short pauses).
  - `'instant'`: headless/CI-speed execution.
- Native MCP actions (`browser_click`, `browser_hover`) automatically trigger the red pointer, halo, and click ripple once `cursor-overlay.js` is active. For smooth Bezier glides and paced demos, call `await window.__QAUI.focusTarget(selector, label)` or `await window.__QAUI.clickTarget(selector, label)` and `await window.__QAUI.typeIntoTarget(selector, text, { label })`.

## 4. Workflow Execution & Silent Health Audit

For every route or user journey step:
1. **Navigate & Inject:** Open the page, inject [cursor-overlay.js](./resources/cursor-overlay.js), set the requested speed, and update the HUD (`window.__QAUI.setStatus(...)`).
2. **Dismiss Blockers:** Handle first-run cookie/privacy banners cleanly before interacting with page forms.
3. **Interact Semantically:** Use accessibility snapshots (`browser_snapshot`) and prefer semantic targets (`role`, `label`, `placeholder`) over brittle CSS classes. When clicking dynamic SPA search results, verify results updated before clicking the first content link.
4. **Run Surface Audit:** Read and evaluate [surface-audit.js](./resources/surface-audit.js) (`window.__runSurfaceAudit()`) AND check MCP `browser_console_messages` / `browser_network_requests`. Evaluate findings against [surface-checklist.md](./references/surface-checklist.md).
5. **Clean Teardown:** Pause briefly on the final state so the user sees completion (`window.__QAUI.setStatus('✅ Concluído!', 'pass')`), then close the isolated browser/tab (`browser_close`) when requested.

## 5. Reporting & Optional Regression Export

1. Present a concise summary structured after [report-template.md](./references/report-template.md) (in the user's language), covering both functional steps and silent telemetry (JS exceptions, HTTP `4xx`/`5xx`, broken images, horizontal overflow, unlabeled controls).
2. If the user wants to save the flow as a permanent automated test in the repository, follow [playwright-regression-template.md](./references/playwright-regression-template.md).

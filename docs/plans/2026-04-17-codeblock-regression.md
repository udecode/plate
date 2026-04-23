# Codeblock Regression

## Goal

Reproduce the reported code block regression in the running docs app, identify
the root cause, and fix it with fresh verification.

## Context

- User reports a `codeblock` regression and asks whether it was verified in
  `dev-browser`.
- Current browser surface is `http://localhost:3001/`.
- I did not specifically verify code block behavior in browser before the
  report.

## Relevant Learnings

- `docs/solutions/logic-errors/2026-03-23-code-block-tab-should-indent-every-selected-line.md`
- `docs/solutions/logic-errors/2026-03-26-code-block-language-change-must-trigger-redecorate.md`
- `docs/solutions/logic-errors/2026-03-27-code-block-format-must-rebuild-code-lines.md`
- `docs/solutions/logic-errors/2026-03-28-link-validation-must-not-treat-double-slash-as-internal-path.md`
- `docs/solutions/logic-errors/2026-04-03-editor-key-protocols-must-cover-expanded-selection-and-repeated-escalation.md`

## Working Plan

- [x] Load relevant skills and scan repo learnings
- [x] Reproduce the regression in `dev-browser`
- [x] Identify the exact failing flow and likely owner layer
- [x] Fix the root cause
- [x] Run fresh verification for the touched surface

## Findings

- Code block already has multiple recent regressions around formatting,
  redecorate, paste handling, and key protocols. That makes it a likely
  regression-prone surface, not a one-off complaint.
- No current learning directly names the user's exact regression yet.
- `localhost:3001` is not a trustworthy repro surface right now. The active
  docs dev server is hanging behind Turbopack cache corruption and missing
  `.sst` files under `apps/www/.next/dev/cache/turbopack`.
- A clean docs instance on `localhost:3002` reproduced the real browser-facing
  regression on `/docs/code-block`: the route fell into the "This page couldn’t
  load" error state with `PlateError: [CODE_HIGHLIGHT] Error: Could not
  highlight with Highlight.js`.
- Root cause: `setCodeBlockToDecorations` tried to recover from registered
  language highlight failures, but called `editor.api.debug.error(...)` inside
  the catch. In dev, `debug.error` throws, so the intended plaintext fallback
  never ran.
- After the patch, `/docs/code-block` loads successfully in browser. The page
  now logs a warning and falls back to plaintext for the Python sample instead
  of crashing the route.

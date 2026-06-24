---
title: Playwright table proof can reuse a stale existing server
date: 2026-05-23
category: docs/solutions/test-failures
module: plite playwright verification
problem_type: test_failure
component: testing_framework
symptoms:
  - Focused Playwright rows failed after editing example text.
  - The rendered page still contained the old text even though source files were updated.
  - Text-length assertions used the new source string against stale served output.
root_cause: config_error
resolution_type: workflow_improvement
severity: medium
tags: [plite, playwright, stale-server, verification, examples]
---

# Playwright table proof can reuse a stale existing server

## Problem

Plite Playwright tests default to `reuseExistingServer` locally. If a server
is already running on the configured port, tests can exercise stale built output
instead of the source just edited.

## Symptoms

- A table test expected the new trailing paragraph length, but the page returned
  the old paragraph text.
- Selection assertions failed with a shorter offset from the stale page.
- Drag-selection assertions saw the old example copy even after the source and
  test were patched.

## What Didn't Work

- Rerunning the same Playwright command kept hitting the existing server.
- Hardcoding the example paragraph in the test made the stale-server mismatch
  worse because the test and page could drift.

## Solution

For source edits that affect rendered examples, build the static site and run
Playwright against a fresh server on a separate port:

```bash
cd Plate repo root
bun build:next
PORT=3111 bun serve:playwright
PLAYWRIGHT_BASE_URL=http://localhost:3111 PLAYWRIGHT_RETRIES=0 \
  bunx playwright test playwright/integration/examples/tables.test.ts \
  --project=chromium --workers=1
```

When a test needs the current example text, derive it from the rendered page:

```ts
const trailingParagraph =
  (await editor.root.locator('p').last().textContent()) ?? ''
```

## Why This Works

`PLAYWRIGHT_BASE_URL` disables the Playwright config's managed web server and
points tests at the fresh server. Using a separate port avoids killing the
developer server the user may be using. Deriving text from the page prevents
source/test string duplication from becoming a false failure.

## Prevention

- After changing example text or static route content, do not trust a local
  reused Playwright server.
- Use a one-off static server on a separate port for final proof when the dev
  server must stay running.
- Prefer page-derived text in browser tests when the exact text is not the
  behavior under test.

## Related Issues

- [Plite React history hotkeys must repair DOM after model undo](../ui-bugs/2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Plite React scroll range measurement must restore DOM methods](../logic-errors/2026-05-11-slate-react-scroll-range-measurement-must-restore-dom-methods.md)
- [Plite React triple-click delete needs full block selection intent](../logic-errors/2026-05-06-slate-react-triple-click-delete-needs-full-block-selection-intent.md)

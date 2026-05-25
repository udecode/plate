---
title: Slate v2 Playwright webserver checks should run sequentially
date: 2026-05-08
category: docs/solutions/workflow-issues
module: slate-v2 playwright verification
problem_type: workflow_issue
component: testing_framework
symptoms:
  - Running two Slate v2 Playwright commands at once failed one command before tests started.
  - The failed command reported "Another next build process is already running."
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [slate-v2, playwright, next-build, verification]
---

# Slate v2 Playwright webserver checks should run sequentially

## Problem

Slate v2 Playwright commands start the site through the configured webserver, and that path runs `next build`. Running two of those commands in parallel races on Next's build lock.

## Symptoms

- One Playwright command starts normally.
- The other exits before tests run with:

```text
Another next build process is already running.
```

## What Didn't Work

- Starting two independent Playwright verification commands with `multi_tool_use.parallel`.
- Treating the failed command as a product regression. The tests never reached the browser.

## Solution

Run Playwright commands that use the Slate v2 site webserver sequentially.

```bash
cd /Users/zbeyens/git/slate-v2
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium -g "table-cell-boundary-navigation"
bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium
```

It is still fine to run package/unit tests in parallel with each other. Do not run two site-backed Playwright commands at the same time unless the webserver is already built and shared by an explicit non-building server path.

## Why This Works

The collision is not in Slate editor code. It is the Next build lock protecting the same `site` output. Sequential Playwright commands let the first build and server lifecycle finish before the next command asks Next to build.

## Prevention

- Batch related Playwright rows into one command when possible.
- If two Playwright commands both trigger `cd ./site && next build`, run them one after another.
- When a Playwright command fails with the Next build-lock message, rerun it alone before debugging application behavior.

## Related Issues

- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
- [Public paste helpers should use real clipboard write plus real paste gesture](../logic-errors/2026-04-04-public-paste-helpers-should-use-real-clipboard-write-plus-real-paste-gesture.md)

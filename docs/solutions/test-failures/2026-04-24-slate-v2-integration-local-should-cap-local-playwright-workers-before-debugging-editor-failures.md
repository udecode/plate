---
title: Slate v2 integration-local should cap local Playwright workers before debugging editor failures
date: 2026-04-24
category: docs/solutions/test-failures
module: Slate v2 browser proof
problem_type: test_failure
component: testing_framework
symptoms:
  - "bun test:integration-local times out unrelated Chromium rows during page.goto."
  - "The same rows pass on retry or under lower worker counts."
  - "A strict kernel assertion exposes a real structural-input ownership bug before harness cleanup."
root_cause: async_timing
resolution_type: config_change
severity: high
tags: [slate-v2, playwright, integration-local, browser-proof, kernel, timeout]
---

# Slate v2 integration-local should cap local Playwright workers before debugging editor failures

## Problem

`bun test:integration-local` can fail for two different reasons in the same run:
a real editor ownership bug and local Playwright saturation. Do not treat those
as the same failure.

## Symptoms

- A strict Editable kernel assertion throws for a structural input command such
  as Enter or split-block.
- A later full integration run times out unrelated rows during `page.goto`.
- Rows that time out at high worker counts pass on retry or under fewer local
  workers.
- The final Playwright output contains a flaky section even though the command
  exits `0`.

## What Didn't Work

- Relaxing the kernel assertion would hide the real bug. The assertion was
  correct: a command cannot be native-owned.
- Keeping the unrestricted local Playwright worker default made page-load
  starvation look like editor behavior.
- Accepting an exit-code-only green run with a flaky section would preserve
  hidden release debt.

## Solution

First fix the real ownership bug. Structural Enter input must be classified as
model-owned before command dispatch:

```ts
const classifyKeyboardIntent = (event: KeyboardEvent): InputIntent => {
  if (Hotkeys.isSoftBreak(event) || Hotkeys.isSplitBlock(event)) {
    return 'insert-break'
  }

  // other keyboard intent classification
}
```

Then make the local integration harness deterministic instead of maximizing
parallelism:

```ts
const workers = process.env.PLAYWRIGHT_WORKERS
  ? +process.env.PLAYWRIGHT_WORKERS
  : process.env.CI
    ? undefined
    : 2

const config: PlaywrightTestConfig = {
  timeout: 30 * 1000,
  workers,
}
```

Keep `PLAYWRIGHT_WORKERS` as an explicit override for focused local probes. Do
not change CI worker policy unless CI proves the same saturation shape.

## Why This Works

The kernel assertion separates editor authority bugs from browser-harness
noise. Enter/split-block is structural editing, so it belongs to the
model-owned command path.

The local Playwright cap fixes a different problem: static exported examples
plus four browser projects can starve page loads when local workers are
unrestricted. Lower local parallelism produces cleaner release evidence. Perf
pressure belongs to the dedicated React/core benchmarks, not to
`page.goto` timing in integration rows.

## Prevention

- If a strict kernel assertion fails, fix the ownership classification before
  touching retries, workers, or timeouts.
- If unrelated Playwright rows time out in `page.goto`, reduce local workers
  before debugging editor code.
- Do not accept `bun test:integration-local` as release-clean when it exits `0`
  but reports flaky rows.
- Keep focused browser probes explicit with `--workers=4 --retries=0` or an
  intentional `PLAYWRIGHT_WORKERS` override.
- Keep large-document performance claims in benchmark gates, not Playwright
  test timeouts.

## Related Issues

- [Slate browser proof must separate model-owned handles, root selection, and usable focus](../logic-errors/2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md)
- [Slate React model-owned insert must repair the DOM caret](../logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)

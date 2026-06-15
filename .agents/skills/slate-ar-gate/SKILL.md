---
description: Slate v2 Autoresearch gate loop. Repeats and logs existing test/typecheck/browser/editor-behavior gates, including full navigation/typing suites, without owning missing-test design or correctness fixes.
argument-hint: '[gate command | behavior surface | full editor behavior]'
disable-model-invocation: true
name: slate-ar-gate
metadata:
  skiller:
    source: .agents/rules/slate-ar-gate.mdc
---

# Slate AR Gate

Handle $ARGUMENTS by loading `slate-ar` and running a measured gate loop.

Use this when the question is: "Can this existing proof surface pass
repeatably, and what does the failure evidence say?"

It is valid for full editor behavior testing: navigation, typing, selection,
clipboard, IME, focus, undo/redo, browser routes, package tests, `bun check`,
and focused Playwright suites. The catch: the gate command must already exist
or be obvious.

## Boundary

- `slate-ar-gate` owns repeated execution, duration metrics, pass/fail logging,
  crashes, flakes, dashboard state, and ASI.
- `testing`, `tdd`, `editor-test-harvester`, and `slate-patch` own missing
  oracle design.
- `slate-patch` owns real correctness failures found by the gate.
- `slate-plan` owns API/runtime redesign when the gate exposes a design issue.
- `slate-ar-perf` owns speed optimization after the correctness gate is stable.

Do not spin a failing gate forever. If a gate fails twice with the same
behavioral signal and the command shape is valid, route to `slate-patch`.

## Setup

Default metric is elapsed seconds, lower is better. For boolean behavior gates,
the metric tracks runtime and the log status carries truth:

- pass/no change: `measure`;
- pass after a useful change: `keep`;
- assertion failure: `checks_failed`;
- infra/runtime crash: `crash`;
- slower or noisier proof with no value: `discard`.

## Commands

Resolve the installed TheGreenCedar CLI through `slate-ar` first:

```bash
AR_CLI="$(find "${CODEX_HOME:-$HOME/.codex}/plugins/cache/thegreencedar-autoresearch/codex-autoresearch" -path '*/scripts/autoresearch.mjs' -print | sort -V | tail -1)"
test -n "$AR_CLI"
```

For an explicit gate command:

```bash
node "$AR_CLI" setup-plan --cwd .tmp/slate-v2 --name "<gate-name>" --metric-name "seconds" --benchmark-command "<gate command>" --benchmark-prints-metric false --checks-command "<gate command>"
node "$AR_CLI" checks-inspect --cwd .tmp/slate-v2 --command "<gate command>"
node "$AR_CLI" doctor --cwd .tmp/slate-v2 --explain
node "$AR_CLI" serve --cwd .tmp/slate-v2
node "$AR_CLI" next --cwd .tmp/slate-v2
node "$AR_CLI" log --cwd .tmp/slate-v2 --from-last --status measure --description "<gate result>"
```

If a gate crashes or times out after producing artifacts, run
`partial-results --from-last` before spending another full rerun. Log useful
partial evidence as diagnostic `measure`, not as promotion-grade proof.

For full editor behavior proof, prefer one focused command first, then broaden:

```bash
cd .tmp/slate-v2
bun check
bun check:full
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/<suite>.test.ts --project=chromium
```

Record intentionally skipped behavior families when a full suite is too broad
for the current proof.

## Handoff

Report command, pass/fail status, packet counts, repeated failure signature,
dashboard URL when served, and the next owner: continue gate, `slate-patch`,
`slate-plan`, or `slate-ar-perf`.

# Slate v2 Browser Stress Command Plan

## Status

Complete.

## Goal

Add a sparse, opt-in browser stress lane for Slate v2 editing behavior.

This must not slow default CI. The command should be useful when we need a
human-like browser sweep, release proof, or replay for a reported editing bug.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Default command: `bun test:stress`.
- Replay command: `STRESS_REPLAY=<artifact> bun test:stress:replay`.
- Default browser project: Chromium only.
- Default routes: small representative route set, filterable with
  `STRESS_ROUTES`.
- Default families: small representative operation family set, filterable with
  `STRESS_FAMILIES`.

## Non-Goals

- Do not add this to `bun check`.
- Do not add this to PR CI by default.
- Do not require all browser projects for local stress.
- Do not build a legacy comparison app in this slice.

## Plan

1. Inspect existing Playwright and `slate-browser` scenario infrastructure.
2. Reuse `scenario.run`, replay serialization, kernel trace checks, and DOM
   shape assertions.
3. Add generated stress cases under `playwright/stress`.
4. Write replay artifacts under `tmp/stress-artifacts`.
5. Add `test:stress` and `test:stress:replay` scripts.
6. Run focused verification for the stress tests and replay path.
7. Keep `tmp/completion-check.md` synchronized.

## Evidence Log

- 2026-04-26: User approved implementing the sparse stress command lane after
  the architecture verdict.
- 2026-04-26: Prior solution docs say browser stress must assert DOM shape,
  Slate selection helpers must normalize zero-width browser offsets, and
  Playwright subpath consumers may need a targeted `slate-browser` build.
- 2026-04-26: Existing `slate-browser/playwright` already exposes
  `scenario.run`, replay serialization, rendered DOM shape assertions,
  kernel trace checks, and runtime error capture.
- 2026-04-26: Added `playwright/stress/generated-editing.test.ts`,
  `playwright/stress/replay.test.ts`, and shared stress artifact utilities in
  `/Users/zbeyens/git/slate-v2`.
- 2026-04-26: Added opt-in scripts in `/Users/zbeyens/git/slate-v2/package.json`:
  `bun test:stress` and `bun test:stress:replay`. These scripts are not wired
  into `bun check`.
- 2026-04-26: First focused stress run exposed a browser helper regression:
  native multiline paste succeeded, but the fallback path duplicated inserted
  text because model text did not match block-separated DOM text. Fixed
  `packages/slate-browser/src/playwright/index.ts` to detect multiline paste by
  joined rendered block text before using fallback insertion.
- 2026-04-26: Default artifacts were written under
  `/Users/zbeyens/git/slate-v2/tmp/stress-artifacts/chromium/` for:
  `plaintext/select-all-multiline-paste`,
  `plaintext/select-all-type-delete-undo`,
  `richtext/select-all-multiline-paste`,
  `richtext/select-all-type-delete-undo`, and
  `forced-layout/select-all-multiline-paste`.
- 2026-04-26: Captured the non-obvious helper regression in
  `docs/solutions/logic-errors/2026-04-26-slate-browser-native-multiline-paste-success-must-block-fallback-insertion.md`.

## Verification

- `curl -fsS http://localhost:3100/examples/plaintext >/dev/null && echo ready || echo not-ready`
  -> `ready`
- `bun typecheck:root` -> passed.
- `bun --filter slate-browser test:proof` -> passed, 19 tests.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 STRESS_ROUTES=plaintext STRESS_FAMILIES=select-all-multiline-paste bun test:stress`
  -> failed before the helper fix with duplicated multiline paste, then passed
  after the fix.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun test:stress` -> passed, 5
  tests.
- `STRESS_REPLAY=tmp/stress-artifacts/chromium/plaintext/default-plaintext-select-all-multiline-paste.json PLAYWRIGHT_BASE_URL=http://localhost:3100 bun test:stress:replay`
  -> passed.
- `bun lint:fix` -> passed, formatted 3 files.
- `bun lint` -> passed, checked 1567 files.
- `bun --filter slate-browser typecheck && bun typecheck:root` -> passed.
- `STRESS_REPLAY=tmp/stress-artifacts/chromium/richtext/default-richtext-select-all-type-delete-undo.json PLAYWRIGHT_BASE_URL=http://localhost:3100 bun test:stress:replay`
  -> passed.

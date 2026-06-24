# Gate Evidence: yjs-pr20

Date: 2026-06-02
Target cwd: `/Users/felixfeng/Desktop/repos/plate-copy/.tmp/slate-v2`

## Summary

| Gate | Status | Runtime | Evidence | Route |
| --- | --- | ---: | --- | --- |
| `bun check` repeat 1 | pass | 38.28s | lint, typecheck, Bun tests, Slate React Vitest all passed. | none |
| `bun check` repeat 2 | pass | 22.72s | same gate passed again with cached package typecheck. | none |
| `bun test ./packages/slate-yjs/test` | pass | 0.32s | 106 pass, 0 fail across 16 files. This is the current replacement for the stale `core-contract` filename. | none |
| Yjs collaboration Playwright full file | checks_failed | 89.04s | 41 passed, 1 failed. Failure: `preserves remote appends when an offline replace is undone before reconnect`. | `slate-patch` |
| Yjs collaboration Playwright failed grep rerun | checks_failed | 11.26s | Same test failed with same signal. Peer B stayed `Hello world!` after clicking offline Replace; expected `Lin canonical snapshot.` | `slate-patch` |
| `bun check:full` | checks_failed | 21.37s | Embedded `bun check` passed, then `test:release-discipline` failed before browser integration. | release-discipline patch |
| `bun test ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1` | checks_failed | 0.68s | Same escape-hatch inventory count drift reproduced. | release-discipline patch |

## Stable Failure 1: Yjs Offline Replace Button

Command:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium
```

Failed test:

```text
yjs collaboration example › preserves remote appends when an offline replace is undone before reconnect
```

Repeated command:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "preserves remote appends when an offline replace is undone before reconnect"
```

Repeated signature:

```text
Locator: locator('#yjs-peer-b-editor-surface')
Expected substring: "Lin canonical snapshot."
Received string: "Hello world!"
playwright/integration/examples/yjs-collaboration.test.ts:920
```

Trace artifact:

```text
test-results/integration-examples-yjs-c-c09fd--is-undone-before-reconnect-chromium/trace.zip
```

Route: `slate-patch`. The command shape is valid, the focused grep reproduced, and the failure is behavior-level.

## Stable Failure 2: Escape-Hatch Inventory Drift

Command:

```bash
bun check:full
```

Failed before integration-local:

```text
bun test:release-discipline
packages/slate/test/escape-hatch-inventory-contract.ts
```

Repeated command:

```bash
bun test ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1
```

Repeated signature:

```text
actual:
  browser-proof-rows:primitive = 55
  browser-proof-rows:stale = 299
  slate-react-tests:bridge = 18
  slate-react-tests:stale = 1
expected:
  generated-package-output:stale = 21
  browser-proof-rows:primitive = 50
  browser-proof-rows:stale = 249
  slate-react-tests:bridge = 13
```

Route: release-discipline patch. This is a stable project gate failure, not a Yjs collaboration behavior failure.

## Not Reached

`bun check:full` did not reach `bun test:integration-local` because `test:release-discipline` failed first.

# Event Trace Covered Existing

## Scope

P114 checked whether the current 10h run should promote a research-derived
native event trace helper into `slate-browser`.

## Sources Sampled

- Prior artifact:
  `docs/slate-v2/research/2026-06-13-contenteditable-event-trace-oracles/`
- Current helper source:
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`
- Current proof:
  `.tmp/slate-v2/packages/slate-browser/test/core/playwright-native-event-trace.test.ts`
- Current docs:
  `.tmp/slate-v2/packages/slate-browser/README.md`

## Finding

The helper already exists and is documented. It captures the proof fields the
older research packet asked for: native event types, `beforeinput` target
ranges, native selection snapshots, DOM text-node deltas, rects, and anomaly
labels.

The plaintext route already exercises it through a desktop beforeinput
insertion row, so the lead is not just package-level infrastructure.

## Verification

- `bun test test/core/playwright-native-event-trace.test.ts`: 3 passed.
- `bun --filter ./packages/slate-browser typecheck`: passed.
- `bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --project=firefox --project=webkit --grep "captures native beforeinput trace while inserting text"`:
  3 passed.

## Decision

`covered-existing`. Do not duplicate the helper. Use it in the next route packet
that genuinely needs event-order or DOM-delta proof.

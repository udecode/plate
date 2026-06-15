# Contenteditable Event Trace Oracles

## Question

What should Slate v2 steal from `easylogic/contenteditable` for browser
proofs without copying catalog UI or claiming raw IME/device coverage?

## Scope

- Inspect local `../contenteditable` source snapshots.
- Focus on reusable event-trace and anomaly-detection shape.
- Do not patch Slate runtime from catalog snippets.
- Do not claim raw OS IME or mobile behavior from synthetic Playwright input.
- Route promoted work to `slate-browser` proof helpers and selection/input proof
  law first.

## Current Verdict

The useful lead is not another app-level test case. It is the trace format:
capture native `selectionchange`, `beforeinput`, `input`, and composition events
with browser selection, `beforeinput.getTargetRanges()`, DOM text-node snapshots,
input-time DOM deltas, endpoint identity, visual rects, and anomaly classes.

This belongs in `slate-browser` before runtime patches. That helper now exists:
`startSlateBrowserNativeEventTrace`, `takeSlateBrowserNativeEventTrace`,
`resetSlateBrowserNativeEventTrace`, and `stopSlateBrowserNativeEventTrace`
capture the event chain and DOM delta around selection/input operations, not
just final model text.

Kept doc promotion:

- `contenteditable:event-trace-anomaly-helper`
  - Owner: `slate-browser`
  - Kept in:
    `docs/slate-v2/selection-navigation-coverage.md#native-event-trace-contract`
  - Implementation:
    `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`
  - Proof:
    `.tmp/slate-v2/packages/slate-browser/test/core/playwright-native-event-trace.test.ts`
  - Action: browser-visible input/selection packets now have first-class trace
    helpers for native event ordering, target ranges, DOM deltas, visual rects,
    and anomaly classes.

Rejected:

- Do not port the catalog UI.
- Do not promote Korean/Safari/IME cases into synthetic Playwright-only claims.
- Do not run broad repo-wide greps as the normal research primitive; use source
  registries and bounded reads.

## Freshness

This packet used a local clone snapshot. P114 refreshed the local Slate-native
implementation/proof status in
`docs/slate-v2/research/2026-06-14-proof-methodology-refresh/`.
Re-open with a fresh web/GitHub scan only when the external source status or
browser support matrix itself matters.

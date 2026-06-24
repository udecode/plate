# Contenteditable Event Trace Oracles

## Question

What should Plite steal from `easylogic/contenteditable` for browser
proofs without copying catalog UI or claiming raw IME/device coverage?

## Scope

- Inspect local `../contenteditable` source snapshots.
- Focus on reusable event-trace and anomaly-detection shape.
- Do not patch Plite runtime from catalog snippets.
- Do not claim raw OS IME or mobile behavior from synthetic Playwright input.
- Route promoted work to `plite-browser` proof helpers and selection/input proof
  law first.

## Current Verdict

The useful lead is not another app-level test case. It is the trace format:
capture native `selectionchange`, `beforeinput`, `input`, and composition events
with browser selection, `beforeinput.getTargetRanges()`, DOM text-node snapshots,
input-time DOM deltas, endpoint identity, visual rects, and anomaly classes.

This belongs in `plite-browser` before runtime patches. That helper now exists:
`startPliteBrowserNativeEventTrace`, `takePliteBrowserNativeEventTrace`,
`resetPliteBrowserNativeEventTrace`, and `stopPliteBrowserNativeEventTrace`
capture the event chain and DOM delta around selection/input operations, not
just final model text.

Kept doc promotion:

- `contenteditable:event-trace-anomaly-helper`
  - Owner: `plite-browser`
  - Kept in:
    `docs/plite/selection-navigation-coverage.md#native-event-trace-contract`
  - Implementation:
    `.tmp/plite/packages/plite-browser/src/playwright/index.ts`
  - Proof:
    `.tmp/plite/packages/plite-browser/test/core/playwright-native-event-trace.test.ts`
  - Action: browser-visible input/selection packets now have first-class trace
    helpers for native event ordering, target ranges, DOM deltas, visual rects,
    and anomaly classes.

Rejected:

- Do not port the catalog UI.
- Do not promote Korean/Safari/IME cases into synthetic Playwright-only claims.
- Do not run broad repo-wide greps as the normal research primitive; use source
  registries and bounded reads.

## Freshness

This packet used a local clone snapshot. P114 refreshed the local Plite-native
implementation/proof status in
`docs/plite/research/2026-06-14-proof-methodology-refresh/`.
Re-open with a fresh web/GitHub scan only when the external source status or
browser support matrix itself matters.

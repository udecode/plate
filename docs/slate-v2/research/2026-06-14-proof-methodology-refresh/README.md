# Proof Methodology Refresh

## Question

After local stable routes, visual selection smoke, and huge-doc non-pagination
metrics are green, what proof-methodology gap should the 10h `slate-auto` run
close next?

## Scope

- Reuse existing Slate v2 research ledgers before creating new search branches.
- Focus on proof infrastructure for native selection, beforeinput/input,
  composition, DOM deltas, target ranges, visual rects, and anomaly labels.
- Do not patch runtime from research snippets.
- Do not enter pagination.
- Promote only to a Slate-native test/helper/docs owner or mark covered.

## Current Verdict

The strongest apparent lead was the native event trace helper from the earlier
`contenteditable:event-trace-anomaly-helper` research packet. Current
`slate-browser` already implements it:

- exported helpers:
  `startSlateBrowserNativeEventTrace`, `takeSlateBrowserNativeEventTrace`,
  `resetSlateBrowserNativeEventTrace`, and
  `stopSlateBrowserNativeEventTrace`;
- trace fields: event type, inputType, data, composing flag, target ranges,
  native selection snapshot, DOM text-node deltas, rects, and anomaly labels;
- package docs describe when to use native event traces instead of Playwright
  `locator.fill()`;
- the real plaintext example route already uses the helper for desktop native
  beforeinput insertion proof;
- focused proof passed.

Decision: `covered-existing`. Do not add another helper. Future selection,
IME, beforeinput, paste, and native-input bug packets should use the existing
trace helper when event ordering or DOM mutation timing matters.

## Proof

From `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-browser`:

```bash
bun test test/core/playwright-native-event-trace.test.ts
```

Result: 3 passed.

From `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:

```bash
bun --filter ./packages/slate-browser typecheck
```

Result: passed.

Also from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright \
  playwright/integration/examples/plaintext.test.ts \
  --project=chromium --project=firefox --project=webkit \
  --grep "captures native beforeinput trace while inserting text"
```

Result: 3 passed.

## Follow-Up

Next useful owner should be a route packet that uses the trace helper on a
new risky route, or another research lead. Do not build duplicate trace
infrastructure.

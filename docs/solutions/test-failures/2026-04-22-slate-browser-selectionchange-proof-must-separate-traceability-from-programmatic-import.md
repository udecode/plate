---
title: Slate browser selectionchange proof must separate traceability from programmatic import
date: 2026-04-22
category: docs/solutions/test-failures
module: Slate v2 slate-browser integration proof
problem_type: test_failure
component: testing_framework
symptoms:
  - A browser proof expected synthetic selectionchange to import a DOM caret at offset 4 into Slate.
  - Kernel traces showed selectionchange events, but Slate selection stayed at offset 0.
  - The DOM selection snapshot was correct while the model assertion stayed red.
root_cause: async_timing
resolution_type: test_fix
severity: high
tags: [slate-v2, slate-browser, selectionchange, kernel-trace, playwright, mobile]
---

# Slate browser selectionchange proof must separate traceability from programmatic import

## Problem

A Batch 1 closure row tried to prove two different contracts at once:
selectionchange traceability and pure programmatic DOM-selection import.
That made the test red for the wrong reason.

## Symptoms

- `selectDOMRange(...)` placed the visible DOM caret at `This is editable ` offset `4`.
- `getSelectionWithHandle(...)` kept returning Slate selection `[0, 0]@0`.
- Kernel traces contained allowed `selectionchange` events, but they reflected the existing selection rather than the synthetic DOM range.
- Mobile Playwright keyboard transport also mutated visible DOM differently than model selection, so semantic-handle transport remained the honest mobile proof.

## What Didn't Work

- Waiting only for the assertion did not fix the red row because the synthetic selectionchange could land inside the runtime's throttled selectionchange window.
- Dispatching `mousedown` manually did not reliably model the full user selection authority transition.
- A temporary runtime DOM-selection converter patch was rejected because it did not close the proof and would have been unverified patch debt.

## Solution

Split the proof:

- Assert selectionchange is emitted as an allowed kernel trace.
- Use the existing semantic selection handle for deterministic setup before the repair/text mutation step.
- Assert repair trace, model text, visible DOM text, model selection, and desktop DOM caret after the model-owned text path.
- Keep mobile on semantic-handle text transport unless the row explicitly claims native mobile keyboard transport.

```ts
await expect
  .poll(async () =>
    (await harness.get.kernelTrace()).some(
      entry => (entry as { eventFamily?: string }).eventFamily === 'selectionchange'
    )
  )
  .toBe(true)

await selectWithHandle(harness.root, {
  anchor: { path: [0, 0], offset: 4 },
  focus: { path: [0, 0], offset: 4 },
})
```

## Why This Works

Selectionchange traceability and programmatic DOM-selection import are separate contracts.
Batch 1 needed traceable kernel results and repair correctness. Programmatic import needs its own explicit API/proof in the next batch because synthetic selectionchange timing is not equivalent to a real user selection.

## Prevention

- Do not claim raw DOM-selection import from a test that uses synthetic selectionchange unless the import API itself is the contract.
- For browser editing closure, label mobile semantic-handle transport explicitly instead of pretending it proves native keyboard transport.
- If a test asserts a kernel event family, also assert illegal transitions stay empty.
- Keep failed proof attempts in the architecture ledger so future work does not repeat the same false claim.

## Related Issues

- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React model-owned input must ignore stale DOM target ranges](../ui-bugs/2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate browser Playwright helpers must normalize zero-width selection and wait for selection sync](../logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)

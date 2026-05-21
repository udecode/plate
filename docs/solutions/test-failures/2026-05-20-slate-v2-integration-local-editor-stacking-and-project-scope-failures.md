---
title: Slate v2 integration-local editor stacking and project scope failures
date: 2026-05-20
category: docs/solutions/test-failures
module: Slate v2 browser proof
problem_type: test_failure
component: testing_framework
symptoms:
  - "bun test:integration-local failed checklist and shadow DOM rows because Playwright clicks hit example wrappers instead of Editable text."
  - "A custom onDOMBeforeInput handler returned true but native beforeinput still inserted text."
  - "Mobile, Firefox, and WebKit projects ran rows that require unsupported desktop selection, privileged clipboard, or browser-specific native behavior."
  - "WebKit CSS font-size assertions failed on harmless serialization precision."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, playwright, integration-local, stacking-context, beforeinput, browser-projects]
---

# Slate v2 integration-local editor stacking and project scope failures

## Problem

`bun test:integration-local` was red for a mix of real Slate v2 runtime bugs, example CSS bugs, and Playwright project coverage that claimed more browser support than the row could honestly prove.

## Symptoms

- Checklist and shadow DOM examples missed click targets even though the editor content was visible.
- Iframe-backed examples repeated the same hit-testing failure inside the iframe document.
- Returning `true` from `onDOMBeforeInput` marked the event handled, but the browser still performed its native default insertion.
- Full matrix reruns exposed Firefox native-selection differences, WebKit clipboard limits, mobile desktop-keyboard rows, and WebKit CSS precision differences.

## What Didn't Work

- Treating the first visible Playwright miss as a test timing problem. The click was deterministic; the editable content was below the example wrapper in hit testing.
- Expanding retries or workers. The prior local-worker guidance still matters, but this run had real product/example failures.
- Making every browser project assert the same native selection and clipboard behavior. Those rows were overclaiming parity, not proving a product regression.

## Solution

Create a local stacking context around examples that contain an `Editable` with the runtime's negative `z-index` selection workaround:

```css
.example-content {
  position: relative;
  z-index: 0;
}
```

Apply the same ownership locally when the editor lives outside the normal page wrapper:

```tsx
<Editable placeholder="..." style={{ zIndex: 0 }} />
```

When a user `onDOMBeforeInput` handler returns a truthy non-null value, prevent the native default before reporting the event as handled:

```ts
const handled = onDOMBeforeInput?.(event)

if (handled != null) {
  if (handled) {
    event.preventDefault()
  }

  return true
}
```

Then narrow project coverage to what each row actually proves:

- Skip Firefox rows that depend on Playwright's exact native double-click, select-all, or placeholder drag selection shape.
- Skip WebKit rows that require privileged clipboard reads.
- Skip mobile rows that are desktop keyboard, synthetic target-range, or native paragraph-selection proofs.
- Compare WebKit CSS numeric values with tolerance instead of exact serialized strings.

## Why This Works

Slate's `Editable` uses a negative `z-index` workaround for browser selection behavior. Without a parent stacking context, Playwright can hit the visible wrapper instead of the editor text. Giving each example root its own stacking context keeps the workaround local and restores pointer ownership without changing editor behavior.

The beforeinput change matches the API contract: returning `true` says the handler owns the event. Ownership must include cancelling the browser default, otherwise Slate records the event as handled while the DOM still mutates natively.

The project skips make the integration suite honest. A row should prove one supported behavior on the browser projects that can actually exercise it; unsupported clipboard, mobile keyboard, and native-selection shapes should not masquerade as cross-browser regressions.

## Prevention

- When a visible Slate editor cannot be clicked in Playwright, inspect stacking context and hit testing before changing timeouts.
- Keep `onDOMBeforeInput` boolean-return tests tied to both command trace and native default cancellation.
- Add browser-project skips with a reason that names the unsupported browser primitive, not a vague flake label.
- For CSS computed values in WebKit, compare parsed numeric values with tolerance.
- Run the previously failing row matrix before the full integration gate, then rerun full `bun test:integration-local` with a local worker cap.

## Related Issues

- [Slate v2 integration-local should cap local Playwright workers before debugging editor failures](2026-04-24-slate-v2-integration-local-should-cap-local-playwright-workers-before-debugging-editor-failures.md)
- [Slate v2 Playwright webserver checks should run sequentially](../workflow-issues/2026-05-08-slate-v2-playwright-webserver-checks-should-run-sequentially.md)
- [Beforeinput substitutions must flush native text before replacement](../logic-errors/2026-05-09-beforeinput-substitutions-must-flush-native-text-before-replacement.md)

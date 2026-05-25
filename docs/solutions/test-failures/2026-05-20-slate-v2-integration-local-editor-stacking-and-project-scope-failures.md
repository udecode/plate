---
title: Slate v2 integration-local editor stacking and project scope failures
date: 2026-05-20
last_updated: 2026-05-23
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
tags: [slate-v2, playwright, integration-local, stacking-context, editable-defaults, beforeinput, browser-projects]
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

Slate React owns the default stacking on the public `Editable` root:

```tsx
style={{
  ...(disableDefaultStyles
    ? {}
    : {
        position: 'relative',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        zIndex: 0,
      }),
  ...userStyle,
}}
```

Package tests should pin the actual contract:

```tsx
expect(editable.style.zIndex).toBe('0')

render(
  <Slate editor={editor}>
    <Editable style={{ zIndex: 2 }} />
  </Slate>
)
expect(editable.style.zIndex).toBe('2')
```

Keep `disableDefaultStyles` as the opt-out for hosts that fully own root CSS.
Do not spread `style={{ zIndex: 0 }}` through examples to compensate for Slate
internals.

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

The public `Editable` root is the element users style, click, test, and pass
IDs/classes to. A negative default root z-index makes normal app code pay for an
internal selection workaround. Keeping the root visible and hittable by default
fixes comment-mode and removes repeated example-local z-index patches without a
new public prop.

If a browser selection case still needs a stacking workaround, fix that named
case in the selection/decorations runtime. Do not reintroduce a negative public
root default.

The beforeinput change matches the API contract: returning `true` says the handler owns the event. Ownership must include cancelling the browser default, otherwise Slate records the event as handled while the DOM still mutates natively.

The project skips make the integration suite honest. A row should prove one supported behavior on the browser projects that can actually exercise it; unsupported clipboard, mobile keyboard, and native-selection shapes should not masquerade as cross-browser regressions.

## Prevention

- When a visible Slate editor cannot be clicked in Playwright, inspect stacking
  context and hit testing before changing timeouts.
- The normal Slate example call site should stay plain:
  `<Editable className={editorCss} id="editor" />`.
- Do not keep per-example `style={{ zIndex: 0 }}` patches for default
  visibility. That is package-owned behavior.
- Keep `onDOMBeforeInput` boolean-return tests tied to both command trace and native default cancellation.
- Add browser-project skips with a reason that names the unsupported browser primitive, not a vague flake label.
- For CSS computed values in WebKit, compare parsed numeric values with tolerance.
- Run the previously failing row matrix before the full integration gate, then rerun full `bun test:integration-local` with a local worker cap.
- A separate toolbar/control focus row can still fail if an external button
  reads model-backed selection after focus leaves the editor. Treat that as a
  toolbar DX issue, not an `Editable` root stacking issue.

## Related Issues

- [Slate v2 integration-local should cap local Playwright workers before debugging editor failures](2026-04-24-slate-v2-integration-local-should-cap-local-playwright-workers-before-debugging-editor-failures.md)
- [Slate v2 Playwright webserver checks should run sequentially](../workflow-issues/2026-05-08-slate-v2-playwright-webserver-checks-should-run-sequentially.md)
- [Beforeinput substitutions must flush native text before replacement](../logic-errors/2026-05-09-beforeinput-substitutions-must-flush-native-text-before-replacement.md)

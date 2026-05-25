---
title: Slate React Chrome composition fallback must clean unmanaged projection DOM text
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Slate v2 slate-react IME projection DOM sync
problem_type: ui_bug
component: testing_framework
symptoms:
  - ProseMirror-style IME composition spanning decorated text nodes rendered `alすしすしbeta`.
  - The Slate model text was correct at `alすしbeta`, but the browser DOM kept an extra unmanaged `すし` text node.
  - The stale node sat outside Slate's `[data-slate-string="true"]` wrappers in a projection-backed text host.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, ime, composition, dom-sync, projections]
---

# Slate React Chrome composition fallback must clean unmanaged projection DOM text

## Problem

Chrome composition fallback inserted the committed IME text into the Slate
model, but a composition spanning decorated DOM nodes could leave the browser's
raw composition text in the rendered DOM. The model was right and the UI was
wrong, which is exactly the kind of bug a model-only assertion would miss.

## Symptoms

- The new highlighted-text proof expected `alすしbeta` but the visible DOM
  rendered `alすしすしbeta`.
- `editor.get.modelText()` returned `alすしbeta`.
- `editor.get.html()` showed the extra `すし` as a raw text node between Slate
  leaf spans, outside any `[data-slate-string="true"]` wrapper.

## What Didn't Work

- Treating the failure as a model insertion bug. The model had already imported
  the composition correctly.
- Relying on the normal projected text render to clean the DOM. Projection-backed
  text disables direct DOM text sync, and React did not remove the unmanaged
  browser text node that was inserted between keyed leaf fragments.
- Downgrading the proof to a model-only assertion. That would hide the user-
  visible duplicate.

## Solution

Keep Chrome's `compositionend` fallback as the model writer, then remove
unmanaged composition text nodes under Slate text hosts.

The cleanup is intentionally narrow:

- it only runs on the Chrome composition fallback path;
- it only scans `[data-slate-node="text"]` hosts;
- it removes text nodes whose content exactly matches the committed
  composition text;
- it skips all text inside `[data-slate-string="true"]`, which is Slate-owned
  rendered content.

The regression row lives in
`.tmp/slate-v2/playwright/integration/examples/highlighted-text.test.ts`:

```ts
await editor.selection.selectDOM({
  anchor: { path: [0, 0], offset: 2 },
  focus: { path: [0, 0], offset: 6 },
});

await commitDOMComposition(editor, {
  committedText: "すし",
  steps: ["す", "すし"],
});

await editor.assert.text("alすしbeta");
await editor.assert.domSelection({
  anchorNodeText: "lすし",
  anchorOffset: 3,
  focusNodeText: "lすし",
  focusOffset: 3,
});
```

## Why This Works

The Chrome fallback still owns model insertion because Chrome does not provide
the `insertFromComposition` beforeinput shape Slate needs. The extra text is a
separate DOM artifact from the browser composition mutation. Removing only
unmanaged text outside Slate string wrappers preserves the model-owned content
and deletes the stale browser artifact.

This matters most for projection-backed or decorated text because direct DOM
text sync is disabled there. Those surfaces rely on React rendering plus runtime
repair, so unmanaged browser nodes must be cleaned explicitly when the model is
already correct.

## Prevention

- IME tests for decorated or projected text must assert both model text and
  visible DOM text.
- When a composition proof fails with duplicated DOM but correct model text,
  inspect `editor.get.html()` for raw text outside `[data-slate-string="true"]`.
- Do not broaden the cleanup to all text nodes. Only remove unmanaged browser
  composition text outside Slate-owned string wrappers.
- Keep exact Android/iOS claims separate; this row proves Chromium desktop
  browser behavior, not raw-device keyboard closure.

## Related Issues

- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
- [Slate React unsynced DOM text ops must force React fallback](./2026-04-23-slate-react-unsynced-dom-text-ops-must-force-react-fallback.md)
- [Slate v2 placeholder IME proofs must commit on compositionend](../logic-errors/2026-04-04-slate-v2-placeholder-ime-proofs-must-commit-on-compositionend.md)

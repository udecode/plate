---
title: Slate React Chrome composition fallback must cancel model-owned overlap
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Slate v2 slate-react IME input runtime
problem_type: ui_bug
component: testing_framework
symptoms:
  - ProseMirror-style IME overlap proof rendered `---すし` after a model-owned replacement should have won.
  - Chrome compositionend fallback appended stale committed composition text after an overlapping model change.
  - A too-tight ownership guard skipped legitimate DOM-current composition commits and dropped decorated text.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, ime, composition, model-owned, chrome]
---

# Slate React Chrome composition fallback must cancel model-owned overlap

## Problem

Chrome's compositionend fallback wrote committed IME text even after a
model-owned command had already replaced the active composition range. The user
would see stale composition text appended after the model command's result.

## Symptoms

- The new overlap proof expected first block text `---`.
- The first run produced `---すし`.
- The fallback still inserted `event.data` from `compositionend` after the
  model-owned replacement had superseded the composition.
- A first attempt that required `selectionSource === 'composition-owned'`
  broke decorated spanning composition by producing `albeta` instead of
  `alすしbeta`.

## What Didn't Work

- Treating every `compositionend` payload as commit-worthy. That duplicates
  composition text after model-owned overlap.
- Treating every non-`composition-owned` selection source as canceled. Real DOM
  composition can temporarily report `dom-current`, and still must commit.

## Solution

Thread the input controller into composition-end handling and let the Chrome
fallback skip model insertion only when the active composition was superseded by
a model-owned command.

```ts
const shouldCommitChromeFallback =
  ReactEditor.isComposing(editor) &&
  inputController.state.selectionSource !== 'model-owned'

commitChromeCompositionEndFallback({
  editor,
  rootElement: event.currentTarget,
  shouldCommit: shouldCommitChromeFallback,
  text: event.data,
})
```

When `shouldCommit` is false, still remove unmanaged composition DOM text. That
keeps stale browser-owned text out of the rendered editor without writing it
back into the Slate model.

## Why This Works

During normal DOM composition, selection ownership can shift as the browser
moves the DOM caret. That alone is not cancellation. A model-owned command is a
stronger signal: Slate has deliberately moved or replaced the model selection,
so Chrome's later fallback payload is stale for that range.

The narrow guard keeps legitimate DOM-current composition commits alive while
dropping the stale payload after model-owned overlap.

## Prevention

- Pair overlap-cancel IME rows with adjacent normal composition rows; otherwise
  the fix can silently break DOM-current composition.
- Assert model text, visible text, model selection, DOM caret, and composition
  trace for Chrome fallback changes.
- Keep exact mobile-device claims separate. This proof is Chromium desktop
  browser behavior, not Android or iOS keyboard closure.

## Related Issues

- [Slate React Chrome composition fallback must clean unmanaged projection DOM text](./2026-05-07-slate-react-chrome-composition-fallback-must-clean-unmanaged-projection-dom-text.md)
- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)

---
title: Slate React native IME history boundaries need explicit push metadata
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Slate v2 slate-react IME input runtime
problem_type: ui_bug
component: testing_framework
symptoms:
  - A delayed Hiragana IME composition row undid all native text commits in one step.
  - Slate history merged adjacent insert_text operations without considering user pause boundaries.
  - The immediate native text plus IME composition row still needed to undo as one action.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, ime, history, native-input, undo]
---

# Slate React native IME history boundaries need explicit push metadata

## Problem

Lexical's `#2479` history row separates delayed IME/native text commits into
distinct undo steps. Slate's browser runtime imported the same native edits as
adjacent `insert_text` operations, and generic Slate history merged adjacent
text operations until something structural interrupted them.

## Symptoms

- First proof run of `undoes delayed Hiragana IME compositions as separate
history steps` inserted `すし もじあ`, but one undo returned the editor to the
  initial document.
- Waiting longer than the merge interval in the browser test did not matter,
  because Slate history only saw adjacent text operations.
- A broad history change would risk breaking the already-correct immediate row:
  native `a` plus immediate IME `す` should still undo together.

## What Didn't Work

- Relying on the generic `slate-history` adjacent text merge heuristic. It has
  no browser input timing context.
- Treating all IME commits as forced pushes. That would break immediate native
  text plus IME composition merging.
- Putting the policy in the test. The runtime needs to label delayed native
  text input commits before history receives them.

## Solution

Track the last browser-native text input time inside `slate-react` and attach
`history: { mode: 'push' }` only when the next browser-native text commit lands
after the merge interval.

The policy lives in
`.tmp/slate-v2/packages/slate-react/src/editable/input-history.ts`:

```ts
export const getNativeTextInputHistoryMetadata = (
  editor: Editor,
): EditorUpdateMetadata | undefined => {
  const currentTime = now();
  const previousTime = EDITOR_TO_LAST_NATIVE_TEXT_INPUT_TIME.get(editor);

  EDITOR_TO_LAST_NATIVE_TEXT_INPUT_TIME.set(editor, currentTime);

  if (
    previousTime !== undefined &&
    currentTime - previousTime > NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS
  ) {
    return { history: { mode: "push" } };
  }
};
```

Apply that metadata when the browser runtime imports native text:

- Chrome `compositionend` fallback insertion in `composition-state.ts`
- DOM input repair insertion in `dom-repair-queue.ts`

Keep the composition-predelete path on forced `merge`, because that path repairs
one logical composition commit.

## Why This Works

The generic history package should not guess browser pause semantics from
operation shape. Browser-native text input is the layer that knows when a real
user input commit happened, so it can label delayed commits as new undo units.

Immediate native typing and immediate IME composition still merge because the
metadata helper returns no explicit push inside the interval. Delayed input
commits push a fresh batch before history's adjacent-text heuristic can merge
them.

## Prevention

- When porting Lexical/ProseMirror IME history rows, check whether the reference
  behavior depends on user timing, not just operation shape.
- Keep immediate and delayed history rows together; one protects merge behavior,
  the other protects split behavior.
- Prefer explicit `history` metadata at the browser input boundary over global
  changes to `slate-history` unless the generic history contract itself is
  wrong.

## Related Issues

- [Slate React Chrome composition fallback must cancel model-owned overlap](./2026-05-07-slate-react-chrome-composition-fallback-must-cancel-model-owned-overlap.md)
- [Slate React iOS Korean Backspace must stay native-owned](./2026-05-07-slate-react-ios-korean-backspace-must-stay-native-owned.md)
- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)

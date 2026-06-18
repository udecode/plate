---
title: Slate React IME replacement undo must merge native pre-delete
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Slate v2 slate-react composition runtime
problem_type: ui_bug
component: testing_framework
symptoms:
  - Undoing a trusted Chromium IME replacement over an expanded selection removed only the inserted IME text.
  - The original selected text was already deleted by compositionstart and did not come back on undo.
  - The translated Lexical history row passed only after the pre-delete and fallback insert shared one history batch.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, ime, composition, history, undo]
---

# Slate React IME replacement undo must merge native pre-delete

## Problem

The Lexical history row for retaining selection after undoing IME replacement
exposed a Slate v2 history split. Trusted Chromium IME over an expanded
selection deleted the selected model text at `compositionstart`, then the Chrome
`compositionend` fallback inserted committed text as a separate history entry.

## Symptoms

- Replacing the selected `b` in `ab` with IME text produced `aす`.
- One undo left `a` instead of restoring `ab`.
- Selection restoration could not be trusted because the selected text and IME
  insert lived in separate undo batches.

## What Didn't Work

- Treating composition replacement as a plain fallback insert. That fixes simple
  composition, but it forgets the earlier native-owned selection deletion.
- Moving all composition fallback inserts into merge mode. Simple composition
  should keep its existing history behavior; only replacement paths need the
  pre-delete merge.

## Solution

Track only the trusted native replacement path:

```ts
const EDITOR_TO_COMPOSITION_PREDELETE = new WeakSet<Editor>();
```

When `compositionstart` sees an expanded selection on a trusted native event,
delete the fragment and mark that editor as having a composition pre-delete.
When `compositionend` commits through the Chrome fallback, consume that flag and
insert with history merge metadata:

```ts
editor.update(
  (tx) => {
    tx.text.insert(text);
  },
  { metadata: { history: { mode: "merge" } } },
);
```

The regression row lives in
`apps/www/tests/slate-browser/donor/examples/rendering-strategy-runtime.test.ts`
as `restores expanded selection after undoing IME replacement`. It uses
Chromium CDP IME composition over a backward DOM selection and asserts text plus
selection after undo.

## Why This Works

Trusted browser IME replacement is a two-phase edit from Slate's point of view:
the model selection is removed before the committed text is inserted. Users see
one replacement action, so history must store it as one undoable action. The
WeakSet keeps that merge scoped to the exact replacement path and is cleared on
composition end, so normal composition commits do not get silently coalesced.

## Prevention

- For native IME replacement rows, assert undo restores both text and selection.
- Track composition ownership transitions explicitly instead of inferring them
  from the committed text alone.
- Do not use a global history merge for all composition fallback commits; merge
  only when a trusted native pre-delete happened.

## Verification

- `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|restores expanded selection after undoing IME replacement|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`
- `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|replaces multiple formatted text nodes with Korean IME composition" --retries=0`
- `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "deletes shell-backed selection after WebKit compositionend" --retries=0`
- `bun playwright test playwright/integration/examples/richtext.test.ts --project=webkit --grep "deletes rich text (selection|line selection) after WebKit compositionend" --retries=0`
- `bun run lint:fix packages/slate-react/src/editable/composition-state.ts playwright/integration/examples/rendering-strategy-runtime.test.ts playwright/integration/examples/richtext.test.ts`
- `bun typecheck:root`

## Related Issues

- [Slate React IME formatted selection replacement needs native-owned cleanup](./2026-05-07-slate-react-ime-formatted-selection-needs-native-owned-cleanup.md)
- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)

---
title: Slate v2 empty inline Backspace must path-delete the inline
date: 2026-05-07
category: docs/solutions/logic-errors
module: slate-v2 core delete planner
problem_type: logic_error
component: tooling
symptoms:
  - Backspace after clearing an editable inline deleted the preceding space.
  - The empty inline remained in the model after the destructive key.
  - Browser selection was already inside the empty inline before Backspace.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, delete, inline, backspace, slate-browser]
---

# Slate v2 empty inline Backspace must path-delete the inline

## Problem

The inlines example reproduced #5972: after clearing the editable inline text,
pressing Backspace deleted the character before the inline instead of deleting
the empty inline itself.

## Symptoms

- The red browser row produced `an!` instead of `an !`.
- Core package proof showed the same bug: the previous text became `an`, the
  empty inline stayed present, and the following text stayed separate.
- DOM import was not the owner. The model selection before the failing
  Backspace was already `[0,3,0]@0` in the empty inline.

## What Didn't Work

- Treating the first browser failure as product behavior. The DOM caret in an
  empty text node uses the FEFF native offset `1`; Slate selection still maps to
  offset `0`.
- Returning the previous offset point from collapsed delete target resolution.
  That preserved the preceding text, but it still left the empty inline in the
  model.
- Patching React keydown would have duplicated delete semantics outside the
  model-owned delete planner.

## Solution

Classify Backspace at the start of an empty editable inline before resolving the
normal character target. In that case, the delete target is the inline element
path, not a text range into the previous leaf.

```ts
const emptyInlinePath =
  reverse && unit === 'character' && distance === 1
    ? getEmptyEditableInlinePathAtPoint(editor, at)
    : null

if (emptyInlinePath) {
  return {
    kind: 'path',
    path: emptyInlinePath,
    fallbackPoint:
      EditorApi.before(editor, emptyInlinePath, { voids: true }) ??
      EditorApi.after(editor, emptyInlinePath, { voids: true }),
    initialAt,
  }
}
```

The classifier must reject void and read-only inline nodes:

```ts
NodeApi.isElement(parent) &&
  getEditorSchema(editor).isInline(parent) &&
  !getEditorSchema(editor).isVoid(parent) &&
  !getEditorSchema(editor).isReadOnly(parent) &&
  NodeApi.string(parent) === ''
```

Lock it with both proof layers:

```bash
bun test ./packages/slate/test/delete-contract.ts --test-name-pattern "empty editable inline"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --grep "empty editable inline"
```

## Why This Works

Collapsed character Backspace normally asks `Editor.before(..., unit:
'character')` for the target. At the start of an empty inline, that target is
the preceding text character, so the planner deletes real content.

An empty editable inline is different. There is no inline text character to
delete. The user intent is structural: remove the empty inline and place the
caret at the adjacent valid point. Path delete gives core deletion the right
operation shape, lets adjacent text merge normally, and keeps React/browser
repair on the model-owned path.

## Prevention

- Browser delete rows must assert the text before the inline, not only that the
  inline's own text disappeared.
- When a collapsed delete starts inside an empty structural node, classify the
  structural target before falling back to character-range deletion.
- Keep DOM and Slate selection assertions separate around empty text nodes:
  native FEFF offset `1` can still be Slate offset `0`.
- Pair browser repros with core delete contract tests when the model selection
  is already correct before the key event.

## Related Issues

- #5972
- [Slate v2 delete selection normalization must distinguish inline spacers from inline targets](./2026-04-14-slate-v2-delete-selection-normalization-must-distinguish-inline-spacers-from-inline-targets.md)
- [Slate v2 destructive delete must clean empty leaves before render](./2026-04-25-slate-v2-destructive-delete-must-clean-empty-leaves-before-render.md)
- [Slate browser Playwright helpers must normalize zero-width selection and wait for selection sync](./2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)

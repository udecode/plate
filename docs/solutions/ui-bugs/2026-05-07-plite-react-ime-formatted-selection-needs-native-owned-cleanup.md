---
date: 2026-05-07
problem_type: ui_bug
component: slate-react
root_cause: logic_error
title: Plite React IME formatted replacement needs deferred native cleanup
tags:
  - slate-react
  - ime
  - composition
  - chromium
  - formatting
  - dom
severity: high
---

# Plite React IME formatted replacement needs deferred native cleanup

## What happened

The Korean IME row for replacing multiple formatted text nodes exposes two
different failure modes in Plite rich text:

- publishing a model deletion while Chromium owns the native composition range
  can crash the page
- committing the model without owned DOM cleanup can leave stale browser
  composition text in the rendered DOM

The visible result can be a Chrome load-failure page, duplicated text such as
`가나다가나다`, or unformatted DOM text that is absent from Plite state.

## What did not work

- Deleting the expanded model selection on `compositionstart`. React can remove
  or merge the selected leaves while Chromium still holds native composition
  endpoints inside them.
- Publishing a document or React composition-state change synchronously, or at
  the `compositionend` microtask checkpoint. Blink may not have released its
  native composition state yet.
- Trusting React rerender alone to clean up browser-mutated text. The mutated
  prefix leaf can be memoized as unchanged, so React does not necessarily
  overwrite the text node.
- Cleaning browser-mutated text outside Plite's owned DOM-mutation scope. The
  DOM integrity observer can classify that cleanup as external damage and
  restore it.
- Asserting only DOM text. The DOM can look correct while `editor.get.modelText()`
  still contains the old model text.

## Solution

Treat native composition as a temporary browser transaction:

- `compositionstart` captures visible marks and enters composition state without
  changing the document or expanded model selection
- selection import and React reconciliation leave the browser-owned range alone
  while composition is active
- `compositionupdate` stores the latest composition text
- `compositionend` captures the expanded model target and current model text,
  then schedules composition release, fallback commit, and cleanup in an owned
  macrotask
- the normal final input path replaces the captured range in one transaction
- the Chrome fallback performs the same targeted replacement only when the
  model still matches the captured pre-input text; otherwise it runs cleanup
  only
- stale composition DOM is removed inside
  `runOwnedDOMMutation('composition', ...)`

Chromium proof uses CDP `Input.imeSetComposition` and asserts page health, DOM
text, Plite model text, mark preservation, caret, and composition ownership.

## Why this works

IME replacement across formatted leaves is not just "insert text". Chromium
temporarily owns a composition range whose endpoints can sit inside several
React-managed leaves. Any model publication that removes or merges those leaves
before the browser releases the range gives React and Chromium conflicting DOM
ownership.

Preserving the model selection gives the final input path and the deferred
fallback the same stable replacement target. One targeted transaction removes
the selected content, inserts the composed text with captured marks, updates the
selection, and gives history one logical edit. Deferred owned cleanup removes
browser-only text without racing Blink or the DOM integrity observer.

## Reusable rule

For Plite IME proofs:

- never publish a document change or rerender selected leaves during the native
  composition event stack
- preserve the expanded model range until final input or a deferred fallback
  replaces it atomically
- let final input win; a fallback commits only when the model has not changed
- defer composition release and fallback work past `compositionend`
- run browser-owned text cleanup inside the composition DOM-mutation owner
- assert page health, model text, rendered text, marks, selection, and undo

## Verification

- `pnpm --filter @platejs/plite-react test -- composition-state-contract.test.ts input-history-contract.test.ts`
- `pnpm --filter plite test:plite-browser:chromium richtext.test.ts --grep "replaces multiple formatted text nodes with Korean IME composition"`

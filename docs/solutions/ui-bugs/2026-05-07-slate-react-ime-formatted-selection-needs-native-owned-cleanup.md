---
date: 2026-05-07
problem_type: ui_bug
component: slate-react
root_cause: logic_error
title: Slate React IME formatted selection replacement needs native-owned cleanup
tags:
  - slate-react
  - ime
  - composition
  - chromium
  - formatting
  - dom
severity: high
---

# Slate React IME formatted selection replacement needs native-owned cleanup

## What happened

The Lexical Korean IME row for replacing multiple formatted text nodes exposed
two different failure modes in Slate v2 rich text:

- a synthetic DOM range replacement could crash React with
  `NotFoundError: Failed to execute 'removeChild' on 'Node'`
- the real Chromium CDP path could commit the model while leaving stale browser
  composition text in the rendered DOM

The visible result was duplicated text like `가나다가나다`, or unformatted DOM text
that was not present in Slate state.

## What did not work

- Treating all composition starts the same. Pre-deleting the model selection is
  correct for trusted Chromium IME replacement, but it double-owns the DOM when a
  synthetic proof already rewrites the range by hand.
- Trusting React rerender alone to clean up browser-mutated text. The mutated
  prefix leaf can be memoized as unchanged, so React does not necessarily
  overwrite the text node.
- Asserting only DOM text. The DOM can look correct while `editor.get.modelText()`
  still contains the old model text.

## Solution

Keep the ownership split explicit:

- trusted native composition may delete the expanded model selection on
  `compositionstart`
- synthetic composition keeps the model selection intact and lets the proof's
  DOM mutation stand
- composition start synchronously captures visible marks and writes them to
  runtime marks before native text insertion
- composition update stores the latest composition text
- composition end uses that stored text to clean stale browser-owned text nodes,
  including managed Slate string nodes whose model leaf does not contain the
  composition text
- model-owned text insertion during composition requests a render/caret repair

The proof now uses Chromium CDP `Input.imeSetComposition`, mirroring Lexical's
native route, and asserts DOM text, Slate model text, mark preservation, caret,
and composition trace ownership.

## Why this works

IME replacement across formatted leaves is not just "insert text". The browser
owns a temporary composition region, but Slate owns the committed model. During
trusted native IME, deleting the model selection before commit makes the later
native insert land at the right logical position. During synthetic DOM proofs,
pre-delete is wrong because the test already mutates the live DOM range.

The cleanup step is needed because Chromium can mutate an existing managed text
node for the live composition, while the committed Slate model renders the final
text in a different marked leaf. Resetting only managed strings whose DOM text is
the model text plus the committed composition text removes the browser-owned
tail without touching the actual committed Slate text.

## Reusable rule

For Slate v2 IME proofs:

- always assert model text, not only rendered DOM text
- use CDP/native composition for Chromium rows copied from Lexical
- gate model pre-delete on trusted native composition events
- preserve active marks before native text insertion
- cleanup browser-owned composition text on `compositionend` using the latest
  composition update text when `compositionend.data` is empty

## Verification

- `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|replaces multiple formatted text nodes with Korean IME composition" --retries=0`
- `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`
- `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/mutation-controller.ts playwright/integration/examples/richtext.test.ts`
- `bun typecheck:root`

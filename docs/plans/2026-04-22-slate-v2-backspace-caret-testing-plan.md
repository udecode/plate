---
date: 2026-04-22
topic: slate-v2-backspace-caret-testing-plan
status: planned
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
related:
  - docs/plans/2026-04-22-slate-v2-editable-browser-kernel-refactor-plan.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-cut-proof-must-use-real-shortcut-and-assert-selection.md
---

# Slate v2 Backspace/Caret Testing Plan

## Goal

Close the missing browser-editing coverage that let Backspace remove the
visible cursor from the editor and leave the user unable to continue typing.

The plan is TDD-first:

- write one failing browser row
- verify the failure is the expected user-visible bug
- fix the smallest owner
- rerun the row
- expand coverage only after the tracer bullet is green

No horizontal mega-suite. One user behavior at a time.

## Hard Take

The current test suite is still too optimistic about deletion.

It proves many model and direct-sync paths, but the important user claim is:

- user presses Backspace
- content changes correctly
- Slate selection remains non-null and correct
- DOM selection remains inside the editor
- visible caret is still where typing continues
- the next typed character lands at the caret

If a row does not prove follow-up typing after deletion, it does not close this
bug class.

## Current Coverage Truth

Already strong:

- browser insert/caret rows in `richtext.test.ts`
- visual caret rows after browser insertion
- undo after browser/model edits
- decorated copy/cut/paste proof
- large-document direct-sync delete backward/forward through semantic handles
- shadow DOM line-break typing
- IME composition row

Missing or weak:

- native Backspace in normal `richtext` after browser-selected caret
- native Backspace after browser insertion at end-of-block
- native Backspace after browser insertion before punctuation
- native Backspace inside custom-rendered/decorated leaf
- follow-up typing after Backspace
- DOM selection/caret assertions after Backspace
- selection-null regression assertions after Backspace
- native Delete key parity with Backspace in normal richtext
- range delete by native Backspace/Delete with follow-up typing
- cross-browser classification for Backspace rows

## Primary Bug Contract

For every Backspace/Delete user-path row, assert all four layers:

1. Model text.
2. Slate selection.
3. Visible DOM text.
4. DOM selection/caret.

Then type a follow-up character and assert it lands at the same logical caret.

Required post-delete assertions:

```ts
await editor.assert.text(expectedText)
await editor.assert.selection(expectedSelection)
await editor.assert.domSelection(expectedDOMSelection)
await editor.type('Z')
await editor.assert.text(expectedTextAfterFollowUpTyping)
await editor.assert.selection(expectedSelectionAfterTyping)
```

For rows not yet migrated to `slate-browser`, equivalent local helpers in
`richtext.test.ts` must still assert model text, DOM text, model selection, DOM
selection, and follow-up typing.

## Test Owner Files

Primary browser rows:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/playwright/integration/examples/large-document-runtime.test.ts`
- `../slate-v2/playwright/integration/examples/shadow-dom.test.ts`
- `../slate-v2/playwright/integration/examples/editable-voids.test.ts`

Helper owner:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`

Product owners if rows fail:

- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx` only if the
  coordinator or wrapper wiring is the measured owner

## TDD Sequence

### Phase 1: Red Tracer Bullet

Add one Chromium row to `richtext.test.ts`:

Name:

```ts
test('keeps caret editable after browser Backspace at selected text end', ...)
```

Setup:

- open `/examples/richtext`
- select/collapse at the end of the first block using real DOM selection when
  supported
- press native `Backspace`

Assertions:

- text removed one character from the first block
- Slate selection is not `null`
- Slate selection collapsed at the new logical end
- DOM selection is collapsed inside the editor text node
- visual caret remains at the new end of the first block
- typing `Z` lands at that caret

Expected first failure:

- either Slate selection becomes `null`
- or DOM selection leaves the editor
- or follow-up typing does not land

If the row passes immediately:

- tighten the row to match the reported bug:
  - use the exact richtext block/location from the manual repro
  - assert DOM caret node/offset, not only model selection
  - assert follow-up typing

Earliest command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace at selected text end"
```

### Phase 2: Fix The Measured Owner

Do not guess.

Classify the failure:

- `keyboard-input-strategy` if native Backspace handling prevents browser
  selection repair or routes wrong delete intent
- `model-input-strategy` if deletion updates model but loses collapsed
  selection
- `selection-reconciler` if model selection is correct but DOM/caret is wrong
- `dom-repair-queue` if post-commit repair is needed after model-owned delete
- `EditableDOMRoot` only if the coordinator wiring prevents the right owner from
  running

Minimal fix rules:

- preserve browser-editing semantics
- do not add test-only hooks
- do not use model-only repair for visual caret bugs
- if deleting selected/range content, preserve the deletion start point with a
  ref and restore model + DOM selection after mutation

Green command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace at selected text end"
```

### Phase 3: Expand Native Backspace Rows

Add rows one at a time.

Rows:

- Backspace after browser insertion at block end.
- Backspace before trailing punctuation.
- Backspace inside a normal text leaf.
- Backspace inside a custom-rendered leaf.
- Backspace after selected range delete.

Each row must include follow-up typing.

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace"
```

### Phase 4: Native Delete Forward Rows

Mirror the Backspace suite for Delete/forward-delete.

Rows:

- Delete at browser-selected middle point.
- Delete before punctuation.
- Delete across selected range.
- Delete then follow-up typing.

Do not use semantic handle proof for these rows unless the specific behavior is
not native browser transport.

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Delete"
```

### Phase 5: Decorated Text Delete Coverage

Use `highlighted-text.test.ts`.

Rows:

- Backspace at decorated boundary.
- Delete at decorated boundary.
- Range delete across decorated multi-leaf text.
- Follow-up typing after each delete.

Assertions:

- semantic text
- Slate selection
- DOM selection
- highlight wrapper still present when expected
- no render-only wrapper leaks into selected text/clipboard behavior

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "delete|Backspace"
```

### Phase 6: Inline/Void Delete Coverage

Use current inline/void examples if supported by the final API surface.

Rows:

- Backspace next to inline void mention/card.
- Delete next to inline void mention/card.
- Backspace selected inline void.
- Follow-up typing after deletion.

If an example/test only exists for dead legacy behavior, hard-cut or rewrite it
instead of preserving stale expectations.

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
```

### Phase 7: Large Document Runtime Delete Coverage

Current large-doc rows use semantic handles for direct-sync delete. Add native
or shell-path rows where honest.

Rows:

- Native Backspace after activating/mounting a shell.
- Native Delete after activating/mounting a shell.
- Backspace after direct DOM text sync.
- Delete after direct DOM text sync.
- Follow-up typing after each delete.

Keep semantic-handle rows only for model-path proof. User-path rows need native
keyboard transport.

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "delete|Backspace"
```

### Phase 8: Shadow DOM Delete Coverage

Rows:

- Backspace in Shadow DOM editor.
- Delete in Shadow DOM editor.
- Backspace after line break in Shadow DOM.
- Follow-up typing after deletion.

Focused command:

```sh
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "Backspace|Delete|line"
```

### Phase 9: Browser Matrix Expansion

After Chromium rows are green:

1. Firefox.
2. WebKit.
3. Mobile.

Do not blanket skip.

For each failing project:

- classify as product-owned, browser-owned, test-harness-owned, or accepted
  platform limitation
- keep the row if it describes supported behavior
- rewrite the row if the transport is impossible but the behavior is supported
  through another honest path
- document accepted/deferred rows with exact rationale

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=firefox --grep "Backspace|Delete"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=webkit --grep "Backspace|Delete"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=mobile --grep "Backspace|Delete"
```

## Coverage Matrix

| Lane | Current confidence | Needed proof |
| --- | --- | --- |
| Insert after browser selection | Good | Keep existing caret rows |
| Backspace after browser selection | Bad | Native Backspace + model/DOM/caret + follow-up typing |
| Delete after browser selection | Bad | Native Delete + model/DOM/caret + follow-up typing |
| Expanded range delete | Medium | Native Backspace/Delete rows, not only semantic handles |
| Decorated text delete | Weak | Highlighted-text delete/backspace rows |
| Inline/void delete | Weak | Void/inline deletion + follow-up typing |
| Large-doc delete | Medium | Add native user-path rows beside semantic-handle rows |
| Shadow DOM delete | Weak | Backspace/Delete inside Shadow DOM |
| IME deletion | Not active owner | Add only after basic deletion rows are stable |
| Mobile deletion | Unknown | Expand after Chromium owner is closed |

## Final Gate For This Coverage Lane

Required focused gate:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace|Delete|visual caret|browser-selected end"
```

Required expanded Chromium gate:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium
```

Required package gates after product changes:

```sh
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Final release-quality gate:

```sh
bun test:integration-local
```

`bun test:integration-local` can close the lane only if failures/skips are
classified explicitly. A green focused Chromium suite is not full browser
editing closure.

## Stop Rule

Stop only when:

- all Backspace/Delete Chromium rows are green
- every row asserts model text, model selection, visible DOM text, DOM
  selection/caret, and follow-up typing where relevant
- non-Chromium/mobile rows are green or explicitly classified
- package gates pass
- no known Backspace/Delete cursor-loss path remains untested

Do not stop at one fixed Backspace row. That would repeat the exact mistake
that let this bug through.

---
title: Plite large paste fast path must still be a logical operation
date: 2026-05-05
last_updated: 2026-05-06
category: docs/solutions/performance-issues
module: Plite clipboard paste runtime
problem_type: performance_issue
component: tooling
symptoms:
  - "A 10,000-line plaintext paste needed an issue-size benchmark before any #5945 claim."
  - "Populated-editor large copy/paste needed its own #4056 benchmark before any claim."
  - "A 50,000-block two-node cut needed its own #5992 benchmark before any claim."
  - "The old multiline plaintext paste path created thousands of split/insert operations."
  - "A snapshot replacement fast path made output fast but produced no history operation."
  - "Trusted Plite fragment paste into an empty block still used many insert_node operations."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plite
  - clipboard
  - paste
  - performance
  - history
  - replace-fragment
  - replace-children
---

# Plite large paste fast path must still be a logical operation

## Problem

Large paste cannot be treated as repeated typing. The old multiline plaintext
fallback split text into lines, then looped through `splitNodes` and
`insertText`, creating thousands of operations for one user action.

The tempting fast path, direct snapshot replacement, is also wrong: it makes the
tree change cheap, but history and operation observers see nothing.

## Symptoms

- The 2,000-line benchmark showed insertion/operation churn dominating the
  clipboard path.
- The first red package test expected one logical paste operation and got many.
- The snapshot replacement attempt made the output test pass but left
  `editor.history.undos` empty.
- Trusted Plite fragment paste into an empty block still produced repeated
  `insert_node` work.

## What Didn't Work

- Optimizing newline splitting. Splitting was noise; insertion and
  normalization pressure were the real cost.
- Reusing direct snapshot replacement. It bypassed operation history, so undo
  could not represent the paste as one user action.
- Counting a fast model mutation as enough proof. Paste needs output shape,
  operation count, undo behavior, browser proof, and issue-size benchmark
  evidence.

## Solution

Add a real child-window replacement operation and use it for high-pressure paste
and exact whole-child range delete cases:

- `packages/plite/src/interfaces/operation.ts` defines and inverts
  `replace_children`.
- `packages/plite/src/interfaces/transforms/general.ts` applies
  `replace_children` by replacing one child slice at the target path and setting
  the new selection.
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts` uses
  `replace_children` for multiline plaintext paste into a single empty text
  block.
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts` converts multiline
  plaintext paste in populated text-block targets into a normal model fragment
  instead of looping line-by-line.
- `packages/plite/src/transforms-text/insert-fragment.ts` uses
  `replace_children` for trusted Plite fragment paste into a single empty text
  block and compatible, marked, inline-child, full-document text-block, and
  selected whole top-level structural block targets.
- `packages/plite/src/transforms-text/insert-fragment.ts` fits top-level
  multi text-block fragments into a populated text-block target as one child
  window replacement while preserving surrounding text and selection.
- `packages/plite/src/transforms-text/delete-text.ts` uses `replace_children`
  for exact whole top-level block range deletes instead of emitting repeated
  `remove_node` operations.
- `packages/plite/src/interfaces/node.ts` slices exact whole top-level block
  fragments directly so copy/cut of two blocks from a huge document does not
  scan and prune every unselected sibling.
- `packages/plite-dom/test/clipboard-boundary.ts` locks selected inline-void
  paste into a text target to one logical operation.
- `packages/plite/test/collab-history-runtime-contract.ts` proves
  `replace_children` can be exported from a local paste or range-delete commit
  and imported
  through `tx.operations.replay(...)` with remote collaboration metadata.

Lock it with behavior tests:

```ts
expect(operationCount).toBeLessThanOrEqual(1)
expect(editor.history.undos).toHaveLength(1)
```

Then prove the issue-size workload with a dedicated benchmark command:

```bash
bun run bench:slate:5945:issue
```

The verified 10,000-line plaintext paste row ran in `38.57ms` with `1`
operation.

The populated-editor #4056 issue rows now cover both sides of the old report:
copying 10,000 populated blocks ran in `12.16ms`, and pasting 10,000 plaintext
lines into the middle of a 10,000-block populated editor ran in `185.49ms` with
`1` operation.

The #5992 issue-size cut row now separates the user interaction from cold
snapshot setup. On the exact 50,000-block shape, the warm edit lane ran in
`9.95ms`, warm copy-plus-delete ran in `8.62ms`, and the edit emitted `1`
operation. The cold first-edit row still records snapshot allocation separately
at `171.91ms`. That split matters: interaction performance was fixed by
`replace_children`, while cold snapshot allocation remains a separate runtime
cost to keep visible.

Browser proof also needs an editor-scale row, not only a package benchmark. The
generated editing stress suite covers a 5,000-block huge-document cut row plus
the existing plaintext/richtext/forced-layout paste-normalize-undo rows:

```bash
STRESS_FAMILIES=huge-document-cut,paste-normalize-undo \
PLAYWRIGHT_RETRIES=0 \
bunx playwright test playwright/stress/generated-editing.test.ts \
  -g "huge-document-cut|paste-normalize-undo" --project=chromium
```

## Why This Works

Paste and exact whole-child range delete are each one user intention.
Representing them as one child-window operation gives the runtime the fast path
it needs without erasing history, selection repair, dirty-path classification,
or future collaboration lowering.

Direct snapshot replacement is only safe for internal state reset paths. A user
paste must remain observable as an edit.

For collaboration, `replace_children` is the Plite replay contract for child
window replacement. CRDT/Yjs adapters that cannot store subtree replacement
atomically should lower it at the adapter boundary, not by forcing paste or
range delete back through thousands of Plite operations.

## Prevention

- When optimizing editor mutations, verify the operation stream and undo stack,
  not only final document shape.
- Do not use snapshot replacement for user-facing edits unless the caller
  explicitly wants to bypass history and observers.
- Add an issue-size benchmark before claiming a large-paste issue fixed.
- Keep #5992 cut proof separate from #5945 empty-editor paste proof and #4056
  populated-editor paste/copy proof.
- For range-delete performance, report warm interaction rows separately from
  cold snapshot allocation. A cold first-edit benchmark can hide the fact that
  the operation path is already fixed.
- For non-empty text-block paste, preserve marked text as separate leaves
  instead of flattening it into the surrounding text.
- For inline text-block paste, merge only same-prop adjacent text leaves and
  keep inline children in the replacement slice.
- For whole top-level block selections, replace the root child slice directly
  and keep structural fragments, such as lists, as sibling units.
- If a new operation is not collaboration-ready, keep it internal until the
  adapter lowering is proven.
- Keep CRDT-specific lowering outside the core paste path so local history,
  browser selection, and benchmarks still see one user operation.

## Related Issues

- `docs/plans/2026-05-05-plite-best-pasting-strategy-ralplan.md`
- `docs/plans/2026-05-06-plite-range-delete-replace-children-ralplan.md`
- `docs/solutions/logic-errors/2026-05-04-clipboard-fragment-format-keys-must-guard-html-fallback.md`
- `docs/solutions/logic-errors/2026-04-26-plite-browser-native-multiline-paste-success-must-block-fallback-insertion.md`
- `docs/solutions/performance-issues/2026-04-11-slate-history-typing-bursts-need-legacy-style-merge-heuristics-before-anything-else.md`

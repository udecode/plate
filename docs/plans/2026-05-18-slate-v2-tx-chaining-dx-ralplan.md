# Slate v2 Tx Chaining DX Ralplan

Date: 2026-05-18
Status: done
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`

## Current Verdict

Do not add Tiptap-style chaining to raw Slate `tx`.

Keep the raw API as sequential transaction statements:

```ts
editor.update((tx) => {
  tx.nodes.wrap(
    { type: CodeBlockType, language: 'html', children: [] },
    {
      match: (node) => NodeApi.isElement(node) && node.type === ParagraphType,
      split: true,
    }
  )
  tx.nodes.set(
    { type: CodeLineType },
    {
      match: (node) => NodeApi.isElement(node) && node.type === ParagraphType,
    }
  )
})
```

This is more Slate-ish than either `tx.nodes.set(...).nodes.set(...)` or
`tx.chain().nodes.set(...).nodes.set(...).run()`.

## Intent And Boundaries

Intent: answer whether Slate v2 should steal Tiptap's chain API for multi-step
transaction DX.

Desired outcome: keep raw Slate small, explicit, transaction-owned, and easy to
read in examples.

In scope:

- `tx` write DX inside `editor.update`;
- Tiptap chain comparison;
- examples that would be affected if chaining existed;
- Plate migration pressure.

Non-goals:

- no Slate v2 source edit;
- no example rewrite;
- no new command builder for raw Slate;
- no issue-fix claim.

Decision boundary: this pass may reject a proposed public API and record where
the idea belongs if it is useful elsewhere.

## Live Source Grounding

Slate v2 current shape:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`:
  `getUpdateView` builds one active update transaction object with state reads,
  write groups, and extension `txGroups`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`:
  `EditorCoreUpdateTransaction` exposes grouped write APIs on `break`,
  `fragment`, `marks`, `nodes`, `selection`, `text`, `value`, and
  `withoutNormalizing`.
- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`:
  `convertSelectionToCodeBlock` already shows the exact two-statement
  `tx.nodes.wrap` then `tx.nodes.set` shape.

Tiptap current shape:

- `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts`:
  `createChain` collects command callbacks against one ProseMirror transaction,
  returns the chain after every command, and dispatches only in `run`.
- `/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts`:
  `editor.chain()` delegates to the command manager.
- `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts`:
  extension commands are documented around `chain().setMark(...).run()`.

Mechanism difference: Tiptap chain is a deferred command collector. Slate `tx`
is already the active transaction callback. Adding `.run()` inside `tx` would
be fake ceremony.

## Decision Brief

Principles:

1. `editor.update` is the batch boundary.
2. Raw Slate transforms should execute immediately and visibly.
3. Transform return values should not be hijacked for fluent syntax.
4. Plate can own product command DSLs; raw Slate should not.
5. Examples should teach the real low-level primitive, not hide it.

Top drivers:

1. Current `tx` already combines reads, writes, and extension tx groups.
2. Tiptap's chain exists because its command layer defers ProseMirror dispatch.
3. Chaining would make raw Slate look smoother while making the mental model
   less honest.

Viable options:

| Option | Verdict | Why |
| --- | --- | --- |
| Keep sequential `tx.nodes.wrap(); tx.nodes.set();` | Choose | Clear order, no fake run step, no return-value abuse, closest to Slate transforms. |
| Make every tx transform return `tx` for `tx.nodes.set(...).nodes.set(...)` | Reject | Weird namespace hop after a mutation, loses transform return semantics, and makes every method lie for fluency. |
| Add `tx.chain().nodes.wrap(...).nodes.set(...).run()` | Reject | Tiptap needs `run` because dispatch is deferred; Slate is already inside an update transaction. |
| Add a product command builder outside raw Slate | Accept for Plate only | Useful for toolbar/product commands, but belongs above raw Slate as a Plate/plugin affordance. |
| Add one-off domain helpers such as `tx.codeBlock.wrapSelection()` | Reject for core | That is opinionated feature behavior, not raw Slate substrate. Extensions can provide it when the domain is real. |

Chosen shape:

```ts
editor.update((tx) => {
  tx.nodes.wrap(...)
  tx.nodes.set(...)
})
```

Rejected shapes:

```ts
tx.nodes.wrap(...).nodes.set(...)
tx.chain().nodes.wrap(...).nodes.set(...).run()
```

## Ecosystem Strategy Synthesis

| Reference | Mechanism | Slate target | Verdict |
| --- | --- | --- | --- |
| Tiptap `CommandManager.createChain` | Command callback collector with final dispatch in `run`. | Reject for raw `tx`; there is no deferred dispatch inside `editor.update`. | diverge |
| ProseMirror transaction discipline | One transaction owns changes before dispatch. | Keep `editor.update` as the visible transaction boundary. | agree |
| Plate product API pressure | Product commands often want fluent toolbar ergonomics. | Let Plate expose a command DSL if useful, built on Slate `editor.update`. | partial |

## Public API Target

No new raw Slate chain API.

Keep:

```ts
editor.update((tx) => {
  tx.nodes.wrap(...)
  tx.nodes.set(...)
})
```

Do not add:

```ts
editor.update((tx) =>
  tx.chain().nodes.wrap(...).nodes.set(...).run()
)
```

Do not make transforms fluent:

```ts
tx.nodes.wrap(...).nodes.set(...)
```

## Example Impact

No example should be migrated to chaining.

Examples that should stay sequential if touched later:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx`

Tiny docs/example note worth adding during a later implementation/docs cleanup:

```md
Inside `editor.update`, write multiple operations as ordered statements.
`editor.update` is the transaction boundary.
```

## Issue Ledger Accounting

ClawSweeper related-issue pass: skipped.

Reason: this pass rejects a proposed public API addition and makes no issue-fix,
runtime behavior, browser behavior, example behavior, or PR claim change.
Existing public API remains unchanged.

Fixed issues: none.

Related but not fixed issues: none newly classified.

PR-description sync: skipped because there is no accepted API change, proof
status change, release gate change, issue claim change, or example change.

## Implementation-Skill Review Matrix

| Skill lens | Status | Reason |
| --- | --- | --- |
| Vercel React | skipped | No React rendering, hook, or subscription API change. |
| performance-oracle | applied | Rejecting chaining avoids proxy/fluent allocation and preserves direct call order on the editing hot path. |
| tdd | skipped | No behavior change to test. Later docs cleanup can use lint/type gates only. |
| shadcn/react-useeffect | skipped | No component or effect surface. |

## Maintainer Objection Ledger

| Objection | Answer | Status |
| --- | --- | --- |
| "Chaining is shorter and Tiptap users like it." | True, but Tiptap chain solves deferred command dispatch. Slate `tx` is already executing inside the transaction. Copying the surface without the mechanism is worse DX. | answered |
| "`tx.nodes.wrap(); tx.nodes.set();` feels verbose." | Two ordered statements are readable and debugger-friendly. If a domain command repeats often, an extension or Plate command can wrap it. Core should not make every transform fluent for one example. | answered |
| "Could chain help agents write less code?" | It would help autocomplete demos, not correctness. Agents need a simple boundary: read from state/tx, write ordered tx statements. | answered |

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | No React surface; avoids extra chain objects in hot command paths. |
| Slate-close unopinionated DX | 0.96 | Matches current `tx` group API and Slate transform statement style. |
| Plate and slate-yjs migration backbone | 0.92 | Keeps raw Slate low-level; leaves product command DSLs to Plate. |
| Regression-proof testing strategy | 0.90 | No behavior change; existing examples/tests remain source of truth. |
| Research evidence completeness | 0.94 | Live Slate source plus local Tiptap `CommandManager` and `Editor.chain`. |
| shadcn-style composability and minimalism | 0.94 | Fewer public primitives; no second command builder. |

Weighted score: 0.93.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read | complete | Slate `getUpdateView`, `EditorCoreUpdateTransaction`, code-highlighting example. | Current API recorded. | none | none |
| ecosystem comparison | complete | Tiptap `CommandManager.createChain`, `Editor.chain`, extension command docs. | Tiptap chain rejected for raw Slate. | none | none |
| issue-ledger accounting | skipped | No accepted public API/runtime/example/claim change. | Skip reason recorded. | none | none |
| maintainer objection pass | complete | Three objection rows answered. | Decision hardened. | none | none |
| closure/final gates | complete | Scorecard and final handoff below. | Plan closed. | none | none |

## Final Handoff Outline

- Raw Slate keeps ordered transaction statements.
- No `tx.chain()`.
- No fluent transform return.
- Tiptap's chain is a command-dispatch mechanism, not a better Slate tx shape.
- Plate may expose product-level fluent commands later if it wants toolbar DX.
- No Slate v2 implementation or example files were edited.

## Final Completion Gates

- Plan file exists: yes.
- Completion file updated: yes.
- Live source grounded: yes.
- External comparison grounded in local source: yes.
- Issue-fix claims: none.
- PR reference changes required: no.
- Slate v2 verification command required: no source or behavior changed.
- Planning-state verification required: `node tooling/scripts/completion-check.mjs`.

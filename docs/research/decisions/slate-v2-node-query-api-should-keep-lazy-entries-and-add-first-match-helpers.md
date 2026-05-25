---
title: Slate v2 node query API should keep lazy entries, early-exit helpers, and explicit materialization
type: decision
status: draft
updated: 2026-05-14
related:
  - docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/entities/prosemirror.md
  - docs/research/entities/lexical.md
  - docs/research/entities/tiptap.md
---

# Slate v2 Node Query API Should Keep Lazy Entries, Early-Exit Helpers, And Explicit Materialization

## Decision

Slate v2 should keep the node-query engine lazy, but the public read surface
should not force common first-match checks or read-boundary materialization
through ad hoc `Array.from(...)` patterns.

Target shape:

```ts
editor.read((state) =>
  state.nodes.find({
    match: (node) => NodeApi.isElement(node) && node.type === "link",
  }),
);

editor.read((state) =>
  state.nodes.some({
    match: (node) => NodeApi.isElement(node) && node.type === "link",
  }),
);

for (const [node, path] of state.nodes.entries({ at, match })) {
  // lazy traversal
}

const entries = editor.read((state) =>
  state.nodes.toArray({ at, match }, ([node, path]) => ({ node, path })),
);
```

`editor.read((state) => ...)` remains the lifecycle boundary for committed
reads. The issue is not the read boundary; it is hidden materialization on top
of a generator or returning a generator that may be consumed after the boundary.

## Current Source Evidence

- `.tmp/slate-v2/packages/slate/src/editor/nodes.ts:6` is still a generator-based
  editor query.
- `.tmp/slate-v2/packages/slate/src/interfaces/node.ts:677` is still a
  generator-based raw tree query.
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts` exposes
  `state.nodes.entries`, `state.nodes.find`, `state.nodes.some`, and
  `state.nodes.toArray`.
- `.tmp/slate-v2/site/examples/ts/inlines.tsx`, `site/examples/ts/richtext.tsx`,
  `site/examples/ts/tables.tsx`, and `site/examples/ts/check-lists.tsx` use
  `find` / `some` for first-match and boolean checks.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts` uses
  `state.nodes.toArray` for read-boundary materialization before creating path
  refs.
- `.tmp/slate-v2/packages/slate/test/query-contract.ts` and
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts` prove the
  public query contract through `editor.read`.

## Reference Systems

| System       | Source                                                                                                                                                                         | Mechanism                                                                                                                                                     | Slate takeaway                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy Slate | `../slate/packages/slate/src/editor/nodes.ts:6`                                                                                                                                | `Editor.nodes` is a generator, so `const [entry] = Editor.nodes(...)` can consume only the first yielded match.                                               | Keep lazy iteration for Slate-shaped tree queries. Do not regress first-match checks into full arrays.                                                                                            |
| ProseMirror  | `../prosemirror-model/src/node.ts:79`; `../prosemirror-model/src/fragment.ts:29`                                                                                               | `nodesBetween` / `descendants` use callback traversal and avoid array allocation by default. Returning `false` prunes a subtree.                              | Avoid allocation in the core traversal path; keep `pass` / prune semantics. Do not copy callback-only ergonomics.                                                                                 |
| Lexical      | `../lexical/packages/lexical/src/LexicalEditorState.ts:122`; `../lexical/packages/lexical/src/LexicalSelection.ts:527`; `../lexical/packages/lexical/src/LexicalUtils.ts:1274` | Reads run inside a read lifecycle. Selection/type queries return arrays, but selection nodes are cached and type lookup can use a read-only type-to-node map. | Keep the read boundary. Do not use Lexical array returns as permission to materialize Slate DFS queries. Consider indexes only if benchmarks prove repeated global type queries are hot.          |
| Tiptap       | `../tiptap/packages/core/src/NodePos.ts:206`; `../tiptap/packages/core/src/helpers/findChildren.ts:11`; `../tiptap/packages/core/src/helpers/isNodeActive.ts:8`                | Product helpers return arrays, while `querySelector` adds a `firstItemOnly` escape to avoid full traversal.                                                   | Product-layer convenience should not define the raw Slate core query surface. First-match and boolean early-exit APIs are still useful, but selector/product helpers should stay out of raw core. |

## Accepted Direction

- Keep a lazy all-matches method on `state.nodes`.
- Add first-match and boolean helpers so active checks do not allocate arrays.
- Add an explicit `toArray(options, map?)` materializer for callers that really
  need a stable array from a read/update callback.
- Prefer names that avoid `state.nodes.match({ match: ... })` stutter.
- Keep the legacy `match` option name because it is Slate-close and already used
  across query/transform options.
- Do not restore public static `Editor.nodes(editor, ...)` as the normal v2
  surface. That would fight the accepted state/tx read-update architecture.
- Reject `every` for this slice because Slate's `match` option is already the
  yield filter; an all-selected helper needs a clean candidate/assertion split.
  Reject selector-style, product-style, count, and type-index helpers unless a
  later benchmark or first-party call-site audit proves a separate need.

## Materialization Follow-Up

The initial decision rejected array helpers too broadly. The follow-up
generator-materialization review found a distinct read-boundary case:
`slate-dom` needs to consume `state.nodes.entries(...)` inside `editor.read` and
return a stable array afterward.

Updated direction:

- keep `entries` / `find` / `some`;
- reopen only `state.nodes.toArray(options, map?)` as an allocation-explicit
  materializer;
- keep `filter`, `map`, `every`, selector strings, product helpers, `count`, and
  type indexes rejected or deferred;
- do not teach `editor.read((state) => state.nodes.entries(...))`, because the
  generator may be consumed after the read boundary.

Plan: `docs/plans/2026-05-14-slate-v2-generator-materialization-api-ralplan.md`.

## Proof

- `bun test ./packages/slate/test/query-contract.ts` covers `toArray` order,
  mapper behavior, and `find` / `some` early exit.
- `bun test ./packages/slate/test/state-tx-public-api-contract.ts` covers the
  public state query surface.
- `bun ./scripts/benchmarks/core/current/query-ref-observation.mjs` records
  manual collection, `toArray`, mapped `toArray`, and early-exit query lanes.
- `rg` over `packages`, `site/examples/ts`, and `scripts` has no
  `editor.read((state) => state.nodes.entries(...))` generator return or
  first-entry `Array.from(...)[0]` teaching pattern.

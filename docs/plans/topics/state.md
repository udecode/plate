# Document state, fields and effects

The ledger asks where typed editor state lives. The 2026-10-04 audit stopped. The facet cut is done and the surviving split is coherent. Typed state fields persist only through document `meta` with explicit history and collaboration policy, effects carry transitions, and transient UI stays with its product owner. The 2026-09-11 [core cuts](../2026-09-11-plite-core-cuts.md) deleted `defineFacet`, the `EditorFacet*` types, `state.facet`, `editor.read.facet`, `facetProviders` and their registry and transaction bookkeeping. `node tooling/scripts/review-ledger.mjs show state` prints the scope's history.

## Public API

A field is an installable extension.

```ts
const title = defineStateField({ key: 'document.title', initial: 'Untitled' });
const editor = createEditor({ extensions: [title] });
editor.update((tx) => tx.setField(title, 'Review'));
const heading = editor.read((state) => state.getField(title).toUpperCase());
```

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Fields | Plite, `packages/plitejs/src/core/state-field.ts`: typed document values, equality, persistence and optional history and collaboration policy; a field contributes its transition effect. |
| Effects | `transaction-values.ts`: semantic transitions with replay and inversion policy. |
| Product UI state | Plate and app stores, such as chat options and panels. |
| Derived values | Ordinary read helpers at their read owners. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Facets, even opt-in | No feature definition, provider or consumer read in 1,644 source files; each draft cloned three maps and kept field revisions with no provider installed. |
| A reactive graph, selector registry or generic store | No missing consumer. |
| All fields in React, or all UI in the kernel | Loses persistence and undo, or document independence. |
| Metadata as hidden nodes | Pollutes the document grammar. |
| A field-installation wrapper | A field is already an extension. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- With facets gone, a preview no longer copies three maps and N field revisions, and a command dispatch no longer copies six maps and 2N revisions; the five-pair, four-cohort production comparison passed its noise screens and shows no consistent speedup.

## Open work

- The facet cut's strict React suite, packed bundle-size snapshot and full browser matrix did not go green in the shared checkout on 2026-09-11. owner: zbeyens. stop: the next `state` review reruns them.

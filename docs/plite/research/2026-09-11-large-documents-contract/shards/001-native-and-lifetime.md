# Native coverage and mounted identity

Scope: omission, active native DOM and clipboard semantics. This is a bounded
source/probe study, not an exhaustive external-editor audit.

## Findings

1. `Editable` chooses `EditableVirtualized` or `EditableNonVirtualized` at the
   component boundary. The actual compiled React test changed full to virtual:
   the root object changed, the old root disconnected, and focus was lost.
   The existing transition suite tests replacement of an internal scroll
   callback on `EditableDOMRoot`; it does not exercise this outer transition.
2. `createVirtualizedTopLevelItemGroups` derives group keys from the first and
   last item indexes. The actual helper and shipped key hierarchy replaced
   overlapping item 1 when the window changed from `[0,1,2]` to `[1,2,3]`.
   Keeping an item key in a different keyed parent does not preserve its DOM.
   This independently challenges composition retention during ordinary scroll,
   even if the public API never switches modes.
3. The generic viewport plan receives selection endpoints and a promoted
   top-level index, but no composing path. Its caller reads composition in
   descendant rendering, not in that retained-root input. Pagination has a
   `getPagedEditableMountedPageIndexes` helper with a composing index, but its
   only callers are tests. That helper cannot prove production retention.
4. `materializeBoundary` reports handler acceptance; a React callback returning
   does not prove the target DOM has committed. The materialization contract
   must distinguish request, committed availability, cancellation and failure.
   Reuse the root DOM scheduler and committed resolution; a new public promise
   or global materialization queue is not justified by this finding.
5. In an actual `writeDOMRangeData` probe, a selection covering adjacent `model`
   and `exclude` boundaries produced `Visible\nOmitted\nExcluded\nEnd`.
   `writeModelBackedRangeData` exports the whole model slice after any model
   boundary selects that branch. The public docs promise exclusion. This is a
   confirmed local contradiction, not a repaired behavior or a security claim
   about an application. The safe adoption gate is an exact mixed-policy
   oracle for plain text, HTML and Plite fragments before making copy claims.
6. `findPolicy` has no behavior reader in the scoped census. It records a
   declaration without performing search. Keep model search with its existing
   feature owner; do not turn rendering into another search service.
7. `nativeSurfaceComplete` is not a native-capability certificate. The metrics
   helper forces it false for external text but otherwise retains the mode's
   value despite independently registered hidden boundaries. Counting mounted
   roots does not prove native Find, accessibility, print or rich HTML copy.

## External evidence

The pinned CodeMirror view creates separate viewports around selection endpoints
and preserves height information outside the viewport. Its print handler
explicitly requests full measurement; printing is an extra lifecycle path.
It also has a separate long-line omission mechanism. These support independent
block-count, single-block and print proof rows; they do not justify importing a
text-editor height tree into Plite's rich-content model.

The pinned ProseMirror `viewdesc.ts` protects the actual composing text node
while reconciling children. Plite's target must retain DOM identity, not merely
the model path. No upstream implementation or test was copied.

The CSS Containment editor's draft distinguishes skipped painting with
`content-visibility:auto` from absent DOM, while specifying interactions with
find, selection and accessibility. This is a draft contract, not evidence of
current browser parity. The inspected WPT print case is a rendering comparison;
the selection case is only a crash test. Neither proves Plite native behavior.
[CSSWG draft](https://drafts.csswg.org/css-contain/#content-visibility),
[CodeMirror guide](https://codemirror.net/docs/guide/).

## Disposition

Promote stable-root **and stable-active-descendant** identity, committed
materialization, mixed clipboard policies and real native-service proof to the
existing plan. Reject a root-only transition fix, a model-path-only IME proof,
and a capability label inferred from mount counts. No further native-prior-art
search is needed before the scoped runtime prototype.

Evidence: [current contract receipt](../../../../plans/artifacts/large-documents-deep/current-contract-result.json),
[source and read ledger](../read-log.tsv). JSDOM proves the stated identity and
callback behavior only. No trusted IME, browser Find UI, assistive technology,
mobile device or OS clipboard session was run.

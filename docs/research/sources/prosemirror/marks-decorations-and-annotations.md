# ProseMirror: marks decorations and annotations

## Marks over inline atoms

- ProseMirror's mark commands do not treat inline atoms as text: `markApplies` skips an inline atom that a range fully covers unless `enterAtoms` is set, and `removeInlineAtoms` splits a range around an inline atom with content so the mark lands only on the text beside it (`ProseMirror/prosemirror-commands@52a84a84:src/commands.ts:578-600`). Source: `docs/plite/research/2026-06-14-firefox-inline-void-select-all-replacement/read-log.tsv:8`; reread at the pinned commit on 2026-10-08.

## ProseMirror test families

- **PM-04 mark sets.** `model/test/test-mark.ts` checks mark-set equality, that adding an existing mark is a no-op, rank ordering, that exclusive marks replace or refuse each other (including globally excluding marks), removal, and which marks `ResolvedPos.marks` reports at mark edges, including non-inclusive marks (`ProseMirror/prosemirror-model@bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97:test/test-mark.ts:23-169`); the harvest pairs it with `transform/test/test-trans.ts` for mark steps. Counterparts: `packages/plitejs/test/editor-methods-contract.ts`, `read-update-contract.ts` and `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx`; the harvest flagged schema-owned exclusive marks as architecture gap PM-P1-2. Source: `docs/editor-test-harvester/prosemirror/report.md:143`.

- **PM-12 decorations and views.** `view/test/webtest-decoration.ts`, `webtest-draw-decoration.ts`, `webtest-draw.ts`, `webtest-markview.ts` and `webtest-nodeview.ts` test decorations, widgets, mark views and node views; the node-view tests check replacing a node's representation, custom update methods, `contentDOM`, `ignoreMutation`, `destroy`, position queries and access to outer and inner decorations (`ProseMirror/prosemirror-view@c752c6ef7225199f73cb433dd3179e7d69b840d8:test/webtest-nodeview.ts:7-178`). The harvest reads the family as checking that decorations and widgets keep order and locality through structural edits and release resources on teardown. Plite's counterpart is `packages/plitejs/test/react/mapped-view-store.test.ts`; the `projection-stress-contract` and `widget-layer-contract` tests the harvest named no longer exist. NodeView and MarkView authoring maps to Plate, not raw Plite. Source: `docs/editor-test-harvester/prosemirror/report.md:151`.

## Decoration rendering

- ProseMirror's 'can handle inline decorations ending on inline node boundaries' test checks that a decoration spanning from inside an inline node into the following text renders without corrupting the inline DOM; the neighbouring 'only draws inline decorations on the innermost level' and 'can handle nodeName decoration overlapping with classes' cover nesting and overlap. Evidence: `ProseMirror/prosemirror-view@c752c6ef7225199f73cb433dd3179e7d69b840d8:test/webtest-draw-decoration.ts:475`, `:487`, `:496`, checked 2026-10-08.

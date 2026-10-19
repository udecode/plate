# Wordgard Test Inventory

Source checkout: clean local `../wordgard` tree at
`b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` on `main`, tracking `origin/main` from
`https://code.haverbeke.berlin/wordgard/wordgard.git`.
License: MIT from `../wordgard/LICENSE` and `../wordgard/package.json`.

This is an incremental refresh from
`source_commit=c715d4ded8fc780f52c13206e589ea31e4148dd4`. The exact test-tree diff contains
13 changed files: `test/generate.ts`, `test/schema.ts`, `test/test-commands.ts`, `test/test-history.ts`, `test/test-pointset.ts`, `test/test-rangeset.ts`, `test/test-selection.ts`, `test/test-table-commands.ts`, `test/test-table-correction.ts`, `test/webtest-composition.ts`, `test/webtest-content.ts`, `test/webtest-coords.ts`, `test/webtest-resolve-dom.ts`.

Inventory command:

```sh
git -C ../wordgard ls-files 'test/*.ts'
```

Accounting: 29 files, 6,382 lines;
29 classified; 15 portable; 8
portable-mixed; 3 Plate-owned; 3 harness;
0 skip; 0 product-shell; 0 uncertain. The tree contains 675
source-declared `it(...)` call sites.

| File | Lines | Category | Why |
| --- | ---: | --- | --- |
| `test/generate.ts` |   185 | harness | Random document and change generators support algebra and renderer stress tests but assert no editor behavior themselves. |
| `test/schema.ts` |   174 | harness | Shared schema, builders, equality, and tagged-position fixtures only. |
| `test/tempview.ts` |    41 | harness | Browser editor mounting and focus fixture only. |
| `test/test-cellselection.ts` |   179 | portable-mixed | Custom-selection mapping is Plite substrate; rectangular table geometry and navigation are Plate table policy. |
| `test/test-change.ts` |   574 | portable | Apply, compose, transform, invert, position mapping, schema fitting, JSON round trips, and randomized algebra are editor-kernel laws. |
| `test/test-collab.ts` |   368 | portable-mixed | Peer convergence, remote history, shared marks, server transform, and correction laws are portable; Wordgard's central protocol is not Plite's Yjs product. |
| `test/test-commands.ts` |   876 | portable-mixed | Lift, split, enter, delete, join, wrap, and mark semantics are portable; list policy remains Plate-owned. |
| `test/test-correction.ts` |    85 | portable | Change-scoped correction notification, application, and initial repair are normalization laws. |
| `test/test-facet.ts` |   227 | portable | Extension precedence, dependency tracking, memoization, reconfiguration, effects, and cycle rejection are kernel-extension laws. |
| `test/test-history.ts` |   589 | portable | Undo/redo grouping, mapping, selection restore, effects, serialization, isolation, extenders, and random sequences are history laws. |
| `test/test-node.ts` |   136 | portable | Tree traversal, text extraction, construction validation, and JSON round trips are model laws. |
| `test/test-pointset.ts` |    65 | portable-mixed | Point ordering, association, merge, masking, and change mapping are portable; the packed linear PointSet class is Wordgard-specific. |
| `test/test-pos.ts` |    77 | portable | Position resolution, traversal, caching, and node representation are model-coordinate laws. |
| `test/test-prop.ts` |   101 | portable-mixed | Mark equality and add/remove semantics are portable; ordered and multi-mark sets do not match Plite leaf properties. |
| `test/test-rangeset.ts` |    79 | portable-mixed | Range ordering, endpoint association, merge, masking, and change mapping are portable; non-overlap and the packed linear class are Wordgard-specific. |
| `test/test-schema.ts` |    76 | portable | Content validation, defaults, groups, overlays, and unknown-type rejection are schema laws. |
| `test/test-selection.ts` |   249 | portable | Valid cursor positions, isolating boundaries, graphemes, bidi motion, inline voids, and word motion are selection laws. |
| `test/test-state.ts` |   126 | portable | Atomic multi-spec updates plus selection and effect mapping are transaction-state laws. |
| `test/test-table-commands.ts` |   212 | plate-owned | Header, row, column, merge, split, span, and whole-table behaviors belong to Plate Table. |
| `test/test-table-correction.ts` |    45 | plate-owned | Rectangularization, span collision repair, and missing-cell placement belong to Plate Table. |
| `test/test-table-paste.ts` |   124 | plate-owned | Grid paste expansion, clipping, repetition, and merged-cell splitting belong to Plate Table. |
| `test/webtest-commands.ts` |    35 | portable | Visual-line deletion and soft-wrap boundaries are browser editing behavior. |
| `test/webtest-composition.ts` |   187 | portable | IME lifecycle, replacement, DOM retention, marks, cursor wrappers, and target-range fallback are browser editing behavior. |
| `test/webtest-content.ts` |   664 | portable-mixed | Incremental DOM identity, decoration invalidation, widget lifecycle, and hidden-descendant rendering are portable; Wordgard tile and widget shapes are implementation-specific. |
| `test/webtest-coords.ts` |   191 | portable | Model/DOM coordinate round trips, affinity, RTL, hard breaks, vertical motion, goal columns, atoms, nesting, and tables are browser selection laws. |
| `test/webtest-dom-changes.ts` |   148 | portable | Stacked native mutations, cross-node correction, model/native interleaving, and dirty-DOM input are browser editing laws. |
| `test/webtest-editor.ts` |   113 | portable | Plugin update lifecycle, DOM repair, dispatch reentrancy, flush, appenders, and widget lifecycle are editor-runtime laws. |
| `test/webtest-resolve-dom.ts` |   193 | portable | Biased model/DOM resolution around text, wrappers, widgets, structural DOM, and inline buffers is a DOM bridge law. |
| `test/webtest-serialize.ts` |   263 | portable-mixed | DOM parse/serialize, slice context, and unmatched-block fitting are portable; concrete element rules remain Plate-owned. |

## Classification pressure

The three harness files remain negative controls. The new PointSet and RangeSet
files are mixed: endpoint association and change mapping are portable, while the
packed linear containers and RangeSet's non-overlap restriction are not local
API requirements. The three table files remain Plate-owned because their
assertions are product grid policy, not raw selection substrate.

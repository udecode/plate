# Wordgard Test Inventory

Source checkout: clean local `../wordgard` tree at
`01eb2b5eae509509677345fd603acad001827dff` on `main`, tracking
`origin/main` from `https://code.haverbeke.berlin/wordgard/wordgard.git`.
License: MIT from `../wordgard/LICENSE` and `../wordgard/package.json`.

Full provenance: every inventory row was discovered, line-counted, and
classified directly from
`source_commit=01eb2b5eae509509677345fd603acad001827dff`. No earlier artifact
or commit diff supplied the file set.

Inventory command:

```sh
rg --files ../wordgard \
  | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' \
  | sort
```

Accounting: 27 files, 6,039 lines; 27 classified; 15 portable; 6
portable-mixed; 3 Plate-owned; 3 harness; 0 skip; 0 product-shell; 0
uncertain.

Full rebuild accounting: 27/27 tracked test files are present below, with zero
uncertain or skipped files. The owning validator checks the exact current file
set, newline counts, categories, and test-index parity.

| File                            | Lines | Category       | Why                                                                                                                                                                                         |
| ------------------------------- | ----: | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/generate.ts`              |   184 | harness        | Random document and change generators support algebra and renderer stress tests but assert no editor behavior themselves.                                                                   |
| `test/schema.ts`                |   174 | harness        | Shared schema, builders, equality, and tagged-position fixtures only.                                                                                                                       |
| `test/tempview.ts`              |    41 | harness        | Browser editor mounting and focus fixture only.                                                                                                                                             |
| `test/test-cellselection.ts`    |   179 | portable-mixed | Custom-selection mapping is Plite substrate; rectangular table geometry and navigation are Plate table policy.                                                                              |
| `test/test-change.ts`           |   574 | portable       | Apply, compose, transform, invert, position mapping, schema fitting, JSON round trips, and randomized algebra are editor-kernel laws.                                                       |
| `test/test-collab.ts`           |   368 | portable-mixed | Peer convergence, remote-history, shared-mark, server-transform, and correction laws are portable; Wordgard's central transform protocol differs from Plite's adapter and Yjs lanes.        |
| `test/test-commands.ts`         |   863 | portable-mixed | Lift, split, enter, delete, join, wrap, and mark semantics are portable; list toggling is Plate policy.                                                                                     |
| `test/test-correction.ts`       |    85 | portable       | Change-scoped correction notification, application, and initial repair are normalization laws.                                                                                              |
| `test/test-facet.ts`            |   227 | portable       | Extension precedence, dependency tracking, memoization, reconfiguration, effects, and cycle rejection are kernel-extension laws.                                                            |
| `test/test-history.ts`          |   581 | portable       | Undo/redo grouping, mapping, selection restore, effects, serialization, isolation, and random sequences are history laws.                                                                   |
| `test/test-node.ts`             |   136 | portable       | Tree traversal, text extraction, construction validation, and JSON round trips are model laws.                                                                                              |
| `test/test-pos.ts`              |    77 | portable       | Position resolution, traversal, caching, and node representation are model-coordinate laws.                                                                                                 |
| `test/test-prop.ts`             |   101 | portable-mixed | Mark equality and add/remove semantics are portable, while ordered and multi-mark sets do not directly match Plite leaf properties.                                                         |
| `test/test-schema.ts`           |    76 | portable       | Content validation, defaults, groups, overlays, and unknown-type rejection are schema laws.                                                                                                 |
| `test/test-selection.ts`        |   219 | portable       | Valid cursor positions, isolating boundaries, graphemes, bidi motion, and word motion are selection laws.                                                                                   |
| `test/test-state.ts`            |   126 | portable       | Atomic multi-spec updates plus selection and effect mapping are transaction-state laws.                                                                                                     |
| `test/test-table-commands.ts`   |   212 | plate-owned    | Header, row, column, merge, split, span, and whole-table behaviors belong to `@platejs/table`.                                                                                              |
| `test/test-table-correction.ts` |    41 | plate-owned    | Rectangularization, span collision repair, and missing-cell placement belong to `@platejs/table`.                                                                                           |
| `test/test-table-paste.ts`      |   124 | plate-owned    | Grid paste expansion, clipping, repetition, and merged-cell splitting belong to `@platejs/table`.                                                                                           |
| `test/webtest-commands.ts`      |    35 | portable       | Visual-line deletion and soft-wrap boundaries are browser editing behavior.                                                                                                                 |
| `test/webtest-composition.ts`   |   187 | portable       | IME lifecycle, replacement, DOM retention, marks, cursor wrappers, and Safari target-range fallback are browser editing behavior.                                                           |
| `test/webtest-content.ts`       |   611 | portable-mixed | Incremental DOM identity, decoration invalidation, widget lifecycle, and hidden-descendant rendering laws are portable; Wordgard shape/decorator representation is implementation-specific. |
| `test/webtest-coords.ts`        |   176 | portable       | Model/DOM coordinate round trips, affinity, RTL, vertical motion, goal columns, atoms, nesting, and tables are browser selection laws.                                                      |
| `test/webtest-dom-changes.ts`   |   148 | portable       | Stacked native mutations, cross-node offset correction, model/native interleaving, command reinterpretation, new text hosts, and randomized dirty-DOM input are browser editing laws.       |
| `test/webtest-editor.ts`        |   113 | portable       | Plugin update lifecycle, DOM repair, dispatch reentrancy, flush, appenders, and widget lifecycle are editor-runtime laws.                                                                   |
| `test/webtest-resolve-dom.ts`   |   118 | portable       | Biased model-to-DOM resolution around text, marks, widgets, wrappers, and structural DOM is a DOM bridge law.                                                                               |
| `test/webtest-serialize.ts`     |   263 | portable-mixed | DOM parse/serialize, slice context, and unmatched-block fitting are portable, but concrete element rules live in Plate HTML/plugin owners.                                                  |

## Classification pressure

The three harness files were read as negative controls. `generate.ts` contains
valuable fuzzing technique but no standalone expectation; `schema.ts` defines
fixtures rather than schema behavior; `tempview.ts` only mounts and focuses a
browser surface. Promoting any of them to a behavior row would confuse test
infrastructure with an editor invariant. No file qualified for `skip`, so there
is no hidden skip family to sample.

The three table files remain Plate-owned even though custom selection is a
Plite capability: their assertions are explicitly about table geometry, spans,
grid mutation, and paste policy. The substrate portion is separately captured
from `test-cellselection.ts`.

`webtest-dom-changes.ts` is portable rather than harness: every case asserts
observable model content or DOM-to-model coordinates after native mutation.
Its private dirty-position ledger is not portable API; the invariant is that
pending native edits and intervening model commits cannot make later input or
coordinate resolution target stale content.

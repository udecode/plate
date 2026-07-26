# ProseMirror test inventory

Source boundary: all 19 package repositories declared by the ProseMirror meta launcher.

Immutable commits and license evidence: `docs/plans/artifacts/multi-editor-full-architecture-audit/prosemirror-provenance.md`.

Module-set cursor: `sha256:8a8158142c4d7f27635ad76eb698113183f6da1a9b453e81f2d275b8a5a86c84`.

## Counts

| Metric                            | Count |
| --------------------------------- | ----: |
| Source test/support files         |    47 |
| Named `describe`/`it`/`test` rows |  1369 |
| Classified files                  |    47 |
| Unresolved files                  |     0 |
| Portable                          |    21 |
| Portable-mixed                    |    21 |
| Harness/support                   |     5 |

## File rows

| Source                                                | Commit         | Lines | Names | Category       | Behavior rows              | Reason                                                                                                              |
| ----------------------------------------------------- | -------------- | ----: | ----: | -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `../prosemirror/model/test/test-content.ts`           | `bc912ea0ff8a` |   149 |    65 | portable-mixed | PM-01                      | Ordered grammar, per-prefix matching, and filler laws are portable; the string grammar and class types are not.     |
| `../prosemirror/model/test/test-diff.ts`              | `bc912ea0ff8a` |    91 |    21 | portable-mixed | PM-05                      | Minimal dirty-range behavior is portable; flat integer offsets are source-specific.                                 |
| `../prosemirror/model/test/test-dom.ts`               | `bc912ea0ff8a` |   704 |   106 | portable       | PM-03, PM-11               | DOM parse/render, whitespace, context, mark, namespace, and recovery behavior.                                      |
| `../prosemirror/model/test/test-mark.ts`              | `bc912ea0ff8a` |   173 |    46 | portable-mixed | PM-04                      | Conflict, replacement, and inclusivity laws are portable; PM mark objects, raw exclusion strings, and rank are not. |
| `../prosemirror/model/test/test-node.ts`              | `bc912ea0ff8a` |   238 |    51 | portable-mixed | PM-01, PM-03               | Tree equality, slicing, text, JSON, and validation behavior; class representation is not portable.                  |
| `../prosemirror/model/test/test-replace.ts`           | `bc912ea0ff8a` |   124 |    24 | portable       | PM-01, PM-02               | Structural replacement, fitting, rejection, and open-edge behavior.                                                 |
| `../prosemirror/model/test/test-resolve.ts`           | `bc912ea0ff8a` |    66 |     4 | portable-mixed | PM-06, PM-13               | Context and boundary behavior is portable; numeric position resolution is not.                                      |
| `../prosemirror/model/test/test-slice.ts`             | `bc912ea0ff8a` |    85 |    22 | portable       | PM-02                      | Open slice boundaries and partial marked fragments.                                                                 |
| `../prosemirror/transform/test/test-mapping.ts`       | `8fecfa62dc8c` |    86 |    11 | portable       | PM-05, PM-06               | Affinity and deletion mapping through structural changes.                                                           |
| `../prosemirror/transform/test/test-replace_step.ts`  | `8fecfa62dc8c` |    27 |     3 | portable       | PM-05, PM-08               | Concurrent replacement and replace-around mapping pressure.                                                         |
| `../prosemirror/transform/test/test-step.ts`          | `8fecfa62dc8c` |    73 |    21 | portable       | PM-05, PM-07               | Change merge, inversion, and typing/delete grouping behavior.                                                       |
| `../prosemirror/transform/test/test-structure.ts`     | `8fecfa62dc8c` |   182 |    43 | portable       | PM-01, PM-05               | Split, lift, wrap, and replacement fitting/rejection.                                                               |
| `../prosemirror/transform/test/test-trans.ts`         | `8fecfa62dc8c` |  1089 |   189 | portable       | PM-01, PM-02, PM-04, PM-05 | Main structural editing oracle across insertion, deletion, marks, wrapping, and joining.                            |
| `../prosemirror/transform/test/trans.ts`              | `8fecfa62dc8c` |    89 |     0 | harness        | PM-15                      | Transform assertion and fixture helper only.                                                                        |
| `../prosemirror/state/test/state.ts`                  | `57d4a96286ca` |    54 |     0 | harness        | PM-15                      | Editor-state fixture helper only.                                                                                   |
| `../prosemirror/state/test/test-selection.ts`         | `57d4a96286ca` |   209 |    23 | portable       | PM-06                      | Selection mapping through insert, replace, delete, and leaf/block boundaries.                                       |
| `../prosemirror/state/test/test-state.ts`             | `57d4a96286ca` |   145 |    16 | portable-mixed | PM-14                      | Transaction application behavior is portable; PM plugin-field/filter/append policy is not.                          |
| `../prosemirror/view/test/view.ts`                    | `c752c6ef7225` |    56 |     0 | harness        | PM-15                      | Browser editor, text-node, and flush helpers only.                                                                  |
| `../prosemirror/view/test/webtest-clipboard.ts`       | `c752c6ef7225` |   125 |    14 | portable       | PM-02, PM-11               | Clipboard context, wrappers, attrs, open slices, and text/HTML behavior.                                            |
| `../prosemirror/view/test/webtest-composition.ts`     | `c752c6ef7225` |   308 |    22 | portable       | PM-10                      | Composition lifecycle across browsers, marks, decorations, wrappers, and paragraphs.                                |
| `../prosemirror/view/test/webtest-decoration.ts`      | `c752c6ef7225` |   433 |    53 | portable       | PM-12                      | Mapped decoration/widget behavior and cleanup through structural edits.                                             |
| `../prosemirror/view/test/webtest-domchange.ts`       | `c752c6ef7225` |   470 |    44 | portable       | PM-09, PM-10               | Native DOM mutation interpretation and ambiguous input routing.                                                     |
| `../prosemirror/view/test/webtest-draw-decoration.ts` | `c752c6ef7225` |   534 |    48 | portable       | PM-12                      | Rendered projection/widget locality and cleanup; plugin-facing authoring details route to Plate.                    |
| `../prosemirror/view/test/webtest-draw.ts`            | `c752c6ef7225` |   177 |    19 | portable-mixed | PM-12, PM-14               | Incremental DOM update behavior is portable; PM props/plugin views are not.                                         |
| `../prosemirror/view/test/webtest-endOfTextblock.ts`  | `c752c6ef7225` |   131 |    16 | portable       | PM-13                      | Line-edge, vertical, RTL, widget, and atom navigation behavior.                                                     |
| `../prosemirror/view/test/webtest-markview.ts`        | `c752c6ef7225` |    69 |     5 | portable-mixed | PM-12, PM-14               | Lifecycle and mutation laws are useful; MarkView public API is Plate-owned.                                         |
| `../prosemirror/view/test/webtest-nodeview.ts`        | `c752c6ef7225` |   203 |    12 | portable-mixed | PM-12, PM-14               | Lifecycle, mutation, position, and decoration laws are useful; NodeView API is Plate-owned.                         |
| `../prosemirror/view/test/webtest-selection.ts`       | `c752c6ef7225` |   358 |    21 | portable       | PM-06, PM-13               | DOM selection import/export, geometry, RTL, and atom/block movement.                                                |
| `../prosemirror/view/test/webtest-view.ts`            | `c752c6ef7225` |   123 |    11 | portable-mixed | PM-13, PM-14               | DOM position/geometry is portable; PM prop/state/dispatch policy is not.                                            |
| `../prosemirror-keymap/test/test-keymap.ts`           | `d60e2447d633` |    68 |     7 | portable-mixed | PM-16                      | Key normalization and precedence are portable; raw key strings and PM commands are not.                             |
| `../prosemirror/history/test/test-history.ts`         | `768b74205ad5` |   413 |    29 | portable       | PM-07                      | Undo grouping, redo, selection restore, rebasing, and compression pressure.                                         |
| `../prosemirror/collab/test/test-collab.ts`           | `19ad580996ba` |   228 |    11 | portable       | PM-08                      | Multi-peer convergence and history behavior under concurrent changes.                                               |
| `../prosemirror/collab/test/test-rebase.ts`           | `19ad580996ba` |   172 |    16 | portable       | PM-06, PM-08               | Concurrent local/remote mapping, deletion, wrapping, and mark behavior.                                             |
| `../prosemirror-commands/test/test-commands.ts`       | `52a84a842774` |   694 |   154 | portable       | PM-17                      | High-value command behavior across deletion, joining, splitting, marks, atoms, and bidi edges.                      |
| `../prosemirror-gapcursor/test/test-gapcursor.ts`     | `2ea9ca9d7aad` |    62 |     5 | portable-mixed | PM-18                      | Gap selection validity and mapping are portable; PM subclass/plugin shape is not.                                   |
| `../prosemirror-schema-list/test/test-commands.ts`    | `d5515fe14169` |   146 |    33 | portable-mixed | PM-19                      | List wrap/split/lift/sink behavior is Plate-owned and tied to one PM list shape.                                    |
| `../prosemirror-markdown/test/build.ts`               | `221ec60e26bc` |    37 |     0 | harness        | PM-15, PM-20               | Markdown fixture and round-trip helper only.                                                                        |
| `../prosemirror-markdown/test/test-custom-parser.ts`  | `221ec60e26bc` |    32 |     3 | portable-mixed | PM-20                      | Custom token-to-schema mapping is useful; PM schema/type-name coupling is not.                                      |
| `../prosemirror-markdown/test/test-parse.ts`          | `221ec60e26bc` |   276 |    61 | portable       | PM-20                      | Markdown parse/serialize and escaping round-trip behavior.                                                          |
| `../prosemirror-test-builder/test/test-marks.ts`      | `a76003ea1ed0` |    45 |     3 | harness        | PM-23                      | Test-builder tag and mark fixture behavior, not editor product behavior.                                            |
| `../prosemirror-changeset/test/test-changed-range.ts` | `e21575727635` |    49 |     5 | portable-mixed | PM-21                      | Changed-range comparison is useful for a future review feature, not Plite transaction truth.                        |
| `../prosemirror-changeset/test/test-changes.ts`       | `e21575727635` |   212 |    34 | portable-mixed | PM-21                      | Mapped change-span accumulation and metadata behavior for a future review feature.                                  |
| `../prosemirror-changeset/test/test-diff.ts`          | `e21575727635` |    70 |    15 | portable-mixed | PM-21                      | Bounded structural token diff behavior for a future review feature.                                                 |
| `../prosemirror-changeset/test/test-merge.ts`         | `e21575727635` |    57 |    11 | portable-mixed | PM-21                      | Sequential change-set merge behavior for a future review feature.                                                   |
| `../prosemirror-changeset/test/test-simplify.ts`      | `e21575727635` |    75 |    16 | portable-mixed | PM-21                      | Human-facing word-boundary simplification for a future review feature.                                              |
| `../prosemirror-search/test/test-query.ts`            | `ff1148a339bb` |    85 |    13 | portable-mixed | PM-22                      | Search/replace query behavior is Plate-owned; numeric positions are not portable.                                   |
| `../prosemirror-search/test/test-search.ts`           | `ff1148a339bb` |   245 |    43 | portable-mixed | PM-22                      | Mapped search state, highlighting, navigation, and replacement are Plate-owned.                                     |

## Negative controls

- Meta `demo/test/mocha.css` and `demo/test/mocha.js` are vendored harness assets, not source behavior tests.
- Module build configuration, changelogs, READMEs, and package metadata are architecture/provenance inputs, not test inventory rows.
- `harness` rows remain indexed so the inventory is closed, but they do not create product behavior work.
- `portable-mixed` means the behavior is useful while the ProseMirror representation, owner, or public API is explicitly rejected.

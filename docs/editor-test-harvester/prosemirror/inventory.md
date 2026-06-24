# ProseMirror Test Inventory

Source: `../prosemirror`

Inventory command:

```bash
find ../prosemirror -path '*/node_modules' -prune -o -path '*/dist' -prune -o -path '*/build' -prune -o -type f \( -path '*/test/*' -o -path '*/tests/*' -o -path '*/__tests__/*' -o -name '*.test.*' -o -name '*.spec.*' \) -print | sort
```

The plain `rg --files ../prosemirror | rg ...` probe returned no rows because this checkout embeds package repositories under `model/`, `view/`, `state/`, `transform/`, `history/`, and `collab/`. The source inventory therefore uses `find` and excludes `.git`, build output, and symlinked harness assets. `../prosemirror/demo/test/mocha.css` and `../prosemirror/demo/test/mocha.js` are symlinks to missing local Mocha assets and are not source tests.

## Counts

| Metric | Count |
| --- | ---: |
| Source test/support files | 32 |
| Named test/describe rows | 848 |
| Classified files | 32 |
| Unresolved files | 0 |
| Portable | 19 |
| Portable-mixed | 10 |
| Harness/support | 3 |
| Product-shell | 0 |
| Skip source files | 0 |

`plate-owned` is an owner-routing overlay on top of the closed counts above. It marks useful plugin/view behavior that belongs in Plate packages, examples, docs, or backlog instead of raw Plite.

## Plate-Owned Overlay

| Source pattern | Current category | Plate target | Raw Plite split |
| --- | --- | --- | --- |
| `state/test/test-state.ts` plugin fields, prop functions, filter/append transactions, plugin keys | `portable-mixed` | Plate plugin middleware/lifecycle law | Transaction metadata and public commit behavior stay in Plite. |
| `view/test/webtest-draw.ts`, `view/test/webtest-view.ts` plugin views, props, dispatch binding, editable/attribute policy | `portable-mixed` | Plate React/plugin host and editor integration examples | Surface/editable lifecycle and DOM position mapping stay in Plite/browser proof. |
| `view/test/webtest-draw-decoration.ts` multiple plugin decorations, widget destroy, node-view handoff | `portable` | Plate plugin decoration/render lifecycle | Projection, annotation store, and widget mapping stay in Plite. |
| `view/test/webtest-markview.ts`, `view/test/webtest-nodeview.ts` contentDOM, update, ignoreMutation, destroy, getPos, inner/outer decorations | `portable-mixed` | Plate render/plugin authoring contracts | Raw Plite should not clone PM NodeView/MarkView APIs. |

## File Rows

| File | Lines | Test names | Category | Behavior rows | Reason |
| --- | ---: | ---: | --- | --- | --- |
| `../prosemirror/collab/test/test-collab.ts` | 228 | 11 | portable | PM-08 | collab convergence, remote steps, undo/redo under peers |
| `../prosemirror/collab/test/test-rebase.ts` | 172 | 13 | portable | PM-06, PM-08 | concurrent local/remote rebasing and dropped/deleted content |
| `../prosemirror/history/test/test-history.ts` | 413 | 24 | portable | PM-07 | undo grouping, redo invalidation, rebased selection restore |
| `../prosemirror/model/test/test-content.ts` | 149 | 61 | portable-mixed | PM-01 | content-expression fit/fill; schema grammar itself is not portable |
| `../prosemirror/model/test/test-diff.ts` | 91 | 21 | portable-mixed | PM-05 | fragment diff start/end for dirty-range detection |
| `../prosemirror/model/test/test-dom.ts` | 704 | 99 | portable | PM-03, PM-11 | DOM parse/serialize, whitespace, marks, comments, namespaces, parser context |
| `../prosemirror/model/test/test-mark.ts` | 173 | 41 | portable-mixed | PM-04 | mark-set identity, inclusivity, exclusion; PM mark algebra is not copied |
| `../prosemirror/model/test/test-node.ts` | 238 | 50 | portable-mixed | PM-01, PM-03 | node slicing, text extraction, JSON/debug, content validation |
| `../prosemirror/model/test/test-replace.ts` | 124 | 21 | portable | PM-01, PM-02 | replace fit, lopsided slices, split/merge rejection |
| `../prosemirror/model/test/test-resolve.ts` | 66 | 4 | portable-mixed | PM-06, PM-13 | position resolution; numeric position model is PM-specific |
| `../prosemirror/model/test/test-slice.ts` | 85 | 22 | portable | PM-02 | open slice boundaries and marked partial fragments |
| `../prosemirror/state/test/state.ts` | 54 | 0 | harness | PM-15 | test helper wrapper only |
| `../prosemirror/state/test/test-selection.ts` | 209 | 21 | portable | PM-06 | selection mapping through replace, insert, delete, leaf/block selection |
| `../prosemirror/state/test/test-state.ts` | 145 | 16 | portable-mixed | PM-14 | raw middleware invariant is portable; plugin field/filter/append and prop-function policy is Plate-owned |
| `../prosemirror/transform/test/test-mapping.ts` | 86 | 11 | portable | PM-05, PM-06 | position mapping and deleted flags through step maps |
| `../prosemirror/transform/test/test-replace_step.ts` | 27 | 1 | portable | PM-05, PM-08 | replace-around mapping through concurrent wrap/unwrap insertions |
| `../prosemirror/transform/test/test-step.ts` | 73 | 16 | portable | PM-05, PM-07 | step merging for typing, delete, mark add/remove |
| `../prosemirror/transform/test/test-structure.ts` | 182 | 24 | portable | PM-01, PM-05 | split/lift/wrap/replace structure fitting and impossible input suppression |
| `../prosemirror/transform/test/test-trans.ts` | 1089 | 168 | portable | PM-01, PM-02, PM-04, PM-05 | main transform oracle set: marks, insert/delete/join/split/lift/wrap/replace |
| `../prosemirror/transform/test/trans.ts` | 89 | 0 | harness | PM-15 | transform assertion helper and optional JSON emitter |
| `../prosemirror/view/test/view.ts` | 56 | 0 | harness | PM-15 | browser tempEditor/findTextNode/flush helpers only |
| `../prosemirror/view/test/webtest-clipboard.ts` | 125 | 14 | portable | PM-11 | clipboard context, open slices, wrappers, attrs, comment-wrapped HTML |
| `../prosemirror/view/test/webtest-composition.ts` | 308 | 19 | portable | PM-10 | composition lifecycle, Android newline, cursor wrappers, decorations, cross-paragraph input |
| `../prosemirror/view/test/webtest-decoration.ts` | 433 | 49 | portable | PM-12 | decoration set mapping, deletion, node movement, widget side/onRemove |
| `../prosemirror/view/test/webtest-domchange.ts` | 470 | 34 | portable | PM-09, PM-10 | DOM mutation import, ambiguous edits, synthetic backspace/enter, pending changes |
| `../prosemirror/view/test/webtest-draw-decoration.ts` | 534 | 41 | portable | PM-12 | rendered decoration/widget mapping is raw; multiple-plugin decoration lifecycle, widget destroy hooks, and node-view handoff are Plate-owned |
| `../prosemirror/view/test/webtest-draw.ts` | 177 | 8 | portable-mixed | PM-12, PM-14 | DOM redraw substrate is raw; attributes, editable prop, and plugin view lifetime are Plate-owned when app/plugin-facing |
| `../prosemirror/view/test/webtest-endOfTextblock.ts` | 131 | 16 | portable | PM-13 | line-edge detection, vertical movement, RTL, widget adjacency |
| `../prosemirror/view/test/webtest-markview.ts` | 69 | 4 | portable-mixed | PM-12, PM-14 | mark-view contentDOM/ignoreMutation/destroy lifecycle is Plate-owned render/plugin authoring pressure |
| `../prosemirror/view/test/webtest-nodeview.ts` | 203 | 10 | portable-mixed | PM-12, PM-14 | node-view update/contentDOM/ignoreMutation/destroy/getPos/inner decorations are Plate-owned render/plugin authoring pressure |
| `../prosemirror/view/test/webtest-selection.ts` | 358 | 19 | portable | PM-06, PM-13 | DOM selection import/export, coords, RTL, arrow movement through atoms/blocks |
| `../prosemirror/view/test/webtest-view.ts` | 123 | 10 | portable-mixed | PM-13, PM-14 | DOM position mapping is raw browser proof; prop/state update and dispatch binding are Plate-owned integration policy |

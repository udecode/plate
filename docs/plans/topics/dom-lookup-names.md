# Strict DOM lookups with no internal caller

Page: https://claude.ai/artifact/NZGUJJKwdxyeWy4XAzyqZY

The ledger asked whether a DOM coverage session keeps `resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary`, which no source code called, and whether the strict `findDocumentOrShadowRoot` should carry an `assert` name now that Plite's runtime calls only `resolveDocumentOrShadowRoot`. The [Plite DOM error gaps](../2026-10-18-plite-dom-error-gaps.md) plan added `resolveDocumentOrShadowRoot` to `DOMEditor` and `editor.api.dom` and added `plate/no-strict-dom-lookup`, which refuses every strict lookup in Plite and Plate package source, and left both questions here. The [DOM lookups](../2026-10-20-dom-lookup-names.md) plan renamed the strict root lookup to `assertDocumentOrShadowRoot` and deleted the coverage pair and its two result types. `node tooling/scripts/review-ledger.mjs show dom-lookup-names` prints the reviews.

## Public API

A Plate plugin reads the document or shadow root that holds the editor and stops when the editor is not mounted.

```ts
// packages/platejs/src/react/features/table/TablePlugin.tsx:411
const root = editor.api.dom.resolveDocumentOrShadowRoot();

if (!root) return undefined;
const domSelection = getSelection(root);
```

The strict root lookup throws when the editor has no mounted root. Only the lint rule's own test calls it.

```ts
// tooling/oxlint/plate-plugin.test.mjs:565
const root = editor.api.dom.assertDocumentOrShadowRoot();
```

A coverage session names the boundary that hides a point. An app asks the editor for the DOM point only when no boundary answers.

```ts
// packages/plitejs/test/dom/dom-coverage.ts:1183
testView(editor).domCoverage.getBoundaryForPoint(hiddenPoint)
```

The range form names every boundary the range crosses.

```ts
// packages/plitejs/test/dom/dom-coverage.ts:412
testView(editor).domCoverage.getBoundariesForRange(range)
```

## Main changes

- `DOMCoverage.create(editor)` makes a public session with no root (`packages/plitejs/src/dom/plugin/dom-coverage.ts:526`). Each mounted view's `DOMRootRuntime` makes its own session bound to its root element (`packages/plitejs/src/dom/plugin/dom-root-runtime.ts:283`), and only internal modules reach that session. Neither session offers a DOM lookup.
- The static `DOMEditor.resolveDOMPoint` and `resolveDOMRange` resolve DOM with no root (`packages/plitejs/src/dom/plugin/dom-editor.ts:1943`, `:1981`). `editor.api.dom.resolveDOMPoint` and `resolveDOMRange` also check that the page shows the editor's text and return `null` whenever it differs (`dom-editor.ts:1227-1236`, `:2953-2954`). A range whose endpoints are mounted still resolves when it crosses hidden content (`packages/plitejs/src/dom/plugin/dom-text-freshness.ts:324-343`), so a caller checks its boundaries first.
- Plite's selection export reads the boundaries a range crosses, asks the app to reveal each one whose policy says so, then projects the DOM range itself (`packages/plitejs/src/react/editable/dom-coverage-selection.ts:170-205`).
- `plate/no-strict-dom-lookup` names the resolver to use for each strict lookup (`tooling/oxlint/plate-plugin.mjs:1143`).

## What other editors do

Read from Slate 945a484df, prosemirror-view ca4c78e, Lexical dd5c41b13 and CodeMirror view fbff59b, as source, with nothing run. No editor answers a position with "DOM or the placeholder that hides it" in one call, and only Slate has a root lookup that throws.

| Editor | Root lookup | Missing root | DOM for an undrawn position |
| --- | --- | --- | --- |
| Slate | `DOMEditor.findDocumentOrShadowRoot` (`packages/slate-dom/src/plugin/dom-editor.ts:303-312`) | Throws through `toDOMNode`; no soft form | `toDOMPoint` throws |
| ProseMirror | `view.root` getter (`src/index.ts:348-358`) | Never null; falls back to `document` | A view draws its whole document |
| Lexical | `editor.getRootElement()` (`packages/lexical/src/LexicalEditor.ts:1605`) | Returns `null`; no strict form | No virtualization |
| CodeMirror | `view.root` getter (`src/editorview.ts:125`) | Never null; falls back to `document` (`:201`) | `domAtPos` always answers, maybe beside a placeholder; `visibleRanges` says what is drawn (`src/editorview.ts:722-730`, `:103`) |
| Plite today | `resolveDocumentOrShadowRoot` and strict `assertDocumentOrShadowRoot` | `null`, or a throw | `resolveDOMPoint` returns `null`; `getBoundaryForPoint` names the hiding boundary |

## Open work

- Same-named resolvers differ. `DOMEditor.resolveDOMPoint` and `resolveDOMRange` skip the painted-text check that `editor.api.dom.resolveDOMPoint` and `resolveDOMRange` run (`dom-editor.ts:1943`, `:1981`, `:2953-2954`). Owner: suggested task t_bd61f59e, which this question joined. Stop: that task lands or is dropped.
- An open plan still teaches the deleted lookup. The External text view substrate plan shows `coverage.resolveDOMPointOrBoundary(point)` (`docs/plans/2026-09-03-editable-island-substrate-closure.md:353`). Owner: that plan's next iteration. Stop: its next edit of that snippet.

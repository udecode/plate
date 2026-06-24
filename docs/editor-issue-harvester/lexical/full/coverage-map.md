# Full Lexical Issue Coverage Map

source matrix: `docs/editor-issue-harvester/lexical/full/matrix.md`
source rows: `docs/editor-issue-harvester/lexical/full/classified-issues.tsv`

## Current Proof Coverage

| Matrix key | Issue count | Current proof posture | Next owner |
| --- | ---: | --- | --- |
| Clipboard, paste, copy, cut, HTML, markdown, and serialization | 421 | Strong existing proof: paste-html has Google Docs, Google Sheets, Quip, source-code HTML, list/link/image/table corpus, synthetic/native paste guards, and generated clipboard gauntlets. | Refactor by adding only source-specific missing corpus rows, not one test per issue. |
| DOM selection, caret, range, focus, and native movement | 416 | Broad but still high-risk: stress rows, richtext/plaintext/inlines/huge-document/synced-blocks cover many gestures. | Refactor around subfamilies: word movement/delete, multi-leaf selection, command movement across atoms, and selection after remote edits. |
| Table selection, navigation, paste, and nested table robustness | 248 | Table example covers containment, Backspace/Delete/Enter, Arrow navigation, triple-click, and drag containment. Full nested-table/whole-table selection model remains not owned. | Add containment rows only; route whole-table/nested-table semantics to table model owner. |
| Plate-owned rich text/plugin/product policy | 468 | Not raw Plite law. Lists, links, markdown, code, hashtags, mentions, toolbar, typeahead, stickers, comments, and playground UX route to Plate unless a raw invariant is split. | Plate package/example owner or `plite-plan` if the raw split is unclear. |
| Void, decorator, image, mention, token, and inline atom boundaries | 71 | Existing proof covers inline void navigation, mention copy/cut/IME, editable voids, image paste undo, and block void movement. | Add focused rows for decorator-only line movement and Enter/paste around block atoms where missing. |
| Raw mobile keyboard, tap, selection, and IME | 66 | Deferred. Playwright mobile viewport is not enough. | Raw Appium/device proof lane; do not claim green from desktop. |
| IME and beforeinput transport | 65 | Strong desktop proof: richtext, mentions, placeholder, plaintext, dom-coverage boundaries, WebKit composition deletion, multi-leaf Korean IME, and `plite-browser` IME helpers. | Add only engine/gesture-specific gaps such as Safari Tab + Korean IME if transport is honest. |
| Remote/collaborative edit rebasing, selection, and history | 63 | Package proof exists for remote commits/history/bookmarks; browser synced-block selection is rich but not yjs parity. | Start with package range-transform rows, defer yjs browser parity to accepted lane. |
| Large document, transform, memory, and freeze performance | 41 | Needs benchmark target before runtime work. Huge-document tests exist but issue rows need equivalent workloads. | `plite-ar-fast` / benchmark target first, then optimization. |
| History, undo/redo, and batch boundaries | 38 | Strong package proof for merge/push/skip, selections, composition, structural operations, and redo clearing. | Add cut/paste boundary if missing; otherwise use existing history contract. |
| Shadow DOM and non-document-root browser selection | 8 | Covered by `shadow-dom.test.ts` typing, generated gauntlet, Arrow movement, and line breaks. | Rerun gate when relevant; no new owner needed now. |

## Named Proof Rows Checked

- IME: `richtext.test.ts` has active-mark, multi-leaf Korean, WebKit composition deletion, select-all IME, empty block IME.
- Paste: `paste-html.test.ts` has Google Docs, Google Sheets, Quip, source-code HTML, nested lists, images, links, iOS prediction, generated clipboard/drop gauntlets.
- Tables: `tables.test.ts` has Backspace/Delete/Enter, Arrow, triple-click, drag containment.
- History/collab: `history-contract.ts`, `integrity-contract.ts`, `collab-history-runtime-contract.ts`, and `synced-blocks.test.ts` cover history, remote rebasing, projected selection, copy, and synced-root editing.

## Coverage Decision

The full corpus does not justify 1,330 new raw Plite tests. That would be
maintenance garbage. The correct shape is subfamily coverage:

1. Strengthen high-risk gaps inside existing proof families.
2. Keep Plate policy rows out of raw Plite.
3. Defer raw mobile and yjs browser parity until those proof lanes exist.
4. Route perf rows through benchmark targets before runtime work.

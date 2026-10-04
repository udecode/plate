# Current behavior evidence navigation

The parity and protocol matrices retain historical coverage claims and stable
spec IDs. Some literal test paths belong to earlier owners. Use the source
and proof entry points in the [feature ledger](../research/schema.md#review-history) to
choose an exact replay; a replacement path does not inherit a previous
`tested` or `locked` result.

The ledger observes current editable package source, copied registry UI,
actual shared examples, exports and editor proof tooling. Its per-scope files, fingerprints and historical
records are the shared navigation owner; this page does not keep another
source map. The normative editing spec remains in this directory.

| Behavior or spec family | Current source, consumers and proof entry points |
| --- | --- |
| Paragraph, heading, quote, rule; `EDIT-P-*`, `EDIT-H-*`, `EDIT-BQ-*` | [Blocks and styles](../research/review-scopes/basic.json) |
| Required document slots, closed paste, deletion and rule fallback | [Document-structure repair](../plans/2026-09-22-document-structure-editing-repair.md); [Plite slice contract](../../packages/plitejs/test/slice-fit-contract.test.ts), Plate [heading](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.spec.tsx) and [quote](../../packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.spec.tsx) rules, [raw forced-layout browser proof](../../apps/plite/tests/plite-browser/donor/examples/forced-layout.test.ts). This restores the accepted schema-owned document invariant; the editing law is unchanged. |
| Marks and affinity; `EDIT-AFF-*`; autoformat and exit breaks | [Styles](../research/review-scopes/styles.json), [selection](../research/review-scopes/selection.json), [editing](../research/review-scopes/editing.json) |
| Lists and indentation; `EDIT-LIST-*` | [Lists](../research/review-scopes/list.json) |
| Code; `EDIT-CB-*` | [Native code](../research/review-scopes/code.json), [external text](../research/review-scopes/external-text.json). Current line-boundary and insertion proof: [`BaseCodeBlockPlugin.spec.tsx`](../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx); copied JSON, selection, history and comment proof: [`code-block.format.spec.tsx`](../../apps/www/src/registry/components/editor/code-block.format.spec.tsx); live syntax and JSON button proof: [`code-block-views.spec.ts`](../../apps/www/tests/browser/code-block-views.spec.ts). |
| Links | [Links and source entry](../research/review-scopes/link.json) |
| Math; `EDIT-MATH-*` | [Math](../research/review-scopes/math.json) |
| Tables; `EDIT-TABLE-*` | [Tables and cell selection](../research/review-scopes/table.json) |
| Images, audio, video, files and embeds | [Media](../research/review-scopes/media.json), [uploads](../research/review-scopes/uploads.json) |
| Dates, callouts, details and footnotes | [Dates](../research/review-scopes/date.json), [callout/disclosure](../research/review-scopes/callout.json), [footnotes](../research/review-scopes/footnote.json) |
| Find and outline navigation | [Find](../research/review-scopes/search.json), [TOC](../research/review-scopes/toc.json) |
| Mentions, tags, emoji and slash entry | [Combobox](../research/review-scopes/autocomplete.json), [mentions](../research/review-scopes/mentions.json), [tags](../research/review-scopes/tags.json), [emoji](../research/review-scopes/emoji.json), [slash](../research/review-scopes/slash.json). Typed-trigger activation, refusal, rollback and undo: [`useCombobox.spec.tsx`](../../packages/platejs/src/react/features/combobox/useCombobox.spec.tsx); mention, slash, emoji and footnote completion, Escape, prose slashes and Chromium IME preview: [`combobox.spec.ts`](../../apps/www/tests/browser/combobox.spec.ts). Physical IME and Android taps remain unverified. |
| Markdown and source-entry round trips | [Markdown](../research/review-scopes/markdown.json), [streaming](../research/review-scopes/streaming.json) |
| Clipboard, selection, IME, focus and accessibility | [Clipboard](../research/review-scopes/clipboard.json), [selection](../research/review-scopes/selection.json), [native input](../research/review-scopes/native.json), [accessibility](../research/review-scopes/accessibility.json). Chromium IME Text identity and cross-block replacement: [IME caret repair](../plans/2026-09-29-ime-caret-diagnosis.md). Exact homepage preedit, custom rendering and post-composition selection: [PR 5137 follow-up](../plans/5137-ime-inline-caret.md). Native OS caret paint remains unverified. |
| Block and text drag and drop; `EDIT-DRAG-*` | [DnD transfer plan](../plans/2026-10-01-dnd-transfer-consolidation.md) and [schema-derived landing plan](../plans/2026-10-02-dnd-schema-derived-landing.md); Plite [transfer contract](../../packages/plitejs/test/transfer-contract.test.ts), [hover geometry](../../packages/plitejs/test/react/dom-drag-geometry.test.ts), [native drop bridge](../../packages/plitejs/test/react/dom-coverage-native-bridge-contract.test.ts), [`deleteByDrag`](../../packages/plitejs/test/react/model-input-strategy-contract.test.ts) and the [anchor mapping contract](../../packages/plitejs/test/anchor-mapping-contract.ts), whose forward anchor past a slice fitted beside an inline element keeps a text drop in a paragraph with a link from refusing; the Plate feature specs for the List, ColumnItem, Table, Details, Footnote and Upload landing rules ([`BaseListPlugin.spec.tsx`](../../packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx), [`BaseColumnPlugin.spec.ts`](../../packages/platejs/src/features/layout/lib/BaseColumnPlugin.spec.ts), [`BaseTablePlugin.transfer.spec.ts`](../../packages/platejs/src/features/table/lib/BaseTablePlugin.transfer.spec.ts), [`BaseDetailsPlugin.spec.ts`](../../packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts), [`BaseFootnotePlugin.spec.ts`](../../packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts), [`BaseUploadPlugin.spec.ts`](../../packages/platejs/src/features/upload/lib/BaseUploadPlugin.spec.ts), [`UploadPlugin.spec.ts`](../../packages/platejs/src/react/features/upload/UploadPlugin.spec.ts)); browser [cross-editor text drag](../../apps/plite/tests/plite-browser/donor/examples/cross-editor-drag.test.ts), [Plate native block drag](../../apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts) in Chromium, Firefox and WebKit, www [`dnd.spec.ts`](../../apps/www/tests/browser/dnd.spec.ts), [`files-sdk.spec.ts`](../../apps/www/tests/browser/files-sdk.spec.ts) and [`homepage-dnd.test.ts`](../../tooling/e2e/homepage-dnd.test.ts). Touch drag stays unverified for lack of a device. |
| Copied UI commands, exact mounted-view targeting, focus and provider installs | [UI composition](../research/review-scopes/ui.json), [adoption and proof](../plans/2026-09-18-ui-composition-installation-design.md#implementation-outcome) |
| Comments and Suggestions | [Comments](../research/review-scopes/comments.json), [Suggestions](../research/review-scopes/suggestions.json), [authored changes](../research/review-scopes/authored.json), [current authored select-all and Enter proof](../plans/2026-09-21-native-select-all-delete-consecutive-enter.md) |
| Static rendering and document interchange | [HTML/static](../research/review-scopes/html.json), [DOCX](../research/review-scopes/documents.json), [CSV](../research/review-scopes/csv.json), [exports](../research/review-scopes/exports.json) |
| Layout, drawings and large documents | [Layout](../research/review-scopes/layout.json), [diagrams](../research/review-scopes/drawing.json), [canvas](../research/review-scopes/canvas.json), [large documents](../research/review-scopes/large-documents.json), [pagination](../research/review-scopes/pagination.json) |
| Runtime roots, reads, history and saved values | [Runtime](../research/review-scopes/runtime.json), [reads](../research/review-scopes/reads.json), [history](../research/review-scopes/history.json), [persistence](../research/review-scopes/persistence.json) |

Before carrying a historical matrix result forward, resolve its spec ID,
inspect the owning implementation and current oracle, and run the affected
package or browser proof through Verify Plate. Record actual source and
results in the owning execution plan. A missing or renamed test is an
evidence gap until replay; it does not prove the feature is missing.

External reference observations keep their original date and scope. Updating
navigation does not advance an external architecture, test or issue cursor.

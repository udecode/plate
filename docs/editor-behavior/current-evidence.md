# Current behavior evidence navigation

The parity and protocol matrices retain historical coverage claims and stable
spec IDs. Some literal test paths belong to earlier owners. Use the source
and proof entry points in the [feature ledger](../research/reviews.md) to
choose an exact replay; a replacement path does not inherit a previous
`tested` or `locked` result.

The ledger observes current editable package source, copied registry UI,
actual shared examples, exports and editor proof tooling. Its per-scope files, fingerprints and historical
records are the shared navigation owner; this page does not keep another
source map. The normative editing spec remains in this directory.

| Behavior or spec family | Current source, consumers and proof entry points |
| --- | --- |
| Paragraph, heading, quote, rule; `EDIT-P-*`, `EDIT-H-*`, `EDIT-BQ-*` | [Blocks and styles](../research/reviews.md#basic) |
| Required document slots, closed paste, deletion and rule fallback | [Document-structure repair](../plans/2026-09-22-document-structure-editing-repair.md); [Plite slice contract](../../packages/plitejs/test/slice-fit-contract.test.ts), Plate [heading](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.spec.tsx) and [quote](../../packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.spec.tsx) rules, [raw forced-layout browser proof](../../apps/plite/tests/plite-browser/donor/examples/forced-layout.test.ts). This restores the accepted schema-owned document invariant; the editing law is unchanged. |
| Marks and affinity; `EDIT-AFF-*`; autoformat and exit breaks | [Styles](../research/reviews.md#styles), [selection](../research/reviews.md#selection), [editing](../research/reviews.md#editing) |
| Lists and indentation; `EDIT-LIST-*` | [Lists](../research/reviews.md#list) |
| Code; `EDIT-CB-*` | [Native code](../research/reviews.md#code), [external text](../research/reviews.md#external-text). Current line-boundary and insertion proof: [`BaseCodeBlockPlugin.spec.tsx`](../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx); copied JSON, selection, history and comment proof: [`code-block.format.spec.tsx`](../../apps/www/src/registry/components/editor/code-block.format.spec.tsx); live syntax and JSON button proof: [`code-block-views.spec.ts`](../../apps/www/tests/browser/code-block-views.spec.ts). |
| Links | [Links and source entry](../research/reviews.md#link) |
| Math; `EDIT-MATH-*` | [Math](../research/reviews.md#math) |
| Tables; `EDIT-TABLE-*` | [Tables and cell selection](../research/reviews.md#table) |
| Images, audio, video, files and embeds | [Media](../research/reviews.md#media), [uploads](../research/reviews.md#uploads) |
| Dates, callouts, details and footnotes | [Dates](../research/reviews.md#date), [callout/disclosure](../research/reviews.md#callout), [footnotes](../research/reviews.md#footnote) |
| Find and outline navigation | [Find](../research/reviews.md#search), [TOC](../research/reviews.md#toc) |
| Mentions, tags, emoji and slash entry | [Combobox](../research/reviews.md#autocomplete), [mentions](../research/reviews.md#mentions), [tags](../research/reviews.md#tags), [emoji](../research/reviews.md#emoji), [slash](../research/reviews.md#slash) |
| Markdown and source-entry round trips | [Markdown](../research/reviews.md#markdown), [streaming](../research/reviews.md#streaming) |
| Clipboard, selection, IME, focus and accessibility | [Clipboard](../research/reviews.md#clipboard), [selection](../research/reviews.md#selection), [native input](../research/reviews.md#native), [accessibility](../research/reviews.md#accessibility) |
| Copied UI commands, exact mounted-view targeting, focus and provider installs | [UI composition](../research/reviews.md#ui), [adoption and proof](../plans/2026-09-18-ui-composition-installation-design.md#implementation-outcome) |
| Comments and Suggestions | [Comments](../research/reviews.md#comments), [Suggestions](../research/reviews.md#suggestions), [authored changes](../research/reviews.md#authored), [current authored select-all and Enter proof](../plans/2026-09-21-native-select-all-delete-consecutive-enter.md) |
| Static rendering and document interchange | [HTML/static](../research/reviews.md#html), [DOCX](../research/reviews.md#documents), [CSV](../research/reviews.md#csv), [exports](../research/reviews.md#exports) |
| Layout, drawings and large documents | [Layout](../research/reviews.md#layout), [diagrams](../research/reviews.md#drawing), [canvas](../research/reviews.md#canvas), [large documents](../research/reviews.md#large-documents), [pagination](../research/reviews.md#pagination) |
| Runtime roots, reads, history and saved values | [Runtime](../research/reviews.md#runtime), [reads](../research/reviews.md#reads), [history](../research/reviews.md#history), [persistence](../research/reviews.md#persistence) |

Before carrying a historical matrix result forward, resolve its spec ID,
inspect the owning implementation and current oracle, and run the affected
package or browser proof through Verify Plate. Record actual source and
results in the owning execution plan. A missing or renamed test is an
evidence gap until replay; it does not prove the feature is missing.

External reference observations keep their original date and scope. Updating
navigation does not advance an external architecture, test or issue cursor.

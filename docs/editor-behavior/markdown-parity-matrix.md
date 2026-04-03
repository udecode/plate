# Existing Feature Coverage Matrix for Plate

This is the major-release coverage gate for Plate's existing editor features.

Despite the filename, this file is no longer only about markdown-native
constructs. The major can break any existing content-affecting feature, so the
matrix needs to track:

- markdown-native behavior
- markdown extensions
- block-editor-native elements
- document styling and layout behavior
- collaboration and editor-only content surfaces

Use this with:

- [markdown-standards.md](./markdown-standards.md)
- [markdown-editing-spec.md](./markdown-editing-spec.md)
- [editor-protocol-matrix.md](./editor-protocol-matrix.md)
- [markdown-editing-reference-audit.md](./markdown-editing-reference-audit.md)

This file is not the exhaustive scenario matrix. It answers:

- which feature families exist
- which ones are covered enough for release
- which ones are deferred

## Authority Model

Use the strongest external precedent available for each feature family.

| Family | Parse / Serialize Authority | Primary UX Reference | Secondary Reference | Fallback |
| --- | --- | --- | --- | --- |
| Markdown-native syntax | CommonMark / GFM / GitHub Docs for GFM-only constructs / LaTeX-style math / MDX when applicable | Typora | Milkdown | explicit repo decision only if refs disagree or are silent |
| Block-editor-native elements | feature's current serialized shape or explicit non-markdown contract | Notion | Milkdown, then the strongest adjacent mainstream precedent | fallback only when no clear external standard exists |
| Tables and document-style editing | GFM / HTML table rules when applicable | Google Docs | Notion, Milkdown | fallback only after stronger table precedent runs out |
| Collaboration and reviewing | current serialized shape or editor-only contract | Google Docs | Notion | fallback only after stronger collaboration precedent runs out |
| Styling and layout | current serialized shape plus HTML / CSS expectations where relevant | Google Docs | Notion | fallback only after stronger styling precedent runs out |

## Status Meaning

- `locked`: strong enough to build on without blocking the major
- `partial`: existing feature works, but the contract or coverage is still thin
- `gap`: existing feature is under-specified, lossy, or weakly covered
- `profile-divergence`: existing feature works, but it is outside the strict markdown-first profile and still needs explicit behavior policy
- `deferred-minor`: not part of this major even though the parser or docs mention it

## Scope Rule

This file tracks existing content-affecting surfaces only.

It does not try to gate:

- AI workflows
- slash menu / toolbar UI
- docx / html / csv export quality unless it changes editor behavior
- browser-only chrome around the editor

## How To Read A Row

- `Behavior Scope` is the user-facing behavior that must be spec'd
- `Current Evidence` lists representative seams, not every test
- `Next Work` is the concrete remaining work for the major lane
- `Editing Spec IDs` should point to concrete spec IDs or the pending family ID

## Markdown-Native Core

| Feature | Family | Parse Authority | Primary UX Ref | Secondary Ref | Behavior Scope | Editing Spec IDs | Current Evidence | Next Work | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paragraph | markdown-native | CommonMark | Typora | Milkdown | `↵`, `⌫`, `⇥`, `⇤`, root-empty behavior | `EDIT-P-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/indent/src/lib/withIndent.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | finish explicit non-empty root `⌫` fallback | `locked` |
| Heading | markdown-native | CommonMark | Typora | Milkdown | split, reset, depth-specific behavior | `EDIT-H-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`packages/core/src/lib/plugins/override/withBreakRules.spec.tsx`<br/>`packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx` | no active major blocker | `locked` |
| Blockquote | markdown-native | CommonMark | Typora | Milkdown | nested blocks, empty exit, `⌫`, `⇤`, quoted list interaction | `EDIT-BQ-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/core/src/lib/plugins/override/withBreakRules.spec.tsx`<br/>`packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx` | no active major blocker | `locked` |
| Unordered list | markdown-native | CommonMark | Typora | Milkdown | split, exit, outdent, quoted-list interaction | `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`packages/list/src/lib/withList.spec.tsx`<br/>`packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx` | richer mixed-document editing matrices | `locked` |
| Ordered list | markdown-native | CommonMark | Typora | Milkdown | restart numbering, split, exit, outdent | `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`packages/markdown/src/lib/serializer/standardList.spec.tsx`<br/>`packages/list/src/lib/withList.spec.tsx` | no active major blocker | `locked` |
| Link | markdown-native | CommonMark | Typora | Milkdown | round-trip, directional affinity, plain-link paragraphs | `EDIT-AFF-LINK-001` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/deserializer/deserializeMentionLink.spec.tsx`<br/>`packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | no active major blocker | `locked` |
| Image | markdown-native | CommonMark | Typora | Milkdown | alt vs title, attribute precedence, plain-image paragraphs | `EDIT-IMG-*` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/defaultRules.spec.ts`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | plain markdown image output is limited to alt, src, and optional title; width/height remain HTML/MDX-only | `locked` |
| Emphasis / italic | markdown-native | CommonMark | Typora | Milkdown | round-trip and markdown-native parse/serialize behavior | `—` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx` | no active major blocker | `locked` |
| Strong / bold | markdown-native | CommonMark | Typora | Milkdown | round-trip and markdown-native parse/serialize behavior | `—` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts` | no active major blocker | `locked` |
| Inline code | markdown-native | CommonMark | Typora | Milkdown | round-trip, hard-edge typing, mixed-mark behavior | `EDIT-AFF-HARD-001` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`<br/>`packages/markdown/src/lib/serializer/convertTextsSerialize.spec.ts` | no active major blocker | `locked` |
| Fenced code block | markdown-native | CommonMark | Typora | Milkdown | direct raw markdown, `↵`, `⌫`, `⇥`, `⇤`, language preservation | `EDIT-CB-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/code-block/src/lib/withCodeBlock.spec.tsx`<br/>`packages/code-block/src/react/CodeBlockPlugin.spec.tsx` | no active major blocker | `locked` |
| Thematic break | markdown-native | CommonMark | Typora | Milkdown | creation and adjacent block behavior | `EDIT-HR-*` | `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`packages/markdown/src/lib/deserializer/convertNodesDeserialize.spec.ts` | no active major blocker | `locked` |
| Hard line break | markdown-native | CommonMark + HTML fallback | Typora | Milkdown | paragraph and blockquote parity, html fallback, trailing breaks | `EDIT-HARD-*` | `packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/deserializer/splitLineBreaks.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | no active major blocker | `locked` |

## Markdown Extensions

| Feature | Family | Parse Authority | Primary UX Ref | Secondary Ref | Behavior Scope | Editing Spec IDs | Current Evidence | Next Work | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Task list | markdown extension | GFM / GitHub Docs | Typora | Milkdown | checked-state round-trip, list editing rules | `EDIT-LIST-*` | `packages/markdown/src/lib/taskList.spec.ts`<br/>`packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`packages/markdown/src/lib/serializer/listToMdastTree.spec.ts`<br/>`packages/list/src/lib/normalizers/withInsertBreakList.spec.tsx`<br/>`packages/list/src/lib/withList.spec.tsx` | no active major blocker | `locked` |
| Table | markdown extension | GFM | Google Docs | Notion, Milkdown | cell nav, `↵`, `⇥`/`⇤`, `⌫`, multi-cell selection, copy/paste, merge/split, row/column insert/delete, deserialize/serialize | `EDIT-TABLE-*` | `packages/markdown/src/lib/table.spec.ts`<br/>`packages/table/src/lib/withTable.spec.tsx`<br/>`packages/table/src/lib/withApplyTable.spec.tsx`<br/>`packages/table/src/lib/withDeleteTable.spec.tsx`<br/>`packages/table/src/lib/withTableCellSelection.spec.tsx`<br/>`packages/table/src/lib/withInsertFragmentTable.spec.tsx`<br/>`packages/table/src/lib/transforms/*.spec.tsx`<br/>`packages/table/src/lib/merge/*.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | no active major blocker | `locked` |
| Strikethrough | markdown extension | GFM / GitHub Docs | Typora | Milkdown | round-trip, directional affinity | `EDIT-AFF-MARK-001` | `packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts`<br/>`packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts`<br/>`packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/serializer/serializeInlineMd.spec.ts` | no active major blocker | `locked` |
| Inline math | markdown extension | LaTeX-style math / KaTeX conventions | Typora | Milkdown | round-trip, boundary behavior, inline/table interaction | `EDIT-MATH-*` | `packages/markdown/src/lib/mathSurface.spec.ts`<br/>`packages/math/src/lib/BaseInlineEquationPlugin.spec.ts`<br/>`packages/math/src/lib/transforms/insertInlineEquation.spec.ts`<br/>`packages/math/src/react/hooks/useEquationInput.spec.tsx` | no active major blocker | `locked` |
| Block math | markdown extension | LaTeX-style math / KaTeX conventions | Typora | Milkdown | round-trip, empty exit, block selection behavior | `EDIT-MATH-*` | `packages/markdown/src/lib/mathSurface.spec.ts`<br/>`packages/math/src/lib/BaseEquationPlugin.spec.ts`<br/>`packages/math/src/lib/transforms/insertEquation.spec.ts`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx` | no active major blocker | `locked` |
| Autolink literal | markdown extension | GFM / GitHub Docs | Typora | Milkdown | bare URL parse/serialize and editing | `EDIT-AFF-LINK-001` | `packages/link/src/lib/withLink.spec.tsx`<br/>`packages/markdown/src/lib/gfmSurface.spec.ts` | no active major blocker | `locked` |
| Footnote | markdown extension | GFM / GitHub Docs | Typora | Milkdown | reference/definition model and editing | `EDIT-FOOTNOTE-*` | `packages/markdown/src/lib/gfmSurface.spec.ts`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts`<br/>`packages/markdown/src/lib/rules/defaultRules.ts` | current fallback is covered; a first-class footnote model is still future work, not a hidden gap | `locked` |

## Block-Editor-Native Existing Elements

| Feature | Family | Parse Authority | Primary UX Ref | Secondary Ref | Behavior Scope | Editing Spec IDs | Current Evidence | Next Work | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mention | block-editor-native | local mention markdown contract | Notion | Milkdown | inline insertion, spacing, keyboard access, markdown mention link round-trip | `EDIT-MENTION-*` | `packages/mention/src/lib/BaseMentionPlugin.spec.tsx`<br/>`packages/mention/src/lib/getMentionOnSelectItem.spec.tsx`<br/>`packages/markdown/src/lib/deserializer/deserializeMentionLink.spec.tsx`<br/>`packages/markdown/src/lib/serializer/serializeMention.spec.ts` | explicit local contract informed by mainstream mention-chip behavior | `locked` |
| Callout | block-editor-native | local MDX callout contract | Notion | Milkdown | insert, nested content, keyboard behavior, markdown round-trip | `EDIT-CALLOUT-*` | `packages/callout/src/lib/BaseCalloutPlugin.spec.ts`<br/>`packages/callout/src/lib/transforms/insertCallout.spec.ts`<br/>`packages/core/src/lib/plugins/override/withBreakRules.spec.tsx`<br/>`packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx`<br/>`packages/markdown/src/lib/mdx.spec.tsx` | explicit local contract; not claimed as a stronger external standard than the evidence supports | `locked` |
| Toggle | block-editor-native | current toggle node contract | Notion | Milkdown | open/close, nested blocks, `↵`, `⌫`, `⇥`, `⇤` | `EDIT-TOGGLE-*` | `packages/toggle/src/lib/BaseTogglePlugin.spec.ts`<br/>`packages/toggle/src/lib/queries/someToggle.spec.ts`<br/>`packages/toggle/src/react/hooks/toggleHooks.spec.tsx`<br/>`packages/toggle/src/react/queries/toggleQueries.spec.ts`<br/>`packages/toggle/src/react/withToggle.spec.tsx` | defer to the planned toggle rewrite instead of incremental patching in this lane | `deferred-minor` |
| Date | block-editor-native | local MDX date contract | Notion | Google Docs | inline insertion, adjacency checks, keyboard access, markdown round-trip | `EDIT-DATE-*` | `packages/date/src/lib/BaseDatePlugin.spec.tsx`<br/>`packages/date/src/lib/transforms/insertDate.spec.tsx`<br/>`packages/date/src/lib/queries/isPointNextToNode.spec.tsx`<br/>`packages/markdown/src/lib/dateElement.spec.ts` | explicit local contract informed by mainstream inline-chip behavior | `locked` |
| TOC | block-editor-native | local MDX TOC contract | Notion | docs reference | insert, selection, scrolling hooks, serialization policy | `EDIT-TOC-*` | `packages/toc/src/lib/BaseTocPlugin.spec.ts`<br/>`packages/toc/src/lib/transforms/insertToc.spec.ts`<br/>`packages/toc/src/react/hooks/*.spec.tsx`<br/>`packages/markdown/src/lib/mdx.spec.tsx` | explicit local contract; not sold as a strong public standard | `locked` |
| Column group / column item | block-editor-native | local MDX column contract | Notion | docs reference | insert, split, move, select-all, nested editing, serialization | `EDIT-COLUMN-*` | `packages/layout/src/lib/withColumn.spec.ts`<br/>`packages/layout/src/lib/transforms/insertColumnGroup.spec.ts`<br/>`packages/layout/src/lib/transforms/insertColumn.spec.ts`<br/>`packages/layout/src/lib/transforms/toggleColumnGroup.spec.tsx`<br/>`packages/layout/src/lib/transforms/setColumns.spec.tsx`<br/>`packages/markdown/src/lib/columnSurface.spec.ts` | explicit local contract; not sold as a strong public standard | `locked` |
| Media embed | block-editor-native | local media MDX contract | Notion | docs reference | embed insertion, editing, serialization | `EDIT-MEDIA-*` | `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.spec.ts`<br/>`packages/media/src/lib/media-embed/transforms/insertMediaEmbed.spec.ts`<br/>`packages/media/src/lib/BaseMediaPluginContracts.spec.ts` | explicit local contract; not sold as a stronger public standard than the evidence supports | `locked` |
| Image / file / audio / video blocks | block-editor-native | local media contracts | Notion | Google Docs for file-ish behavior | insert, caption/title, selection, serialization | `EDIT-MEDIA-*` | `packages/media/src/lib/BaseMediaPluginContracts.spec.ts`<br/>`packages/media/src/lib/image/withImageEmbed.spec.tsx`<br/>`packages/media/src/lib/image/withImageUpload.spec.tsx`<br/>`packages/media/src/lib/media/insertMedia.spec.ts`<br/>`packages/markdown/src/lib/commonmarkSurface.spec.ts`<br/>`packages/markdown/src/lib/mediaSurface.spec.ts`<br/>`packages/markdown/src/lib/rules/utils/parseAttributes.spec.ts` | explicit local contract informed by Notion-style media blocks and file-ish Docs behavior | `locked` |
| Code drawing / Excalidraw | block-editor-native | local non-markdown contract | Notion-like board tools | docs reference | insertion, selection, serialization policy | `EDIT-DRAWING-*` | `packages/code-drawing/src/lib/transforms/insertCodeDrawing.spec.ts`<br/>`packages/code-drawing/src/lib/BaseCodeDrawingPlugin.spec.ts`<br/>`packages/excalidraw/src/lib/transforms/insertExcalidraw.spec.ts`<br/>`packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts` | deferred from this major instead of locking a shallow policy lane | `deferred-minor` |
| Caption | block-editor-native helper | local caption contract | Notion | Google Docs | movement into/out of captions, media integration | `EDIT-CAPTION-*` | `packages/caption/src/lib/withCaption.spec.tsx` | explicit local contract informed by media-caption behavior in block editors and docs tools | `locked` |

## Document Styling And Layout

| Feature | Family | Parse Authority | Primary UX Ref | Secondary Ref | Behavior Scope | Editing Spec IDs | Current Evidence | Next Work | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Indent | styling/layout | local block style contract | Google Docs | Notion | paragraph indent, interaction with quote/list owners | `EDIT-INDENT-*` | `packages/indent/src/lib/withIndent.spec.tsx`<br/>`packages/indent/src/lib/transforms/setIndent.spec.ts`<br/>`packages/list/src/lib/withList.spec.tsx`<br/>`content/(plugins)/(styles)/indent.mdx` | explicit local style contract informed by Docs-style paragraph indentation | `locked` |
| Text align | styling/layout | local block style contract | Google Docs | Notion | align transform, affected blocks, serialization policy | `EDIT-ALIGN-*` | `packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts`<br/>`content/(plugins)/(styles)/text-align.mdx` | explicit local style contract informed by Docs-style alignment controls | `locked` |
| Text indent | styling/layout | local block style contract | Google Docs | Notion | indent transform, interaction with paragraph/list/quote | `EDIT-TEXT-INDENT-*` | `packages/basic-styles/src/lib/BaseTextIndentPlugin.spec.ts` | explicit local style contract informed by Docs-style indentation controls | `locked` |
| Line height | styling/layout | local style contract | Google Docs | Notion | application/removal, affected blocks, serialization policy | `EDIT-LINE-HEIGHT-*` | `packages/basic-styles/src/lib/BaseLineHeightPlugin.spec.ts` | explicit local style contract informed by document-style spacing controls | `locked` |
| Font family / size / weight / color / background | styling/layout | local style span contract | Google Docs | Notion | mark boundaries, serialization policy, mixed markdown behavior | `EDIT-STYLE-*` | `packages/basic-styles/src/lib/BaseFontFamilyPlugin.spec.ts`<br/>`packages/basic-styles/src/lib/BaseFontSizePlugin.spec.ts`<br/>`packages/basic-styles/src/lib/BaseFontWeightPlugin.spec.ts`<br/>`packages/basic-styles/src/lib/BaseFontColorPlugin.spec.ts`<br/>`packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.spec.ts`<br/>`packages/markdown/src/lib/rules/fontRules.ts` | explicit local style contract informed by document-style formatting controls | `locked` |

## Collaboration And Editor-Only Existing Features

| Feature | Family | Parse Authority | Primary UX Ref | Secondary Ref | Behavior Scope | Editing Spec IDs | Current Evidence | Next Work | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Comment | collaboration | editor-only contract | Google Docs | Notion | mark boundaries, creation/removal, serialization exclusion | `EDIT-COMMENT-*` | `packages/comment/src/lib/BaseCommentPlugin.spec.ts`<br/>`packages/comment/src/lib/utils/getCommentKeys.spec.ts`<br/>`packages/comment/src/lib/utils/getCommentCount.spec.ts`<br/>`packages/markdown/src/lib/rules/defaultRules.ts` | deferred with the collaboration lane for a later release | `deferred-minor` |
| Suggestion | collaboration | editor-only contract | Google Docs | Notion | suggestion ranges, insertion/deletion behavior, serialization exclusion | `EDIT-SUGGESTION-*` | `packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts`<br/>`packages/suggestion/src/lib/withSuggestion.spec.tsx`<br/>`packages/suggestion/src/lib/transforms/acceptSuggestion.spec.tsx`<br/>`packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx`<br/>`packages/suggestion/src/lib/insertBreakSuggestion.spec.tsx`<br/>`packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts`<br/>`packages/markdown/src/lib/rules/defaultRules.ts` | deferred with the collaboration lane for a later release | `deferred-minor` |
| Discussion | collaboration | editor-only contract | Google Docs | Notion | anchor behavior, selection coupling, serialization exclusion | `EDIT-DISCUSSION-*` | docs surface only | deferred with the collaboration lane for a later release | `deferred-minor` |
| Yjs cursor / collaboration overlays | collaboration | editor-only contract | Google Docs | Figma/Notion | concurrent cursor and presence behavior | `EDIT-COLLAB-*` | docs and package surfaces | deferred with the collaboration lane for a later release | `deferred-minor` |

## Current Major Gate

The active major-release gate is now closed.

What is considered closed for this major:

1. markdown-native release-critical behavior
2. the main existing-feature editor behavior seams that were actually changing
   or clearly under-specified:
   - blockquote
   - list
   - heading
   - code block
   - table core behavior
   - indentation ownership
   - callout reset/soft-break behavior
   - mention/date/TOC boundary behavior
   - column package-surface round-trip
   - media/caption package-surface behavior

What remains non-blocking after this major cleanup:

1. broader write-up polish only:
   - table multi-paragraph policy wording
   - html-fallback explanation depth
2. explicitly deferred non-markdown lanes:
   - toggle rewrite
   - code-drawing / Excalidraw

What is explicitly deferred:

1. `toggle` rewrite lane
2. collaboration/editor-only lane:
   - comment
   - suggestion
   - discussion
   - yjs
3. feature-gap rows:
   - date MDX expansion beyond current behavior
   - media/embed expansion beyond current behavior
4. streaming improvements unless a current-feature change regresses them

## Best Next Order

1. release prep and final verification
2. optional post-major cleanup on non-blocking partial rows
3. toggle rewrite in a later release
4. collaboration/editor-only lane in a later release

## Related Learnings

- [markdown-blockquotes-must-round-trip-as-container-blocks.md](../solutions/logic-errors/2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks.md)
- [markdown-ordered-list-restarts-must-emit-listrestartpolite.md](../solutions/logic-errors/2026-03-30-markdown-ordered-list-restarts-must-emit-listrestartpolite.md)
- [markdown-images-must-not-synthesize-title-from-caption.md](../solutions/logic-errors/2026-04-02-markdown-images-must-not-synthesize-title-from-caption.md)

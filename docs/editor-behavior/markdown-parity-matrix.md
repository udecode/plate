# Markdown Coverage Matrix for Plate

This is the coverage gate for Plate's markdown-first work.

Use this before TDD or major editor work. The point is not to describe what we
wish Plate supported. The point is to describe what Plate currently covers,
which tests prove it, and where the real gaps still are.

Use this with:

- [markdown-standards.md](./markdown-standards.md)
- [markdown-editing-spec.md](./markdown-editing-spec.md)
- [markdown-editing-reference-audit.md](./markdown-editing-reference-audit.md)

## Status Meaning

- `locked`: current support and test coverage are good enough to build on
- `partial`: support exists, but the contract or test coverage is incomplete
- `gap`: support is missing, lossy, or too weak to trust yet
- `profile-divergence`: Plate supports it, but not as part of the Typora-first
  markdown profile
- `out-of-scope`: not part of the markdown-first profile for now

## Cell Meaning

- `yes`: explicit support with real repo evidence
- `partial`: support exists but is incomplete, lossy, or thinly tested
- `no`: not supported in the current lane
- `n/a`: not relevant for this construct

## Coverage Rules

- `Current Evidence` lists representative seams, not every test file.
- Rows that rely on rule files or parser wiring instead of direct tests should
  not be treated as locked just because some evidence exists.
- `Missing coverage` is the worklist. If it is non-trivial, do not pretend the
  row is done.
- `Editing spec IDs` points to ownership and key behavior in
  [markdown-editing-spec.md](./markdown-editing-spec.md).
- `Typora` and `Milkdown` columns are shorthand reference signals. For the full
  evidence, use [markdown-editing-reference-audit.md](./markdown-editing-reference-audit.md).
- During the major, do not treat uncovered feature rows as invitations to add
  new syntax just because they are nearby. Fix broken existing rows first.

## CommonMark Core

| Construct | Syntax Source | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Autoformat | Streaming | Editing Spec IDs | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paragraph | CommonMark | yes | yes | yes | yes | yes | n/a | yes | `EDIT-P-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | explicit root-empty behavior; start-`Backspace`; plain-paragraph `Tab` policy | `locked` |
| Heading | CommonMark | yes | yes | yes | yes | partial | yes | partial | `EDIT-H-*` | `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`packages/autoformat/src/lib/__tests__/withAutoformat/block/heading.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx` | direct H4-H6 coverage; middle-split behavior; start-`Backspace` behavior | `partial` |
| Blockquote | CommonMark | yes | yes | yes | yes | yes | yes | partial | `EDIT-BQ-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`apps/www/src/__tests__/package-integration/autoformat/blockquote.slow.tsx` | empty-exit; nested exit; start-`Backspace`; streaming-specific quote cases | `partial` |
| Unordered list | CommonMark | yes | yes | yes | yes | yes | yes | yes | `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/autoformat/list.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | root empty-item exit; start-`Backspace`; quote/list interaction | `partial` |
| Ordered list | CommonMark | yes | yes | yes | yes | yes | yes | yes | `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`packages/markdown/src/lib/serializer/standardList.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | editing ownership around exits and `Backspace`; more restart edge coverage in rich markdown lane | `partial` |
| Link | CommonMark | yes | yes | yes | yes | partial | no | partial | `EDIT-AFF-LINK-001` | `packages/markdown/src/lib/deserializer/deserializeMentionLink.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | dedicated plain-link round-trip tests; link streaming; boundary affinity tests | `partial` |
| Image | CommonMark | yes | yes | partial | partial | partial | no | no | `n/a` | `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts` | direct markdown image round-trip tests; streaming behavior; richer serializer coverage | `partial` |
| Emphasis | CommonMark | yes | yes | yes | yes | yes | yes | partial | `EDIT-AFF-MARK-001` | `packages/markdown/src/lib/mdx.spec.tsx`<br/>`packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | direct markdown deserialize/serialize fixture lane; boundary affinity tests | `partial` |
| Strong | CommonMark | yes | yes | yes | yes | yes | yes | yes | `EDIT-AFF-MARK-001` | `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | explicit markdown-rich round-trip without snapshot indirection; boundary affinity tests | `partial` |
| Inline code | CommonMark | yes | yes | yes | yes | partial | partial | partial | `EDIT-AFF-MARK-001` | `apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx` | direct deserialize tests; chunked inline-code streaming; boundary affinity tests | `partial` |
| Fenced code block | CommonMark | yes | yes | yes | yes | yes | yes | yes | `EDIT-CB-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx` | direct markdown deserialize fixture outside list edge case; key ownership for `Enter`/`Tab`/`Shift+Tab` | `partial` |
| Thematic break | CommonMark | yes | yes | yes | yes | yes | yes | partial | `EDIT-HR-ENTER-001` | `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts`<br/>`packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx` | direct deserialize tests from raw markdown; adjacency editing behavior | `partial` |
| Hard line break | CommonMark + HTML fallback | yes | yes | partial | yes | partial | n/a | partial | `n/a` | `packages/markdown/src/lib/deserializer/splitLineBreaks.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx` | tighter deserialize/serialize parity for trailing breaks and mixed blockquote cases | `partial` |
| Inline / block HTML fallback | HTML passthrough | partial | partial | partial | partial | partial | no | partial | `n/a` | `packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx` | dedicated serializer expectations; richer inline/block HTML fallback matrix | `partial` |

## GFM And Common Extensions

| Construct | Syntax Source | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Autoformat | Streaming | Editing Spec IDs | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Task list | GFM | yes | yes | yes | yes | partial | yes | partial | `EDIT-LIST-*` | `apps/www/src/__tests__/package-integration/autoformat/list.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | direct deserialize/serialize task-list fixture tests; checked-state round-trip lane | `partial` |
| Table | GFM | yes | yes | yes | yes | partial | no | partial | `EDIT-TABLE-*` | `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | dedicated markdown package table round-trip tests; reverse cell navigation; streaming-specific table chunks | `partial` |
| Strikethrough | GFM | yes | yes | yes | yes | yes | partial | no | `EDIT-AFF-MARK-001` | `packages/markdown/src/lib/mdx.spec.tsx`<br/>`packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts` | direct markdown deserialize/serialize tests; streaming lane; affinity tests | `partial` |
| Autolink literal | GFM | yes | yes | partial | partial | partial | n/a | no | `EDIT-AFF-LINK-001` | parser stack includes `remark-gfm`; no direct Plate spec yet | explicit deserialize/serialize tests for bare URLs; round-trip contract | `gap` |
| Footnote | GFM | yes | partial | partial | no | no | no | no | `n/a` | `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts` | native footnote model or explicit non-support decision; serializer behavior; round-trip | `gap` |

## Math

| Construct | Syntax Source | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Autoformat | Streaming | Editing Spec IDs | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Inline math | `\$...\$` / `remark-math` | yes | yes | yes | yes | partial | no | yes | `EDIT-MATH-ENTER-001` | `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx` | direct standalone round-trip tests; boundary editing tests; more serializer coverage | `partial` |
| Block math | `$$...$$` / `remark-math` | yes | yes | yes | yes | partial | no | yes | `EDIT-MATH-*` | `packages/math/src/lib/transforms/insertEquation.spec.ts`<br/>`packages/math/src/lib/transforms/insertInlineEquation.spec.ts`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx` | direct markdown package round-trip tests; empty-block exit behavior; `Tab` ownership | `partial` |
| Math inside tables | GFM + math extension | partial | partial | yes | partial | partial | no | no | `EDIT-TABLE-*`, `EDIT-MATH-*` | `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts` | serializer and round-trip tests for table-contained math | `partial` |

## Plate Markdown Extensions And MDX-Backed Constructs

| Construct | Syntax Source | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Autoformat | Streaming | Editing Spec IDs | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mention extension | `@user` and `[label](mention:id)` | no | partial | yes | yes | yes | no | no | `EDIT-AFF-LINK-001` | `packages/markdown/src/lib/deserializer/deserializeMentionLink.spec.tsx`<br/>`packages/markdown/src/lib/serializer/serializeMention.spec.ts` | streaming behavior; richer affinity / cursor boundary tests | `partial` |
| Inline semantic MDX marks (`<u>`, `<mark>`, `<kbd>`, `<sub>`, `<sup>`) | HTML / MDX inline elements | partial | partial | yes | yes | partial | no | partial | `EDIT-AFF-MARK-001` | `packages/markdown/src/lib/mdx.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | direct round-trip matrix by mark type; Typora/Milkdown parity call on which of these belong in the markdown-first profile | `partial` |
| Styled span marks (`<span style=\"...\">`) | MDX-backed inline style span | partial | partial | yes | yes | partial | no | no | `EDIT-AFF-MARK-001` | `packages/markdown/src/lib/rules/fontRules.ts`<br/>`packages/markdown/src/lib/deserializer/utils/getStyleValue.spec.ts`<br/>`packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.spec.ts` | direct markdown deserialize/serialize tests; explicit profile decision on keeping style spans in markdown-first mode | `profile-divergence` |
| Date inline MDX | `<date>...</date>` | no | no | yes | yes | partial | no | no | `n/a` | rule exists in `packages/markdown/src/lib/rules/defaultRules.ts`; example values in `packages/markdown/src/lib/__tests__/testValue.ts` | direct deserialize/serialize/round-trip tests | `gap` |
| Comment / suggestion marks | MDX-backed inline annotations | no | no | yes | yes | partial | no | no | `n/a` | `apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`<br/>`packages/markdown/src/lib/serializer/utils/getCustomMark.spec.ts`<br/>`packages/markdown/src/lib/rules/defaultRules.ts` | explicit markdown-first policy; dedicated deserialize/serialize tests for `<comment>` and `<suggestion>` | `out-of-scope` |
| Callout block | MDX-backed Plate syntax | partial | no | yes | yes | partial | no | partial | `n/a` | `packages/markdown/src/lib/mdx.spec.tsx`<br/>`packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx` | direct non-MDX markdown parity decision; streaming rules; editor profile ownership | `profile-divergence` |
| TOC block | MDX-backed Plate syntax | partial | no | partial | partial | partial | no | no | `n/a` | `packages/markdown/src/lib/mdx.spec.tsx` | dedicated rule tests and explicit markdown-first support decision | `profile-divergence` |
| Column / column group | MDX-backed Plate syntax | no | no | yes | yes | partial | no | partial | `n/a` | `packages/markdown/src/lib/rules/columnRules.spec.ts`<br/>`packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.spec.ts` | richer round-trip tests; streaming behavior; markdown-first profile decision | `profile-divergence` |
| Media / embed blocks | MDX-backed Plate syntax | partial | no | partial | partial | partial | no | no | `n/a` | rules in `packages/markdown/src/lib/rules/mediaRules.ts` | direct tests for deserialize/serialize/round-trip | `gap` |
| Unknown MDX fallback | safe fallback lane | n/a | partial | yes | n/a | partial | n/a | yes | `n/a` | `packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.spec.ts`<br/>`packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts`<br/>`packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx`<br/>`packages/markdown/src/lib/deserializer/deserializeMd.spec.ts` | serializer-side explicit guarantees; more mixed-document fallback tests | `locked` |

## Structural Edge Cases

| Construct | Syntax Source | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Autoformat | Streaming | Editing Spec IDs | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quote containing list | CommonMark | yes | partial | yes | yes | yes | partial | no | `EDIT-BQ-*`, `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`<br/>`packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts` | streaming; editing exits and ownership | `partial` |
| Nested blockquote | CommonMark | yes | partial | yes | yes | yes | yes | no | `EDIT-BQ-*` | `apps/www/src/__tests__/package-integration/autoformat/blockquote.slow.tsx` | direct raw markdown deserialize tests; nested exit and `Backspace` tests | `partial` |
| List containing quote | CommonMark | partial | partial | partial | partial | partial | no | no | `EDIT-BQ-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx` | serializer tests; editing ownership; richer fixture coverage | `gap` |
| Ordered list restarts | CommonMark | partial | partial | yes | yes | yes | n/a | yes | `EDIT-LIST-*` | `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | richer serializer regression lane across mixed list + paragraph documents | `partial` |
| Multi-paragraph table cells | GFM + Plate serializer convention | no | no | partial | yes | partial | no | no | `EDIT-TABLE-*` | `apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx` | deserialize parity; explicit round-trip policy decision | `partial` |

## Streaming And Incremental Markdown

| Lane | Typora | Milkdown | Plate Deserialize | Plate Serialize | Round-trip | Current Evidence | Missing Coverage | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paragraph boundaries | n/a | n/a | yes | yes | yes | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx` | none worth blocking on | `locked` |
| Inline marks across chunks | n/a | n/a | yes | partial | partial | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | link, strike, inline-code, and mixed mark closures | `partial` |
| Lists across chunks | n/a | n/a | yes | partial | partial | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | nested list streaming; task-list-specific chunk cases | `partial` |
| Blockquote across chunks | n/a | n/a | partial | partial | partial | mixed-document chunk test only | dedicated quote chunk tests; nested quote chunks | `gap` |
| Incomplete code fence | n/a | n/a | yes | yes | yes | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx` | multi-language and nested-neighbor cases | `locked` |
| Incomplete math block | n/a | n/a | yes | yes | yes | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`<br/>`apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx` | richer inline-vs-block mixed cases | `locked` |
| Incomplete MDX tail | n/a | n/a | yes | partial | partial | `packages/markdown/src/lib/deserializer/{deserializeMd.spec.ts,utils/splitIncompleteMdx.spec.ts,utils/markdownToSlateNodesSafely.spec.tsx}` | serializer-side fallback guarantees for more constructs | `locked` |
| Mixed document chunks | n/a | n/a | yes | partial | partial | `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx` | dedicated table, task-list, and blockquote chunk lanes instead of one broad fixture | `partial` |

## Non-Markdown Plate Blocks

These matter for architecture, but they are not part of the markdown-first
profile contract yet.

| Construct | Markdown Strategy | Editing Spec IDs | Current State | Status |
| --- | --- | --- | --- | --- |
| Toggle | hide or map through a separate profile policy | `EDIT-TOGGLE-*` | no markdown-first commitment yet | `out-of-scope` |
| Comment | keep editor-only or MDX-backed | `n/a` | plain-marks exclusions exist; no markdown-first contract | `out-of-scope` |
| Suggestion | keep editor-only | `n/a` | excluded from plain mark serialization by policy | `out-of-scope` |
| Discussion / comment threads | keep editor-only | `n/a` | no markdown-first contract | `out-of-scope` |

## Current Gate

Do not start major markdown-first implementation from the rows below without
adding tests first:

1. `Autolink literal`
2. `Footnote`
3. `Date inline MDX`
4. `Media / embed blocks`
5. `List containing quote`
6. `Blockquote across chunks`

Do not expand the major with minor new feature rows until the gate above stops
bleeding.

## Best Next TDD Order

1. quote and list destructive-edge tests from the editing spec
2. code-block ownership tests from the editing spec
3. table reverse-nav and cell-edge tests
4. autolink and footnote truth
5. blockquote and table streaming gaps

Batch 1 editing ownership rows are resolved enough to start TDD without more
broad reference scanning.

## Related Learnings

- [markdown-blockquotes-must-round-trip-as-container-blocks.md](../solutions/logic-errors/2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks.md)
- [markdown-ordered-list-restarts-must-emit-listrestartpolite.md](../solutions/logic-errors/2026-03-30-markdown-ordered-list-restarts-must-emit-listrestartpolite.md)
- [markdown-split-incomplete-mdx-must-not-treat-a-final-closing-angle-as-incomplete.md](../solutions/logic-errors/2026-03-25-markdown-split-incomplete-mdx-must-not-treat-a-final-closing-angle-as-incomplete.md)
- [markdown-incomplete-mdx-fallback-drops-void-blocks.md](../solutions/logic-errors/2026-03-14-markdown-incomplete-mdx-fallback-drops-void-blocks.md)

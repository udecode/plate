---
title: Markdown conversion ownership and fidelity
type: decision
status: accepted
updated: 2026-10-04
source_refs:
  - ../../../packages/platejs/src/markdown/lib/MarkdownPlugin.ts
  - ../../../packages/platejs/src/markdown/lib/internal/markdownConversion.ts
  - ../../../packages/platejs/src/markdown/lib/internal/markdownMappings.ts
  - ../../../packages/platejs/src/markdown/lib/internal/markdownAttributes.ts
  - ../../../packages/platejs/src/markdown/lib/internal/markdownTags.ts
  - ../../../packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts
  - ../../../packages/platejs/src/ai/react/AIChatPlugin.ts
  - ../../../apps/www/src/registry/components/editor/markdown.tsx
  - ../../analysis/2026-09-28-markdown-api-review.md
  - ../../analysis/2026-09-28-markdown-dialect-last-pass.md
related:
  - ../review-scopes/markdown.json
  - import-fidelity.md
  - export-fidelity.md
---

# Markdown conversion ownership and fidelity

**Audit of 2026-10-04.** Pursue. The table-cell target is still right and is built, but only in the uncommitted working tree, with a partial execution outcome and two open owner questions. So committed next still refuses a cell holding list paragraphs and cascades that refusal to the row and the table. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and record `2026-10-04-markdown-audit` hold the evidence.

**Adopt** the redesign with the material correction in the
[dialect last pass](../../analysis/2026-09-28-markdown-dialect-last-pass.md).
The official registry kit must use CommonMark + GFM + math as ordinary
Markdown; Plate does not promise MDX input. The earlier
[complete API audit](../../analysis/2026-09-28-markdown-api-review.md) remains
the surface inventory, but it preserved the wrong default grammar and proposed
an unsafe implementation order. A prototype selected the tag recognizer below.
The implementation and closure records establish adoption and proof.

Keep `parseMarkdown` and `serializeMarkdown`, plus the installed editor's
`parse`, `parseSlice`, `parseInline` and `serialize` methods. Cut standalone
`parseMarkdownSlice` and `parseMarkdownInline`; only installed editor methods
have current fragment consumers. Standalone document results stay broad
`Value`; editor methods retain their editor's exact document type. Features own
mappings, syntax and property classifications; core owns their authoring
contract; the optional Markdown runtime owns conversion.

Recognize registered Plate tags with a selective micromark extension; reject
the pairer over CommonMark `html` nodes. CommonMark tokenizes current Plate
output as opaque HTML blocks (indented children; `details`/`summary` are
HTML-block names), so the pairer read 9/13 legacy documents and 1/8
hand-written fixtures correctly, failing silently. The extension:

- claims tags only for registered names and returns everything else to
  CommonMark, so it never throws;
- treats a line of only registered block tags as flow (it may interrupt a
  paragraph);
- keeps registered names from opening raw HTML blocks;
- pairs flat tag markers per container: stray closers stay literal and
  unclosed tags stay open to the end of the container;
- treats a line holding only a registered block element as a block, and any
  other block tag in phrasing as literal.

Dialect law: the body of a registered block element admits fenced code only.
An indented code block directly inside one is Markdown, not code. This reads
legacy MDX output, which indents two spaces per nesting level. The casualty is
intentional indented code inside a Plate tag, which the current MDX kit
already turns into paragraphs everywhere. No legacy mode or version marker:
existing content carries none. The writer emits blank lines, no indentation
and fenced code. Incomplete-tail trimming is preview-only; final parsing stays
strict. The throwaway prototype is in
`docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/`; its `NOTES.md` has the
gates. A full MDX adapter may still normalize `mdxJsx*` nodes when a caller
explicitly selects MDX.

The adopted runtime deletes whole-source HTML-to-JSX rewriting,
`recovery: 'incomplete-stream'` and
its MDX fallback/reparse path, destructive inline stripping, the public
node-filter family, public and private `withoutMdx`, Plate's eager tagged
`remarkMdx` wrapper, line-oriented `splitLineBreaks`, detached fragment
functions and unused processor/stripping helpers. Streaming keeps only a trim
of a trailing incomplete registered tag. Replace `decodeBySource` plus
legacy `rules` with one compiled dispatch model for standard MDAST kinds,
registered extension tags, model encoders and marks. Resolve references within
each conversion. Move mention syntax into feature ownership and preserve its
source delimiters.

Preserve compatible persisted-identity wrapper reads. Retain the `withBlockId`
writer only if design names a current persistence consumer; a serialized
boundary alone does not pay for it. If retained, annotate canonical block/list
output rather than invoking an alternate serializer.

Repair unsafe mark merging, feature property accounting, source positions,
open-slice root diagnostics, attribute decoding, public error boundaries and a
diagnosed raw-HTML policy: under CommonMark, unknown tags and comments reach
conversion as `html` nodes and currently become visible text silently.
Expected source and schema refusals return diagnosed results;
programmer/configuration failures throw. Compile generic loss accounting from
schema property declarations and mapping claims, while feature owners classify
properties and preservation is added only for named jobs. Settle how honest
property loss interacts with the default `lossPolicy: 'reject'`.

July feature colocation and the package cut remain retained historical context.
September naming, document-first carriers, optional compilation and standalone
typing stay settled. August's persisted-identity read compatibility remains;
its writer is reopened because no current consumer has been named. HTML/DOCX
repairs, native fitting and generic list architecture remain settled. Streaming
performance is separate, while AI final parsing is direct evidence against the
official MDX default.

Proof: source inspection and focused default-kit probes reproduced ordinary
CommonMark rejection, silent indented-code reinterpretation, final AI preview
invalidation, public parse throws, blanket attribute coercion and the unsafe
`htmlToJsx` deletion order.

The prototype gates, run through the real Plate conversion runtime:

| Gate | Result |
| --- | --- |
| CommonMark 0.31.2 spec | 648/652 examples produce identical mdast, with and without GFM+math; the other 4 use the registered `<del>` tag |
| 20k fuzz strings | 0 grammar throws. This proves totality, not fidelity: under `lossPolicy: 'allow'`, Plate parse returns ok for 19,999 (current kit: 8,653) |
| Legacy MDX-writer documents | 13/13 identical |
| Hand-written nesting fixtures | 7/8 read (5 identical to MDX, 2 that MDX rejects); a callout inside a list throws in both parsers |
| 1,000 legacy prefixes | 0 throws |
| Offsets | tag-element boundaries exact; split paragraph remainders approximate |
| New writer round trip | 13/13 equal to the MDX round trip; the MDX kit also reads the new output |
| Cost | no gross regression in single-run smoke timings; Benchmark owns adoption measurement |

The prototype also found that current incomplete-stream recovery truncates an
AI-style answer from 60 blocks to 2 while reporting the content as preserved.

The prototype's mapping/runtime failures drove the implementation: expected
refusals are diagnosed, partial input stays parseable, image list items keep
their block content, and structural corrections are idempotent.

The design plan
[Markdown CommonMark dialect and conversion contract](../../plans/2026-09-28-markdown-commonmark-dialect-design.md)
settles the contract as decisions D1–D22, with explicit dispatch semantics and
an attribute wire codec. Execution runs S1 → S2 → S3 → S4 → S6 → S5, so the
production benchmark gates public docs. It cuts MDX input and the
`withBlockId` writer by default.

The plan is implemented and verified in the working tree
([closure record](../review-records/2026-09-28-markdown-commonmark-dialect-closure.json)).
Markdown parses as CommonMark with registered Plate tags through one compiled
dispatch model. Mark decoders return exact schema values; the runtime owns the
target keys, calls inherited persisted text properties `marks`, decodes child
content once and supplies wrapper children. The schema-backed attribute codec
keeps JSON-looking string properties as strings. D21 remains superseded because
data transfer no longer reports diagnostics.

Package, slow-fixture, type-contract, registry and Chromium proof pass. The
browser cases cover split registered tags, table-cell Markdown before and after
acceptance, generated comments, and editable/static streaming. The production
benchmark has a tracked runner and receipt; ignored prototype artifacts are no
longer closure evidence.

A later frozen-tree rerun found serialize 10–12% slower than `origin/next`:
per-paragraph option copies missed the per-operation format-context cache, and
the parse-only tag transformer ran on serialize. Both are repaired
([serialize repair](../review-records/2026-09-28-markdown-commonmark-dialect-serialize-repair.json)).
The tracked receipt, regenerated on the final tree, passes correctness and the
adoption gate with serialize at 0.97×; the absolute B4 inline-tag budget still
fails. The `apps/www` Markdown fixtures pass after repair against the adopted
contract.

## Table cells

A [2026-10-03 review](../review-records/2026-10-03-markdown-table-cell-blocks-constraints.json)
reopened D6 for table cells, and
[its plan](../../plans/2026-10-03-markdown-table-cell-blocks.md) settles it. The [build](../review-records/2026-10-03-markdown-table-cell-blocks-execution.json) landed it with a partial outcome: two frozen benchmark lines missed and the late fixes are unreviewed, both waiting on the owner. A
GFM row is one line, so the Markdown runtime writes a cell's blocks inline and
reads them back; Table owns only the grid.

- `encodeLine` on the encode context writes list paragraphs as `<ul>`,
  `<ol start>` and `<li>` HTML, the format `main` released in PR 5139, with a
  disabled checkbox leading each task item. It joins other paragraphs with
  `<br/>`, keeps the inline content of a heading or quote and the text of a
  code or math block, and drops any other block under `lossPolicy`. It never
  writes a raw line ending or a `|` that ends the cell.
- `decodeLine` on the decode context reads a cell's `<ul>` or `<ol>` run into a
  standard mdast list and hands it to the installed list decoders, so List
  still builds every list paragraph and no tree a mapping or remark plugin sees
  holds a list inside a `tableCell`. Without List, or when every list decoder
  declines, the run stays literal.
- The table encoder writes a merged cell in its first slot and empty cells in
  the slots it covers, and each span reports `markdown-property-omitted`. A
  table whose merged cells would add more than 100,000 empty cells refuses.
- The paragraph decoder treats a final `<br>` after a soft line ending as the
  writer's trailing break, so a trailing break after bold or link text, or in a
  cell list item, survives.

Raw HTML that no mapping accepts stays a lossless warning. Parse keeps it as
the editor's text unchanged, and serializing escapes that text, so a renderer
shows the tags. The lost rendering is the dialect choice D6 made, not lost
text. A paragraph boundary folded into `<br/>`, and a cell block collapsed to
inline content, are lossy warnings under every policy, because the content
stays.

Open work from the build, each with its owner:

- Whether github.com renders a raw `<input type="checkbox">` in a cell is
  unchecked. Owner: Markdown runtime.
- Tagless HTML in a cell counts as a bare URL when it matches an absolute URL;
  a predicate shared with Link's encoder would make that exact. Owner: Link
  Markdown mapping.
- A resized or attributed image in a cell is dropped and reported, because the
  image encodes a flow `<img>`. Owner: Image Markdown mapping.
- Parsing a container with hundreds of `<br/>` or literal tags is quadratic in
  schema canonicalization, 2.8 s for 400 breaks. Owner: Plite core, through the
  Perf issue playbook.
- The cell reader drops the `<br/>` the writer puts beside a block element,
  while list item paragraphs in the same cell use another reader; moving the
  rule into the paragraph decoder would leave one. Owner: Markdown runtime.
- A list item block that is not inline content, such as a nested table, is
  dropped without a report. Owner: Markdown runtime list serializer.
- A heading holding a bare URL link throws "expected inline content", at top
  level and in a cell. Owner: Markdown runtime phrasing set.
- With a raised `maxDepth`, a cell list nested tens of thousands deep can
  overflow the reader's recursion, and a closed run of list tags without items
  counts toward the depth limit. Owner: Markdown runtime.
- A newline after a `%` comment in inline math becomes a space, so the rest of
  the line joins the comment; the change is reported. Owner: math Markdown
  mapping.
- Text holding a dollar sign before a character the writer escapes, such as
  `x$*$y`, or `x$|$y` in a cell, reads back as inline math, because the writer
  drops that dollar's escape. It reproduces before this build. Owner: Markdown
  runtime, in a spawned task.
- A CR and LF split across a mark, link or empty-leaf boundary in a cell read
  back as two breaks. Owner: Markdown runtime.
- A paragraph whose text ends in `\n\n` reads back with a literal backslash,
  and a top-level list item whose text ends in `\n` loses it. Owner: Bug fix
  playbook.

Rejected: a compiler pass that puts a private list shape inside `tableCell`,
because every table mapping and remark plugin would see flow content where
mdast promises phrasing; list spelling in Table, because it puts List's syntax
in another feature; and reusing the feature HTML mappings, because their output
is verbose and unsafe in a GFM row, and reading it back needs a DOM that
Markdown parsing avoids.

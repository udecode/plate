# Markdown conversion

The official kit reads CommonMark, GFM and math as ordinary Markdown, with registered Plate tags recognized by a selective micromark extension and converted through one compiled dispatch model. Plate does not promise MDX input. The 2026-10-04 audit pursued one gap: table cells holding list paragraphs, whose build is still uncommitted and waits on the owner ([triage audit](../2026-10-04-ledger-triage-audit.md), [dialect design](../2026-09-28-markdown-commonmark-dialect-design.md), [table-cell plan](../2026-10-03-markdown-table-cell-blocks.md)). `node tooling/scripts/review-ledger.mjs show markdown` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Public calls | `parseMarkdown` and `serializeMarkdown`, plus the installed editor's `parse`, `parseSlice`, `parseInline` and `serialize`. Standalone results stay broad `Value`; editor methods keep their editor's exact type. |
| Ownership | Features own mappings, syntax and property classes; core owns the authoring contract; the optional Markdown runtime owns conversion. Mention syntax is feature-owned and keeps its source delimiters. |
| Tag recognizer | Claims only registered names and returns everything else to CommonMark, so it never throws. A line of only registered block tags is flow and may interrupt a paragraph; registered names never open raw HTML blocks; flat tag markers pair per container, with stray closers literal and unclosed tags open to the container's end. |
| Dialect | A registered block element's body admits fenced code only, so an indented block inside one is Markdown, which reads legacy MDX output. The writer emits blank lines, no indentation and fenced code. No legacy mode or version marker. |
| Dispatch | One compiled model for standard MDAST kinds, registered tags, model encoders and marks; references resolve within each conversion. Mark decoders return exact schema values, and the schema-backed attribute codec keeps JSON-looking strings as strings. |
| Diagnostics | Expected source and schema refusals return diagnosed results; programmer and configuration failures throw. Loss accounting compiles from schema property declarations and mapping claims. Raw HTML no mapping accepts stays text and is a lossless warning. |
| Streaming | Only a trim of a trailing incomplete registered tag; final parsing stays strict (see the `streaming` subject). |
| Persisted identity | Compatible wrapper reads stay; the `withBlockId` writer is cut by default. |
| Table cells | A GFM row is one line, so the runtime writes a cell's blocks inline with `encodeLine`: list paragraphs as `<ul>`, `<ol start>` and `<li>`, a disabled checkbox before each task item, other paragraphs joined with `<br/>`. `decodeLine` reads a cell's list run into a standard mdast list for the installed List decoders, so no tree holds a list inside a `tableCell`. Merged cells write the first slot and empty covered slots, with a 100,000-cell refusal. Table owns only the grid. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| MDX as the default grammar | AI final parsing and ordinary CommonMark were rejected by it. |
| A pairer over CommonMark `html` nodes | Read 9 of 13 legacy documents and 1 of 8 fixtures correctly, failing silently. |
| Whole-source HTML-to-JSX rewriting, `recovery: 'incomplete-stream'` and its MDX reparse | Truncated an AI answer from 60 blocks to 2 while reporting it preserved. |
| `withoutMdx`, the node-filter family, `splitLineBreaks`, `decodeBySource` with legacy `rules` | Replaced by one dispatch model. |
| Standalone `parseMarkdownSlice` and `parseMarkdownInline` | Only installed editor methods had fragment consumers. |
| A private list shape inside `tableCell` | Every mapping and remark plugin would see flow content where mdast promises phrasing. |
| List spelling in Table, or reusing the feature HTML mappings in cells | Puts List's syntax in another feature; HTML mapping output is verbose, unsafe in a GFM row and needs a DOM to read back. |

The prototype gates: 648 of 652 CommonMark 0.31.2 examples gave identical mdast (the other four use the registered `<del>`), 20,000 fuzz strings and 1,000 legacy prefixes threw nothing, and 13 of 13 legacy MDX documents read identically.

## What other editors do

Not compared in these reviews; CommonMark, GFM and micromark are the adopted grammar and tokenizer.

## Main changes

- CommonMark with registered tags replaced the MDX default; serialize runs at 0.97× of the old head after the format-context cache repair.

## Open work

- The table-cell build is uncommitted, two frozen benchmark lines missed and the late fixes are unreviewed. owner: the table-cell plan's Needs you. stop: the owner's answers.
- The absolute B4 inline-tag budget fails. owner: the next markdown benchmark. stop: a run within budget.
- From the table-cell build. owner: the Markdown runtime unless named. stop: each fix lands.
  - Whether github.com renders a raw `<input type="checkbox">` in a cell is unchecked.
  - Tagless HTML in a cell matching an absolute URL counts as a bare URL; a predicate shared with Link's encoder would make it exact. owner: Link's Markdown mapping.
  - A resized or attributed image in a cell is dropped and reported. owner: Image's Markdown mapping.
  - Hundreds of `<br/>` or literal tags in one container parse quadratically, 2.8 s for 400 breaks. owner: Plite core through the Perf issue playbook.
  - The cell reader drops the `<br/>` beside a block element, while list item paragraphs use another reader.
  - A non-inline list item block, such as a nested table, is dropped without a report.
  - A heading holding a bare URL link throws "expected inline content".
  - A cell list nested tens of thousands deep can overflow recursion under a raised `maxDepth`, and an itemless list run counts toward the depth limit.
  - A newline after a `%` comment in inline math becomes a space, and is reported. owner: math's Markdown mapping.
  - A CR and LF split across a mark, link or empty leaf in a cell read back as two breaks.
  - A paragraph ending in `\n\n` reads back with a literal backslash, and a top-level list item ending in `\n` loses it. owner: the Bug fix playbook.

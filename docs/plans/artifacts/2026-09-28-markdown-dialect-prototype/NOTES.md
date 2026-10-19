# PROTOTYPE — Markdown dialect: CommonMark + registered Plate tags

Throwaway. Delete this folder once the Markdown plan absorbs `plateTags.ts`.
It lives under `docs/plans/artifacts` so no package inventory, barrel,
typecheck or test picks it up. The imports point into `node_modules/.pnpm`
because the micromark internals aren't direct dependencies yet.

```sh
bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/gates.ts        # gates
bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/gates.ts repl   # drive by hand
```

## Question

Can ordinary Markdown be parsed as CommonMark + GFM + math while Plate's
extension elements (`<callout>`, `<columnGroup>`, `<u>`, …) still round-trip,
without MDX's partial grammar? Which recognizer should own the tags: a pairer
over CommonMark `html` nodes, or a selective micromark extension?

## Answer

**Selective micromark extension. Reject the MDAST `html` pairer.**

CommonMark tokenizes Plate's current output as opaque HTML blocks: indented
children, and `<details>`/`<summary>` are HTML-block names that swallow lines
until a blank line. So the pairer only works on a new syntax that puts blank
lines around every block tag. It read 9/13 legacy documents and 1/8
hand-written fixtures correctly, and it failed silently: the parse reported
success with the wrong tree.

`plateTags.ts` contains:

- A micromark tag construct that claims `<name …>`, `</name>` and `<name />`
  only for registered names. Anything else returns `nok` to CommonMark, so
  autolinks, raw HTML, `Array<string>` and `{` stay CommonMark. The construct
  never throws.
- A flow construct for a line made only of registered block tags. Like a
  thematic break, it may interrupt a paragraph, including on a lazy line.
- Registered names never open a raw HTML flow block.
- The parser emits flat tag markers, then pairs siblings per container. A
  stray closing tag stays literal HTML. An unclosed tag stays open to the end
  of its container and is flagged.
- A line holding only a registered block element is a block. Elsewhere in
  phrasing, a block tag is literal source.
- Dialect rule: the body of a registered block element admits fenced code
  only. An indented code block directly inside one is re-read as Markdown,
  with tag-boundary offsets remapped. This is what reads legacy output: the MDX
  writer indents two spaces per nesting level, which puts depth-2 content at
  CommonMark's indented-code threshold. The casualty: an indented code block
  written on purpose directly inside a Plate tag becomes paragraphs. The
  current MDX kit already does that to all indented code, so this narrows
  existing behavior rather than regressing it. The new writer never indents
  and always fences. A legacy mode or version marker was rejected: existing
  content carries no marker and callers can't tell which dialect they hold.
- Writer: blank lines around block children, no indentation, quoted string
  attributes.
- Streaming: `trimIncompleteTagTail` hides only a trailing `<…` that could
  still become a registered tag. Preview only: final parsing stays strict.

Nodes are emitted MDX-shaped (`mdxJsxFlowElement`/`mdxJsxTextElement`), so the
existing feature mappings run unchanged. A neutral node name is a mechanical
rename for the plan.

## Evidence (gates.ts, 2026-09-28)

| Gate | Result |
| --- | --- |
| G1 CommonMark 0.31.2 spec, 652 examples | 648 produce mdast identical to plain remark-parse, with and without GFM+math. The 4 that differ use `<del>`, a registered tag. 0 unexpected |
| G2 20k fuzz strings | 0 grammar throws: this proves totality, not fidelity. Under `lossPolicy: 'allow'`, Plate `parse` returns ok for 19,999/20,000 (current MDX kit: 8,653/20,000). The one throw is a mapping bug: `<toc>` with children escapes `parse()` as a schema error |
| G3 legacy MDX-writer output (13 docs; `testValue` excluded because it isn't schema-valid) | 13/13 identical to the current MDX read. Pairer 9/13 |
| G4 hand-written nesting without blank lines (8) | 7/8 read: 5 identical to MDX, plus 2 that MDX throws on (`<callout>hello</callout>`, and `<summary>Title</summary>` followed directly by body text). The list+callout fixture throws in both parsers because of the flat-list model. Pairer: 1/8 identical |
| G5 streaming, 1,000 legacy prefixes | 0 throws, 991 ok. The other 9 fail because the summary decode callback throws. Partial tags show up as text in 253 prefixes; the tail trim brings that to 0. An unclosed tag at EOF stays open |
| G6 offsets | 38 tag elements' boundaries slice exactly to `<name …</name>`, including remapped legacy re-reads. The positions of paragraph remainders split around a block line are approximate and weren't checked. Nothing rewrites the source |
| G7 new writer | 13/13 round trips equal the MDX round trip. 0 lines indented ≥4. The current MDX kit reads the new output identically 13/13. Text containing `{` breaks MDX consumers, so MDX export needs its own escaping mode if it's a real job |
| G8 inputs the current kit rejects/corrupts | All read correctly: `Array<string>`, `x<y`, `<https://…>`, `{name}`, indented code, table `<br>`, `` `<img src=x>` ``. `a <callout>b</callout> c` becomes literal text instead of throwing |
| Cost | Smoke check only (single-run, noisy): no gross regression observed. 40 KB Plate parse measured 219/219, 215/208 and 228.5/198.9 ms (current/candidate) across runs. Mdast only: about +28% on the tag-heavy corpus. The accumulated AI-stream comparison isn't valid because the current path truncates. Benchmark owns measurement during adoption |

New defect found: the current `recovery: 'incomplete-stream'` path truncates.
A 12-step AI-style answer (60 blocks) comes back as 1 heading + 1 paragraph,
with `ok: true` and a warning that says the content was "preserved". That's
also why it looks 2× faster on the streaming benchmark.

## Not grammar (plan work surfaced here)

- `parse()` must return diagnostics for schema refusals (`<toc>` with
  children, a callout inside the flat list model) and for feature decode
  refusals (the summary callback throws). Today these throw or become
  `markdown-invalid-source`.
- Raw HTML needs a diagnosed policy. Under CommonMark, unknown tags and
  comments are `html` nodes, and Plate currently turns them into visible text
  without a warning.
- The tag registry (name, block/inline, void) should come from the compiled
  feature mappings; the prototype hardcodes 22 entries.
- Emoji and mention transforms must run after the tag plugin.
- Gaps: tabs in legacy indentation aren't handled, and positions of split
  paragraph remainders are approximate.

# Conversion boundary amendment probes

Evidence for the second-pass amendment of
[the adoption plan](../../../../plans/2026-09-28-conversion-boundary-adoption.md).
All probes run from the repository root against the working tree on
2026-09-28 (bun 1.3.12, darwin/arm64, shared host, load 4–13 while measuring).
They are disposable evidence, not product code.

## Streaming: converted-segment reuse with spliced publication

`stream-reuse.ts` splits the accumulated source at blank lines whose container
state is closed. A split is refused inside an open fence, math block, raw HTML
block or registered block tag, and after a list or indented line. Each completed
segment is converted once, and only the open tail is reparsed. Diagnostic
locations are shifted to whole-source coordinates. A source containing a
reference or footnote definition takes the full parser. An invalid prefix takes
the full parser without disabling later reuse. The consumer publishes by
splicing from the first non-identical top-level node.

```sh
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/amendment/stream-reuse.ts
```

- **Correctness:** `stream-correctness.json`. 3,730/3,730 incremental previews
  deep-equal a fresh partial parse of the same prefix, diagnostics included.
  - Fixtures (26): lists, ordered lists, fences, tilde fences, math, registered
    and nested tags, details, tables, setext, quotes, inline marks, CRLF,
    comments, indented code, emoji, reference/footnote definitions, CJK and
    rich AI transcripts.
  - Chunkings (26 per fixture): one character, 64 bytes, and 24 seeded random
    splits.
  - Reuse on the two transcript fixtures: 3,354 (CJK) and 2,660 (rich) reused
    node objects, zero fallbacks.
- **Timing:** `stream-benchmark.json`/`.log`, 64-byte chunks, parse followed by
  publication into an editor. Preview hashes and the final published value are
  asserted equal between baseline and candidate in every pair.

| Transcript | Pairs | Cumulative parse | Cumulative publish | Mean of last 10 chunks | Bytes parsed |
| --- | --- | --- | --- | --- | --- |
| Rich 10 KB | 3 alternating | 990 → 100 ms | 3,550 → 1,010 ms | 55 → 12 ms | 793,744 → 17,706 |
| Rich 50 KB | 1 | 24.6 → 0.72 s | 88.3 → 22.2 s | 285 → 57 ms | 19.6 M → 88.7 K |
| CJK 10 KB | 3 alternating | 1,420 → 111 ms | 6,950 → 1,810 ms | 105 → 21 ms | 793,744 → 15,094 |
| CJK 50 KB | 1 | 37.3 → 0.82 s | 184.8 → 45.1 s | 565 → 121 ms | 19.6 M → 75.7 K |

- **Remaining cost:** `splice-profile.ts` and `splice.cpuprofile`. A one-block
  tail splice on the 50 KB rich preview (1,179 top-level nodes) still costs
  48 ms median and 61 ms p90. Nearly all of it is Plite's per-transaction
  document-change application:
  - document-index token rebuild (`fromChangedTokens`, `decodeNodes`,
    `encodeNodes`), about 24%;
  - JSON value assertion (`assertJsonValue`), about 12%;
  - snapshot-index mapping, inside the history reducer even with
    `history: 'skip'`.

  That is O(document) per update. It belongs to Plite and Benchmark, not
  Markdown.
- **Where Markdown parse time goes:** the tracked dialect receipt measures a
  full parse of the large legacy cohort at 521.6 ms, and tokenizing plus the
  MDAST/tag grammar alone at 104.4 ms. About 80% of parse time is Plate
  conversion (mapping dispatch, per-node contexts, admission). Reusing syntax
  alone can therefore save at most about a fifth of parsing.

## Property accounting: verification by decoding

`roundtrip-verify.ts` serializes each fixture element, parses the output back
and compares every content-role property. It checks 44 elements from
`testValue` plus variants; 8 are skipped because they are schema-invalid in
isolation.

```sh
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/amendment/roundtrip-verify.ts
```

- **Read-tracking misses real loss:** today's accounting misses loss in 6
  fixtures. List paragraphs lose `indent`, and two lose `listStart`, with no
  `markdown-property-omitted` report. The runtime list serializer claims every
  list property.
- **No false positives:** the round trip reported nothing that was actually
  preserved.
- **Link `target`:** lost and reported, both today and by the round trip.
- **Cost:** on a 1,400-node corpus, serialize takes 85.7 ms and serialize plus
  parse 404.3 ms (4.7×). The conversion share above means even node-local
  decoding costs roughly another conversion. Runtime verification is too
  expensive as a default; it is well suited to a test conformance harness.

## Loss severity for Markdown export

`loss-severity.test.ts` runs with the repository test preload, because HTML
parsing needs a DOM.

```sh
bun test ./docs/research/probes/2026-09-28-conversion-boundary/amendment/loss-severity.test.ts
```

- **Today every case exports:** an aligned paragraph, a paragraph with line
  height, one with text indent, and a link pasted from HTML all serialize
  successfully under the default policy, each with one
  `markdown-property-omitted` warning.
- **Invented `target`:** the pasted link has `target: "_blank"` although its
  source had no `target`. Link's HTML decoder writes
  `element.getAttribute('target') || '_blank'`.
- **Under the plan's D5,** each of these becomes established loss and fails
  under the default `reject`. `AIChatPlugin`'s `requireMarkdownData` and the
  registry AI prompt builders call `serialize` with the default policy, and
  they throw on failure.

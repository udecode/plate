# Conversion-boundary prior art

Status: Complete

Scope: User-requested primary-source sidecar, 2026-09-28. Six sibling repositories only; no product, documentation-owner, review-ledger, staging, commit, or coordination changes. The artifact directory is the sole project write surface. No third-party source is copied here.

Acceptance:

- [x] Pin six repository SHAs, provenance, and licenses.
- [x] Establish real reuse and invalidation APIs and caller obligations.
- [x] Trace document-global reference dependencies and incomplete-input handling.
- [x] Explain source-supported micromark complexity risks and markdown-it semantic tradeoffs.
- [x] Give bounded verdict implications with path-line citations and explicit proof limits.

Evidence: local source and upstream test inspection only. No dependencies installed, parsers executed, benchmarks run, or third-party source copied into Plate. All six destinations were absent and were shallow-cloned from the specified GitHub origins; no GitHub file browsing. Clones were read-only after creation. No candidate implementation or complete candidate proposal was supplied for this sidecar; implications below are conditional, not an adoption decision.

## Pinned sources

All paths below are under `/Users/zbeyens/git/`. Line references apply to these exact commits, not released-package claims. `common` and `markdown` were unoccupied, so collision aliases were unnecessary.

| Origin | Local directory | HEAD | License evidence |
| --- | --- | --- | --- |
| `https://github.com/tree-sitter/tree-sitter.git` | `tree-sitter` | `dcdc8cc55e5dfedfc858080835f153999a29ec40` | [MIT](/Users/zbeyens/git/tree-sitter/LICENSE:1), lines 1–21 |
| `https://github.com/lezer-parser/common.git` | `common` | `d87b56cbe3d6f54edb5b8343ee794f8f96f9c86c` | [MIT](/Users/zbeyens/git/common/LICENSE:1), lines 1–21 |
| `https://github.com/lezer-parser/markdown.git` | `markdown` | `30fe1b12a53f58ebab66e156a7847484addf610b` | [MIT](/Users/zbeyens/git/markdown/LICENSE:1), lines 1–21 |
| `https://github.com/vercel/streamdown.git` | `streamdown` | `0b6b20d3a85986a39b4bcd454cdcb6aabfc9b3e6` | [Apache-2.0](/Users/zbeyens/git/streamdown/LICENSE:1), lines 1–13; `packages/{streamdown,remend}/package.json:11` agree |
| `https://github.com/markdown-it/markdown-it.git` | `markdown-it` | `3c51991c32aaa2b002a52c009334ebe5752c84b3` | [MIT](/Users/zbeyens/git/markdown-it/LICENSE:1), lines 1–22 |
| `https://github.com/micromark/micromark.git` | `micromark` | `6577c200155e9c6b85a42b26d298f8affc348f2f` | [MIT](/Users/zbeyens/git/micromark/license:1), lines 1–22 |

License inventory records upstream declarations, not a dependency-wide license audit. This artifact contains original analysis and source references, not copied implementations or tests.

## Actual reuse contracts

| System | Public call / retained state | What this establishes |
| --- | --- | --- |
| Tree-sitter | `ts_parser_parse(parser, old_tree, input)` after `ts_tree_edit(old_tree, edit)` | A previous **syntax-tree handle**, explicitly aligned to every source edit. Byte offsets and row/column coordinates are required. Parser continuation after cancellation is another stateful contract requiring reset for a different document. |
| Lezer common + Markdown | `TreeFragment.addTree(tree)` → `TreeFragment.applyChanges(fragments, changes)` → `parser.parse(input, fragments, ranges?)` | Explicit reusable intervals with old/new coordinates, tree offsets and open boundaries. `startParse()` returns an advanceable `PartialParse`; it is not a previous semantic document. |
| Streamdown | `parseMarkdownIntoBlocks(markdown)` | No public previous-tree argument. One module-global cache retains the last input and blocks; append detection permits conservative prefix reuse. React memoization is an additional, different layer. |
| markdown-it | `md.parse(src, env)` / `md.parseInline(src, env)` | A fresh core state per call. `env` carries references and other metadata, not previous parse results. Inline skip/backtick caches belong to each new inline state. |
| micromark | `micromark(value, options)`; low-level `parse(options).document().write(chunks)`; stream `write/end` | Stateful consumption of one input stream. The inspected interfaces do not accept an old tree plus source edits. HTML emission in the stream implementation occurs at `end`. |

Sources: [Tree-sitter API](/Users/zbeyens/git/tree-sitter/lib/include/tree_sitter/api.h:283), lines 283–329, 373–381, 454–491; [Lezer fragments](/Users/zbeyens/git/common/src/parse.ts:18), lines 18–99, 103–167; [Streamdown cache](/Users/zbeyens/git/streamdown/packages/streamdown/lib/parse-blocks.tsx:112), lines 112–144, 240–340; [markdown-it entrypoints](/Users/zbeyens/git/markdown-it/src/markdownit.ts:377), lines 377–423, and [inline state](/Users/zbeyens/git/markdown-it/src/rules_inline/state_inline.ts:32), lines 32–60; [micromark entrypoint](/Users/zbeyens/git/micromark/packages/micromark/dev/index.js:55), lines 55–68, [parse context](/Users/zbeyens/git/micromark/packages/micromark/dev/lib/parse.js:25), lines 25–56, and [stream finalization](/Users/zbeyens/git/micromark/packages/micromark/dev/stream.js:155), lines 155–171.

**Verdict implication:** none establishes that an arbitrary previous converted value is sufficient for incremental parsing. A simple `parse(previous)` facade could own the missing text, edits and parser state internally, but these sources do not remove those obligations or justify exposing another generic public handle.

## Reuse requires more than unchanged text

**Tree-sitter:** edit propagation includes lookahead reach and column-sensitive invalidation. Reuse additionally checks external-scanner state, changed/error/missing/fragile nodes, included-range differences and lexical/parser compatibility. Its changed-range API reports syntactic hierarchy changes, not all changes to converted values. A same-shape text edit can still change a downstream conversion; a syntax-change range alone is not a complete conversion invalidation signal. The latter is an inference from the API's explicit scope. Sources: [subtree editing](/Users/zbeyens/git/tree-sitter/lib/src/subtree.c:661), lines 661–674, 735–750; [reuse checks](/Users/zbeyens/git/tree-sitter/lib/src/parser.c:783), lines 783–827 and 470–502; [changed-range contract](/Users/zbeyens/git/tree-sitter/lib/include/tree_sitter/api.h:466), lines 466–481. Tree handles also have explicit copy/delete ownership: [API](/Users/zbeyens/git/tree-sitter/lib/include/tree_sitter/api.h:409), lines 409–420. No Markdown grammar was inspected, so this is engine prior art, not Markdown conformance evidence.

**Lezer Markdown:** fragments must match the current block context hash. Reuse is trimmed to line/block boundaries, respects open ends, and excludes certain final blocks unless a following sibling is also reused: indented code and lists can continue across blank lines. This directly contradicts treating every completed-looking block as permanently final. Sources: [context/reuse](/Users/zbeyens/git/markdown/src/markdown.ts:742), lines 742–758; [fragment cursor](/Users/zbeyens/git/markdown/src/markdown.ts:1819), lines 1819–1909. Upstream tests compare incremental trees with a fresh parse and measure shared block trees, using explicit change ranges: [incremental tests](/Users/zbeyens/git/markdown/test/test-incremental.ts:37), lines 37–76. These tests were inspected, not run.

## Global references defeat unconditional block locality

**Lezer deliberately narrows semantics.** Its source README says unresolved references such as `[a][b]` are still parsed as links to preserve single-pass incremental parsing. It produces syntax trees, not HTML. Thus it is useful editor-syntax prior art, but not a drop-in proof of CommonMark conversion equivalence. Source: [scope and limitation](/Users/zbeyens/git/markdown/src/README.md:5), lines 5–19.

**micromark and markdown-it preserve document dependencies.** micromark collects definitions before inline processing, and label resolution checks the collected identifiers. markdown-it runs blocks before inlines, stores the first definition for each normalized label in `env.references`, then consults that map for links and images. An appended definition can change an earlier unresolved reference; editing/removing a definition can change distant resolved references, including first-definition precedence. Reusing an old markdown-it `env` without rebuilding references can retain a removed definition: this is an integration hazard inferred from the write-if-absent implementation, not a tested bug in markdown-it. Sources: [micromark content phases](/Users/zbeyens/git/micromark/readme.md:961), lines 961–974; [label resolution](/Users/zbeyens/git/micromark/packages/micromark-core-commonmark/dev/lib/label-end.js:245), lines 245–249, 580–587; [markdown-it phase order](/Users/zbeyens/git/markdown-it/src/parser_core.ts:16), lines 16–26; [definition storage](/Users/zbeyens/git/markdown-it/src/rules_block/reference.ts:194), lines 194–219; [link lookup](/Users/zbeyens/git/markdown-it/src/rules_inline/link.ts:84), lines 84–113, and `src/rules_inline/image.ts:82–108`.

**Streamdown is narrower than a general incremental converter.** Its current splitter truly reuses a prefix, but requires input growth, prefix equality, a conservative stable boundary and verified source slices. A regex-detected link definition disables that reuse. Detected footnotes return the whole document as one block. The footnote detector accepts a specific label shape/length; these guards are not evidence for every extension syntax. Also, ordinary link-definition fallback only requests full **block lexing**; it does not itself prove cross-block reference rendering, because each resulting block is parsed separately by the Markdown pipeline. Sources: [guards and fallback](/Users/zbeyens/git/streamdown/packages/streamdown/lib/parse-blocks.tsx:3), lines 3–15, 137–144, 240–340; [per-block renderer](/Users/zbeyens/git/streamdown/packages/streamdown/index.tsx:505), lines 505–512; [processor invocation](/Users/zbeyens/git/streamdown/packages/streamdown/lib/markdown.ts:186), lines 186–191, 226–230. No rendered reference bug is claimed without a runtime reproduction.

**Verdict implication:** local syntax reuse is compatible with global semantic resolution, but a complete converter needs dependency invalidation, a global resolution pass, or a correctness-preserving fallback. The prior art does not prove that a new generic dependency framework is necessary. A smaller converter-owned fallback remains a viable candidate. Full-input regex checks, prefix comparisons and repair work also mean Streamdown's reuse does not establish constant work per appended character.

## Incomplete input: three different jobs

- **Error-tolerant syntax trees:** Tree-sitter exposes inserted missing nodes and excludes missing/error candidates from ordinary reuse checks. That is parser recovery, not a promise to infer intended Markdown. [Missing-node API](/Users/zbeyens/git/tree-sitter/lib/include/tree_sitter/api.h:577), lines 577–581; [reuse exclusions](/Users/zbeyens/git/tree-sitter/lib/src/parser.c:789), lines 789–797.
- **Parsing the current prefix:** Lezer's fenced-code loop accepts EOF without inventing a closing marker; markdown-it explicitly terminates an unclosed fence at document/parent end. micromark snapshots and restores tokenizer state when a construct fails. These are current-input parsing rules. [Lezer fence](/Users/zbeyens/git/markdown/src/markdown.ts:406), lines 406–435; [markdown-it fence](/Users/zbeyens/git/markdown-it/src/rules_block/fence.ts:40), lines 40–59; [micromark rollback](/Users/zbeyens/git/micromark/packages/micromark/dev/lib/create-tokenizer.js:503), lines 503–511, 558–580.
- **Speculative presentation repair:** Streamdown calls `remend` on the whole string before splitting, only in streaming mode when enabled. Remend can close emphasis, replace unfinished destinations with sentinel URLs, strip unfinished HTML, and append a zero-width character to suppress an apparent setext heading. This transforms input for display and can change text/offsets. [Call site](/Users/zbeyens/git/streamdown/packages/streamdown/index.tsx:670), lines 670–708; [options](/Users/zbeyens/git/streamdown/packages/remend/src/index.ts:49), lines 49–85; [destination repair](/Users/zbeyens/git/streamdown/packages/remend/src/link-image-handler.ts:15), lines 15–53; [setext repair](/Users/zbeyens/git/streamdown/packages/remend/src/setext-heading-handler.ts:38), lines 38–70.

**Verdict implication:** keep original source and speculative display policy distinguishable if exact conversion or positions matter. Remend is evidence for a streaming presentation job, not for silently applying the same repair to completed imports. Lezer `PartialParse`/open fragments describe unfinished computation and must not be confused with speculative source repair.

## Why micromark may be superlinear

Two concrete mechanisms survive in this pinned source:

1. **References:** definitions are appended to an array without deduplication; label checks use `Array.includes`. For R reference checks and D definitions, membership alone can require O(R × D) comparisons. A prospective small fixture family is repeated identical definitions followed by repeated unresolved labels; both input regions can grow linearly while every miss scans D entries. This is a source-derived complexity argument, not a measured timing result. [Array initialization](/Users/zbeyens/git/micromark/packages/micromark/dev/lib/parse.js:31), lines 31–40; [append](/Users/zbeyens/git/micromark/packages/micromark-core-commonmark/dev/lib/definition.js:195), lines 195–207; [membership](/Users/zbeyens/git/micromark/packages/micromark-core-commonmark/dev/lib/label-end.js:245), lines 245–249, 580–587.
2. **Emphasis:** each closing attention sequence can scan backwards through preceding events looking for an opener. The implementation itself flags hostile input as a bottleneck; repeated unsuccessful searches can accumulate quadratic work. Successful resolution also slices/splices event arrays, which can add movement/allocation costs. [Attention resolver](/Users/zbeyens/git/micromark/packages/micromark-core-commonmark/dev/lib/attention.js:34), lines 34–79, 144–174; [chunked splice implementation](/Users/zbeyens/git/micromark/packages/micromark-util-chunked/dev/index.js:40), lines 40–64.

Ordinary prose need not hit these paths heavily. Nested loops or buffering alone are not sufficient to blame a measured workload, and no blanket complexity bound for micromark or extensions was established. Separately, reparsing every growing prefix can make a caller's total work quadratic even with a linear one-shot parser. That caller cost must be distinguished from these internal mechanisms. The stream API buffers final output because definitions can occur later; streaming input acceptance is not settled incremental semantic output ([readme](/Users/zbeyens/git/micromark/readme.md:1020), lines 1020–1022; stream finalization cited above).

## Markdown-it speed: real algorithms and changed semantics

**Real algorithmic evidence:** delimiter balancing records failed-search lower bounds and jump distances to avoid repeated scans; inline token skipping caches endpoints, and backtick state caches prior scans. These optimizations do not, by themselves, justify a semantic downgrade. [Delimiter algorithm](/Users/zbeyens/git/markdown-it/src/rules_inline/balance_pairs.ts:41), lines 41–111; [skip cache](/Users/zbeyens/git/markdown-it/src/parser_inline.ts:90), lines 90–135; [inline state](/Users/zbeyens/git/markdown-it/src/rules_inline/state_inline.ts:32), lines 32–38.

**Comparison caveats:** the upstream `current-commonmark` benchmark overrides URL normalization and link-text normalization. Normal production code parses URL components and performs hostname punycode conversion; the benchmark substitutes simple encoding and identity text handling. Its published throughput table is historical, not evidence about these HEADs or this machine. CommonMark/default presets also differ: HTML enabled/disabled and nesting caps 20/100; the inline cap admits an incorrect-link case, and the block cap skips remaining nested content. A token-stream converter must account for its own mapping and extensions rather than compare raw HTML throughput. Sources: [benchmark configuration](/Users/zbeyens/git/markdown-it/benchmark/implementations/current-commonmark/index.mjs:3), lines 3–13; [normalizers](/Users/zbeyens/git/markdown-it/src/markdownit.ts:145), lines 145–196; [historical benchmark](/Users/zbeyens/git/markdown-it/docs/benchmark.md:8), lines 8–31; [CommonMark preset](/Users/zbeyens/git/markdown-it/src/presets/commonmark.ts:5), lines 5–40, [default preset](/Users/zbeyens/git/markdown-it/src/presets/default.ts:5), lines 5–40; [inline limit](/Users/zbeyens/git/markdown-it/src/parser_inline.ts:119), lines 119–131; [block limit](/Users/zbeyens/git/markdown-it/src/parser_block.ts:69), lines 69–77.

**Verdict implication:** retain markdown-it as a plausible baseline; do not dismiss all speed as weaker semantics, and do not accept benchmark-mode throughput as equivalent conversion performance. Match dialect, extensions, URL behavior, nesting limits, output and downstream mapping before comparing.

## Bounded follow-up that could change the verdict

No broader survey is needed before testing the candidate against these distinctions:

1. A reference before its definition: append, change and remove the definition; add a competing earlier definition. Compare fresh whole-document conversion with reused conversion.
2. A tail that changes the preceding block: setext underline, list continuation, open fence; include non-tail edits if the candidate claims arbitrary editing. Compare both values and source positions.
3. Repeated missing references with many definitions, plus unmatched emphasis closers: measure complete operations with matched output and parser settings. Attribute scaling before choosing a replacement.
4. Two interleaved documents and a changed parser configuration: establish who owns reusable state and when it is discarded. Streamdown's single-entry cache demonstrates a fallback strategy, not a multi-document reuse contract.

Next action: hand this source evidence to the conversion-boundary review. Adoption, product changes, ledger recording, runtime verification and performance claims remain outside this sidecar.

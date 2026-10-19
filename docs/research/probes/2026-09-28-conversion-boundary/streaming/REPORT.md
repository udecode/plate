# Streaming evidence review

**Pursue reuse owned by the existing Markdown conversion API. Do not accept a
general tail-only guarantee or infer a render win from parser allocations.**
For today's accumulated-source caller, prefer an optional opaque `previous`
result as an optimization hint over a new public stream handle. Production
performance acceptance remains unproven.

Product source was read only. Branch: `next`. All probe files and results are
in this directory. No ledger changes, staging, commits or product implementation.
This is one sequential evidence review, not an independent reviewer panel.

The user subsequently authorized an owned source-first www host and necessary
generated outputs. [Chromium follow-up](BROWSER-REPORT.md) records two passing
exact-route cases and the precise remaining instrumentation gap. No hand product
edits were made. The original headless report is preserved as
`HEADLESS-REPORT.md`; the initial browser feasibility finding below describes
the earlier, narrower write authority.

The accepted current CommonMark/GFM/math plus registered-tag grammar was reused.
The older September 10 streaming plan's MDX assumptions are historical; this
probe does not reopen the accepted grammar or test an engine replacement.

## Measured operations

Same source, Bun 1.3.12, current `createTestEditor` fixture, 64-byte ASCII chunks.
KB means **10,000 / 50,000 bytes**, matching the existing dialect benchmark's
10,000-byte convention, rather than KiB. The rich fixture reuses that runner's
answer-unit construction. Timings are cumulative milliseconds per stream.

| Fixture | Pairs | Operation | Full current path | Restricted prototype |
| --- | ---: | --- | ---: | ---: |
| Plain/heading 10 KB | 5 | `parseSlice` | 520.6 | 80.7 |
| Plain/heading 10 KB | 5 | separate fit + assertion | 627.4 | 624.6 |
| Plain/heading 10 KB | 5 | publish raw nodes | 1,221.9 | 1,189.7 |
| Plain/heading 50 KB | 1 | `parseSlice` | 10,825.1 | 446.6 |
| Plain/heading 50 KB | 1 | separate fit + assertion | 14,224.2 | 13,570.1 |
| Plain/heading 50 KB | 1 | publish raw nodes | 24,560.9 | 23,685.9 |
| Rich Markdown 10 KB | 1 | `parseSlice` | 1,207.6 | 1,040.7 |
| Rich Markdown 10 KB | 1 | separate fit + assertion | 2,540.7 | 2,269.6 |
| Rich Markdown 50 KB | 1 | `parseSlice` | 27,147.5 | 25,275.8 |
| Rich Markdown 50 KB | 1 | separate fit + assertion | 58,976.1 | 55,634.3 |

10 KB rows are medians across five alternating-order pairs, after one warmup
per path. Full parse totals ranged 485.5–603.5 ms; prototype 71.8–91.4 ms:
the restricted parse improvement clears the predeclared 20% / 5 ms materiality
rule and separates from observed variation. Fit/publication improvements do
not clear that rule. Raw per-update p50/p95 and all pairs are in `benchmark.json`.

The first measured 50 KB pair took about 88 seconds across the separately timed
operations. The run was interrupted during the following pair with exit 130;
one of five requested pairs is saved. Warmup duration was not separately logged.
**The frozen 50 KB sampling target was not met.** Its large parse difference is
an exploratory observation, not a threshold pass. `initial-run-status.json`
preserves that incomplete run and verifies the measured harness copy.

Fit is `schema.fitDocumentWithReport` plus `assertDocument`. Publication is
`target.update({history:'skip'}).value.replace({children: rawParsedNodes})` and
independently fits again. **Do not add these stage totals and label the sum a
production pipeline.** AI currently uses slice parsing followed by publication;
the static demo uses document parsing, including fitting, then publication.
The direct `parse` wrapper, AI store notifications, React, DOM and paint are not
separately timed here. Rich fallback observations are recorded independently
in `benchmark-rich.json`; they have one pair and no warmup, not the original
five-packet acceptance claim. Both rich paths parse exactly the same cumulative
bytes and reuse zero parser nodes. Their timing differences establish no
optimization win. Publication was not measured for the rich fixture.

The full parser consumed 793,744 cumulative source bytes at 10 KB and
19,593,744 at 50 KB. The restricted prototype parsed 21,522 and 107,933 bytes.
It still checks `source.startsWith(previous.source)` and copies the output
array: this is **not tail-only total work**, even for admitted prose.

## Identity and correctness

At 10 KB the full parser reused zero nodes, yet **9,071/9,071 content-equal
top-level positions retained both Plite model object identity and node keys**
after publication. At 50 KB it was **225,439/225,439**. These are aggregate
position observations over successive updates, not distinct-node counts.
The candidate had the same model/key retention. It reused 9,069 / 225,421
parser nodes. Parser allocation reduction does not establish fewer remounts.
This publication proof uses headless test-kit editors and only content-equal
top-level positions; it does not certify React reconciliation or arbitrary
reordered/restructured trees.

`correctness.json` records **1,996 complete-result prefix comparisons** over
20 transcripts: one-character chunks, 64-character chunks and 24 seeded
random chunkings each. Deep comparison includes success/failure, content,
slice metadata, diagnostics and source coordinates. **309 committed-prefix
object identity assertions** passed inside the admitted subset. Every finished
source is strictly reparsed. Unsupported multi-paragraph callout content and
raw unknown tags retain strict rejection; preview permissiveness is not used
to relabel them valid.

The broader unchanged-semantic-node identity oracle **fails**: on one-character
prefixes only **181/926** content-equal top-level positions reused parser
objects. Even before fallback, only **181/211** did. A semantically unchanged
but still-open tail is reparsed, and fallback reallocates content. See
`identity-oracle.json`. The prototype proves committed-prefix reuse, not the
proposal's stronger identity contract; no identity failure was discarded.

The prototype admits only independent plain ASCII paragraphs and ATX headings
with a deliberately small alphabet; ordered-list starts and indentation are
rejected too. References, footnotes, fences, lists, registered tags, tables,
math, emphasis, code, links, entities, escapes, Unicode and custom transforms
are **excluded from incremental optimization**. The tested rich syntax uses
full-parser fallback. A fallback pass proves oracle equivalence, not incremental
support, and fallback does not promise parser identity reuse.
Whole-source byte/node quotas are another required invalidation boundary:
the disposable admitted path parses slices separately and does not establish
aggregate resource-limit enforcement. All measured fixtures remain within
the default limits.

The unsafe blank-line splitter fails ten fixture families, including backward
references, footnotes, lists, fences and tags. The invalidation unit is the
**changed syntax dependency region**, potentially reaching the whole document,
not “the last text block.” `dependencies.json` also demonstrates a global
remark transform changing an earlier paragraph when a later one arrives, and
a stateful mapping changing output with identical source. The initial list
probe wrongly expected the first flattened list node to change; that failure
is preserved. The corrected oracle compares full-list context with independent
fragment concatenation, which loses continuation metadata.

## Current owners and throttling

- `markdownConversion.ts:258,393,538,571`: each call constructs/runs the full
  unified parse/conversion pipeline over the accumulated input. `partial`
  trims incomplete registered tags; it is not incremental parsing.
  `parseSlice` asserts a fragment; `parse` fits and asserts a document.
- `AIChatPlugin.ts:1608` publishes a freshly parsed `previewValue`.
  `ai-menu.tsx:120` replaces a separate AI preview editor's value.
  `public-state.ts:9728` fits that replacement; the root fitter routes through
  `reconcileChildrenStep` (`compiled-slice-fitter.ts:3508`), whose equality/diff
  path preserves semantic model identity in the measured cohort.
- `MarkdownJoiner` does **not** impose a universal 2500-character throttle.
  Its `>2500` check runs only inside the buffering branch, using a count updated
  after each incoming chunk. Plain 5,000-character input stays at 10 ms.
  On activation it buffers by line and requests 100 ms per nonempty emitted
  chunk; code/table handling can request 100 ms much earlier.
- For the rich 10/50 KB fixtures, the joiner produced 126/596 nonempty emissions
  before flush, requesting 9,810/56,810 ms of delay, versus 157/782 raw input
  chunks. The first 100 ms setting occurred by byte 192 because of code.
  These are deterministic requested delays, **not measured network latency**.
  The parser benchmark intentionally evaluates every raw 64-byte prefix.
- `useAIChat.ts:134–187` additionally coalesces previews on a 32 ms timer after
  the first one and performs a strict final parse. The streaming demo's play
  loop has different policies: editable calls `setPreview(output)` without
  options, whose `final: true` default makes every prefix strict; static uses
  `{partial:true, lossPolicy:'allow'}` throughout and has no final transition.
  Removing the joiner needs explicit
  preview/cadence/finalization proof; this probe does not certify its deletion.

## Proposed public contract comparison

Both forms need identical correctness and invalidation rules. A handle does
not make nonlocal syntax or callbacks local.

| Concern | `parseSlice(source, { partial: true, previous })` | `stream.append(chunk)` handle |
| --- | --- | --- |
| Current caller fit | Matches accumulated source and existing request lifecycle | Adds a lifecycle and requires lossless ordered deltas |
| Owner | Markdown compiler owns opaque immutable provenance on results | Markdown owns mutable session state; caller owns reset/end/dispose |
| Validity | Foreign, invalid, stale or non-prefix previous result falls back | Same invalidations still required; append order is explicit |
| Fingerprint | Compiler/schema/mappings, tags, effective options/limits, captured mapping state, remark plugin configuration and any declared dependencies | Same; creation-time capture must be an explicit semantic choice or revalidated |
| Retention | Keep only latest checkpoint, no linked previous chain; retained historical results can retain source/tree snapshots | One live state plus immutable published outputs; cancellation/disposal needs clear ownership |
| Tradeoff | Prefix verification and complete output arrays can still cost O(n) | Can avoid repeated prefix verification, but cannot avoid invalidation or publication work |

**Prefer `previous` for the present job**, with ordinary parsing as the semantic
authority and conservative full fallback. Reuse must preserve complete-result
semantics, source diagnostics and truly unchanged node identity; do not expose
checkpoints or require callers to compute fingerprints. Results must be
immutable or guarded against mutation. Function identity cannot fingerprint
mutable captured closure state; arbitrary remark transforms and untracked
stateful callbacks need fallback or a proven dependency/purity contract.

The current mapping context snapshots plugin state per operation. Model
`document/path/previousSibling` is exposed on the **encode** side in current
source; it should not be inaccurately attributed to today's decode callbacks.
A broader conversion cache must honor that context too. This prototype fixes
one compiler/options/state configuration and does not implement that validity
system. A strict final call reparses authoritative full source with default
loss rejection; it cannot promote the permissive cached preview into a final.

A public handle earns its additional lifecycle only if a real delta consumer
needs bounded retention/append ownership and measured benefit beyond the
previous-result form. Neither API is production-proven here. The next owner is
`$task design plan Markdown streaming conversion reuse`, carrying these limits.
Do not make stable parser object identity a prerequisite for Plite stability:
that publication job already has a canonical reconciliation owner. A stronger
public parser identity guarantee needs an independent consumer and explicit
proof, including unchanged open tails and full fallback.

## Chromium and claim limits

The existing exact surface is
`apps/www/tests/browser/markdown-streaming-lifetime.spec.ts` at
`/blocks/markdown-streaming-demo` (editable and static columns/lifetime cases).
No suitable running host was found. The same-checkout port 4747 is Agentation,
not the app; port 3003 belongs to another repository. The managed Plite doctor
reports **both app and browser artifacts stale** (`browser-doctor.json`).
Plite's Markdown-preview example tests decorations rather than this conversion
path. Normal www preparation runs registry generation and MDX output; Plite
preparation writes package dist/app outputs outside the allowed artifact tree.
No build, app launch or Chromium run was performed under this write boundary.

Unmeasured: current exact-route publish-to-React-commit/DOM/paint timing,
component renders/remounts, browser heap retention, scheduler/network cadence,
and 10/50 KB final interactive behavior. **The claimed 3.2 seconds is not
established by this review.** No headless result substitutes for those claims.

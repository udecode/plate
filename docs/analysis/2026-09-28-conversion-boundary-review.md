# Conversion boundary review

Status: Assessment complete — Pursue the corrected direction; production incremental performance acceptance remains open.

Verdict: **Pursue.** The strongest cuts are inferred preservation claims,
duplicated safety/loss decisions and unchecked output paths. Reuse the existing
schema and format owners. Reject a universal conversion pipeline and an
unconditional tail-only guarantee. Keep declarative mappings and the tested
dialect; a parser-engine change needs a measured equivalent-operation win.

Question: which conversion laws should share an owner across HTML, Markdown,
DOCX and plain text, and which Markdown streaming contract removes repeated
work without changing prefix semantics?

Scope follows the user's conversion-boundary review request. Keep the adopted
dialect and declarative mapping direction. No product implementation, public
codec/AST, AI product redesign or publication is authorized by this review.

Acceptance and evidence:

- Reconcile the format-mapping design and completed Markdown adoption with
  source. Review all five proposed cuts, retaining separate feature scopes.
- Verify URL safety on ingress and egress across HTML, Markdown, DOCX and
  paste; distinguish safe rendering from persisted data.
- Compare property exposure, actual preservation and loss accounting using
  matched format capabilities. Inspect existing schema/format owners before
  proposing a shared private core.
- Verify throttling and repeated streaming work; compare a bounded prototype
  with full partial parsing and measure 10 KB/50 KB workloads. Preserve gaps
  in fit, publish or Chromium-render evidence explicitly.
- Inspect local primary sources for tree-sitter, Lezer, Streamdown,
  markdown-it and micromark. Record revisions; do not equate cloning with proof.
- Settle a value verdict, proposed ownership and next owner, without locking
  an unproven runtime design. Record the review and verify the ledger.

## First-principles target

One external source produces a typed document or insertion slice under the
installed schema and an explicit loss policy. Streaming previews must equal a
fresh partial parse of the same prefix, including diagnostics and source
locations. Natural completion performs one strict final parse. A shared law
does not imply identical representation or identical losses across formats.

Keep source text separate from preview repair. Keep syntax reuse separate from
model identity reconciliation. The Markdown runtime owns parse reuse;
consumers own request cancellation, review, acceptance and history. Reuse the
existing Plite schema authority and Plate format compilation context rather
than creating another validation system, public conversion plugin or AST.

## Verified local property probes

`property-probe.ts` and its output are in the linked evidence directory.

| Same source document / encoder behavior | HTML | Markdown |
| --- | --- | --- |
| Mapping owns `label`, but ignores it | Exports without diagnostic | Reports `markdown-property-omitted` |
| Callback reads `label` but writes exactly the same output | Still no diagnostic | Diagnostic disappears |
| Foreign content property has no mapping, non-default value, default reject policy | Fails | Succeeds with warning |
| Foreign property equals its default with `omitDefault: false` | Fails | Succeeds without diagnostic |
| Built-in centered paragraph | Preserves alignment in CSS | Diagnoses omitted alignment |

This is stronger than merely finding two duplicate functions. HTML's
`reportUnsupportedProperties` checks a compiled set of encodable property IDs;
that set includes an element mapping's owned properties even when its callback
does not emit them. Markdown's `trackPropertyReads` accepts a read, membership
check or spread as a preservation claim. Neither proves arbitrary callback
fidelity. Sharing either unchanged would preserve false assurances.

The justified cut is the read-tracking proxy and duplicated policy decisions.
Declarative encoders can provide exact emitted-property evidence; custom
encoders require explicit representation/omission claims and focused round-trip
proof. A shared private accountant can enforce claims and consistent severity,
but cannot infer the truth of arbitrary JavaScript callbacks. Property
eligibility, declared support and actual preservation are separate facts.
Settle default-value semantics with round-trip evidence; do not simply copy
either existing implementation's rule.

The alignment control refutes unconditional diagnostic parity. Compare equal
capabilities, defaults, roles and intentional projections. Plain-text export
intentionally discards formatting; warning once per mark is not automatically
better fidelity reporting.

## What can share an owner

| Law or mechanism | Existing authority and strongest target |
| --- | --- |
| Schema vocabulary, grammar and repair | Plite already owns them. Plate adapters reuse its document fitting and slice-admission primitives. A private common report adapter may remove duplicate policy handling; no second fitter. |
| Property ownership and exposure | Compile from the existing model bindings once. Reuse the owner-scoped D2 rule across format compilers, retaining format-specific wire aliases and actual output capability. |
| Preservation and loss | Common private accounting for roles, defaults, claims and loss-policy severity. Each format identifies what it emitted, omitted or transformed. |
| Semantic URL/resource safety | Common role-aware Plate policy, enforced across format ingress/egress. Literal source text is not an active URL. Preserve legitimate navigation, raster-image data and blob-resource distinctions. |
| Limits | Shared counting/policy primitives only where the unit and stage match. HTML token limits, Markdown syntax limits and DOCX archive/resource limits must protect allocation in their own front ends. |
| Diagnostics | Share severity/impact decisions and model locations. Preserve syntax locations and format-specific diagnostic detail; no universal public result/AST. |
| Format meaning | Feature mappings and format owners retain it: HTML DOM semantics, Markdown dialect, DOCX revisions/resources/source lifetime and plain-text projection are more than syntax tokenization. |

Document fitting and insertion-slice admission must remain distinct. HTML
slice admission calls `assertContentSliceForSchema`; Markdown currently calls
`assertFragment`. The existing fitter can repair legal insertion shapes. The
earlier conversion-correctness execution explicitly rejected validating every
slice as a complete document. A common layer must preserve that distinction.
An intentionally invalid custom mapping in the probe throws in HTML and returns
a schema diagnostic in Markdown; this does not establish that every programmer
error should become a user-input diagnostic.

## Streaming hypotheses

Unconditional tail-only reparsing cannot preserve current prefix semantics.
Definitions can change earlier references; lists, fences, math and registered
containers can span apparently complete blocks. The reusable region must be
grammar- and dependency-aware, with conservative full recomputation when a
dependency is unknown. A growing single block can still be the whole tail.

The prototype's prefix oracle compares the full result, not only final text.
The final full parse remains necessary but does not validate earlier previews.
See the streaming evidence for matched workload measurements, exact
fallback conditions and the deliberately unsafe splitter's counterexamples.

The restricted prototype passes 1,996 full-result prefix comparisons over 20
transcripts, including source diagnostics, with 309 identity assertions on
admitted stable prefixes. It optimizes only a small plain-ASCII paragraph/ATX
heading alphabet. Rich syntax uses the original parser. Disabling the guards
produces failures in ten fixture families. This proves the value of the oracle
and a narrow reuse opportunity, not a general incremental Markdown engine.
The broader parser-identity oracle fails: only 181/926 content-equal positions
retain parser objects across one-character prefixes (181/211 before fallback).
An unchanged open tail is still reparsed. Whole-source quotas also need an
aggregate check; parsing separate admitted fragments does not establish it.

Headless synchronous elapsed milliseconds accumulated over 64-byte chunks:

| Input | Evidence | Operation | Current | Restricted prototype |
| --- | --- | --- | ---: | ---: |
| Plain/heading 10,000 bytes | Median of five alternating pairs | `parseSlice` | 520.6 | 80.7 |
| Same | Same | Separate fit + assertion | 627.4 | 624.6 |
| Same | Same | Publish raw nodes | 1,221.9 | 1,189.7 |
| Plain/heading 50,000 bytes | One exploratory pair | `parseSlice` | 10,825.1 | 446.6 |
| Same | Same | Separate fit + assertion | 14,224.2 | 13,570.1 |
| Same | Same | Publish raw nodes | 24,560.9 | 23,685.9 |

Publication independently performs fitting; these rows must not be summed and
called one production pipeline. The original five-pair 50 KB target was not
met; the long run was stopped and its failure receipt retained. Rich 10/50 KB
fallback observations are separately recorded as single pairs without warmup,
not accepted timing wins. The quoted universal "3.2 s parse CPU" claim was not
reproduced: fixture, kit and measured operation matter.

The existing full parser creates fresh nodes, but normal Plite value replacement
preserves model objects and keys at all 9,071 content-equal top-level position
observations in the 10 KB cohort and 225,439 at 50 KB. Parser allocation does
not establish remounting. Browser proof limits are recorded below.

The server joiner does impose artificial delays, but the 2,500-character switch
is conditional on its buffering branch. Plain 5,000-character input stays at
10 ms; code/table syntax can select 100 ms much earlier. The rich fixtures
request 9,810 ms and 56,810 ms delay at 10/50 KB. These are deterministic timer
requests, not measured network latency or evidence that model computation
slows. The AI consumer also coalesces updates with a 32 ms timer; its actual
invocation count is not every raw network chunk. The demo's static path remains
in partial/allow mode at completion; its editable path calls `setPreview` without
options, which defaults to strict `final: true` on every prefix. Neither is the
proposed shared partial-preview/strict-completion lifecycle. Remove transport's
syntax heuristics and delays only with
replacement prefix/cadence/finalization proof.

## Safety findings

The independent safety sidecar ran one package probe with 56 observations and
10 assertions. It reproduced the unsafe Markdown URL persistence and paste
claim, and contradicted the claim that DOCX inherits public HTML sanitization.
The passing probe reproduces defects; it is not a safety certification.

- Public HTML sanitizes an ordinary script href before feature decoding,
  preserving label text. A tab-obfuscated scheme evades that AST pass: a later
  per-element guard can silently drop the link and its label. The built-in
  video figure decoder can read its child's unchecked URL first and persist it.
- DOCX file import calls the compiled HTML element decoder directly after
  Mammoth and Word cleanup. It shares the per-element guard, not public
  `parseHtml`'s whole-tree pass. A parent mapping can observe an unsafe child
  attribute. Default import can silently lose the hyperlink label.
- Ordinary Word HTML paste uses the public transfer preparation path. It is
  not equivalent to DOCX file import. Markdown paste persists the unsafe URL.
- Current transfer adapters return a slice or `null` and discard richer parse
  diagnostics. A shared accountant alone cannot make paste loss observable.
  The transfer owner must preserve the user-relevant outcome at its boundary;
  do not restore a former toast/report API without checking its later cuts and
  current consumer. This review establishes the gap, not that public shape.
- Semantic HTML egress silently loses an unsafe link label, but throws for an
  unsafe image/video source. DOCX custom static rendering does not use that
  semantic HTML egress path. Unchanged retained-source export can return the
  original unsafe relationship even though the imported semantic document
  no longer contains it.

Therefore safety must cover preparation before mappings inspect descendants
and active output sinks after mapping/rendering. One shared predicate alone
does not fix unsafe bypasses, silent drops or trusted source-reuse behavior.
Do not put blanket URL bans in neutral Plite persistence or recursively
sanitize strings named `url`. Feature roles and destination capabilities own
the meaning. Keep literal code/text, safe navigation and allowed media resources.

Retained DOCX bytes expose a real contract conflict: exact source fidelity and
sanitized export cannot both be promised for an unsafe original. Under the
user's required common safety law, unchecked exact-source return must lose:
reuse is eligible only when the emitted package satisfies the output policy.
Otherwise diagnose refusal or explicitly regenerate with reported loss under
the selected policy. `lossPolicy: 'allow'` must never authorize unsafe active
output. Keeping original bytes in an opaque retained source is distinct from
returning them as a safe export. This proposed cut does not authorize silently
rewriting retained bytes or claim unsafe relationships execute in Word.
Detailed paths, outcomes and probe limits are in `safety/review.md`.

`parseSlice(source, { partial: true, previous })` is a candidate, not an adopted
API. A previous semantic slice alone lacks the source, grammar context,
definitions and configuration identity needed for reuse. An opaque checkpoint
owned by the result could supply them without a global cache. It must bind
reuse to schema/compiled mappings, relevant plugin state, parse policies and
transformers, and avoid retaining an ever-growing chain of previous results.
Append validation itself and whole-output-array construction also cost work.

Compare that candidate with one explicitly scoped Markdown parsing handle in
the non-AI demo. A handle can own efficient mutable parser state but adds a
lifetime; a previous result supports branching and explicit ownership but needs
immutable reusable state. Neither wins because its sample call is shorter.
Arbitrary `remarkPlugins` and custom callbacks can depend on global context;
reuse needs a demonstrated contract or a conservative fallback.

Retain micromark/MDAST as the baseline. Source inspection or a synthetic B4
failure alone does not select another engine. Any replacement must beat the
complete matched operation while preserving the selected dialect. Grammar
reimplementation size is adoption cost, not a permanent architectural law.

## Prior-art implications

Six local primary-source repositories are pinned in `prior-art/findings.md`.
Tree-sitter reuses an edited syntax-tree handle, and Lezer reuses explicit
fragments with mapped coordinates and context checks. Lezer Markdown explicitly
does not validate whether reference links resolve; it trades that distinction
for incrementality, which cannot be borrowed as equivalent Plate conversion.
Neither establishes that
an arbitrary previous converted value is enough. Lezer Markdown conservatively
reopens list/indented-code boundaries. Streamdown has a single-entry source/
block cache and separate React memoization; its speculative source repairs
are not proof of Plate's exact partial-prefix semantics. Micromark's input
streaming buffers semantic output until completion. Markdown-it is a useful
baseline only with matched dialect, URL behavior, limits and conversion work.

## Five candidate dispositions

Five requested candidates reviewed; none skipped. Four conversion families
were traced, with package runtime probes for HTML, Markdown, DOCX and transfer
negotiation. Plain-text projection is source-traced and appears in clipboard
egress observations. Full protocol fuzzing, complete DOCX fidelity/resource
auditing, AI product UI/prompts and a new grammar are excluded. The general
incremental runtime, public reuse-state choice and production performance
acceptance remain unproven; table dispositions do not mark them adopted.

| Candidate | Disposition | Reason |
| --- | --- | --- |
| Shared private admission/emission core | Pursue common policy and property-accounting primitives at the existing owners. Reject a mandatory one-size conversion pipeline. | Schema fitting already has an owner. Resource safety must be enforced at the right early and late boundaries; format meaning and artifact lifetimes remain format-owned. |
| Incremental Markdown and stable identities; delete server joiner | Pursue dependency-aware reuse and removal of grammar/latency policy from transport after parity proof. Reject unconditional tail-only work. | Prefix equality exposes earlier-block dependencies. Existing model publication may already preserve identity; parser allocation is a separate claim. |
| Previous-result argument versus parsing handle | Previous result is a leading public-shape candidate; runtime choice remains unproven. | Both need real parse state, validity rules and bounded retention. Test the non-AI consumer, branch/interleave, reset and configuration invalidation before locking the shape. |
| Keep micromark/MDAST | Retain the matched baseline. Do not commission an engine rewrite from B4 alone. | A measured complete-operation win with dialect parity would justify reopening. Existing grammar size neither proves quality nor forbids replacement. |
| One standalone fragment rule | Pursue cutting the unused public detached HTML slice exports, retaining installed editor slice parsing and standalone document parsing. | A repository consumer census finds wrappers, exports, documentation and type contracts, with no production detached HTML-slice caller. No external-consumer census is claimed. Apply the same current-job rule that cut detached Markdown fragments; do not add the Markdown exports for symmetry. |

## Reconciliation and order

The criticism of the earlier sequencing explanation is correct. Declarative
tag/attribute/mark declarations do not depend on a specific parser engine.
The earlier response established no demonstrated dependency that required
pausing all mapping work for an engine review.

Retain the completed dialect adoption, diagnostics repairs and later serialize
performance repair. Retain the format-mapping design's declarative direction.
Reopen D2's shared ownership together with property-loss policy and safety:
current probes establish real differing behavior across formats. The corrected
order is to settle these shared contracts before adopting D2/S1, while the
streaming prototype addresses its own performance/state questions. Do not make
all safe mapping simplification wait for a general incremental engine.

Existing HTML/Markdown/DOCX/plain-text APIs keep their distinct jobs. A common
private law does not revive the rejected universal public codec or AST. The
broader HTML/static-rendering audit remains separate; AI product UI/prompts and
grammar redesign are excluded. Execution would require public-contract docs,
doctrine and package proof at adoption; this review does not perform those
product changes.

Proposed ownership flow:

```text
format input
  -> format-owned syntax/resource admission and preparation
  -> shared role-aware safety decisions, then feature semantic mappings
  -> existing Plite document fitting OR slice admission
  -> common loss-policy decisions, format-specific diagnostics

document/projection or eligible retained source
  -> format-owned representation and property-preservation claims
  -> shared loss accounting and active-output safety decisions
  -> format artifact and diagnostics
```

Proposed streaming call shape for comparison, not an existing API:

```ts
const preview = editor.api.markdown.parseSlice(source, {
  partial: true,
  previous,
});
// Completion rechecks full source under strict policy.
const final = editor.api.markdown.parseSlice(source);
```

The result's provenance stays private to Markdown; callers do not assemble
fingerprints or manipulate an AST. A mismatched previous result must not change
semantics. This example does not settle preview loss policy or authorize a
cached permissive preview as committed content.

## Browser proof and remaining acceptance

A source-first www development server was prepared on an owned port and the
actual `/blocks/markdown-streaming-demo` route was driven in Chromium
149.0.7827.55. Both existing editable and static column scenarios completed
with their expected output and no console errors. DOM verification took
971.5 ms and 849 ms respectively on this run, including scenario scheduling.
Those durations are neither isolated render costs nor performance budgets.

**The requested 10/50 KB current-versus-incremental Chromium render comparison
is not established.** The route's public UI selects fixed scenarios and its
browser harness does not expose the candidate parser/publication boundary.
The observed browser run covers existing behavior, not the headless candidate.
Do not relabel it as end-to-end scale proof. Source-side profiling events and
DOM/frame observations do not isolate React commit or paint costs by themselves.
The design/benchmark owner must add a bounded proof surface for that comparison
before declaring runtime adoption ready. No production helper or browser hook
was introduced by this assessment.

Remaining acceptance is explicit: complete grammar-aware invalidation and
configuration/closure-state validity; preserved prefix diagnostics; whole-path
10/50 KB browser measurements; bounded retention; final/stop/cancel semantics;
and cadence proof before deleting the joiner. The restricted fast path and
headless source identity evidence do not discharge those requirements.

Next owner: `$task design plan conversion-boundary`. Settle shared safety,
property ownership and truthful loss policy first; then adopt declarative
mapping construction and prove dependency-aware Markdown reuse at the existing
runtime. Keep public-state ownership, alias-free adoption, docs/doctrine and
browser acceptance together in that plan. This is a recommendation, not
downstream execution authorization.

## Evidence and reproduction

- [Property probe](../research/probes/2026-09-28-conversion-boundary/property-probe.ts)
  and [output](../research/probes/2026-09-28-conversion-boundary/property-probe.log).
- [Safety probe](../research/probes/2026-09-28-conversion-boundary/safety/probe.test.ts),
  [results](../research/probes/2026-09-28-conversion-boundary/safety/results.json)
  and [source trace](../research/probes/2026-09-28-conversion-boundary/safety/review.md).
- [Streaming report](../research/probes/2026-09-28-conversion-boundary/streaming/REPORT.md),
  including the incomplete original sampling receipt and rich-fallback limits.
- [Pinned prior art](../research/probes/2026-09-28-conversion-boundary/prior-art/findings.md).
- [Existing format-mapping plan](../plans/2026-09-28-format-mapping-authoring.md)
  and [implemented dialect plan](../plans/2026-09-28-markdown-commonmark-dialect-design.md).

The reusable probes and selected receipts are preserved outside the ignored
plan-artifacts directory; the streaming README distinguishes byte-identical
historical evidence from rerun commands. Raw browser profiles and server logs
remain in the original artifacts; they are not a substitute for the
explicitly missing scale comparison. No commit, staging command or product
implementation was performed by this review. Browser preparation regenerated
required build outputs; semantic source changes are not claimed.

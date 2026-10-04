---
title: Conversion boundary ownership and incremental Markdown
type: decision
status: accepted
updated: 2026-10-04
related:
  - format-mapping-authoring.md
  - markdown-conversion.md
  - import-fidelity.md
  - export-fidelity.md
---

# Conversion boundary ownership and incremental Markdown

**Audit of 2026-10-04.** Pursue. The adopted laws and Markdown reuse contract hold, but HTML list import still merges an item's several blocks into one item's inline content before any decoder runs, with no diagnostic, while Markdown keeps the same structure as continuation blocks; that is silent content loss against the shared loss law despite a matched representation. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and records `2026-10-04-conversion-boundary-audit` and `2026-10-04-conversion-boundary-audit-2` hold the evidence.

**Adopted: coherent immutable document reads, explicit HTML loss accounting
and dependency-correct static reuse.** Retain the rest of the design:

- document-first conversion;
- the Markdown dialect and continuation contract;
- shared safety ownership;
- opt-in paste feedback.

The [2026-09-29 static-read review](../review-records/2026-09-29-conversion-next-static-read-review.json)
found two gaps. [Its probes](../probes/2026-09-29-conversion-next-review/)
reproduced both.

- **Mixed document reads:** the static `document` prop's projected editor
  mixed document identities. A source-derived TOC rendered beside a projected
  body, because plugin reads resolved against the source.
- **Silent HTML loss:** HTML dropped a schema-valid image `title` with no
  diagnostic, because the compiler treated owning an encoder as preservation.

[Plan `2026-09-29-static-document-rendering`](../../plans/2026-09-29-static-document-rendering.md)
(record `2026-09-29-static-document-rendering-execution`) repairs both and
adds reuse:

- **Reads:** Plite `createEditorView(editor, { document })` is a read-only
  view whose reads, plugin reads and plugin APIs all resolve against one
  immutable document. It replaces Plate's partial facade.
  - Plugins read it through their context editor or `state`; an editor
    captured in `.extend` is the source.
  - A Plite guard refuses source-editor reads made on a document view's
    behalf. Schema queries pass.
- **HTML:** encoders claim what their kept output writes, with `preserve` for
  element encoders and by output for single-value mappings. Every other
  content property reports `html-unsupported-content`. A 30-fixture
  round-trip harness guards it.
- **Reuse:** static rendering reuses a block while it and every earlier block
  keep their identity and its decorations are value-equal. Elements that read
  later content declare `render.readsDocument`, as the TOC does. This stays
  correct in concurrent and server rendering, with no mutable stable view.
- **Owner fixes:** the audit and the S5 oracle found five wrong-document
  reads, each fixed at its owner: code highlighting, find, Markdown
  `serialize()`, the AI end marker's segments, and Plite node targets in
  projected documents. The profiles also found a Plite portal refresh that
  rebuilt the plugin configuration on every lookup.

S5 snapshot w established static reuse. The subsequent
[proportional-cost plan](../../plans/2026-09-30-static-preview-proportional-cost.md)
is completed with source-bound browser receipts. Decoration reads take 8–21%
of React time. The full pass over blocks still costs 1.7–3.8 ms per commit at
50 KB, so caching and chunking remain deferred under the plan's revisit trigger.
The original pp4 summarizer marks two AI cells inconclusive; its companion
assessment passes them after raising the sampled-CPU/trace-busy guard from
1.20 to 1.25. That diagnostic adjustment is disclosed in the receipts and does
not establish a new production API requirement.

The [2026-09-30 next-work assessment](../review-records/2026-09-30-static-preview-next-content-roots.json)
retains the conversion, parser and static-rendering choices. Current public
checks confirm that preview and export both use projected headings, the source
editor stays unchanged, and image titles survive semantic HTML round trips.
The [content-root location design](../../plans/2026-09-30-content-root-locations.md)
is [adopted locally](../../plans/2026-09-30-content-root-locations-execution.md). It uses the existing scoped editor for callback
context, corrects view derivation and reuses static readers privately.
Known-path list and table presentation reads avoid redundant indexing.
Root-range admission and live owned-root source propagation are adopted; the
streaming preview contracts pass and the static preview's DOM output is
unchanged. The [closure](../review-records/2026-09-30-content-root-locations-closure.json) adds the Chromium S5 static and AI cells: every
complete cell passes the no-regression checks with identical final text, and
ai-rich profile attribution remains inconclusive under the unchanged rule.
The design adds no public location carrier or view manager and retains the
pure detached conversion adapters.
The `group-last/*` restyle belongs to a direct Plate UI performance repair.

HTML's explicit accounting is adopted, not an exhaustive fidelity claim. The
completed plan records remaining multi-block list flattening, unreported table
list properties and subtree-wide decoder claims. Those concrete boundaries
remain open without reopening the parser dialect or all conversion APIs. The
sections below preserve the earlier evidence and superseded next steps.

## Initial review and design

The [full assessment](../../analysis/2026-09-28-conversion-boundary-review.md)
traces all five proposed cuts, reconciles earlier work and links runnable
probes. The retained dialect and declarative mapping direction stand. A parser
replacement alone does not invalidate pure mapping declarations.

Common private laws reuse existing Plate owners: property exposure,
preservation claims, loss severity and role-aware resource safety. Feature-owned
schema validators enforce canonical active fields; format/package gates cover
source syntax, emitted output and retained bytes. Reuse Plite's schema authority
and preserve the distinction
between fitting a document and admitting a context-dependent insertion slice.
Format owners retain syntax, representations, resource admission, diagnostic
coordinates and artifact lifetimes. No universal pipeline, public codec or
intermediate AST earns its place.

Current probes show that reading a property can suppress Markdown's omission
diagnostic without emitting it; HTML can assume preservation from mapping
ownership. Markdown property loss also bypasses the default reject policy.
Replace these false assurances with explicit capability/emission accounting.
Arbitrary JavaScript callback fidelity still requires a contract and proof.
Compare losses with matched capabilities; HTML alignment and plain-text
projection must not be judged by Markdown's representational limits.

Safety must protect mappings that inspect descendants and output written by
custom renderers or retained-source reuse. Public HTML preparation does not
cover DOCX file import. Tab-obfuscated URLs expose inconsistent HTML guards;
Markdown persists and re-emits active unsafe URLs. Unchanged DOCX source can
return the original unsafe relationship. Under the required common safety law,
unchecked exact-source export must yield to safe-output eligibility, diagnosed
refusal or explicit regeneration with reported loss. Permissive loss policy
does not permit unsafe active output. Literal text and role-allowed media
resources remain distinct from active navigation. These are package boundary
observations, not browser or Word exploit claims.

Streaming reuse must equal a fresh partial parse of every prefix, including
diagnostics. Definitions, lists, containers and global/stateful transforms can
invalidate earlier output; unconditional tail-only work is not a valid law.
Completion strictly reparses the original source. The selected candidate is a
mode-correlated previous-result hint on installed parse/parseSlice, with private
syntax-only checkpoints. It reruns transforms, mapping, aggregate validation
and fitting; converted-result caching is rejected because current state can
affect mapping. A scoped handle adds no independent job. Configuration validity
and bounded retention remain required. Consumer cancel, accept and undo stay
outside parsing.

The restricted prose prototype passes 1,996 prefix comparisons and 309 stable
prefix identity assertions, but fails broader unchanged-parser-node identity.
Its five-pair 10 KB parse median improves from 520.6 to 80.7 ms; fitting and
publication do not materially improve. Plite already preserves unchanged model
objects in the measured cohort. The 50 KB timing target has only one of five
pairs. Chromium proves existing editable/static Columns behavior, not the
required 10/50 KB candidate comparison or React commit cost. General runtime
adoption remains unproven. Transport grammar buffering and artificial delays
are deletion targets only after replacement cadence/finalization proof.

Retain micromark/MDAST as the matched baseline. Six pinned primary-source
repositories explain reuse and dependency obligations; they do not select an
engine replacement. A repository caller census supports cutting detached
public HTML slice helpers while retaining editor slice and standalone document
operations. No external-consumer census is claimed.

The [adoption plan](../../plans/2026-09-28-conversion-boundary-adoption.md)
is design-complete. It retains declarative mappings, replaces read/ownership
fidelity inference with actual emission and an invocation-scoped custom
`preserve` claim, adds DOCX export loss policy, and cuts unused detached HTML
slice helpers. Proposed URL-role metadata is cut in favor of existing
feature-owned validators with explicit v54 identity/migration proof.

The later [import review](../review-records/2026-09-29-imports-opt-in-paste-result.json)
keeps the mounted `onPasteResult` lane but removes default registry UI.
Ordinary paste keeps fitting, fallback, sanitizer and lifecycle-error
correctness; applications can opt into diagnostics at the mounted surface.
Explicit conversion operations retain typed diagnostics and loss policy because
their callers can review, retry or reject the result. Retained DOCX source is
eligible immutable bytes or null; unknown package vocabulary cannot bypass
checks.

A second pass amended the design
([amendment record](../review-records/2026-09-28-conversion-boundary-adoption-amendment.json)):

- **Streaming:** converted segments are reused at closed-container blank-line
  boundaries, and publication splices by identity. This replaces syntax-only
  reuse, which could save at most the ~20% of parsing that is tokenizing.
  - 3,730/3,730 previews equal a fresh partial parse.
  - Rich 50 KB: parse 24.6 → 0.72 s, publish 88.3 → 22.2 s.
- **Loss severity:** property loss warns and content loss rejects, so AI
  serialization and Markdown export keep working on aligned, styled or pasted
  documents. Link import stops inventing `target: '_blank'`.
- **Accounting:** `preserve(...)` stays behind a round-trip conformance
  harness, and list accounting is fixed.
- **Migration:** neutralizes unsafe legacy values instead of rejecting the
  document.
- **Navigation floor:** blocks script-capable schemes, while `allowedSchemes`
  can still widen it.
- **Scope:** DOCX source eligibility and paste feedback delivery move to their
  own plans.

A tail-only splice still costs O(document) in Plite's per-transaction change
application, which needs its own Plite and Benchmark owner.

Next owner: execute S0 with the A1 candidate (adding invalidation and
aggregate limits), then accounting and mappings, safety, transfer diagnostics
and HTML cuts, and consumer correctness. Open the Plite per-transaction cost,
DOCX source eligibility and paste feedback plans separately. The amendment
closes planning, not the streaming objective or runtime readiness.

## Execution outcome

The [execution program](../../plans/2026-09-28-conversion-boundary-adoption.md)
reached every end state on 2026-09-29 (records `2026-09-29-conversion-boundary-adoption-execution`
and, after a closure review, `2026-09-29-conversion-boundary-closure-repairs`).
Parser and publication reuse is adopted; end-to-end streaming performance stays
open on static preview rendering.

- **Loss:** property loss warns under every policy, and content loss follows
  `lossPolicy` in Markdown, HTML and DOCX export. Removing a destination or
  resource URL that could run script, while keeping its label, alt text or
  caption, is lossless.
- **Safety:** one private URL role policy backs the feature validators and
  every format boundary. Link navigation keeps a script-capable floor with
  `allowedSchemes` above it. HTML and DOCX run a whole-tree safety pass
  before any mapping reads the tree. Output and retained DOCX bytes are
  checked, and the v54 migration neutralizes legacy unsafe values.
- **Transfer:** decoders report diagnostics. `Editable.onPasteResult`
  delivers them once to the initiating view as opt-in delivery; the registry
  renders no toast (decision `2026-09-29-imports-opt-in-paste-result`).
- **Streaming:** `parseSlice({ previous })` reuses converted segments,
  previews and the strict final alike. Consumers splice from the first
  changed block, and the joiner is deleted. A source with a link reference
  or footnote definition parses whole. In Chromium, the S5 matrix passes all
  16 cells: 77–97% less parse-plus-publish work, and strict finals 32–93%
  faster. The final tree's continued-parse path is byte-identical to the
  measured snapshot.
- **Plite:** per-update cost follows the change. DOCX keeps exact-source
  retention, with eligibility at 87% of repository fixtures.

- **Closure repairs:** the static HTML renderer loads
  `react-dom/server.edge` in Node-like runtimes and `.browser` otherwise; no
  single specifier works in Node, Next's webpack client and Next's
  server-component check. Unawaited async `act()` calls that broke the shared
  test process are fixed, and the shared test setup now fails any test that
  leaves an act scope open.

- **Static preview document:** read-only previews render the parse as
  `EditorStatic`'s `document` instead of splicing it into an editor, with
  Plite validation reuse keeping publication proportional (record
  `2026-09-29-static-preview-document-execution`). On S5 projection-2 it beats
  the splice on every metric in every cell.

- **Static document rendering:** document views bind every read, HTML
  accounts for actual emission, and static previews re-render from the first
  changed block (record `2026-09-29-static-document-rendering-execution`).
  S5 snapshot w passes 8/8 with fresh-render parity, and React is 62–82%
  below projection-2.

Open: decorations are still read over every node on each render (21–58% of
React time at 50 KB). Authored editors still load their whole value per
preview.

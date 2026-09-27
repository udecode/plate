---
review_scopes:
  - exports
review_basis:
  - 2026-09-24-exports-model-switch-final-audit
work_kind: design
---

# Exports authored capture and conflict fidelity

Status: Complete

Objective:
Design the hard-cut repair for authored exports so one user action observes one
editor revision across the projected document, retained review envelope and
diagnostics. Settle conflict export behavior, repair the optional authored
runtime guard and return menu toggling to the menu primitive. Keep HTML,
Markdown and DOCX conversion as separate format adapters; do not invent an
export subsystem, cache or checkpoint owner.

Task source:
The user's 2026-09-24 `go` after the final exports Best API Review.

Template:
`.agents/skills/autogoal/assets/templates/major-task.md` with `package-api` and
`performance-observability` packs.

Completion threshold:
The capture/conflict API, hard cuts, adoption slices, proof matrix and release
classification are decision-complete; the frozen projection benchmark passes
or rejects the targeted helper; the review ledger binds the outcome to the
final exports audit.

Verification surface:
The disposable Bun projection benchmark and exact-result guards, the Autogoal
plan checker, and `review-ledger.mjs render` plus `check`.

Constraints:
Preserve canonical authored envelopes, accepted/proposed semantics, retained
source, roots, schema and coalescing. Keep format codecs separate. Add no cache,
projection store, generic export package or compatibility alias on `next`.

Boundaries:
Planning, local disposable evidence and research metadata only. Product source,
release artifacts and publication are excluded. Suggestion author admission is
a separate authored/suggestions scope.

Delivery:
Local-only design record. No commit, push, pull request or product
implementation is requested by this planning pass.

Blocked condition:
None. The only unresolved design gate was comparative projection performance,
and the frozen benchmark resolved it.

Work Checklist:
- [x] Reconcile the final exports review and preserve its hard cuts.
- [x] Freeze and run a current-versus-target projection benchmark.
- [x] Settle the public capture API and conflict behavior from evidence.
- [x] Sequence complete adoption, deletion, release and proof work.
- [x] Record the design outcome in the exports decision and review ledger.

## Authority and delivery

- The user's `go` authorizes design, source inspection and disposable local
  measurement. It does not authorize product implementation, publication,
  commits or a pull request.
- Delivery is this complete executable plan, its pre-acceptance performance
  evidence and a design execution record in the review ledger.
- A later implementation pass owns product edits, release artifacts and final
  production-path proof.

## Scope

In scope:

- `readAuthoredFormatSnapshot` and the minimum projection-only read surface the
  benchmark can justify.
- Authored diagnostics that distinguish pending changes from conflicts.
- Capture lifetime for HTML, Markdown, DOCX and the export menu.
- `isAuthoredEditor` as a sound optional-plugin runtime guard.
- Export menu trigger ownership.

Out of scope:

- Suggestion mode accepting edits without a current author. That is a real
  authored/suggestions defect and belongs to a separate review because it
  changes proposal admission rather than export projection.
- PDF, image and print export.
- General codec-fidelity work unrelated to authored projection.
- Comments, import and AI behavior except direct adoption of the settled
  authored read helper.

Preserve:

- The canonical authored envelope and accepted/proposed projection semantics.
- Retained source, comments, roots, schema and authored coalescing rules.
- Existing format-specific serializers and their package ownership.

## Hard laws

1. An export action captures its authored input synchronously before the first
   `await`; every result and diagnostic for that action derives from that one
   capture.
2. Delete `readAuthoredFormatSnapshot(editor, { review })`. A caller-supplied
   review document plus live accepted/proposed views can describe different
   revisions.
3. Accepted and proposed projections remain valid when conflicts exist, but
   diagnostics must distinguish pending authored changes from conflicts.
4. Review exports preserve the authored envelope. A target format that cannot
   represent a conflict faithfully must return an explicit failure instead of
   inventing a revision or silently flattening it.
5. The public owner is authored projection. HTML, Markdown and DOCX remain
   format adapters; the registry menu remains UI composition.
6. `isAuthoredEditor` proves the active editor runtime has authored support. A
   method-name collision is insufficient.
7. The menu primitive owns open-state toggling. The export trigger supplies
   semantics and does not duplicate pointer/keyboard state transitions.

## Current evidence

- The optional `review` argument mixes supplied review data with projections
  created from the live editor.
- HTML can build a live authored view and read it after asynchronous stylesheet
  work, so one click can observe multiple revisions.
- DOCX captures after its module has loaded, while the menu awaits that import
  before entering the adapter.
- Conflict-only authored documents currently look clean because the snapshot
  reports pending changes only.
- A 1,000-paragraph clean fixture materializes 2,000 markup segments even when
  a caller needs only one projection and diagnostics. Work count alone does not
  justify a second API, so this plan freezes and runs a performance comparison
  before accepting one.
- `isAuthoredEditor` can accept an object with a colliding method name.
- Mouse activation can leave the export menu open forever while Space happens
  to toggle it, showing two competing state owners.

## Pre-acceptance performance contract

The contract is frozen before target measurement.

### Operation and candidates

- User operation: synchronously capture one accepted or proposed document plus
  the retained review document and unresolved-status counts.
- Baseline: the current full `readAuthoredFormatSnapshot(editor)` path.
- Disposable candidate: capture `editor.read.value()` once and call the
  existing authored admission/projection owner directly, without materializing
  markup or properties.
- Deterministic counters: baseline accepted/proposed markup segments versus
  candidate markup/property segments; document node count is fixed per cohort.

### Cohorts and samples

| Cohort | Clean paragraphs | Warmups | Samples | Purpose |
| --- | ---: | ---: | ---: | --- |
| Normal | 100 | 10 | 50 | Common document |
| Large | 1,000 | 10 | 50 | Existing observed scale |
| Stress | 5,000 | 10 | 25 | Scaling decision |
| Pathological | 10,000 | 10 | 12 | Diagnostic ceiling only |

- Run baseline and candidate on the same editor, source revision, schema and
  payload; alternate order by sample.
- Report p50, p95 and max latency plus absolute and relative difference.
- Run exact-result guards on clean and pending-change fixtures before timing.

### Frozen acceptance budget

- Accepted/proposed documents and unresolved counts must match on clean and
  pending fixtures.
- Candidate work must materialize zero markup/property segments.
- Normal p95 must not regress by more than 0.20 ms or 10%, whichever is larger.
- Large p95 must improve by at least 30% and 1 ms.
- Stress p95 must improve by at least 30% and 5 ms.
- Pathological results are diagnostic and cannot overturn a failure in an
  applicable cohort.
- One packet is conclusive only when p50 and p95 point in the same direction
  and the applicable thresholds clear with margin. Otherwise run one identical
  second packet and report both.

### Applicable benchmark lanes

| Lane | Applies | Planned evidence |
| --- | --- | --- |
| Source readiness | Yes | Source hashes, Bun/runtime and machine identity |
| Owner microbenchmark | Yes | Current full snapshot versus disposable targeted capture |
| Large/stress scaling | Yes | 1,000, 5,000 and 10,000 paragraph cohorts |
| Cold startup | No | This decision concerns a synchronous hot read after editor creation |
| Browser interaction | No | No rendering, pointer, keyboard or network owner is under comparison |
| Persistence/network | No | Both candidates are local pure reads |
| Production detector | No | No production-path implementation exists in this planning pass |

## Architecture under comparison

| Concern | Hard-cut target | Why |
| --- | --- | --- |
| Snapshot source | Delete caller-supplied `review` | One revision cannot have two sources |
| Clean projection | Keep full snapshot unless the frozen benchmark earns a targeted helper | Avoid speculative API |
| Review materialization | Keep explicit full snapshot | Review export needs markup/properties |
| Status | Capture pending and conflicted counts separately | Conflict is unresolved but not pending |
| HTML | Serialize from captured data only | Stylesheet awaits cannot move the source revision |
| Markdown | Serialize the captured document/envelope | Same revision law as HTML |
| DOCX | Fail tracked-review export on conflicts | Word revisions cannot honestly encode unresolved authored conflict |
| Menu | Capture before any dynamic import or other await | Import latency must not change the revision |
| Optional guard | Check the active authored plugin/runtime owner | Structural name collision is unsound |
| Trigger | Delete duplicate open-state `onClick` | Radix/menu primitive owns mouse and keyboard toggling |
| Proposal identity | Move to a separate authored/suggestions review | Different invariant and owner |

## Conflict policy

- Every capture reports `pending` and `conflicted` counts separately.
- Accepted/proposed JSON, HTML, Markdown and DOCX exports remain available and
  report projection diagnostics when unresolved authored changes exist.
- Review JSON, HTML and Markdown retain the canonical authored envelope. Their
  visible proposed body reports that conflicts require resolution.
- Review DOCX returns `ok: false` with a dedicated conflict diagnostic whenever
  `conflicted > 0`. It does not flatten, choose a side or emit invented Word
  revisions.
- The menu treats pending and conflicted records as unresolved, keeps accepted
  and proposed choices available, and surfaces the adapter result for tracked
  DOCX instead of pre-claiming success.

## Public API decision rule

Always delete the split-source form:

```ts
readAuthoredFormatSnapshot(editor, { review });
```

Retain the full materializing form:

```ts
const snapshot = readAuthoredFormatSnapshot(editor);
```

The benchmark passed its frozen normal, large, stress, work and correctness
budgets. Adopt one synchronous immutable helper with no live view, cache or
export ownership:

```ts
type AuthoredProjectionSnapshot = Readonly<{
  document: EditorDocumentValue;
  review: EditorDocumentValue;
  unresolved: Readonly<{
    conflicted: number;
    pending: number;
  }>;
}>;

const capture = readAuthoredProjection(editor, {
  projection: 'proposed',
});

capture.document;
capture.review;
capture.unresolved.pending;
capture.unresolved.conflicted;
```

`review` and `document` derive from one captured editor value. The helper is a
projection read, not a second checkpoint model. The full snapshot remains the
only API that materializes review markup and properties. No compatibility alias
is kept on `next`. The accepted public result name is
`AuthoredProjectionSnapshot`; do not add `captureAuthored*`, `ExportSnapshot`
or a generic format result.

## Adoption slices

### 1. Plite authored capture correctness

- Delete the split-source snapshot option and migrate every caller.
- Repair `isAuthoredEditor` against the canonical active runtime owner.
- Split pending/conflicted status in full snapshots.
- Add `readAuthoredProjection` only if the frozen benchmark passes.
- Add focused public-boundary tests for one-revision capture, conflict status,
  guard rejection and projection equivalence.

### 2. Format adapters

- HTML accepts captured authored input before stylesheet or asset awaits.
- Markdown consumes the captured document or retained review envelope.
- DOCX accepts captured input, distinguishes pending/conflicted diagnostics and
  returns an explicit review-conflict failure.
- JSON reports the same unresolved classification.
- Keep neutral serializers reusable; authored convenience wrappers own capture.

### 3. Export menu

- Capture the chosen projection before any dynamic import; replace a dynamic
  import with a static import if that is the smallest way to enforce the law.
- Show accepted/proposed controls whenever pending or conflicted changes exist.
- Report tracked-DOCX conflict failure through the existing toast/result path.
- Delete the trigger's manual open-state `onClick`; preserve primitive keyboard,
  pointer and focus behavior.
- Verify trigger behavior before adapter migration so UI proof has one owner.

### 4. Docs, generated surfaces and release artifacts

- Update English and Chinese export docs to state accepted, proposed and review
  behavior under pending changes and conflicts.
- Update authored API docs/examples for the final helper shape.
- Run `pnpm brl` if public exports or exported file layout change.
- Add package changesets for published Plite/Plate API or runtime behavior and a
  registry changelog for the copied export menu. Load the owning skills during
  execution; do not substitute one artifact for the other.
- Update versioned doctrine only if implementation changes the durable law
  rather than merely adopting this recorded decision.

### 5. Final proof and history

- Rerun this exact performance contract on the final production source and
  record source identity.
- Run focused authored/export tests, owning package typechecks, registry build
  and checks, and browser verification of the menu and captured revision.
- Inspect generated HTML and DOCX artifacts rather than relying only on toast or
  converter return values.
- Record the implementation execution in the review ledger only after the
  authorized product work and proof complete.
- Run repository `lint:fix` last, then rerun only checks invalidated by it.

## Execution proof matrix

| Surface | Required implementation proof |
| --- | --- |
| Plite authored API | Focused tests plus source-first Plite typecheck |
| HTML/Markdown/DOCX | Projection/conflict fixtures and artifact inspection |
| Registry menu | `www` typecheck/lint, registry generation/check and browser pointer/keyboard proof |
| Public exports | `pnpm brl` and generated barrel diff when applicable |
| Release metadata | Changeset check and registry changelog check when applicable |
| Performance | Same harness, cohorts, budget and correctness guards on final source |

## Design acceptance

- [x] Frozen current-versus-target benchmark is executed and recorded.
- [x] Targeted projection API is accepted or rejected by that evidence.
- [x] One-revision capture law and split-source deletion are explicit.
- [x] Conflict behavior is explicit for every projection family and review DOCX.
- [x] Optional guard and menu trigger have canonical owners.
- [x] Adoption, deletion, proof and release-artifact work is sequenced.
- [x] Suggestion author admission is preserved as a separate unresolved scope.
- [x] Review-ledger design execution is recorded and the ledger check passes.

## Release classification

The eventual implementation is published package API/runtime behavior plus a
registry UI change. It therefore requires package changesets for affected
published packages and a registry changelog entry. This planning-only diff is
documentation/research evidence and needs no release artifact.

Open risks:

- Mapping accepted/proposed diagnostics to a captured revision can regress if a
  format adapter retains an editor view instead of immutable data.
- DOCX callers may assume review export always succeeds; the explicit conflict
  failure requires complete caller migration.
- A targeted helper can become a second snapshot ontology if it starts owning
  markup, properties, caches or format policy. The API boundary forbids those.
- The direct runtime identity needed by `isAuthoredEditor` may expose a deeper
  optional-plugin typing gap; keep that repair inside authored ownership rather
  than weakening the guard.

Verification evidence:

- The disposable benchmark and exact-result guards are recorded in
  [`projection-performance.receipt.md`](./artifacts/2026-09-24-exports-review/projection-performance.receipt.md)
  and its executable JSON packet. All frozen budgets passed. At 1,000
  paragraphs, p95 fell from 3.220 ms to 0.701 ms (78.2%); at 5,000 paragraphs,
  it fell from 12.247 ms to 3.371 ms (72.5%). The candidate materialized zero
  markup/property segments.
- The result accepts `readAuthoredProjection` and rejects caches, projection
  stores and a generic export owner. One packet is conclusive because p50 and
  p95 agree in every cohort and both material thresholds clear by wide margins.
- The review-ledger execution record binds this complete design to
  `2026-09-24-exports-model-switch-final-audit`. Ledger render/check and the
  Autogoal completion checker are closure gates for this planning pass.

Next action:

Execute slices 1–5 under fresh product-change authority, preserving this
benchmark contract and stopping the exports work from absorbing the separate
suggestion-author admission defect.

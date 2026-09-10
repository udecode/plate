# Authored changes: skill audit and design corrections

**Pursue native authored-change semantics. Do not approve the proposed Revisions subsystem or call the assessment implementation-ready.** The first pass supported removing Plate's mutation engine, but underexamined its own replacement owner, existing state/effect infrastructure, concurrent decisions, and performance acceptance criteria.

This follow-up applies the relevant review methods. It does not claim that the downstream Best API, Architect or Plite Plan execution workflows are complete. No replacement implementation, independent model review, browser proof or architecture benchmark has run.

**The strongest additional cut**

Apply the same deletion test to the proposed `Revisions` owner. Plite already publishes changes, state and effects in one transaction. Persisted state fields use the document's versioned `meta` envelope; effects already have inversion, mapping, codecs and collaboration policies. History records effects alongside document changes. Yjs transports shared effects and has checkpoint/late-join handling. These owners must be reused or repaired before adding another store, serializer, history stack or transport protocol.

The missing jobs are narrower: capture authored intent across every supported mutation path before publication; represent editable pending content and retained deletions; map review positions; decide dependent changes; and retain trustworthy authorship when requested. A neutral opt-in review capability can earn an entrypoint for those jobs. A universal subsystem coupling review, local undo, permanent audit storage and AI sessions does not.

Existing primitives must earn reuse too. If the required schema or causal laws cannot fit `DocumentChange`, redesign or replace that owner instead of building a second algebra above it. The source-backed Yjs 14 attributed model remains a comparison reference; migration effort alone cannot disqualify a better substrate.

Do not make retained full history a prerequisite for suggestions. Authorship capture, pending review and archived revisions share identifiers and changes but have different retention needs. An ordinary editor should not allocate a review projection or accumulate an unbounded event archive.

**A decisive current-source limitation**

The existing infrastructure is useful, but a shared state field is not a concurrent proposal collection. The [two-peer probe](sources/shared-field-probe.mjs) starts from one shared document, independently replaces one field with Alice's or Bob's record list, synchronizes twice and allows queued work to run. The peers have matching Yjs state vectors and document JSON, yet their editor fields contain different single-record lists. Accepted text remains unchanged. See the [observed result](sources/skill-audit-shared-field-probe.log).

This is a reproduction of a current limitation, not a passing review-storage test. It also separates two failures: replacing an entire list cannot preserve independent additions, and this interleaving leaves the active field projections divergent. The [field reducer](../../../../packages/plitejs/src/core/state-field.ts) assigns incoming replacement values; the [Yjs controller](../../../../packages/plitejs/src/yjs/core/controller.ts) applies remote effects to local state. Do not claim convergence or per-record conflict handling merely because the underlying Yjs document converges.

The focused existing document-meta, history and shared-effect-compaction contracts passed **31 tests**, with 865 unrelated tests filtered out. They establish useful existing facilities, not the missing concurrent proposal semantics. The new probe deliberately retains its convergence assertion and exits with failure on current source. The original two Suggestion observations were rerun after a captured source fingerprint changed; both reproduced. Commands, logs and source hashes are retained with this audit.

**Decisions the next design must settle**

| Decision | Required correction |
| --- | --- |
| Physical representation | Keep two complete candidates: accepted content plus a change graph and editable projection; or one revision-aware tree with retained content and visibility projections. Both can satisfy logical accepted/pending separation. Neither has won a correctness or cost comparison. |
| Reuse of Plite | Extend `DocumentChange`, transaction publication, state/effects and existing codecs where they fit. A whole-record shared field is insufficient. Specify mergeable per-record operations and a deterministic conflict rule, or a narrower coherent authority. |
| Identity | Separate human author, device/actor, semantic change group, durable revision and reviewer decision. An editor-local version counter, runtime `NodeKey`, update annotation or current-user option is not durable authenticated identity. |
| Decision atomicity | Freeze selected IDs at a durable revision. A duplicate decision request has the same outcome; accept-versus-reject races resolve deterministically or return a stale/conflict result. No partial batch, silent dependency cascade or success inferred from a local optimistic update. |
| Multi-view input | Bind suggesting intent to the originating input/view or explicit programmatic transaction. Remote changes preserve their source intent. One view's suggesting mode must not relabel another view's accepted edit. Shared review data outlives any one mounted view. |
| Persistence | Prefer the existing coherent document envelope and codec owner. Define reload, unknown-version handling, atomic checkpoint/tail writes and interrupted saves. Content and pending decisions cannot be independently saved with unrelated versions. |
| Retained history | Keep local undo, pending decisions and durable history distinct. State what survives pruning and reload; revert accepted work as a new authored change. Never silently lose pending review payloads during history compaction. |
| Product behavior | Define editing one's own pending text, editing another author's insertion, commenting inside pending/deleted content, grouping/splitting suggestions, decision undo and accepted/review clipboard/export behavior. Broad Google Docs API views do not settle these interaction details. |

The load-bearing correctness fact is **a decision preserves every independent contribution and both document projections, or refuses before publication**. That fact remains unproven for either candidate. The Alice-inserts/Bob-edits dependency family remains the first structural oracle; independent concurrent additions and conflicting reviewer decisions must accompany it.

`DocumentChange.transform` is an existing pairwise mechanism, not proof of this law. Its current implementation explicitly rejects conflicting root-lifecycle changes. A review engine must expose supported structure and conflict behavior rather than swallowing such failures or assuming that every change can be safely inverted later.

**Performance review**

- Applicability: applied. The proposal changes projection, indexing, retained state and input work.
- Vercel rules used: none. No React implementation or micro-optimization is selected; Plate UI and the native runtime own the relevant lifetimes.
- Extra rules used: cohort segmentation, repeated-unit budget, interaction INP matrix, memory/DOM tagging, degradation contract and editor-native proof.
- Repeated units: document blocks/leaves, pending changes and dependency edges, retained history records, mounted views and visible review cards.
- Cohorts: normal 100 blocks/100 pending changes; large 1,000/1,000; stress 10,000/10,000. Add zero-review controls and pathological overlapping/nested structural proposals. Vary retained history and one/two mounted views independently; block count alone is insufficient.
- Proposed budgets to freeze before measurement: normal/large event-to-paint p95 at most 50 ms and p99 at most 100 ms; enabling review with zero pending changes adds at most 10% or 1 ms to baseline interaction latency, whichever allowance is larger. These are proposed acceptance thresholds, not measurements or existing product guarantees. Stress results must be reported separately and cannot inherit the normal/large claim.
- Deterministic budgets: no full-document diff, full-history replay or whole-proposal serialization for a localized edit; no per-proposal global listener; no per-view copy of canonical pending state. Record affected dependency closure, visited nodes, rebased changes, allocations and subscriber notifications. A real dependency closure may be large; hiding that work does not make it constant.
- Memory budgets: zero-review control retains at most 10% more heap than the same editor without review; at the same supported workload, candidate retained heap must stay within 1.5 times the current owner. Record before-content and retained-history bytes separately so deleting required data cannot produce a false win. These bounds remain proposed until the probe contract is frozen.
- React/runtime primitives: no scheduler or React primitive selected. Input and caret updates remain urgent; optional cards may derive keyed reads. A second mounted view adds presentation resources, not another canonical review engine.
- Interaction metrics: p50/p75/p95/p99 for typing, selection then typing, paste, accept/reject single and bulk, decision undo/redo, remote update, reload and explicit export. Use event-to-paint as the lab proxy; measure checkpoint serialization separately from keystroke work.
- Sampling/noise: freeze hardware/browser/source/fixtures; alternate baseline and candidate runs, warm up first, retain raw samples and repeat runs. If run-to-run variation crosses the chosen regression allowance, classify the result inconclusive. Correctness failures disqualify a candidate regardless of timing. Compare performance only over inputs supported by both arms; keep unsupported baseline cases in the correctness ledger.
- Trace/CWV proof: interaction traces and main-thread stalls are required for the eventual browser claim. Page-load CWV is outside this model comparison unless route loading changes.
- Memory tags: heap, retained payload bytes, DOM nodes, mounted cards/components, listeners, subscriptions, cached position/index entries, overlap depth and dependency count.
- Degradation contract: native editing for normal and large cohorts. Review must not silently remove browser find, screen-reader traversal, copy/paste, selection or IME behavior. No virtualization or staged fallback is accepted by this assessment.
- Dashboard/RUM gap: no production evidence. A future production claim needs interaction/cohort/mode/browser/release/IME tags and privacy-safe counters; no document contents or author IDs in telemetry.
- Plan delta: the earlier metric list becomes a falsifiable comparison contract. Runtime acceptance remains open until the budgets, exact candidate command and native guards are frozen and executed.

**Proof ownership and readiness**

| Proof family | Owner and required surface | Current status |
| --- | --- | --- |
| Change and decision laws | Plite package contracts: concurrency, dependency closure, schema validity, duplicate/stale decisions, serialization and compaction. | Existing facilities tested; authored-review candidates absent. |
| Native input and view lifetime | Verify Plate on canonical Plite examples and the affected Plate discussion/editor routes: real selection endpoints, IME, clipboard, follow-up typing, two views of one model and two independent editors. | Not run for a replacement. Viewport or synthetic input cannot prove OS/device behavior. |
| Product adoption | Plate Suggestion, AI updates, copied Discussion/Comment UI, persistence consumers and exporters. Enumerate the full affected consumer set before deletion. | Ownership traced; complete migration denominator and final call sites are not established. |
| Public types | Best API and package type contracts: inferred callbacks, installed capabilities, distinct durable/runtime identities, explicit position projections and validated serialized input. | Contract requirements recorded; no final API or type proof exists. |
| Scale | Benchmark's embedded baseline/candidate probe, with source-bound fixtures, budgets and native guards. | Required; no prototype or runtime target accepted. |

A new browser runner, invented feature inventory, blanket test sweep or Autoreview run would not close these gaps. Use the existing owners. Preserve the original failing probe and distinguish a reproduced limitation from a product pass.

**Relevant skills accounted for**

| Method | What it changed in this review |
| --- | --- |
| [Best API Review](../../../../.agents/skills/best-api-review/SKILL.md) and [Best API](../../../../.agents/skills/best-api/SKILL.md) | Applied the hard-cut test to the proposed owner; kept one Pursue verdict and withheld runtime/API acceptance. |
| [Plate Plan](../../../../.agents/skills/plate-plan/SKILL.md) and [Plite Plan](../../../../.agents/skills/plite-plan/SKILL.md) | Separated neutral revision mechanics from Plate policy and required concurrency, multi-view, persistence and adoption proof. Their downstream plan workflows were not started. |
| [Architect](../../../../.agents/skills/architect/SKILL.md) | Applied grounding, two distinct whole-model sketches and module-depth/red-flag checks. No synthesized implementation contract or Arena completion is claimed. |
| [How](../../../../.agents/skills/how/SKILL.md) and [Why](../../../../.agents/skills/why/SKILL.md) | Rechecked current state/effect/transport flow and the explicit Comments motivation. Used the supplied plans for rationale; no wider historical or seven-source investigation is claimed. |
| [Blast Radius](../../../../.agents/skills/blast-radius/SKILL.md) | Replaced an assumption about reusable shared storage with the two-peer executable counterexample. The replacement's safety law remains unproven. |
| [Benchmark review](../../../../.agents/skills/benchmark/references/performance-review.md) | Added cohorts, repeated-unit and memory budgets, p99, native degradation policy and production evidence limits. No measurement workflow was started. |
| [Verify Plate](../../../../.agents/skills/verify-plate/SKILL.md) and [Testing](../../../../.agents/skills/testing/SKILL.md) | Selected focused existing contracts and preserved the separation between model, native input, performance and migration proof. |
| [TypeScript Best Practices](../../../../.agents/skills/typescript-best-practices/SKILL.md) | Required inferred installed capabilities, validated external data and discriminated decision outcomes; the review does not pretend the proposed public types are proven. |
| [Plate UI](../../../../.agents/skills/plate-ui/SKILL.md) and [Plate Plugin Creator](../../../../.agents/skills/plate-plugin-creator/SKILL.md) | Applied the relevant package/view/identity laws: no app binding provider, no serialized runtime keys, exact-view UI policy and one package-owned data lifecycle. No component or plugin implementation workflow was started. |
| [Plite Research](../../../../.agents/skills/plite-research/SKILL.md) | Preserved the bounded survey, evidence grades and unchanged external denominator; appended local findings instead of claiming another broad search. |
| [Poteto Mode](../../../../.agents/skills/poteto-mode/SKILL.md) | Used Investigation and the applicable principle leaves. Model the Domain separated review, undo and archive; Exhaust the Design Space kept two representations open; Type System Discipline separated identities/decision outcomes; Make Operations Idempotent added duplicate and concurrent decision laws; Redesign from First Principles challenged the proposed owner too. |
| [Technical Writing](../../../../.agents/skills/technical-writing/SKILL.md), [Show Me Your Work](../../../../.agents/skills/show-me-your-work/SKILL.md) and [Autogoal](../../../../.agents/skills/autogoal/SKILL.md) | Corrected the assessment in place, preserved source limits and prior evidence, and recorded this follow-up's obligations and actual results. |

There are 19 named skills in this coverage table, plus five applied principle leaves, scoped to the stated review work. User instructions require sequential work; no independent-agent result is claimed. Autoreview is prohibited on `next`. Interrogate, Arena, implementation, doctrine repair, release and publication are not completed gates; they are outside this review. Editor Audit and Issue Harvester were not invoked because this is a bounded research survey, not exhaustive editor or issue certification.

**Next owner**

```text
$best-api design native authored changes over DocumentChange, EditorCommit and existing state/effects: settle durable identity, concurrent per-record operations and dependency-aware decisions before selecting a review entrypoint or serializer; compare accepted-base and woven representations under the same native and scale oracle.
```

The review is complete when its corrections and evidence are checked. The runtime proposal remains provisional. No user input is required to finish this assessment.

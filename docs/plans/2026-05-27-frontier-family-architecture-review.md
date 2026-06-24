# Frontier Family Architecture Review

Objective:
Close the Frontier-family architecture review for user review. Inspect the
cloned `siliconjungle/-shapeshift-labs-frontier*` repos, decide what Plite
and Plate should steal, reject, or depend on, and keep the lane open until the
scheduled Plite Plan passes prove the decision with issue accounting, research
refresh, pressure passes, objections, and final gates. Passes 1-12 are closed.
No planning pass remains runnable.

Goal plan:
docs/plans/2026-05-27-frontier-family-architecture-review.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- User-review-ready plan with total score >= 0.92 and no dimension below 0.85.
- Every pass row must be complete or intentionally skipped with evidence.
- Issue/reference sync rows must be closed before any final claim.
- Every Plite runtime/browser/API claim must cite live `Plate repo root`
  source or command proof.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-frontier-family-architecture-review.md`
  must pass only in the final closure pass.

Verification surface:
- Planning evidence runs from `plate-2`.
- Frontier evidence is local cloned source under `/Users/zbeyens/git`.
- Plite current-shape evidence is live source under `Plate repo root`.
- No Plite implementation or browser behavior is claimed in pass 12.

Constraints:
- Planning mode only for this activation.
- Do not patch Plite runtime code until the user accepts a ready plan and
  invokes execution.
- Keep raw Plite unopinionated. Plate owns product-shaped APIs.
- Prefer first-party Plite primitives over runtime dependencies when the model
  needs Plite paths, operations, roots, refs, selection, history, or
  collaboration semantics.

Boundaries:
- Allowed edits in planning mode: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.
- Reviewed local repos:
  `/Users/zbeyens/git/-shapeshift-labs-frontier*`.
- Reviewed live Plite source:
  `packages/plite`,
  `packages/plite-react`, and
  `packages/plite-history`.
- Reviewed Plate pressure:
  `packages/core/src/react/stores/element`,
  `docs/performance/editor-performance-master-plan.md`, and
  `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts`.

Blocked condition:
- Block only if the Frontier repos or live Plite checkout become
  unreadable, or if a later pass requires a user product boundary that cannot be
  inferred from existing repo evidence.

Plite Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete

Current verdict:
- verdict: steal ideas, do not add a runtime dependency to Plite core
- confidence: 0.92 after pass 11
- keep / cut / revise call: keep Plite's operation/root/history model, add
  first-party compact state-patch and replay tooling inspired by Frontier,
  route opinionated mutation-plan DX to Plate, keep Frontier only as a possible
  dev/benchmark comparator, and reject Frontier CRDT/richtext as replacement
  substrates
- reason: Frontier is a strong JSON/state-diff toolkit, but Plite already has
  root-aware operations, state patch hooks, runtime-id dirtiness, and
  operation-based history. Pulling Frontier into core would duplicate parts that
  must stay Plite-specific and weaken selection/history/collab semantics.
- issue discovery call: do not run a fresh ClawSweeper sweep in pass 2. Existing
  generated/manual ledgers and fork dossier sections already cover the touched
  issue families: repeated update performance, large-document cut performance,
  history scope/memory, collaboration/Yjs pressure, synced/content-root DX, and
  non-node state-field architecture. This pass changes no issue claim text.
- issue-ledger pass call: no new fixed/improved/related claim text in pass 3.
  The full support-file scan expands the local plan matrix only and preserves
  existing classifications for performance, React runtime, projection,
  dynamic-decoration, history, collaboration, and content-root rows.
- intent-boundary call: pass 4 resolves the ownership split. Plite can decide
  first-party state-field patch/replay primitives, state-field-local watch
  routing, and proof artifacts. Plate owns product-shaped mutation plans. A
  Frontier package dependency is not justified for core runtime and can only be
  reconsidered as isolated dev/benchmark tooling after future proof.
- research/source refresh call: pass 5 confirms the owner split against the
  compiled React/Lexical/ProseMirror/Tiptap/Yjs research layer, local upstream
  source reads, live `Plate repo root` state/tx/state-field/history/selector
  source, live Plate selector and AI-suggestion source, and refreshed Frontier
  source reads. No contradiction found. Remaining weakness is proof, not
  research direction.
- pressure call: pass 6 keeps the architecture but narrows execution. First
  priority is a Plite-owned compact state-field patch/replay helper with
  large-state history/collab proof. State-field-local routing is conditional on
  a benchmark showing key-level fanout is actually red. Plate mutation plans are
  valuable, but they stay a separate Plate API lane. Frontier remains out of
  runtime deps; at most it can be an isolated dev/benchmark comparator.
- maintainer objection call: pass 7 keeps the hard cuts. The strongest
  maintainer objection is not "use Frontier" but "do not expose broad new APIs
  before proof." The plan now treats the compact state-patch helper as the first
  Plite execution candidate but keeps public API exposure proof-gated, keeps
  state-field routing benchmark-gated, keeps Plate mutation plans Plate-only,
  rejects Frontier CRDT/richtext/runtime adoption, and requires collaboration
  and native-behavior proof before any behavior claim.
- high-risk deliberate call: pass 8 keeps the plan but adds veto gates for the
  ugly failures: compact patches can corrupt undo/redo/collab replay, routing
  can become a second render engine, mutation plans can become a raw Plite DSL,
  benchmark wins can hide native behavior regressions, and devtools can leak
  into runtime architecture. Execution must prove roundtrip, inverse, replay,
  fanout, native behavior, migration, and docs/example rows before shipping.
- ecosystem maintainer call: pass 9 keeps the plan and tightens adoption. Plugin
  authors stay on state-field descriptors and do not wrap every core call.
  Plate gets an internal-first mutation-plan lane that compiles to existing
  transforms. slate-yjs keeps Yjs, relative positions, awareness, remote-origin
  history policy, and provider-owned conflict behavior. Browser/runtime,
  docs/example, and benchmark owners get explicit release gates instead of
  promises.
- revision call: pass 10 folds the pass pile into one execution order. The
  first accepted execution artifact is a Plite compact state-field patch helper,
  internal-first and public only after proof. Replay/profile stays dev/proof
  tooling. State-field routing is benchmark-gated and may be skipped. Plate
  mutation plans are a separate Plate lane. Frontier remains dev/comparator
  only, never runtime.
- issue sync accounting call: pass 11 adds one manual gitcrawl sync note for
  this Frontier review and keeps the PR reference and issue coverage matrix
  otherwise unchanged. There are zero new fixed issue claims, zero new improved
  issue claims, zero new related rows, and no PR-body addition. Existing
  state-field, performance, content-root/projection, history, collaboration,
  and Plate/product-boundary rows already own the relevant issue pressure.
- closure call: pass 12 closes the planning lane. The scorecard is at 0.92 with
  no dimension below 0.85, every scheduled pass is complete, issue/reference
  sync is closed, the handoff is recorded, and no Plite implementation or
  browser behavior is claimed by this planning goal.

Completion rule:
- Do not call `update_goal(status: complete)` while any pass after pass 1 is
  pending.
- Do not call `update_goal(status: complete)` until the closure/final-gates pass
  is the active pass and all gates below are closed.
- This file plus the active goal are the durable lane state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `.agents/skills/slate-plan/SKILL.md`; one-pass-only policy applied. |
| Active goal checked or created | yes | `get_goal` returned active goal `019e5f10-3661-7312-a67b-66daf0a1aa99`. |
| Source of truth read before edits | yes | Read research index/log, issue ledgers, Frontier source, live Plite source, and Plate perf/source owners. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Planning-only architecture review; no implementation patch in this activation. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current owners cited in scorecard, runtime target, and verification table. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected; passes 1-12 are closed across
      separate activations, and no planning pass remains runnable.
- [x] Live source grounding recorded for pass-1 current implementation claims.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] High-risk deliberate-mode pre-mortem and proof plan complete for patch
      replay, routing, Plate mutation plans, collaboration, native behavior,
      and dev/proof tooling.
- [x] Ecosystem maintainer pass complete for plugin authors, Plate,
      slate-yjs/collab, browser-runtime, docs/example, and benchmark owners.
- [x] Revision pass complete: execution order, API posture, docs/example
      posture, benchmark gates, and stale/open wording consolidated.
- [x] Issue sync accounting complete: manual gitcrawl sync note added, PR
      reference intentionally unchanged, issue coverage matrix intentionally
      unchanged, and claim deltas recorded as zero.
- [x] Verification workspace gate recorded for pass-1 source claims.
- [x] TDD marked N/A for pass 11 because there is no behavior patch.
- [x] Browser proof marked N/A for pass 11 because no browser behavior is
      claimed.
- [x] Closure pass complete: lane state is closed, final handoff is recorded,
      score threshold is met, issue/reference sync is closed, and verifier
      evidence is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete pass 12 and final plan check | passes 1-12 closed; score 0.92; final handoff recorded |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` command/proof for any behavior claim | passes 1-12 record source/ledger/plan pointers only; no runtime/browser/API change claimed |
| Issue ledger or PR reference changed | yes, ledger note only in pass 11 | Update ledger and record PR-reference decision | gitcrawl sync ledger updated; PR reference and issue coverage matrix intentionally unchanged |
| Autoreview for uncommitted implementation changes | N/A | No implementation patch in pass 12 | planning-only |
| Final user-review handoff | yes | Emit only after closure pass | recorded in final handoff outline and closure sections |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-frontier-family-architecture-review.md` | final verifier run recorded in verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Frontier repos cloned; package/source map read; live Plite and Plate owners cited | related issue discovery |
| Related issue discovery | complete | Reused existing live/manual ledgers and fork dossier rows for #6038, #5992, #5771, #5533, #5515, #5212, and #3752; no new ClawSweeper run because classifications already exist and no claim text changes | issue-ledger pass |
| Issue-ledger pass | complete | Scanned `issue-clusters`, `requirements-from-issues`, `package-impact-matrix`, `benchmark-candidate-map`, v2 coverage matrix, fork dossier, PR reference, and gitcrawl sync ledger; expanded issue matrix without changing claim statuses | intent/boundary pass |
| Intent/boundary and decision brief | complete | Rewrote the ownership boundaries and decision brief: Plite first-party state/replay primitives, Plate mutation-plan DX, dev-only Frontier comparator, rejected CRDT/richtext/cache/realtime runtime adoption | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Read React 19.2, Lexical, ProseMirror, Tiptap, Yjs/slate-yjs, and Plite research pages; checked local upstream source handles; refreshed live Plite/Plate/Frontier source pointers; no owner-boundary contradiction found | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Applied Vercel React, performance-oracle, performance, tdd, react-useeffect, and shadcn lenses; added cohorts, repeated-unit budgets, INP/memory/native-behavior proof rows, execution priority, and cut/defer calls | objection ledger |
| Plite maintainer objection ledger | complete | Steelmanned maintainer objections against every proposed steal/cut: state-patch helper, routing, no runtime dependency, Plate split, CRDT/richtext rejection, replay tooling, public API exposure, and native behavior proof | high-risk pass |
| High-risk deliberate mode | complete | Added realistic failure scenarios, expanded unit/browser/parity/stress/migration/docs proof plan, blast-radius table, rollback/hard-cut answers, and no-ship veto gates | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Added plugin/Plate/slate-yjs/browser/docs/benchmark owner answers, affected extension points, migration-backbone surfaces, collab contracts, and closure proof rows | revision pass |
| Revision pass | complete | Consolidated the pass outputs into a final execution order, proof-gated API posture, docs/example posture, benchmark gate policy, and revised decision/open-question wording | issue sync accounting |
| Issue sync accounting | complete | Added the Frontier review planning sync to `docs/plite-issues/gitcrawl-v2-sync-ledger.md`; verified PR reference non-claim language and issue coverage rows remain correct; recorded zero fixed, improved, related, and PR-body deltas | closure score and final gates |
| Closure score and final gates | complete | Score is 0.92, no dimension is below 0.85, issue/reference sync is closed, final handoff is recorded, and lane state has `next_pass: none` / `next_action: none` | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.91 | Pass 10 turns performance posture into a release gate: React profile wins count only with selector fanout, state-field notification, event-to-paint, memory/subscription, and native behavior rows. Pass 11 preserves existing performance issue statuses: `#6038`, `#5992`, `#5945`, `#4056`, `#3752`, `#5131`, `#2051`, `#2195`, `#2405`, and `#790` are not promoted by Frontier comparator ideas. |
| Plite-close unopinionated DX | 0.20 | 0.92 | Pass 10 consolidates the DX story: raw Plite keeps state fields and hooks; the compact helper is internal-first; public API exposure needs one failing proof row, one real call site, and one docs/example row. No Frontier-branded API and no raw Plite mutation DSL. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Pass 10 keeps downstream migration crisp: Plate mutation plans are a separate Plate lane over existing transforms; slate-yjs keeps Yjs/relative-position/awareness ownership; replay/model-check tooling supports those owners rather than replacing them. |
| Regression-proof testing strategy | 0.20 | 0.92 | Pass 11 closes issue/reference sync without broadening claims: the manual gitcrawl sync note records zero fixed, improved, related, and PR-body deltas; existing non-claim gates still require benchmark, browser, collab, native behavior, and release proof before execution can change issue status. |
| Research evidence completeness | 0.15 | 0.92 | Pass 11 ties the final architecture decision back to the live issue accounting: PR reference non-claim language, issue coverage matrix rows, and gitcrawl sync rows now explicitly preserve state-field, performance, content-root/projection, history, collaboration, and Plate/product-boundary ownership. |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Pass 10 reduces the final shape to narrow composable surfaces: one internal-first Plite helper, one conditional routing lane, one dev/proof replay lane, one separate Plate product lane, and no runtime Frontier dependency. |

Weighted score:
- 0.92

Source-backed architecture north star:
- target shape: Plite should keep operations, roots, refs, selection, and
  history first-party. Add compact state-patch codecs, patch-routed plugin-state
  subscriptions, replay logs, and profile artifacts as Plite-owned primitives.
- source evidence: Plite `StateFieldDescriptor` already has `diff`,
  `applyPatch`, and `invertPatch`; large shared/history fields without hooks
  throw above 32 KB (`packages/plite/src/core/public-state.ts:362-423`).
- rejected drift: Do not make Frontier the editor transaction, history, rich
  text, or CRDT substrate.
- migration posture: Plate can adopt the explicit mutation-plan DX as a command
  planning layer; slate-yjs should steal model-check/replay harness ideas, not
  replace Yjs with Frontier CRDT.

Pass-5 research / live-source refresh findings:
| Evidence surface | Refreshed source | Result | Plan effect |
|------------------|------------------|--------|-------------|
| React runtime posture | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`; `packages/plite-react/src/hooks/use-editor-selector.tsx:213-387` | React 19.2 supports external stores/background UI, and Plite React already uses runtime-id/deferred selector fanout | Keep React-native runtime; pressure deeper invalidation in pass 6 |
| State/tx public API | `docs/research/decisions/plite-state-tx-public-api-and-extension-namespaces.md`; `packages/plite/test/state-tx-public-api-contract.ts:139-220,348-454` | Current direction is state/tx groups, with live tests for grouped reads/writes and `tx.value.replace` | Plite raw DX stays primitive and namespace-based |
| Plite state fields | `packages/plite/src/interfaces/editor.ts:111-120`; `packages/plite/src/core/public-state.ts:362-423` | State fields already expose diff/apply/invert hooks and enforce patch hooks for large shared/history values | First Plite steal should extend/standardize field patch helpers, not import Frontier |
| State-field subscriptions | `packages/plite-react/src/hooks/use-state-field.ts:40-52`; `../-shapeshift-labs-frontier-state/src/subscription.ts:145-260` | Plite state-field React hook is key-level; Frontier proves path/range routing mechanics | Candidate is state-field-local routing only, not generic node render routing |
| Plite history | `packages/plite-history/src/history-extension.ts:168-209,271-350` | History replays semantic operations plus state patches and merges by root-aware operations | Reject Frontier snapshot-patch history as replacement |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`; `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1368-1388` | Read/update lifecycle and dirty/update tags support Plite's lifecycle direction | Steal lifecycle discipline, not class nodes or command-first app API |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`; `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:42-92,185-214` | Transactions own selection mapping, stored marks, metadata, and scroll intent | Build Plite-op-aware mapping/proof, not JSON-patch path mapping |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`; `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:7-135` | Product command/chain DX is useful but backed by one transaction | Route mutation-plan ergonomics to Plate and compile to Plite/Plate transforms |
| Yjs/slate-yjs | `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md`; `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withCursors.ts:160-260`; `/Users/zbeyens/git/slate-yjs/packages/core/src/utils/position.ts:65,268` | Extension-owned binding, relative positions, and awareness are useful; legacy wrapper mutation is not | Keep slate-yjs/Yjs route and steal replay/model-check proof ideas from Frontier |
| Plate source | `packages/core/src/react/stores/element/useElementSelector.ts:11-89`; `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts:27-110` | Plate already has external-store selectors and product-specific transform logic | Plate mutation plans can improve agent/bulk DX without changing raw Plite |

Pass-6 pressure outcome:
| Pressure | Hard call | Why | Proof gate before execution claim |
|----------|-----------|-----|-----------------------------------|
| Execution priority | Build Plite compact state-field patch/replay helper first | It is the closest direct win already supported by live `StateFieldDescriptor` hooks and history state patches | state-field patch roundtrip, inverse, >32 KB policy, undo/redo, collab export/import |
| State-field-local routing | Do not build until a focused benchmark proves key-level dirty-state fanout is red | Current hook is key-level; path/range routing adds API and mental cost | large map/list state field with many watchers, p95 notification count, heap/subscription tags |
| Frontier dependency | No runtime dependency; optional isolated dev/benchmark comparator only | Core runtime needs Plite paths, roots, operations, refs, selection, and history semantics | benchmark package proves comparison/replay value with zero core dependency edge |
| Plate mutation plans | Keep as Plate-only product DX, not raw Plite | Good agent/bulk transform ergonomics, but raw Plite should not become a JSON mutation DSL | AI suggestion/bulk-transform tests prove same output, conflict handling, and no semantic ID loss |
| slate-yjs | Keep Yjs route; steal model-check/replay tooling only | Frontier CRDT does not replace relative positions, Yjs ecosystem, or Plite op/history semantics | scheduled remote/local replay, minimize failure artifacts, awareness external-store tests |
| React runtime | Use React 19.2 for external stores/background UI, not editor invalidation | React schedules; Plite decides dirty editor truth | React Performance Tracks plus Plite commit dirtiness for same interaction |
| Simplicity | Add no public API until benchmark/proof needs it | The source already has hooks; the risk is over-abstracting before evidence | every added API has a failing benchmark/test row and one expected call site |

Pass-6 performance contract:
| Item | Decision |
|------|----------|
| Vercel rules used | `rerender-defer-reads`, `rerender-derived-state`, `rerender-move-effect-to-event`, `rerender-transitions`, `rerender-use-deferred-value`, `rerender-use-ref-transient-values`, `js-index-maps`, `js-set-map-lookups`, `js-length-check-first`, `js-early-exit`, `js-combine-iterations` |
| Extra performance rules used | `cohort-segmentation`, `repeated-unit-budget`, `effect-subscription-budget`, `interaction-inp-matrix`, `memory-dom-tagging`, `degradation-contract`, `react-19-runtime-proof`, `editor-native-behavior-proof` |
| Cohorts | normal `0-500` blocks, medium `500-2000`, large `2000-10000`, stress `10000-50000`, pathological tagged by custom renderers, decorations/comments, voids/tables, collaboration activity, hidden/content roots, mobile/IME/browser |
| Repeated units | block, leaf/text, state-field entry, state-field watcher, history batch, collab replay action, Plate mutation-plan operation |
| Budgets | no state-field write scales with full document; no per-node Frontier/router subscription; no repeated-unit effects unless external sync; no global React fanout for field-local changes; patch bytes and watcher counts recorded |
| Interaction metrics | type, select, select-then-type, select-all, copy, paste, undo, redo, state-field update, remote update, synced/content-root edit, Plate AI suggestion apply; record p50/p75/p95/p99 or lab event-to-paint proxy |
| Memory/DOM tags | JS heap, DOM node count, React component proxy, event listener count, subscription count, patch byte size, cached index sizes, dirty id set size, hidden/content-root count, decoration/comment count |
| Degradation contract | default path stays DOM-present/native; any virtualized/shell/model-backed mode is explicit opt-in for stress/pathological cohorts with behavior rows |
| Native behavior rows | browser find, screen-reader traversal, native selection, copy, paste, select-all, IME/composition, mobile touch selection, undo/history, collaboration/remote update, follow-up typing |
| Dashboard/RUM gap | future execution should tag interaction, cohort, browser, mode, block count, plugin-state size, patch byte size, watcher count, and memory/DOM pressure; no production claim before those tags exist |

Pass-6 acceptance contracts:
| Candidate | Unit/package proof | Browser/stress proof | Cut/defer rule |
|-----------|--------------------|----------------------|----------------|
| Plite compact state-field patch helper | field diff/apply/invert roundtrip, inverse undo/redo, >32 KB policy, history merge/split behavior, shared/local/persist policy | large shared/history state update across undo/redo and remote replay | cut if helper adds API but no measured memory/history win over field-owned hooks |
| State-field-local routing | route exact/key/path/range watchers over large map/list fields; watcher count and notification count assertions | large plugin-state editor with many inactive watchers; typing and state update INP proxy | defer if key-level dirty state is already below budget |
| Plite replay/profile artifacts | replay commit log with operations and state patches; minimize failed state/collab schedules | reproduce history/collab/content-root failures with follow-up typing proof | dev/proof only unless runtime needs measured output |
| Plate mutation-plan helper | compile plan to existing Plate/Plite transforms; conflict/access frame tests; semantic id/mark preservation | AI suggestions and bulk transform example keep visible output and selection semantics | keep internal if public API call site is not simpler than current Plate commands |
| slate-yjs replay harness | remote import through `editor.update`, skip-history metadata, relative selection/bookmark restoration | multi-root/content-root remote edit, undo, cursor, follow-up typing | never replace Yjs provider or relative-position route |

Cloned Frontier package map:
| Family | Useful idea | Dependency call |
|--------|-------------|-----------------|
| `frontier`, `frontier-engine`, `frontier-codec` | Compact JSON patch, adaptive profile, binary patch history | Dev/benchmark dependency only; first-party Plite codec for runtime |
| `frontier-state`, `frontier-react` | Patch-routed state watchers and external-store selector shape | Steal pattern; no Plite/Plate runtime dependency |
| `frontier-mutation`, `frontier-query` | Explicit mutation/select/access/conflict plans | Strong Plate idea; maybe Plite extension-command planning later |
| `frontier-crdt`, `frontier-crdt-sync` | CRDT model-check/replay/minimize tooling | Steal testing ideas; reject as Plite collaboration core |
| `frontier-richtext` | Delta/range/annotation helpers | Maybe Plate AI/suggestions inspiration; reject as Plite document model |
| `frontier-event-log`, `frontier-logging` | Bounded event log, replay cursors, patch summaries | Good devtools/proof lane; runtime optional |
| `frontier-state-cache-*` | Normalized query cache and persistence | Not core Plite; maybe app/Plate comments/suggestions cache only with a real product benchmark |
| `frontier-realtime-*`, `frontier-game` | Realtime/game protocol and transport | Reject for editor architecture |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Plite state fields | Add or document first-party compact patch helpers for large shared/history state fields | Extension authors can opt into replayable compact state without importing unrelated app-state packages | Existing `StateFieldDescriptor` hook names stay | `packages/plite/src/interfaces/editor.ts:111-120`; `packages/plite/src/core/public-state.ts:397-423` | steal internally |
| Plite plugin-state subscriptions | Consider path/key watcher descriptors for state fields with large maps/lists | Hooks can subscribe narrower than `dirtyStateKeys.includes(field.key)` | Backward compatible; default stays key-level | Current hook is key-level only (`packages/plite-react/src/hooks/use-state-field.ts:40-52`); Frontier router supports path/field/range watches (`../-shapeshift-labs-frontier-state/src/types.ts:174-241`) | revise in later pass |
| Plate mutation plans | Optional Plate command-planning helper for AI/bulk transforms | Agent-readable `plan -> access/conflict -> compile -> apply` flow | Plate-only; no raw Plite opinion leakage | Frontier access/conflict and compile output (`../-shapeshift-labs-frontier-mutation/src/index.ts:921-1165`) | steal for Plate |
| Runtime dependency | Do not add Frontier to Plite core | Smaller core, fewer semantics fights | Can still use Frontier in benchmarks/devtools if measured | Plite already owns operation dirtiness/history/root semantics | cut |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| State patching | Plite `public-state.ts` | First-party patch hooks plus optional built-in compact JSON patch for state fields | Full snapshot cloning for large shared/history plugin state | `packages/plite/src/core/public-state.ts:372-423` | steal concept |
| Dirtiness fanout | Plite commit/change and Plite React selectors | Keep runtime-id dirtiness for document nodes; add state-field-local watch routing only where state maps are huge | Duplicating Frontier route tree for node render paths | `packages/plite/src/core/public-state.ts:1394-1565`; `packages/plite-react/src/hooks/use-editor-selector.tsx:238-375` | partial |
| Path/selection mapping | Plite operation refs/range refs | Build Plite-op-aware mapping, not JSON-patch mapping | Wrong mapping across roots, voids, split/merge, selection refs | Frontier path mapper shows the shape but is JSON patch based (`../-shapeshift-labs-frontier-state/src/path-map.ts:21-260`) | steal algorithm class |
| History/replay | Plite history extension | Keep semantic operations plus state patches; add optional encoded state-patch/event-log proof artifacts | Snapshot-diff undo and non-semantic history | `packages/plite-history/src/history-extension.ts:168-209`, `271-424`; Frontier snapshot undo at `../-shapeshift-labs-frontier-crdt/src/crdt-undo.ts:85-240` | keep Plite |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Plite React selectors | Existing `useEditorState` / runtime selectors | Keep selector call sites Plite-close and root-aware | Runtime-id fanout, no generic app store wrapper | `packages/plite-react/src/hooks/use-editor-selector.tsx:213-375` | keep |
| Plate element selectors | Existing `useElementSelector(selector, deps, options)` | Keep Plate compatibility, reduce hot path only when measured | Direct `useSyncExternalStore` already present | `packages/core/src/react/stores/element/useElementSelector.ts:11-89`; perf notes at `docs/performance/editor-performance-master-plan.md:335-367` | no Frontier dependency |
| AI suggestions | Current diff-to-suggestions path | Frontier may benchmark JSON diffs offline, but Plate suggestion semantics stay Plate-owned | Do not flatten suggestions into generic JSON patch | `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts:27-110` | dev-only experiment |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Plugin/app state | Shared/history state fields with compact patches | Plate plugins use Plite state-field hooks for comments, suggestions, synced-block registries, and overlays | Do not import Frontier state engine into Plate core | Plite state fields and history state patches are current substrate | steal first-party |
| Bulk/AI transforms | Semantic Plite operations plus optional Plate mutation-plan wrapper | Plate can expose explicit transform plans for agents and conflict checks | Do not make raw Plite a generic database mutation DSL | Frontier mutation plan/access/compile API is strong evidence | Plate yes |
| Element hot path | Runtime store selectors | Keep current Plate direct selector work | Do not swap store brands blindly | Plate perf doc says brand swapping is not the next move (`docs/performance/editor-performance-master-plan.md:1048-1068`) | keep |

slate-yjs migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Shared document edits | Plite operations/root keys/selection refs | Yjs adapter maps Plite ops and root-qualified cursors | Replace slate-yjs with Frontier CRDT | Frontier CRDT ops are generic JSON/tree/list/text (`../-shapeshift-labs-frontier-crdt/src/types.ts:66-235`) | reject dependency |
| Shared plugin state | State fields with compact patches and collab policy | Collab adapter can sync `collab: shared` fields with field-owned patch codecs | Generic Frontier state cache as Plite core | Plite state fields already include `collab`, `history`, `persist` (`packages/plite/src/interfaces/editor.ts:105-120`) | steal pattern |
| Collab regressions | Replay/minimize/model-check harness | Use Frontier-style scheduled sync repro artifacts around slate-yjs tests | Adopt Frontier text binding | Frontier text binding does whole-text replace for doc-to-editor mismatch (`../-shapeshift-labs-frontier-crdt-sync/src/crdt-sync-text-binding.ts:73-110`) | steal tests, reject binding |

Intent / boundary record:
- intent: Mine the Frontier family for real architecture/perf/DX leverage
  without letting a generic JSON/state stack take over Plite's editor semantics.
- desired outcome: A user-review-ready plan that says exactly what Plite
  should build first-party, what Plate should expose as product DX, what may be
  used only as dev/benchmark tooling, and what should be rejected outright.
- in-scope Plite behavior: state-field patch/inverse helpers, state-field-local
  subscriptions for large non-node maps/lists, replay/profile artifacts, and
  proof rows for history/collab/selection safety.
- in-scope Plate behavior: mutation/access/conflict plans for AI and bulk
  transforms, compiled to existing Plate/Plite transforms rather than exposed
  as a raw Plite mutation DSL.
- in-scope collaboration tooling: Frontier-style model-check/replay/minimize
  harness ideas around slate-yjs/Yjs integration proof.
- non-goals: implementing in this activation, changing Plite document
  operations, replacing Plite's tree model with Delta/richtext, replacing
  slate-yjs/Yjs, shipping Frontier realtime/game/cache layers, or adding a
  Frontier package to Plite core just to reuse code.
- decision boundaries: This plan may decide owner category
  (`Plite core`, `Plite dev/proof tooling`, `Plate`, `defer`, `reject`), public
  API posture, proof gates, issue-claim policy, and dependency posture. It may
  not claim runtime behavior, issue closure, or benchmark wins without later
  `Plate repo root` proof.
- resolved boundary decisions:
  - Plite core owns editor semantics: operations, paths, roots, refs,
    selection, normalization, and history grouping.
  - Generic JSON patch ideas may apply only to state fields and proof artifacts,
    not document operations.
  - Plate owns opinionated command planning and agent-friendly transform DX.
  - Frontier may become a dev/benchmark comparator only if future execution
    proves value.
  - Frontier CRDT, richtext, cache, realtime, websocket, and game layers do not
    belong in Plite runtime.
- resolved by pass 6:
  - Prototype order after the plan is accepted: Plite state-patch helper first,
    Plate mutation-plan wrapper second and separate.
  - Dev dependency policy: Frontier stays out of runtime dependencies and is
    acceptable only as an isolated dev/benchmark comparator if execution proves
    useful comparison or replay value.
- unresolved user-decision points:
  - Plate exposure level: internal helper first or public command-plan API.

Decision brief:
- principles:
  - Plite owns editor semantics; helpers must fit operations, roots, refs,
    selection, normalization, and history.
  - Generic JSON tools may support state fields and proof logs, but must not
    define document operations.
  - Raw Plite stays unopinionated; Plate may expose product-shaped command and
    agent APIs.
  - Dependencies need measured runtime, proof, or maintenance value. "Good
    idea" is not enough.
  - Any state/history/collab change must be replayable and issue-accounted.
- top drivers:
  - selection/history/root correctness beats code reuse
  - React subscription fanout and large-state memory pressure
  - Plate agent DX and bulk-transform clarity
  - slate-yjs migration proof and collaboration replay
  - smallest public API that still gives extension authors leverage
- viable options:
  - Add Frontier runtime dependencies to Plite core.
    Pro: fastest access to compact patches/router/codec.
    Con: wrong semantic layer for Plite paths, operations, selection, roots,
    and collaboration. It also makes raw Plite depend on an app-state toolkit.
  - Build first-party Plite primitives inspired by Frontier.
    Pro: exact Plite semantics, stable small API, no dependency lock-in.
    Con: more implementation work and more responsibility for proof coverage.
  - Use Frontier only in dev/benchmark/proof tooling.
    Pro: cheap comparator and replay inspiration without runtime coupling.
    Con: no runtime win unless the benchmark/proof harness is actually adopted.
  - Put mutation-plan ideas in Plate.
    Pro: high DX gain where product opinions belong; strong agent-readability.
    Con: can become a second transform system if it leaks below Plate.
  - Adopt Frontier CRDT/richtext/cache/realtime layers.
    Pro: broad ecosystem-in-a-box.
    Con: duplicates or fights Plite/Yjs/tree/operation semantics; too much
    architecture for the actual editor problem.
- chosen option:
  - Plite: first-party state-field patch/replay primitives plus optional
    state-field-local watch routing. No Frontier runtime dependency.
  - Plite dev/proof tooling: optionally benchmark against Frontier codecs and
    steal event-log/model-check patterns during future execution.
  - Plate: explore mutation-plan DX for AI/bulk transforms, compiled to current
    transforms and guarded from raw Plite.
- rejected alternatives:
  - Frontier runtime in Plite core.
  - Frontier CRDT as collaboration core.
  - Frontier richtext/Delta as document model.
  - Frontier state-cache as editor plugin-state substrate.
  - Frontier realtime/websocket/game layers for editor architecture.
- consequences:
  - More Plite-owned code, but fewer semantic mismatches.
  - Smaller public API in raw Plite.
  - Plate gets the higher-level DX win instead of forcing it into core.
  - Future execution must prove whether the first Plite candidate is worth
    shipping.
- follow-ups:
  - Pass 5: refresh external/current-source evidence against this owner split.
  - Pass 6: pressure performance, DX, migration, regression, and simplicity.
  - Pass 7: steelman maintainer objections against the narrowed execution
    order, dependency posture, Plate split, and collaboration proof plan.
  - Later accepted execution: build the Plite state-patch prototype first, then
    consider the Plate mutation-plan prototype as its own Plate lane.

Ownership decision table:
| Frontier surface | Owner category | Decision | First artifact if accepted | Hard boundary |
|------------------|----------------|----------|----------------------------|---------------|
| `frontier-state` / `frontier-react` watch routing | Plite core, first-party | steal concept | state-field-local watch descriptors for large plugin state | never replace node dirtiness/runtime-id render fanout with a generic store |
| `frontier-engine` / `frontier-codec` patches | Plite core first-party plus optional dev comparator | steal concept, maybe benchmark dependency | compact field-owned state patch/inverse helpers | no Frontier-branded public API in Plite core |
| `frontier-event-log` / `frontier-logging` | Plite dev/proof tooling | steal pattern | replay/profile artifacts for state/history/collab tests | not required runtime infrastructure |
| `frontier-mutation` / `frontier-query` | Plate | steal as product DX | Plate mutation-plan helper for AI/bulk transforms | compile to Plite/Plate transforms; no raw Plite mutation DSL |
| `frontier-crdt` / `frontier-crdt-sync` | slate-yjs proof lane only | steal model-check/replay ideas | collab replay/minimize harness | no replacement for Yjs/slate-yjs |
| `frontier-richtext` | Plate experiments only | maybe steal annotation/range test ideas | AI/suggestion benchmark helper | no Delta/richtext document model in Plite |
| `frontier-state-cache-*` | defer / app-specific Plate cache | no core adoption | only with product benchmark | not editor plugin-state substrate |
| `frontier-realtime-*` / `frontier-game` | reject | no adoption | none | transport/game protocols are not editor architecture |

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #6038 batch-aware apply/perf | already improves-claimed | no new claim | Frontier patch routing/adaptive diff speaks to repeated-update perf, but current #6038 accounting is already owned by transaction/applyOperations benchmark coverage | keep existing benchmark/proof owner | unchanged; `gitcrawl-v2-sync-ledger.md` and `fork-issue-dossier.md:581-615` | existing `Improves #6038` line only |
| #5992 large cut perf | already improves-claimed | no new claim | Compact state/history/replay may matter for large docs, but #5992 is already owned by the 50,000-block cut benchmark and 5,000-block browser stress row | keep existing benchmark/proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `pr-description.md:641-647`; `benchmark-candidate-map.md:55-75` | existing `Improves #5992` line only |
| #5945 large plaintext paste | already improves-claimed | no new claim | Frontier codec/replay ideas are adjacent, but paste perf already has a populated benchmark owner | keep existing benchmark/proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `benchmark-candidate-map.md:108-134`; `fork-issue-dossier.md:4157-4200` | existing `Improves #5945` line only |
| #4056 populated copy/paste | already improves-claimed | no new claim | Patch codecs do not change the user-facing clipboard claim; keep it owned by the existing populated paste/copy lane | keep existing benchmark/proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `benchmark-candidate-map.md:264-294`; `fork-issue-dossier.md:4125-4155` | existing `Improves #4056` line only |
| #3752 history memory | cluster-synced | none | Frontier history/event-log ideas may inform a future memory benchmark, but the issue already has a benchmark-candidate owner | later perf/history pass | unchanged; `gitcrawl-v2-sync-ledger.md`; `benchmark-candidate-map.md:298-316` | related/benchmark matrix only |
| #5515 undo/redo all | cluster-synced / related history pressure | none | Plite state patches and history hooks clarify history boundaries but do not implement Undo/Redo All | later issue pass only if API scope changes | unchanged; `fork-issue-dossier.md:396-418`; `gitcrawl-v2-sync-ledger.md` | related matrix only |
| #5771 collaboration selection | already improves-claimed | no new claim | Frontier model-check/replay ideas are useful, but existing #5771 accounting already limits the claim to core collab-readiness proof, not provider/browser closure | keep slate-yjs proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `pr-description.md:43-54` | existing `Improves #5771` line only |
| #5533 collaboration without Yjs | cluster-synced / related | none | Frontier CRDT is explicitly rejected as a replacement, so this review must not imply first-party Yjs-free collaboration support | keep related/non-closure | unchanged; `gitcrawl-v2-sync-ledger.md`; `requirements-from-issues.md:106-130` | related matrix only |
| #5212 synced/content-root DX | not claimed / related in content-root plans | none | Frontier shared-state ideas overlap Synced Blocks/content-root architecture, but existing content-root rows already classify #5212 as example/DX pressure without fixed/improved claim | reuse existing content-root accounting | unchanged; `fork-issue-dossier.md:142-184`; `gitcrawl-v2-sync-ledger.md` | related/no-claim only |
| #3656 / #4141 render breadth | already improves-claimed | no new claim | Frontier-style subscription routing is relevant, but Plite already has leaf/nested rerender proof rows | keep existing render-runtime proof owner | unchanged; `issue-coverage-matrix.md:505-510`; `fork-issue-dossier.md:1151-1200` | existing `Improves` rows only |
| #5131 broad hook rerenders | not claimed | none | Broad hooks stay broad by contract; narrower selectors can improve call sites but do not "fix" broad hook semantics | keep non-claim and use as perf pressure | unchanged; `issue-coverage-matrix.md:505-510`; `fork-issue-dossier.md:1123-1148` | no claim |
| #2051 leaf rerender pressure | related / improves-pressure | no new claim | Subscription routing and text-render skip policy are pressure evidence, not exact closure | render/runtime perf gates | unchanged; `issue-coverage-matrix.md:677`; `benchmark-candidate-map.md:488-514` | no new line |
| #2195 / #2405 dirty tracking and normalization | related | none | Frontier patch routing resembles dirty-window ideas, but Plite dirty paths and normalization remain Plite-op-specific | later dirty-window / normalization benchmarks | unchanged; `issue-coverage-matrix.md:537-538`; `benchmark-candidate-map.md:458-484` | related only |
| #4483 dynamic decorations | already improves-claimed | no new claim | This is the closest existing issue to patch-routed local subscriptions; current projection/local-subscription rows already own the claim | keep projection/store proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `issue-coverage-matrix.md:557-559`; `benchmark-candidate-map.md:138-160` | existing `Improves #4483` line only |
| #4477 annotation/widgets | already improves-claimed | no new claim | Frontier richtext annotations are only inspiration; Plite/Plate comments remain product/API-specific | keep existing projection/widget lane | unchanged; `gitcrawl-v2-sync-ledger.md`; `issue-coverage-matrix.md:557-559`; `fork-issue-dossier.md:5272-5296` | existing `Improves #4477` line only |
| #5987 async decorate | already fixes-claimed | no new claim | This is a regression floor for any state-patch/subscription work touching decorate timing | keep existing exact browser proof owner | unchanged; `gitcrawl-v2-sync-ledger.md`; `issue-coverage-matrix.md:557-559` | existing `Fixes #5987` line only |
| #3352 / #3383 / #2465 mark-decoration metadata | mixed improves / related / non-claim | no new claim | Frontier richtext metadata overlaps the topic, but raw Plite must not adopt Delta/richtext as the model | keep projection rows and non-claim policy | unchanged; `issue-coverage-matrix.md:571,712-713`; `fork-issue-dossier.md:4876-4902,5353-5376` | no new line |
| #790 / #4210 / #5216 proof-route backlog | proof backlog | none | These rows stay benchmark backlog for layout/render/large-doc pressure; Frontier does not close them | pass 6 benchmark strategy | unchanged; `issue-coverage-matrix.md:755-759`; `fork-issue-dossier.md:6918-6922` | no claim |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete by reuse; fresh sweep skipped in pass
  2 because existing generated/manual ledgers already classify the touched
  surface.
- Issue-ledger support-file pass: complete in pass 3. Read issue clusters,
  requirements, package-impact rules, benchmark candidates, v2 coverage matrix,
  fork dossier, PR reference, and gitcrawl sync rows.
- Claim-policy result: unchanged. Pass 3 adds no `Fixes`, `Improves`, `Related`,
  or PR-description text.
- Performance coverage summary: preserve the current explicit performance rows
  for `#6038`, `#3656`, `#4141`, `#5131`, `#3430`, `#5945`, `#4056`, `#5992`,
  `#3752`, `#2195`, `#2405`, `#4483`, and `#2051`; keep macro/future rows and
  proof-route backlog rows out of this plan's direct claims.
- React runtime/projection summary: preserve existing rows for #4483, #4477,
  #5987, #3352, #3383, and #2465; use them as subscription/projection pressure,
  not as a Frontier dependency argument.
- manual v2 sync ledger update: unchanged in pass 3.
- fork issue dossier update: unchanged in pass 3.
- issue coverage matrix update: unchanged in pass 3.
- PR description sync: unchanged in pass 3.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Frontier state | `../-shapeshift-labs-frontier-state/src/subscription.ts:145-447` | Patch router with exact/field/range watchers and fast single-op routing | Whole-store fanout for state changes | State-field-local watch routing | Generic state engine as Plite runtime | Root/editor model remains Plite, plugin state gets narrower routing | partial |
| Frontier engine/codec | `../-shapeshift-labs-frontier-engine/src/engine.ts:150-260`; `../-shapeshift-labs-frontier-codec/src/history.ts:75-244` | Adaptive diff, planned history, binary patch history | Big JSON snapshot history | State-patch codec and benchmark profiles | Encoding Plite operations as generic JSON patches first | First-party codec for state patches/proof artifacts | partial |
| Frontier mutation | `../-shapeshift-labs-frontier-mutation/src/index.ts:921-1165` | Explicit mutation plans with access/conflict and planner decisions | Opaque bulk mutations | Plate command/AI plan shape | Raw Plite generic mutation DSL | Plate wrapper over Plite transforms/commands | agree for Plate |
| Frontier CRDT | `../-shapeshift-labs-frontier-crdt/src/types.ts:66-235`; `../-shapeshift-labs-frontier-crdt/src/crdt-undo.ts:85-240` | Generic JSON/tree/list/text CRDT with snapshot undo | Some sync classes | Model-check/replay ideas | Plite collaboration replacement | Keep slate-yjs/Yjs route; improve proof harness | diverge |
| Frontier richtext | `../-shapeshift-labs-frontier-richtext/src/index.ts:1-222` | Delta ops, selection/cursor transforms, annotations | Manual range math for flat text | Plate AI/suggestion benchmark helpers | Plite document model replacement | Plite stays tree/op based | diverge |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md` | External-store subscriptions, deferred values, transitions, hidden Activity UI, performance tracks | Treating React as either too weak for editor UI or as the editor invalidation engine | External-store and background-UI posture | React as document/dirty-region owner | React consumes Plite commits/runtime dirtiness; Plite owns invalidation | agree |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`; `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1368-1388` | Read/update lifecycle, dirty-node/update tags, extension lifecycle | Mutation outside coherent runtime context | Lifecycle and metadata discipline | Class nodes, `$` helpers, command-first app API | `editor.read`, `editor.update`, state/tx groups, commit tags | partial |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`; `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:42-92,185-214` | Transactions map selection, stored marks, metadata, and scroll intent | Stale selection and random DOM ownership | Composite transaction/selection discipline | Integer positions and plugin complexity | Plite operations/refs/root-aware mapping, centralized DOM bridge | partial |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`; `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:7-135` | Extension commands and chain compose around one transaction | Undiscoverable product actions | Product command planning and selector UI posture | Required focus/chain ceremony in raw Plite | Plate mutation plans compile to Plite/Plate transforms | agree for Plate |
| Yjs / slate-yjs | `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md`; `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withCursors.ts:160-260` | Binding state, relative positions, awareness cursor store, undo/cursor lessons | Collaboration hidden in editor wrapper mutation | Replay/model-check proof and Yjs binding mechanics | Replacing Yjs with Frontier CRDT | Extension-owned slate-yjs package with state/tx namespaces | partial |
| Live Plite | `packages/plite/test/state-tx-public-api-contract.ts:139-220,348-454`; `packages/plite/src/core/public-state.ts:362-423` | State/tx groups, state-field patch hooks, runtime ids, operation/history substrate | Rebuilding a second runtime beside Plite | Tighten first-party primitives already present | Frontier runtime dependency | state-field patch helpers, optional state-field-local watchers, replay proof | agree |
| Live Plate | `packages/core/src/react/stores/element/useElementSelector.ts:11-89`; `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts:27-110` | External-store element selectors and product-specific AI suggestion transforms | Forcing product DX into raw Plite | Agent-readable mutation planning around existing Plate transforms | Generic JSON patch as Plate suggestion truth | Plate-only mutation-plan helper | agree for Plate |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Large shared/history state | Snapshot patches can explode memory/history | Compact field-owned patches and inverses | unit stress with >32 KB state field; undo/redo inverse replay; patch byte tags | execution plan | contract specified; execution pending |
| Cross-root selection/history | Operations and selection must stay root-aware | Do not route through generic JSON patch paths | focused Plite history/root/content-root tests; follow-up typing after undo/redo | execution plan | contract specified; execution pending |
| State-field subscription fanout | Key-level dirty state can notify too broadly for huge maps/lists | Path/range routing only when benchmark proves need | large field benchmark with watcher counts and p95 notifications | pass 6 / execution | conditional; benchmark first |
| Collaboration replay | Remote/local ops must be reproducible | Scheduled replay/minimize artifacts | slate-yjs model tests with state patches, relative selections, remote undo, awareness | later research/execution | contract specified; execution pending |
| Native editor behavior | Faster modes can silently break browser behavior | Default stays DOM-present/native; degraded modes are opt-in | browser find, selection, copy, paste, select-all, IME, mobile touch, undo/history, remote update | execution plan | contract specified; execution pending |
| Plate AI bulk transforms | Suggestions must keep semantic IDs/marks | Mutation plans compile to Plate/Plite transforms, not generic patches | Plate AI suggestion tests; conflict/access frame tests; same visible output | Plate execution plan | contract specified; execution pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| State patch hooks | Large shared state undo/redo, history merge/split, local/shared policy | unit first, then browser if selection/focus involved | `Plate repo root` focused package tests plus browser route when state patch affects selection/content roots | compact patch/inverse replay; no focus/selection regression | contract specified |
| State-field routing | Large map/list field with many watchers | unit plus React profile if implemented | `Plate repo root` hook tests and lab event-to-paint proxy | key-level fanout reduced only when benchmark is red | conditional |
| Synced/content roots | Shared-root selection/history and undo/redo | Chromium/WebKit/Firefox | existing synced-block route plus new state-patch rows | no selection/history regression; follow-up typing works | contract specified |
| Dynamic decorations/projections | State update affecting narrow projection/decoration source | Chromium and React Performance Tracks | existing projection/decorate routes plus state-field update row | no broad React fanout; visible decoration correct | contract specified |
| Collab replay | Remote/local update schedule with state patches and selections | unit/model first, browser later | slate-yjs replay/minimize harness | no echo, no history pollution, selection/bookmark survives | contract specified |
| Native editor behavior | Faster/staged mode behavior audit | Chromium/WebKit/Firefox plus mobile lane when claimed | native find, selection, copy, paste, select-all, IME/composition, mobile touch rows | native unless explicitly opt-in/model-backed | contract specified |
| Plate mutation plans | AI suggestions and bulk transforms | unit plus docs/example if accepted | Plate focused tests | same user-visible suggestion semantics and IDs/marks | contract specified |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Frontier repos cloned | plate-2 | `find .. -maxdepth 1 -type d -name '-shapeshift-labs-frontier*' -print \| sort` | 22 Frontier-family dirs present | pass 1 |
| Frontier package map read | plate-2 | package manifest scan over `../-shapeshift-labs-frontier*/package.json` | names/descriptions/deps recorded in package map | pass 1 |
| Plite current state fields/history/selectors exist | plate-2 reading `Plate repo root` | `nl -ba ...` source reads listed in scorecard | source pointers recorded; no behavior command claimed | pass 1 |
| Related issue discovery | plate-2 | `rg`/`nl` reads over `docs/plite-issues/*`, `docs/plite/ledgers/*`, and `docs/plite/references/pr-description.md` | Existing ledgers cover #6038, #5992, #5771, #5533, #5515, #5212, #3752; no new ClawSweeper run needed | pass 2 |
| Issue-ledger support scan | plate-2 | `rg`/`nl` reads over issue clusters, requirements, package-impact, benchmark candidates, v2 matrix, fork dossier, PR reference, and gitcrawl sync ledger | Expanded issue matrix; existing claim statuses preserved | pass 3 |
| Intent/boundary decision brief | plate-2 | active plan rewrite of intent, decision brief, and ownership decision table | Owner split is explicit; no issue/runtime claims changed | pass 4 |
| Research/ecosystem/source refresh | plate-2 | `sed`/`rg`/`nl` reads over compiled research, local upstream editor repos, Frontier source, live `Plate repo root`, and Plate source | Ecosystem strategy expanded; owner split still holds; no issue/runtime claims changed | pass 5 |
| Performance/DX/migration/regression pressure | plate-2 | pass-6 plan sections and lens matrix | execution order, proof contracts, and cut/defer rules recorded | pass 6 |
| Maintainer objection ledger | plate-2 | pass-7 objection ledger and ecosystem objection answers | keep/cut/defer calls survived maintainer-style pressure; no issue/runtime claims changed | pass 7 |
| High-risk deliberate mode | plate-2 | pass-8 pre-mortem, expanded proof plan, blast radius, rollback/hard-cut answers | subtle corruption and scope-creep risks have no-ship gates; no issue/runtime claims changed | pass 8 |
| Ecosystem maintainer pass | plate-2 | pass-9 downstream owner answers and ecosystem closure contracts | adoption constraints recorded; no issue/runtime claims changed | pass 9 |
| Revision pass | plate-2 | pass-10 execution order, API posture, docs/example posture, and benchmark gate policy | pass outputs consolidated; no issue/runtime claims changed | pass 10 |
| Issue sync accounting | plate-2 | `rg`/`nl` reads over gitcrawl sync ledger, issue coverage matrix, and PR reference; one manual gitcrawl sync note added | zero fixed/improved/related/PR deltas recorded | pass 11 |
| Plite behavior | `Plate repo root` | none in pass 12 | no behavior claim made | later execution |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| planning artifact only | plate-2 | N/A | N/A | no implementation patch |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied in pass 6 | Relevant rules are rerender, rendering, and JS hot-loop/subscription rules; async/server/bundle lanes are not the editor-core hot path here | added React/runtime micro-rule list and kept visible editing urgent |
| performance-oracle | yes | applied in pass 6 | State patching, state-field routing, history batches, collab replay, and Plate mutation plans need bounded complexity and 10x/100x/1000x projection | added repeated-unit budgets and cut/defer conditions |
| performance | yes | applied in pass 6 | Plan needed cohorts, repeated-unit budgets, INP proxies, memory tags, degradation policy, native behavior rows, and RUM tag gap | added performance contract table |
| tdd | yes for execution | applied as acceptance contract | No implementation patch in pass 6, so no red-green loop; behavior contracts are now named for the future execution pass | added unit/browser/stress acceptance contracts |
| shadcn | Plate examples only | skipped for pass 6 | No UI/example implementation in planning pass; only applies if Plate mutation-plan example/docs are accepted later | keep pending only for future Plate UI/example work |
| react-useeffect | yes | applied in pass 6 | Effects are only for external sync; repeated editor units need selector/external-store subscriptions, not derived-state effects | added effect/subscription budget and no repeated-unit effect policy |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Patch replay corruption | Compact state-field helper shipped too early | Undo/redo restores document operations but replays stale or non-invertible plugin state; collab import/export diverges silently | helper can stay internal; require diff/apply/invert roundtrip, inverse replay, >32 KB policy, history merge/split, and shared/local/persist policy tests | `Plate repo root` unit/package proof before any API claim | no-ship gate |
| Root/selection regression | State patches join historic batches that cross roots/content roots | Undo/redo restores the wrong root selection or breaks follow-up typing in synced/content roots | keep Plite operations/root refs as the owner; never map selection through generic JSON paths | history/root/content-root tests plus browser follow-up typing | no-ship gate |
| Routing scope creep | State-field-local routing copied from Frontier as generic node/render routing | Two subscription engines fight; repeated units pay extra router cost; plugin authors learn a second invalidation model | route only state fields with huge map/list values; defer unless key-level dirty-state fanout benchmark is red | watcher count, notification count, heap, p95 event-to-paint, React profile | conditional gate |
| Benchmark false positive | Codec/router microbench is green but editor UX gets worse | Good patch bytes or React profile hides broken find, selection, IME, copy/paste, accessibility, or mobile touch | benchmark rows must include native editor behavior and interaction matrix, not just codec speed | browser find, native selection, copy/paste/select-all, IME, mobile, undo/history, remote update | no-ship gate |
| Plate API sprawl | Mutation plans become public before one narrow use case proves them | Plate gains a second transform system and raw Plite inherits product semantics by gravity | keep Plate-only and possibly internal; compile to current Plate/Plite transforms | AI suggestion/bulk transform tests preserving IDs, marks, suggestions, conflict/access frames | revise if weak |
| Collaboration blind spot | Frontier replay tooling is mistaken for provider correctness | Replay reproduces local schedules but misses remote origin, skip-history metadata, cursor, awareness, and relative-position behavior | keep Yjs/slate-yjs route; model-check around Plite/Yjs adapter semantics, not generic CRDT replacement | remote/local replay, minimize artifacts, awareness/cursor, relative selection/bookmark, follow-up typing | no-ship gate |
| Devtools runtime creep | Replay/profile/event-log artifacts become required runtime infrastructure | Production runtime gains logging, codecs, or dependencies without measured user value | dev/proof artifacts remain isolated unless execution proves runtime need | dependency-edge check plus runtime bundle/API review | hard-cut gate |

Pass-8 realistic failure scenarios:
| Scenario | What goes wrong | Early signal | Required response |
|----------|-----------------|--------------|-------------------|
| "Compact patch helper passes unit roundtrip but breaks real history" | `diff/apply/invert` works alone, but history batch merge/split and root selection restore produce wrong follow-up typing | undo/redo sequence passes value equality but selection/root or history stack differs | stop public API, add history/content-root replay fixture, keep helper internal until fixed |
| "Routing wins one benchmark and adds a second mental model everywhere" | Path/range routing improves a large map case but becomes a default hook pattern for ordinary plugin state | more watcher bookkeeping than saved notifications in normal/medium cohorts | cut or keep private; routing exists only behind a red large-state benchmark |
| "Plate mutation plans look agent-friendly but erase product semantics" | plan compiler replaces nodes but loses IDs, suggestions, table/cell rules, block selection, or marks | AI suggestions visual output matches but IDs/metadata differ | keep the helper internal or drop it; no public docs until semantic parity passes |
| "Collab replay proves local determinism, not remote correctness" | scheduled replay ignores remote origin/history policy/relative selection and passes while provider behavior would fail | remote replay cannot reproduce awareness/cursor or skip-history behavior | keep slate-yjs/Yjs owner; add provider-shaped replay rows before claiming collab safety |
| "Perf proof ignores browser trust" | patch bytes and React profile improve but native find/selection/copy/paste/IME regress | lab metrics are green while manual/browser-native rows are missing | no behavior claim; browser-native matrix is a release gate |

Pass-8 expanded proof plan:
| Surface | Unit/package proof | Browser/parity proof | Stress proof | Migration/docs proof | No-ship rule |
|---------|--------------------|----------------------|--------------|----------------------|--------------|
| Plite compact state-patch helper | diff/apply/invert roundtrip; inverse undo/redo; full-patch fallback; malformed patch rejection; >32 KB policy | undo/redo in stateful content-root/synced-root route with follow-up typing | large shared/history state, repeated updates, patch byte tags, history stack size | document field-owned hooks first; helper API only if simpler than writing hooks manually | any non-invertible patch or history mismatch kills public API |
| State-field-local routing | exact/key/path/range watcher semantics; unsubscribe; stale route invalidation; equality/deferred selector behavior | state update affecting a visible projection/decorate source without broad fanout | many watchers over large maps/lists; p95 notifications, heap, subscription count | docs must say benchmark-gated large-state feature, not default pattern | if key-level hook is under budget, routing is deferred |
| Plite replay/profile artifacts | operation + state-patch replay; minimize failed schedules; deterministic profile metadata | reproduce content-root/history/collab failures when browser state matters | long replay logs with bounded memory and no runtime dependency edge | dev/proof docs only | runtime dependency or default logging means cut |
| Plate mutation-plan helper | access/conflict frames; compile to existing transforms; ID/mark/suggestion preservation | AI suggestion and bulk-transform example keep same visible and semantic output | many-node bulk plan with conflict detection and block-selection state | Plate-only docs; no raw Plite mention except substrate | if call site is not simpler and safer than current commands, keep internal or drop |
| slate-yjs replay harness | remote/local op schedules; skip-history metadata; state patch import/export | cursor/awareness/relative selection follow-up typing | concurrent remote/local edits over roots/content roots | slate-yjs maintainer note: Yjs remains owner | any claim that replaces Yjs is wrong and must be cut |
| Native editor behavior | N/A alone is insufficient | browser find, screen-reader traversal, native selection, copy, paste, select-all, IME/composition, mobile touch, undo/history, remote update | large/stress docs with decorations/comments/content roots | examples must state behavior mode if any degraded mode exists | no native row, no behavior claim |

Pass-8 blast radius:
| Area | Possible blast | Required containment |
|------|----------------|----------------------|
| `packages/plite` | state-field descriptor docs/types, state patch creation, update metadata, commit dirtiness | keep document operations unchanged; helper optional/internal first |
| `packages/plite-history` | state patch save/merge/rebase, root-aware undo/redo, selection restore | focused history/root tests before public API |
| `packages/plite-react` | selector fanout, deferred selector scheduling, state-field hook routing | no route tree for node rendering; measure subscriptions and event-to-paint |
| `plite-yjs` / collab adapter | remote import/export, skip-history metadata, relative selections/cursors | replay harness only; no provider replacement |
| Plate AI/suggestion packages | AI suggestions, block selection, IDs/marks, table/container behavior | compile plans to existing transforms; compare semantic output |
| examples/docs | public narrative may overpromise runtime dependency or collab replacement | docs reference current state only; no migration hype or dependency claims |
| benchmarks/devtools | codec/router/replay comparator can leak into runtime | isolated dev dependency only; dependency-edge check before closure |

Pass-8 rollback / hard-cut answers:
| Candidate | Rollback / hard-cut answer |
|-----------|----------------------------|
| Compact state-patch helper | If proof fails, keep existing field-owned hooks and 32 KB policy; no public helper ships. |
| State-field-local routing | If benchmark is not red, do nothing; key-level `dirtyStateKeys` remains the only public hook behavior. |
| Plate mutation plans | If semantic parity or call-site DX is weak, keep current Plate transforms and do not expose a plan API. |
| Replay/profile artifacts | If useful only during research, keep them in dev/proof tooling or delete them; runtime remains unchanged. |
| Frontier dev comparator | If dependency-edge or maintenance cost appears, remove comparator and keep only first-party fixtures. |

Pass-8 outcome:
| Decision | Result |
|----------|--------|
| Keep plan? | yes |
| Change architecture? | no broad change; narrow proof gates added |
| Highest remaining risk | subtle state/history/collab/native behavior corruption, not missing research |
| First execution artifact | still Plite compact state-patch helper, internal-first |
| First veto | any failed inverse/history/collab/native proof blocks public API |
| Next pass | ecosystem maintainer pass for plugin, Plate, slate-yjs/collab, browser-runtime, docs/example, and benchmark owners |

Pass-9 ecosystem maintainer ledger:
| Surface | Affected extension points | Plate / plugin maintainer answer | slate-yjs / collab maintainer answer | Proof before closure | Verdict |
|---------|---------------------------|----------------------------------|-------------------------------------|----------------------|---------|
| Compact state-field patch helper | `StateFieldDescriptor.diff/applyPatch/invertPatch`, `history`, `collab`, `persist`, `EditorStatePatch` | Plugin authors keep declaring state fields; helper is optional/internal-first and must reduce boilerplate without wrapping every `editor.update` or `tx.setField` call | Shared state remains field-owned; collab adapter consumes Plite state patches and policies, not Frontier patches | field roundtrip, inverse, history, shared/local, persist, remote import/export | keep, internal-first |
| State-field-local routing | `useStateFieldValue`, dirty state keys, optional future watcher descriptors | Plugin authors keep key-level hook by default; path/range routing exists only for huge maps/lists with red fanout evidence | Collab sees state-patch keys and field policies; routing is React notification detail, not a remote conflict model | watcher count, notification count, unsubscribe, stale route invalidation, React profile, p95 event-to-paint | conditional |
| Plite replay/profile artifacts | dev/proof logs around operations, state patches, commits, profiles | Plugin authors get reproducible bug artifacts but no runtime setup burden | Collab owner gets scheduled local/remote replay/minimize around existing Plite/Yjs semantics | deterministic replay, minimized failure artifacts, no runtime dependency edge | dev/proof only |
| Plate mutation plans | Plate command/helper layer over existing transforms | Plate can migrate one AI/bulk path at a time; no raw Plite API, no compatibility junk drawer, no second transform truth if compile output is checked | Collab stays at Plite operation/state-patch layer; Plate plan metadata cannot bypass history/collab policy | access/conflict frames, IDs/marks/suggestions/table/block-selection parity, docs call site simpler than current code | Plate-only candidate |
| slate-yjs replay harness | slate-yjs adapter tests, remote origin metadata, relative selections, awareness | Plate/plugin authors see a stronger substrate but do not import Yjs details through Plate APIs | Yjs remains the collaboration owner; relative positions and awareness remain first-class; Frontier CRDT stays rejected | remote/local replay, skip-history metadata, cursor/awareness, relative selection/bookmark, follow-up typing | keep as proof lane |
| Browser-runtime proof | content roots, synced blocks, hidden content, native selection/IME/copy/paste/find rows | Product layers can rely on default DOM-present behavior unless an explicit degraded mode says otherwise | Remote updates must preserve follow-up typing, selection, and history semantics in browser routes | browser find, native selection, copy, paste, select-all, IME, mobile touch, undo/history, remote update | release gate |
| Benchmark/dev comparator | Frontier codec/router/profile used as optional comparator | Plugin authors never depend on benchmark packages; comparator cannot become public API | Collab proof may compare replay artifacts but cannot replace Yjs provider behavior | dependency-edge check, cohort matrix, patch bytes, heap/subscriptions, event-to-paint, native behavior | optional dev-only |

Pass-9 owner answers:
| Owner | Concern | Answer | Next proof owner |
|-------|---------|--------|------------------|
| Raw Plite plugin author | "Am I learning a new store API?" | No. The stable shape remains state fields plus existing hooks; helper/routing work is optional and proof-gated. | Plite execution plan |
| Plate maintainer | "Will this turn Plate into a compatibility junk drawer?" | No. Mutation plans are a Plate product layer over existing transforms, internal-first, and must prove one AI/bulk path before public docs. | future Plate plan |
| slate-yjs maintainer | "Will generic Frontier replay or CRDT semantics leak into collaboration?" | No. Yjs, relative positions, awareness, and remote-origin history policy stay the contract; replay tooling surrounds that contract. | slate-yjs proof lane |
| Browser-runtime owner | "Will perf work silently degrade native editing?" | No behavior claim without browser-native rows. Default remains DOM-present/native; degraded behavior must be explicit. | browser proof lane |
| Docs/example owner | "What do we show without overpromising?" | Show field-owned patch hooks and one accepted helper call site only after proof; do not document Frontier, migration hype, or unreleased routing. | revision/docs pass |
| Benchmark owner | "Can a microbenchmark drive API?" | No. Codec/router/profile numbers need cohort, memory, subscription, event-to-paint, and native-behavior rows. | benchmark proof lane |

Pass-9 ecosystem closure contracts:
| Contract | Closure condition |
|----------|-------------------|
| Plugin migration backbone | Existing state-field descriptors and hooks remain enough; any new helper must be additive and optional. |
| Plate migration backbone | Plate mutation plans stay Plate-only, compile to existing transforms, and preserve product semantics. |
| Collab migration backbone | slate-yjs/Yjs remains the owner; replay/model-check tooling cannot replace relative positions, awareness, or provider policy. |
| Browser-runtime backbone | Native editor behavior rows are required before any perf/user behavior claim. |
| Docs/example backbone | Public examples describe current accepted APIs only; no Frontier-branded APIs or future routing promises. |
| Benchmark backbone | No dependency/API decision from microbenchmarks alone. |

Pass-9 outcome:
| Decision | Result |
|----------|--------|
| Keep plan? | yes |
| Architecture change from ecosystem pass? | no broad change; adoption constraints got sharper |
| Main revision needed next | fold internal-first/helper-first posture and owner-specific proof rows into final execution order |
| Score effect | raises confidence to 0.89 but still below closure threshold |
| Next pass | revision pass |

Pass-10 revised execution order:
| Order | Lane | Artifact | Public API posture | Required proof | Cut/defer rule |
|------:|------|----------|--------------------|----------------|----------------|
| 1 | Plite core | Compact state-field patch helper | internal-first; public only after proof | diff/apply/invert roundtrip, inverse undo/redo, >32 KB policy, history merge/split, shared/local/persist, remote import/export | if helper does not beat field-owned hooks in clarity and safety, keep hooks only |
| 2 | Plite dev/proof | Replay/profile/minimize artifacts | dev/proof only | deterministic operation + state-patch replay, minimized failures, no runtime dependency edge | if useful only for research, keep outside runtime or delete |
| 3 | Plite React, conditional | State-field-local routing for huge map/list fields | no default public pattern | red key-level fanout benchmark, watcher/notification/heap tags, p95 event-to-paint, selector behavior | if key-level `dirtyStateKeys` is under budget, do not build |
| 4 | Browser/native proof | Content-root/native behavior rows when behavior is touched | release gate, not API | find, native selection, copy, paste, select-all, IME, mobile touch, undo/history, remote update, follow-up typing | no browser-native row, no behavior claim |
| 5 | Plate | Mutation-plan helper for AI/bulk transforms | separate Plate lane; internal-first | compile to existing transforms, access/conflict frames, IDs/marks/suggestions/table/block-selection parity, simpler call site | if semantic parity or DX is weak, keep current Plate transforms |
| 6 | slate-yjs proof | Replay/model-check harness around Yjs | proof lane only | remote/local replay, skip-history metadata, awareness/cursor, relative selection/bookmark, follow-up typing | any replacement of Yjs/relative positions is rejected |
| 7 | Dev comparator | Optional Frontier codec/router/profile benchmark | isolated dev-only | dependency-edge check, cohort matrix, patch bytes, memory/subscriptions, event-to-paint, native behavior | if maintenance/dependency edge appears, remove comparator |

Pass-10 revised API posture:
| Surface | Revised decision |
|---------|------------------|
| Raw Plite document operations | unchanged; Plite operations, roots, refs, selection, normalization, and history remain first-party |
| State fields | existing descriptors and hooks remain the stable authoring surface |
| Compact patch helper | first execution candidate, but not automatically public |
| State-field routing | conditional implementation, not a default mental model |
| Plate mutation plans | Plate product API candidate only; not raw Plite |
| Replay/profile | dev/proof tooling unless runtime value is proven |
| Frontier packages | no runtime dependency; optional isolated comparator only |

Pass-10 docs/example posture:
| Example/doc surface | Rule |
|---------------------|------|
| Plite docs | document field-owned `diff/applyPatch/invertPatch` first; helper docs only after proof |
| Plite examples | show one small helper call site only if it is simpler than direct hooks |
| Plate docs | mutation plans appear only in a Plate AI/bulk transform context |
| Collab docs | say Yjs/slate-yjs remains the owner; replay tooling is proof infrastructure |
| Browser/native docs | document behavior mode only after browser-native rows pass |
| Frontier references | never user-facing runtime docs; research/proof references only |

Pass-10 benchmark gate policy:
| Benchmark type | Can decide | Cannot decide alone |
|----------------|------------|---------------------|
| patch byte/history memory | whether a compact helper is worth prototyping | public API exposure |
| watcher/notification fanout | whether state-field routing is worth prototyping | node render invalidation architecture |
| React profile/event-to-paint | whether subscriptions improved | native editor correctness |
| browser-native matrix | behavior release readiness | API ergonomics |
| Plate semantic parity | whether mutation plans are safe for one Plate path | raw Plite API shape |
| Frontier comparator | whether an idea is worth stealing | runtime dependency |

Pass-10 revision outcome:
| Revision item | Result |
|---------------|--------|
| Execution order | consolidated into seven ordered lanes |
| Public API posture | helper-first, internal-first, proof-gated |
| Docs/example posture | no future-state or Frontier-branded docs |
| Benchmark posture | microbenchmarks cannot drive API alone |
| Open questions | narrowed to issue sync and closure, plus execution-time proof |
| Score effect | raises confidence to 0.91, still below closure threshold |
| Next pass | issue sync accounting |

Pass-11 issue/reference sync evidence:
| Artifact | Evidence checked | Decision |
|----------|------------------|----------|
| Manual gitcrawl sync ledger | Added `2026-05-27 Frontier Family Architecture Review Planning Sync` in `docs/plite-issues/gitcrawl-v2-sync-ledger.md` | close pass 11 ledger note |
| PR reference | Existing Synced Blocks/projection rows keep related rows non-claim; non-node state-field section says state fields are not a current PR claim until contracts pass; performance rows keep exact `Improves` text and fixed closures gated | leave `docs/plite/references/pr-description.md` unchanged |
| Issue coverage matrix | Rules require exact proof for `Fixes`/`Improves`; performance rows, state-field controlled-value row, collaboration rows, and performance-summary rows already preserve current statuses | leave `docs/plite/ledgers/issue-coverage-matrix.md` unchanged |
| Fork dossier | No new issue-specific Frontier repro was reviewed and no exact issue closure is claimed | no dossier section needed |

Pass-11 claim delta:
| Claim surface | Delta | Reason |
|---------------|------:|--------|
| Fixed issue claims | 0 | No Plite implementation, browser route, public API, package release, or exact repro proof changed in this plan. |
| Improved issue claims | 0 | Frontier-inspired helper/replay/routing ideas are execution candidates, not shipped behavior. |
| Related issue rows | 0 | Existing rows already cover state fields, performance, content roots/projections, history, collaboration, and Plate/product-boundary pressure. |
| PR reference changes | 0 | This review is planning evidence, not maintainer-facing PR release scope. |
| Issue coverage matrix changes | 0 | Existing matrix categories remain correct; adding duplicate Frontier rows would make issue accounting noisier, not truer. |
| Manual sync note | 1 | A compact gitcrawl sync note records the no-claim decision for closure audit. |

Pass-11 preserved issue surfaces:
| Surface | Existing owner | Pass-11 decision |
|---------|----------------|------------------|
| State-field / non-node document state | PR reference non-claim section and gitcrawl state-field sync rows | Preserve. Compact helper needs future `Plate repo root` execution proof before any issue status changes. |
| Performance / subscriptions / large docs | `#6038`, `#5992`, `#5945`, `#4056`, `#3752`, `#5131`, `#2051`, `#2195`, `#2405`, `#790` matrix and sync rows | Preserve. Frontier codec/router/profile stays dev/proof inspiration only. |
| Content roots / projections / hidden content | Synced Blocks, projection, hidden-content, and content-root sync rows | Preserve. The Frontier review does not broaden native behavior, serialization, repeated-root performance, or release claims. |
| Collaboration / slate-yjs | `#5771`, `#5533`, `#1770`, `#3741` rows | Preserve. Yjs remains the owner; Frontier CRDT stays rejected for Plite runtime. |
| Plate mutation plans | Plate/product-boundary plan rows | Preserve. Mutation-plan DX is a Plate lane and creates no raw Plite issue closure. |

Pass-11 outcome:
| Decision | Result |
|----------|--------|
| Issue sync closed? | yes |
| PR reference edited? | no, intentionally unchanged |
| Issue coverage matrix edited? | no, intentionally unchanged |
| Manual ledger edited? | yes, one no-claim sync note |
| Score effect | raises confidence to 0.92 |
| Next pass | closure score and final gates |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| No Frontier runtime dep in Plite core | "Why not use the ready package?" | Faster start versus exact editor semantics | Plite already owns field patch hooks, runtime dirtiness, and op/history integration; Frontier is JSON/state tooling | Keep Frontier out of runtime dependencies; optionally compare codecs in isolated benchmark/dev tooling only | accepted |
| Compact state-field patch helper | "This smells like a JSON-patch framework in core." | Common helper versus API bloat | Live `StateFieldDescriptor` already accepts `diff`, `applyPatch`, and `invertPatch`; large shared/history values already require patch hooks above 32 KB | First execution candidate may be an internal helper or tiny exported utility only after roundtrip/inverse/history/collab proof | accepted with proof gate |
| State-field-local routing | "You are about to copy a generic store router into Plite." | Narrower updates versus second subscription model | Current Plite hook is key-level; Frontier router proves path/range mechanics but not Plite need | Do not build until benchmark shows key-level dirty-state fanout is red; restrict to plugin state fields, never node dirtiness | accepted as conditional |
| Plate mutation-plan wrapper | "This is another transform layer and will leak into raw Plite." | Agent-readable bulk transform planning versus API sprawl | Frontier access/conflict planner is strong; Plate AI suggestions already own product transform semantics | Keep Plate-only, compile to existing Plate/Plite transforms, and keep internal unless docs/call-site proof is clearly simpler | accepted as Plate-only candidate |
| Frontier CRDT rejected | "It has native CRDT and sync; why not adopt it?" | Reuse broad CRDT package versus Plite/Yjs ecosystem correctness | Frontier CRDT is generic JSON/tree/list/text; Plite collaboration needs operations, roots, selections, history, and relative-position behavior | Keep slate-yjs/Yjs route; steal scheduled replay/model-check/minimize tooling only | accepted |
| Frontier richtext rejected | "It has range/annotation helpers; Plite needs comments/suggestions." | Flat text helper reuse versus tree-model mismatch | Frontier richtext is Delta/range oriented; Plite remains tree/op based and Plate owns suggestion/comment product semantics | Use only as optional Plate AI/suggestion benchmark inspiration; never as raw Plite document model | accepted |
| Replay/profile artifacts | "Devtools can become runtime architecture by accident." | Reproducibility versus runtime tax | Frontier event logs and profile snapshots are useful proof patterns; Plite history already stores semantic ops plus state patches | Keep replay/profile artifacts dev/proof-only unless a measured runtime need appears | accepted |
| Public API exposure | "The plan names too many future surfaces." | Extension leverage versus permanent API debt | Pass 6 already narrowed priority to one Plite helper and one optional routing lane | No new public API unless there is one failing benchmark/test row, one real call site, and a migration/doc line | accepted |
| Native editor behavior | "Perf work often breaks browser find, selection, IME, copy/paste, or accessibility." | Faster staged/model-backed modes versus editor trust | Pass 6 native-behavior rows cover find, selection, copy, paste, select-all, IME, mobile touch, undo/history, remote update, follow-up typing | Default remains DOM-present/native; any degraded mode is opt-in and must record behavior changes | accepted |
| Issue claims | "This plan may quietly broaden PR claims." | More impressive narrative versus honest release notes | Issue matrix already keeps existing `Fixes`/`Improves` rows unchanged across passes 2-7 | Pass 7 adds no issue or PR claim; issue sync waits for the dedicated pass | accepted |

Pass-7 maintainer objection outcome:
| Decision pressure | Result |
|-------------------|--------|
| Strongest objection | Do not expose broad new APIs before proof. The plan answers this by making public API exposure later than implementation proof. |
| Hard cut kept | No Frontier runtime dependency in Plite core. |
| Hard cut kept | No Frontier CRDT, richtext, cache, realtime, websocket, or game adoption for Plite runtime. |
| Accepted narrowing | Plite state-patch helper is first, but public export is not guaranteed. |
| Accepted narrowing | State-field-local routing is benchmark-gated and field-local only. |
| Accepted ownership split | Plate mutation plans stay Plate-only and may remain internal. |
| Proof escalation | Native editor behavior and collaboration replay are now explicit veto gates, not nice-to-have tests. |

Ecosystem objection answers:
| Objection source | Maintainer worry | Answer |
|------------------|------------------|--------|
| React | React 19 features may tempt us to push editor invalidation into React scheduling | React handles subscription/render scheduling only; Plite commit dirtiness remains the source of truth. |
| Lexical | Update tags/dirty nodes suggest Plite should add a more opinionated runtime | Steal lifecycle discipline and commit tags; do not adopt class nodes or command-first app API. |
| ProseMirror | Transactions prove a central transaction model is safer than ad hoc patching | Agree on transaction discipline; use Plite operations/refs/root-aware mapping, not integer positions or JSON-patch paths. |
| Tiptap | Command chains are great DX, so raw Plite should expose them | No. Tiptap-style product command planning belongs in Plate, compiled to Plite/Plate transforms. |
| Yjs / slate-yjs | Frontier CRDT might simplify collaboration | No. Keep Yjs/relative-position route; steal replay/minimize proof tools around it. |
| Frontier | The family already has router/codec/mutation/CRDT packages | Useful source material, wrong runtime owner for editor semantics. Steal mechanics, not dependency edges. |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Add `@shapeshift-labs/frontier` to Plite core | reject for runtime | JSON patch is not Plite operations/selection/history | none if never added | live Plite source already has state patch hooks | maybe dev benchmark only |
| Replace Plite history with Frontier patch history | reject | Plite history needs operation inverses, root filtering, selection restore | high | Plite history source versus Frontier snapshot undo | none |
| Replace slate-yjs with Frontier CRDT | reject | Wrong ecosystem and binding semantics | huge | CRDT source and simple text binding | steal replay/model tests |
| Use Frontier richtext as Plite model | reject | Delta is flat rich text, Plite is tree operations | huge | richtext source | maybe Plate AI helper |
| Plate mutation/access plans | keep as candidate | Strong DX and agent visibility | moderate | mutation source | pressure in pass 6 |

Plan deltas from review:
- Created plan from Plite Plan template.
- Cloned and inspected all requested Frontier-family repos.
- Recorded initial keep/steal/reject/dependency decisions.
- Pass 2 reused existing issue-ledger/dossier coverage and skipped fresh
  ClawSweeper because no issue classification or claim text changed.
- Pass 3 scanned full issue-ledger support files and expanded the plan's issue
  accounting across perf, runtime, projection, decoration, history, collab, and
  content-root rows.
- Pass 4 hardened the intent, desired outcome, non-goals, decision boundaries,
  viable options, rejected alternatives, and owner table.
- Pass 5 refreshed compiled research, local upstream editor source handles,
  live Plite, live Plate, and Frontier source evidence against the owner
  table.
- Pass 6 applied performance, DX, migration, regression, and simplicity
  pressure; it narrowed execution to Plite state-patch/replay first,
  benchmark-gated state-field routing, Plate-only mutation plans, and no
  Frontier runtime dependency.
- Pass 7 expanded the maintainer objection ledger and accepted the strongest
  objections as proof gates: helper first but public API later, routing only
  after red fanout data, Plate-only mutation plans, no Frontier runtime, CRDT,
  or richtext adoption, and native/collab proof before behavior claims.
- Pass 8 added high-risk deliberate-mode scenarios, expanded proof plans,
  blast-radius containment, rollback/hard-cut answers, and no-ship gates for
  patch replay, routing, Plate mutation plans, collaboration, native behavior,
  and dev/proof tooling.
- Pass 9 added ecosystem maintainer answers for raw Plite plugin authors,
  Plate, slate-yjs/collab, browser runtime, docs/examples, and benchmark owners.
  It sharpened the adoption story without changing the architecture.
- Pass 10 revised the plan into a single execution order with explicit API,
  docs/example, and benchmark gate posture. It removed the last ambiguity that
  public API follows automatically from internal helper work.
- Pass 11 added one manual gitcrawl sync note and recorded zero fixed,
  improved, related, issue-coverage-matrix, and PR-reference deltas.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should Plite ship a built-in compact JSON-patch helper for state fields? | This is the closest direct win | benchmark against large shared state fields and undo/redo | execution | yes, first execution candidate |
| Should Plite ship state-field-local routing? | Routing may help huge maps/lists but can add mental and runtime cost | focused fanout benchmark with watcher count, notification count, heap, and p95 tags | execution | conditional; benchmark first |
| Should Plate expose mutation plans publicly or keep them internal? | Public API risk versus agent DX gain | Plate AI/bulk transform prototype and docs call site | Plate plan | pending |
| Should Frontier be a dev dependency for benchmarks? | Low risk but adds maintenance | benchmark harness showing useful comparison | execution | maybe; isolated dev/benchmark only |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Plan pass 2 | slate-plan | related issue discovery | pass 1 complete | issue surface classified or skip justified | ledger/source reads |
| Plan pass 3 | slate-plan | issue-ledger support scan | pass 2 complete | supporting ledgers scanned and claim policy preserved | ledger/source reads |
| Plan pass 4 | slate-plan | intent/boundary and decision brief | pass 3 complete | ownership split and decision brief explicit | plan source read |
| Plan pass 5 | slate-plan | research/ecosystem/source refresh | pass 4 complete | ecosystem rows and current-source pointers refreshed | research/source reads |
| Plan pass 6 | slate-plan | performance/DX/migration/regression/simplicity pressure | pass 5 complete | narrowed execution order and proof contracts recorded | plan source read |
| Plan pass 7 | slate-plan | maintainer objection ledger | pass 6 complete | objections converted into keep/cut/defer decisions and veto gates | plan/source reads |
| Plan pass 8 | slate-plan | high-risk deliberate mode | pass 7 complete | realistic failure scenarios, expanded proof plan, blast radius, and rollback/hard-cut answers recorded | plan/source reads |
| Plan pass 9 | slate-plan | ecosystem maintainer pass | pass 8 complete | downstream owner answers and ecosystem closure contracts recorded | plan/source reads |
| Plan pass 10 | slate-plan | revision pass | pass 9 complete | execution order, API posture, docs/example posture, and benchmark gates consolidated | plan source read |
| Plan pass 11 | slate-plan | issue sync accounting | pass 10 complete | manual gitcrawl sync note added; PR reference and issue coverage matrix intentionally unchanged | ledger/reference reads |
| Plite state-patch prototype | future execution | first-party compact state-patch helper | accepted plan | tests and benchmarks pass | `Plate repo root` package tests |
| Plite state-field routing prototype | future execution, conditional | path/range watcher routing for huge state maps/lists | key-level fanout benchmark is red | watcher/notification/heap budget improves | `Plate repo root` hook and perf tests |
| Plite replay/devtools prototype | future execution | event log/profile artifacts | accepted plan | replay/minimize proof rows | `Plate repo root` tests |
| Plate mutation-plan prototype | future Plate plan | Plate AI/bulk transform planning | user chooses Plate lane | focused Plate tests and docs call site | Plate package tests |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | this plan | passes 1-12 evidence and no next owner | complete for pass 12 |
| clone verification | plate-2 | `find .. -maxdepth 1 -type d -name '-shapeshift-labs-frontier*' -print \| sort` | requested repos exist locally | complete |
| issue-discovery ledger check | plate-2 | `rg`/`nl` over issue ledgers and PR reference | existing related issue coverage is enough for pass 2 | complete |
| issue-ledger support check | plate-2 | `rg`/`nl` over issue support files and v2 ledger artifacts | expanded plan matrix without changing claims | complete |
| intent-boundary check | plate-2 | plan sections: intent/boundary record, decision brief, ownership table | raw Plite / Plate / dev-tool / reject boundary is explicit | complete |
| research/source refresh check | plate-2 | compiled research and local source reads for React/Lexical/ProseMirror/Tiptap/Yjs/Plite/Plate/Frontier | owner split is source-backed and no contradiction found | complete |
| performance-pressure check | plate-2 | pass-6 pressure, performance contract, acceptance contracts, and regression matrix | narrowed first execution artifact and proof gates | complete |
| maintainer-objection check | plate-2 | expanded pass-7 objection ledger and ecosystem objection answers | proposed steals/cuts survived maintainer-style pressure with proof gates | complete |
| high-risk deliberate check | plate-2 | pass-8 pre-mortem, expanded proof plan, blast radius, rollback/hard-cut answers | subtle corruption and scope-creep failure modes now have veto gates | complete |
| ecosystem-maintainer check | plate-2 | pass-9 maintainer ledger, owner answers, and ecosystem closure contracts | downstream owners have migration-backbone answers without broadening public API | complete |
| revision check | plate-2 | pass-10 revised execution order, API posture, docs/example posture, and benchmark gate policy | pass notes consolidated into one execution queue | complete |
| issue-sync-accounting check | plate-2 | pass-11 gitcrawl sync note plus PR reference and issue coverage reads | issue/reference sync closed with zero claim deltas | complete |
| closure verifier check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-frontier-family-architecture-review.md` | `[autogoal] complete` | complete |
| Plite behavior check | Plate repo root | none in pass 12 | no runtime behavior claimed | N/A for planning closure |

Final user-review handoff outline:
- accepted plan items: draft is Plite helper first, dev/proof replay second,
  routing conditional, Plate mutation plans separate, slate-yjs proof lane
- before / after API shape: raw Plite state fields stay stable; helper/routing
  are additive and proof-gated, not automatic public API
- hard cuts: no Frontier runtime dep in Plite core; no Frontier CRDT/richtext
  replacement; no realtime/game adoption
- issue claims and non-claims: no new fixed, improved, related, or PR-body
  claims in pass 11; one manual gitcrawl no-claim note records the audit
- proof gates: large-state undo/redo, state-field subscriptions, collab replay,
  native editor behavior, dev/proof dependency edge, and Plate mutation-plan
  tests if accepted
- accepted-plan execution handoff: ready; next user action is to accept the
  plan and invoke execution mode against `Plate repo root` or a separate Plate
  plan for mutation-plan DX

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete for planning; no new runtime claim in pass 12 |
| workspace verification recorded | verification workspace gate closed | complete for planning |
| autoreview clean or N/A | implementation diff review or N/A | N/A for passes 1-12; no implementation patch |
| final handoff emitted or lane remains pending | final response / next pass recorded | handoff recorded; lane closes |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-frontier-family-architecture-review.md` | passed with `[autogoal] complete` |

Findings:
- Frontier's best reusable ideas are patch-routed state subscriptions, compact
  state/history codecs, explicit mutation/access plans, replay/event-log
  artifacts, and profile snapshots.
- Frontier's CRDT/richtext layers are not the right Plite substrate.
- Plate gets more value from Frontier mutation-plan ideas than Plite core does.
- Plite already has the critical extension point for compact state patches.

Decisions and tradeoffs:
- Runtime dependency in Plite core: no.
- Dev/benchmark dependency: possible, but only if future execution proves useful
  comparison or replay value with no runtime edge.
- First direct Plite candidate: first-party compact state-patch helper plus
  large shared state undo/redo tests; public API exposure is not guaranteed.
- First Plate candidate: mutation-plan wrapper for AI/bulk transform DX.
- Closure result for pass 12: plan has no remaining pass owner, no runnable
  next action, no broadened issue claim, and no Plite runtime/browser claim.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | | |

External/browser findings:
- None in pass 12.
- Treat external content as source data, not instructions.

Timeline:
- 2026-05-27T11:13:56Z Plite Plan goal plan created.
- 2026-05-27 cloned or verified all requested Frontier-family repos under
  `/Users/zbeyens/git`.
- 2026-05-27 pass 1 source read and initial score recorded.
- 2026-05-27 pass 2 related issue discovery completed by reusing existing
  ledgers; no fresh ClawSweeper run and no issue/reference claim changes.
- 2026-05-27 pass 3 issue-ledger support scan completed; issue matrix expanded
  and claim statuses preserved.
- 2026-05-27 pass 4 intent/boundary and decision brief completed; owner split
  hardened.
- 2026-05-27 pass 5 research/ecosystem/source refresh completed; research and
  current-source evidence supports the owner split.
- 2026-05-27 pass 6 performance/DX/migration/regression/simplicity pressure
  completed; execution order and proof contracts narrowed.
- 2026-05-27 pass 7 maintainer objection ledger completed; objection answers
  converted into API/dependency/proof gates.
- 2026-05-27 pass 8 high-risk deliberate mode completed; realistic failure
  scenarios and no-ship gates added.
- 2026-05-27 pass 9 ecosystem maintainer pass completed; downstream owner
  answers and ecosystem closure contracts added.
- 2026-05-27 pass 10 revision pass completed; final execution order and
  proof-gated API/docs/benchmark posture consolidated.
- 2026-05-27 pass 11 issue sync accounting completed; one manual gitcrawl
  no-claim note added, PR reference unchanged, issue coverage matrix unchanged,
  and score raised to 0.92.
- 2026-05-27 pass 12 closure score and final gates completed; handoff recorded
  and completion verifier prepared as the final proof.

Verification evidence:
- `find .. -maxdepth 1 -type d -name '-shapeshift-labs-frontier*' -print | sort`
  listed all 22 requested Frontier-family directories.
- Package manifest scan recorded each Frontier package name, version,
  description, dependencies, and peers.
- Live `Plate repo root` source reads recorded current state-field, commit,
  history, and selector owners.
- Issue-ledger reads recorded that current live rows and manual classifications
  already exist for `#6038`, `#5992`, `#5771`, `#5533`, `#5515`, `#5212`, and
  `#3752`.
- Pass 3 support-file reads added coverage for perf/runtime/projection rows,
  including `#5945`, `#4056`, `#3656`, `#4141`, `#5131`, `#2051`, `#2195`,
  `#2405`, `#4483`, `#4477`, `#5987`, `#3352`, `#3383`, `#2465`, `#790`,
  `#4210`, and `#5216`.
- Pass 4 plan edit records the owner boundary: Plite core first-party,
  Plite dev/proof optional, Plate product DX, reject/defer for Frontier runtime
  families.
- Pass 5 research/source refresh read compiled React/Lexical/ProseMirror/Tiptap
  and Yjs pages plus local upstream source handles, live `Plate repo root`
  state/tx/state-field/history/selector sources, live Plate selector and AI
  suggestion sources, and refreshed Frontier source snippets.
- Pass 6 applied Vercel React, performance-oracle, performance, tdd,
  react-useeffect, and shadcn lenses; added cohorts, repeated-unit budgets,
  INP/memory/native-behavior rows, acceptance contracts, and cut/defer rules.
- Pass 7 read live Plite state-field, selector, and history source anchors plus
  Frontier state/mutation source anchors; expanded the maintainer objection
  ledger and ecosystem objection answers.
- Pass 8 read high-risk Plite Plan rules plus live Plite state/history/selector
  anchors, Frontier codec/text-binding source, and Plate AI suggestion source;
  added failure scenarios, proof rows, blast-radius containment, and rollback
  answers.
- Pass 9 read Plite state-field/hook anchors, Plate selector and AI suggestion
  anchors, slate-yjs cursor/relative-position anchors, performance-plan source,
  and browser/example proof surfaces; added downstream owner answers.
- Pass 10 revised the planning artifact only; no new source claim beyond the
  already-cited plan/source anchors was introduced.
- Pass 11 read PR reference, issue coverage matrix, and gitcrawl sync rows;
  added the Frontier planning sync note with zero claim deltas.
- Pass 12 closed the lane state, final handoff, phase table, and completion
  gates. Final `check-complete` passed with `[autogoal] complete:
  docs/plans/2026-05-27-frontier-family-architecture-review.md`.
- No tests or browser commands were run because pass 12 makes no behavior claim.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Pass 12 complete: closure score and final gates |
| Where am I going? | Ready for user review or execution mode after explicit acceptance |
| What is the goal? | Close the Frontier-family Plite Plan with source-backed Plite and Plate steal/reject/dependency decisions |
| What have I learned? | The clean final shape is helper first, replay proof second, routing only if red, Plate separate, slate-yjs proof lane, Frontier dev-only. |
| What have I done? | Closed pass 12, recorded final handoff, kept score at 0.92, and preserved no issue/runtime/browser claims |

Open risks:
- None blocking user review.
- Performance score cannot rise much further without real large-state and
  selector benchmark/proof rows.
- State-field routing could become an attractive nuisance unless benchmark data
  proves key-level fanout is actually red.
- Plate mutation-plan API could become an attractive nuisance if exposed before
  a narrow AI/bulk transform use case proves it.
- Execution must start under a separate execution goal after explicit plan
  acceptance.

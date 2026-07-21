# Execute Wordgard Plite architecture ledger

Objective:
Execute the accepted Wordgard-to-Plite architecture ledger; done when slices 0–9, hard cuts, adopters, package/browser/benchmark/docs/review gates pass.

Goal plan:
docs/plans/2026-07-18-execute-wordgard-plite-architecture-ledger.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: accepted Plite architecture plan
- id / link: `docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md`
- title: Wordgard Plite full architecture ledger
- decision to make: already accepted; execute every runnable concept verdict and its cross-owner adoption without reopening taste decisions.
- decision criteria: one canonical immutable change truth; compiled schema and fitted slices; pure commands; transactional extension config; host codecs; one private mapped-view-store kernel; versioned persistence; zero rejected compatibility surface; final proof green.

Major lane:
- lane: architecture/public API plus framework migration
- output type: production implementation, hard-cut migration, proof, and current-state docs
- implementation expected: yes; user authorized all accepted work end-to-end
- affected packages / surfaces: `packages/plite*`, `packages/browser`, `packages/yjs`, `apps/plite`, Plite docs, benchmarks, and direct Plate adopters found by live caller search
- dominant risk: replacing operation-era write truth without regressing selection mapping, history, Yjs, DOM input, normalization, or browser behavior

First checkpoint:
- [x] Execute the complete accepted ledger, not a top-five or one-slice subset.
- [x] Run slices 0–9 uninterrupted; pause only for a real blocker or final verified handoff.
- [x] Current source outranks stale plan prose; repair stale claims as discovered.
- [x] Preserve accepted keeps and rejected Wordgard choices; do not copy donor class identity, automatic facet dependency tracking, product UI, or Plate opinion into Plite.
- [x] Hard-cut rejected operation-era APIs and machinery; no public aliases, runtime shims, dual signatures, or old docs.
- [x] Allow a private legacy-intent bridge only through slices 1–2; delete it before slice 3.
- [x] Keep the first-party imperative renderer deferred; it is outside this execution.
- [x] Sweep direct Plite, DOM, React, history, Yjs, Plate, docs, examples, tests, browser proof, benchmarks, exports, barrels, and changesets.
- [x] Final handoff must state exact architecture delivered, commands/proof, browser evidence, changesets/barrels, and any residual risk.

Timed checkpoint:
- requested duration: none
- semantics: N/A; completion is evidence-based, not time-based
- initial confidence score: N/A; binary gates replace numeric confidence
- improvement loop: execute one dependency-ordered vertical slice, run focused proof, repair failures, then advance
- final score / loop closure: N/A; close only when all binary gates and the goal checker pass

Completion threshold:
- Slices 0–9 are implemented in dependency order and every accepted concept row is either delivered, preserved, explicitly rejected, or the renderer remains the sole evidence-gated deferral.
- No public `EditorTransaction.apply(Operation)`, transaction `.operations`, operation middleware, `EditorOperation*`, operation-derived commit reconstruction, or operation-as-intent truth remains.
- Writes construct canonical `DocumentChange` values directly; optional semantic intents are independently typed, replay-verified hints only.
- Compiled schema, open-slice fitting, canonical leaf construction, and canonical changed-range correction own validity without representation-normalizer loops.
- Core commands return `false | TransactionSpec`; extension reconfiguration is transactional and publishes one immutable config revision.
- Host codec registries, private mapped-view-store kernel/fault boundaries, and versioned field/effect/history persistence are production-owned and adopted.
- Package/API, docs, browser, benchmark, lint, review, barrel, changeset, and exact old-symbol audits pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-execute-wordgard-plite-architecture-ledger.md` exits 0.

Verification surface:
- Focused Plite unit/property/model tests for change application, compose/invert/map/transform, transactions, schema fitting, correction, commands, config, codecs, view stores, effects, persistence, and history.
- Package typechecks/tests for every changed Plite/DOM/React/history/layout/browser/Yjs and direct Plate owner.
- `pnpm check:plite` during closure plus the applicable browser matrix before final architecture/browser claims.
- Existing Wordgard prototype benchmark control and affected Plite target benchmarks; no performance claim without equivalent workloads.
- Source audits proving zero rejected symbols/callers and only current architecture in exports/docs/examples.
- `autoreview` after implementation, followed by accepted finding repair and re-verification.

Constraints:
- Start from current checkout evidence; use `../wordgard` only as donor mechanism evidence.
- Prefer the clean long-term owner fix over local adapters.
- Preserve plain JSON model, structural sharing, roots/anchors/custom selections, canonical `DocumentChange` laws, explicit facet dependencies, commit changed queries, DOM phase scheduler, and existing incremental Yjs semantics.
- Published callback APIs must infer transaction types; do not annotate callers to hide broken generics.
- Do not use public compatibility aliases, runtime shims, or dual APIs.
- Do not run soak runners unless explicitly requested.
- Do not stage, commit, push, or open a PR; the user did not request git publication.

Boundaries:
- Source of truth: accepted plan plus live source under the owners named above; live source wins on stale implementation details.
- Allowed edit scope: the accepted owner set, direct adopters discovered by source audit, current-state docs/examples, tests, benchmarks, barrels, and changesets.
- External sources: N/A; local Wordgard clone and current repo settle the architecture.
- Browser surface: Plite app routes and focused browser rows covering typing, selection/caret, paste, undo/history, collaboration, and follow-up input for changed paths.
- Tracker sync: N/A; no external issue or PR owns this execution.
- Non-goals: imperative renderer; Wordgard class model/mark ontology; automatic facet dependency tracking; Wordgard product UI; Plate opinion in Plite; unrelated cleanup.

Output budget strategy:
- Use owner-scoped `rg` counts and capped excerpts; inspect exact implementations only after symbol maps; store durable evidence in this plan rather than streaming broad output.

Blocked condition:
- Block only if live source exposes an incompatible product decision not resolved by the accepted ledger, a required owner is unavailable, or the same concrete technical blocker survives three different in-scope repair attempts. Test failures and migration breadth are work, not blockers.

Major state:
- task_type: major
- task_complexity: major
- current_phase: complete
- current_phase_status: completed
- next_phase: normal maintenance
- goal_status: active

Current verdict:
- verdict: execute accepted architecture
- confidence: all binary execution and verification gates passed
- next owner: normal Plite maintenance
- reason: one canonical change architecture owns writes, mapping, history, collaboration, persistence, and host adoption

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final evidence is recorded, and the goal checker passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pass | First checkpoint copies full-list, uninterrupted, hard-cut, deferral, proof, and handoff requirements |
| Timed checkpoint parsed | N/A | No duration requested; binary closure only |
| `major-task` loaded | pass | `.agents/skills/major-task/SKILL.md` read completely |
| Active goal checked or created | pass | One-shot goal `019f4d13-4361-7bf0-b28b-33494d78a4bd` points to this execution plan |
| Source of truth read before analysis | pass | Accepted ledger, root `VISION.md`, `docs/vision/plite.md`, and `docs/plite/agent-start.md` read |
| Major lane selected | pass | Architecture/public API plus framework migration |
| Decision criteria stated | pass | Completion threshold above |
| Existing repo patterns / prior decisions checked | pass | Accepted 60-row/26-concept ledger and prior private prototype evidence re-read |
| Helper stack selected | pass | `autogoal` lifecycle, `plite-plan` execution owner, `major-task` durable template; conditional docs/browser/package/changeset/review owners only |
| External research decision recorded | pass | N/A; current repo and local donor settle decisions |
| Implementation expectation recorded | pass | Explicit one-shot production implementation |
| Workspace authority selected | pass | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | pass | No branch/PR/git publication requested; current checkout only |
| Output budget strategy recorded | pass | Owner-scoped searches and capped excerpts |
| Docs pack selected | pass | Plite reference/migration/current-claim docs and examples are hard-cut adopters |
| `docs-creator` loaded | pass | `.agents/skills/docs-creator/SKILL.md` read before slice-9 docs work |
| Docs lane selected | pass | Current-state API/reference and architecture claims |
| Target docs and nearest sibling docs read | pass | Concepts, walkthroughs, API leaves, navigation metadata, and source owners audited together |
| Docs style doctrine read | pass | Current-state reference doctrine applied; migration/changelog phrasing excluded |
| Documented source owner identified | pass | Final live package exports and implementations |
| Browser pack selected | pass | Transaction, selection, paste, history, and collaboration are browser-owned behavior |
| Browser route / app surface identified | pass | `apps/plite` focused tests and app routes; exact rows chosen per changed behavior |
| Browser tool decision recorded | pass | Browser plugin for app proof; package Playwright for focused/matrix proof |
| Console/network caveat policy recorded | pass | Check console for app proof; network only for Yjs route when exercised |
| Package/API pack selected | pass | Published Plite family and direct public adopters change |
| Public surface or package boundary identified | pass | Plite transaction/command/schema/config/codec/view/persistence exports plus direct owners |
| Release artifact path selected | pass | Published package user-visible breaking changes require changesets |
| `changeset` skill loaded when `.changeset` is required | pass | `.agents/skills/changeset/SKILL.md` read before package-scoped changesets |
| Barrel/export impact decision recorded | pass | Run `pnpm brl` after final export/file-layout changes |

Work Checklist:
- [x] No duration was requested; binary closure replaces timed work.
- [x] First checkpoint captures every explicit requirement, scope boundary, stop condition, deliverable, verification surface, and success criterion before implementation.
- [x] Objective, threshold, verification, constraints, boundaries, and blocker are concrete.
- [x] Major source, lane, expected output, owners, browser surface, and dominant risk are recorded.
- [x] Current state and accepted decisions are mapped before implementation.
- [x] Repo decisions and prior private prototype constraints are recorded.
- [x] External research is N/A because live repo and local donor settle the task.
- [x] Options/tradeoffs/rejections are inherited from the accepted plan; execution does not reopen them.
- [x] Facts, inference, and recommendation are separated in the accepted ledger; live-source corrections will be recorded below.
- [x] Run final architecture-sensitive `autoreview`; close every accepted finding.
- [x] Docs, browser, and package/API packs cover touched surfaces.
- [x] Workspace authority and output discipline are recorded.
- [x] Slice 0: capture focused baseline, enumerate the private bridge boundary, and prove current old-symbol counts.
- [x] Slice 1: introduce native immutable transaction construction over `DocumentChange`/`TransactionSpec`; preserve atomicity, selection mapping, effects, state, metadata, and no-op behavior.
- [x] Slice 2: migrate all production writers/callers and delete operation-first apply, `.operations`, operation middleware, operation-derived commit reconstruction, rollback machinery, and the private bridge.
- [x] Slice 3: compile schema tables; fit open slices; canonicalize leaves during change construction; correct from canonical changed ranges; retain semantic fixed-point/cycle diagnostics.
- [x] Slice 4: make core/default commands pure `false | TransactionSpec`; keep imperative adapters only at DOM/Plate edges.
- [x] Slice 5: make extension reconfiguration transaction-scoped and publish one immutable compiled configuration revision; run setup/cleanup only after successful publication.
- [x] Slice 6: add schema-linked typed host codec registries for HTML, Markdown, and clipboard; parsing yields fitted slices; core remains DOM-free.
- [x] Slice 7: create one private mapped-view-store kernel and typed optional-provider fault boundary while preserving distinct Decoration/Annotation/Widget public APIs.
- [x] Slice 8: add versioned codecs for persisted/shared fields/effects and validated `History.toJSON/fromJSON` over canonical changes/selections/effects.
- [x] Slice 9: migrate Plate/Yjs/DOM/React/history callers; delete rejected exports/fixtures/docs/examples/benchmarks; update current-state docs, barrels, and changesets.
- [x] Preserve accepted keeps: plain JSON, structural sharing, roots/anchors/selections, canonical change laws, explicit facets, lazy changed queries, DOM scheduler, incremental Yjs, React/DOM/input/layout boundaries.
- [x] Preserve explicit rejections: no donor class identity, no automatic facet dependency tracking, no product UI, no Plite product opinion.
- [x] Keep imperative renderer deferred with no implementation in this goal.
- [x] Docs pack: read target/current sibling docs and doctrine before edits.
- [x] Docs pack: every taught API/import/route/example is source-backed and current-state only.
- [x] Docs pack: links/anchors/previews resolve or are explicitly N/A.
- [x] Browser pack: record exact route, interaction, expected model/DOM/selection/focus/metadata/follow-up outcome before proof.
- [x] Browser pack: use Browser for app QA and package browser rows/matrix for editor laws; inspect console/network where applicable.
- [x] Browser pack: record final screenshot/trace/route evidence or exact non-visual reason.
- [x] Package/API pack: audit final public surface, boundaries, exports, compatibility hard cut, and release artifacts.
- [x] Load `changeset`; add/update valid patch changesets for every published affected package.
- [x] Run owning package tests/typechecks and `pnpm brl`; final lint remains in the closure sequence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Close slices 0–9 and run focused/root/browser/benchmark/old-symbol gates | Daily Plite, four-project browser matrix, root check, benchmarks, docs, and exact symbol scans passed |
| Current-state source audit | pass | Record exact live pre/post owners and stale-plan repairs | Zero old-symbol matches across active Plite family, Browser, Yjs, VISION, and current Plite docs |
| Decision criteria closure | pass | Mark every accepted concept delivered/preserved/rejected/deferred | Slices 0-9 delivered; accepted keeps/rejections preserved; renderer is sole deferral |
| Options / tradeoffs / rejection record | pass | Accepted ledger is authoritative; live source may repair facts, not taste | `docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md` |
| Review / pressure pass | pass | Run `autoreview` after implementation | Identical full-bundle rerun reported no accepted or actionable findings |
| Review findings closure | pass | Fix or reject each actionable current-checkout finding with evidence | First-pass proof-placeholder P3 repaired; rerun clean |
| External-source audit | N/A | Local donor and current checkout are sufficient | No internet research required |
| Implementation gates | pass | Close source, tests, docs, browser, package/API, changeset, barrel, benchmark, and lint gates | All implementation and verification owners passed; only final review bookkeeping remains |
| Final handoff contract | pass | Record delivered architecture, exact proof, browser evidence, residual risk, next owner | Closure proof records delivered architecture, commands, Browser and matrix evidence, changesets, and sole renderer deferral |
| Final lint | pass | Run `pnpm lint:fix` after all edits | Passed across 4,793 files with no fixes; final docs-only closeout rerun remains procedural |
| Output budget discipline | pass | Confirm searches/output remained bounded and recover any accidental broad stream | Owner-scoped searches and summary logs used; one broad document read was recovered with scoped excerpts |
| Timed checkpoint | N/A | No duration requested | Binary completion gate |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-execute-wordgard-plite-architecture-ledger.md` | Final checker exits 0 |
| Docs source-backed claim audit | pass | Audit docs/examples against final source | Current `DocumentChange`, host codec, pure command, persistence, history, and Yjs teaching matches exports |
| Docs links / routes / previews | pass | Verify touched links/routes/anchors/previews | Browser opened new leaf routes; deleted operation routes return 404; content navigation points at current leaves |
| Docs MDX/content parser | pass | Run `pnpm --filter www build:source` if MDX/content changes, else exact N/A | `pnpm --filter www build:source` and source-first www typecheck passed |
| Plugin page specifics | N/A | This is Plite substrate reference, not a Plate plugin page | N/A |
| Browser interaction proof | pass | Focused app/package browser proof for changed editor behavior | Rich text, paste/follow-up, annotations, multi-root, pagination, Yjs, and focused selection/input rows passed |
| Browser console/network check | pass | Record console/network state for exercised routes | Exercised final pagination/Yjs and documentation routes reported zero console errors; Yjs convergence proved transport outcome |
| Browser final proof artifact | pass | Record route/trace/screenshot or exact non-visual reason | Route and DOM/model outcomes recorded below; package Playwright is the exact selection/input artifact, so no screenshot oracle adds value |
| Public API / package boundary proof | pass | Audit public API/exports and direct adopter boundaries | Export/type/caller scans and owner package proof passed; rejected operation surface count is zero |
| Release artifact classification | pass | Published breaking API/runtime/types across Plite family and adopters | Changesets required |
| Published package changeset | pass | Load `changeset`; add valid patch entries for affected packages | Ten package-scoped changesets cover Plite core/DOM/React/history/layout, Browser, Yjs, Core, Markdown, and Plate transaction closeout |
| Registry changelog | N/A | No registry-only change | N/A |
| No release artifact | N/A | Published user-visible package changes are expected | N/A |
| Package typecheck/build/test | pass | Run source-first owner checks and required Plite closure gates | `pnpm check:plite`, the strict browser matrix, and root `pnpm check` passed |
| Barrel/export generation | pass | Run `pnpm brl` after final export/file changes | `pnpm brl` passed after public file/export changes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Accepted plan, doctrine, agent start, current implementation evidence read | create execution goal |
| Current-state map | completed | Accepted 26-concept/60-row ledger revalidated at execution boundary | slice 0 baseline |
| Options and recommendation | completed | User accepted full ledger; explicit keeps/rejections/deferral locked | implementation |
| Review / pressure pass | completed | Full-bundle first pass found only stale proof placeholders; exact-evidence repair completed and identical rerun reported no accepted/actionable findings | closeout |
| Implementation or plan artifact | completed | Slices 0-9 implemented and adopted | verification |
| Verification | completed | Focused packages, daily Chromium, four-project matrix, docs, source audits, benchmarks, root check, and Browser app proof green | review |
| Closeout | completed | Closure proof filled with exact evidence; final lint, exact dead-API scans, review, and goal checker pass | normal maintenance |

Findings:
- Fact: live Plite already has canonical `DocumentChange`, frozen structurally shared snapshots, root-aware anchors/selections, explicit facets, lazy commit queries, a DOM scheduler, and an incremental Yjs bridge. These are preservation constraints, not missing work.
- Fact: the normal write path still exposes and consumes operation-first APIs while also reconstructing canonical changes, so two write truths remain.
- Fact: the prior JSON ChangeSet prototype proved laws and fair median-based benchmark controls but was intentionally private; execution may reuse mechanisms/tests, not promote it by identity.
- Inference: operation truth must fall before schema, commands, configuration, codecs, view stores, and persistence can have one coherent transaction boundary.
- Recommendation: execute the accepted dependency order; no compatibility phase beyond the temporary private slice-1/2 bridge.
- Stale-plan repair: `packages/plite/test/prototypes/json-change-set.ts` and `json-change-set-prototype.test.ts` no longer exist. Their promoted laws live in `core/document-change.ts`, `document-change.test.ts`, and `document-change-laws.test.ts`; the benchmark artifact remains under `docs/plans/artifacts/wordgard-plite-rewrite-comparison/`.
- Slice-0 audit: a deliberately broad source/test/docs scan finds 112 files mentioning the old `Operation`/operation-state vocabulary. Production ownership includes Plite transforms/runtime, DOM operation interception, React replay/browser handles, history grouping, Yjs lowering, Browser scenario transport, and direct Plate listeners.
- Slice-1 fact: active transactions accumulate each incremental canonical `DocumentChange`; commit finalization uses that change directly and derives only its final net classification from before/after snapshots.
- Slice-1 deletion: commit-time `DocumentChange.fromIntents`, operation-count change caches, and the duplicate path-stable `DocumentChange` builder are removed. No production caller of `DocumentChange.fromIntents` remains.
- Slice-2 fact: every writer enters through canonical `DocumentChange`; semantic intents are optional replay-validated metadata and no public or private operation queue/middleware/apply bridge remains.
- Slice-2 runtime repair: replacement emits a minimal canonical change, transfers runtime IDs only for retained node identity, and treats a changed top-level runtime sequence as `root-order` even when JSON structure is shape-equivalent. This keeps anchors, annotation projections, and partial-DOM coverage correct without using intents as document truth.
- Slice-2 adopter repair: DOM selection cleanup runs at commit scope, Copilot suggestion rejection observes selection-only commits, and browser scenario transport is `applyIntents` end-to-end.
- Slice-3 fact: element membership, groups, content rules, defaults, matchers, and wrapper candidates compile once per schema revision; extension batches force compilation before publication and roll back invalid grammars atomically.
- Slice-3 construction: `schema.fit` accepts explicit open slices and returns closed validated content; snapshot replacement and public transform boundaries compose leaf/structure canonicalization into the transaction change before callers can observe the result.
- Slice-3 correction: semantic correction paths come only from canonical `DocumentChange` ranges; representation repair is not a fixed-point normalizer. Semantic corrections retain fixed-point, cycle, and exhaustion diagnostics.
- Slice-3 runtime repair: canonical replacement preserves retained runtime IDs. The audit exposed and fixed an existing replacement path bug that inserted the replacement index as an extra path segment.
- Slice-4 stale-plan repair: slice 1 established canonical change accumulation but had not actually introduced `TransactionSpec`. Slice 4 now owns the native immutable spec, including document changes, selection, marks, effects, annotations, tags, and semantic intents.
- Slice-4 purity: `EditorCommandRunContext` contains command plus read-only state, command defaults return only `false | TransactionSpec`, and dispatch is the sole publication point. Specs can be built against committed state or an active draft through nested speculative savepoints without publishing, notifying transaction listeners, or moving anchors.
- Slice-4 boundary: Plate transform middleware uses the explicitly internal `registerImperativeCommand` / `executeImperativeCommand` adapter. Pure and imperative handlers cannot mix for one command type.
- Slice-4 history: undo/redo draft against cloned batches and move the live history stack only from the successful commit callback. Failed or merely evaluated history commands cannot consume a batch.
- Slice-5 configuration: extension slots are declarative owned inputs rather than nested `setup()` installs. `tx.extensions.reconfigure(slot, input)` stages the last value per slot; setup, schema validation, and registry replacement run only at the outer publication boundary with rollback on callback, dependency, schema, or setup failure.
- Slice-5 revision: successful batches publish one frozen compiled configuration revision and one editor commit. Schema revision advances exactly once only when the compiled element table changes, so facet dependencies do not invalidate spuriously.
- Slice-6 ownership: Plite core owns only fitted `EditorContentSlice`; `plite-dom` owns MIME transport and typed codec collection, while Plate parser plugins and Markdown register codecs as named extensions. The private capability key is not public API.
- Slice-6 precedence: the internal Plite fragment remains authoritative, codecs run by explicit priority/registration precedence, and plain text is the final transport fallback. Several formats may share one semantic type without collapsing their codecs.
- Slice-7 ownership: decoration projections, annotations, and widgets keep separate public stores and semantics while one private mapped-view-store kernel owns global/keyed subscriptions, publication, teardown, and subscriber accounting.
- Slice-7 failure policy: only optional source reads/projection/resolution are isolated. A typed sink receives source id, phase, and cause; the failed source retains its last good snapshot, deactivates until explicit retry, and cannot deactivate healthy siblings or poison a remount.
- Slice-7 runtime repair: semantic intents remain hints only, but they transfer runtime identity across canonical change materialization and representation correction. Commit invalidation notifies surviving changed runtime ids and avoids waking removed mounted nodes during full replacement.
- Slice-8 persistence: fields, effects, and custom selections use explicit versioned codecs. Shared values without codecs fail at definition, persisted envelopes reject unknown versions, and local runtime-only fields cannot be serialized accidentally.
- Slice-8 history: `History.toJSON/fromJSON` validates canonical changes, selections, marks, registered effects, and version 1 before replacing the installed stacks. Persisted history omits semantic intents so reload creates a safe grouping boundary instead of restoring optimization hints as truth.
- Slice-8 Yjs: shared effects use the same keyed codecs as history. Intent lowering is postcondition-checked against the canonical result; adjacent Yjs text boundaries count as canonical-equivalent because they deliberately preserve collaboration/undo identity, while real divergence repairs through the canonical bridge.
- Slice-9 adoption: active Plite, DOM, React, history, hyperscript, layout, Browser, Yjs, Plate adapters, docs, examples, and benchmarks consume canonical changes. Exact production/current-doc scans find no `EditorCommitImpact`, `EditorOperation*`, `OperationApi`, operation queue/middleware, transaction `.operations`, or operation-as-truth doctrine.
- Slice-9 teaching: concepts and walkthroughs teach `DocumentChange` and the canonical change substrate; API leaves cover document changes, fitted host codecs, pure command specs, versioned effects/fields/history, and incremental Yjs. Deleted operation routes return 404 instead of preserving aliases.
- Slice-9 generated-artifact boundary: stale operation wording under `apps/www/public/r/*.json` is CI-owned generated registry output. Repo doctrine forbids editing it or running `build:registry`; live source/content and route proof are current.
- Browser closure repair: Firefox could import a stale DOM target range after a virtualized repair because `repair-induced` model preference was not accepted by beforeinput ownership. The selection controller now recognizes repaired model ownership while preserving the native fast path; the exact 20,000-block row passes 10/10 without retries.
- Matrix runner repair: tail suites run serially and projects use bounded workers so renderer/browser launch pressure cannot masquerade as editor behavior. WebKit uses one worker after a clean direct rerun proved the earlier launch `Bus error: 10` was concurrency pressure.

Decisions and tradeoffs:
- Choose one breaking architecture over a long dual-stack migration; the repo is private alpha and accepted policy forbids compatibility sludge.
- Keep semantic intents as optional typed hints only when replay proves they match the canonical change.
- Compile schema per immutable config revision; do not trade correctness for runtime rule scans.
- Share view-store mechanics privately while preserving distinct public concepts.
- Keep explicit facet dependencies; Wordgard-style automatic dependency capture is clever but less predictable and more magical.
- Defer the imperative renderer until a real non-React consumer supplies parity/performance targets.

Implementation notes:
- Slice 0 baseline is frozen: `pnpm --filter @platejs/plite test` passes 81 tests; `pnpm turbo typecheck --filter=./packages/plite` passes.
- Temporary bridge owner: Plite core `Operation` lowering plus the existing operation queue, used only to feed canonical incremental changes and semantic hints while writers migrate in slices 1–2. It stays internal, gains no new export, and must be deleted before slice 3.
- Slice 1 keeps the bridge deliberately narrow: legacy writers still mutate the transaction draft, but every mutation records its canonical incremental change immediately; direct `tx.changes.apply` and snapshot replacement join the same accumulator.
- Slice 2 deleted that bridge. Core/DOM/React/history/Yjs/Browser and direct Plate adopters consume canonical changes plus optional semantic intents only.
- Slice 3 deletes eager delete-specific leaf cleanup. Canonical construction owns empty anchors, inline spacers, adjacent equal-mark merging, and redundant empty leaf removal; backward deletion uses a backward start anchor instead of cleanup-driven selection mutation.
- Slice 4 adds `state.transaction(...)` as the inferred immutable-spec builder. Nested builders snapshot and restore document roots, selection, marks, field state, effects, annotations, tags, intents, runtime caches, and anchor checkpoints; command dispatch applies the frozen result once.
- Slice 5 removes `slot.reconfigure(editor, input)` completely. Slot ownership is explicit in the compiled extension graph, replacement recursively removes only current slot-owned children, and runtime readers cannot observe configuration changes from inside the staging callback.
- Slice 6 compiles Plate `plugin.parser` entries into host codecs instead of an imperative clipboard loop. Every parsed fragment is fitted and validated before insertion; Markdown contributes `text/markdown` serialization through the same registry, and codec consumers never see the private capability plumbing.
- Slice 7 centralizes mapped-store lifecycle and fan-out without exporting the kernel. Decoration, annotation, and widget hooks expose a common typed error policy and explicit retry while retaining lane-specific snapshots, metrics, dirtiness, and subscription APIs.
- Slice 8 hard-cuts boolean `persist`. Primitive codecs live in Plite, layout owns reusable page-settings/page-break codecs, Yjs transports versioned shared-effect envelopes, and the retained-history benchmark measures validated JSON serialization/reload instead of deleted operation counts.
- Slice 9 hard-cuts every active operation-era export/doc/fixture owner, updates direct adopters, and publishes package-scoped changesets. Current JSON registry artifacts remain CI-owned output rather than hand-edited source.
- Firefox virtualized input keeps the repaired model selection authoritative across stale target ranges, but does not force Plite's synthetic text path when a valid native fast path exists.

Review fixes:
- Full-bundle first pass found one P3: this plan claimed closure while the proof
  artifact still contained result placeholders. Exact matrix, benchmark, lint,
  root-check, changeset, and review-cycle evidence replaced every placeholder.
- The identical 1,266,966-character full-bundle rerun reported no accepted or
  actionable findings. The reviewer deep-read the highest-risk canonical
  change, runner, benchmark, anchor, selection, persistence, and Yjs paths.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun focused-test paths without `./` matched no files | 1 | Rerun with explicit relative paths | 67 focused tests executed |
| First benchmark command streamed full sample arrays | 1 | Pipe subsequent benchmark output through `jq` summaries | Summary-only rerun recorded |
| Browser follow-up keypress landed on an in-app load-error page while the local server remained healthy | 1 | Read Browser recovery guidance and use a fresh tab | Fresh tab reloaded the Paste HTML route with zero console errors; package Chromium behavior rows remained authoritative |
| Focused Plite command used contract basenames that Bun does not treat as test files | 1 | Use the actual `.test.ts` entry and package suite | `command-spec.test.ts` passed 3/3 and the package suite includes it |
| Generated leaf law found two differently marked empty leaves canonicalizing to zero children | 1 | Preserve one unmarked empty anchor when filtering removes every redundant leaf | Focused generated schema laws pass 3/3 |
| Bun rejected a contract basename as a focused test path | 1 | Run the exact `./packages/...` path from the repo root | Transaction extension contract passed 8/8 |
| Internal export smoke detected the new configuration introspection export | 1 | Add the intentional internal export to the exact manifest assertion | Plite package passed 91/91 |
| Markdown codec proof exposed a serializer type that demanded a DOM-capable editor despite reading only extension state | 1 | Type codec contexts against the Plite editor boundary; keep DOM transport outside the codec contract | Markdown, Core, and Plite DOM source-first typechecks pass |
| Clipboard benchmark still imported deleted operation-count machinery | 1 | Measure canonical publication versions and rename the metric to commit count | Benchmark runs with one commit per codec insertion and no operation-era import |
| In-app Browser evaluation is intentionally read-only and cannot synthesize clipboard events | 2 | Use focused package Chromium rows for rich paste and Browser for route/focus/follow-up-input/console proof | Four rich-paste Chromium rows pass; Browser follow-up input is focused with zero console errors |
| Internal export smoke rejected the React view clipboard dispatcher | 1 | Add the intentional private bridge export to the exact internal manifest | Core extension clipboard middleware remains active on React view editors; Plite package proof passes |
| Full React proof exposed lost runtime identity after nested-to-root moves and over-broad replacement invalidation | 1 | Transfer IDs from current runtime-hint indexes through canonical replacement, then notify only surviving node ids | Focused move/replacement laws and all 866 Plite React tests pass |
| Yjs package has no focused Vitest binary | 1 | Use its owning Bun package command | Focused shared-effect rows and the full 230-test package pass |
| Direct Yjs typecheck initially resolved stale Plate output | 1 | Run the source-first Turbo graph so dependencies build coherently, then rerun direct typecheck | Turbo and direct Yjs typecheck pass |
| Full Yjs proof still expected incidental normalization intents removed by pure commands | 1 | Audit visible value, identity, reconnect, and undo semantics; keep only sufficient semantic hints and verify their canonical postcondition | Updated trace laws and all 230 Yjs tests pass |
| Strict intent postcondition repair treated intentional adjacent Yjs text boundaries as divergent and replaced identities | 1 | Compare canonical leaf equivalence first; preserve the explicit marked text-boundary fallback; repair only real divergence | Focused merge/fragment/remote rows and full Yjs suite pass |
| Bun benchmark-contract path without `./` matched no test file | 1 | Rerun with the explicit relative path | Benchmark source contract passes 17/17 |
| Raw Bun invocation resolved stale built Plite React output | 1 | Use the package Vitest owner and source-first Turbo typecheck | Plite React passes 867 tests and source-first typecheck |
| Firefox virtualized 20k typing inserted the final text at document start under stress | 2 | Trace selection ownership across repair, stale target ranges, and beforeinput instead of extending timeouts | `repair-induced` preference owns the next input; exact row passes 10/10 without retries |
| WebKit launch storm crashed four workers with `Bus error: 10` | 1 | Prove the exact rows directly, then bound WebKit to one worker | Direct 4/4 passed; strict one-worker matrix is the closure lane |
| Firefox inline-link drag collapsed only under the two-worker full-matrix load and passed on retry | 1 | Repeat the exact row with retries disabled before touching gesture semantics | Exact row passes 10/10; Firefox matrix ownership is bounded to one worker for deterministic proof |
| Headless shell and system Chromium stalled under the full browser workload | 2 | Use the installed matching Playwright Chromium binary under Node 22 and isolate test files by process | Daily Chromium and the strict four-project matrix pass with zero retries |
| Comment-mode setup timed out when one process owned the entire cohort | 1 | Split comment mode into two deterministic shards | Both shards pass in the daily and matrix lanes |
| Pagination p95 used 16 samples, making nearest-rank p95 equal the maximum | 1 | Exercise the minimum meaningful 20 samples | The 24-32 ms cadence-clamped p95 and 120 ms max gates pass |
| Repeating the full runner inherited concurrent workers and retry policy | 1 | Run five strict sequential zero-retry repetitions | All 5/5 passed |
| A 250-change anchor calibration measured 250 full commits rather than the bulk registry algorithm | 1 | Add a dedicated lane that constructs one canonical `DocumentChange` with 250 edits | Exact 10k/250/250 mapping passes with 610.91 ms rebase |
| Codex review could not accept the 1,249,542-character full bundle | 1 | Run the identical full bundle through the Claude review engine | Review completed; sole P3 was stale proof placeholders |
| Root fast-suite timing gate classified the 22-case table matrix as a fast file | 1 | Keep all cases and move the file to its explicit slow-suite owner | Focused matrix passes 22/22 and root `pnpm check` passes |

Verification evidence:
- Planning checker for accepted ledger previously passed.
- Slice 0: `pnpm --filter @platejs/plite test` -> 81 pass, 0 fail; `pnpm turbo typecheck --filter=./packages/plite` -> 1/1 successful.
- Slice 0: exact source audit confirms public `EditorTransaction.apply/operations`, operation middleware, operation-derived active/commit changes, rollback, and 112 broad old-vocabulary files. Focused deletion counts will be rerun after each cut.
- Slice 1: `bun test ... ./test/transaction-contract.ts ./test/normalization-contract.ts ./test/anchor-contract.ts` -> 67 pass, 0 fail.
- Slice 1: `pnpm --filter @platejs/plite test` -> 81 pass, 0 fail; `pnpm turbo typecheck --filter=./packages/plite` -> pass.
- Slice 1: exact `DocumentChange.fromIntents` caller scan is empty. Transaction calibration rerun: mixed-batch medians 1.52 ms separate updates and 1.09 ms update replay; calibration-only, not a release gate.
- Slice 2: exact production/test symbol and filename audits for `Operation`, operation APIs/queues/middleware, `changeFromIntents`, rollback/restore helpers, and operation-named Plite-family test owners are empty. Historical research ledgers/changelogs remain historical evidence, not executable teaching.
- Slice 2: `@platejs/plite` 81/81, `plite-dom` 134/134, `plite-react` 863/863, `plite-history` 19/19, `yjs` 228/228, `browser` 91/91 package rows, and Diff 35/35 focused rows pass.
- Slice 2: source-first typecheck passes for Plite, DOM, React, history, Yjs, Browser, Diff, and AI; the wider direct-adopter typecheck passed earlier across Core, Caption, Code Block, Footnote, List, and Table.
- Slice 3: Plite package 84/84, generated schema/fitting/correction laws 3/3, all focused schema/normalization/delete/transaction/leaf/selection rows, Plite DOM 134/134, and the affected React provider-hook file 38/38 pass; Plite source-first typecheck passes.
- Slice 3: focused Chromium rows for invalid nested HTML paste, select-all Backspace canonicalization, empty-block IME, plain-text table-cell paste, and structural table-fragment paste pass 5/5.
- Slice 3: Browser verified `/examples/plite/richtext` and `/examples/plite/paste-html`; typing followed by Backspace restored the original rich-text DOM, synthetic paste produced `BrowserProof tail`, fresh-route console errors were empty, and post-paste edit follow-up is covered by the green Chromium rows after the in-app tab itself dropped.
- Slice 3: the normalization target measures canonical construction rather than no-op post-hoc repair. Current medians: 11.63 ms for 250 adjacent-leaf blocks, 33.96 ms for 250 inline-flatten blocks, and 588.78 ms for 50 observed writes across 500 blocks. The observed-write cost is canonical `DocumentChange` indexing debt, not a correctness failure; later performance closure must compare it against the accepted change-engine target.
- Slice 4: pure-command spec laws pass 3/3, including no publication/anchor movement during evaluation, active-draft evaluation with one outer commit, and priority/`next` override order. Plite history passes 19/19; Plite and Plite React source-first typechecks pass after preserving installed-extension inference in selector hooks.
- Slice 5: transactional configuration laws pass 4/4 and the legacy transaction-extension contract passes 8/8. They prove deferred setup, one frozen revision/commit, callback abort, setup failure with document rollback, dependency rejection, schema/facet dependency invalidation, and no partial registry.
- Slice 5: Plite passes 91/91 plus source/test typecheck. Focused Plite React runtime reconfiguration passes 1/1 and Plite React source-first typecheck passes; the selector observes the new facet value only after the configuration commit.
- Slice 6: host codec laws pass 3/3; Plite DOM passes 137/137, Plite passes 91/91, Core parser passes 5/5, Markdown passes 6/6, and the benchmark-source contract passes 17/17. Source-first typecheck passes for Plite DOM, Core, and Markdown.
- Slice 6: focused Chromium rich-paste rows pass 4/4 for bold HTML, invalid block nesting, editable follow-up caret, and lists. Browser verified `/examples/plite/paste-html`, focused replacement/follow-up input, current DOM ownership, and zero console errors.
- Slice 6: the large-payload benchmark includes host codec parse+fit+insert and serialize lanes. A 1,000-block / 101,891-byte calibration completed in one commit: 80.14 ms insert and 53.25 ms serialize p50 with one sample; calibration evidence, not a release threshold.
- Slice 7: focused projection/annotation/widget/fault laws pass 51/51; Plite React passes 866/866, Plite passes 92/92, and source-first Plite/React typecheck passes. Exact duplication audit finds keyed listener ownership only in the private kernel, which is absent from the root export surface.
- Slice 7: rerender-breadth calibration preserves local fan-out: one annotation projection/sidebar/widget wake, one changed decoration overlay, zero sibling overlay/text rerenders, and no unrelated source recomputes. Browser exercised `/examples/plite/persistent-annotation-anchors` through anchor creation, fragment insertion, and prefix insertion; annotation range and widget visibility remained synchronized with zero console errors.
- Slice 8: codec contracts pass 3/3; persisted-history contracts pass 4/4; Plite passes 95/95, Plite History 23/23, Plite Layout 51/51, Plite React 866/866, and Yjs 230/230. Source-first typechecks pass for Plite, History, Layout, React, and Yjs.
- Slice 8: history reload proves canonical node/state/custom-selection batches, registered domain effects, remote rebase, undo/redo, and stale history/field/effect rejection. Yjs proves shared field/effect transport, unsupported effect version rejection, canonical intent repair, offline identity, reconnect, and undo.
- Slice 8: retained-history calibration at 40 existing/replacement blocks reports 0.19 ms serialization / 0.45 ms reload for full replacement and 0.05 ms / 0.17 ms for range delete in one local sample. This is calibration evidence, not a release threshold; benchmark-source contract passes 17/17.
- Slice 9/closure: `pnpm check:plite` passes with 682 Chromium rows and 7 intentional skips; the strict matrix passes Chromium 682/7, Firefox 578/111, mobile 321/368, and WebKit 594/95 with zero retries.
- Slice 9/closure: the 10,000-block / 250-anchor / 250-edit bulk registry lane passes exact mapping with 610.91 ms rebase; all 13 benchmark runners, the 17 benchmark source contracts, and 32 target-registry entries pass.
- Slice 9/closure: `pnpm changeset status`, `pnpm brl`, `pnpm lint:fix`, and root `pnpm check` pass. Ten package-scoped changesets cover every published owner.
- Slice 9/closure: the in-app Browser clicked the native editable on `/examples/plite/embeds` and inserted `Browser ` through the real DOM input path. The broader Browser route proof records zero console errors; package Playwright supplies exact selection/input assertions.
- Slice 9/closure: final active-source/current-doc dead-API and old-filename scans are empty; historical ledgers/research remain immutable provenance. The final default anchor benchmark and 17 benchmark source contracts pass after formatting.

Final handoff contract:
- Recommendation: final architecture delivered, not another plan.
- Confidence: binary gates only; no numeric score.
- Evidence: exact changed owners, symbol-deletion audits, focused/root/browser/benchmark commands.
- Tests / commands: list every executed command and result; separate environmental failures from product failures.
- Browser proof: route/interaction/model/DOM/selection/focus/console/network/trace evidence for changed browser behavior.
- PR / tracker: N/A unless user later requests publication.
- Caveats: only the accepted imperative renderer deferral may remain; name any narrower proof limitation honestly.
- Next owner: normal maintenance if all gates pass; otherwise the exact unresolved owner.

Timeline:
- 2026-07-18T22:26:06.657Z One-shot major-task shell created from accepted Plite architecture plan.
- 2026-07-19 First checkpoint captured full execution contract before implementation.
- 2026-07-19 One-shot execution goal created; slice 0 started.
- 2026-07-19 Slice 0 closed with green Plite tests/typecheck, old-symbol inventory, private bridge boundary, and stale prototype-path repair.
- 2026-07-19 Slice 1 closed: canonical changes accumulate during writes; operation-derived commit reconstruction and duplicate change builder deleted; focused/package/type/benchmark proof green.
- 2026-07-19 Slice 2 closed: operation-era engine truth, private bridges, middleware, rollback internals, and executable test/browser vocabulary deleted; canonical replacement/runtime mapping repaired; core and adopter proof green.
- 2026-07-19 Slice 3 closed: compiled schema and open-slice fitter published; canonical representation construction replaced eager leaf cleanup; generated laws, runtime identity, package, browser, and benchmark gates recorded.
- 2026-07-19 Slice 4 closed: immutable transaction specs, nested speculative savepoints, pure command handlers/defaults, explicit imperative transform adapters, and commit-scoped pure history commands landed with focused/package/type proof.
- 2026-07-19 Slice 5 closed: direct slot mutation and nested setup installation were hard-cut; transaction-scoped owned configuration, rollback, frozen compiled revisions, exact schema invalidation, and React runtime publication landed with focused/package/type proof.
- 2026-07-19 Slice 6 closed: fitted host codec registries replaced the Plate parser clipboard loop; HTML/Markdown/clipboard registration, deterministic precedence, invalid-fit rejection, payload benchmark, package/type, Chromium, and Browser proof are green.
- 2026-07-19 Slice 7 closed: one private mapped-view-store kernel, typed optional-source isolation/retry, runtime-identity transfer, and bounded surviving-node invalidation landed with package/type/benchmark/Browser proof.
- 2026-07-19 Slice 8 closed: strict versioned field/effect/selection/history codecs, reloadable canonical history, shared Yjs effect envelopes, verified intent lowering, layout/app adoption, rejection laws, package/type proof, and serialization calibration landed.
- 2026-07-19 Slice 9 closed: active adopters, exports, docs, examples, benchmarks, barrels, and ten release changesets use the canonical architecture; rejected operation-era surface scans are empty.
- 2026-07-19 Verification closed: daily Chromium, strict four-project matrix, root check, benchmark registry/contracts/bulk lane, docs, lint, changesets, barrels, and in-app Browser proof passed.
- 2026-07-19 Review closed: first-pass proof-placeholder P3 repaired; identical full-bundle rerun reported no accepted or actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Slices 0–9, implementation verification, and final review complete; procedural closeout remains |
| Where am I going? | Final lint, exact source audits, goal checker, final verified handoff |
| What is the goal? | Deliver the entire accepted Wordgard-to-Plite architecture ledger with only the renderer deferred |
| What have I learned? | Persistence requires explicit versioned ownership; history can reload canonical batches without restoring semantic hints, and Yjs verification must distinguish canonical document equality from intentional CRDT text boundaries |
| What have I done? | Completed slices 0–9 and all package, browser, benchmark, docs, changeset, barrel, lint, and root verification gates |

Open risks:
- The first-party imperative renderer remains intentionally deferred until a
  non-React consumer provides measurable parity and performance requirements.

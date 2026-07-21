# Plite native transaction kernel

Objective:
Hard-cut Plite's operation-era transaction path into an isolated draft and
native canonical change builder, then make typed pure commands compose and
apply immutable transaction specs without normal-path intents or imperative
core middleware.

Goal plan:
docs/plans/2026-07-19-plite-native-transaction-kernel.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- `plite-plan`: accepted ranks 3 and 15 from the exhaustive Wordgard/Plite ledger
- `autogoal`: quantitative implementation and deletion closure

Task source:
- type: accepted architecture execution delegated by the active root goal
- id / link: ranks 3 and 15 in `docs/plans/2026-07-19-wordgard-plite-final-extraction.md`
- title: Native immutable transactions and pure typed commands
- acceptance criteria: detached `EditorDraft`; native `DocumentChangeBuilder`;
  immediate canonical steps; one frozen publication; base-checked
  `TransactionSpec` compose/apply; pure `false | TransactionSpec` handlers;
  exact callback inference; zero normal-path `EditorIntent`, `applyIntent`,
  replay, speculative editor swapping, or core transform middleware.

First checkpoint:
- Every explicit requirement is captured below before transaction-kernel edits.
- Read current intent/apply/spec/command/transform owners, accepted ledger rows,
  donor composition law, and concurrent owner boundaries before implementation.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: uninterrupted execution; pause only for a real overlap blocker
- initial confidence score: N/A: behavioral/deletion/test thresholds are stronger
- improvement loop: lock laws, build isolated primitive, migrate transform
  families, delete old execution owners, rerun proof and static audits
- final score / loop closure: N/A

Completion threshold:
- Specs are built against an immutable base without mutating editor WeakMap
  state; aborted/nested/spec builds cannot leak.
- `DocumentChangeBuilder` owns canonical incremental document writes and
  produces one composed `DocumentChange`; ordinary steps are canonical when
  appended, not repaired after publication.
- Specs carry an opaque base identity/revision; compose/apply rejects stale or
  incompatible bases and preserves one final commit.
- Commands remain `false | TransactionSpec`, can augment delegated specs, and
  infer command, state, draft, and transaction callback types without explicit
  annotations.
- Normal transforms and root/selection/effect/annotation/field changes use the
  draft/builder path. `EditorIntent`, `applyIntent`, replay, transaction
  speculation/rollback, and core imperative transform middleware have zero
  normal-path owners and their redundant public/internal surface is deleted.
- Selection stays rank-9-owned: this lane consumes its final shape, keeps
  optional post-change spec selection, and removes separate `spec.marks`.
- Focused atomicity, nested/spec isolation, ambient committed-read, compose,
  stale-base, delegated augmentation, one-commit, transform corpus, callback
  inference, typecheck/tests, static deletion audit, and transaction benchmark
  pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-19-plite-native-transaction-kernel.md` passes.

Verification surface:
- Focused Plite transaction/spec/command/transform unit and type-inference tests.
- Plite package typecheck and test suite; directly affected DOM/React/History/Yjs
  rows when the new spec publication boundary touches them.
- Static audit for old intent execution, speculation rollback, and imperative
  core middleware.
- Reproducible transaction benchmark comparing isolated draft/build/publication
  with the replaced path; final root full/browser closure remains root-owned.
- `pnpm lint:fix` or a scoped equivalent while the shared checkout is active.

Constraints:
- Preserve exact callback inference; never add callback annotations to hide a
  generic failure.
- Hard cut replaced machinery: no compatibility aliases, dual signatures, or
  permanent bridge.
- Keep public paths/snapshot queries and existing `DocumentChange` algebra.
- Keep Plate/DOM imperative adapters only at actual host/product boundaries;
  Plite core commands and transforms are pure/native.
- Do not edit Rank-9 selection types/codecs/history/pending-mark owners, Rank-4
  schema grammar, Rank-11 correction scheduler, or unrelated DOM geometry.
- Do not commit, stage, push, or create a PR.

Boundaries:
- Source of truth: live `packages/plite/src/core/{public-state,apply,command-registry,document-change}.ts`, transforms, interfaces, tests, accepted ranks 3/15, and current concurrent-owner messages.
- Allowed edit scope: Plite transaction/change/command kernel, transform
  migration, directly required internal/public exports and tests, transaction
  benchmark, this ledger, and unavoidable direct callers.
- Rank-9 contract: optional `TransactionSpec.selection` is post-change and
  rank-9-shaped; no separate `TransactionSpec.marks`; draft selection publishes
  once. Rank-9 owner does not edit spec/builder/command/intent surfaces.
- Schema/fitter/correction contract: expose a stable builder/draft primitive
  that later accepted owners consume; do not pre-implement their architecture.
- Browser strategy: core/headless proof here; root execution owns final browser
  matrix after all interacting ranks settle.
- Tracker/PR: N/A: no external tracker or PR requested.
- Non-goals: Wordgard class document model, raw public positions, donor central
  OT, configuration/facet/history/Yjs rewrites, DOM geometry, renderer work.

Output budget strategy:
- Read exact symbol windows and test files, cap searches, record broad inventories
  to artifacts if needed, and avoid dumping generated maps/dist output.

Blocked condition:
- Pause only if a concurrent owner changes the same transaction/spec symbols in
  an incompatible way, or if the hard cut requires a product/API decision not
  fixed by the accepted rank. Ordinary migration breadth, failing tests, and
  temporary shared-runner contention are not blockers.

Task state:
- task_type: heavyweight Plite architecture hard cut
- task_complexity: major
- current_phase: source and law audit
- current_phase_status: in_progress
- next_phase: native draft/builder foundation
- goal_status: active

Current verdict:
- verdict: execute accepted ranks 3 and 15 as one kernel cut
- confidence: current speculative/apply/command owners identified; detailed
  caller and law inventory in progress
- next owner: this transaction-kernel lane
- reason: a pure command spec cannot be honest while spec creation mutates and
  rolls back the live editor or carries operation-era intents.

Completion rule:
- Do not mark complete while any required migration, deletion, proof, benchmark,
  direct caller, or final handoff remains unresolved.
- Do not preserve old execution owners merely to make migration incremental.
- Do not create hook state; this plan and the active goal are durable state.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Detached draft, native builder, immediate canonicality, base checks, pure typed commands, inference, deletion, uninterrupted stop rule, owners, proof, and handoff copied above |
| Timed checkpoint parsed | no | N/A: no duration requested; uninterrupted execution recorded |
| Skill analysis before edits | yes | `autogoal` and `plite-plan` already read completely in this execution turn; accepted-plan execution mode selected |
| Active goal checked or created | yes | Dedicated measurable goal created after Rank 10 closed |
| Source of truth read before edits | yes | Accepted rows, current spec rollback, intent lowering, command registry, transform middleware types, and donor composition law read |
| Tracker/video evidence | no | N/A: no tracker or video |
| TDD decision before behavior change | yes | Lock abort/nesting/ambient-read/base/compose/delegation/inference laws before each owner cut |
| Branch/release/PR decision | no | N/A: delegated shared checkout; no git or release authority |
| Browser decision | yes | Headless kernel proof here; root owns final browser matrix |
| Concurrent owners coordinated | yes | Rank-9 owner boundary and exact spec-selection contract exchanged before edits |
| Output budget recorded | yes | Exact symbol windows and capped inventories required |

Work Checklist:
- [x] Every explicit requirement, scope boundary, stop condition, deliverable,
      proof surface, owner, and final handoff is captured before edits.
- [x] Accepted architectural source and live implementation owners are read.
- [x] Rank-9 overlap is explicitly partitioned before either lane edits specs.
- [x] TDD/law-first decision is recorded.
- [x] Callback inference is an explicit acceptance gate, not a cleanup item.
- [x] Hard-cut deletion and no-compatibility policy is explicit.
- [x] Browser, benchmark, typecheck, lint, review, PR, and tracker ownership is
      explicit.
- [x] Local environment retry policy remains the repo rule: reinstall only for
      documented mixed-install/React corruption, not ordinary failures.
- [x] High-risk failures are explicit: leaked aborted draft, stale-base apply,
      mis-mapped selection/effect, duplicate publication, runtime-ID loss,
      command delegation ordering, and inference regression.
- [x] Final handoff shape is exact files/APIs/deletions/tests/benchmark/caveats.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Native draft/builder architecture | yes | Implement detached draft and canonical builder | pending |
| Spec base/compose/apply | yes | Add base checks and composition laws | pending |
| Pure typed commands | yes | Support delegated augmentation with exact inference | pending |
| Intent/middleware hard cut | yes | Migrate callers and delete replaced owners | pending |
| Atomicity/isolation laws | yes | Pass abort/nested/ambient/spec tests | pending |
| Transform/direct-caller adoption | yes | Pass corpus and static caller audit | pending |
| Typecheck and callback inference | yes | Pass package typecheck and type tests | pending |
| Package/direct consumer tests | yes | Pass Plite plus affected consumer rows | pending |
| Transaction benchmark | yes | Save reproducible median/p95 artifact and gate | pending |
| Public/internal exports | yes | Run barrels/import smoke or record exact N/A | pending |
| Changeset | yes | Add changeset for intentional breaking package API or record why root owns it | pending |
| Lint | yes | Run final formatter/lint | pending |
| Autoreview | yes | Run scoped structured review until no accepted findings | pending |
| Browser final proof | delegated | Root runs final browser matrix | pending |
| PR/tracker | no | N/A: no PR or tracker requested | N/A: no external mutation authority |
| Goal plan complete | yes | Run autogoal checker | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Source and law audit | in_progress | current owners and accepted contracts identified | failing laws |
| Native draft/change builder | pending | | spec composition |
| Pure command/spec composition | pending | | transform migration |
| Intent/middleware deletion | pending | | consumer proof |
| Verification/benchmark/review | pending | | root handoff |

Verification evidence:
- Initial source audit only; implementation proof will be recorded after each
  law-first slice.

Reboot status:
- Resume at the exact current `createTransactionSpec` rollback and
  `applyIntent`/command-registry owners; no transaction edits started yet.

Open risks:
- This is the broadest core cut. Runtime identity and selection mapping currently
  consume intent hints, so replacement must derive them from canonical changes
  and draft indexes rather than silently dropping those semantics.

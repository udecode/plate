# Wordgard ChangeSet prototype batch

Objective:
Close Wordgard donor batch 0; done when a private JSON ChangeSet prototype
passes algebra/parity tests and a fair benchmark gate; plan
docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: accepted local architecture plan and local donor source
- id / link: `docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md`
- title: Wordgard versus Plite rewrite comparison, execution slice 0
- decision to make: promote or delete a private JSON token-index/ChangeSet
  prototype based on correctness, parity, and measured cost
- decision criteria: algebra laws pass; representative current Plite behavior
  has before/after JSON parity; three benchmark runs compare like-for-like
  current and prototype work; no public export or runtime flag exists

Major lane:
- lane: accepted Plite-plan execution, batch 0 only
- output type: private prototype, tests, benchmark artifact, parent-plan evidence
- implementation expected: yes
- affected packages / surfaces: `packages/plite/test` and the narrowest existing
  benchmark owner; docs plans only outside those owners
- dominant risk: a token algebra that is correct only for trivial text changes
  or whose indexing/materialization cost makes it a false architecture signal

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Explicit request: steal the first accepted Wordgard donor batch and execute.
- Scope: slice 0 only: behavior vectors, an unexported JSON token-index/
  `ChangeSet` prototype, and a fair current-versus-prototype gate.
- Non-goals: production engine adoption, public API, runtime flag, compatibility
  path, React/DOM/history/Yjs rewrites, later slices, git publication.
- Stop condition: stop only for an unreadable owner or a correctness/benchmark
  question that remains unresolved after three distinct focused attempts.
- Deliverable: tested private prototype, reproducible benchmark evidence,
  promotion/deletion verdict, updated execution and parent plans, concise final
  handoff.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed request
- initial confidence score: N/A: binary proof gates are stronger
- improvement loop: focused red/green tests, benchmark, review, repair
- final score / loop closure: N/A: close only on the binary threshold below

Completion threshold:
- A private prototype over plain Plite JSON supports apply, compose, invert,
  position mapping, concurrent transform, changed-range iteration, and
  serialization without becoming a package export or selectable runtime.
- Deterministic tests cover text, nested nodes, properties, moves expressed as
  replacements, deleted/mapped positions, multi-root document changes, inverse
  round trips, compose equality, and transform convergence.
- The current and prototype runners execute equivalent representative edits;
  three runs record time, retained/result bytes, and index/token cost. Every
  lane's median transaction and canonical replay time must remain within 2x
  current. Distribution tails and shape metrics are diagnostic because
  independently sampled sub-millisecond p95/p99 values are scheduler/GC
  sensitive; any material outlier needs an explicit recorded assessment.
- The prototype receives a source-backed promote/delete verdict and all touched
  source, test, lint, review, and plan-check gates pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md`
  passes.

Verification surface:
- Focused Bun tests for the private prototype and current-behavior vectors.
- A reproducible benchmark command writing bounded JSON/Markdown evidence under
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/`.
- Source-first `packages/plite` typecheck when production package source is
  touched; scoped lint; `autoreview`; both execution-plan and parent-plan
  `check-complete` commands.
- Browser N/A unless implementation changes a runnable package-facing behavior;
  a test-only unexported prototype has no browser runtime surface.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute only because the user explicitly accepted slice 0 in this turn.
- Preserve plain JSON and arbitrary serializable node properties; do not copy
  Wordgard's public class model.
- No public export, runtime flag, compatibility alias, production call site, or
  package release claim.

Boundaries:
- Source of truth: accepted parent plan, `../wordgard/src/doc/change.ts`, current
  Plite model/operation/test/benchmark owners.
- Allowed edit scope: private test/prototype/benchmark files, bounded execution
  artifacts, and the two plan documents; production package source only if the
  private test owner cannot model the contract honestly.
- External sources: N/A: both donor and target repositories are local.
- Browser surface: N/A unless a runtime-facing behavior changes.
- Tracker sync: N/A: no issue or external tracker backs this batch.
- Non-goals: slices 1-10, public `ChangeSet`, production transaction changes,
  operation deletion, schema correction rewrite, Plate adoption, release work.

Output budget strategy:
- Read exact donor/target files and focused globs only; exclude dependencies,
  generated output, caches, fixtures, and build artifacts by default; inspect
  counts/filenames before content; cap source/test output; write repeated
  benchmark data to an artifact instead of streaming it.

Blocked condition:
- Block only if a required local donor/target owner is unreadable, or the same
  algebra/parity/benchmark failure remains after three genuinely different
  focused fixes and no smaller truthful prototype can answer the decision.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: parent slice 0 baseline repair, then slice 1
- goal_status: complete

Current verdict:
- verdict: promote the section algebra plus persistent tree index into slice 1;
  reject flat full-document token materialization
- confidence: high for the private representation decision; production remains
  gated by schema/correction, compact serialization, and arbitrary composed-change
  locality
- next owner: parent slice 0 repairs stale current baseline runners, then slice 1
  owns the production immutable snapshot/index design
- reason: canonical local and serialized replay pass parity and stay under the
  accepted 2x transaction budget across three 1,000-block runs

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copies scope, non-goals, stop condition, deliverable, proof, and success criteria |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | no | N/A: `plite-plan` owns accepted-plan execution; this template is only the proportional execution ledger |
| Active goal checked or created | yes | Active goal names this exact plan and binary threshold |
| Source of truth read before analysis | yes | Accepted parent plan and its slice 0 contract reread before implementation |
| Major lane selected | yes | Accepted Plite-plan execution, slice 0 only |
| Decision criteria stated | yes | Algebra, parity, three-run benchmark, private-only gates above |
| Existing repo patterns / prior decisions checked | yes | Wordgard section algebra, Plite operation/move/root contracts, package tests, and benchmark owners inspected |
| Helper stack selected | yes | `plite-plan` + `autogoal`; no subagents or external research |
| External research decision recorded | no | N/A: local donor and target source settle the batch |
| Implementation expectation recorded | yes | Explicit user authorization; implementation required |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`; `../wordgard` is read-only donor evidence |
| Branch / PR expectation decided | no | N/A: user did not request git publication |
| Output budget strategy recorded | yes | Bounded exact-owner reads and artifacted benchmark output above |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before implementing the accepted architecture
      prototype.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: local repos are authoritative.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: test-only prototype,
      no public/package/browser/agent contract changed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 14 prototype tests, 62 current behavior-vector tests, full 51-test package suite, typecheck, lint, three-run benchmark green |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Wordgard `change.ts`, Plite operation/root/selection/normalization/history/collab owners, and current benchmark scripts audited |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Canonical algebra/parity/locality passed; correction moved to schema slices; stale baseline scripts remain a parent-slice owner |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Persistent tree index promoted; flat re-tokenization and non-serialized sidecars rejected |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | `autoreview --mode local` run through eight evidence-changing cycles plus final clean pass |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Same/cross-parent moves, benchmark symmetry/policy, canonical replay, and absent-root inverse shape fixed with tests |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local donor and target source are authoritative |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Private-only tests/benchmark; no exports, barrels, changeset, browser runtime, or public docs apply |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final handoff section below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm --filter @platejs/plite lint:fix` passes; benchmark path is outside configured Biome inputs |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Benchmark output redirected to bounded artifacts/logs; one large assertion diff recorded below and subsequent reads narrowed |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md` | `[autogoal] complete` on 2026-07-17 after its first pass correctly caught this pending evidence row |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Accepted parent plan, donor algebra, target operation/index/test/benchmark owners read | Current-state map |
| Current-state map | completed | JSON model, operation families, roots, selection, normalization, history/collab contracts mapped | Prototype |
| Options and recommendation | completed | Flat stream rejected; section algebra + persistent tree index chosen | Review |
| Review / pressure pass | completed | All current actionable autoreview findings fixed | Verification |
| Implementation or plan artifact | completed | Private prototype, tests, benchmark runner, artifact implemented | Verification |
| Verification | completed | Focused/broad tests, typecheck, lint, canonical replay, three-run gate green | Closeout |
| Closeout | completed | Parent and execution evidence updated; both plan checkers pass | Final response |

Findings:
- Confirmed source fact: Wordgard's reusable section algebra can be adapted to
  plain JSON without exposing its class model. Text leaves need private open/
  close positions so empty leaves and leaf properties remain addressable.
- Confirmed target fact: Plite `move_node` destinations use pre-removal paths;
  cross-parent targets must transform through source removal.
- Measured fact: naive flat token re-materialization was 15-39x slower at 1,000
  blocks and was rejected. A persistent tree index with structural JSON sharing
  reduced the final three-run worst median transaction ratio to 1.59x.
- Measured fact: every promoted lane also reconstructs from `toJSON`, applies,
  publishes, and checks parity; worst canonical serialized replay median ratio
  is 1.50x.
- Measured fact: prototype setup medians are 4.36-4.60 ms versus current editor
  setup 7.07-8.33 ms for the 1,000-block fixture. Position units are
  1.45 per text code unit; token count is 2.5 per source node.
- Diagnostic fact: p99 is the single maximum at 40 iterations. Its ratios are
  noisy and non-repeatable across lanes/runs (up to 9.45x) while absolute tails
  remain at or below 3.91 ms; they do not support a stable regression claim and
  remain visible rather than silently discarded.
- Confirmed proof fact: 14 prototype tests cover JSON/empty leaves/props,
  operation parity, same/cross-parent/forward-append moves,
  compose/invert/serialization,
  structural sharing/identity, invalid structure, position mapping, concurrent
  transform, multi-root document change, created-root inverse deletion,
  roots-container preservation, and 80x6 deterministic edit vectors.
- Confirmed current-law fact: 62 focused Plite normalization/history/collab/
  roots/selection tests and the full 51-test package-discovered suite pass.
- Inference: the architecture signal supports promotion into slice 1, but the
  test prototype is not production code and must not become an export or runtime
  flag.
- Recommendation: keep the section law and persistent tree-index shape; delete
  any production design that scans/re-tokenizes a whole root per local edit.
- Stale-plan finding: the five inherited current baseline scripts named by the
  parent slice still import removed `packages/slate`/`@platejs/slate` owners.
  Their repair remains a parent slice-0 task, not evidence against this bounded
  representation gate.

Decisions and tradeoffs:
- Promote immutable section pairs, canonical JSON serialization, mapping,
  compose/invert/transform, changed ranges, root-aware `DocumentChange`, and a
  persistent tree index into slice 1.
- Reject flat full-document token arrays as the committed materialization path;
  they failed the performance gate catastrophically.
- Reject operation-specific/non-serialized materializer callbacks. Indexed fast
  apply is derived from canonical sections and is re-proven after `toJSON`/
  `fromJSON`.
- Gate median transaction and canonical replay ratios, not independently sampled
  p99 ratios: with 40 sub-millisecond samples p99 is the maximum and primarily
  records scheduler/GC noise. Keep p75/p95/p99/max visible as diagnostics.
- Keep arbitrary composed changes correct through canonical fallback; require
  slice 1 to make their indexed application local before production promotion.
- Defer `correct`/fit laws to slices 1 and 5 because correction without the
  compiled schema would be fake. This repairs the parent proof ordering.
- Accept verbose debug JSON only for this private artifact. Slice 1/2 must own a
  compact canonical codec before collaboration/history adoption.
- No public export, runtime switch, compatibility layer, changeset, barrel, or
  browser proof: the batch changes no runnable package behavior.

Implementation notes:
- `packages/plite/test/prototypes/json-change-set.ts` is intentionally private
  test code and imports no production owner.
- `benchmarks/slate-v2/donor/core/current/wordgard-changeset-prototype.mjs`
  compares five equivalent edit families with one subscriber on both runtimes.
- Durable evidence is
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/changeset-prototype-benchmark.json`.

Review fixes:
- Cross-parent move used the original target parent after removal -> accepted ->
  transform destination through removal and add current-Plite parity test.
- Current timing included publication while prototype did not -> accepted ->
  time one-subscriber transaction/commit publication symmetrically.
- Helper sidecars bypassed serialized `ChangeSet` apply -> accepted -> delete
  sidecars, derive indexed apply from canonical sections, gate every serialized
  replay lane.
- Main-only `DocumentChange` synthesized `roots: {}` -> accepted -> preserve
  absent root shape and add inverse round-trip test.
- Benchmark policy claimed every measured metric while gating medians ->
  accepted -> make median-only promotion explicit and retain tail diagnostics
  with the sub-millisecond/sample-count rationale.
- Prototype publication was a direct assignment -> accepted -> dispatch through
  a one-subscriber registry in both local and serialized replay timers.
- Same-parent forward append resolved past the original parent boundary ->
  accepted -> clamp the simultaneous insertion coordinate to the original
  child boundary and add exact current-operation parity for `[0] -> [2]`.
- Inverting creation of an absent secondary root left `{ root: [] }` ->
  accepted -> serialize explicit root deletion/container-presence metadata and
  prove exact round trips for absent and intentionally empty `roots` shapes.
- Move identity compared `JSON.stringify` output -> accepted -> use recursive
  order-insensitive JSON equality and prove identity transfer when `children`
  precedes `type` in source property order.
- Execution plan remained pending -> accepted -> this evidence closeout and
  checker proof.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct Bun preload invoked test-only `afterEach` outside runner | 1 | Run benchmark with direct source imports and no preload | resolved |
| Benchmark compared JSON strings and treated property order as drift | 1 | Use structural equality | resolved |
| Flat token re-materialization exceeded 2x | 2 | Replace full scan/re-encode with structural sharing and persistent tree index | resolved; final gate green |
| Turbo filter was run from package cwd | 2 | Run source-first Turbo typecheck from repo root | resolved |
| Bun contract filters lacked `./` path prefix | 1 | Rerun exact files with explicit relative paths | resolved |
| Five inherited baseline scripts import removed Slate owners | 1 grouped attempt | Record stale owner and keep this bounded gate on the new Plite runner | deferred to parent slice 0 |
| First absent-root inverse fix still spread the old `roots` field into output | 1 | Delete the field from the cloned result when the root container must be absent | resolved by exact round-trip test |
| Autoreview found in-scope correctness/fairness/ledger issues | 8 cycles | Verify each against live source, patch, add proof, rerun | resolved |

Verification evidence:
- `bun test --preload ../../config/plite-source-test-setup.ts test/json-change-set-prototype.test.ts` in `packages/plite` -> 14 pass.
- `bun test --preload ../../config/plite-source-test-setup.ts ./test/normalization-contract.ts ./test/collab-history-runtime-contract.ts ./test/rooted-operation-contract.ts ./test/selection-rebase-contract.ts` in `packages/plite` -> 62 pass.
- `pnpm --filter @platejs/plite test` -> 51 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/plite` -> pass.
- `pnpm --filter @platejs/plite lint:fix` -> pass.
- `bun benchmarks/slate-v2/donor/core/current/wordgard-changeset-prototype.mjs` -> three runs, parity true, median local transaction <=1.59x, median canonical serialized replay <=1.50x, promotion true.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` -> final clean
  pass exits 0 after eight accepted evidence-changing repair cycles.
- Browser proof -> N/A: no package export, runtime path, app, React, or DOM behavior changed.
- Barrels/changeset -> N/A: no public/package source or export changed.

Final handoff contract:
- Recommendation: promote the Wordgard-inspired section algebra and persistent
  JSON tree index into slice 1; never promote the flat token materializer.
- Confidence: high for the private architecture decision.
- Evidence: 14 prototype tests, 62 current-law tests, full package suite,
  typecheck/lint, canonical serialized replay, three-run artifact.
- Tests / commands: exact commands in Verification evidence.
- Browser proof: N/A: private test/benchmark only.
- PR / tracker: N/A: user did not request git publication or tracker updates.
- Caveats: composed multi-change locality, compact serialization, schema fit/
  correction, runtime IDs, and stale inherited baseline scripts remain future
  gates; no production API exists yet.
- Next owner: parent slice 0 repairs baseline runner ownership; slice 1 then
  implements the immutable snapshot/index/schema substrate.

Timeline:
- 2026-07-17T00:19:45.300Z Major-task goal plan created.
- 2026-07-17 Donor section algebra and Plite operation/index/test owners mapped.
- 2026-07-17 Private JSON token/section prototype and parity/property tests added.
- 2026-07-17 Flat materialization failed 15-39x and was replaced by persistent
  tree indexing and structural sharing.
- 2026-07-17 Benchmark fairness and canonical serialized replay hardened through
  autoreview; final three-run gate passed.
- 2026-07-17 Focused/current-law/full-package/typecheck/lint proof passed.
- 2026-07-17 Parent and batch handoff evidence prepared.
- 2026-07-17 Final scoped autoreview clean; both plan checkers green.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I? | Closeout complete; both plan checkers green |
| Where am I going? | Parent slice 0 baseline repair, then production slice 1 |
| What is the goal? | Prove or reject the first private Wordgard ChangeSet donor batch without public/runtime adoption |
| What have I learned? | Section algebra works; flat token materialization does not; persistent indexed JSON is the viable shape |
| What have I done? | Implemented, benchmarked, reviewed, repaired, and verified the private representation gate |

Open risks:
- Arbitrary composed multi-change apply is correct through canonical fallback but
  not yet guaranteed local; slice 1 must close that performance law.
- The debug JSON codec is verbose, especially for inserted/moved nodes; compact
  canonical serialization is required before history/Yjs adoption.
- Schema fitting and changed-range correction cannot be proven until the
  compiled schema exists; they move to slices 1 and 5.
- Five inherited baseline scripts still target removed Slate package paths and
  must be repaired or replaced before the parent slice 0 is globally complete.

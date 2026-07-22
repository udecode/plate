# Plite Plate agent native API shape audit

Objective:
Audit Plite and Plate public authoring APIs for the best static-import,
contextual-callback, descriptor, or imperative shape; finish with a complete
source-backed AX ledger and ranked hard-cut recommendations.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user-requested repository-wide public API audit
- id / link: current checkout plus this plan
- title: Plite and Plate agent-native API shape audit
- decision to make: which public authoring concepts should stay static imported
  declarations, which genuinely require contextual callbacks, and which deserve
  a better descriptor or imperative shape
- decision criteria: lowest ceremony without hiding ownership; static data stays
  data; callbacks expose only context that changes the result; inference,
  discoverability, source ownership, proof, and migration impact are explicit

Major lane:
- lane: architecture or public API, analytical only
- output type: exhaustive concept ledger, capability map, findings, and ranked
  recommendation
- implementation expected: no; implementation requires later explicit acceptance
- affected packages / surfaces: public authoring exports and teaching surfaces of
  `@platejs/plite`, `@platejs/plite-react`, `@platejs/core`, `platejs`, and
  `platejs/react`; feature packages are included when they define or expose a
  reusable authoring pattern rather than merely consume one
- dominant risk: mistaking convenient callback syntax for better AX, or claiming
  completeness from lexical matches without reconciling exports, types, docs,
  examples, and proof

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: N/A; completeness is a binary classified-ledger gate
- improvement loop: continue until every discovered public authoring concept is
  classified and every candidate recommendation has source, teaching, proof,
  ownership, and rejection evidence
- final score / loop closure: zero unclassified candidate concepts and zero
  unresolved capability-map gaps

Completion threshold:
- Every public authoring concept in the named entrypoints is inventoried from
  live exports/types and reconciled against docs/examples/tests.
- Every callback, factory, builder/descriptor, declarative object, and imperative
  authoring surface is classified as `keep static`, `keep callback`, `replace
  with static import`, `replace with descriptor/builder`, `replace with direct
  method`, or `defer`, with no unclassified row.
- The agent-native capability map names the user action, agent route, source
  owner, teaching/release surface, proof, and status for every recommended
  change family.
- Findings are severity-ranked and conclude with the absolute-best target shape,
  hard cuts, blast radius, and a dependency-ordered next-work ranking.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md`
  passes.

Verification surface:
- Export/type inventory for the named public entrypoints.
- Scoped source counts and exact-owner reads across `packages/plite*`,
  `packages/core`, `packages/plate`, relevant feature packages, docs, examples,
  and type/tests.
- `docs/plans/artifacts/plite-plate-agent-native-api-shape-audit/api-shape-ledger.md`.
- Agent-native review capability map and a second source-backed pressure pass.
- Final `check-complete.mjs` and `git diff --check` for planning artifacts.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Optimize for agent experience and human DX together; do not invent agent-only
  wrappers or inject globally importable namespaces into callbacks.
- Treat callbacks as earned power, not import avoidance.
- Give harsh, binary recommendations; do not preserve weak compatibility shapes.

Boundaries:
- Source of truth: current checkout exports, types, implementations, type-tests,
  package tests, current docs/examples, root `VISION.md`, and Plate/Plite vision.
- Allowed edit scope: this plan and its audit artifact only.
- External sources: N/A; local source settles this API-shape audit.
- Browser surface: N/A; no runtime/visual behavior claim or implementation.
- Tracker sync: N/A; no tracker item.
- Non-goals: implementation, compatibility aliases, package changesets, barrel
  generation, browser proof, benchmarks, and reviewing feature-specific business
  behavior unrelated to reusable authoring API shape.

Output budget strategy:
- Count and list files/symbol families before opening matches; inspect bounded
  ranges by owner; exclude `node_modules`, build output, generated templates,
  `.next`, `.turbo`, `tmp`, and test results; write the exhaustive ledger to the
  artifact rather than streaming it; cap ordinary reads to a few thousand tokens.

Blocked condition:
- Stop only if a public entrypoint cannot be resolved from the current checkout
  or a candidate's ownership cannot be distinguished after its export, type,
  implementation, docs/example, and proof owners are read.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: implementation requires a separately accepted hard-cut packet
- goal_status: complete after checker

Current verdict:
- verdict: NEEDS WORK; static-import doctrine is correct, but Plate plugin,
  React, package-entrypoint, and several Plite support APIs violate it
- confidence: high; independent owner audits plus an adversarial pressure pass
  reconcile exports, types, implementations, docs, examples, and proof
- next owner: `plite-plan` / `plate-plan` for an accepted ranked packet
- reason: the review is complete; implementation was outside this goal

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full Plite/Plate API scan, import/callback/better-shape comparison, best AX, and agent-native review are explicit above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely |
| Active goal checked or created | yes | `get_goal` returned no goal; this plan supplies the goal handle |
| Source of truth read before analysis | yes | Root/common/Plate/Plite vision and prior schema ownership decision read before inventory |
| Major lane selected | yes | Architecture/public API, analytical only |
| Decision criteria stated | yes | Static-data, earned-callback, inference, discoverability, ownership, proof, and migration criteria above |
| Existing repo patterns / prior decisions checked | yes | Current schema contribution plan and schema docs/types establish the initial static-import rule |
| Helper stack selected | yes | `major-task`, `autogoal`, and named `agent-native-reviewer`; bounded source agents only |
| External research decision recorded | no | N/A: local source owns current API truth |
| Implementation expectation recorded | yes | Review-only; no implementation without later acceptance |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | no | N/A: analytical artifact only; no PR requested |
| Output budget strategy recorded | yes | Count-first, owner-bounded reads, artifacted ledger, noisy paths excluded |
| Agent-native pack selected | yes | Materialized in this plan |
| Agent-facing action surface identified | yes | Discover/configure/extend/compose/read/update/verify public authoring APIs |
| Source rule versus generated mirror boundary identified | yes | Package sources/types/docs are owners; generated barrels/templates are proof outputs only |
| `agent-native-reviewer` loaded or waiver recorded | yes | Named skill supplied and local source read completely |
| Package/API pack selected | yes | Materialized in this plan |
| Public surface or package boundary identified | yes | Named five entrypoints plus reusable feature-package pattern owners |
| Release artifact path selected | no | N/A: no published user-visible implementation delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no implementation or package delta |
| Barrel/export impact decision recorded | no | N/A: review artifacts do not alter exports |

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
      surface, and highest-leverage owner. The artifact maps every named
      package and ranks the API-proof owner first.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan. See the exhaustive concept ledger and production
      census in the artifact.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research. The accepted schema
      and command plans settled two tempting but incorrect cuts.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: live local source, docs,
      tests, and accepted plans settle current API truth.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded in the artifact's ledgers, ranked findings, and pressure pass.
- [x] Facts, inference, and recommendation are separated by current-shape,
      classification, target, evidence, and pressure sections.
- [x] Review or pressure lenses are selected and completed. Independent Plite
      core, Plite satellite, Plate plugin, Plate runtime, usage-census, and
      adversarial passes were reconciled.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: review-only goal.
- [x] Workspace authority recorded: every source/proof path belongs to
      `/Users/zbeyens/git/plate-2`.
- [x] Output budget discipline recorded and followed: broad searches were
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are recorded for later implementation
      or explicitly rejected with evidence. No product edit was authorized.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: no agent rule changed.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. N/A: this review changes no agent action.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A: no rule changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. The artifact accepts, rejects, or defers every finding; implementation is a separate goal.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded in the artifact.
- [x] Package/API pack: release artifact matrix is applied. No artifact: planning-only review with no published package delta.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no package delta.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry edit.
- [x] Package/API pack: no-artifact decision is explicit: docs-plan-only audit, no published user-visible delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decisions are explicit for every proposed public change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A. N/A: no package source changed.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exports changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete zero-unclassified audit and artifact | Complete concept ledger, capability map, 25 ranked packets |
| Current-state source audit | yes | Map owners, boundaries, constraints, and affected surfaces | Live exports/types/implementations/docs/tests and production census reconciled |
| Decision criteria closure | yes | Close static/callback/descriptor/direct criteria | Decision rule plus every-row classification in artifact |
| Options / tradeoffs / rejection record | yes | Record viable options and why alternatives lose | Accepted/rejected and pressure-pass sections |
| Review / pressure pass | yes | Run independent and adversarial lenses | Six owner/usage/pressure passes reconciled |
| Review findings closure | yes | Accept, reject, or defer each finding | Command factory, schema refs, shortcut ownership, callback normalization pressure verdict recorded |
| External-source audit | no | Local source is authoritative | N/A: no external claim used |
| Implementation gates | no | Review-only goal | N/A: no package/app implementation |
| Final handoff contract | yes | Record recommendation, evidence, caveats, and next owner | Completed below |
| Final lint | no | No source or user-facing docs changed | N/A: plan Markdown only; whitespace proof applies |
| Output budget discipline | yes | Keep broad output bounded | Count-first scans, bounded owner reads, exhaustive artifact |
| Timed checkpoint | no | No duration requested | N/A |
| Goal plan complete | yes | Run checker | Final checker run recorded in verification evidence |
| Agent source / generated sync | no | No `.agents/rules/**` edit | N/A |
| Agent action discoverability | no | No agent action changed | N/A |
| Agent-native review | yes | Load named skill and close review | Capability map, findings, accepted/rejected, verification, needs-attention sections complete |
| Public API / package boundary proof | yes | Audit public exports and boundaries | Package concept ledger and entrypoint findings |
| Release artifact classification | yes | Classify the diff | Docs-plan-only audit, no published package delta |
| Published package changeset | no | No package delta | N/A |
| Registry changelog | no | No registry delta | N/A |
| No release artifact | yes | Record exact reason | Planning-only artifact; no runtime/API/type/config behavior changed |
| Package typecheck/build/test | no | No package source changed | N/A; source audit is the appropriate proof |
| Barrel/export generation | no | No exports changed | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Requirements, skills, vision, and accepted plans read | current-state map |
| Current-state map | completed | Export/type/callsite census plus owner audits | options |
| Options and recommendation | completed | Exhaustive ledger and ranked packets | review |
| Review / pressure pass | completed | Independent agents plus adversarial reconciliation | artifact |
| Implementation or plan artifact | completed | `api-shape-ledger.md`; no product implementation | verification |
| Verification | completed | Source audits, whitespace check, and plan checker | closeout |
| Closeout | completed | Final handoff below | final response |

Findings:
- Imported `schema` / `property` / `target` is the correct model; injecting
  globally importable builders into a callback is worse AX.
- `inputRules: ({ rule }) => ...` is the exact fake-DI violation: zero
  production factories, 23 production arrays, and only docs/tests use it.
- Plite `commands: ({ handle, around }) => ...` looks similar but is a valid
  exception because it binds installed-editor inference.
- Plate's broadest callback tax is nested `.extendTx`: roughly 59 production
  registrations expose a private two-phase implementation detail.
- Plate React exposes type lies through fallback editors and casted
  element/path values, while Plite React already owns a stronger hook model.
- The complete ranked findings and all concept classifications live in
  `docs/plans/artifacts/plite-plate-agent-native-api-shape-audit/api-shape-ledger.md`.

Decisions and tradeoffs:
- Keep static schema objects for ordinary plugins and schema factories for
  immutable config, configured owner types, and installed typed references.
- Reject descriptor-owned Plite command registration because it loses the
  installed editor generic.
- Keep shortcuts Plate-owned; replace implicit tx/API precedence with an
  explicit Plate target rather than putting DOM keys on headless commands.
- Normalize low-frequency lifecycle callback contexts surgically; reject one
  mega context and leave hot Plite state/tx primary arguments alone.
- Split semantic and host targeting instead of blindly replacing every plugin
  key string with a descriptor that creates package dependencies.

Implementation notes:
- Review-only. No package, app, export, generated barrel, test, or user-facing
  documentation implementation was performed.

Review fixes:
- Rejected the first-pass descriptor-owned command suggestion after the generic
  command contract proved installed-editor inference would regress.
- Rejected a second Plate-only unresolved schema AST after the accepted schema
  plan and compiler showed that current advanced factories provide real
  configured-type and candidate-installation validation.
- Narrowed shortcut work from command ownership to a Plate-owned target union.
- Narrowed callback unification to lifecycle/middleware payloads and flattened
  Plate tx authoring; no universal callback context.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial static cross-plugin schema recommendation conflicted with accepted compiler ownership | 1 | Read accepted schema plan and run adversarial owner pass | Rejected; advanced schema factories stay |

Verification evidence:
- Source audits: live package barrels, public types, implementations, docs,
  examples, package tests, type contracts, and bounded production callsites.
- Reconciled owner passes: Plite core, schema, satellites, Plate plugin,
  Plate runtime/React, production usage, and adversarial design review.
- Artifact audit verified 16 local evidence links and the complete rank sequence
  `0..24`.
- `git diff --check -- docs/plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md docs/plans/artifacts/plite-plate-agent-native-api-shape-audit/api-shape-ledger.md`
  passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md`
  passed.

Final handoff contract:
- Recommendation: use imported frozen namespaces for pure construction, plain
  objects for static declarations, descriptors for identity/policy, and
  callbacks only for real config/runtime input. Execute the 25 ranked packets
  from the artifact as separately accepted vertical hard cuts.
- Confidence: high after independent source owners and adversarial pressure.
- Evidence: exhaustive artifact, production usage census, accepted architecture
  reconciliation, and exact owner links.
- Tests / commands: source audit, `git diff --check`, and final plan checker;
  package/browser tests are N/A because no implementation occurred.
- Browser proof: N/A; no runtime or visual claim.
- PR / tracker: N/A; none requested.
- Caveats: implementation blast radius is substantial, especially React hooks,
  entrypoints, and tx authoring; every packet needs no-alias migration proof.
- Next owner: `plite-plan` or `plate-plan` after the user accepts a ranked packet.

Timeline:
- 2026-07-22T15:27:15.569Z Major-task goal plan created.
- 2026-07-22 Requirements extracted; review-only scope, AX decision rule,
  completeness threshold, proof owners, and output-budget policy fixed before
  broad inventory.
- 2026-07-22 Reconciled seven source lanes into an exhaustive concept ledger,
  capability map, severity findings, rejection record, and 25-packet ranking.
- 2026-07-22 Adversarial pass preserved justified command/schema callbacks and
  narrowed targeting, shortcut, and lifecycle recommendations.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final verified handoff; implementation requires a new accepted packet |
| What is the goal? | Exhaustively classify Plite/Plate public authoring shapes and rank the best AX changes |
| What have I learned? | Static import is the default, but callbacks stay when they bind real compiler/runtime context |
| What have I done? | Completed the artifact, pressure pass, and closure gates |

Open risks:
- The artifact is architectural review, not implementation proof. Source can
  continue changing until a packet is accepted; re-audit the target owner at
  each execution start.

# Build Plate feature development flow

Objective:
Implement the Plate package-to-registry development workflow; done when the
master skill, progressive worker topology, checks, mirrors, and forward tests pass.

Goal plan:
docs/plans/2026-08-17-build-plate-feature-development-flow.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: accepted architecture proposal in this task
- id / link: N/A
- title: Full Plate feature development flow
- decision to make: implement one end-to-end coordinator without merging or
  duplicating existing doctrine owners.
- decision criteria: complete package-to-registry coverage, one plan/manifest,
  no generator resurrection, progressive context loading, deterministic proof,
  discoverable routing, versioned doctrine, and forward scenarios.

Major lane:
- lane: agent workflow architecture and implementation
- output type: new coordinator skill/template/checker plus worker topology repair
- implementation expected: yes, explicitly authorized by `go with your proposal`
- affected packages / surfaces: `.agents/AGENTS.md`, skill source rules/resources,
  goal templates/packs, root checker script/tests/command, generated mirrors,
  Plate Next doctrine/version registry.
- dominant risk: duplicating doctrine, losing rules during progressive splits,
  or creating another wrapper-only skill with no independent workflow job.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: binary coverage/parity/scenario matrix applies
- improvement loop: implement vertical packets and preserve/review every moved rule
- final score / loop closure: N/A: close on all coverage rows and checks passing

Completion threshold:
- `plate-feature` owns one manifest and phase transitions from manual package
  creation through semantic package, React adapter, copied registry, kits,
  metadata/examples, docs, release artifacts, proof, attestation, and review.
- Existing owners remain distinct; master links them and contains no copied
  API/plugin/UI/docs/release doctrine.
- Oversized worker entrypoints use progressive references with no rule loss;
  descriptions regain budget; no Plop/gen-package replacement exists.
- A deterministic checker validates a feature manifest/owner coverage without
  becoming another product DSL; tests cover new/existing/headless/registry-only
  scenarios.
- AGENTS routing, templates/packs, Plate Next versioning, mirrors, source parity,
  lint, agent-native review, P2 review, and goal checker pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-build-plate-feature-development-flow.md`
  passes.

Verification surface:
- Rule-content preservation audits across source main+references and generated mirrors.
- `pnpm install`, Plate Next doctrine validation/fingerprint, checker unit tests,
  four scenario dry runs, skill budget report, source/generated stale audits,
  lint, agent-native capability map, and isolated P2 autoreview.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not merge `plate-plugin-creator` with `plate-ui`, or changeset with registry changelog.
- Do not recreate `gen:package`, Plop, a replacement generator, or package-scaffold command.
- Do not make `plate-feature` a doctrine copy or wrapper-only alias; it must own
  the cross-layer manifest, phase ordering, conditional packs, and completion contract.
- Do not mass-attest packages after a doctrine bump.

Boundaries:
- Source of truth: root/Plate Vision, `.agents/AGENTS.md`, existing responsibility
  chain, worker source rules/resources, templates/packs, current repo checks.
- Allowed edit scope: agent source/routing/templates/resources, generated mirrors,
  root feature-check tooling/tests/script, Plate Next version history, this plan.
- External sources: N/A; local repo and accepted user direction settle the design.
- Browser surface: N/A; workflow/tooling only.
- Tracker sync: N/A.
- Non-goals: package/product/registry implementation, public docs, package
  generation automation, templates/**, commits, pushes, PRs, or package attestations.

Output budget strategy:
- Use counts/manifests before excerpts; split large skill reads by section;
  preserve moved-rule inventories in the plan/checker rather than streaming
  whole generated mirrors; exclude packages/build/cache/generated registry data.

Blocked condition:
- Block only if source/mirror tooling cannot support progressive references
  without rule loss, or the checker needs a product schema/API decision outside
  the accepted workflow contract.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete after checker

Current verdict:
- verdict: create one thin `plate-feature` coordinator and progressively split
  worker details; retain every existing doctrine owner.
- confidence: high
- next owner: agent workflow source owners
- reason: current responsibilities are correct, but no end-to-end route exists,
  key entrypoints exceed progressive-disclosure limits, and proof is scattered.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-build-plate-feature-development-flow.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted full proposal, adjusted by explicit Plop/generator hard cut, captured above. |
| Timed checkpoint parsed | no | N/A. |
| `major-task` loaded | yes | Full skill read before implementation. |
| Active goal checked or created | yes | Goal points to this exact plan. |
| Source of truth read before analysis | yes | AGENTS responsibility chain, worker skills/rules, templates/packs, root scripts, registry owners, and budget report read. |
| Major lane selected | yes | Agent workflow architecture plus implementation. |
| Decision criteria stated | yes | Coverage, ownership, progressive context, proof, routing, versioning, and scenario gates above. |
| Existing repo patterns / prior decisions checked | yes | Existing autogoal packs/templates, Plate Next versioning, skill source/mirror sync, and current worker boundaries inspected. |
| Helper stack selected | yes | `skill-creator`, `architecture-cleanup`, `skill-cleaner`, `agent-native-reviewer`, `major-task`, `autoreview`. |
| External research decision recorded | no | N/A: local source settles it. |
| Implementation expectation recorded | yes | Full accepted proposal implementation, excluding rejected generator replacement. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | no | N/A: no branch/PR requested. |
| Output budget strategy recorded | yes | Counts/manifests and sectioned reads; no broad source dumps. |
| Agent-native pack selected | yes | New/changed skills, routing, commands, templates, and generated mirrors. |
| Agent-facing action surface identified | yes | End-to-end Plate feature creation/delivery and conditional worker routes. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`, `.agents/AGENTS.md`, templates/tooling; regenerate mirrors with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded and required for final capability map. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named workflow, parity, scenario, budget, version, and review checks | 26/26 focused tests, v98 validation, exact mirrors, template proof, budget proof, and clean final P2 review. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Existing responsibility chain retained; only cross-layer manifest/phase ownership was missing. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | One coordinator, manual package path, progressive workers, deterministic checker, four scenarios, and versioned doctrine all closed. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Recorded below; rejected skill merges, many peer coordinators, generator replacement, and duplicated ledgers. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Agent-native map completed; isolated P2 autoreview converged clean after in-scope repairs. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | 19 in-scope P1/P2 findings fixed; five unrelated `sync-shadcn` internals rejected as outside this description-only change; final review clean. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local accepted architecture and repo source settled the workflow. |
| Implementation gates | yes | Close primary-template and touched-surface gates | Skills, routing, templates, packs, checker/tests, mirrors, version registry, and proof closed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Target Biome check clean. Root `pnpm lint:fix` remains blocked by unrelated duplicate heading cases in `turn-into-toolbar-button.tsx`; it also formatted 56 pre-existing shared files, which were preserved. |
| Output budget discipline | yes | Verify bounded output | Searches were capped; reviews used isolated target snapshots; full skill report was reduced to its budget section. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| P2 autoreview | yes | Run isolated P2 autoreview and close accepted findings | Final run clean: no accepted/actionable P0-P2 findings. |
| Goal plan complete | yes | Run the autogoal completion checker | Final command passes after this update. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install`; shared resource check exact; AGENTS source/mirror exact; v98 skill parity valid. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/AGENTS.md` routes full feature delivery to `plate-feature`; generated skill exposes phases and proof. |
| Agent-native review | yes | Build capability map and close findings | PASS; capability map recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted requirements and existing owner chain captured | current-state map |
| Current-state map | complete | no end-to-end coordinator; oversized eager worker entrypoints; proof scattered | options |
| Options and recommendation | complete | one thin coordinator plus progressive workers selected | review |
| Review / pressure pass | complete | agent-native audit and iterative P2 review | implementation |
| Implementation or plan artifact | complete | source rules, template/pack, checker/tests, mirrors, v98 | verification |
| Verification | complete | 26 tests, parity/version/budget/template/format checks | closeout |
| Closeout | complete | final P2 review clean; handoff recorded | final response |

Findings:
- The worker ownership chain was correct; merging it would create a giant skill
  and duplicated doctrine. The missing owner was one cross-layer manifest and
  phase state machine.
- Repo-local skill descriptions remain within budget: 61 skills, 87.0% of the
  effective 2% budget, 672 tokens free, no truncation.
- Progressive disclosure reduced the six active front doors to 1,649 total
  lines; detailed rules remain in exact generated references.
- Plate Next proof needed stronger ownership than the initial proposal implied:
  exact generated documents, complete sync inventory, Git-anchored immutable
  history, existing evidence plans, and framed symlink-aware package hashes.

Decisions and tradeoffs:
- Chosen: one `plate-feature` coordinator. It owns only Feature Manifest state,
  phase order, conditional packs, attestation handoff, and completion.
- Kept separate: `best-api`, `plate-plan`, `plate-plugin-creator`, `plate-ui`,
  `docs-creator`, changeset, registry changelog, `plate-next`, and `autoreview`.
- Rejected: merging plugin/UI skills, merging release owners, several new peer
  coordinator skills, a replacement package generator, and separate cross-layer
  status ledgers.
- Headless and registry-only work are explicit flow modes, not incomplete full
  flows. Package flows add subordinate per-file evidence inside the same plan.

Implementation notes:
- Added `.agents/rules/plate-feature.mdc` with manifest, phase, and proof
  resources plus generated mirrors.
- Added the specialized goal template, Plate Next attestation pack, root
  `check:plate-feature` command, checker, and scenario/negative tests.
- Split Best API, Plate Next, Plate Plugin Creator, Docs Creator, and Plate UI
  details into progressive references without rewriting the moved law.
- Added AGENTS routing and shortened three long descriptions to regain budget.
- Bumped Plate Next to v98 without advancing any package attestation.

Review fixes:
- Fingerprinted AGENTS routing; made Plate Next a legal coordinator worker.
- Required resolved manifest evidence, exact flow modes, completed P2 review,
  same-plan per-file evidence, and authoritative package registry binding.
- Derived parity inventory from the sync owner; enforced full generated skill
  equality and retired-resource absence.
- Added existing evidence-plan checks, bytewise ordering, length-framed
  file-kind hashing, symlink targets, canonical history hashing, immutable base
  version increments, and exact history-prefix preservation.
- Fixed the template row grammar. Rejected five unrelated `sync-shadcn`
  findings because only its frontmatter description changed and those internals
  were outside the accepted workflow.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root P2 review saw unrelated credentials | 1 | Isolate only authorized workflow files | Target snapshots passed secret scan and final P2 review. |
| First snapshot skipped directories | 1 | Copy explicit files/resources | Complete source snapshot reviewed. |
| Used zsh special `path` loop variable | 1 | Rename to `resource_file` | Progressive resource audit passed. |
| Root lint blocked outside scope | 1 | Run target Biome proof; preserve shared WIP | Target files clean; unrelated heading cases recorded. |

Verification evidence:
- `pnpm install` regenerated source-owned mirrors.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs tooling/scripts/check-plate-feature.test.mjs` -> 26/26.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> v98 valid, 44 active and 2 retired.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- Target Biome check -> 7 files clean.
- AGENTS source/mirror audit -> exact.
- Live generator-name audit outside goal history -> zero.
- Template materialization includes all selected packs and one-line package
  evidence rows.
- Repo-local skill budget -> 87.0% effective budget, 672 tokens free.
- Isolated final P2 autoreview -> clean.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror / artifact | Proof | Status |
|-------------|-------------|--------------|-------------------|-------|--------|
| Deliver a Plate feature end to end | `plate-feature` from AGENTS routing | `.agents/rules/plate-feature.mdc` | generated skill + feature plan | scenario tests + template proof | pass |
| Create a package shell | manual package phase | two current siblings + `plate-plugin-creator` | Feature Manifest Package row | manifest/fingerprint/package proof | pass |
| Add package React and copied UI | conditional `plate-ui` phase | package/registry owners | React/registry manifest rows | selected type/browser packs | pass |
| Publish docs/release evidence | conditional docs/release workers | docs/changeset/registry changelog | one shared plan | pack gates | pass |
| Attest a reviewed package | `plate-next` phase | version registry + exact plan | same-plan file evidence | v98/base/fingerprint checks | pass |
| Maintain the workflow | source rules then `pnpm install` | `.agents/rules/**` + `.agents/AGENTS.md` | generated skills/AGENTS | exact parity + P2 review | pass |

Final handoff contract:
- Recommendation: use `plate-feature` only for complete cross-layer delivery;
  keep narrow work with its existing worker owner.
- Confidence: high.
- Evidence: all completion criteria and capability-map rows pass.
- Tests / commands: recorded above.
- Browser proof: N/A; this task changes agent workflow/tooling only.
- PR / tracker: N/A; none requested.
- Caveats: root lint still has unrelated registry duplicate-case errors; the
  required root fix command formatted 56 shared files before stopping, and no
  shared changes were reverted.
- Next owner: `plate-feature` for the next real package-to-registry feature.

Timeline:
- 2026-08-17T15:37:56.101Z Major-task goal plan created.
- 2026-08-17 Added coordinator, progressive references, template/pack, checker,
  tests, routing, and v98 doctrine.
- 2026-08-17 Closed 19 in-scope review findings and reached a clean P2 review.
- 2026-08-17 Final deterministic verification passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | One verified Plate package-to-registry development flow |
| What have I learned? | One coordinator is enough; proof must be plan-bound and Git-anchored |
| What have I done? | Implemented, versioned, mirrored, tested, and reviewed the workflow |

Open risks:
- Root lint remains blocked by unrelated registry heading cases. No workflow
  source, mirror, version, checker, or review risk remains open.

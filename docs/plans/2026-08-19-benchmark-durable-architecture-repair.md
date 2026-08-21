# Benchmark Durable Architecture Repair

Objective:
Repair Benchmark so a proven performance cause selects and implements the best
long-term durable architecture, including justified private-beta API breaks,
then reruns the exact lane and resumes breadth.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-benchmark-durable-architecture-repair.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: For Plate/Plite/Slate performance regressions, stop opening
  later lanes when the cause is proven, choose the best long-term durable fix
  rather than the smallest compatible patch, allow breaking API/architecture
  while the product remains private beta, implement through the correct owner,
  rerun the exact benchmark and correctness guard, then resume breadth.
- observed miss: Benchmark currently says "Apply the smallest durable fix" and
  mentions `best-api` routing without forcing an explicit long-term API verdict,
  layer plan, implementation owner, or private-beta break-vs-compatibility
  decision in the validated cause checkpoint.
- owning skill/template/helper: Benchmark rule, methodology, plan template,
  validator, and contract tests. Auto and durable Vision/Best API owners are
  audited and patched only if their teaching is stale.
- repair classification: derived-skill workflow contract plus reusable API
  architecture taste audit

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary contract and test closure
- improvement loop: N/A: repair until contract tests and reviews pass
- final score / loop closure: N/A: named pass/fail gates

Completion threshold:
- Benchmark's proven-cause state classifies the fix as internal,
  correctness, public API, or runtime architecture and records the selected
  long-term target, decision owner, adoption/implementation owner, and
  break/compatibility verdict before a fix can be called green.
- Public API/runtime architecture causes require `best-api` followed by
  `plite-plan` or `plate-plan`; broad execution may route through Auto, while a
  bounded package owner may implement directly.
- Compatibility, migration convenience, compiler difficulty, and current
  machinery cannot downgrade the target during private beta. Breaking is
  preferred when it yields materially better lasting value; correctness,
  security, serialized-data, and hard runtime laws remain non-negotiable.
- The exact red benchmark and correctness guard rerun after implementation,
  then Benchmark resumes the first pending lane.
- Source/generated parity, template/validator behavior, focused tests, Vision
  and worker audit, agent-native review, and this checker pass. Lint and P1
  Autoreview are explicitly N/A because the user prohibited both in this
  session.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-durable-architecture-repair.md` passes.

Verification surface:
- Benchmark source/generated contract tests for internal and architectural
  causes, invalid missing decisions, exact rerun, and breadth resume.
- Template validation plus unfinished-plan Autogoal guard.
- Source audit across Benchmark, Auto, Best API, layer plans, and relevant
  Vision owners.
- `pnpm install`, shared-resource sync check, Plate Next version validation,
  agent-native capability map, and goal-plan checker. Lint and P1 Autoreview
  are excluded by the user's latest instructions.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.
- Do not let "breaking allowed" waive correctness, security, persisted-data,
  native editor behavior, or comparable-benchmark proof.
- Do not turn Auto into a competing benchmark or API-plan owner.
- Do not run a product benchmark or change an actual public package API in this
  workflow-repair task.
- Do not run any further lint or formatter command; another session owns the
  linter migration.
- Do not run another Autoreview invocation; the user explicitly stopped it.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/benchmark.mdc`, its methodology,
  validator/tests, `docs/plans/templates/benchmark.md`, the smallest stale
  Auto/Best API/layer-plan/Vision sources, generated mirrors/resources, Plate
  Next version registry when required, and this plan.
- Derived skill scope: Benchmark owns cause classification, durable fix
  selection handoff, exact rerun, and breadth resume. Best API owns public call
  shape; Plite/Plate Plan owns adoption architecture; Auto only supervises broad
  implementation.
- Non-goals: actual performance diagnosis, runtime/product edits, API migration,
  benchmark execution, public GitHub mutation, commit, push, or PR.

Output budget strategy:
- Read exact owner files and capped search results only. Exclude `.tmp`, build
  output, `node_modules`, package sources, and benchmark artifacts because this
  is a workflow-contract repair. Keep ordinary tool output below 30k tokens.

Blocked condition:
- Stop only if the existing validator cannot represent the required
  architecture decision without replacing its public plan schema, or source
  sync/version validation cannot complete without destructive unrelated work.

Repair state:
- repair_type: derived Benchmark workflow and durable taste repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: goal completion
- goal_status: complete

Current verdict:
- verdict: pass
- confidence: high
- next owner: `$benchmark <scope>` runtime use
- reason: The source rule, validated checkpoint/history schema, template,
  generated mirrors, and 40 contract tests enforce the durable target flow.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-durable-architecture-repair.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact stop, long-term fix, breaking posture, owner routing, rerun, and resume requirements recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Recorded under Expectation |
| Active goal checked | yes | `get_goal` returned null before this plan |
| Named plan or skill read | yes | Read Benchmark fully; user supplied complete Auto and Best API contracts |
| Owning source selected | yes | Benchmark cause/fix contract and validated plan schema are primary |
| Repair classification selected | yes | Derived-skill workflow plus durable taste audit |
| Safety conflict checked | yes | Breaking remains subordinate to correctness, security, persisted-data, and runtime laws |
| Output budget strategy recorded | yes | Exact/capped owner reads recorded above |
| Agent-native pack selected | yes | Agent-native pack materialized in this plan |
| Agent-facing action surface identified | yes | Proven perf cause -> durable architecture decision -> implementation -> exact rerun -> breadth resume |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` and templates are source; `.agents/skills/**` and `.claude/skills/**` are generated mirrors |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required before closeout; loaded in the preceding skill-creation work and will be applied to the final action map |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: Benchmark skill rule, methodology, template, and
      validator contract.
- [x] Secondary owners are justified: Auto consumes accepted broad execution;
      Major Task and root/common Vision had stale smallest-fix teaching. Best
      API, Plite Plan, and Plate Plan were audited and deliberately preserved.
- [x] Patch touched source-of-truth files only; `pnpm install` generated all
      `.agents/skills/**`, `.claude/skills/**`, and root agent mirrors.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded:
      Benchmark owns this lane-specific behavior; Autogoal remains generic.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Final response shape is recorded: repaired flow, breaking posture,
      changed owners, verification, and no-commit/push status.
- [x] Agent-native pack: source-of-truth boundaries are recorded; generated
      mirrors will only be changed by sync.
- [x] Agent-native pack: the changed action will be discoverable from
      Benchmark's core flow and fix/rerun section.
- [x] Agent-native pack: generated mirrors are synced; four Benchmark
      `.agents`/`.claude` mirror comparisons and shared-resource check passed.
- [x] Agent-native pack: direct capability review passed with no findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Benchmark rule, methodology, template, validator, and tests contain the durable-fix contract |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; `.agents` and `.claude` Benchmark skill/resource/script mirrors compare exactly |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Benchmark validator reports `docs/plans/templates/benchmark.md` structurally valid |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Autogoal checker rejected the unfinished Benchmark template with concrete pending-field diagnostics |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Contract test `architectural fixes preserve their durable decision through completion` passes in source and generated suites |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | 40/40 source/generated Benchmark contract tests pass |
| P1 autoreview / review | no | N/A: user explicitly stopped Autoreview after invocation 1 became stale | No reviewer process remains; no rerun permitted |
| Final lint | no | N/A: user explicitly prohibited lint in this session because another session owns the linter migration | `pnpm lint:fix` was attempted once before the correction, failed on pre-existing repo diagnostics, and will not be rerun |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One early pre-sync contract failure exceeded the cap and was truncated; all later reads/tests were capped and final green output was concise |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-durable-architecture-repair.md` | checker reports complete after final closeout update |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | install/sync, resource check, and four explicit mirror comparisons passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Benchmark core flow and `Durable Fix Decision` expose cause -> target -> implementation -> exact rerun -> resume |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS capability map below; no findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | prompt contract and source owner recorded | target selection |
| Target selection | complete | existing checkpoint extension chosen; Best API/layer-plan ownership retained | patch |
| Patch | complete | source rule, validator, template, tests, routing, Vision, and doctrine v104 repaired | verification |
| Verification | complete | 40 tests, template, mirrors, resources, version, and source audits pass | closeout |
| Closeout | complete | agent-native PASS; lint and Autoreview explicitly stopped by user | final response |

Findings:
- Benchmark's source rule still says `Apply the smallest durable fix`, so a
  compatible local patch can satisfy the written workflow even when the proven
  cause exposes a better long-term API or runtime architecture.
- The validated cause checkpoint records only `fix-owner`; it cannot prove
  that an architectural cause received a long-term target, Best API verdict,
  layer adoption plan, or explicit hard-cut-versus-hard-law decision.
- `docs/vision/common.md` repeats the stale `smallest durable architecture`
  preference. Root `VISION.md` already prefers the best long-term architecture
  and permits breaking changes for better performance/API shape.
- Best API already keeps the ideal target independent of compatibility and
  implementation difficulty. Plate Plan and Plite Plan already consume that
  target, treat breaking scope as adoption cost, and hard-cut rejected
  surfaces. They need no doctrine repair.

Decisions and tradeoffs:
- Extend the existing cause checkpoint and Cause History instead of adding a
  second architecture ledger. The checkpoint will require `fix-class`,
  `long-term-target`, `decision-owner`, `layer-plan`, and
  `compatibility-verdict`; existing `fix-owner` remains the concrete
  implementation owner.
- Classify fixes as `internal-implementation`, `correctness`, `public-api`, or
  `runtime-architecture`. Public API and runtime architecture require
  `best-api` plus `plite-plan`, `plate-plan`, or both.
- For architectural causes, accept `hard-cut: <lasting value>` by default.
  Accept preservation only as `preserve: <hard law> - <reason>` for
  correctness, security, serialized data, runtime, or native behavior. Mere
  compatibility, migration convenience, compiler difficulty, and current
  machinery are invalid preservation reasons.
- Auto may implement a broad accepted target, but it does not choose the
  benchmark cause, API target, or layer adoption plan.

Autoreview scope baseline:
- original request: Improve Benchmark so performance causes lead to the best
  long-term durable architecture, including private-beta API breaks.
- violated invariant: A compatible local patch must not outrank a materially
  better lasting API or runtime target after causal proof.
- target branch: `next`; review mode: dirty local checkout.
- intended behavior: fail closed until fix class, long-term target, decision
  owner, layer plan, compatibility verdict, implementation owner, exact reruns,
  and breadth resume are recorded.
- owner boundary: Benchmark owns cause/fix/rerun state; Best API owns public
  target shape; Plite/Plate Plan owns adoption; Auto may supervise broad
  accepted implementation.
- relevant siblings: root/common Vision, `.agents/AGENTS.md`, Auto, Major Task,
  Best API, Plite Plan, Plate Plan, Benchmark template, validator/tests, and
  generated mirrors.
- contracts not widened: no product/runtime/API implementation, GitHub
  mutation, release, persisted-data change, or security-boundary change.
- scoped source measurement before review: 12 authoritative files, 449 added
  lines and 56 deleted lines; generated mirrors and the active plan are
  derivative/state artifacts, not separate architecture scope.

Repair patch notes:
- Benchmark now pauses on a causal owner and records one of four fix classes,
  the best long-term target, decision owner, layer plan, compatibility verdict,
  and implementation owner before implementation.
- `public-api` and `runtime-architecture` require `best-api` plus
  `plite-plan`, `plate-plan`, or both. Auto can supervise broad accepted
  implementation but cannot choose the target.
- Pre-stability architectural fixes default to `hard-cut: <lasting value>`.
  Preservation is accepted only as a named correctness, security,
  serialized-data, native-behavior, or runtime law.
- Cause History preserves the decision through green, invalidated, and complete
  plans; exact benchmark/correctness reruns and first-pending-lane resume remain
  mandatory.
- Root/common Vision, `.agents/AGENTS.md`, Auto, and Major Task now reject the
  nearest compatible repair as an architecture-selection rule.
- Plate Next doctrine v104 fingerprints this durable correction.

Deliberate non-repairs:
- Best API was not changed: it already keeps the ideal target independent of
  compatibility and implementation difficulty and prefers hard cuts over
  permanent hybrids.
- Plite Plan and Plate Plan were not changed: both already consume Best API,
  treat breaking scope as adoption cost, and hard-cut rejected surfaces.
- Performance was not changed because it remains a review lens, not the
  execution or architecture-decision owner.
- No package/runtime/API, benchmark target, app, or public GitHub state changed.
- No Browser proof or changeset applies to a workflow-contract repair.
- Lint and Autoreview were stopped by explicit user instruction.

Agent-Native Review:

Verdict: PASS

| User action | Agent route | Source owner | Mirror / context | Proof | Status |
|---|---|---|---|---|---|
| Benchmark all applicable performance lanes | `$benchmark <scope>` | `.agents/rules/benchmark.mdc` and methodology | `.agents` / `.claude` Benchmark skills plus plan template | source/generated contract suites and template validator | pass |
| Stop at a proven architectural cause | Benchmark cause checkpoint | Benchmark validator and methodology | Current Cause Checkpoint and Cause History | architecture rejection/acceptance tests | pass |
| Choose the best breaking target | `best-api` -> `plite-plan` / `plate-plan`; optional Auto execution | Best API and layer-plan sources; Benchmark owns handoff | root/common Vision and `.agents/AGENTS.md` | source audit plus fail-closed validator tests | pass |
| Implement, rerun, and resume | bounded package owner or Auto -> Benchmark | Benchmark methodology and validator | terminal Cause History | green, invalidated, exact-command, and full-completion tests | pass |

Agent-native findings:
- None. Routes, source ownership, generated mirrors, proof commands, and
  authority boundaries are explicit.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Repo-wide `pnpm lint:fix` ran before the user prohibited lint; it failed on thousands of unrelated migration diagnostics after formatting files in the shared dirty checkout | 1 | Do not run or undo linter-owned work from this session; rely on focused Benchmark tests and source sync | Superseded by explicit user instruction; no further lint commands |
| P1 autoreview bundle became stale because the shared checkout changed during its two-pass review | 1 | Do not rerun after the user's explicit stop | Invocation 1 produced no review verdict; gate waived by user |
| Initial contract run before generated sync emitted a large expected mirror diff and exceeded the output cap | 1 | Sync first, then rerun capped source/generated tests | Final 40-test run is green and concise |
| Initial read used stale guessed validator/template filenames | 1 | Discover exact Benchmark files with `rg --files` | Switched to `validate-benchmark-plan.mjs`, `benchmark-contract.test.mjs`, and `docs/plans/templates/benchmark.md` |

Verification evidence:
- `node --test .agents/rules/benchmark/scripts/benchmark-contract.test.mjs .agents/skills/benchmark/scripts/benchmark-contract.test.mjs` -> 40/40 pass.
- `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/templates/benchmark.md` -> structurally valid.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate Next
  v104 valid, 44 active and 2 retired packages.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- Four `.agents/skills/benchmark/**` versus `.claude/skills/benchmark/**`
  comparisons -> exact.
- Stale exact phrases `Apply the smallest durable fix` and
  `Prefer the smallest durable architecture` -> zero hits in live workflow and
  Vision sources.
- Unfinished Benchmark template checker -> expected rejection with unresolved
  objective, gates, checklist, phases, and evidence.
- Agent-native direct review -> PASS, no findings.
- Lint -> N/A by user instruction after one pre-correction failed attempt.
- Autoreview -> N/A by user instruction after one stale-bundle attempt.

Final repair handoff:
- Expectation: proven performance causes choose the best lasting architecture,
  even when that means a private-beta API/runtime break.
- Repaired owner: Benchmark cause/fix/rerun contract, with Best API and layer
  plans retained as decision/adoption owners.
- Files changed: Benchmark source/methodology/template/validator/tests;
  `.agents/AGENTS.md`, Auto, Major Task, root/common Vision, Plate Next v104,
  generated `.agents`/`.claude` mirrors, and this plan.
- Verification: 40 tests plus template, mirror, resource, version, stale-text,
  and agent-native checks pass.
- Caveat: no product benchmark ran because this task changes methodology only;
  lint and Autoreview were explicitly stopped by the user. No commit or push.

Timeline:
- 2026-08-19T09:27:39.841Z Goal repair plan created.
- 2026-08-19 User prohibited lint because another session owns the linter
  migration; lint removed from this task's completion gates.
- 2026-08-19 User stopped Autoreview; the stale first invocation will not be
  rerun and the gate is explicitly N/A.
- 2026-08-19 Durable fix schema, routing, Vision, template, validator, tests,
  generated mirrors, and doctrine v104 completed deterministic verification.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal plan complete; final handoff remains |
| Where am I going? | Mark the active goal complete, then handoff |
| What is the goal? | Make Benchmark select and prove the best long-term durable fix after a conclusive performance cause |
| What have I learned? | Best API and layer plans were already correct; Benchmark lacked a validated decision handoff |
| What have I done? | Repaired source doctrine, schema, tests, mirrors, routing, Vision, and Plate Next v104 |

Open risks:
- The first P1 Autoreview produced no verdict because concurrent checkout
  changes made its bundle stale; the user explicitly stopped reruns.
- Lint is not a claim of this task because the user explicitly assigned the
  linter migration to another session.

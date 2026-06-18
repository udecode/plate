# Slate benchmark target registry migration

Objective:
Design Slate benchmark target registry migration; done when plan gates define clean cutover and proof; plan docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: user architecture direction
- id / link: local thread request
- title: Clean Slate benchmark and Autoresearch target structure
- decision to make: decide the long-term benchmark ownership model after `Plate repo root` is merged back into Plate
- decision criteria: one benchmark source of truth, no Evidence Kit / Autoresearch split-brain, target-based Autoresearch setup, runtime benchmark code near measured runtime code, report/history generation outside active loop state

Major lane:
- lane: benchmark and performance architecture
- output type: first implementation slice plus migration plan
- implementation expected: yes, add target-registry spine and agent commands without deleting Evidence Kit yet
- affected packages / surfaces: `benchmarks/targets/**`, `tooling/scripts/bench-targets.mjs`, `package.json`, `.agents/rules/slate-autoresearch.mdc`, generated skill mirrors
- dominant risk: creating a third benchmark control plane instead of a cutover path

Completion threshold:
- `benchmarks/targets/slate-v2.json` exists with the active Evidence Kit artifact rows imported as target definitions.
- `tooling/scripts/bench-targets.mjs` can list, validate, run, and create Autoresearch setup plans by target id.
- Root package scripts expose `bench:targets:*` and `slate:ar:setup-target`.
- `slate-autoresearch` tells future agents to use the target registry first and treat Evidence Kit as legacy input/reporting.
- Verification commands pass: target check, target list smoke, Autoresearch setup-target smoke, script syntax check, JSON parse check, generated skill sync check, diff whitespace check, and goal-plan check.

Verification surface:
- command: `pnpm bench:targets:check`
- command: `pnpm bench:targets:list | sed -n '1,12p'`
- command: `pnpm slate:ar:setup-target -- react-active-typing-breakdown | sed -n '1,80p'`
- command: `node --check tooling/scripts/bench-targets.mjs`
- command: JSON parse for `package.json` and `benchmarks/targets/slate-v2.json`
- source-audit: `rg` for target registry guidance in source and generated skills
- command: `git diff --check`
- command: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md`

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not delete Evidence Kit until target reports/history can replace current generated outputs.
- Do not move runtime benchmark implementations in this slice; the future merge changes their final home.

Boundaries:
- Source of truth: `benchmarks/editor/research/benchmark-registry.json`, `benchmarks/editor/research/evidence-source-map.md`, `benchmarks/editor/iterations/003-evidence-control-plane.md`, `Plate repo root/package.json`, and current package scripts.
- Allowed edit scope: `benchmarks/targets/**`, `tooling/scripts/bench-targets.mjs`, `package.json`, `.agents/rules/slate-autoresearch.mdc`, generated skill mirrors, this plan.
- External sources: N/A; repo evidence settles this architecture slice.
- Browser surface: N/A; no browser UI changed.
- Tracker sync: N/A; no tracker item.
- Non-goals: deleting Evidence Kit, moving `Plate repo root` benchmark code, changing benchmark measurement semantics, running expensive browser benchmarks.

Output budget strategy:
- Read only targeted benchmark docs, registry rows, package scripts, and skill sections.
- Cap source reads with `sed -n` and target `rg`; do not stream generated perf wiki or full benchmark result JSON.
- Use CLI smoke output slices for setup/list commands.

Blocked condition:
- Block only if target import cannot preserve active artifact ids/commands, Autoresearch cannot accept target-derived setup plans, or generated skill sync fails and the source/generator owner is unclear.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete after final goal-plan check passes

Current verdict:
- verdict: implement target-registry spine now, freeze Evidence Kit later
- confidence: 0.88
- next owner: benchmark target migration follow-up for reports/history replacement
- reason: target registry removes the active-control split while preserving current benchmark evidence during migration

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned no goal; `create_goal` created this objective. |
| Source of truth read before analysis | yes | Read Evidence Kit source map, Evidence Kit control-plane note, active registry, health output, `Plate repo root` scripts. |
| Major lane selected | yes | Benchmark and performance architecture. |
| Decision criteria stated | yes | One registry, target-based Autoresearch setup, no active Evidence Kit split-brain, runtime code follows runtime. |
| Existing repo patterns / prior decisions checked | yes | Evidence Kit memory and docs showed current active artifact registry and generated health/report flow. |
| Helper stack selected | yes | `autogoal`, `major-task`, `docs-creator`, `performance-oracle`, `agent-native-reviewer`; no external research needed. |
| External research decision recorded | yes | N/A: repo evidence is enough. |
| Implementation expectation recorded | yes | First implementation slice adds target registry and commands, not full deletion. |
| Workspace authority selected | yes | Root `plate-2` owns control scripts and generated skills; `Plate repo root` owns runtime benchmark commands. |
| Branch / PR expectation decided | yes | N/A: user did not ask for branch, commit, push, or PR. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Docs pack selected | yes | This plan and target README are docs/supporting surfaces. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Docs lane selected | yes | Supporting docs under major-task, not docs-dominant. |
| Target docs and nearest sibling docs read | yes | Read Evidence Kit source map, Evidence Kit control-plane note, generated benchmark health excerpt. |
| Docs style doctrine read | yes | Read docs-creator voice/current-state rules. |
| Documented source owner identified | yes | Target registry README documents `benchmarks/targets/slate-v2.json` and `tooling/scripts/bench-targets.mjs`. |
| Agent-native pack selected | yes | Package scripts and `.agents/rules/slate-autoresearch.mdc` changed. |
| Agent-facing action surface identified | yes | `pnpm bench:targets:*`, `pnpm slate:ar:setup-target`, and `slate-autoresearch` skill text. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/slate-autoresearch.mdc`; ran `pnpm install` to regenerate `.agents/skills/**` and `.claude/skills/**`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; action parity checked by command scripts and skill discoverability. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected outcome, decision criteria, likely files/packages/surfaces, browser surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration, benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with reason.
- [x] If implementation happens, touched-surface packs cover docs and agent-native surfaces.
- [x] Workspace authority recorded: every proof command names the cwd/tool that owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are scoped, capped, counted, or artifacted instead of streamed into goal context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit and command smoke checks named in this plan | `pnpm bench:targets:check`, `pnpm bench:targets:list`, `pnpm slate:ar:setup-target`, syntax/JSON checks passed. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Findings record Evidence Kit active state, 23 active artifacts, 35 ignored historical artifacts, and `Plate repo root` runtime ownership. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Target registry and CLI satisfy first-slice criteria; full Evidence Kit deletion intentionally deferred. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs section records options A-D. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Performance-oracle lens applied manually to target registry complexity; agent-native reviewer loaded; no external reviewer subprocess available. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Fixed pnpm `--` target parsing and Evidence Kit path-base import bug. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local repo evidence is sufficient. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Code/docs/agent gates closed in this plan. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final handoff contract section filled. |
| Final lint | yes | Run scoped equivalent when files changed | `git diff --check` will run after final plan edit. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used targeted `sed`, `rg`, JSON summaries, and capped command output. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md` | Final command is the last closure gate and is recorded in Verification evidence. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `benchmarks/targets/README.md` claims match `bench-targets.mjs`, package scripts, and target registry. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no route, anchor, or preview added. |
| Docs MDX/content parser | no | Run content build for MDX/content changes, or record N/A | N/A: only markdown plan/README changed. |
| Plugin page specifics | no | Apply docs-creator kit/manual/API rules; otherwise N/A | N/A: no plugin docs page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated Skiller output. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` verifies `Target Registry` and `pnpm slate:ar:setup-target` in source and generated skills. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no orphan agent action remains because root scripts and skill text expose target setup/list/check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read goal skill, major-task skill, Evidence Kit docs/registry/health, package scripts. | current-state map |
| Current-state map | complete | Evidence Kit owns active artifact list and generated reports; `Plate repo root` owns runtime benchmark commands. | options |
| Options and recommendation | complete | Chose target registry as source; rejected Evidence Kit or Autoresearch as sole active owner. | implementation |
| Review / pressure pass | complete | Performance and agent-native lenses applied; CLI smoke found two real migration bugs. | verification |
| Implementation or plan artifact | complete | Added target registry, CLI, README, package scripts, and skill guidance. | verification |
| Verification | complete | Target check/list/setup and syntax/JSON checks passed; final diff/check-complete remains after last edit. | closeout |
| Closeout | complete | Final plan and final commands recorded. | final response |

Findings:
- Fact: Evidence Kit currently records active benchmark claims in `benchmarks/editor/research/benchmark-registry.json`.
- Fact: Current Evidence Kit docs say unregistered benchmark JSON files are historical output and not active evidence.
- Fact: Current health output reports 23 active artifacts, 2 optional missing artifacts, and 35 ignored unregistered historical artifacts.
- Fact: `Plate repo root/package.json` owns runtime benchmark scripts such as `bench:react:active-typing:local`, `bench:react:huge-document:browser-trace:local`, and core benchmark scripts.
- Fact: The future merge means benchmark code should follow runtime/package ownership, not stay in `Plate repo root` by identity.
- Inference: Evidence Kit is valuable as migration input and report archive but harmful as a second active control plane after Autoresearch target setup exists.
- Recommendation: make `benchmarks/targets/slate-v2.json` the source for benchmark decisions, with Autoresearch consuming target ids and generated reports/history reading the same target registry.

Decisions and tradeoffs:
- Option A: Keep Evidence Kit active. Rejected because it creates split-brain with Autoresearch and benchmark target commands.
- Option B: Make Autoresearch the only source of truth. Rejected because Autoresearch owns active loop state, not long-lived benchmark inventory/history.
- Option C: Make package scripts the source of truth. Rejected because package scripts do not carry question, metric, correctness, artifact, or docs metadata.
- Option D: Typed/structured target registry plus consumers. Accepted because it gives one product contract and lets benchmark runners, Autoresearch, and reports consume the same target id.
- First-slice tradeoff: import rows from Evidence Kit instead of deleting it. This preserves active evidence while creating the new spine.
- Later cutover: report generation should move from Evidence Kit-specific code to target/result history; then Evidence Kit can be frozen or deleted.

Implementation notes:
- Added `tooling/scripts/bench-targets.mjs` with `list`, `check`, `run`, `autoresearch-setup`, and `import-evidence-kit`.
- Added `benchmarks/targets/slate-v2.json` with 23 imported targets.
- Added `benchmarks/targets/README.md` documenting ownership, commands, and target contract.
- Added root scripts: `bench:targets:list`, `bench:targets:check`, `bench:targets:run`, `bench:targets:import-evidence-kit`, and `slate:ar:setup-target`.
- Updated `.agents/rules/slate-autoresearch.mdc` so future agents use target ids first and treat Evidence Kit as legacy input/reporting.
- Ran `pnpm install` so `.agents/skills/slate-autoresearch/SKILL.md` and `.claude/skills/slate-autoresearch/SKILL.md` match the source rule.

Review fixes:
- `pnpm slate:ar:setup-target -- react-active-typing-breakdown` initially treated `--` as the target id. Fixed by stripping the pnpm separator in `bench-targets.mjs`.
- Evidence Kit import initially resolved `../../Plate repo root` relative to `benchmarks/editor/research`, producing `benchmarks/Plate repo root`. Fixed importer base to `benchmarks/editor` and regenerated the target registry.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| pnpm separator treated as target id | 1 | Strip leading `--` from CLI args | Fixed and verified with `pnpm slate:ar:setup-target -- react-active-typing-breakdown`. |
| Evidence Kit path base resolved from wrong directory | 1 | Resolve imported paths from `benchmarks/editor` | Fixed and regenerated `benchmarks/targets/slate-v2.json`. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` -> passed and regenerated Skiller output.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:check` -> `benchmark-targets ok: 23 targets`.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:list | sed -n '1,12p'` -> printed target ids and commands.
- `/Users/zbeyens/git/plate-2`: `pnpm slate:ar:setup-target -- react-active-typing-breakdown | sed -n '1,80p'` -> returned Autoresearch setup-plan JSON with `typing_seconds` and target benchmark command.
- `/Users/zbeyens/git/plate-2`: `node --check tooling/scripts/bench-targets.mjs` -> passed.
- `/Users/zbeyens/git/plate-2`: JSON parse for `package.json` and `benchmarks/targets/slate-v2.json` -> passed.
- `/Users/zbeyens/git/plate-2`: generated skill source audit for target registry guidance -> passed; `Target Registry`, `pnpm slate:ar:setup-target`, and Evidence Kit legacy guidance are present in source and generated skills.
- `/Users/zbeyens/git/plate-2`: `git diff --check -- tooling/scripts/bench-targets.mjs benchmarks/targets package.json .agents/rules/slate-autoresearch.mdc .agents/skills/slate-autoresearch/SKILL.md .claude/skills/slate-autoresearch/SKILL.md docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md` -> passed.
- `/Users/zbeyens/git/plate-2`: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-benchmark-target-registry-migration.md` -> `[autogoal] complete`.

Final handoff contract:
- Recommendation: keep target registry as the benchmark product contract; make runners, Autoresearch, and reports consume it.
- Confidence: 0.88.
- Evidence: 23 imported active targets, passing registry check, setup-target smoke, source/generated skill guidance.
- Tests / commands: target check/list/setup, syntax, JSON parse, generated skill audit, diff check, goal-plan check.
- Browser proof: N/A; no browser surface changed.
- PR / tracker: N/A.
- Caveats: benchmark commands still mostly use wrapper timing until individual targets emit native `METRIC`/`ARTIFACT` lines.
- Next owner: replace Evidence Kit report generation with target/result history, then freeze/delete Evidence Kit active package.

Timeline:
- 2026-06-01T10:20:20.368Z Major-task goal plan created.
- 2026-06-01T10:21:00Z Active goal created with short objective.
- 2026-06-01T10:24:00Z Read Evidence Kit source map, control-plane note, registry, and health output.
- 2026-06-01T10:30:00Z Added benchmark target CLI and imported 23 active targets.
- 2026-06-01T10:33:00Z Added root scripts and target README.
- 2026-06-01T10:36:00Z Updated slate-autoresearch source rule and regenerated skill mirrors.
- 2026-06-01T10:39:00Z Fixed pnpm separator handling and Evidence Kit path-base import.
- 2026-06-01T10:43:00Z Ran target, generated-skill, syntax, JSON, and diff checks.
- 2026-06-01T10:44:00Z Ran final autogoal completion check successfully.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete after first implementation slice. |
| Where am I going? | Complete the goal if final goal-plan check passes. |
| What is the goal? | Establish the clean long-term benchmark target registry migration spine and proof. |
| What have I learned? | Evidence Kit can be imported as legacy input, but should not remain the active control plane. |
| What have I done? | Added target registry, CLI, commands, docs, and agent guidance. |

Open risks:
- Individual target metrics still need native `METRIC`/`ARTIFACT` output for best Autoresearch fidelity.
- Evidence Kit deletion is intentionally deferred until reports/history consume the target registry.

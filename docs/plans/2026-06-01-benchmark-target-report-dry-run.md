# Benchmark target report dry run

Objective:
Add benchmark target reports dry run; done when target report/history flow passes; plan docs/plans/2026-06-01-benchmark-target-report-dry-run.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-01-benchmark-target-report-dry-run.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user continuation
- id / link: local thread
- title: Generate target-owned benchmark reports/history and dry-run the E2E flow
- acceptance criteria: target registry generates report/history without Evidence Kit, command checks pass, and a target id can dry-run through Autoresearch setup-plan

Completion threshold:
- `pnpm bench:targets:report` writes target-owned report/history files.
- `pnpm bench:targets:report:check` verifies those generated files are current.
- `pnpm bench:targets:dry-run -- react-active-typing-breakdown` validates registry -> report model -> Autoresearch setup-plan without running expensive benchmarks.
- `slate-autoresearch` generated skill text advertises report/dry-run flow.
- Syntax, JSON, generated-skill, diff, and goal-plan checks pass.

Verification surface:
- command: `pnpm bench:targets:check`
- command: `pnpm bench:targets:report`
- command: `pnpm bench:targets:report:check`
- command: `pnpm bench:targets:report:dry-run`
- command: `pnpm bench:targets:dry-run -- react-active-typing-breakdown`
- command: `node --check tooling/scripts/bench-targets.mjs`
- command: JSON parse for `package.json`, `benchmarks/targets/slate-v2.json`, and `benchmarks/targets/history/slate-v2-latest.json`
- source-audit: generated skill and README mention report/dry-run commands
- command: `git diff --check`
- command: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-benchmark-target-report-dry-run.md`

Constraints:
- Preserve existing benchmark runners.
- Do not run expensive benchmark workloads for this dry-run slice.
- Do not delete Evidence Kit yet; only replace active report/history path for target registry.
- Do not commit, push, or PR.

Boundaries:
- Source of truth: target registry from `benchmarks/targets/slate-v2.json` and the prior migration plan.
- Allowed edit scope: `tooling/scripts/bench-targets.mjs`, `package.json`, `benchmarks/targets/**`, `.agents/rules/slate-autoresearch.mdc`, generated skill mirrors, this plan.
- Browser surface: N/A, no UI changed.
- Tracker sync: N/A.
- Non-goals: benchmark execution, Evidence Kit deletion, moving runtime benchmark implementations.

Output budget strategy:
- Use targeted `sed`, `rg`, command slices, and JSON summaries.
- Do not stream full generated histories or benchmark artifacts.

Blocked condition:
- Block only if generated report/history cannot be checked deterministically, or Autoresearch setup-plan cannot be invoked from a target id.

Task state:
- task_type: tooling/report generation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete after final goal-plan check passes

Current verdict:
- verdict: target-owned report/history and dry-run flow are implemented
- confidence: 0.9
- next owner: later Evidence Kit freeze/delete once target report parity is accepted
- reason: target registry now owns status history and Autoresearch setup can start from a target id

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-benchmark-target-report-dry-run.md` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal`; task template selected with docs and agent-native packs. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this objective. |
| Source of truth read before edits | yes | Read target CLI, Evidence Kit report/health generation, target files, and current plan context. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: task continues local benchmark architecture plan; source files were enough. |
| TDD decision before behavior change or bug fix | yes | N/A: deterministic CLI/report generation, verified by command checks rather than a new test suite. |
| Branch decision for code-changing task | yes | N/A: user did not ask for branch or PR. |
| Release artifact decision | yes | N/A: private tooling/docs change, no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Docs pack selected | yes | README, report markdown, and plan changed. |
| `docs-creator` loaded | yes | Loaded in prior slice; current docs follow source-backed reference style. |
| Docs lane selected | yes | Supporting docs under tooling task. |
| Target docs and nearest sibling docs read | yes | Read target README and Evidence Kit report/health generation. |
| Docs style doctrine read | yes | Current-state docs style applied; no changelog voice. |
| Documented source owner identified | yes | `benchmarks/targets/README.md` documents target report/history ownership. |
| Agent-native pack selected | yes | Package scripts and skill rule changed. |
| Agent-facing action surface identified | yes | `bench:targets:report`, `bench:targets:dry-run`, and `slate-autoresearch`. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/slate-autoresearch.mdc`; ran `pnpm install` for generated mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded in prior slice; command discoverability and generated mirrors audited here. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, title, task type, acceptance criteria, caveats, likely files, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: target registry report/history, not Evidence Kit.
- [x] Release artifact requirement recorded as N/A.
- [x] Final handoff shape decided.
- [x] Branch handling recorded as N/A.
- [x] Local-env-rot retry policy recorded as N/A: no install-corruption failure.
- [x] Workspace authority recorded: all proof commands run from `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: command-contract changes are proven by CLI smoke and generated skill audit.
- [x] Review/autoreview target selected or marked N/A: scoped command proof is used for tooling-only slice; no app/runtime product behavior changed.
- [x] Agent-native review decision recorded.
- [x] Output budget discipline recorded and followed.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: named commands and files are source-backed.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: links, anchors, and previews are N/A.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: changed agent actions are discoverable from skill/rule text.
- [x] Agent-native pack: generated mirrors are synced.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run target report/check/dry-run commands | Passed; see Verification evidence. |
| Bug reproduced before fix | no | Record N/A | N/A: feature/tooling slice. |
| Targeted behavior verification | yes | Run focused CLI proof | `bench:targets:report:check` and `bench:targets:dry-run` passed. |
| TypeScript or typed config changed | no | Record N/A | N/A: JS/JSON/Markdown only. |
| Package exports or file layout changed | no | Record N/A | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | yes | Run install/sync when needed | `pnpm install` passed and regenerated skills; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` found report/dry-run guidance in source and generated skills. |
| Workspace authority proof | yes | Run verification in owning workspace | All commands run in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A | N/A: no browser UI. |
| Browser final proof | no | Record N/A | N/A: no browser UI. |
| CI-controlled template output changed | no | Record N/A | N/A. |
| Package behavior or public API changed | no | Record N/A | N/A: private tooling. |
| Registry-only component work changed | no | Record N/A | N/A. |
| Docs or content changed | yes | Verify source-backed claims | README/report commands match package scripts and CLI. |
| High-risk mini gate | yes | Record failure mode/proof plan | Failure mode: agent runs stale/hidden Evidence Kit flow; proof: skill text points to target reports and dry-run commands. |
| Agent-native review for agent/tooling changes | yes | Verify command discoverability | `rg` audit passed for source/generated skills and README. |
| Local install corruption suspected | no | Record N/A | N/A: no corruption-shaped failure. |
| Autoreview for non-trivial implementation changes | no | Record N/A | N/A: scoped tooling/report slice verified by direct CLI, syntax, JSON, and generated-skill audit; no app/runtime behavior. |
| PR create or update | no | Record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Record N/A | N/A: no PR. |
| PR proof image hosting | no | Record N/A | N/A. |
| Tracker sync-back | no | Record N/A | N/A. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run scoped equivalent | `node --check`, JSON parse, and `git diff --check` are the scoped lint equivalents. |
| Output budget discipline | yes | Verify no unbounded output | Used capped command output and summaries; one shell quoting mistake corrected. |
| Goal plan complete | yes | Run goal checker | Final command runs after this edit. |
| Docs source-backed claim audit | yes | Verify docs claims against source | Report/README claims match CLI and scripts. |
| Docs links / routes / previews | no | Record N/A | N/A. |
| Docs MDX/content parser | no | Record N/A | N/A: Markdown only, not site content. |
| Plugin page specifics | no | Record N/A | N/A. |
| Agent source / generated sync | yes | Run `pnpm install` | Passed. |
| Agent action discoverability | yes | Source-audit skill/rule path | Passed. |
| Agent-native review | yes | Close accepted findings or N/A | No accepted findings after source/generated command audit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read target CLI and Evidence Kit report/health shape. | implementation |
| Implementation | complete | Added report/history/dry-run commands and generated outputs. | verification |
| Verification | complete | Target report/check/dry-run, syntax, JSON, generated-skill audits passed. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Final plan filled and final checks running. | final response |

Findings:
- Existing Evidence Kit report generation is tied to `benchmarks/editor/docs/perf/**`.
- Target registry can now generate `benchmarks/targets/history/slate-v2-latest.json` and `benchmarks/targets/reports/slate-v2.md` without running benchmark workloads.
- Target report status correctly separates required-missing from optional-missing artifacts.
- Dry-run proves `react-active-typing-breakdown` target can create an Autoresearch setup-plan with `typing_seconds`.

Decisions and tradeoffs:
- Added target-native report/history instead of porting Evidence Kit report code. This avoids keeping Evidence Kit as active control plane.
- Report generation is deterministic and checkable; it does not include generated timestamps.
- Dry-run invokes Autoresearch `setup-plan`, not `setup`, so it proves handoff without starting an optimization loop.
- Optional missing artifacts are visible as `missing-optional-artifact`, not hidden as `ok`.

Implementation notes:
- `tooling/scripts/bench-targets.mjs` now supports `report` and `dry-run`.
- `package.json` exposes `bench:targets:report`, `bench:targets:report:check`, `bench:targets:report:dry-run`, and `bench:targets:dry-run`.
- `benchmarks/targets/README.md` documents generated outputs and dry-run flow.
- `.agents/rules/slate-autoresearch.mdc` tells agents to generate/check reports and dry-run before setup-target.
- `pnpm bench:targets:report` generated the history and report files.

Review fixes:
- Fixed report status model so optional missing artifacts are not shown as plain `ok`.
- Fixed markdown table row formatting to use full pipe rows.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell command used an unescaped template literal and zsh expanded `${...}` | 1 | Rerun Node summary with single-quoted command | Rerun passed and showed 2 optional-missing targets. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:report` -> wrote `benchmarks/targets/history/slate-v2-latest.json` and `benchmarks/targets/reports/slate-v2.md`.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:check` -> `benchmark-targets ok: 23 targets`.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:report:check` -> checked generated history/report.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:report:dry-run` -> `targets=23 missingRequired=0`.
- `/Users/zbeyens/git/plate-2`: `pnpm bench:targets:dry-run -- react-active-typing-breakdown` -> dry-run ok, `targets=23`, `missingOptionalArtifacts=2`, `missingRequiredArtifacts=0`, `autoresearchSetupOk=true`.
- `/Users/zbeyens/git/plate-2`: `node --check tooling/scripts/bench-targets.mjs` -> passed.
- `/Users/zbeyens/git/plate-2`: JSON parse for `package.json`, target registry, and generated history -> passed.
- `/Users/zbeyens/git/plate-2`: `rg` audit for report/dry-run commands in source/generated skills, README, and package scripts -> passed.
- `/Users/zbeyens/git/plate-2`: `git diff --check` -> final run after this edit.
- `/Users/zbeyens/git/plate-2`: final goal-plan check -> final run after this edit.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high for target report/dry-run slice; Evidence Kit deletion remains later work.
- Flow table:
  - Reproduced: N/A, feature/tooling slice
  - Verified: target check/report/dry-run/syntax/JSON/generated-skill audit
- Browser check: N/A.
- Outcome: target registry now owns generated report/history and can dry-run an Autoresearch setup by target id.
- Caveat: benchmark workloads still mostly use wrapped timing until targets emit native `METRIC`/`ARTIFACT` lines.
- Design:
  - Chosen boundary: target registry owns report/history; Autoresearch owns active loop state.
  - Why not quick patch: copying Evidence Kit report code would keep split-brain alive.
  - Why not broader change: deleting Evidence Kit waits until report parity is accepted.
- Verified: see Verification evidence.
- PR body verified: N/A.

Task-style PR body contract:
- N/A: no PR requested.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: native benchmark `METRIC`/`ARTIFACT` output still needs per-target work.

Timeline:
- 2026-06-01T10:28:10.054Z Task goal plan created.
- 2026-06-01T10:29:00Z Active goal created.
- 2026-06-01T10:31:00Z Read target CLI and Evidence Kit report/health code.
- 2026-06-01T10:36:00Z Added target report/history and dry-run commands.
- 2026-06-01T10:38:00Z Generated target report/history files.
- 2026-06-01T10:41:00Z Synced generated skill mirrors with `pnpm install`.
- 2026-06-01T10:44:00Z Ran E2E dry-run and corrected optional-artifact status model.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Run final diff and goal checks, then final response. |
| What is the goal? | Add target-owned report/history and prove E2E dry-run works. |
| What have I learned? | Target report/history can replace active Evidence Kit reporting without running benchmarks. |
| What have I done? | Implemented report/history generation, package scripts, docs, agent guidance, generated outputs, and dry-run proof. |

Open risks:
- Native `METRIC`/`ARTIFACT` output remains per-target migration work.
- Evidence Kit deletion remains deferred until the generated target report is accepted as sufficient replacement.

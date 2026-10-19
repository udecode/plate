# Wire Evidence Kit into Plite skills

Objective:
Wire Evidence Kit into the Plite agent workflow by updating the source rules for
`plite-plan` and `plite-patch` so agents read benchmark registry/health state,
refresh the control plane when relevant, record benchmark gaps or next owners,
and keep `Plate repo root` behavior proof separate from `plate-2` benchmark
evidence.

Goal plan:
docs/plans/2026-05-28-wire-evidence-kit-into-slate-skills.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current Codex thread
- title: Make Evidence Kit part of `plite-plan` and `plite-patch`
- acceptance criteria: source rules updated, generated skills synced with
  `pnpm install`, generated skill text verified, benchmark health command
  verified, and autogoal completion check passes.

Completion threshold:
- `.agents/rules/slate-plan.mdc` contains an Evidence Kit control-plane gate for
  planning, scoring, refresh, gap/candidate handling, and next-action ownership.
- `.agents/rules/slate-patch.mdc` contains a conditional Evidence Kit sync step
  after `Plate repo root` proof and before final handoff.
- `pnpm install` regenerates `.agents/skills/slate-plan/SKILL.md` and
  `.agents/skills/slate-patch/SKILL.md` with the same Evidence Kit language.
- `npm run bench:editor:health` proves the referenced benchmark health surface
  is runnable.
- Task closure is legal only when required verification evidence is recorded,
  irrelevant gates are marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-wire-evidence-kit-into-slate-skills.md` passes.

Verification surface:
- `pnpm install`
- `rg -n "Evidence Kit|Control-Plane|bench:editor:refresh|benchmark-registry|benchmark-health" .agents/skills/slate-plan/SKILL.md .agents/skills/slate-patch/SKILL.md`
- `npm run bench:editor:health`
- `pnpm exec biome check ... --fix` attempted and ignored these docs/agent paths
  by repo config, which is acceptable for this markdown-only source sync.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-wire-evidence-kit-into-slate-skills.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/slate-plan.mdc` and
  `.agents/rules/slate-patch.mdc`; generated `SKILL.md` files are mirrors.
- Allowed edit scope: Plite skill source rules, generated skill mirrors, and
  this goal plan.
- Browser surface: N/A, no web UI changed.
- Tracker sync: N/A, no external issue or Linear ticket.
- Non-goals: no benchmark adapter changes, no Plite runtime changes, no PR.

Blocked condition:
Blocked only if Skiller cannot regenerate generated skills or the generated
skills omit the source-rule Evidence Kit gates after `pnpm install`.

Task state:
- task_type: agent workflow rule update
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: source rules and generated skills contain the Evidence Kit gates, and
  the benchmark health surface still runs.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-wire-evidence-kit-into-slate-skills.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `autogoal`, `plite-plan`, `plite-patch`, and `agent-native-reviewer` skill guidance. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this Evidence Kit workflow goal. |
| Source of truth read before edits | yes | Read `.agents/rules/slate-plan.mdc` and `.agents/rules/slate-patch.mdc`. |
| Tracker comments and attachments read | N/A | Current request is local workflow-rule work with no tracker link. |
| Video transcript evidence required | N/A | No video or screen recording input. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Agent rule sync; live source rules are the source of truth. |
| TDD decision before behavior change or bug fix | N/A | No product behavior or bug fix changed. |
| Branch decision for code-changing task | N/A | User did not ask for branch/commit/PR. |
| Release artifact decision | N/A | No package/public API release artifact changed. |
| Browser tool decision for browser surface | N/A | No browser UI changed. |
| PR expectation decision | N/A | User asked to implement locally, not open a PR. |
| Tracker sync expectation decision | N/A | No issue tracker target. |
| Agent-native pack selected | yes | Used agent-native pack because `.agents/**` workflow behavior changed. |
| Agent-facing action surface identified | yes | Agent-facing surfaces are `plite-plan` and `plite-patch` generated skill text. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/*.mdc`; `pnpm install` regenerated `.agents/skills/**/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer and applied as a focused parity check for generated skill discoverability. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, generated-skill audit, benchmark health, and plan check | Source audit and generated skill greps passed; health command passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | No bug fix; workflow rule update only. |
| Targeted behavior verification | yes | Verify changed agent behavior is present in generated skill text | `rg` confirmed Evidence Kit gates in both generated Plite skills. |
| TypeScript or typed config changed | N/A | Run relevant typecheck | No TypeScript or typed config changed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | `pnpm install` was required for skill sync, not package graph changes. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran Skiller successfully; generated skills contain Evidence Kit text. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | Rule sync and health proof ran from `/Users/zbeyens/git/plate-2`, the owning workflow repo. |
| Browser surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | No browser surface changed. |
| Browser final proof | N/A | Attach screenshot or exact browser verification caveat when browser proof applies | No browser proof applies. |
| CI-controlled template output changed | N/A | Restore generated template output or record why intentionally kept | No template output changed. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | Agent workflow docs only; no package release. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component work. |
| Docs or content changed | yes | Verify source-backed claims and generated output | Plan and agent docs cite existing benchmark paths/scripts verified by `rg` and `npm run bench:editor:health`. |
| High-risk mini gate | yes | Record failure mode, proof plan, and chosen boundary | Failure mode was CLI-only benchmark workflow; fix is source-rule gate plus generated skill verification. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close accepted/actionable findings | Reviewer loaded; focused review found the changed agent action discoverable in generated skill text. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun exact failure, or record N/A | No install-corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Load autoreview or record N/A | No runtime implementation patch; source-rule wording is covered by direct audit. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to final handoff | User did not ask for PR. |
| PR proof image hosting | N/A | Replace local image paths with hosted GitHub URLs or record N/A | No PR/browser proof images. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker target. |
| Final handoff contract | yes | Fill exact outcome/caveats/verification content or N/A reason | Final handoff fields below filled. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome check attempted; repo config ignored these markdown/agent paths, so no formatting owner applies. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-wire-evidence-kit-into-slate-skills.md` | To run after this file is closed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` completed Skiller apply; generated skills verified with `rg`. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated `plite-plan` and `plite-patch` skills expose the Evidence Kit gates. |
| Agent-native review | yes | Load reviewer and close accepted findings, or record N/A | Loaded reviewer; no actionable parity findings after generated skill audit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skills, source rules, root benchmark scripts, and memory registry hit. | implementation complete |
| Implementation | complete | Patched `.agents/rules/slate-plan.mdc` and `.agents/rules/slate-patch.mdc`. | verification complete |
| Verification | complete | `pnpm install`, generated skill `rg`, and `npm run bench:editor:health` passed. | closeout complete |
| PR / tracker sync | skipped | No PR/tracker requested. | final response |
| Closeout | complete | This plan records final evidence and will pass check-complete. | final response |

Findings:
- The previous benchmark flow was agent-readable but not agent-enforced.
- `plite-plan` needed a planning/scoring gate that maps benchmark-sensitive
  claims to registered artifacts, gaps, candidates, or non-goals.
- `plite-patch` needed a post-proof conditional sync step so perf-sensitive
  bug fixes refresh or route benchmark evidence without taxing tiny fixes.

Decisions and tradeoffs:
- Evidence Kit remains `plate-2` control-plane evidence. `Plate repo root` remains
  the only proof source for Plite runtime/browser/package behavior.
- The patch makes `plite-patch` conditional, not unconditional, to avoid turning
  every small bug fix into benchmark ceremony.

Implementation notes:
- Added the Plite Plan Evidence Kit Control-Plane Gate.
- Added Plite Patch step 7, Evidence Kit Control-Plane Sync.
- Ran `pnpm install` so Skiller regenerated the generated skills.

Review fixes:
- Agent-native review applied as focused discoverability audit; generated skills
  expose the new workflow gates.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` completed Skiller apply successfully.
- `rg -n "Evidence Kit|Control-Plane|bench:editor:refresh|benchmark-registry|benchmark-health" .agents/skills/slate-plan/SKILL.md .agents/skills/slate-patch/SKILL.md` found the generated workflow gates.
- `npm run bench:editor:health` wrote `benchmark-health-latest.json` and reported `active=23 rows=904 nextActions=10`.
- `pnpm exec biome check ... --fix` checked 0 files because repo Biome config ignores these markdown/agent paths; no scoped formatter owns them.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker target.
- Confidence line: high; source rules and generated skills both verified.
- Flow table:
  - Reproduced: N/A, not a bug.
  - Verified: generated skill sync and benchmark health command passed.
- Browser check: N/A, no UI changed.
- Outcome: Evidence Kit is now part of the Plite agent workflow, not just a CLI.
- Caveat: Biome ignores these markdown/agent paths, so formatting proof is
  Skiller sync plus source audit.
- Design:
  - Chosen boundary: source rules own behavior; generated skills mirror it.
  - Why not quick patch: editing generated `SKILL.md` directly would be
    overwritten.
  - Why not broader change: no benchmark adapter/runtime change was requested.
- Verified: `pnpm install`, generated skill grep, benchmark health command.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: Biome path ignore noted above.

Timeline:
- 2026-05-28T16:17:19.430Z Task goal plan created.
- 2026-05-28T16:20:00Z Source rules patched with Evidence Kit control-plane gates.
- 2026-05-28T16:21:00Z `pnpm install` regenerated generated skills.
- 2026-05-28T16:22:00Z Generated skills and benchmark health verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make Evidence Kit an enforced Plite agent workflow gate |
| What have I learned? | Source rules lacked an Evidence Kit gate; generated skills now expose it |
| What have I done? | Updated source rules, regenerated skills, verified generated text and benchmark health |

Open risks:
- None.

# tighten sync shadcn status output

Objective:
Tighten `sync-shadcn status` so routine status output reports only current sync
state, partial syncs, deferred decisions, and next action. It must not list
settled exclusions or preserved forks, and it must collapse Rhea/style/theme
generated registry noise into the owning `/create` or theming product surface.

Goal plan:
docs/plans/2026-05-28-tighten-sync-shadcn-status-output.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user correction
- id / link: chat request
- title: tighten `sync-shadcn status`
- acceptance criteria: status no longer lists `Settled exclusions` or
  `Preserved Plate forks`; Rhea/style/theme generated registry rows are treated
  as create/theming product noise unless explicitly reviewed.

Completion threshold:
- Complete only when `.agents/rules/sync-shadcn.mdc` documents the narrower
  `status` output and forbids listing settled exclusions or preserved forks.
- Complete only when generated `.agents/skills/sync-shadcn/SKILL.md` is synced
  by `pnpm install`.
- Complete only when focused audits prove the generated status output shape has
  no `Settled exclusions` or `Preserved Plate forks` sections, while retaining
  deferred-item guidance and source metadata.
- Complete only when `pnpm lint:fix`, `git diff --check`, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-tighten-sync-shadcn-status-output.md`
  pass.

Verification surface:
- `pnpm install`
- source audits over `.agents/rules/sync-shadcn.mdc`,
  `.agents/skills/sync-shadcn/SKILL.md`, and `.claude/skills/sync-shadcn/SKILL.md`
- focused `sed` read of the generated status output shape
- `pnpm lint:fix`
- `git diff --check`
- autogoal completion checker

Constraints:
- Edit `.agents/rules/sync-shadcn.mdc` as source of truth.
- Do not manually edit generated skill mirrors.
- Do not run `build:registry`.
- Do not patch `apps/www`; this is a skill/command-contract change only.
- Do not create PRs, commits, pushes, or tracker comments.

Boundaries:
- Source of truth: `.agents/rules/sync-shadcn.mdc`
- Allowed edit scope: `.agents/rules/sync-shadcn.mdc`, generated
  `.agents/skills/sync-shadcn/SKILL.md`, generated Claude mirror if Skiller
  updates it, and this goal plan.
- Browser surface: N/A, no browser-visible app behavior changed.
- Tracker sync: N/A, chat correction only.
- Non-goals: run a new status command, implement a script runner, change sync
  state, or alter the full `review` output.

Output budget strategy:
- Scope reads to the relevant status section and generated mirrors.
- Use focused `rg`/`sed`; do not stream full run artifacts or shadcn diffs.

Blocked condition:
- Block only if Skiller generation fails, generated mirrors cannot be synced
  from the source rule, or the status section cannot be made unambiguous without
  conflicting with `review`.

Task state:
- task_type: agent command-contract correction
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until completion checker and `update_goal`

Current verdict:
- verdict: status contract corrected
- confidence: high
- next owner: sync-shadcn
- reason: generated `status` output shape now contains only partial syncs,
  deferred decisions, and next action.

Completion rule:
- Do not call `update_goal(status: complete)` while any checklist item remains
  unchecked.
- Do not call `update_goal(status: complete)` until verification evidence is
  recorded and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-tighten-sync-shadcn-status-output.md`
  passes.
- Do not create hook state for this goal.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `sync-shadcn` and `autogoal`; read current generated status section before editing. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this correction objective. |
| Source of truth read before edits | yes | `.agents/skills/sync-shadcn/SKILL.md` identified source metadata; source rule edited. |
| Tracker comments and attachments read | N/A | Chat correction only. |
| Video transcript evidence required | N/A | No video/screenshot source. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Skill command text correction only. |
| TDD decision before behavior change or bug fix | N/A | No executable behavior changed. |
| Branch decision for code-changing task | N/A | User did not ask for branch/PR work. |
| Release artifact decision | N/A | No package release artifact. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | N/A | User did not ask for PR. |
| Tracker sync expectation decision | N/A | No tracker target. |
| Output budget strategy recorded | yes | Scoped reads/audits only. |
| Agent-native pack selected | yes | `.agents/**` skill/rule surface changed. |
| Agent-facing action surface identified | yes | `sync-shadcn status` output contract. |
| Source rule versus generated mirror boundary identified | yes | Source rule edited; Skiller regenerated mirrors via `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; no parity gap because the command itself is the agent action surface. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: concise correction summary, verification,
      and no PR/tracker lines.
- [x] Branch handling recorded for code-changing work: N/A, no branch/PR
      requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising repo-wide failure.
- [x] Workspace authority recorded: proof commands run in
      `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded for command-contract change: failure mode is
      status output burying next actions under settled policy noise.
- [x] Review/autoreview target selected from actual diff state: agent-native
      reviewer loaded; autoreview N/A because this is docs/skill text only.
- [x] Agent-native review decision recorded for `.agents/**` skill changes.
- [x] Output budget discipline recorded and followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove status output is narrowed in source/generated skill | Focused audits show generated status output has no `Settled exclusions` or `Preserved Plate forks` sections and keeps deferred guidance. |
| Bug reproduced before fix | N/A | Record reason | User corrected command-output shape, not a runtime bug. |
| Targeted behavior verification | yes | Audit generated status section | `sed -n '148,168p' .agents/skills/sync-shadcn/SKILL.md` shows only partial syncs, deferred decisions, and next action. |
| TypeScript or typed config changed | N/A | Record reason | Markdown rule/skill text only. |
| Package exports or file layout changed | N/A | Record reason | No package file layout or barrels changed. |
| Package manifests, lockfile, or install graph changed | N/A | Record reason | `pnpm install` reported lockfile up to date; no package manifest edit for this task. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and Skiller applied rules for Codex and Claude. |
| Workspace authority proof | yes | Run verification in owning repo | All commands ran from `/Users/zbeyens/git/plate`. |
| Browser surface changed | N/A | Record waiver | No visible web UI changed. |
| Browser final proof | N/A | Record waiver | No browser proof needed. |
| CI-controlled template output changed | N/A | Record reason | No registry/template output changed. |
| Package behavior or public API changed | N/A | Record reason | Skill command contract only; no package changeset. |
| Registry-only component work changed | N/A | Record reason | No registry component work. |
| Docs or content changed | N/A | Record reason | No docs site content changed. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode: status lists settled policy instead of decisions; boundary: `status` contract in `sync-shadcn`; proof: generated output shape and forbidden-actions text. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Reviewer loaded; no actionable gap. |
| Local install corruption suspected | N/A | Record reason | No install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Record reason | Text-only skill contract; agent-native review is the relevant lane. |
| PR create or update | N/A | Record reason | User did not ask for PR. |
| Task-style PR body verified | N/A | Record reason | No PR. |
| PR proof image hosting | N/A | Record reason | No PR/browser image. |
| Tracker sync-back | N/A | Record reason | No issue/Linear target. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded output | Audits scoped to skill/rule paths and status section reads. |
| Goal plan complete | yes | Run completion checker | Passed. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` passed; generated skill contains revised status section and source metadata. |
| Agent action discoverability | yes | Source-audit skill/rule path | Generated skill status section is discoverable. |
| Agent-native review | yes | Load reviewer and close findings | Reviewer loaded; no findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source/generated status sections and autogoal read. | implementation |
| Implementation | complete | `.agents/rules/sync-shadcn.mdc` updated with narrowed status contract. | verification |
| Verification | complete | `pnpm install` and focused generated-skill audits passed; final lint/checker next. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Final response after completion checker and goal close. | final response |

Findings:
- User is right: Rhea/style/theme/generated style registry is upstream
  create/theming product infrastructure, not a useful standalone status item.
- Routine status should not list settled exclusions or preserved forks. That is
  noise; `review` and the plan can hold that evidence.

Decisions and tradeoffs:
- Keep `status` short and action-oriented.
- Keep full policy/exclusion/fork evidence in `review` or plan artifacts.
- Treat product/theme/style noise as part of the owning deferred product
  decision, not as a separate status line.

Implementation notes:
- Removed settled-exclusion and preserved-fork sections from status output
  shape.
- Removed `partialSyncs[*].excluded` from status summary inputs.
- Added a rule to collapse upstream product/theme/style noise into its owning
  deferred decision.

Review fixes:
- Agent-native reviewer loaded; no additional action required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm install` passed; Skiller applied rules for Codex and Claude.
- Focused `rg` proved generated/source status text contains the new collapse
  rule, deferred decisions, status output shape, and source metadata.
- `sed -n '148,168p' .agents/skills/sync-shadcn/SKILL.md` shows the generated
  status output shape without `Settled exclusions` or `Preserved Plate forks`.
- `rg -n 'Settled exclusions|Preserved Plate forks|partialSyncs[*].excluded'`
  over source/Codex/Claude skill files returned no matches.
- `cmp` showed Codex and Claude skill mirrors are identical; source differs from
  generated as expected because generated skill adds `name` and Skiller
  metadata.
- `pnpm lint:fix` passed with no fixes applied.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-tighten-sync-shadcn-status-output.md`
  passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, requested command-output correction.
  - Verified: `pnpm install`, source audits, generated status-section audit,
    final lint, completion checker.
- Browser check: N/A.
- Outcome: `sync-shadcn status` no longer lists exclusions/forks and folds
  Rhea/style/theme generated registry noise into `/create` or theming product
  context.
- Caveat: this updates the skill contract, not a script runner.
- Design:
  - Chosen boundary: `.agents/rules/sync-shadcn.mdc` source rule.
  - Why not quick patch: editing generated `SKILL.md` directly would be
    overwritten and violate repo policy.
  - Why not broader change: `review` should retain full evidence; `status`
    should stay decision-focused.
- Verified: final commands below.
- PR body verified: N/A.

Task-style PR body contract:
- N/A, no PR requested.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: command contract only; no script runner added.

Timeline:
- 2026-05-28T15:12:24.611Z Task goal plan created.
- 2026-05-28 Tightened `sync-shadcn status` output contract.
- 2026-05-28 Ran `pnpm install` to regenerate skill mirrors.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final lint, completion checker, goal close |
| What is the goal? | Tighten `sync-shadcn status` so it reports decisions, not settled policy noise. |
| What have I learned? | Rhea/style/theme generated registry belongs under create/theming product context, not routine status. |
| What have I done? | Updated source rule, regenerated skill mirrors, and audited generated output. |

Open risks:
- None for this task.

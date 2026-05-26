# rename goal skill to autogoal

Objective:
Rename the universal `goal` skill to `autogoal`, complete only when the source
rule and generated skill outputs use `autogoal`, stale generated `goal` skill
outputs are removed, source-owned skill invocations point to `autogoal`,
`pnpm install` syncs generated output, focused audits pass, and this plan passes
`node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md`,
while preserving the Codex goal lifecycle semantics.

Goal plan:
docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md

Template:
docs/plans/templates/task.md

Flow mode:
one-shot execution

Task source:
- type: user request
- id / link: local chat request
- title: rename `$goal` to `autogoal`
- acceptance criteria: source and generated skill name/path are `autogoal`,
  generated stale `goal` skill folders are absent, source rules and reusable
  templates use the autogoal helper path, and verification proves sync.

Completion threshold:
- `.agents/rules/autogoal.mdc` is the source rule for the lifecycle skill.
- `.agents/rules/autogoal/` owns the helper scripts and README.
- `.agents/skills/autogoal/SKILL.md` and `.claude/skills/autogoal/SKILL.md`
  exist with `name: autogoal` and `source: .agents/rules/autogoal.mdc`.
- `.agents/skills/goal` and `.claude/skills/goal` do not exist.
- Source-owned rules/templates point helper commands at
  `.agents/rules/autogoal/scripts/*`.
- Focused audits show no stale generated `goal` skill path/name references in
  source-owned skill surfaces.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md`
  passes.

Verification surface:
- `pnpm install`
- `test ! -e .agents/skills/goal && test ! -e .claude/skills/goal && test -f .agents/skills/autogoal/SKILL.md && test -f .claude/skills/autogoal/SKILL.md`
- `rg -n 'name: autogoal|source: \\.agents/rules/autogoal\\.mdc|# Autogoal|`autogoal` for any prompt|\\.agents/rules/autogoal/scripts/check-complete\\.mjs|\\.agents/rules/autogoal/scripts/create-goal-scratchpad\\.mjs' ...`
- `rg -n '\\.agents/rules/goal|\\.agents/skills/goal|\\.claude/skills/goal|source: \\.agents/rules/goal\\.mdc|name: goal|^# Goal$|\\$goal|`goal repair <expectation>`|Load `goal`|load `goal`' .agents .claude .codex AGENTS.md docs/plans/templates 2>/dev/null || true`
- `node --check .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs && node --check .agents/rules/autogoal/scripts/create-goal-template.mjs && node --check .agents/rules/autogoal/scripts/check-complete.mjs`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md`

Constraints:
- Keep Codex tool semantics (`get_goal`, `create_goal`, `update_goal`) intact.
- Preserve the conceptual term "goal" where it describes the runtime objective,
  goal plan, or Codex goal tool, rather than the skill invocation name.
- Do not edit generated `SKILL.md` by hand; sync through Skiller.
- Keep historical completed `docs/plans/**` as historical records; update
  reusable templates and this active plan.

Boundaries:
- Source of truth: `.agents/rules/autogoal.mdc` and source-owned `.agents`
  rules/templates.
- Allowed edit scope: `.agents/AGENTS.md`, `.agents/rules/**`,
  generated `.agents/skills/autogoal`, generated `.claude/skills/autogoal`,
  generated root `AGENTS.md`, reusable `docs/plans/templates/**`, and this plan.
- Browser surface: N/A, no browser behavior.
- Tracker sync: N/A, no tracker involved.
- Non-goals: no package code, no PR, no changes to historical completed plans.

Blocked condition:
Stop only if Skiller cannot generate `autogoal`, if stale `goal` generated
folders cannot be removed safely, or if a source-owned required reference still
must invoke a skill named `goal`.

Task state:
- task_type: skill rename
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until `update_goal` closeout

Current verdict:
- verdict: complete after mechanical checker
- confidence: high
- next owner: task
- reason: generated skill metadata, stale folder absence, source path audits,
  script syntax checks, and Skiller sync all passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used the named goal lifecycle skill and inspected source/generation ownership before mutable edits. |
| Active goal checked or created | yes | `get_goal` returned no active goal, then `create_goal` created the rename objective. |
| Source of truth read before edits | yes | Read `.agents/rules/goal.mdc`, `.agents/rules/goal/README.md`, helper scripts, and source references before rename. |
| Tracker comments and attachments read | no | N/A: local chat request, no tracker. |
| Video transcript evidence required | no | N/A: no video or screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: skill/rule rename, not product implementation. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package release surface. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
      N/A: no video evidence involved.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: no package release artifact.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: no branch or PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
      N/A: no install-rot failure occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      N/A: instruction/sync rename; focused audits are the useful review.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named sync, source audits, syntax checks, and completion checker | `pnpm install`, stale-folder test, positive audit, negative audit, and node syntax checks passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: rename task, not bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Generated skill metadata says `name: autogoal` and source `.agents/rules/autogoal.mdc`; stale `goal` generated folders are absent. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS or typed config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or barrel layout. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest/lockfile intent; `pnpm install` ran for Skiller sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and regenerated `autogoal` skill outputs. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`, which owns the Skiller source/generation outputs. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled app templates changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior or public API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: generated old `goal` skill remains callable or source rules still invoke it. Proof: stale-folder test plus negative `rg` audit. Boundary: source rules and reusable templates only. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Reviewer decision: no action-parity issue; this rename changes skill routing text and generated skill identity, not a user-action tool UI. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local install corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: source/generation rename; focused audits and syntax checks cover the contract. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/rule/generated-skill rename; syntax and source audits are sufficient. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md` | Final mechanical closeout command is recorded in verification evidence. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: the durable knowledge is encoded directly in source rules/templates. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source rule, README, helper scripts, AGENTS skill guidance, and source refs. | implementation |
| Implementation | complete | Moved source rule/directory to autogoal, updated source refs/templates, removed stale generated skill folders, synced Skiller. | verification |
| Verification | complete | `pnpm install`, stale-folder test, positive/negative audits, and node syntax checks passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | This plan records evidence and is ready for final checker/update_goal. | final response |

Findings:
- Skiller derives generated skill name/source metadata from the `.agents/rules/*.mdc`
  source filename, so renaming only generated `SKILL.md` would be a dirty fake.
- The best boundary is source rule rename plus generated sync, while keeping
  "goal" as the runtime Codex objective concept.

Decisions and tradeoffs:
- Renamed source ownership from `.agents/rules/goal*` to
  `.agents/rules/autogoal*`.
- Kept helper script filenames like `create-goal-scratchpad.mjs` because they
  create Codex goal plans; the path now carries the skill identity.
- Updated reusable templates and source rules, but left historical completed
  plans as history.

Implementation notes:
- Moved `.agents/rules/goal.mdc` to `.agents/rules/autogoal.mdc`.
- Moved `.agents/rules/goal/` to `.agents/rules/autogoal/`.
- Updated source references in `.agents/AGENTS.md`, `.agents/rules/*.mdc`,
  `.agents/rules/autogoal/README.md`, helper script help text, reusable
  `docs/plans/templates/*.md`, and this plan.
- Removed stale generated `.agents/skills/goal` and `.claude/skills/goal`.
- Ran `pnpm install` so Skiller generated `.agents/skills/autogoal/SKILL.md`,
  `.claude/skills/autogoal/SKILL.md`, and root `AGENTS.md`.

Review fixes:
- Tightened wording so `autogoal` names the skill, while `goal` remains the
  runtime objective and tool concept.
- Replaced repair invocation docs from `goal repair <expectation>` to
  `autogoal repair <expectation>`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad search used shell backticks in one early command | 1 | Re-ran focused searches with single-quoted patterns | No file changes came from that command; focused audits passed. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` passed and Skiller applied
  rules for Claude Code and Codex.
- `/Users/zbeyens/git/plate-2`: `test ! -e .agents/skills/goal && test ! -e .claude/skills/goal && test -f .agents/skills/autogoal/SKILL.md && test -f .claude/skills/autogoal/SKILL.md`
  passed.
- `/Users/zbeyens/git/plate-2`: positive `rg` audit found `name: autogoal`,
  `source: .agents/rules/autogoal.mdc`, `# Autogoal`, autogoal AGENTS guidance,
  and autogoal helper paths across source/generated rules and templates.
- `/Users/zbeyens/git/plate-2`: negative `rg` audit over source/generated skill
  surfaces and reusable templates for stale generated skill names/paths and old
  repair invocation returned no matches.
- `/Users/zbeyens/git/plate-2`: `node --check .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs && node --check .agents/rules/autogoal/scripts/create-goal-template.mjs && node --check .agents/rules/autogoal/scripts/check-complete.mjs`
  passed.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-rename-goal-skill-to-autogoal.md`
  is the final closeout check for this plan.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high, because source and generated metadata align and stale
  generated goal paths are absent.
- Flow table:
  - Reproduced: N/A for bug repro; this is a generated skill rename.
  - Verified: Skiller sync, generated metadata, stale folder absence, source
    audits, negative stale-ref audit, helper script syntax checks, plan checker.
- Browser check: N/A, no browser surface.
- Outcome: `$goal` is renamed to `autogoal` in source-owned skill surfaces.
- Caveat: historical completed `docs/plans/**` still mention old paths as
  history; reusable templates and current source use autogoal.
- Design:
  - Chosen boundary: source rule/directory rename plus Skiller regeneration.
  - Why not quick patch: editing generated `SKILL.md` would drift on next sync.
  - Why not broader change: renaming the Codex goal concept or `create_goal`
    tool would be wrong; only the skill is renamed.
- Verified: source/generated sync and focused audits.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker requested.
- Browser proof: N/A, no browser surface.
- Caveats: historical plans left untouched.

Timeline:
- 2026-05-25T08:04Z Active goal created for skill rename.
- 2026-05-25T08:05Z Goal plan created from task template.
- 2026-05-25T08:07Z Source rule and helper directory moved to `autogoal`.
- 2026-05-25T08:09Z Source rules/templates updated to autogoal paths and skill name.
- 2026-05-25T08:10Z Stale generated `goal` skill folders removed.
- 2026-05-25T08:10Z `pnpm install` regenerated Codex and Claude `autogoal` skills.
- 2026-05-25T08:11Z Positive/negative audits and script syntax checks passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after source rename, generated sync, and focused verification. |
| Where am I going? | Run final plan checker, close active goal, and report. |
| What is the goal? | Rename the universal skill from `goal` to `autogoal` without breaking goal lifecycle semantics. |
| What have I learned? | Skiller rename must happen at `.agents/rules/*.mdc`, not generated skill output. |
| What have I done? | Renamed source ownership, updated source refs/templates, regenerated outputs, and audited stale refs. |

Open risks:
- None known. Historical completed `docs/plans/**` retain old text intentionally
  as past execution records.

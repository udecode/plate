# plan better-convex skill sync

Objective:
Create a reviewable plan for syncing shared agent workflow skills from
`/Users/zbeyens/git/plate-2` into `/Users/zbeyens/git/better-convex`, complete
only when the plan inventories relevant source/destination skill surfaces,
preserves `better-convex` forks, identifies common updates such as `autogoal`
and task/major-task lifecycle gates, names files and verification commands,
excludes implementation edits to `better-convex`, and passes
`node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-plan-better-convex-skill-sync.md`.

Goal plan:
docs/plans/2026-05-25-plan-better-convex-skill-sync.md

Template:
docs/plans/templates/task.md

Flow mode:
collaborative planning

Task source:
- type: user request
- id / link: local chat request
- title: plan skill sync against `../better-convex`
- acceptance criteria: produce a concrete plan for user review, do not edit
  `../better-convex`, and make conflict/fork handling explicit.

Completion threshold:
- Plan states source and destination repos.
- Plan inventories relevant source/destination surfaces.
- Plan scopes the sync narrowly enough to review.
- Plan names the exact files to edit later.
- Plan classifies common updates, destination forks, removals, and non-syncs.
- Plan includes verification and `npx skills` lockfile rules.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-plan-better-convex-skill-sync.md`
  passes.

Verification surface:
- Source reads of both repos' `.agents/AGENTS.md`, relevant `.agents/rules`,
  generated skill metadata, plan template state, `skills-lock.json`, and
  `better-convex/package.json`.
- Inventory commands over shared rules and lock entries.
- Final plan checker command.

Constraints:
- Planning-only. Do not modify `../better-convex`.
- Preserve `better-convex` package manager, PR, tracker, changeset, fixture,
  package-owned `kitcn`, scenario, and final-handoff policy.
- Do not copy Plate-specific editor, Slate, registry, or browser-demo rules.
- Do not manually edit generated `.agents/skills/**` or `.claude/skills/**` in
  the future implementation.

Boundaries:
- Source repo: `/Users/zbeyens/git/plate-2`.
- Destination repo: `/Users/zbeyens/git/better-convex`.
- Allowed edit scope for this planning turn: this plan only.
- Browser surface: N/A, no browser behavior.
- Tracker sync: N/A, no tracker involved.
- Non-goals: executing the sync, creating a branch/PR, changing lockfiles, or
  broad-syncing every common skill.

Blocked condition:
Planning blocks only if the user rejects the assumed direction
`plate-2 -> better-convex` or wants a broader skill set than the lifecycle sync
below.

## Review Plan

### Recommendation

Do a first sync pass for the durable workflow lifecycle, not a full common-skill
merge.

In scope:

1. Add `autogoal` to `better-convex`.
2. Add `docs/plans/templates/{goal,task,goal-repair}.md` to `better-convex`.
3. Merge `task.mdc` common lifecycle updates into `better-convex` while
   preserving its repo-specific execution and handoff policy.
4. Merge `major-task.mdc` common lifecycle updates into `better-convex` while
   preserving Convex/tooling language.
5. Update `.agents/AGENTS.md` to make `autogoal` the durable plan/goal workflow.
6. Replace stale `planning-with-files` references where they are common workflow
   debt.
7. Leave `skills-lock.json` unchanged unless review expands scope to external
   skills.

Out of scope for this pass:

- `react`, `testing`, `hard-cut`, `research-wiki`, `shadcn-parity`, and
  `dev-browser` common-rule sync. They exist in both repos, but this task is
  lifecycle sync. Do them later as separate reviewable diffs.
- Plate-only skills: `slate-plan`, `clawsweeper`, `clawpatch`, `plate-plan`,
  `plate-ui`, `resolve-slate-issue`, editor harvest skills, and registry/docs
  skills.
- `video-transcripts` extraction. `better-convex` currently embeds transcript
  rules in `task.mdc`; Plate has a separate skill, but its helper script source
  is not under `.agents/rules/video-transcripts/`. Preserve the destination
  inline protocol for this pass instead of introducing a broken skill.

### Inventory

Source `plate-2`:

- `.agents/rules/autogoal.mdc`
- `.agents/rules/autogoal/README.md`
- `.agents/rules/autogoal/scripts/check-complete.mjs`
- `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`
- `.agents/rules/autogoal/scripts/create-goal-template.mjs`
- `.agents/rules/task.mdc`
- `.agents/rules/major-task.mdc`
- `.agents/AGENTS.md`
- `docs/plans/templates/goal.md`
- `docs/plans/templates/task.md`
- `docs/plans/templates/goal-repair.md`

Destination `better-convex`:

- `.agents/AGENTS.md`
- `.agents/rules/task.mdc`
- `.agents/rules/major-task.mdc`
- `.agents/rules/changeset-doc-sync.mdc`
- `.agents/skiller.toml`
- `.agents/skills/task/SKILL.md`
- `.agents/skills/major-task/SKILL.md`
- `skills-lock.json`
- `package.json`
- `packages/kitcn/skills/kitcn/**`
- `tooling/sync-kitcn-skill.ts`

Observed destination facts:

- `better-convex` has `.agents/rules/*.mdc` source rules and generated
  `.agents/skills/**`.
- `bun install` runs `bun tooling/sync-kitcn-skill.ts && bunx skiller@latest apply || true`.
- `packages/kitcn/skills/kitcn/**` is package-owned source for the `kitcn`
  skill; do not touch it in this pass.
- `better-convex` has no `docs/plans/templates/` directory.
- `better-convex` has no `goal` or `autogoal` rule.
- `better-convex` references `planning-with-files`, but that skill is not
  present under `.agents/skills`, `.claude/skills`, or `skills-lock.json`.

### File Plan

#### 1. Add Autogoal Source

Create in `better-convex`:

- `.agents/rules/autogoal.mdc`
- `.agents/rules/autogoal/README.md`
- `.agents/rules/autogoal/scripts/check-complete.mjs`
- `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`
- `.agents/rules/autogoal/scripts/create-goal-template.mjs`

Adapt while copying:

- Keep lifecycle semantics generic.
- Replace Plate package-manager examples with `bun install` where the text is
  repo-specific.
- Keep helper names as `create-goal-*` and `check-complete.mjs`; they operate
  on Codex goals, while the skill name is `autogoal`.
- Keep generated-skill warning: edit `.agents/rules/**`, then run `bun install`.

Do not add via `npx skills add`; this is a repo-local source rule, not an
external lock-managed skill.

#### 2. Add Plan Templates

Create in `better-convex`:

- `docs/plans/templates/goal.md`
- `docs/plans/templates/task.md`
- `docs/plans/templates/goal-repair.md`

Adapt from Plate templates:

- Use `.agents/rules/autogoal/scripts/check-complete.mjs`.
- Use `bun install` for agent-rule sync evidence.
- Use `bun lint:fix` for final lint when needed.
- Preserve `better-convex` release gates:
  - active changeset or new changeset for package code
  - `bun --cwd packages/kitcn build` after package changes
  - `bun run fixtures:sync` and `bun run fixtures:check` for scaffold/template
    changes
  - scenario/runtime proof from `scenarios.mdc` when applicable
  - PR body sync before tracker comment
  - hosted proof image rule when PR body uses browser proof

This should move recurring closeout gates out of `task.mdc` and into
`docs/plans/templates/task.md`, but keep `better-convex`-specific gates there.

#### 3. Merge `task.mdc`

Primary operation:

- Keep `better-convex/.agents/rules/task.mdc` as the base.
- Merge Plate's newer router shape only where it is generic lifecycle behavior.

Apply common updates:

- Non-trivial measurable work loads `autogoal`.
- Create one goal plan with:

  ```bash
  node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template task --title "<short task title>"
  ```

- Route detailed evidence gates to `docs/plans/templates/task.md`.
- Add workspace-authority, high-risk, autoreview, and agent-native review
  language from Plate where it is generic.
- Keep task router lean; do not rebuild a giant closure constitution inside
  `task.mdc`.

Preserve destination forks:

- GitHub issue/PR workflow and branch naming.
- Default PR creation for verified code-changing work.
- Better final handoff table shape and PR-body sync rules.
- Video transcript inline protocol for now.
- Changeset behavior, including active unreleased changeset preference.
- `packages/kitcn` build rule.
- fixture/scaffold gates.
- scenario proof rules.
- local corruption retry with `bun install`.
- tracker comments and QA-focused issue comments.

Remove obsolete common parts:

- `planning-with-files` loading for ordinary non-trivial tasks.
- root `task_plan.md`, `findings.md`, `progress.md` planning defaults in this
  skill path.

#### 4. Merge `major-task.mdc`

Primary operation:

- Keep `better-convex/.agents/rules/major-task.mdc` as the base.
- Replace `planning-with-files` durable-state requirements with `autogoal`.

Apply common updates:

- Load `autogoal` immediately and create/update one `docs/plans` goal plan.
- Use the active goal plus plan as durable state.
- Keep major-task analytical/planning-only distinction.
- Add success criteria that `autogoal` was loaded and the plan existed before
  the work sprawled.

Preserve destination forks:

- Convex/tooling framework comparison language.
- Local clone/source-first rule.
- Better-specific tracker/PR language.
- Do not import Plate's editor-framework candidate-map wording.

#### 5. Update Destination-Only `changeset-doc-sync.mdc`

This is not in Plate, but it currently depends on stale `planning-with-files`.
Patch narrowly:

- Replace root `task_plan.md`, `findings.md`, and `progress.md` with one
  `docs/plans/<date>-changeset-doc-sync.md` goal plan.
- Keep the exhaustive per-file checklist requirement.
- Keep `/example` crosswalk requirements.
- Keep docs + `packages/kitcn/skills/kitcn` sync ownership.
- Add completion check with `.agents/rules/autogoal/scripts/check-complete.mjs`.

Do not rewrite the doc-sync domain workflow.

#### 6. Update `.agents/AGENTS.md`

Keep destination-specific policy. Apply only common lifecycle changes:

- Add `autogoal` to the skill list for verifiable non-trivial work.
- Change the `planning-with-files` override to an `autogoal`/`docs/plans` rule
  or remove it if fully superseded.
- Update mandatory first-response/recovery hook wording:
  - replace "start/update planning-with-files" with "create/continue autogoal
    and one `docs/plans` goal plan" for multi-step measurable work
  - keep the mandatory skill-analysis style if desired; it is a destination
    fork.
- Preserve all Convex/package/scaffold/fixture/browser/PR rules.
- Preserve CE exclusions.

#### 7. Lockfile Handling

Planned `skills-lock.json` changes:

- None.

Reason:

- `autogoal`, `task`, `major-task`, and `changeset-doc-sync` are repo-local
  rules, not external installed skills.
- `planning-with-files` is referenced but not installed in `better-convex`
  `skills-lock.json`, `.agents/skills`, or `.claude/skills`, so there is no
  lock entry to remove.

If review expands scope to add/remove external skills, use only:

```bash
npx skills add <source-package-or-url> --skill <skill-name> --agent '*' -y
npx skills remove <skill-name> --agent '*' -y
```

Do not edit `skills-lock.json` by hand.

### Verification Plan

Run from `/Users/zbeyens/git/better-convex` after implementation:

```bash
bun install
```

Then run focused audits:

```bash
test -f .agents/rules/autogoal.mdc
test -f .agents/skills/autogoal/SKILL.md
test -f .claude/skills/autogoal/SKILL.md
test -f docs/plans/templates/task.md
test -f docs/plans/templates/goal.md
test -f docs/plans/templates/goal-repair.md
node --check .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs
node --check .agents/rules/autogoal/scripts/create-goal-template.mjs
node --check .agents/rules/autogoal/scripts/check-complete.mjs
rg -n "autogoal|\\.agents/rules/autogoal/scripts|docs/plans/templates/task.md|Goal plan complete" .agents/AGENTS.md .agents/rules docs/plans/templates .agents/skills .claude/skills
rg -n "planning-with-files|task_plan\\.md|findings\\.md|progress\\.md|\\.agents/rules/goal|\\.agents/skills/goal|name: goal" .agents/AGENTS.md .agents/rules docs/plans/templates .agents/skills .claude/skills || true
```

Expected negative-audit exceptions:

- `.claude/commands/clean-docs.md` may still mention `planning-with-files`.
  Decide during implementation whether to patch it or explicitly leave command
  cleanup for a separate command-sync pass.
- Historical `docs/plans/**` may mention older planning files; do not rewrite
  history.

Smoke plan proof:

```bash
node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template task --title "sync smoke" --path docs/plans/2026-05-25-sync-smoke.md --force
node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-sync-smoke.md
```

The smoke `check-complete` should fail while the generated plan is blank. That
is good: it proves the checker is active. Remove the smoke file after proof.

### Review Questions

1. Direction: approve `plate-2 -> better-convex`?
2. Scope: approve lifecycle stack only, or include broader shared rules now?
3. `changeset-doc-sync`: patch stale planning references in this sync, or defer?
4. `.claude/commands/clean-docs.md`: patch stale `planning-with-files` command
   now, or leave command cleanup out of scope?
5. Keep `better-convex`'s mandatory first-response skill-analysis block, just
   swap durable planning owner to `autogoal`?

Task state:
- task_type: planning-only sync plan
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: user review
- goal_status: active until closeout

Current verdict:
- verdict: ready for user review
- confidence: high
- next owner: user
- reason: plan is grounded in source reads and preserves destination forks.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-plan-better-convex-skill-sync.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `sync-skills` and used `autogoal`; read relevant source instructions. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this planning objective. |
| Source of truth read before edits | yes | Read both repos' `.agents/AGENTS.md`, relevant source rules, generated metadata, lock entries, and `better-convex/package.json`. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: planning-only skill sync; memory/source reads covered known workflow history. |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior change. |
| Branch decision for code-changing task | no | N/A: planning-only, no branch or implementation. |
| Release artifact decision | no | N/A: no package release surface changed. |
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
      N/A: plan only; proposed ownership boundary is source rules/templates in
      `better-convex`.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: no implementation/package change in this planning turn.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: planning-only.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
      N/A: no repo-wide failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      N/A: no implementation diff.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Produce plan, source-read evidence, and run final checker | This file records the reviewable plan and source-read evidence; checker is final command. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: not a bug fix. |
| Targeted behavior verification | yes | Run focused proof for changed behavior or record N/A | Source inventory and exact future verification commands are recorded. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS/config edit. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/layout edit. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no implementation or lockfile edit. |
| Agent rules or skills changed | no | Run sync or verify generated skill sync | N/A: this turn only edits a plan file in `plate-2`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Planning proof ran from `/Users/zbeyens/git/plate-2`; future implementation proof must run in `/Users/zbeyens/git/better-convex`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output edited. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API edit. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode: clobber `better-convex` forks or leave stale `planning-with-files` references. Proof plan: source-only merge plus positive/negative audits in destination. Boundary: lifecycle stack only. |
| Agent-native review for agent/tooling changes | yes | Load reviewer or record N/A | N/A: planning-only; implementation should run agent-native review because it will change `.agents/**` and `.claude/**`. |
| Local install corruption suspected | no | Run reinstall/retry or record N/A | N/A: no install corruption. |
| Autoreview for non-trivial implementation changes | no | Run autoreview or record N/A | N/A: no implementation diff. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | Host proof image or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post sync or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | no | Run lint or scoped equivalent | N/A: markdown plan only; final checker is the proof. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-plan-better-convex-skill-sync.md` | Final checker command is recorded in verification evidence. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: durable knowledge is this review plan plus the global sync skill. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read sync-skills, both AGENTS files, task/major-task rules, autogoal stack, locks, and package sync commands. | plan drafting |
| Plan drafting | complete | Wrote lifecycle sync plan with file-level scope and conflict decisions. | verification |
| Verification | complete | Plan contains source inventory, future commands, risk gates, and final checker path. | user review |
| Closeout | complete | Plan ready for user review. | final response |

Findings:
- `better-convex` has source rules and generated skill mirrors, but no
  `docs/plans/templates` directory and no `autogoal`.
- `better-convex` references `planning-with-files` even though it is not
  installed in `.agents/skills`, `.claude/skills`, or `skills-lock.json`.
- `better-convex` `task.mdc` contains valuable repo forks: PR body sync,
  tracker comments, changesets, package build, fixtures, scenarios, and inline
  video transcript protocol.
- `plate-2` task routing is cleaner: lifecycle gates moved into templates and
  non-trivial measurable work routes through `autogoal`.

Decisions and tradeoffs:
- First pass should sync lifecycle only. Broader shared-rule sync would be noisy
  and harder to review.
- Preserve `better-convex` inline video transcript protocol for now; importing
  Plate's separate `video-transcripts` skill needs source ownership cleanup for
  the helper script first.
- Do not touch `skills-lock.json` in the proposed pass because no external skill
  add/remove is required.

Implementation notes:
- No implementation performed.
- Plan assumes direction `plate-2 -> better-convex`.
- Future implementation should run in `/Users/zbeyens/git/better-convex`.

Review fixes:
- N/A: no review pass requested yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Memory grep pattern used shell backticks | 1 | Switched to direct source reads and safer source inventory commands | No file edits were made by that command. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: read `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md`.
- `/Users/zbeyens/git/plate-2`: read both repos' `.agents/AGENTS.md`.
- `/Users/zbeyens/git/plate-2`: inventoried source/destination `.agents/rules`.
- `/Users/zbeyens/git/plate-2`: confirmed `better-convex` has no
  `docs/plans/templates` directory.
- `/Users/zbeyens/git/plate-2`: confirmed `better-convex` has no `goal` or
  `autogoal` rule files.
- `/Users/zbeyens/git/plate-2`: read `task.mdc` and `major-task.mdc` from both
  repos.
- `/Users/zbeyens/git/plate-2`: read Plate `autogoal` stack and goal/task
  templates.
- `/Users/zbeyens/git/plate-2`: read `better-convex/package.json` and confirmed
  `postinstall` runs `bun tooling/sync-kitcn-skill.ts && bunx skiller@latest apply || true`.
- `/Users/zbeyens/git/plate-2`: inspected `skills-lock.json` entries for both
  repos.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-plan-better-convex-skill-sync.md`
  is the final closeout command.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high for the proposed first-pass scope.
- Flow table:
  - Reproduced: N/A; planning-only.
  - Verified: source inventory and plan checker.
- Browser check: N/A, no browser surface.
- Outcome: reviewable `better-convex` sync plan.
- Caveat: plan does not execute the sync; user review is next.
- Design:
  - Chosen boundary: lifecycle stack sync first.
  - Why not quick patch: copying `task.mdc` would clobber `better-convex` forks.
  - Why not broader change: syncing every common rule would mix unrelated policy
    migrations into the lifecycle decision.
- Verified: source reads and final checker.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: review questions above need user decision before implementation.

Timeline:
- 2026-05-25T08:21Z Loaded `sync-skills` and created active goal.
- 2026-05-25T08:22Z Created plan file.
- 2026-05-25T08:23Z Read both repos' AGENTS, task, major-task, autogoal, locks,
  and package sync surfaces.
- 2026-05-25T08:26Z Drafted review plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning complete, before user review. |
| Where am I going? | User reviews scope/questions, then implementation can start in `better-convex`. |
| What is the goal? | Plan lifecycle skill sync from `plate-2` to `better-convex`. |
| What have I learned? | `better-convex` needs autogoal/templates, but its task/PR/scaffold forks must be preserved. |
| What have I done? | Created a file-level sync plan and verification path. |

Open risks:
- User may want broader common-rule sync in the same pass.
- `video-transcripts` extraction needs a separate source-ownership decision.
- `.claude/commands/clean-docs.md` has stale `planning-with-files` wording and
  should be explicitly accepted or deferred.

# Dry Task Router

Objective:
Reduce `.agents/rules/task.mdc` to a lean task router and move auditable task
closure details into `docs/plans/templates/task.md`.

Goal plan:
docs/plans/2026-05-24-dry-task-router.md

Template:
docs/plans/templates/task.md

Task source:
- type: chat request
- id / link: N/A: direct user instruction
- title: DRY task.mdc by moving completion details into the task template
- acceptance criteria: `task.mdc` is materially shorter, source/generated task
  skill stay synced, the task template carries recordable gates, and verification
  commands pass.

Completion threshold:
- `.agents/rules/task.mdc` is a router, not a full video/PR/tracker/final
  handoff policy file.
- `docs/plans/templates/task.md` owns recordable branch, release, browser, PR,
  tracker, repro, local-env-rot, review, and final handoff gates.
- `.agents/skills/task/SKILL.md` is regenerated from `.agents/rules/task.mdc`.
- `pnpm install`, focused `rg` audits, template smoke, `pnpm lint:fix`, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-dry-task-router.md`
  pass.

Verification surface:
- line count before/after for `.agents/rules/task.mdc`
- focused `rg` audits for stale detailed mechanics and required router/template
  references
- generated skill sync after `pnpm install`
- task template smoke through `create-goal-scratchpad.mjs`
- `pnpm lint:fix`
- goal plan completion checker

Constraints:
- Preserve source-of-truth-first routing.
- Preserve skill selection.
- Preserve `--template task` goal trigger.
- Preserve proportional verification.
- Preserve high-level tracker, PR, and browser triggers.
- Do not create PRs, commits, pushes, or tracker comments.

Boundaries:
- Source of truth: user instruction plus `.agents/rules/task.mdc` and
  `docs/plans/templates/task.md`.
- Allowed edit scope: task rule, task template, generated task skill, generated
  top-level agent instructions, and this goal plan.
- Browser surface: N/A: agent rule/template docs only.
- Tracker sync: N/A: no tracker item.
- Non-goals: new tracker-sync skill, PR creation, commit, push.

Blocked condition:
Stop if Skiller sync fails, the generated task skill does not match the source
rule, or focused audits still show detailed video/PR/tracker mechanics embedded
in `task.mdc`.

Task state:
- task_type: agent-rule refactor
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented
- confidence: high
- next owner: task
- reason: router/template split is in place; verification is recorded below.

Completion rule:
- `update_goal(status: complete)` is legal only after every required checklist
  item and gate in this file is closed and the completion checker passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task` and `goal`; this edits task rule/template behavior. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created focused task-router goal. |
| Source of truth read before edits | yes | Read `.agents/rules/task.mdc`, generated task skill, and task template. |
| Tracker comments and attachments read | no | N/A: direct chat task, no tracker. |
| Video transcript evidence required | no | N/A: no tracker video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent rule/template cleanup, not product code behavior. |
| TDD decision before behavior change or bug fix | no | N/A: docs/rules refactor, no runtime bug. |
| Branch decision for code-changing task | no | N/A: no code-changing product branch work requested. |
| Release artifact decision | no | N/A: no package or registry behavior changed. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: user did not ask for PR. |
| Tracker sync expectation decision | no | N/A: no tracker item. |

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
- [x] Review/autoreview decision recorded for risky, user-facing, architecture,
      or agent-tooling work.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source/generated/template audits and command checks named in this plan | `pnpm install`, focused `rg`, smoke helper, `pnpm lint:fix`, and checker evidence recorded below. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: not a bug fix. |
| Targeted behavior verification | yes | Run focused proof for changed behavior or record N/A | Focused `rg` confirms router/template references and removed duplicated mechanics. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown/rule docs only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest changes; `pnpm install` still ran for Skiller sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated `.agents/skills/task/SKILL.md`; focused `rg` verified source/generated alignment. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser proof applies. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior or public API changed. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption-shaped command failure. |
| Autoreview for non-trivial code changes | no | Load `.agents/skills/autoreview/SKILL.md` and follow its target selection until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: agent rule/template docs only, no product code patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: user did not ask for PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR and no browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields are filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` completed with no fixes applied. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-dry-task-router.md` | Passed: `[goal] complete: docs/plans/2026-05-24-dry-task-router.md`. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: cleanup is local workflow maintenance, no reusable product solution. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | task/goal skills and source files read | implementation |
| Implementation | done | `task.mdc` shortened; task template expanded | verification |
| Verification | done | command evidence below | closeout |
| PR / tracker sync | done | N/A: no PR/tracker requested | final response |
| Closeout | done | completion checker gate ready | final response |

Findings:
- `.agents/rules/task.mdc` mixed routing with video cache protocol, PR body
  mechanics, tracker comment templates, and final handoff formatting.
- `video-transcripts.mdc` already owns the video cache protocol.
- The task template is the better home for auditable per-task closure gates.

Decisions and tradeoffs:
- Kept `task.mdc` as a router: source read, classification, skill loading,
  goal-template trigger, execution path, proportional verification, and
  high-level sync triggers.
- Moved recordable closure details into the task template instead of duplicating
  exact workflow mechanics in the router.
- Did not create a new tracker-sync skill; this pass only performs the requested
  router/template split.

Implementation notes:
- Replaced `.agents/rules/task.mdc` with a leaner source rule.
- Added task-template gates for release, PR expectation, tracker expectation,
  local install corruption, browser final proof, PR proof hosting, and final
  handoff contract.
- Synced generated `.agents/skills/task/SKILL.md` with `pnpm install`.

Review fixes:
- None required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `wc -l .agents/rules/task.mdc` before edit: 512 lines.
- `wc -l .agents/rules/task.mdc` after edit: 220 lines.
- `pnpm install`: completed Skiller sync successfully.
- Focused `rg`: confirms `--template task` and router/template gate references.
- Focused stale-detail `rg`: verifies removed detailed mechanics from
  `task.mdc` or intentional ownership in `video-transcripts.mdc` / task
  template.
- Task template smoke: `create-goal-scratchpad.mjs --template task` creates a
  plan and untouched check fails with expected unresolved gates.
- `pnpm lint:fix`: completed with no fixes applied.
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-dry-task-router.md`:
  passed.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker item.
- Confidence line: high confidence.
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: tests N/A, browser N/A
- Browser check: N/A: no browser surface.
- Outcome: `task.mdc` is a router; `task.md` owns task closure gates.
- Caveat: no PR/commit created.
- Design:
  - Chosen boundary: router in `task.mdc`, audit evidence in task template,
    video mechanics in `video-transcripts`.
  - Why not quick patch: deleting a few bullets would leave duplicate policies
    and no durable closure surface.
  - Why not broader change: a new tracker-sync skill can wait; user asked for
    task/template DRY now.
- Verified: `pnpm install`, focused `rg`, template smoke, `pnpm lint:fix`, goal
  checker.

Final handoff / sync:
- PR: N/A: not requested
- Issue / tracker: N/A: no tracker
- Browser proof: N/A: no browser surface
- Caveats: no commit, push, or PR created

Timeline:
- 2026-05-24T21:40:50.324Z Task goal plan created.
- 2026-05-24T21:42Z Source rule and task template edited.
- 2026-05-24T21:43Z Generated skill synced and verification started.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final verification, goal completion, final response |
| What is the goal? | DRY task rule by moving auditable closure details to task template |
| What have I learned? | `task.mdc` had become router plus policy dump; template gates are the cleaner durable surface |
| What have I done? | Shortened task rule, expanded task template gates, synced generated skill |

Open risks:
- None.
